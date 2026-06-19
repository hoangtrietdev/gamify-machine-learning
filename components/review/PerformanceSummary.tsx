// =============================================================================
// PerformanceSummary — Strengths & Weaknesses + CTA after the quiz
// =============================================================================
import { keyframes } from "@emotion/react";
import {
  Box, VStack, HStack, Text, Icon, Badge, Button, SimpleGrid,
  CircularProgress, CircularProgressLabel, Divider, Fade,
} from "@chakra-ui/react";
import {
  FaTrophy, FaStar, FaArrowRight, FaRedo, FaChartBar,
  FaCheckCircle, FaExclamationTriangle,
} from "react-icons/fa";
import { MdSchool } from "react-icons/md";
import Link from "next/link";

const popIn = keyframes`
  0%   { transform: scale(0.6) rotate(-10deg); opacity: 0; }
  70%  { transform: scale(1.15) rotate(3deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-6px); }
`;

interface AreaResult {
  label: string;
  score: number;    // 0–100
  topic: string;
}

interface PerformanceSummaryProps {
  quizScore: number;
  quizTotal: number;
  wrongTopics: string[];
  pipelineScore: number;
  pipelineBreakdown: {
    featureSelection: number;
    scaling: number;
    outliers: number;
    architecture: number;
  };
  accuracy: number;
  objective: number;
  datasetId: string;
  nextDatasetId?: string;
  reflectionScore?: number | null;  // AI-analyzed understanding score
}

function getQuizGrade(score: number, total: number): { grade: string; color: string; label: string } {
  const pct = total > 0 ? (score / total) * 100 : 0;
  if (pct >= 80) return { grade: "A", color: "green.400", label: "Excellent!" };
  if (pct >= 60) return { grade: "B", color: "cyan.400", label: "Good Job!" };
  if (pct >= 40) return { grade: "C", color: "yellow.400", label: "Keep Studying" };
  return { grade: "D", color: "orange.400", label: "Review the Concepts" };
}

function AreaCard({ label, score, isStrength }: { label: string; score: number; isStrength: boolean }) {
  return (
    <Box
      bg="dark.panel"
      border="1px solid"
      borderColor={isStrength ? "green.800" : "orange.800"}
      borderRadius="xl"
      p={4}
    >
      <HStack spacing={2} mb={2}>
        <Icon
          as={isStrength ? FaCheckCircle : FaExclamationTriangle}
          color={isStrength ? "green.400" : "orange.400"}
          boxSize={4}
        />
        <Text fontSize="sm" fontWeight={700} color={isStrength ? "green.300" : "orange.300"}>
          {label}
        </Text>
      </HStack>
      <Box h="6px" bg="dark.border" borderRadius="full" overflow="hidden">
        <Box
          h="full"
          borderRadius="full"
          w={`${score}%`}
          bg={isStrength ? "neon.green" : "orange.400"}
          transition="width 0.8s ease"
        />
      </Box>
      <Text fontSize="xs" color="gray.600" mt={1} fontFamily="mono">
        {score}/100
      </Text>
    </Box>
  );
}

const TOPIC_TIPS: Record<string, string> = {
  algorithm: "Review algorithm selection: understand when to use tree-based vs. linear vs. distance-based models.",
  scaling: "Revisit feature scaling: different algorithms require different normalization strategies.",
  outliers: "Study outlier handling: know when to clip, remove, or impute — and why it matters.",
  features: "Practice feature engineering: learn to identify informative vs. noisy features.",
  general: "Review ML fundamentals: bias-variance tradeoff, overfitting, and model evaluation.",
};

