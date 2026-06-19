// =============================================================================
// pages/api/analyze-reflection.ts
// Uses Groq LLM to analyze user's reflection text and score their understanding
// =============================================================================
import type { NextApiRequest, NextApiResponse } from "next";
import Groq from "groq-sdk";

export interface ReflectionAnalysis {
  understandingScore: number;   // 0–100
  algorithmUnderstanding: number;
  outlierUnderstanding: number;
  featureUnderstanding: number;
  strengths: string[];
  gaps: string[];
  overallFeedback: string;
  encouragement: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReflectionAnalysis | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    algorithmText,
    outlierText,
    featureText,
    algorithmName,
    datasetName,
    outlierStrategySummary,
    featureCount,
  } = req.body as {
    algorithmText: string;
    outlierText: string;
    featureText: string;
    algorithmName: string;
    datasetName: string;
    outlierStrategySummary: string;
    featureCount: number;
  };

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: "GROQ_API_KEY is not configured" });
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
  const totalWords = wordCount(algorithmText) + wordCount(outlierText) + wordCount(featureText);

  // If user wrote very little, return a quick low-score response
  if (totalWords < 10) {
    return res.status(200).json({
      understandingScore: 10,
      algorithmUnderstanding: 10,
      outlierUnderstanding: 10,
      featureUnderstanding: 10,
      strengths: [],
      gaps: ["Your reflections are very short. Try to explain your reasoning in more detail."],
      overallFeedback: "You haven't written enough for me to assess your understanding. Please try to explain your choices in at least 2–3 sentences each.",
      encouragement: "Don't worry — writing about your reasoning is the best way to learn! Give it another shot.",
    });
  }

  const prompt = `You are an expert ML tutor evaluating a student's written reflection after completing a machine learning exercise.

CONTEXT:
- Dataset: ${datasetName}
- Algorithm chosen: ${algorithmName}
- Outlier strategy used: ${outlierStrategySummary}
- Features selected: ${featureCount} features

STUDENT'S REFLECTIONS:

1. WHY DID YOU CHOOSE THIS ALGORITHM?
"${algorithmText || "(No answer provided)"}"

2. WHY DID YOU HANDLE OUTLIERS THIS WAY?
"${outlierText || "(No answer provided)"}"

3. WHY DID YOU CHOOSE THESE FEATURES?
"${featureText || "(No answer provided)"}"

TASK: Evaluate the student's conceptual understanding. Be encouraging but honest.

Respond ONLY with a valid JSON object (no markdown, no code blocks) in this exact format:
{
  "understandingScore": <integer 0-100>,
  "algorithmUnderstanding": <integer 0-100>,
  "outlierUnderstanding": <integer 0-100>,
  "featureUnderstanding": <integer 0-100>,
  "strengths": ["<specific thing they got right>", ...],
  "gaps": ["<specific misconception or missing concept>", ...],
  "overallFeedback": "<2-3 sentences of constructive feedback on their overall understanding>",
  "encouragement": "<1 encouraging sentence tailored to their level>"
}

Scoring guide:
- 0-30: Little to no conceptual understanding shown
- 31-55: Basic awareness but significant gaps
- 56-75: Solid understanding with some gaps
- 76-90: Strong understanding, minor gaps
- 91-100: Expert-level explanation`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 800,
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    // Extract JSON from the response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");

    const analysis = JSON.parse(jsonMatch[0]) as ReflectionAnalysis;

    // Validate and clamp scores
    analysis.understandingScore = Math.min(100, Math.max(0, Number(analysis.understandingScore) || 0));
    analysis.algorithmUnderstanding = Math.min(100, Math.max(0, Number(analysis.algorithmUnderstanding) || 0));
    analysis.outlierUnderstanding = Math.min(100, Math.max(0, Number(analysis.outlierUnderstanding) || 0));
    analysis.featureUnderstanding = Math.min(100, Math.max(0, Number(analysis.featureUnderstanding) || 0));
    analysis.strengths = Array.isArray(analysis.strengths) ? analysis.strengths.slice(0, 4) : [];
    analysis.gaps = Array.isArray(analysis.gaps) ? analysis.gaps.slice(0, 4) : [];

    return res.status(200).json(analysis);
  } catch (err) {
    console.error("Groq analyze-reflection error:", err);
    return res.status(500).json({ error: "Failed to analyze reflection" });
  }
}
