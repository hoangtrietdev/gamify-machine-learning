// =============================================================================
// pages/api/generate-quiz.ts
// Uses Groq LLM to generate dataset-specific MCQ questions based on what
// the user actually did during the training session
// =============================================================================
import type { NextApiRequest, NextApiResponse } from "next";
import Groq from "groq-sdk";

export interface GeneratedQuestion {
  id: string;
  topic: string;
  question: string;
  options: { id: string; text: string }[];
  correctId: string;
  explanation: string;
}

export interface GenerateQuizResponse {
  questions: GeneratedQuestion[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenerateQuizResponse | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    datasetName,
    datasetDescription,
    taskType,
    algorithmName,
    standardization,
    normalization,
    outlierStrategySummary,
    selectedFeatures,
    totalFeatures,
    pipelineScore,
    accuracy,
    count = 5,
  } = req.body as {
    datasetName: string;
    datasetDescription: string;
    taskType: string;
    algorithmName: string;
    standardization: string;
    normalization: string;
    outlierStrategySummary: string;
    selectedFeatures: string[];
    totalFeatures: string[];
    pipelineScore: number;
    accuracy: number;
    count?: number;
  };

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: "GROQ_API_KEY is not configured" });
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const selectedList = selectedFeatures.slice(0, 10).join(", ");
  const excludedFeatures = totalFeatures.filter((f) => !selectedFeatures.includes(f)).slice(0, 8).join(", ");

  const prompt = `You are an expert ML educator. Create ${count} multiple-choice questions to test a student's understanding of their choices during a machine learning session.

STUDENT'S SESSION DETAILS:
- Dataset: ${datasetName} — ${datasetDescription}
- Task type: ${taskType}
- Algorithm chosen: ${algorithmName}
- Feature scaling: standardization="${standardization}", normalization="${normalization}"
- Outlier handling: ${outlierStrategySummary}
- Features selected (${selectedFeatures.length}): ${selectedList}
- Features excluded: ${excludedFeatures}
- Pipeline score: ${pipelineScore}/100
- Final model accuracy: ${accuracy.toFixed(1)}%

INSTRUCTIONS:
- Questions must be directly relevant to THIS dataset and THIS student's specific choices
- Mix topics: why this algorithm fits this data, what the scaling does, why certain features matter for this specific problem, what outlier handling does, general ML concepts that apply here
- Each question should have exactly 4 options (a, b, c, d)
- Make wrong options plausible but clearly incorrect to an expert
- Explanations should reference the specific dataset (e.g., mention Titanic, survival, passengers if it's Titanic)
- Difficulty: intermediate — challenging but fair

Respond ONLY with a valid JSON array (no markdown, no code blocks):
[
  {
    "id": "q1",
    "topic": "<algorithm|scaling|outliers|features|general>",
    "question": "<question text>",
    "options": [
      {"id": "a", "text": "<option A>"},
      {"id": "b", "text": "<option B>"},
      {"id": "c", "text": "<option C>"},
      {"id": "d", "text": "<option D>"}
    ],
    "correctId": "<a|b|c|d>",
    "explanation": "<2-3 sentence explanation referencing the specific dataset context>"
  },
  ...
]`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 2000,
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    // Extract JSON array from the response
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON array found in response");

    const questions = JSON.parse(jsonMatch[0]) as GeneratedQuestion[];

    // Validate structure
    const validated = questions
      .filter(
        (q) =>
          q.question &&
          Array.isArray(q.options) &&
          q.options.length === 4 &&
          q.correctId &&
          q.explanation
      )
      .slice(0, count)
      .map((q, i) => ({
        ...q,
        id: q.id ?? `q${i + 1}`,
        topic: q.topic ?? "general",
      }));

    if (validated.length === 0) {
      throw new Error("No valid questions parsed");
    }

    return res.status(200).json({ questions: validated });
  } catch (err) {
    console.error("Groq generate-quiz error:", err);
    return res.status(500).json({ error: "Failed to generate quiz questions" });
  }
}