export function PerformanceSummary({
  quizScore,
  quizTotal,
  wrongTopics,
  pipelineScore,
  pipelineBreakdown,
  accuracy,
  objective,
  datasetId,
  nextDatasetId,
  reflectionScore,
}: PerformanceSummaryProps) {
  const quizGrade = getQuizGrade(quizScore, quizTotal);
  const quizPct = quizTotal > 0 ? Math.round((quizScore / quizTotal) * 100) : 0;
  const metObjective = accuracy >= objective;

  const areas: AreaResult[] = [
    { label: "Feature Selection", score: pipelineBreakdown.featureSelection, topic: "features" },
    { label: "Scaling Strategy", score: pipelineBreakdown.scaling, topic: "scaling" },
    { label: "Outlier Handling", score: pipelineBreakdown.outliers, topic: "outliers" },
    { label: "Architecture", score: pipelineBreakdown.architecture, topic: "general" },
  ];

  const strengths = areas.filter((a) => a.score >= 70);
  const weaknesses = areas.filter((a) => a.score < 70);
  const uniqueWrongTopics = [...new Set(wrongTopics)];

  return (
    <Box>
      {/* Section header */}
      <HStack spacing={3} mb={8}>
        <Box
          w={10} h={10} borderRadius="xl"
          bgGradient="linear(to-br, yellow.500, orange.500)"
          display="flex" alignItems="center" justifyContent="center"
          boxShadow="0 0 20px rgba(251,191,36,0.4)"
          animation={`${float} 3s ease-in-out infinite`}
        >
          <Icon as={MdSchool} color="white" boxSize={5} />
        </Box>
        <Box>
          <Text fontSize="xl" fontWeight={900} color="white">
            Your Performance Summary
          </Text>
          <Text fontSize="sm" color="gray.500">
            Understand your strengths and what to improve next.
          </Text>
        </Box>
      </HStack>

      {/* Score cards */}
      <SimpleGrid columns={{ base: 1, md: reflectionScore != null ? 4 : 3 }} spacing={4} mb={8}>
        {/* Quiz score */}
        <Fade in delay={0}>
          <Box
            bg="dark.card"
            border="1px solid"
            borderColor="dark.border"
            borderRadius="2xl"
            p={5}
            textAlign="center"
            animation={`${popIn} 0.5s 0.1s both ease-out`}
          >
            <CircularProgress
              value={quizPct}
              color={quizGrade.color}
              trackColor="dark.border"
              size="80px"
              thickness="10px"
              mb={3}
            >
              <CircularProgressLabel
                fontSize="xl"
                fontWeight={900}
                color={quizGrade.color}
                fontFamily="mono"
              >
                {quizGrade.grade}
              </CircularProgressLabel>
            </CircularProgress>
            <Text fontWeight={800} color="white" fontSize="md">Knowledge Check</Text>
            <Text fontSize="sm" color={quizGrade.color} fontWeight={700}>{quizGrade.label}</Text>
            <Text fontSize="xs" color="gray.600" fontFamily="mono" mt={1}>
              {quizScore}/{quizTotal} correct
            </Text>
          </Box>
        </Fade>

        {/* Pipeline score */}
        <Fade in delay={0.1}>
          <Box
            bg="dark.card"
            border="1px solid"
            borderColor="dark.border"
            borderRadius="2xl"
            p={5}
            textAlign="center"
            animation={`${popIn} 0.5s 0.2s both ease-out`}
          >
            <CircularProgress
              value={pipelineScore}
              color={pipelineScore >= 80 ? "neon.green" : pipelineScore >= 60 ? "neon.cyan" : "yellow.400"}
              trackColor="dark.border"
              size="80px"
              thickness="10px"
              mb={3}
            >
              <CircularProgressLabel
                fontSize="lg"
                fontWeight={900}
                color={pipelineScore >= 80 ? "neon.green" : pipelineScore >= 60 ? "neon.cyan" : "yellow.400"}
                fontFamily="mono"
              >
                {pipelineScore}
              </CircularProgressLabel>
            </CircularProgress>
            <Text fontWeight={800} color="white" fontSize="md">Pipeline Score</Text>
            <Text fontSize="sm" color="gray.500">Preprocessing quality</Text>
            <Text fontSize="xs" color="gray.600" fontFamily="mono" mt={1}>
              out of 100
            </Text>
          </Box>
        </Fade>

        {/* Model accuracy */}
        <Fade in delay={0.2}>
          <Box
            bg="dark.card"
            border="1px solid"
            borderColor={metObjective ? "green.700" : "dark.border"}
            borderRadius="2xl"
            p={5}
            textAlign="center"
            animation={`${popIn} 0.5s 0.3s both ease-out`}
            boxShadow={metObjective ? "0 0 20px rgba(72,199,116,0.15)" : undefined}
          >
            <Box mb={3}>
              <Icon
                as={metObjective ? FaTrophy : FaChartBar}
                boxSize={12}
                color={metObjective ? "yellow.400" : "neon.purple"}
                filter={metObjective ? "drop-shadow(0 0 12px rgba(251,191,36,0.6))" : undefined}
              />
            </Box>
            <Text fontWeight={800} color="white" fontSize="md">Model Accuracy</Text>
            <Text
              fontSize="2xl"
              fontWeight={900}
              fontFamily="mono"
              color={metObjective ? "green.400" : "neon.purple"}
            >
              {accuracy.toFixed(1)}%
            </Text>
            <Badge
              colorScheme={metObjective ? "green" : "purple"}
              variant="subtle"
              fontSize="10px"
            >
              {metObjective ? `✓ Target Met (${objective}%)` : `Target: ${objective}%`}
            </Badge>
          </Box>
        </Fade>

        {/* AI Reflection score — only shown if analysis was done */}
        {reflectionScore != null && (
          <Fade in delay={0.3}>
            <Box
              bg="dark.card"
              border="1px solid"
              borderColor={reflectionScore >= 70 ? "purple.700" : "dark.border"}
              borderRadius="2xl"
              p={5}
              textAlign="center"
              animation={`${popIn} 0.5s 0.4s both ease-out`}
              boxShadow={reflectionScore >= 70 ? "0 0 20px rgba(139,92,246,0.15)" : undefined}
            >
              <CircularProgress
                value={reflectionScore}
                color={reflectionScore >= 75 ? "neon.green" : reflectionScore >= 50 ? "neon.purple" : "orange.400"}
                trackColor="dark.border"
                size="80px"
                thickness="10px"
                mb={3}
              >
                <CircularProgressLabel
                  fontSize="lg"
                  fontWeight={900}
                  color={reflectionScore >= 75 ? "neon.green" : reflectionScore >= 50 ? "neon.purple" : "orange.400"}
                  fontFamily="mono"
                >
                  {reflectionScore}
                </CircularProgressLabel>
              </CircularProgress>
              <Text fontWeight={800} color="white" fontSize="md">Reflection</Text>
              <Text fontSize="sm" color="gray.500">AI understanding</Text>
              <Text fontSize="xs" color="gray.600" fontFamily="mono" mt={1}>
                {reflectionScore >= 75 ? "Deep understanding" : reflectionScore >= 50 ? "Solid grasp" : "Needs work"}
              </Text>
            </Box>
          </Fade>
        )}
      </SimpleGrid>

      {/* Strengths & Weaknesses */}
      {(strengths.length > 0 || weaknesses.length > 0) && (
        <Box mb={8}>
          <Text fontSize="md" fontWeight={800} color="white" mb={4}>
            📊 Preprocessing Breakdown
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
            {areas.map((area) => (
              <AreaCard
                key={area.label}
                label={area.label}
                score={area.score}
                isStrength={area.score >= 70}
              />
            ))}
          </SimpleGrid>
        </Box>
      )}

      {/* Improvement tips from wrong quiz answers */}
      {uniqueWrongTopics.length > 0 && (
        <Box
          bg="dark.card"
          border="1px solid"
          borderColor="orange.800"
          borderRadius="2xl"
          p={5}
          mb={8}
        >
          <HStack spacing={2} mb={3}>
            <Icon as={FaStar} color="orange.400" boxSize={4} />
            <Text fontWeight={800} color="orange.300" fontSize="md">
              Areas to Study Next
            </Text>
          </HStack>
          <VStack spacing={3} align="stretch">
            {uniqueWrongTopics.map((topic) => (
              <HStack key={topic} spacing={3} align="flex-start">
                <Box
                  w={1.5}
                  h={1.5}
                  borderRadius="full"
                  bg="orange.400"
                  mt={1.5}
                  flexShrink={0}
                />
                <Text fontSize="sm" color="gray.300" lineHeight={1.6}>
                  {TOPIC_TIPS[topic] ?? TOPIC_TIPS.general}
                </Text>
              </HStack>
            ))}
          </VStack>
        </Box>
      )}

      <Divider borderColor="dark.border" mb={8} />

      {/* CTA */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <Button
          as={Link}
          href={`/play/${datasetId}`}
          leftIcon={<Icon as={FaRedo} />}
          variant="outline"
          colorScheme="purple"
          size="lg"
          fontWeight={700}
          _hover={{
            bg: "rgba(139,92,246,0.1)",
            transform: "translateY(-2px)",
          }}
          transition="all 0.2s"
        >
          Play Again
        </Button>

        {nextDatasetId ? (
          <Button
            as={Link}
            href={`/play/${nextDatasetId}`}
            rightIcon={<Icon as={FaArrowRight} />}
            colorScheme="cyan"
            size="lg"
            fontWeight={700}
            bgGradient="linear(to-r, neon.cyan, blue.500)"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "0 0 24px rgba(0,212,255,0.4)",
            }}
            transition="all 0.2s"
          >
            Next Challenge
          </Button>
        ) : (
          <Button
            as={Link}
            href="/"
            rightIcon={<Icon as={FaArrowRight} />}
            colorScheme="cyan"
            size="lg"
            fontWeight={700}
            bgGradient="linear(to-r, neon.cyan, blue.500)"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "0 0 24px rgba(0,212,255,0.4)",
            }}
            transition="all 0.2s"
          >
            Back to Challenges
          </Button>
        )}
      </SimpleGrid>
    </Box>
  );
}
