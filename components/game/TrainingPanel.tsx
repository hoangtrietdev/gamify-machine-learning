// =============================================================================
// TrainingPanel — Train button, Progress bar, Epoch log, Star rating
// =============================================================================
import { keyframes } from "@emotion/react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Progress,
  Badge,
  Icon,
  Flex,
  SimpleGrid,
  Divider,
} from "@chakra-ui/react";
import {
  FaRedo,
  FaBolt,
  FaChartLine,
  FaClock,
  FaMicrochip,
} from "react-icons/fa";
import { MdScience } from "react-icons/md";
import { EpochLog } from "@/components/ui/EpochLog";
import { StarRating } from "./StarRating";
import { EpochResult, TrainingResult, Dataset } from "@/types";

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4); }
  50% { box-shadow: 0 0 0 12px rgba(139, 92, 246, 0); }
`;

const scanline = keyframes`
  0% { transform: translateY(-100%); opacity: 0.5; }
  100% { transform: translateY(100%); opacity: 0; }
`;

interface TrainingPanelProps {
  onTrain: () => void;
  onReset: () => void;
  onReview?: () => void;
  isTraining: boolean;
  isComplete: boolean;
  isError: boolean;
  progress: number;
  currentEpoch: number;
  currentAccuracy: number;
  epochResults: EpochResult[];
  result: TrainingResult | null;
  dataset: Dataset;
}

function getProgressColor(accuracy: number): string {
  if (accuracy >= 90) return "green";
  if (accuracy >= 80) return "cyan";
  if (accuracy >= 70) return "yellow";
  return "purple";
}

export function TrainingPanel({
  onTrain,
  onReset,
  onReview,
  isTraining,
  isComplete,
  isError,
  progress,
  currentEpoch,
  currentAccuracy,
  epochResults,
  result,
  dataset,
}: TrainingPanelProps) {
  const progressColor = getProgressColor(currentAccuracy);

  return (
    <Box
      bg="dark.card"
      border="1px solid"
      borderColor="dark.border"
      borderRadius="2xl"
      p={5}
      h="auto"
      position="relative"
      overflow="hidden"
    >
      {/* Scan line animation during training */}
      {isTraining && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          h="2px"
          bg="linear-gradient(to right, transparent, rgba(0,212,255,0.6), transparent)"
          animation={`${scanline} 2s linear infinite`}
          pointerEvents="none"
          zIndex={1}
        />
      )}

      {/* Header */}
      <HStack spacing={2} mb={5}>
        <Icon as={MdScience} color="neon.green" boxSize={5} />
        <Text fontWeight={800} fontSize="lg" color="white">
          Training Arena
        </Text>
        {isTraining && (
          <Badge colorScheme="green" variant="subtle" fontSize="10px">
            LIVE
          </Badge>
        )}
        {isComplete && (
          <Badge colorScheme="cyan" variant="subtle" fontSize="10px">
            COMPLETE
          </Badge>
        )}
      </HStack>

      <VStack spacing={5} align="stretch">
        {/* Live metrics during/after training */}
        {(isTraining || isComplete) && (
          <SimpleGrid columns={3} spacing={3}>
            <LiveStat
              label="Epoch"
              value={`${currentEpoch}/${epochResults.length > 0 ? epochResults[epochResults.length - 1]?.epoch ?? "?" : "?"}`}
              icon={FaClock}
              color="neon.purple"
            />
            <LiveStat
              label="Accuracy"
              value={`${currentAccuracy.toFixed(1)}%`}
              icon={FaChartLine}
              color="neon.cyan"
              highlight={isTraining}
            />
            <LiveStat
              label="Loss"
              value={
                epochResults.length > 0
                  ? epochResults[epochResults.length - 1]?.loss.toFixed(4) ?? "—"
                  : "—"
              }
              icon={FaMicrochip}
              color="neon.pink"
            />
          </SimpleGrid>
        )}
        <EpochLog epochs={epochResults} isTraining={isTraining} />
        {/* Progress bar */}
        <Box>
          <Flex justify="space-between" mb={2}>
            <Text fontSize="xs" color="gray.500" fontFamily="mono">
              {isComplete ? "Training Complete" : isTraining ? "Training..." : "Ready to train"}
            </Text>
            <Text fontSize="xs" color="gray.500" fontFamily="mono">
              {progress}%
            </Text>
          </Flex>
          <Progress
            value={progress}
            colorScheme={progressColor}
            borderRadius="full"
            h="10px"
            bg="dark.border"
            hasStripe={isTraining}
            isAnimated={isTraining}
          />
        </Box>

        {/* Star rating on completion */}
        {isComplete && result && (
          <>
            <Divider borderColor="dark.border" />
            <Box
              bg="dark.panel"
              borderRadius="xl"
              border="1px solid"
              borderColor="dark.border"
              overflow="hidden"
            >
              <StarRating
                accuracy={result.finalAccuracy}
                objective={dataset.objective}
              />
            </Box>
          </>
        )}

        {/* Error state */}
        {isError && (
          <Box
            bg="red.900"
            border="1px solid"
            borderColor="red.600"
            borderRadius="lg"
            p={3}
          >
            <Text fontSize="sm" color="red.200">
              ⚠️ Training failed. Please try again.
            </Text>
          </Box>
        )}

        {/* Action buttons */}
        <VStack spacing={3} align="stretch">
          <HStack spacing={3}>
            <Button
              id="train-model-btn"
              flex={1}
              size="lg"
              isLoading={isTraining}
              loadingText="Training..."
              isDisabled={isTraining}
              onClick={onTrain}
              colorScheme="purple"
              leftIcon={<Icon as={isComplete ? FaRedo : FaBolt} />}
              animation={!isTraining && !isComplete ? `${pulse} 2.5s ease-in-out infinite` : undefined}
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 0 24px rgba(139,92,246,0.6)",
              }}
              transition="all 0.2s"
              bgGradient="linear(to-r, neon.purple, #5B21B6)"
              fontWeight={800}
              letterSpacing="wider"
            >
              {isComplete ? "RETRAIN" : "TRAIN MODEL"}
            </Button>

            {(isTraining || isComplete) && (
              <Button
                size="lg"
                variant="outline"
                colorScheme="gray"
                onClick={onReset}
                isDisabled={isTraining}
                leftIcon={<Icon as={FaRedo} />}
                _hover={{ borderColor: "gray.500" }}
              >
                Reset
              </Button>
            )}
          </HStack>

          {/* Review button — appears after training completes */}
          {isComplete && onReview && (
            <Button
              size="lg"
              variant="outline"
              colorScheme="cyan"
              onClick={onReview}
              fontWeight={700}
              borderColor="neon.cyan"
              color="neon.cyan"
              _hover={{
                bg: "rgba(0,212,255,0.08)",
                transform: "translateY(-1px)",
                boxShadow: "0 0 20px rgba(0,212,255,0.25)",
              }}
              transition="all 0.2s"
            >
              📚 Review My Decisions →
            </Button>
          )}
        </VStack>
      </VStack>
    </Box>
  );
}

function LiveStat({
  label,
  value,
  icon,
  color,
  highlight = false,
}: {
  label: string;
  value: string;
  icon: any;
  color: string;
  highlight?: boolean;
}) {
  return (
    <Box
      bg="dark.panel"
      border="1px solid"
      borderColor={highlight ? color : "dark.border"}
      borderRadius="lg"
      p={3}
      textAlign="center"
      boxShadow={highlight ? `0 0 10px rgba(0,212,255,0.2)` : undefined}
      transition="all 0.3s"
    >
      <Icon as={icon} color={color} boxSize={3.5} mb={1} />
      <Text
        fontSize="md"
        fontWeight={900}
        color="white"
        fontFamily="mono"
        lineHeight={1}
      >
        {value}
      </Text>
      <Text fontSize="9px" color="gray.600" mt={0.5} letterSpacing="wider">
        {label.toUpperCase()}
      </Text>
    </Box>
  );
}
