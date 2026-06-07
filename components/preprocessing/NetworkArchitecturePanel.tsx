// =============================================================================
// Step 4: Network Architecture Panel (Neural Net only)
// =============================================================================
import {
  Box, Text, HStack, VStack, Badge, Icon, Button, Slider, SliderTrack,
  SliderFilledTrack, SliderThumb, Flex, Select, SimpleGrid, Tooltip, Divider,
} from "@chakra-ui/react";
import { FaNetworkWired, FaPlus, FaTrash, FaBolt } from "react-icons/fa";
import { MdLayers, MdMemory } from "react-icons/md";
import { PreprocessingConfig, NetworkLayer, ActivationFunction } from "@/types";
import { useCallback } from "react";

const ACTIVATIONS: { value: ActivationFunction; label: string; description: string }[] = [
  { value: "relu",       label: "ReLU",        description: "Default — fast, avoids vanishing gradients" },
  { value: "leaky_relu", label: "Leaky ReLU",  description: "Prevents dead neurons — slightly better than ReLU" },
  { value: "elu",        label: "ELU",          description: "Smooth negative activations — faster convergence" },
  { value: "tanh",       label: "Tanh",         description: "Centered at 0 — good for shallow nets" },
  { value: "sigmoid",    label: "Sigmoid",      description: "Squashes to [0,1] — prone to vanishing gradient" },
];

const PRESETS = [
  {
    name: "Shallow",
    emoji: "🪶",
    description: "2 layers, fast training, less risk of overfitting",
    layers: [
      { id: "p1", units: 64, activation: "relu" as ActivationFunction, dropout: 0.1 },
      { id: "p2", units: 32, activation: "relu" as ActivationFunction, dropout: 0.0 },
    ],
  },
  {
    name: "Medium",
    emoji: "⚡",
    description: "4 layers, balanced complexity and generalization",
    layers: [
      { id: "p1", units: 256, activation: "relu" as ActivationFunction, dropout: 0.3 },
      { id: "p2", units: 128, activation: "leaky_relu" as ActivationFunction, dropout: 0.2 },
      { id: "p3", units: 64, activation: "relu" as ActivationFunction, dropout: 0.1 },
      { id: "p4", units: 32, activation: "relu" as ActivationFunction, dropout: 0.0 },
    ],
  },
  {
    name: "Deep",
    emoji: "🔥",
    description: "6 layers, high capacity — watch for overfitting",
    layers: [
      { id: "p1", units: 512, activation: "leaky_relu" as ActivationFunction, dropout: 0.4 },
      { id: "p2", units: 256, activation: "leaky_relu" as ActivationFunction, dropout: 0.3 },
      { id: "p3", units: 128, activation: "relu" as ActivationFunction, dropout: 0.2 },
      { id: "p4", units: 64, activation: "relu" as ActivationFunction, dropout: 0.2 },
      { id: "p5", units: 32, activation: "relu" as ActivationFunction, dropout: 0.1 },
      { id: "p6", units: 16, activation: "relu" as ActivationFunction, dropout: 0.0 },
    ],
  },
];

// Compute total trainable parameter estimate
function estimateParams(layers: NetworkLayer[], inputFeatures: number = 32): number {
  let params = 0;
  let prev = inputFeatures;
  for (const l of layers) {
    params += prev * l.units + l.units; // weights + biases
    prev = l.units;
  }
  params += prev + 1; // output layer (binary)
  return params;
}

// Visual network diagram
function NetworkDiagram({ layers }: { layers: NetworkLayer[] }) {
  const maxUnits = Math.max(...layers.map((l) => l.units), 1);
  const allLayers = [
    { label: "Input", units: 32, color: "gray.500" },
    ...layers.map((l) => ({
      label: l.units.toString(),
      units: l.units,
      color: l.dropout > 0 ? "neon.purple" : "neon.cyan",
    })),
    { label: "Output", units: 1, color: "neon.green" },
  ];

  return (
    <Box bg="dark.bg" borderRadius="xl" p={4} border="1px solid" borderColor="dark.border">
      <Text fontSize="xs" color="gray.600" fontFamily="mono" mb={3}>── NETWORK DIAGRAM ───</Text>
      <HStack spacing={4} align="center" justify="center" overflowX="auto" py={2}>
        {allLayers.map((l, i) => (
          <VStack key={i} spacing={1} minW="40px">
            {/* Dots representing neurons (max 8 visible) */}
            <VStack spacing="2px">
              {Array.from({ length: Math.min(8, Math.max(1, Math.round((l.units / maxUnits) * 8))) }).map((_, j) => (
                <Box key={j} w="8px" h="8px" borderRadius="full" bg={l.color} opacity={0.8} />
              ))}
              {l.units > 8 && (
                <Text fontSize="8px" color="gray.600">…</Text>
              )}
            </VStack>
            <Text fontSize="9px" color="gray.500" fontFamily="mono" textAlign="center">{l.label}</Text>
            {i < allLayers.length - 1 && (
              <Box
                position="absolute"
                w="20px" h="1px" bg="dark.border"
              />
            )}
          </VStack>
        ))}
      </HStack>
    </Box>
  );
}

