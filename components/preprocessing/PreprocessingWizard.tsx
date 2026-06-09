// =============================================================================
// PreprocessingWizard — Step shell with stepper + score widget
// =============================================================================
import React, { useState, useEffect } from "react";
import {
  Box, Text, HStack, VStack, Button, Icon, Flex, Badge, CircularProgress,
  CircularProgressLabel, Tooltip,
} from "@chakra-ui/react";
import {
  FaChevronRight, FaChevronLeft, FaDatabase, FaFilter, FaBalanceScale,
  FaNetworkWired, FaBolt, FaCheck,
} from "react-icons/fa";
import { Dataset, Hyperparameters, PreprocessingConfig, PreprocessingScore, WizardStep } from "@/types";
import { computePreprocessingScore } from "@/utils/preprocessingScore";
import { DataPreviewPanel } from "./DataPreviewPanel";
import { FeatureSelectionPanel } from "./FeatureSelectionPanel";
import { ScalingPanel } from "./ScalingPanel";
import { NetworkArchitecturePanel } from "./NetworkArchitecturePanel";

// ---------------------------------------------------------------------------
// Step config
// ---------------------------------------------------------------------------
const BASE_STEPS = [
  { step: 1 as WizardStep, label: "Data Preview",  icon: FaDatabase,      description: "Explore your dataset" },
  { step: 2 as WizardStep, label: "Features",       icon: FaFilter,        description: "Select important features" },
  { step: 3 as WizardStep, label: "Scaling",        icon: FaBalanceScale,  description: "Standardize & normalize" },
  { step: 5 as WizardStep, label: "Train",          icon: FaBolt,          description: "Tune & train your model" },
];
const NN_STEP = { step: 4 as WizardStep, label: "Architecture", icon: FaNetworkWired, description: "Design your network" };

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------
function StepDot({
  label, icon, status,
}: {
  label: string; icon: React.ElementType;
  status: "complete" | "active" | "upcoming";
}) {
  const colors = {
    complete: { bg: "neon.purple", border: "neon.purple", text: "white" },
    active:   { bg: "neon.cyan",   border: "neon.cyan",   text: "dark.bg" },
    upcoming: { bg: "dark.panel",  border: "dark.border", text: "gray.500" },
  };
  const c = colors[status];
  return (
    <VStack spacing={1} align="center" minW="64px">
      <Box
        w={8} h={8} borderRadius="full" bg={c.bg}
        border="2px solid" borderColor={c.border}
        display="flex" alignItems="center" justifyContent="center"
        transition="all 0.3s"
        boxShadow={status === "active" ? "0 0 12px rgba(0,212,255,0.4)" : "none"}
      >
        {status === "complete"
          ? <Icon as={FaCheck} color="white" boxSize={3} />
          : <Icon as={icon} color={c.text} boxSize={3} />
        }
      </Box>
      <Text fontSize="10px" fontWeight={status === "active" ? 700 : 500}
        color={status === "active" ? "white" : "gray.600"} textAlign="center">
        {label}
      </Text>
    </VStack>
  );
}

function StepLine({ done }: { done: boolean }) {
  return (
    <Box flex={1} h="2px" bg={done ? "neon.purple" : "dark.border"} mt="14px"
      transition="background 0.4s" borderRadius="full" />
  );
}

