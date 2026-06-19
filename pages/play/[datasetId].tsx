// =============================================================================
// pages/play/[datasetId].tsx — Dataset Battle Arena with Preprocessing Pipeline
// =============================================================================
import type { NextPage, GetStaticProps, GetStaticPaths } from "next";
import Head from "next/head";
import {
  Box, Grid, GridItem, Text, HStack, Icon, Breadcrumb, BreadcrumbItem,
  BreadcrumbLink, Badge, Button,
} from "@chakra-ui/react";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { FaChevronRight, FaHome, FaArrowLeft } from "react-icons/fa";
import { MdSportsEsports } from "react-icons/md";
import { Layout } from "@/components/Layout/Layout";
import { ContextPanel } from "@/components/game/ContextPanel";
import { HyperparameterPanel } from "@/components/game/HyperparameterPanel";
import { TrainingPanel } from "@/components/game/TrainingPanel";
import { PreprocessingWizard } from "@/components/preprocessing/PreprocessingWizard";
import { DATASETS } from "@/data/datasets";
import { useTraining } from "@/hooks/useTraining";
import { Dataset, Hyperparameters, PreprocessingConfig } from "@/types";
import {
  computePreprocessingScore,
  getDefaultPreprocessingConfig,
} from "@/utils/preprocessingScore";
import { TourGuide } from "@/components/ui/TourGuide";
import { useTour } from "@/hooks/useTour";
import { PLAY_TOUR_STEPS } from "@/data/tourSteps";

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------
const DEFAULT_HYPERPARAMETERS: Hyperparameters = {
  algorithm: "random_forest",
  learningRate: 0.01,
  maxDepth: 6,
  nEstimators: 100,
  k: 5,
  regularization: true,
  kernel: "rbf",
  epochs: 30,
  batchSize: 32,
  optimizer: "adam",
};