// Single layer editor card
function LayerCard({
  layer, index, total, onUpdate, onRemove,
}: {
  layer: NetworkLayer;
  index: number;
  total: number;
  onUpdate: (updated: NetworkLayer) => void;
  onRemove: () => void;
}) {
  const activation = ACTIVATIONS.find((a) => a.value === layer.activation);
  return (
    <Box bg="dark.panel" border="1px solid" borderColor="dark.border" borderRadius="xl" p={4}
      position="relative" _hover={{ borderColor: "neon.purple" }} transition="border-color 0.2s">
      <Flex justify="space-between" align="center" mb={3}>
        <HStack spacing={2}>
          <Badge colorScheme="purple" variant="subtle" fontFamily="mono" fontSize="xs">
            Layer {index + 1}
          </Badge>
          <Text fontSize="sm" fontWeight={700} color="white">{layer.units} units</Text>
          {layer.dropout > 0 && (
            <Badge colorScheme="orange" variant="subtle" fontSize="9px">
              drop={layer.dropout}
            </Badge>
          )}
        </HStack>
        {total > 1 && (
          <Button size="xs" variant="ghost" colorScheme="red" onClick={onRemove}
            leftIcon={<Icon as={FaTrash} />}>
            Remove
          </Button>
        )}
      </Flex>

      <SimpleGrid columns={2} spacing={4}>
        {/* Units slider */}
        <Box>
          <Text fontSize="xs" color="gray.500" mb={2}>
            Neurons: <Text as="span" color="neon.cyan" fontWeight={700} fontFamily="mono">{layer.units}</Text>
          </Text>
          <Slider
            value={layer.units}
            min={8} max={512} step={8}
            onChange={(v) => onUpdate({ ...layer, units: v })}
          >
            <SliderTrack bg="dark.border">
              <SliderFilledTrack bg="neon.cyan" />
            </SliderTrack>
            <SliderThumb boxSize={3} bg="neon.cyan" />
          </Slider>
          <HStack justify="space-between" mt={0.5}>
            <Text fontSize="9px" color="gray.700" fontFamily="mono">8</Text>
            <Text fontSize="9px" color="gray.700" fontFamily="mono">512</Text>
          </HStack>
        </Box>

        {/* Dropout slider */}
        <Box>
          <Text fontSize="xs" color="gray.500" mb={2}>
            Dropout: <Text as="span" color="neon.purple" fontWeight={700} fontFamily="mono">
              {(layer.dropout * 100).toFixed(0)}%
            </Text>
          </Text>
          <Slider
            value={layer.dropout}
            min={0} max={0.5} step={0.05}
            onChange={(v) => onUpdate({ ...layer, dropout: v })}
          >
            <SliderTrack bg="dark.border">
              <SliderFilledTrack bg="neon.purple" />
            </SliderTrack>
            <SliderThumb boxSize={3} bg="neon.purple" />
          </Slider>
          <HStack justify="space-between" mt={0.5}>
            <Text fontSize="9px" color="gray.700" fontFamily="mono">None</Text>
            <Text fontSize="9px" color="gray.700" fontFamily="mono">50%</Text>
          </HStack>
        </Box>
      </SimpleGrid>

      {/* Activation select */}
      <Box mt={3}>
        <Text fontSize="xs" color="gray.500" mb={1}>Activation Function</Text>
        <Select
          value={layer.activation}
          onChange={(e) => onUpdate({ ...layer, activation: e.target.value as ActivationFunction })}
          size="sm"
          bg="dark.bg"
          borderColor="dark.border"
          color="white"
          _hover={{ borderColor: "neon.purple" }}
        >
          {ACTIVATIONS.map((a) => (
            <option key={a.value} value={a.value}>{a.label} — {a.description}</option>
          ))}
        </Select>
      </Box>
    </Box>
  );
}

interface NetworkArchitecturePanelProps {
  config: PreprocessingConfig;
  onChange: (config: PreprocessingConfig) => void;
  inputFeatureCount: number;
}

