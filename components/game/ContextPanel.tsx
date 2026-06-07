// =============================================================================
// ContextPanel — Dataset info, objective, and difficulty badge
// =============================================================================
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  SimpleGrid,
  Icon,
  Progress,
  Flex,
} from "@chakra-ui/react";
import { FaBullseye as FaTarget } from "react-icons/fa";
import { MdDataset, MdSpeed } from "react-icons/md";
import { BsGraphUp } from "react-icons/bs";
import { Dataset } from "@/types";
import { DIFFICULTY_CONFIG } from "@/data/datasets";

interface ContextPanelProps {
  dataset: Dataset;
  currentAccuracy?: number;
  isTraining?: boolean;
  isComplete?: boolean;
}

export function ContextPanel({
  dataset,
  currentAccuracy = 0,
  isTraining = false,
  isComplete = false,
}: ContextPanelProps) {
  const config = DIFFICULTY_CONFIG[dataset.difficulty];
  const progressToObjective = Math.min(
    100,
    (currentAccuracy / dataset.objective) * 100
  );
  const hasMetObjective = currentAccuracy >= dataset.objective;

  return (
    <Box
      bg="dark.card"
      border="1px solid"
      borderColor="dark.border"
      borderRadius="2xl"
      p={5}
      position="relative"
      overflow="hidden"
    >
      {/* Background glow */}
      <Box
        position="absolute"
        top="-60px"
        right="-60px"
        w="180px"
        h="180px"
        borderRadius="full"
        bg={`${config.color}.600`}
        opacity={0.06}
        filter="blur(40px)"
        pointerEvents="none"
      />

      {/* Header */}
      <Flex justify="space-between" align="flex-start" mb={4}>
        <HStack spacing={3}>
          <Text fontSize="3xl">{dataset.icon}</Text>
          <Box>
            <Text fontWeight={800} fontSize="xl" color="white" lineHeight={1.1}>
              {dataset.name}
            </Text>
            <Text fontSize="xs" color="gray.500" mt={0.5}>
              {dataset.taskType === "classification" ? "🎯 Classification" : "📈 Regression"} task
            </Text>
          </Box>
        </HStack>
        <Badge
          px={3}
          py={1}
          borderRadius="full"
          colorScheme={config.colorScheme}
          variant="subtle"
          fontSize="xs"
          fontWeight={700}
          letterSpacing="wider"
        >
          {config.label.toUpperCase()}
        </Badge>
      </Flex>

      {/* Description */}
      <Text fontSize="sm" color="gray.400" lineHeight={1.7} mb={4}>
        {dataset.description}
      </Text>

      {/* Stats grid */}
      <SimpleGrid columns={3} spacing={3} mb={4}>
        <StatCard
          label="Features"
          value={dataset.features.toLocaleString()}
          icon={MdDataset}
          color="neon.cyan"
        />
        <StatCard
          label="Samples"
          value={
            dataset.samples >= 1000
              ? `${(dataset.samples / 1000).toFixed(0)}K`
              : dataset.samples.toString()
          }
          icon={BsGraphUp}
          color="neon.purple"
        />
        <StatCard
          label="Target"
          value={`${dataset.objective}%`}
          icon={FaTarget}
          color="neon.green"
        />
      </SimpleGrid>

      {/* Objective progress bar */}
      <Box>
        <Flex justify="space-between" align="center" mb={1.5}>
          <HStack spacing={1}>
            <Icon as={MdSpeed} color="gray.500" boxSize={3.5} />
            <Text fontSize="xs" color="gray.500" fontFamily="mono">
              Objective Progress
            </Text>
          </HStack>
          <HStack spacing={2}>
            {(isTraining || isComplete) && (
              <Text fontSize="xs" fontFamily="mono" color="neon.cyan" fontWeight={700}>
                {currentAccuracy.toFixed(1)}%
              </Text>
            )}
            <Text fontSize="xs" color="gray.600" fontFamily="mono">
              / {dataset.objective}%
            </Text>
          </HStack>
        </Flex>
        <Progress
          value={isTraining || isComplete ? progressToObjective : 0}
          colorScheme={hasMetObjective ? "green" : "purple"}
          borderRadius="full"
          h="8px"
          bg="dark.border"
          hasStripe={isTraining}
          isAnimated={isTraining}
        />
        {hasMetObjective && (
          <Text fontSize="xs" color="green.400" mt={1} fontFamily="mono" textAlign="right">
            ✅ Objective met!
          </Text>
        )}
      </Box>
    </Box>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: any;
  color: string;
}) {
  return (
    <Box
      bg="dark.panel"
      border="1px solid"
      borderColor="dark.border"
      borderRadius="lg"
      p={3}
      textAlign="center"
    >
      <Icon as={icon} color={color} boxSize={4} mb={1} />
      <Text fontSize="lg" fontWeight={800} color="white" fontFamily="mono" lineHeight={1}>
        {value}
      </Text>
      <Text fontSize="10px" color="gray.600" mt={0.5} letterSpacing="wider">
        {label.toUpperCase()}
      </Text>
    </Box>
  );
}
