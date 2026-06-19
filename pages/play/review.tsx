// =============================================================================
// pages/play/review.tsx — Post-Training Learning Review Page (Groq-powered)
// =============================================================================
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useMemo, useEffect, useRef } from "react";
import {
  Box, Container, Text, HStack, VStack, Icon, Breadcrumb, BreadcrumbItem,
  BreadcrumbLink, Badge, Divider, Flex, Button, Spinner,
  Step, StepIcon, StepIndicator, StepNumber, StepSeparator,
  StepStatus, StepTitle, Stepper, useSteps,
} from "@chakra-ui/react";
import { FaHome, FaChevronRight, FaBook, FaBrain, FaChartBar } from "react-icons/fa";
import { MdAutoAwesome } from "react-icons/md";
import Link from "next/link";
import { Layout } from "@/components/Layout/Layout";
import { ReflectionJournal, ReflectionAnswers } from "@/components/review/ReflectionJournal";
import { KnowledgeQuiz } from "@/components/review/KnowledgeQuiz";
import { PerformanceSummary } from "@/components/review/PerformanceSummary";
import { DATASETS } from "@/data/datasets";
import { selectQuizQuestions, QuizQuestion } from "@/data/quizQuestions";
import type { ReflectionAnalysis } from "@/pages/api/analyze-reflection";
import type { GeneratedQuestion } from "@/pages/api/generate-quiz";

