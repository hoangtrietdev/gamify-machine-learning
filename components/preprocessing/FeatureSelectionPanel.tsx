// =============================================================================
// Step 2: Feature Selection Panel
// =============================================================================
import {
  Box, Text, HStack, VStack, Checkbox, Badge, Icon, Button, Flex,
  Tooltip, SimpleGrid, Alert, AlertIcon,
} from "@chakra-ui/react";
import { FaRobot, FaTrash, FaCheckSquare, FaFilter } from "react-icons/fa";
import { MdWarning } from "react-icons/md";
import { ColumnInfo, PreprocessingConfig } from "@/types";

interface FeatureSelectionPanelProps {
  columns: ColumnInfo[];
  config: PreprocessingConfig;
  onChange: (config: PreprocessingConfig) => void;
}

function ImportanceBar({ value, selected }: { value: number; selected: boolean }) {
  const color = value >= 0.7 ? "neon.green" : value >= 0.4 ? "neon.cyan" : "gray.500";
  return (
    <Box w="100px">
      <Box h="6px" bg="dark.border" borderRadius="full" overflow="hidden">
        <Box
          h="full" borderRadius="full"
          w={`${value * 100}%`}
          bg={selected ? color : "gray.700"}
          transition="all 0.3s"
        />
      </Box>
      <Text fontSize="9px" color={selected ? color : "gray.700"} mt={0.5} fontFamily="mono">
        {(value * 100).toFixed(0)}% importance
      </Text>
    </Box>
  );
}