export function NetworkArchitecturePanel({
  config, onChange, inputFeatureCount,
}: NetworkArchitecturePanelProps) {
  const layers = config.networkLayers;

  const addLayer = useCallback(() => {
    const lastUnits = layers[layers.length - 1]?.units ?? 64;
    const newLayer: NetworkLayer = {
      id: `l${Date.now()}`,
      units: Math.max(8, Math.round(lastUnits / 2)),
      activation: "relu",
      dropout: 0.1,
    };
    onChange({ ...config, networkLayers: [...layers, newLayer] });
  }, [config, layers, onChange]);

  const updateLayer = useCallback(
    (index: number, updated: NetworkLayer) => {
      const next = [...layers];
      next[index] = updated;
      onChange({ ...config, networkLayers: next });
    },
    [config, layers, onChange]
  );

  const removeLayer = useCallback(
    (index: number) => {
      onChange({ ...config, networkLayers: layers.filter((_, i) => i !== index) });
    },
    [config, layers, onChange]
  );

  const applyPreset = (preset: typeof PRESETS[0]) => {
    onChange({ ...config, networkLayers: preset.layers.map((l, i) => ({ ...l, id: `preset${i}` })) });
  };

  const totalParams = estimateParams(layers, inputFeatureCount);

  return (
    <Box>
      {/* Header */}
      <HStack spacing={2} mb={1}>
        <Icon as={FaNetworkWired} color="neon.purple" boxSize={5} />
        <Text fontSize="xl" fontWeight={800} color="white">Neural Network Architecture</Text>
        <Badge colorScheme="purple" variant="subtle">Neural Net only</Badge>
      </HStack>
      <Text fontSize="sm" color="gray.500" mb={4}>
        Design your hidden layers. Each layer learns increasingly abstract representations.
      </Text>

      {/* Stats bar */}
      <SimpleGrid columns={3} spacing={3} mb={5}>
        {[
          { icon: MdLayers, label: "Hidden Layers", value: layers.length, color: "neon.purple" },
          { icon: MdMemory, label: "Est. Parameters", value: totalParams >= 1000 ? `${(totalParams/1000).toFixed(1)}K` : totalParams, color: "neon.cyan" },
          { icon: FaBolt, label: "Has Dropout", value: layers.some((l) => l.dropout > 0) ? "✓ Yes" : "✗ No", color: layers.some((l) => l.dropout > 0) ? "neon.green" : "orange.400" },
        ].map(({ icon, label, value, color }) => (
          <Box key={label} bg="dark.panel" border="1px solid" borderColor="dark.border"
            borderRadius="lg" p={3} textAlign="center">
            <Icon as={icon} color={color} boxSize={4} mb={1} />
            <Text fontSize="lg" fontWeight={900} color={color} fontFamily="mono">{value}</Text>
            <Text fontSize="9px" color="gray.600" letterSpacing="wider">{label.toUpperCase()}</Text>
          </Box>
        ))}
      </SimpleGrid>

      {/* Presets */}
      <Box mb={5}>
        <Text fontSize="xs" color="gray.600" fontFamily="mono" mb={2}>── ARCHITECTURE PRESETS ──</Text>
        <HStack spacing={3}>
          {PRESETS.map((preset) => (
            <Box
              key={preset.name}
              flex={1}
              bg="dark.panel"
              border="1px solid"
              borderColor="dark.border"
              borderRadius="xl"
              p={3}
              cursor="pointer"
              onClick={() => applyPreset(preset)}
              _hover={{ borderColor: "neon.purple", bg: "rgba(139,92,246,0.08)" }}
              transition="all 0.2s"
              textAlign="center"
            >
              <Text fontSize="xl" mb={1}>{preset.emoji}</Text>
              <Text fontSize="sm" fontWeight={700} color="white">{preset.name}</Text>
              <Text fontSize="10px" color="gray.600" mt={0.5}>{preset.description}</Text>
              <Badge colorScheme="purple" variant="outline" fontSize="9px" mt={2}>
                {preset.layers.length} layers
              </Badge>
            </Box>
          ))}
        </HStack>
      </Box>

      {/* Network diagram */}
      <Box mb={5}>
        <NetworkDiagram layers={layers} />
      </Box>

      {/* Layer editor */}
      <Box mb={4}>
        <Flex justify="space-between" align="center" mb={3}>
          <Text fontSize="xs" color="gray.600" fontFamily="mono">── LAYER EDITOR ──</Text>
          <Button
            size="sm"
            leftIcon={<Icon as={FaPlus} />}
            colorScheme="purple"
            variant="outline"
            onClick={addLayer}
            isDisabled={layers.length >= 8}
          >
            Add Layer
          </Button>
        </Flex>
        {layers.length === 0 ? (
          <Box bg="rgba(239,68,68,0.08)" border="1px solid" borderColor="red.800" borderRadius="xl"
            p={6} textAlign="center">
            <Text color="red.400" fontSize="sm" fontWeight={700}>No hidden layers!</Text>
            <Text color="gray.500" fontSize="xs" mt={1}>Add at least 2 layers or use a preset.</Text>
          </Box>
        ) : (
          <VStack spacing={3} align="stretch">
            {layers.map((layer, i) => (
              <LayerCard
                key={layer.id}
                layer={layer}
                index={i}
                total={layers.length}
                onUpdate={(u) => updateLayer(i, u)}
                onRemove={() => removeLayer(i)}
              />
            ))}
          </VStack>
        )}
      </Box>

      <Text fontSize="xs" color="gray.700" textAlign="center" fontFamily="mono">
        💡 Tip: Start with Medium preset and tune from there. Too deep = overfitting risk.
      </Text>
    </Box>
  );
}