// ---------------------------------------------------------------------------
// Review step configuration
// ---------------------------------------------------------------------------
const REVIEW_STEPS = [
  { title: "Reflect", icon: FaBook, description: "Journal your choices" },
  { title: "Quiz", icon: FaBrain, description: "Knowledge check" },
  { title: "Results", icon: FaChartBar, description: "Strengths & weaknesses" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function parseQueryParam(val: string | string[] | undefined): string {
  return Array.isArray(val) ? val[0] : val ?? "";
}

function getAlgorithmLabel(alg: string): string {
  const map: Record<string, string> = {
    random_forest: "Random Forest",
    neural_net: "Neural Network",
    svm: "Support Vector Machine",
    logistic_regression: "Logistic Regression",
    knn: "K-Nearest Neighbors",
  };
  return map[alg] ?? alg;
}

/** Convert API-generated question shape to the KnowledgeQuiz QuizQuestion shape */
function toQuizQuestion(q: GeneratedQuestion): QuizQuestion {
  return {
    id: q.id,
    topic: q.topic as QuizQuestion["topic"],
    question: q.question,
    options: q.options,
    correctId: q.correctId,
    explanation: q.explanation,
  };
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
const ReviewPage: NextPage = () => {
  const router = useRouter();

  // Parse URL params
  const datasetId         = parseQueryParam(router.query.datasetId);
  const accuracy          = parseFloat(parseQueryParam(router.query.accuracy) || "0");
  const pipeScore         = parseInt(parseQueryParam(router.query.pipeScore) || "0", 10);
  const algorithm         = parseQueryParam(router.query.algorithm) || "random_forest";
  const standardization   = parseQueryParam(router.query.standardization) || "none";
  const normalization     = parseQueryParam(router.query.normalization) || "none";
  const outlierStrategiesRaw  = parseQueryParam(router.query.outlierStrategies);
  const featureCountRaw   = parseQueryParam(router.query.featureCount);
  const breakdownRaw      = parseQueryParam(router.query.breakdown);
  const selectedFeaturesRaw = parseQueryParam(router.query.selectedFeatures);

  const outlierStrategies = useMemo(() => {
    try { return JSON.parse(outlierStrategiesRaw || "[]") as string[]; }
    catch { return []; }
  }, [outlierStrategiesRaw]);

  const selectedFeatures = useMemo(() => {
    try { return JSON.parse(selectedFeaturesRaw || "[]") as string[]; }
    catch { return []; }
  }, [selectedFeaturesRaw]);

  const breakdown = useMemo(() => {
    try {
      return JSON.parse(breakdownRaw || "{}") as {
        featureSelection: number;
        scaling: number;
        outliers: number;
        architecture: number;
      };
    } catch {
      return { featureSelection: 50, scaling: 50, outliers: 50, architecture: 50 };
    }
  }, [breakdownRaw]);

  const featureCount = parseInt(featureCountRaw || "5", 10);

  // Dataset lookup
  const dataset = useMemo(
    () => DATASETS.find((d) => d.id === datasetId) ?? DATASETS[0],
    [datasetId]
  );
  const datasetIndex = DATASETS.findIndex((d) => d.id === dataset.id);
  const nextDataset  = DATASETS[datasetIndex + 1];

  // Stepper
  const { activeStep, setActiveStep } = useSteps({ index: 0, count: REVIEW_STEPS.length });

  // Reflection answers + AI analysis
  const [reflectionAnswers, setReflectionAnswers] = useState<ReflectionAnswers>({
    algorithm: "",
    outliers: "",
    features: "",
  });
  const [reflectionAnalysis, setReflectionAnalysis] = useState<ReflectionAnalysis | null>(null);

  // Quiz state
  const [quizScore, setQuizScore]   = useState(0);
  const [quizTotal, setQuizTotal]   = useState(0);
  const [wrongTopics, setWrongTopics] = useState<string[]>([]);
  const [quizDone, setQuizDone]     = useState(false);

  // AI-generated quiz questions
  const [aiQuizQuestions, setAiQuizQuestions] = useState<QuizQuestion[] | null>(null);
  const [isFetchingQuiz, setIsFetchingQuiz]   = useState(false);
  const [quizFetchError, setQuizFetchError]   = useState<string | null>(null);
  const quizFetchedRef = useRef(false);

  // Outlier summary
  const outlierSummary = useMemo(() => {
    const unique = [...new Set(outlierStrategies)];
    if (unique.length === 0) return "keep (default)";
    const labels: Record<string, string> = {
      keep: "keep", clip: "clip", remove: "remove", impute_median: "impute with median",
    };
    return unique.map((s) => labels[s] ?? s).join(", ");
  }, [outlierStrategies]);

  // Fallback static questions
  const fallbackQuizQuestions = useMemo(
    () => selectQuizQuestions({
      algorithm,
      standardization,
      normalization,
      outlierStrategies,
      featureCount,
      totalFeatures: dataset.columns.filter((c) => !c.isTarget).length,
      count: 5,
    }),
    [algorithm, standardization, normalization, outlierStrategies, featureCount, dataset]
  );

  const activeQuizQuestions = aiQuizQuestions ?? fallbackQuizQuestions;

  // Redirect if no datasetId
  useEffect(() => {
    if (router.isReady && !datasetId) router.push("/");
  }, [router.isReady, datasetId]);

  // Fetch AI quiz questions when moving to step 1
  const fetchAIQuiz = async () => {
    if (quizFetchedRef.current) return;
    quizFetchedRef.current = true;
    setIsFetchingQuiz(true);
    setQuizFetchError(null);
    try {
      const allFeatureIds = dataset.columns.filter((c) => !c.isTarget).map((c) => c.id);
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datasetName: dataset.name,
          datasetDescription: dataset.description,
          taskType: dataset.taskType,
          algorithmName: getAlgorithmLabel(algorithm),
          standardization,
          normalization,
          outlierStrategySummary: outlierSummary,
          selectedFeatures: selectedFeatures.length > 0
            ? selectedFeatures
            : dataset.columns.filter((c) => !c.isTarget).slice(0, 8).map((c) => c.name),
          totalFeatures: allFeatureIds.map(
            (id) => dataset.columns.find((c) => c.id === id)?.name ?? id
          ),
          pipelineScore: pipeScore,
          accuracy,
          count: 5,
        }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json() as { questions: GeneratedQuestion[] };
      if (data.questions?.length > 0) {
        setAiQuizQuestions(data.questions.map(toQuizQuestion));
      }
    } catch {
      setQuizFetchError("Using fallback questions (check GROQ_API_KEY)");
    } finally {
      setIsFetchingQuiz(false);
    }
  };

  const handleReflectionProceed = async () => {
    setActiveStep(1);
    await fetchAIQuiz();
  };

  const handleQuizComplete = (score: number, total: number, wrong: string[]) => {
    setQuizScore(score);
    setQuizTotal(total);
    setWrongTopics(wrong);
    setQuizDone(true);
    setActiveStep(2);
  };

  if (!router.isReady) return null;

  const algorithmLabel = getAlgorithmLabel(algorithm);

  return (
    <>
      <Head>
        <title>Review — {dataset.name} · ML Hyper-Trainer</title>
        <meta
          name="description"
          content={`Review your ML decisions for ${dataset.name}. Reflect on your choices, test your knowledge, and discover strengths and weaknesses.`}
        />
      </Head>

      <Layout>
        {/* ── Hero banner ── */}
        <Box
          bgGradient="linear(to-r, rgba(139,92,246,0.15), rgba(0,212,255,0.08))"
          borderBottom="1px solid"
          borderColor="dark.border"
          py={6}
          px={{ base: 4, md: 8 }}
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute" top="-40px" right="-80px"
            w="300px" h="300px" borderRadius="full"
            bg="neon.purple" opacity={0.04} filter="blur(60px)" pointerEvents="none"
          />

          <Container maxW="900px">
            <Breadcrumb
              separator={<Icon as={FaChevronRight} color="gray.600" boxSize={2.5} />}
              mb={4} fontSize="xs" color="gray.500"
            >
              <BreadcrumbItem>
                <BreadcrumbLink as={Link} href="/" _hover={{ color: "gray.300" }}>
                  <HStack spacing={1}>
                    <Icon as={FaHome} boxSize={3} />
                    <Text>Home</Text>
                  </HStack>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink as={Link} href={`/play/${dataset.id}`} _hover={{ color: "gray.300" }}>
                  {dataset.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink color="neon.cyan" fontWeight={600}>Review</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <HStack spacing={3} mb={3} flexWrap="wrap" gap={2}>
              <Box
                w={10} h={10} borderRadius="xl"
                bgGradient="linear(to-br, neon.purple, neon.cyan)"
                display="flex" alignItems="center" justifyContent="center"
                boxShadow="0 0 24px rgba(139,92,246,0.5)"
              >
                <Icon as={MdAutoAwesome} color="white" boxSize={5} />
              </Box>
              <Box>
                <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight={900} color="white">
                  Training Complete! 🎉
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Now let{"'"}s turn your experience into lasting knowledge.
                </Text>
              </Box>
            </HStack>

            <HStack spacing={3} flexWrap="wrap" gap={3}>
              <Badge
                px={3} py={1} borderRadius="full" fontSize="sm"
                bgGradient="linear(to-r, neon.purple, neon.cyan)"
                color="white" fontFamily="mono" fontWeight={700}
              >
                {accuracy.toFixed(1)}% accuracy
              </Badge>
              <Badge px={3} py={1} borderRadius="full" fontSize="sm" colorScheme="purple" variant="subtle" fontFamily="mono">
                Pipeline: {pipeScore}/100
              </Badge>
              <Badge px={3} py={1} borderRadius="full" fontSize="sm" colorScheme="blue" variant="subtle">
                {algorithmLabel}
              </Badge>
              <Badge px={3} py={1} borderRadius="full" fontSize="sm" colorScheme="gray" variant="subtle">
                {dataset.name} {dataset.icon}
              </Badge>
            </HStack>
          </Container>
        </Box>

        {/* ── Main content ── */}
        <Container maxW="900px" py={8} px={{ base: 4, md: 8 }}>
          {/* Stepper */}
          <Stepper index={activeStep} colorScheme="purple" size="sm" mb={10}>
            {REVIEW_STEPS.map((step, i) => (
              <Step key={step.title}>
                <StepIndicator>
                  <StepStatus
                    complete={<StepIcon />}
                    incomplete={<StepNumber />}
                    active={<StepNumber />}
                  />
                </StepIndicator>
                <Box flexShrink={0} display={{ base: "none", sm: "block" }}>
                  <StepTitle>
                    <Text
                      fontSize="xs"
                      fontWeight={activeStep === i ? 700 : 500}
                      color={activeStep === i ? "white" : "gray.500"}
                    >
                      {step.title}
                    </Text>
                  </StepTitle>
                </Box>
                <StepSeparator />
              </Step>
            ))}
          </Stepper>

          {/* ── Step 1: Reflection Journal ── */}
          {activeStep === 0 && (
            <VStack spacing={6} align="stretch">
              <ReflectionJournal
                algorithmName={algorithmLabel}
                outlierStrategySummary={outlierSummary}
                featureCount={featureCount}
                datasetName={dataset.name}
                answers={reflectionAnswers}
                onChange={setReflectionAnswers}
                onAnalysisComplete={setReflectionAnalysis}
              />

              {reflectionAnalysis && (
                <Flex justify="flex-end">
                  <Button
                    onClick={handleReflectionProceed}
                    px={6}
                    py={3}
                    borderRadius="xl"
                    bgGradient="linear(to-r, neon.purple, neon.cyan)"
                    color="white"
                    fontWeight={700}
                    fontSize="sm"
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "0 0 24px rgba(139,92,246,0.4)",
                    }}
                    transition="all 0.2s"
                    size="lg"
                  >
                    Continue to Knowledge Check →
                  </Button>
                </Flex>
              )}
            </VStack>
          )}

          {/* ── Step 2: Knowledge Quiz ── */}
          {activeStep === 1 && !quizDone && (
            <VStack spacing={4} align="stretch">
              {/* AI quiz loading state */}
              {isFetchingQuiz && (
                <Box
                  bg="dark.card"
                  border="1px solid"
                  borderColor="neon.purple"
                  borderRadius="2xl"
                  p={6}
                  textAlign="center"
                >
                  <VStack spacing={3}>
                    <Spinner size="lg" color="neon.purple" thickness="3px" />
                    <Text fontSize="sm" color="gray.300" fontWeight={600}>
                      Groq is generating personalized questions for {dataset.name}...
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      Creating questions based on your actual choices during training
                    </Text>
                  </VStack>
                </Box>
              )}

              {quizFetchError && !isFetchingQuiz && (
                <Box
                  bg="rgba(252,129,74,0.08)"
                  border="1px solid"
                  borderColor="orange.700"
                  borderRadius="xl"
                  px={4}
                  py={2}
                >
                  <Text fontSize="xs" color="orange.400">
                    ⚠️ {quizFetchError}
                  </Text>
                </Box>
              )}

              {!isFetchingQuiz && (
                <>
                  {aiQuizQuestions && (
                    <HStack spacing={2} mb={2}>
                      <Box w={2} h={2} borderRadius="full" bg="neon.green" />
                      <Text fontSize="xs" color="neon.green" fontFamily="mono" fontWeight={600}>
                        AI-generated questions for {dataset.name}
                      </Text>
                    </HStack>
                  )}
                  <KnowledgeQuiz
                    questions={activeQuizQuestions}
                    onComplete={handleQuizComplete}
                  />
                </>
              )}
            </VStack>
          )}

          {/* ── Step 3: Performance Summary ── */}
          {(activeStep === 2 || quizDone) && (
            <>
              <Divider borderColor="dark.border" mb={8} />
              <PerformanceSummary
                quizScore={quizScore}
                quizTotal={quizTotal}
                wrongTopics={wrongTopics}
                pipelineScore={pipeScore}
                pipelineBreakdown={breakdown}
                accuracy={accuracy}
                objective={dataset.objective}
                datasetId={dataset.id}
                nextDatasetId={nextDataset?.id}
                reflectionScore={reflectionAnalysis?.understandingScore ?? null}
              />
            </>
          )}
        </Container>
      </Layout>
    </>
  );
};

export default ReviewPage;