export function FeatureSelectionPanel({ columns, config, onChange }: FeatureSelectionPanelProps) {
  const nonTargetCols = columns.filter((c) => !c.isTarget);
  const selected = new Set(config.selectedFeatures);

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange({ ...config, selectedFeatures: Array.from(next) });
  };

  const autoSelect = () => {
    const recommended = nonTargetCols
      .filter((c) => c.importance >= 0.3 && c.missingPct < 50)
      .map((c) => c.id);
    onChange({ ...config, selectedFeatures: recommended });
  };

  const selectAll = () => {
    onChange({ ...config, selectedFeatures: nonTargetCols.map((c) => c.id) });
  };

  const clearAll = () => {
    onChange({ ...config, selectedFeatures: [] });
  };

  const selectedCount = selected.size;
  const totalFeatures = nonTargetCols.length;
  const droppedLowImportance = nonTargetCols.filter(
    (c) => c.importance < 0.25 && !selected.has(c.id)
  ).length;
  const droppedHighMissing = nonTargetCols.filter(
    (c) => c.missingPct > 50 && !selected.has(c.id)
  ).length;

  // Sort by importance descending
  const sorted = [...nonTargetCols].sort((a, b) => b.importance - a.importance);

  return (
    <Flex direction="column" flex={1} overflow="hidden" h="full">
      {/* Header and Actions */}
      <Box flexShrink={0}>
        {/* Header */}
      <HStack spacing={2} mb={1}>
        <Icon as={FaFilter} color="neon.purple" boxSize={5} />
        <Text fontSize="xl" fontWeight={800} color="white">Feature Selection</Text>
      </HStack>
      <Text fontSize="sm" color="gray.500" mb={4}>
        Choose which features to include. Removing irrelevant or high-missing columns improves model quality.
      </Text>

      {/* Stats + actions */}
      <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={3}>
        <HStack spacing={3}>
          <Box bg="dark.panel" border="1px solid" borderColor="dark.border" borderRadius="lg" px={3} py={2}>
            <Text fontSize="lg" fontWeight={900} color="neon.cyan" fontFamily="mono">
              {selectedCount}/{totalFeatures}
            </Text>
            <Text fontSize="9px" color="gray.600" letterSpacing="wider">FEATURES SELECTED</Text>
          </Box>
          {droppedLowImportance > 0 && (
            <Badge colorScheme="green" variant="subtle" fontSize="xs" px={2} py={1}>
              ✓ {droppedLowImportance} low-importance dropped
            </Badge>
          )}
          {droppedHighMissing > 0 && (
            <Badge colorScheme="green" variant="subtle" fontSize="xs" px={2} py={1}>
              ✓ {droppedHighMissing} high-missing dropped
            </Badge>
          )}
        </HStack>
        <HStack spacing={2}>
          <Button size="xs" leftIcon={<Icon as={FaRobot} />} colorScheme="purple" variant="outline"
            onClick={autoSelect}>
            Auto-Select
          </Button>
          <Button size="xs" leftIcon={<Icon as={FaCheckSquare} />} colorScheme="gray" variant="ghost"
            onClick={selectAll}>
            All
          </Button>
          <Button size="xs" leftIcon={<Icon as={FaTrash} />} colorScheme="gray" variant="ghost"
            onClick={clearAll} color="gray.500">
            Clear
          </Button>
        </HStack>
      </Flex>

      {/* Warning if too few selected */}
      {selectedCount < 2 && (
        <Alert status="warning" mb={4} borderRadius="lg" bg="rgba(251,146,60,0.08)" border="1px solid"
          borderColor="orange.800" fontSize="sm">
          <AlertIcon color="orange.400" />
          Select at least 2 features to train a model.
        </Alert>
      )}
      </Box>

      {/* Feature list */}
      <Box flex={1} overflowY="auto" pr={2} pb={2}>
      <VStack spacing={2} align="stretch">
        <SimpleGrid columns={2} spacing={2}>
          {sorted.map((col) => {
            const isSelected = selected.has(col.id);
            const isHighMissing = col.missingPct > 50;
            const isLowImp = col.importance < 0.25;
            return (
              <Box
                key={col.id}
                bg={isSelected ? "rgba(139,92,246,0.08)" : "dark.panel"}
                border="1px solid"
                borderColor={isSelected ? "neon.purple" : "dark.border"}
                borderRadius="xl"
                p={3}
                cursor="pointer"
                onClick={() => toggle(col.id)}
                transition="all 0.2s"
                opacity={isHighMissing && !isSelected ? 0.5 : 1}
                _hover={{ borderColor: "neon.purple" }}
              >
                <Flex justify="space-between" align="flex-start" mb={2}>
                  <Checkbox
                    isChecked={isSelected}
                    onChange={() => toggle(col.id)}
                    colorScheme="purple"
                    size="md"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Text fontSize="sm" fontWeight={700} color={isSelected ? "white" : "gray.400"} ml={1} noOfLines={1}>
                      {col.name}
                    </Text>
                  </Checkbox>
                  <HStack spacing={1}>
                    {isLowImp && (
                      <Tooltip label="Low importance — consider removing" hasArrow>
                        <Badge colorScheme="orange" variant="subtle" fontSize="9px">Low</Badge>
                      </Tooltip>
                    )}
                    {isHighMissing && (
                      <Tooltip label={`${col.missingPct}% missing — not recommended`} hasArrow>
                        <Badge colorScheme="red" variant="subtle" fontSize="9px">
                          {col.missingPct}% null
                        </Badge>
                      </Tooltip>
                    )}
                    {col.hasOutliers && (
                      <Tooltip label="Contains outliers" hasArrow>
                        <Icon as={MdWarning} color="orange.400" boxSize={3.5} />
                      </Tooltip>
                    )}
                  </HStack>
                </Flex>
                <Text fontSize="10px" color="gray.600" mb={2} noOfLines={1}>{col.description}</Text>
                <ImportanceBar value={col.importance} selected={isSelected} />
              </Box>
            );
          })}
        </SimpleGrid>
      </VStack>
      </Box>

      <Text fontSize="xs" color="gray.700" mt={4} textAlign="center" fontFamily="mono" flexShrink={0}>
        💡 Tip: Click &quot;Auto-Select&quot; to start with a recommended feature set.
      </Text>
    </Flex>
  );
}
