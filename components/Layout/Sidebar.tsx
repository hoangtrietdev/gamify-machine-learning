// =============================================================================
// Sidebar Component — collapsible, responsive
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
  Tooltip,
} from "@chakra-ui/react";
import { FaTrophy, FaLock, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { MdPlayArrow } from "react-icons/md";
import { DATASETS, DIFFICULTY_CONFIG } from "@/data/datasets";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

const EXPANDED_W = 240;
const COLLAPSED_W = 56;

export function Sidebar() {
  const router = useRouter();
  const { datasetId } = router.query;
  const [collapsed, setCollapsed] = useState(false);

  const beginnerDatasets = DATASETS.filter((d) => d.difficulty === "beginner");
  const intermediateDatasets = DATASETS.filter(
    (d) => d.difficulty === "intermediate"
  );
  const expertDatasets = DATASETS.filter((d) => d.difficulty === "expert");

  const SectionLabel = ({ label, color }: { label: string; color: string }) =>
    collapsed ? null : (
      <Text
        fontSize="9px"
        fontWeight={700}
        color={color}
        letterSpacing="0.15em"
        textTransform="uppercase"
        fontFamily="mono"
        px={2}
        transition="opacity 0.2s"
      >
        {label}
      </Text>
    );

  const DatasetItem = ({ dataset }: { dataset: (typeof DATASETS)[0] }) => {
    const isActive = datasetId === dataset.id;
    const config = DIFFICULTY_CONFIG[dataset.difficulty];

    const inner = (
      <Box
        w="full"
        px={collapsed ? 0 : 2}
        py={collapsed ? 1.5 : 2}
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
        display="flex"
        alignItems="center"
        justifyContent={collapsed ? "center" : "flex-start"}
      >
        {collapsed ? (
          <Text fontSize="lg" lineHeight={1}>{dataset.icon}</Text>
        ) : (
          <HStack spacing={2.5}>
            <Text fontSize="md" flexShrink={0}>{dataset.icon}</Text>
            <Box flex={1} minW={0}>
              <Text
                fontSize="xs"
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
                  px={1}
                  borderRadius="sm"
                >
                  {config.label}
                </Badge>
                <Text fontSize="9px" color="gray.600" fontFamily="mono">
                  {dataset.objective}%
                </Text>
              </HStack>
            </Box>
            {isActive && (
              <Icon as={MdPlayArrow} color="neon.purple" boxSize={3.5} flexShrink={0} />
            )}
          </HStack>
        )}
      </Box>
    );

    return (
      <Link href={`/play/${dataset.id}`} style={{ width: "100%" }}>
        {collapsed ? (
          <Tooltip
            label={`${dataset.name} · ${config.label} · ${dataset.objective}% target`}
            placement="right"
            hasArrow
            bg="dark.card"
            color="white"
            fontSize="xs"
          >
            {inner}
          </Tooltip>
        ) : (
          inner
        )}
      </Link>
    );
  };

  return (
    <Box
      as="nav"
      w={`${collapsed ? COLLAPSED_W : EXPANDED_W}px`}
      flexShrink={0}
      h="calc(100vh - 57px)"
      position="sticky"
      top="57px"
      bg="dark.card"
      borderRight="1px solid"
      borderColor="dark.border"
      overflowY="auto"
      overflowX="hidden"
      /* compact py on small screens */
      py={{ base: 3, md: 4 }}
      px={collapsed ? 1 : 2}
      transition="width 0.25s ease, padding 0.25s ease"
      css={{ scrollbarWidth: "none" }}
    >
      {/* Header row */}
      <Flex
        align="center"
        justify={collapsed ? "center" : "space-between"}
        mb={{ base: 3, md: 4 }}
        px={collapsed ? 0 : 1}
      >
        {!collapsed && (
          <HStack spacing={1.5}>
            <Icon as={FaTrophy} color="yellow.400" boxSize={3.5} />
            <Text fontSize="10px" fontWeight={700} color="gray.400" letterSpacing="wider">
              LEVELS
            </Text>
          </HStack>
        )}

        {/* Collapse toggle */}
        <Tooltip
          label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          placement="right"
          hasArrow
          bg="dark.card"
          color="white"
          fontSize="xs"
        >
          <Box
            as="button"
            onClick={() => setCollapsed((c) => !c)}
            display="flex"
            alignItems="center"
            justifyContent="center"
            w={6}
            h={6}
            borderRadius="md"
            color="gray.500"
            _hover={{ color: "gray.200", bg: "dark.hover" }}
            transition="all 0.2s"
            flexShrink={0}
          >
            <Icon as={collapsed ? FaChevronRight : FaChevronLeft} boxSize={2.5} />
          </Box>
        </Tooltip>
      </Flex>

      <VStack align="stretch" spacing={0.5}>
        <SectionLabel label="Beginner" color="green.400" />
        {beginnerDatasets.map((d) => (
          <DatasetItem key={d.id} dataset={d} />
        ))}

        <Divider borderColor="dark.border" my={1.5} />
        <SectionLabel label="Intermediate" color="orange.400" />
        {intermediateDatasets.map((d) => (
          <DatasetItem key={d.id} dataset={d} />
        ))}

        <Divider borderColor="dark.border" my={1.5} />
        <SectionLabel label="Expert" color="red.400" />
        {expertDatasets.map((d) => (
          <DatasetItem key={d.id} dataset={d} />
        ))}

        {!collapsed && (
          <>
            <Divider borderColor="dark.border" my={2} />
            <Box px={1.5} py={1.5} bg="dark.panel" borderRadius="lg">
              <HStack spacing={1.5} mb={0.5}>
                <Icon as={FaLock} color="gray.600" boxSize={2.5} />
                <Text fontSize="9px" color="gray.600" fontFamily="mono">
                  Real backend: coming soon
                </Text>
              </HStack>
              <Text fontSize="9px" color="gray.700" lineHeight={1.4}>
                Currently using simulated training.
              </Text>
            </Box>
          </>
        )}
      </VStack>
    </Box>
  );
}
