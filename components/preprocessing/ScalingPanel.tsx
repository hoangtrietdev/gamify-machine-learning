// =============================================================================
// Step 3: Scaling Panel — Standardization + Normalization + Outlier Handling
// (Layout-stable: fixed card heights, always-rendered preview, no border jumps)
// =============================================================================
import {
  Box, Text, HStack, VStack, Badge, Icon, Select, SimpleGrid, Flex,
  Divider, Tooltip, Tag, TagLabel,
} from "@chakra-ui/react";
import {
  FaBalanceScale, FaExclamationTriangle, FaInfoCircle, FaCheck,
} from "react-icons/fa";
import { MdScatterPlot, MdAutoGraph } from "react-icons/md";
import {
  ColumnInfo, PreprocessingConfig,
  StandardizationMethod, NormalizationMethod, OutlierStrategy,
} from "@/types";

// ---------------------------------------------------------------------------
// Data definitions
// ---------------------------------------------------------------------------
const STANDARDIZATION_OPTIONS: {
  value: StandardizationMethod;
  label: string;
  formula: string;
  description: string;
  bestFor: string;
}[] = [
  {
    value: "none",
    label: "No Standardization",
    formula: "x",
    description: "Keep raw values. Fine for tree-based models that are scale-invariant.",
    bestFor: "Random Forest, XGBoost",
  },
  {
    value: "standard",
    label: "Z-Score (Standard Scaler)",
    formula: "(x − μ) / σ",
    description: "Transforms features to zero mean and unit variance. The most common choice.",
    bestFor: "SVM, Neural Networks, Logistic Regression",
  },
  {
    value: "robust",
    label: "Robust Scaler",
    formula: "(x − median) / IQR",
    description: "Uses median & IQR instead of mean & std. Resistant to extreme outliers.",
    bestFor: "Datasets with heavy outliers + SVM/NN",
  },
];

const NORMALIZATION_OPTIONS: {
  value: NormalizationMethod;
  label: string;
  formula: string;
  description: string;
  bestFor: string;
}[] = [
  {
    value: "none",
    label: "No Normalization",
    formula: "x",
    description: "Skip range normalization. Use after standardization or for tree models.",
    bestFor: "Already standardized data",
  },
  {
    value: "minmax",
    label: "Min-Max Scaler",
    formula: "(x − min) / (max − min)",
    description: "Scales all values to the [0, 1] range. Preserves the data distribution shape.",
    bestFor: "Neural Networks (bounded activations), image data",
  },
  {
    value: "log",
    label: "Log Transform",
    formula: "log(x + 1)",
    description: "Compresses right-skewed distributions. Ideal for highly skewed features like Fare, Amount.",
    bestFor: "Highly skewed features (skewness > 2)",
  },
  {
    value: "sqrt",
    label: "Square Root Transform",
    formula: "√x",
    description: "Milder than log — good for moderate skewness. Safe for count data.",
    bestFor: "Moderately skewed, non-negative features",
  },
];

const OUTLIER_OPTIONS: {
  value: OutlierStrategy; label: string; description: string;
}[] = [
  { value: "keep",          label: "Keep",           description: "Leave outliers as-is. OK if your model handles them (trees)." },
  { value: "clip",          label: "Clip (IQR)",     description: "Cap values at [Q1-1.5×IQR, Q3+1.5×IQR]. Safe and reversible." },
  { value: "remove",        label: "Remove Rows",    description: "Delete rows with outlier values. Loses samples — use sparingly." },
  { value: "impute_median", label: "Impute Median",  description: "Replace outliers with the column median. Preserves row count." },
];