interface PlayPageProps {
  dataset: Dataset;
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
const PlayPage: NextPage<PlayPageProps> = ({ dataset }) => {
  const tour = useTour("play", PLAY_TOUR_STEPS.length);

  const [hyperparameters, setHyperparameters] = useState<Hyperparameters>(
    DEFAULT_HYPERPARAMETERS
  );
  const [preprocessingConfig, setPreprocessingConfig] = useState<PreprocessingConfig>(
    () => getDefaultPreprocessingConfig(dataset.columns)
  );
  const [showTraining, setShowTraining] = useState(false);
  // Wizard step is lifted so the tour can navigate it
  const [wizardStep, setWizardStep] = useState<number>(1);

  const {
    train, resetTraining, isTraining, isComplete, isError,
    progress, currentEpoch, currentAccuracy, epochResults, result,
  } = useTraining();

  // Reset state when dataset changes
  useEffect(() => {
    setShowTraining(false);
    setWizardStep(1);
    setHyperparameters(DEFAULT_HYPERPARAMETERS);
    setPreprocessingConfig(getDefaultPreprocessingConfig(dataset.columns));
    resetTraining();
  }, [dataset.id]);

  // Compute live preprocessing score
  const score = useMemo(
    () => computePreprocessingScore(preprocessingConfig, dataset.columns, hyperparameters.algorithm),
    [preprocessingConfig, dataset.columns, hyperparameters.algorithm]
  );

  const handleProceedToTrain = () => {
    setShowTraining(true);
  };

  const handleBackToPreprocessing = () => {
    setShowTraining(false);
    setWizardStep(1);
    resetTraining();
  };

  // Called by TourGuide when tour step changes
  const handleTourStepChange = useCallback(
    (step: { wizardStep?: number }) => {
      if (step.wizardStep === undefined) return;
      if (step.wizardStep === 5) {
        // Show the training arena for hyperparameter / training steps
        setShowTraining(true);
      } else {
        setShowTraining(false);
        setWizardStep(step.wizardStep);
      }
    },
    []
  );

  const handleTrain = () => {
    train({
      dataset,
      hyperparameters,
      preprocessingConfig,
      preprocessingModifier: score.accuracyModifier,
    });
  };

  const router = useRouter();

  const handleGoToReview = () => {
    const outlierStrategies = preprocessingConfig.outlierConfigs.map((c) => c.strategy);
    router.push({
      pathname: "/play/review",
      query: {
        datasetId: dataset.id,
        accuracy: result?.finalAccuracy.toFixed(2) ?? "0",
        pipeScore: score.total,
        algorithm: hyperparameters.algorithm,
        standardization: preprocessingConfig.standardization,
        normalization: preprocessingConfig.normalization,
        outlierStrategies: JSON.stringify(outlierStrategies),
        featureCount: preprocessingConfig.selectedFeatures.length,
        selectedFeatures: JSON.stringify(preprocessingConfig.selectedFeatures),
        breakdown: JSON.stringify(score.breakdown),
      },
    });
  };

  return (
    <>
      <Head>
        <title>{dataset.name} — ML Hyper-Trainer</title>
        <meta
          name="description"
          content={`Train a ${dataset.taskType} model on the ${dataset.name} dataset. Preprocess data and tune hyperparameters to achieve ${dataset.objective}% accuracy.`}
        />
      </Head>

      <Layout onStartTour={tour.startTour}>
        <TourGuide steps={PLAY_TOUR_STEPS} tour={tour} onStepChange={handleTourStepChange} />
        <Box
          px={{ base: 3, md: 4, lg: 6 }}
          py={{ base: 2, md: 3, lg: 4 }}
          maxW="1400px"
          mx="auto"
          display="flex"
          flexDir="column"
        >
          {/* Breadcrumb */}
          <Breadcrumb
            separator={<Icon as={FaChevronRight} color="gray.600" boxSize={2.5} />}
            mb={{ base: 2, md: 3 }}
            fontSize="xs"
            color="gray.500"
            flexShrink={0}
          >
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} href="/" _hover={{ color: "gray.300" }}>
                <HStack spacing={1}>
                  <Icon as={FaHome} boxSize={3} />
                  <Text>Home</Text>
                </HStack>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage={!showTraining}>
              <BreadcrumbLink
                color={showTraining ? "gray.500" : "neon.cyan"}
                fontWeight={showTraining ? 400 : 600}
                cursor={showTraining ? "pointer" : "default"}
                onClick={showTraining ? handleBackToPreprocessing : undefined}
              >
                {dataset.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            {showTraining && (
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink color="neon.cyan" fontWeight={600}>
                  Training Arena
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}
          </Breadcrumb>

          {/* Page title */}
          <HStack
            spacing={2}
            mb={{ base: 3, md: 4, lg: 5 }}
            flexWrap="wrap"
            gap={2}
            flexShrink={0}
          >
            <Icon as={MdSportsEsports} color="neon.purple" boxSize={6} />
            <Text
              fontSize={{ base: "xl", md: "2xl" }}
              fontWeight={900} color="white" letterSpacing="-0.02em"
            >
              {dataset.name}
            </Text>
            <Badge colorScheme="purple" variant="subtle" fontSize="xs" px={2} py={0.5}>
              {dataset.icon}
            </Badge>
            <Text fontSize="sm" color="gray.600">
              · Target: {dataset.objective}% accuracy
            </Text>

            {showTraining && (
              <Button
                size="xs"
                variant="ghost"
                leftIcon={<Icon as={FaArrowLeft} />}
                color="gray.500"
                onClick={handleBackToPreprocessing}
                ml="auto"
              >
                Edit Preprocessing
              </Button>
            )}
          </HStack>

          {/* ── PREPROCESSING WIZARD (Steps 1-4) ── */}
          {!showTraining ? (
            <Box id="tour-preprocessing-stepper" display="flex" flexDir="column">
              <PreprocessingWizard
                key={dataset.id}
                dataset={dataset}
                config={preprocessingConfig}
                onConfigChange={setPreprocessingConfig}
                hyperparameters={hyperparameters}
                onProceedToTrain={handleProceedToTrain}
                externalStep={wizardStep}
                onExternalStepChange={setWizardStep}
              />
            </Box>
          ) : (
            /* ── TRAINING ARENA (Step 5) ── */
            <>
              <Grid
                templateColumns={{ base: "1fr", lg: "340px 1fr 380px" }}
                gap={5}
                alignItems="flex-start"
                flex={1}
              >
                {/* Panel 1: Context */}
                <GridItem>
                  <ContextPanel
                    dataset={dataset}
                    currentAccuracy={currentAccuracy}
                    isTraining={isTraining}
                    isComplete={isComplete}
                  />
                </GridItem>

                {/* Panel 2: Hyperparameters */}
                <GridItem id="tour-hyperparameter-panel">
                  <HyperparameterPanel
                    hyperparameters={hyperparameters}
                    onChange={setHyperparameters}
                    isDisabled={isTraining}
                    onBack={handleBackToPreprocessing}
                  />
                </GridItem>

                {/* Panel 3: Training */}
                <GridItem id="tour-training-panel">
                  <TrainingPanel
                    onTrain={handleTrain}
                    onReset={resetTraining}
                    onReview={handleGoToReview}
                    isTraining={isTraining}
                    isComplete={isComplete}
                    isError={isError}
                    progress={progress}
                    currentEpoch={currentEpoch}
                    currentAccuracy={currentAccuracy}
                    epochResults={epochResults}
                    result={result}
                    dataset={dataset}
                  />
                </GridItem>
              </Grid>
            </>
          )}
        </Box>
      </Layout>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = DATASETS.map((d) => ({ params: { datasetId: d.id } }));
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<PlayPageProps> = async ({ params }) => {
  const datasetId = params?.datasetId as string;
  const dataset = DATASETS.find((d) => d.id === datasetId);
  if (!dataset) return { notFound: true };
  return { props: { dataset } };
};

export default PlayPage;
