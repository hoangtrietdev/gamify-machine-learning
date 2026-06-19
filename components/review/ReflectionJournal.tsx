// =============================================================================
// ReflectionJournal — Metacognitive journaling with Groq AI analysis
// =============================================================================
import { useState, useCallback } from "react";
import { keyframes } from "@emotion/react";
import {
  Box, VStack, HStack, Text, Textarea, Icon, Badge, Button,
  CircularProgress, CircularProgressLabel, Collapse, SimpleGrid,
  Spinner,
} from "@chakra-ui/react";
import { FaBook, FaLightbulb, FaCheck, FaBrain, FaExclamationTriangle } from "react-icons/fa";
import { MdPsychology, MdAutoAwesome } from "react-icons/md";
import type { ReflectionAnalysis } from "@/pages/api/analyze-reflection";

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

export interface ReflectionAnswers {
  algorithm: string;
  outliers: string;
  features: string;
}

interface ReflectionJournalProps {
  algorithmName: string;
  outlierStrategySummary: string;
  featureCount: number;
  datasetName: string;
  answers: ReflectionAnswers;
  onChange: (answers: ReflectionAnswers) => void;
  onAnalysisComplete?: (analysis: ReflectionAnalysis) => void;
}

// ---------------------------------------------------------------------------
// Single prompt card
// ---------------------------------------------------------------------------
interface PromptCardProps {
  icon: React.ElementType;
  iconColor: string;
  accentColor: string;
  label: string;
  prompt: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  aiScore?: number | null;
}

function PromptCard({
  icon, iconColor, accentColor, label, prompt, placeholder, value, onChange, aiScore,
}: PromptCardProps) {
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const isGood = wordCount >= 15;
  const scoreColor =
    aiScore == null ? undefined :
    aiScore >= 75 ? "green.400" :
    aiScore >= 50 ? "cyan.400" :
    aiScore >= 30 ? "yellow.400" : "orange.400";

  return (
    <Box
      bg="dark.card"
      border="1px solid"
      borderColor={aiScore != null && aiScore >= 75 ? "green.700" : isGood ? "neon.purple" : "dark.border"}
      borderRadius="2xl"
      p={5}
      transition="all 0.4s"
      boxShadow={
        aiScore != null && aiScore >= 75 ? "0 0 20px rgba(72,199,116,0.12)" :
        isGood ? "0 0 20px rgba(139,92,246,0.12)" : undefined
      }
    >
      <HStack spacing={2} mb={2} flexWrap="wrap">
        <Icon as={icon} color={iconColor} boxSize={4} />
        <Badge
          colorScheme="purple"
          variant="subtle"
          fontSize="10px"
          letterSpacing="wider"
          textTransform="uppercase"
        >
          {label}
        </Badge>

        <HStack spacing={2} ml="auto">
          {aiScore != null && (
            <Badge
              px={2} py={0.5}
              borderRadius="full"
              fontSize="10px"
              fontFamily="mono"
              fontWeight={700}
              color={scoreColor}
              bg="whiteAlpha.100"
            >
              AI: {aiScore}%
            </Badge>
          )}
          {isGood && aiScore == null && (
            <Badge colorScheme="green" variant="subtle" fontSize="10px">
              ✓ Ready
            </Badge>
          )}
          {!isGood && wordCount > 0 && (
            <Text fontSize="10px" color="gray.600" fontFamily="mono">
              {wordCount} / 15+ words
            </Text>
          )}
        </HStack>
      </HStack>

      <Text fontSize="sm" color="white" fontWeight={600} mb={3} lineHeight={1.6}>
        {prompt}
      </Text>

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        fontSize="sm"
        color="gray.300"
        bg="dark.panel"
        border="1px solid"
        borderColor="dark.border"
        borderRadius="xl"
        _focus={{
          borderColor: accentColor,
          boxShadow: `0 0 0 1px ${accentColor}`,
        }}
        _placeholder={{ color: "gray.600" }}
        resize="vertical"
      />
    </Box>
  );
}

