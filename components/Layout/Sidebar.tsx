// =============================================================================
// Sidebar Component
// =============================================================================
import {
  Box,
  VStack,
  Text,
  HStack,
  Badge,
  Divider,
  Icon,
  Flex,
} from "@chakra-ui/react";
import { FaTrophy, FaLock } from "react-icons/fa";
import { MdPlayArrow } from "react-icons/md";
import { DATASETS, DIFFICULTY_CONFIG } from "@/data/datasets";
import Link from "next/link";
import { useRouter } from "next/router";

export function Sidebar() {
  const router = useRouter();
  const { datasetId } = router.query;

  const beginnerDatasets = DATASETS.filter((d) => d.difficulty === "beginner");
  const intermediateDatasets = DATASETS.filter(
    (d) => d.difficulty === "intermediate"
  );
  const expertDatasets = DATASETS.filter((d) => d.difficulty === "expert");

  const SectionLabel = ({ label, color }: { label: string; color: string }) => (
    <Text
      fontSize="9px"
      fontWeight={700}
      color={color}
      letterSpacing="0.15em"
      textTransform="uppercase"
      fontFamily="mono"
      px={2}
    >
      {label}
    </Text>
  );

  const DatasetItem = ({ dataset }: { dataset: (typeof DATASETS)[0] }) => {
    const isActive = datasetId === dataset.id;
    const config = DIFFICULTY_CONFIG[dataset.difficulty];

    return (
      <Link href={`/play/${dataset.id}`} style={{ width: "100%" }}>
        <Box
          w="full"
          px={3}
          py={2.5}
          borderRadius="lg"
          cursor="pointer"
          bg={isActive ? "rgba(139,92,246,0.15)" : "transparent"}
          border="1px solid"
          borderColor={isActive ? "neon.purple" : "transparent"}
          _hover={{
            bg: "dark.hover",
            borderColor: "dark.border",
          }}
          transition="all 0.2s ease"
          role="group"
        >
          <HStack spacing={3}>
            <Text fontSize="lg">{dataset.icon}</Text>
            <Box flex={1} minW={0}>
              <Text
                fontSize="sm"
                fontWeight={isActive ? 700 : 500}
                color={isActive ? "white" : "gray.300"}
                noOfLines={1}
              >
                {dataset.name}
              </Text>
              <HStack spacing={1} mt={0.5}>
                <Badge
                  colorScheme={config.colorScheme}
                  variant="subtle"
                  fontSize="9px"
                  px={1.5}
                  borderRadius="sm"
                >
                  {config.label}
                </Badge>
                <Text fontSize="10px" color="gray.600" fontFamily="mono">
                  {dataset.objective}% target
                </Text>
              </HStack>
            </Box>
            {isActive ? (
              <Icon as={MdPlayArrow} color="neon.purple" boxSize={4} />
            ) : (
              <Icon
                as={MdPlayArrow}
                color="gray.700"
                boxSize={4}
                _groupHover={{ color: "gray.500" }}
              />
            )}
          </HStack>
        </Box>
      </Link>
    );
  };

  return (
    <Box
      as="nav"
      w="260px"
      flexShrink={0}
      h="calc(100vh - 57px)"
      position="sticky"
      top="57px"
      bg="dark.card"
      borderRight="1px solid"
      borderColor="dark.border"
      overflowY="auto"
      py={5}
      px={3}
    >
      {/* Trophy header */}
      <Flex align="center" justify="center" mb={5} gap={2}>
        <Icon as={FaTrophy} color="yellow.400" boxSize={4} />
        <Text fontSize="xs" fontWeight={700} color="gray.400" letterSpacing="wider">
          CHALLENGE LEVELS
        </Text>
      </Flex>

      <VStack align="stretch" spacing={1}>
        <SectionLabel label="Beginner" color="green.400" />
        {beginnerDatasets.map((d) => (
          <DatasetItem key={d.id} dataset={d} />
        ))}

        <Divider borderColor="dark.border" my={2} />
        <SectionLabel label="Intermediate" color="orange.400" />
        {intermediateDatasets.map((d) => (
          <DatasetItem key={d.id} dataset={d} />
        ))}

        <Divider borderColor="dark.border" my={2} />
        <SectionLabel label="Expert" color="red.400" />
        {expertDatasets.map((d) => (
          <DatasetItem key={d.id} dataset={d} />
        ))}

        <Divider borderColor="dark.border" my={3} />

        {/* Legend */}
        <Box px={2} py={2} bg="dark.panel" borderRadius="lg">
          <HStack spacing={2} mb={1}>
            <Icon as={FaLock} color="gray.600" boxSize={3} />
            <Text fontSize="10px" color="gray.600" fontFamily="mono">
              Real backend: coming soon
            </Text>
          </HStack>
          <Text fontSize="10px" color="gray.700" lineHeight={1.4}>
            Currently using simulated training. Hook up your Python backend
            via <Text as="span" color="neon.cyan" fontFamily="mono" fontSize="9px">NEXT_PUBLIC_API_URL</Text>.
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}