// ---------------------------------------------------------------------------
// Score widget
// ---------------------------------------------------------------------------
function ScoreWidget({ score }: { score: PreprocessingScore }) {
  const gradeColors: Record<string, string> = {
    A: "neon.green", B: "neon.cyan", C: "yellow.400", D: "orange.400", F: "red.400",
  };
  const color = gradeColors[score.grade] ?? "gray.500";
  return (
    <Box
      w={{ base: "100%", lg: "320px" }}
      flexShrink={0}
      bg="dark.panel"
      border="1px solid"
      borderColor="dark.border"
      borderRadius="xl"
      p={4}
    >
      <Text fontSize="xs" color="gray.600" fontFamily="mono" mb={2}>── PIPELINE SCORE ────</Text>
      <Flex align="center" gap={4} mb={3}>
        <CircularProgress value={score.total} color={color} trackColor="dark.border" size="64px" thickness="8px">
          <CircularProgressLabel fontSize="lg" fontWeight={900} color={color} fontFamily="mono">
            {score.grade}
          </CircularProgressLabel>
        </CircularProgress>
        <Box>
          <Text fontSize="2xl" fontWeight={900} color={color} fontFamily="mono" lineHeight={1}>
            {score.total}<Text as="span" fontSize="sm" color="gray.600">/100</Text>
          </Text>
          <Text fontSize="xs" color="gray.500">
            Accuracy modifier: <Text as="span" color={color} fontFamily="mono" fontWeight={700}>
              ×{score.accuracyModifier.toFixed(2)}
            </Text>
          </Text>
        </Box>
      </Flex>
      {/* Breakdown bars */}
      {[
        { label: "Features", value: score.breakdown.featureSelection },
        { label: "Scaling",  value: score.breakdown.scaling },
        { label: "Outliers", value: score.breakdown.outliers },
        { label: "Architect", value: score.breakdown.architecture },
      ].map(({ label, value }) => (
        <HStack key={label} spacing={2} mb={1}>
          <Text fontSize="10px" color="gray.600" w="68px" flexShrink={0}>{label}</Text>
          <Box flex={1} h="4px" bg="dark.border" borderRadius="full" overflow="hidden">
            <Box h="full" borderRadius="full" w={`${value}%`}
              bg={value >= 75 ? "neon.green" : value >= 50 ? "neon.cyan" : "orange.400"}
              transition="width 0.5s" />
          </Box>
          <Text fontSize="10px" color="gray.500" fontFamily="mono" w="28px" textAlign="right">{value}</Text>
        </HStack>
      ))}
      {/* Tips */}
      {score.tips.length > 0 && (
        <Box mt={3} pt={3} borderTop="1px solid" borderColor="dark.border">
          {score.tips.map((tip, i) => (
            <Text key={i} fontSize="10px" color="orange.300" lineHeight={1.7}>
              ⚡ {tip}
            </Text>
          ))}
        </Box>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Main wizard
// ---------------------------------------------------------------------------
interface PreprocessingWizardProps {
  dataset: Dataset;
  config: PreprocessingConfig;
  onConfigChange: (c: PreprocessingConfig) => void;
  hyperparameters: Hyperparameters;
  onProceedToTrain: () => void;
  /** Controlled step from parent (for tour navigation) */
  externalStep?: number;
  onExternalStepChange?: (step: number) => void;
}

export function PreprocessingWizard({
  dataset, config, onConfigChange, hyperparameters, onProceedToTrain,
  externalStep, onExternalStepChange,
}: PreprocessingWizardProps) {
  const isNeuralNet = hyperparameters.algorithm === "neural_net";
  const maxStep: WizardStep = isNeuralNet ? 4 : 3;

  const [currentStep, setCurrentStepInternal] = useState<WizardStep>(1);

  // Keep internal step in sync with externalStep prop (tour navigation)
  useEffect(() => {
    if (externalStep !== undefined && externalStep !== currentStep) {
      // Clamp to valid wizard range
      const clamped = Math.max(1, Math.min(externalStep, maxStep)) as WizardStep;
      setCurrentStepInternal(clamped);
    }
  }, [externalStep]); // eslint-disable-line react-hooks/exhaustive-deps

  const setCurrentStep = (fn: (prev: WizardStep) => WizardStep) => {
    setCurrentStepInternal((prev) => {
      const next = fn(prev);
      if (onExternalStepChange) onExternalStepChange(next);
      return next;
    });
  };

  const score = computePreprocessingScore(config, dataset.columns, hyperparameters.algorithm);

  // Build ordered step list
  const steps = [
    BASE_STEPS[0],
    BASE_STEPS[1],
    BASE_STEPS[2],
    ...(isNeuralNet ? [NN_STEP] : []),
    BASE_STEPS[3],
  ];

  const goNext = () => {
    if (currentStep < maxStep) setCurrentStep((prev) => (prev + 1) as WizardStep);
    else onProceedToTrain();
  };
  const goBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as WizardStep);
  };

  const getStatus = (stepNum: WizardStep): "complete" | "active" | "upcoming" => {
    if (stepNum < currentStep) return "complete";
    if (stepNum === currentStep) return "active";
    return "upcoming";
  };

  return (
    <Box display="flex" flexDir="column" flex={1} overflow="hidden">
      {/* Stepper */}
      <Box
        bg="dark.panel"
        border="1px solid"
        borderColor="dark.border"
        borderRadius="2xl"
        p={{ base: 3, md: 4 }}
        mb={{ base: 3, md: 4 }}
        flexShrink={0}
      >
        <HStack align="flex-start" spacing={0}>
          {steps.map((s, i) => (
            <React.Fragment key={s.label}>
              <StepDot
                label={s.label}
                icon={s.icon}
                status={getStatus(s.step)}
              />
              {i < steps.length - 1 && <StepLine done={s.step < currentStep} />}
            </React.Fragment>
          ))}
        </HStack>
      </Box>

      {/* Content + Score */}
      <Flex gap={{ base: 3, md: 4 }} align="stretch" flex={1} overflow="hidden">
        {/* Step content */}
        <Box
          flex={1}
          bg="dark.panel"
          border="1px solid"
          borderColor="dark.border"
          borderRadius="2xl"
          p={{ base: 3, md: 4, lg: 5 }}
          minH={0}
          display="flex"
          flexDir="column"
        >
          {currentStep === 1 && <Box id="tour-data-preview" flex={1} overflow="auto"><DataPreviewPanel dataset={dataset} /></Box>}
          {currentStep === 2 && (
            <Box id="tour-feature-selection" flex={1} overflow="auto">
            <FeatureSelectionPanel
              columns={dataset.columns}
              config={config}
              onChange={onConfigChange}
            />
            </Box>
          )}
          {currentStep === 3 && (
            <Box id="tour-scaling-panel" flex={1} overflow="auto">
            <ScalingPanel
              columns={dataset.columns}
              config={config}
              onChange={onConfigChange}
            />
            </Box>
          )}
          {currentStep === 4 && isNeuralNet && (
            <NetworkArchitecturePanel
              config={config}
              onChange={onConfigChange}
              inputFeatureCount={config.selectedFeatures.length}
            />
          )}
        </Box>

        {/* Score widget */}
        <Box id="tour-pipeline-score">
          <ScoreWidget score={score} />
        </Box>
      </Flex>

      {/* Navigation */}
      <Flex
        flexShrink={0}
        justify="space-between"
        align="center"
        mt={{ base: 2, md: 3 }}
        bg="dark.panel"
        border="1px solid"
        borderColor="dark.border"
        borderRadius="2xl"
        px={{ base: 3, md: 5 }}
        py={{ base: 2, md: 3 }}
      >
        <Button
          leftIcon={<Icon as={FaChevronLeft} />}
          variant="ghost"
          colorScheme="gray"
          onClick={goBack}
          isDisabled={currentStep === 1}
          color="gray.400"
        >
          Back
        </Button>

        <HStack spacing={2}>
          <Text fontSize="xs" color="gray.600" fontFamily="mono">
            Step {currentStep} of {maxStep}
          </Text>
          <Badge
            colorScheme={score.grade === "A" || score.grade === "B" ? "green" : score.grade === "C" ? "yellow" : "orange"}
            variant="subtle" fontSize="xs"
          >
            Score: {score.total}/100
          </Badge>
        </HStack>

        <Button
          rightIcon={<Icon as={currentStep === maxStep ? FaBolt : FaChevronRight} />}
          colorScheme={currentStep === maxStep ? "purple" : "gray"}
          variant={currentStep === maxStep ? "solid" : "outline"}
          onClick={goNext}
          isDisabled={currentStep === 2 && config.selectedFeatures.length < 2}
          bgGradient={currentStep === maxStep ? "linear(to-r, neon.purple, neon.cyan)" : undefined}
          color={currentStep === maxStep ? "white" : undefined}
          fontWeight={700}
        >
          {currentStep === maxStep ? "Proceed to Training →" : "Next Step"}
        </Button>
      </Flex>
    </Box>
  );
}