// ---------------------------------------------------------------------------
// ScalingPreview — always rendered, uses opacity to show/hide (no height jump)
// ---------------------------------------------------------------------------
function ScalingPreview({
  method, type, visible,
}: {
  method: string;
  type: "standard" | "normalize";
  visible: boolean;
}) {
  const rawBars =    [2, 8, 18, 32, 48, 36, 22, 10, 4, 1];
  const skewBars =   [55, 28, 12, 5, 2, 1, 0, 0, 0, 0];
  const transformedBars =
    method === "none"                       ? rawBars :
    method === "standard" || method === "robust" ? [2, 6, 14, 28, 48, 38, 24, 12, 5, 2] :
    method === "minmax"                     ? rawBars :
    /* log | sqrt */                          [4, 10, 18, 28, 38, 32, 20, 12, 6, 3];

  const srcBars =
    type === "normalize" && (method === "log" || method === "sqrt")
      ? skewBars
      : rawBars;

  const max = Math.max(...srcBars, ...transformedBars);

  return (
    // Always occupies space; opacity transition prevents layout shift
    <Box
      h="48px"                     // fixed height — never collapses
      opacity={visible ? 1 : 0}
      pointerEvents={visible ? "auto" : "none"}
      transition="opacity 0.25s"
      mt={2}
    >
      <HStack spacing={4} align="center">
        <VStack spacing={1} align="flex-start">
          <Text fontSize="9px" color="gray.600" fontFamily="mono">BEFORE</Text>
          <HStack spacing="1px" align="flex-end" h="24px">
            {srcBars.map((v, i) => (
              <Box key={i} w="5px" bg="gray.600" borderRadius="1px"
                h={`${Math.max(1, (v / max) * 24)}px`} />
            ))}
          </HStack>
        </VStack>
        <Text fontSize="xs" color="gray.600">→</Text>
        <VStack spacing={1} align="flex-start">
          <Text fontSize="9px" color="neon.cyan" fontFamily="mono">AFTER</Text>
          <HStack spacing="1px" align="flex-end" h="24px">
            {transformedBars.map((v, i) => (
              <Box key={i} w="5px" bg="neon.cyan" opacity={0.7} borderRadius="1px"
                h={`${Math.max(1, (v / max) * 24)}px`} />
            ))}
          </HStack>
        </VStack>
      </HStack>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// MethodCard — fixed height, border always 2px (only color changes, no width jump)
// ---------------------------------------------------------------------------
function MethodCard<T extends string>({
  option, isSelected, onSelect,
}: {
  option: {
    value: T; label: string; formula: string;
    description: string; bestFor: string;
  };
  isSelected: boolean;
  onSelect: (v: T) => void;
}) {
  return (
    <Box
      // Fixed height so grid rows never resize on selection
      h="160px"
      bg={isSelected ? "rgba(139,92,246,0.10)" : "dark.panel"}
      // Always 2px border — only COLOR changes, never width
      border="2px solid"
      borderColor={isSelected ? "neon.purple" : "dark.border"}
      borderRadius="xl"
      p={4}
      cursor="pointer"
      onClick={() => onSelect(option.value)}
      // Transition only non-layout properties
      transition="border-color 0.2s, background 0.2s"
      _hover={{ borderColor: "neon.purple" }}
      position="relative"
      overflow="hidden"
    >
      {/* Checkmark — absolute so it never shifts sibling content */}
      <Box
        position="absolute"
        top={2}
        right={2}
        opacity={isSelected ? 1 : 0}
        transition="opacity 0.2s"
      >
        <Icon as={FaCheck} color="neon.purple" boxSize={3.5} />
      </Box>

      <Text
        fontSize="sm"
        fontWeight={700}
        color={isSelected ? "white" : "gray.300"}
        transition="color 0.2s"
        mb={1}
        pr={5}           // leave room for checkmark so text never wraps differently
        noOfLines={1}
      >
        {option.label}
      </Text>

      <Box bg="dark.bg" borderRadius="md" px={2} py={0.5} mb={2} display="inline-block">
        <Text fontSize="11px" fontFamily="mono" color="neon.cyan" noOfLines={1}>
          {option.formula}
        </Text>
      </Box>

      <Text fontSize="xs" color="gray.500" lineHeight={1.5} noOfLines={2} mb={1}>
        {option.description}
      </Text>

      <HStack spacing={1} position="absolute" bottom={3} left={4} right={4}>
        <Icon as={FaInfoCircle} color="gray.700" boxSize={3} flexShrink={0} />
        <Text fontSize="10px" color="gray.600" noOfLines={1}>
          {option.bestFor}
        </Text>
      </HStack>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
interface ScalingPanelProps {
  columns: ColumnInfo[];
  config: PreprocessingConfig;
  onChange: (config: PreprocessingConfig) => void;
}

export function ScalingPanel({ columns, config, onChange }: ScalingPanelProps) {
  const selectedCols = columns.filter(
    (c) => !c.isTarget && config.selectedFeatures.includes(c.id)
  );
  const outlierCols  = selectedCols.filter((c) => c.hasOutliers);
  const skewedCols   = selectedCols.filter((c) => c.stats?.skewness === "high");

  const getOutlierStrategy = (colId: string): OutlierStrategy =>
    config.outlierConfigs.find((o) => o.columnId === colId)?.strategy ?? "keep";

  const setOutlierStrategy = (colId: string, strategy: OutlierStrategy) => {
    const updated = config.outlierConfigs.filter((o) => o.columnId !== colId);
    onChange({ ...config, outlierConfigs: [...updated, { columnId: colId, strategy }] });
  };

  return (
    <Flex direction="column" flex={1} overflow="hidden" h="full">
      {/* ── Header ────────────────────────────────────────────────── */}
      <Box flexShrink={0}>
        <HStack spacing={2} mb={1}>
          <Icon as={FaBalanceScale} color="neon.cyan" boxSize={5} />
          <Text fontSize="xl" fontWeight={800} color="white">Scaling & Outlier Handling</Text>
        </HStack>
        <Text fontSize="sm" color="gray.500" mb={5}>
          Standardize and normalize your features. These are two different operations — apply both if needed.
        </Text>
      </Box>

      <Box flex={1} overflowY="auto" pr={2} pb={2}>
      {/* ── SECTION 1: Standardization ─────────────────────────────── */}
      <Box mb={6}>
        <HStack mb={3}>
          <Icon as={MdScatterPlot} color="neon.purple" boxSize={4} />
          <Text fontSize="md" fontWeight={800} color="white">① Standardization</Text>
          <Tooltip
            label="Standardization re-centers data to zero mean and unit variance. Essential for distance-based models."
            hasArrow
          >
            <Icon as={FaInfoCircle} color="gray.600" boxSize={3.5} />
          </Tooltip>
        </HStack>

        <Box
          bg="rgba(139,92,246,0.06)" borderLeft="3px solid" borderColor="neon.purple"
          px={3} py={2} borderRadius="md" mb={3}
        >
          <Text fontSize="xs" color="gray.400">
            <Text as="span" color="neon.purple" fontWeight={700}>Goal:</Text>
            {" "}Make all features have comparable scales. Prevents large-range features from dominating the model.
          </Text>
        </Box>

        {/* Cards — fixed-height grid, never reflows */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
          {STANDARDIZATION_OPTIONS.map((opt) => (
            <MethodCard
              key={opt.value}
              option={opt}
              isSelected={config.standardization === opt.value}
              onSelect={(v) => onChange({ ...config, standardization: v })}
            />
          ))}
        </SimpleGrid>

        {/* Preview — always rendered, fades in/out without shifting layout */}
        <ScalingPreview
          method={config.standardization}
          type="standard"
          visible={config.standardization !== "none"}
        />
      </Box>

      <Divider borderColor="dark.border" mb={6} />

      {/* ── SECTION 2: Normalization ───────────────────────────────── */}
      <Box mb={6}>
        <HStack mb={3}>
          <Icon as={MdAutoGraph} color="neon.green" boxSize={4} />
          <Text fontSize="md" fontWeight={800} color="white">② Normalization</Text>
          <Tooltip
            label="Normalization transforms the range or distribution shape. Different from standardization."
            hasArrow
          >
            <Icon as={FaInfoCircle} color="gray.600" boxSize={3.5} />
          </Tooltip>
        </HStack>

        {/* Goal box — fixed min-height so skewed-col tags don't cause jump */}
        <Box
          bg="rgba(16,245,160,0.06)" borderLeft="3px solid" borderColor="neon.green"
          px={3} py={2} borderRadius="md" mb={3}
          minH="44px"            // always the same height whether tags show or not
        >
          <Text fontSize="xs" color="gray.400">
            <Text as="span" color="neon.green" fontWeight={700}>Goal:</Text>
            {" "}Bound the data range or correct distribution skewness. Apply after standardization, or independently.
          </Text>
          {skewedCols.length > 0 && (
            <HStack mt={1} spacing={1} flexWrap="wrap">
              <Icon as={FaExclamationTriangle} color="orange.400" boxSize={3} />
              <Text fontSize="xs" color="orange.300">Highly skewed columns detected:</Text>
              {skewedCols.map((c) => (
                <Tag key={c.id} size="sm" colorScheme="orange" variant="subtle">
                  <TagLabel>{c.name}</TagLabel>
                </Tag>
              ))}
            </HStack>
          )}
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={3}>
          {NORMALIZATION_OPTIONS.map((opt) => (
            <MethodCard
              key={opt.value}
              option={opt}
              isSelected={config.normalization === opt.value}
              onSelect={(v) => onChange({ ...config, normalization: v })}
            />
          ))}
        </SimpleGrid>

        <ScalingPreview
          method={config.normalization}
          type="normalize"
          visible={config.normalization !== "none"}
        />
      </Box>

      <Divider borderColor="dark.border" mb={6} />

      {/* ── SECTION 3: Outlier Handling ────────────────────────────── */}
      <Box>
        <HStack mb={3}>
          <Icon as={FaExclamationTriangle} color="orange.400" boxSize={4} />
          <Text fontSize="md" fontWeight={800} color="white">③ Outlier Handling</Text>
          <Badge
            colorScheme={outlierCols.length > 0 ? "orange" : "green"}
            variant="subtle" fontSize="xs"
          >
            {outlierCols.length} column{outlierCols.length !== 1 ? "s" : ""} affected
          </Badge>
        </HStack>

        {outlierCols.length === 0 ? (
          <Box
            bg="rgba(16,245,160,0.06)" border="1px solid" borderColor="green.800"
            borderRadius="lg" p={4} textAlign="center"
          >
            <Icon as={FaCheck} color="green.400" boxSize={5} mb={2} />
            <Text fontSize="sm" color="green.300">
              No outlier columns in your current feature selection.
            </Text>
          </Box>
        ) : (
          <VStack spacing={3} align="stretch">
            {outlierCols.map((col) => {
              const current = getOutlierStrategy(col.id);
              return (
                <Box
                  key={col.id}
                  bg="dark.panel" border="1px solid" borderColor="dark.border"
                  borderRadius="xl" p={4}
                >
                  {/* Row: label LEFT, select RIGHT — both fixed so nothing shifts */}
                  <Flex justify="space-between" align="flex-start" mb={2} gap={3}>
                    <Box flex={1} minW={0}>
                      <HStack spacing={2} mb={0.5}>
                        <Icon as={FaExclamationTriangle} color="orange.400" boxSize={3} flexShrink={0} />
                        <Text fontSize="sm" fontWeight={700} color="white" noOfLines={1}>
                          {col.name}
                        </Text>
                        {col.stats && (
                          <Badge colorScheme="gray" variant="outline" fontSize="9px" fontFamily="mono" flexShrink={0}>
                            max={col.stats.max}
                          </Badge>
                        )}
                      </HStack>
                      <Text fontSize="xs" color="gray.600" noOfLines={1}>{col.description}</Text>
                    </Box>

                    {/* Fixed-width select — never changes the row width */}
                    <Box flexShrink={0} w="180px">
                      <Select
                        value={current}
                        onChange={(e) =>
                          setOutlierStrategy(col.id, e.target.value as OutlierStrategy)
                        }
                        size="sm"
                        w="180px"
                        bg="dark.bg"
                        borderColor={current === "keep" ? "dark.border" : "neon.purple"}
                        color="white"
                        _hover={{ borderColor: "neon.purple" }}
                        transition="border-color 0.2s"
                      >
                        {OUTLIER_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </Select>
                    </Box>
                  </Flex>

                  {/* Description area — fixed min-height so it never jumps */}
                  <Box bg="dark.bg" borderRadius="md" px={3} py={2} minH="32px">
                    <Text fontSize="xs" color="gray.400">
                      {OUTLIER_OPTIONS.find((o) => o.value === current)?.description}
                    </Text>
                  </Box>
                </Box>
              );
            })}
          </VStack>
        )}
      </Box>
      </Box>
    </Flex>
  );
}
