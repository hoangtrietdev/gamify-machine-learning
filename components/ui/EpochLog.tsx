// =============================================================================
// EpochLog — Live scrolling epoch accuracy log
// =============================================================================
import {
  Box,
  Text,
  HStack,
  VStack,
  Badge,
  Icon,
} from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { EpochResult } from "@/types";
import { FaCircle } from "react-icons/fa";

interface EpochLogProps {
  epochs: EpochResult[];
  isTraining: boolean;
}

function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 90) return "green.400";
  if (accuracy >= 80) return "cyan.400";
  if (accuracy >= 70) return "yellow.400";
  if (accuracy >= 60) return "orange.400";
  return "red.400";
}

export function EpochLog({ epochs, isTraining }: EpochLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [epochs.length]);

  if (epochs.length === 0) {
    return (
      <Box
        h="200px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="dark.panel"
        borderRadius="lg"
        border="1px dashed"
        borderColor="dark.border"
      >
        <VStack spacing={2}>
          <Text fontSize="2xl">🧪</Text>
          <Text fontSize="sm" color="gray.600" fontFamily="mono">
            Awaiting training run...
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box
      h="200px"
      overflowY="auto"
      bg="dark.panel"
      borderRadius="lg"
      border="1px solid"
      borderColor="dark.border"
      p={3}
      fontFamily="mono"
      fontSize="xs"
    >
      <VStack spacing={1} align="stretch">
        {epochs.map((epoch) => (
          <HStack
            key={epoch.epoch}
            spacing={3}
            px={2}
            py={1}
            borderRadius="md"
            _hover={{ bg: "dark.border" }}
            transition="bg 0.1s"
          >
            <Text color="gray.700" w="50px" flexShrink={0}>
              #{String(epoch.epoch).padStart(3, "0")}
            </Text>
            <Box flex={1}>
              <Box
                h="4px"
                borderRadius="full"
                bg="dark.border"
                overflow="hidden"
              >
                <Box
                  h="full"
                  w={`${epoch.accuracy}%`}
                  bg={getAccuracyColor(epoch.accuracy)}
                  borderRadius="full"
                  transition="width 0.3s ease"
                  opacity={0.7}
                />
              </Box>
            </Box>
            <HStack spacing={2} flexShrink={0}>
              <Text color={getAccuracyColor(epoch.accuracy)} fontWeight={700} w="50px">
                {epoch.accuracy.toFixed(1)}%
              </Text>
              <Text color="gray.600" w="55px">
                loss:{epoch.loss.toFixed(3)}
              </Text>
            </HStack>
          </HStack>
        ))}
        {isTraining && (
          <HStack spacing={2} px={2} py={1}>
            <Icon as={FaCircle} color="neon.cyan" boxSize={2} />
            <Text color="neon.cyan" fontSize="10px">
              training...
            </Text>
          </HStack>
        )}
        <div ref={bottomRef} />
      </VStack>
    </Box>
  );
}