// ---------------------------------------------------------------------------
// AI Analysis Results Panel
// ---------------------------------------------------------------------------
function AnalysisPanel({ analysis }: { analysis: ReflectionAnalysis }) {
  const scoreColor =
    analysis.understandingScore >= 75 ? "green.400" :
    analysis.understandingScore >= 50 ? "cyan.400" :
    analysis.understandingScore >= 30 ? "yellow.400" : "orange.400";

  const scoreGrade =
    analysis.understandingScore >= 90 ? "A+" :
    analysis.understandingScore >= 80 ? "A" :
    analysis.understandingScore >= 70 ? "B" :
    analysis.understandingScore >= 55 ? "C" :
    analysis.understandingScore >= 40 ? "D" : "F";

  return (
    <Box
      bg="dark.card"
      border="1px solid"
      borderColor="neon.purple"
      borderRadius="2xl"
      p={6}
      animation={`${fadeUp} 0.5s ease`}
      boxShadow="0 0 30px rgba(139,92,246,0.15)"
    >
      {/* Header */}
      <HStack spacing={3} mb={5}>
        <Box
          w={9} h={9} borderRadius="xl"
          bgGradient="linear(to-br, neon.purple, neon.cyan)"
          display="flex" alignItems="center" justifyContent="center"
          boxShadow="0 0 16px rgba(139,92,246,0.5)"
        >
          <Icon as={MdAutoAwesome} color="white" boxSize={4} />
        </Box>
        <Box>
          <Text fontWeight={900} color="white" fontSize="md">
            AI Understanding Analysis
          </Text>
          <Text fontSize="xs" color="gray.500">
            Powered by Groq · llama-3.3-70b
          </Text>
        </Box>
      </HStack>

      {/* Overall score */}
      <HStack spacing={6} mb={5} align="center">
        <CircularProgress
          value={analysis.understandingScore}
          color={scoreColor}
          trackColor="dark.border"
          size="88px"
          thickness="10px"
        >
          <CircularProgressLabel>
            <VStack spacing={0}>
              <Text fontSize="xl" fontWeight={900} color={scoreColor} fontFamily="mono" lineHeight={1}>
                {scoreGrade}
              </Text>
              <Text fontSize="9px" color="gray.600">{analysis.understandingScore}%</Text>
            </VStack>
          </CircularProgressLabel>
        </CircularProgress>

        <Box flex={1}>
          <Text fontSize="xs" color="gray.500" mb={2} fontWeight={600} letterSpacing="wider">
            DIMENSION SCORES
          </Text>
          {[
            { label: "Algorithm", score: analysis.algorithmUnderstanding },
            { label: "Outliers", score: analysis.outlierUnderstanding },
            { label: "Features", score: analysis.featureUnderstanding },
          ].map(({ label, score }) => (
            <HStack key={label} spacing={2} mb={1.5}>
              <Text fontSize="xs" color="gray.500" w="64px" flexShrink={0}>{label}</Text>
              <Box flex={1} h="5px" bg="dark.border" borderRadius="full" overflow="hidden">
                <Box
                  h="full"
                  borderRadius="full"
                  w={`${score}%`}
                  bg={score >= 70 ? "neon.green" : score >= 45 ? "neon.cyan" : "orange.400"}
                  transition="width 1s ease"
                />
              </Box>
              <Text fontSize="10px" color="gray.500" fontFamily="mono" w="26px" textAlign="right">
                {score}
              </Text>
            </HStack>
          ))}
        </Box>
      </HStack>

      {/* Feedback */}
      <Box
        bg="dark.panel"
        borderRadius="xl"
        p={4}
        mb={4}
        border="1px solid"
        borderColor="dark.border"
      >
        <Text fontSize="sm" color="gray.300" lineHeight={1.7}>
          {analysis.overallFeedback}
        </Text>
      </Box>

      {/* Strengths & Gaps */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} mb={3}>
        {analysis.strengths.length > 0 && (
          <Box>
            <HStack spacing={1.5} mb={2}>
              <Icon as={FaCheck} color="green.400" boxSize={3} />
              <Text fontSize="xs" fontWeight={700} color="green.400" letterSpacing="wider">
                STRENGTHS
              </Text>
            </HStack>
            <VStack spacing={1.5} align="stretch">
              {analysis.strengths.map((s, i) => (
                <HStack key={i} spacing={2} align="flex-start">
                  <Box w={1.5} h={1.5} bg="green.400" borderRadius="full" mt={1.5} flexShrink={0} />
                  <Text fontSize="xs" color="gray.300" lineHeight={1.6}>{s}</Text>
                </HStack>
              ))}
            </VStack>
          </Box>
        )}
        {analysis.gaps.length > 0 && (
          <Box>
            <HStack spacing={1.5} mb={2}>
              <Icon as={FaExclamationTriangle} color="orange.400" boxSize={3} />
              <Text fontSize="xs" fontWeight={700} color="orange.400" letterSpacing="wider">
                TO IMPROVE
              </Text>
            </HStack>
            <VStack spacing={1.5} align="stretch">
              {analysis.gaps.map((g, i) => (
                <HStack key={i} spacing={2} align="flex-start">
                  <Box w={1.5} h={1.5} bg="orange.400" borderRadius="full" mt={1.5} flexShrink={0} />
                  <Text fontSize="xs" color="gray.300" lineHeight={1.6}>{g}</Text>
                </HStack>
              ))}
            </VStack>
          </Box>
        )}
      </SimpleGrid>

      {/* Encouragement */}
      <Box
        bg="rgba(139,92,246,0.08)"
        border="1px solid"
        borderColor="purple.800"
        borderRadius="xl"
        p={3}
      >
        <Text fontSize="xs" color="purple.300" textAlign="center" fontStyle="italic">
          ✨ {analysis.encouragement}
        </Text>
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function ReflectionJournal({
  algorithmName,
  outlierStrategySummary,
  featureCount,
  datasetName,
  answers,
  onChange,
  onAnalysisComplete,
}: ReflectionJournalProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ReflectionAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const totalWords = [answers.algorithm, answers.outliers, answers.features]
    .reduce((sum, t) => sum + (t.trim() ? t.trim().split(/\s+/).length : 0), 0);

  const canAnalyze = totalWords >= 10;

  const handleAnalyze = useCallback(async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const res = await fetch("/api/analyze-reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          algorithmText: answers.algorithm,
          outlierText: answers.outliers,
          featureText: answers.features,
          algorithmName,
          datasetName,
          outlierStrategySummary,
          featureCount,
        }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json() as ReflectionAnalysis;
      setAnalysis(data);
      onAnalysisComplete?.(data);
    } catch {
      setAnalysisError("Could not analyze your reflection. Please check your API key.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [answers, algorithmName, datasetName, outlierStrategySummary, featureCount, onAnalysisComplete]);

  return (
    <Box>
      {/* Header */}
      <HStack spacing={3} mb={6}>
        <Box
          w={10} h={10} borderRadius="xl"
          bgGradient="linear(to-br, purple.600, blue.600)"
          display="flex" alignItems="center" justifyContent="center"
          boxShadow="0 0 20px rgba(139,92,246,0.4)"
        >
          <Icon as={MdPsychology} color="white" boxSize={5} />
        </Box>
        <Box>
          <Text fontSize="xl" fontWeight={900} color="white">Reflection Journal</Text>
          <Text fontSize="sm" color="gray.500">
            Explain your decisions — then get AI feedback on your understanding.
          </Text>
        </Box>
      </HStack>

      {/* Prompt cards */}
      <VStack spacing={4} align="stretch" mb={5}>
        <PromptCard
          icon={FaLightbulb}
          iconColor="neon.purple"
          accentColor="var(--chakra-colors-neon-purple)"
          label="Algorithm Choice"
          prompt={`You chose ${algorithmName}. Why did this algorithm suit the ${datasetName} dataset?`}
          placeholder={`e.g. "I chose ${algorithmName} because the dataset has many numeric features and the algorithm handles non-linear relationships well. It is also robust to outliers, which matters here since..."`}
          value={answers.algorithm}
          onChange={(val) => onChange({ ...answers, algorithm: val })}
          aiScore={analysis?.algorithmUnderstanding ?? null}
        />
        <PromptCard
          icon={FaBook}
          iconColor="neon.cyan"
          accentColor="var(--chakra-colors-neon-cyan)"
          label="Outlier Strategy"
          prompt={`You handled outliers with: ${outlierStrategySummary}. Why was this the right choice for ${datasetName}?`}
          placeholder={`e.g. "I chose to clip outliers because removing entire rows would reduce the dataset size significantly. Clipping keeps the rows while limiting extreme values from skewing the model..."`}
          value={answers.outliers}
          onChange={(val) => onChange({ ...answers, outliers: val })}
          aiScore={analysis?.outlierUnderstanding ?? null}
        />
        <PromptCard
          icon={FaLightbulb}
          iconColor="neon.green"
          accentColor="var(--chakra-colors-neon-green)"
          label="Feature Selection"
          prompt={`You selected ${featureCount} feature${featureCount !== 1 ? "s" : ""} from ${datasetName}. What drove your choices?`}
          placeholder={`e.g. "I excluded high-missing columns because imputing 77% missing values would introduce too much noise. I kept the high-importance features like 'Sex' and 'Pclass' because they have the strongest predictive signal..."`}
          value={answers.features}
          onChange={(val) => onChange({ ...answers, features: val })}
          aiScore={analysis?.featureUnderstanding ?? null}
        />
      </VStack>

      {/* Analyze button */}
      <Box mb={5}>
        <Button
          onClick={handleAnalyze}
          isLoading={isAnalyzing}
          loadingText="Groq is reading your reflection..."
          isDisabled={!canAnalyze || isAnalyzing}
          w="full"
          size="lg"
          bgGradient="linear(to-r, purple.600, blue.600)"
          color="white"
          fontWeight={700}
          leftIcon={<Icon as={FaBrain} />}
          _hover={canAnalyze ? {
            bgGradient: "linear(to-r, purple.500, blue.500)",
            transform: "translateY(-1px)",
            boxShadow: "0 0 24px rgba(139,92,246,0.4)",
          } : {}}
          transition="all 0.2s"
          borderRadius="xl"
          spinner={<Spinner size="sm" color="white" />}
        >
          {analysis ? "Re-analyze with AI" : "Analyze My Understanding with AI"}
        </Button>
        {!canAnalyze && (
          <Text fontSize="xs" color="gray.600" textAlign="center" mt={2}>
            Write at least 10 words across all fields to enable AI analysis
          </Text>
        )}
        {analysisError && (
          <Text fontSize="xs" color="red.400" textAlign="center" mt={2}>
            ⚠️ {analysisError}
          </Text>
        )}
      </Box>

      {/* AI Analysis results */}
      <Collapse in={!!analysis} animateOpacity>
        {analysis && <AnalysisPanel analysis={analysis} />}
      </Collapse>

      {/* Footer tip */}
      {!analysis && (
        <Box p={3} bg="dark.panel" borderRadius="xl" border="1px solid" borderColor="dark.border">
          <Text fontSize="xs" color="gray.600" textAlign="center">
            💡 Writing explanations strengthens memory retention by up to 40%.
            Click &ldquo;Analyze&rdquo; to get personalized AI feedback on your understanding.
          </Text>
        </Box>
      )}
    </Box>
  );
}
