// =============================================================================
// HyperparameterPanel — All hyperparameter controls
// =============================================================================
import {
  Box,
  VStack,
  HStack,
  Text,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Select,
  Switch,
  FormControl,
  FormLabel,
  FormHelperText,
  Badge,
  Icon,
  Tooltip,
  Divider,
  Button,
} from "@chakra-ui/react";
import { useState } from "react";
import { FaQuestionCircle, FaArrowLeft } from "react-icons/fa";
import { MdTune } from "react-icons/md";
import { Hyperparameters, AlgorithmType, KernelType } from "@/types";

interface HyperparameterPanelProps {
  hyperparameters: Hyperparameters;
  onChange: (hp: Hyperparameters) => void;
  isDisabled?: boolean;
  onBack?: () => void;
}

function ParamSlider({
  label,
  value,
  min,
  max,
  step,
  displayValue,
  helperText,
  onChange,
  isDisabled,
  color = "purple",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  displayValue?: string;
  helperText?: string;
  onChange: (val: number) => void;
  isDisabled?: boolean;
  color?: string;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <FormControl isDisabled={isDisabled}>
      <HStack justify="space-between" mb={3}>
        <FormLabel mb={0} fontSize="sm" fontWeight={600} color="gray.300">
          {label}
        </FormLabel>
        <Badge
          fontFamily="mono"
          fontSize="xs"
          colorScheme={color as any}
          variant="subtle"
          px={2.5}
          py={0.5}
          borderRadius="md"
        >
          {displayValue ?? value}
        </Badge>
      </HStack>
      <Slider
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        isDisabled={isDisabled}
        focusThumbOnChange={false}
      >
        <SliderTrack h="6px" borderRadius="full" bg="dark.border">
          <SliderFilledTrack
            bgGradient={`linear(to-r, ${color === "cyan" ? "neon.purple" : "neon.purple"}, neon.cyan)`}
          />
        </SliderTrack>
        <Tooltip
          hasArrow
          bg="dark.panel"
          color="white"
          placement="top"
          isOpen={showTooltip}
          label={displayValue ?? value.toString()}
        >
          <SliderThumb
            boxSize={5}
            bg="white"
            border="3px solid"
            borderColor="neon.cyan"
            _focus={{ boxShadow: "0 0 0 4px rgba(0,212,255,0.25)" }}
          />
        </Tooltip>
      </Slider>
      {helperText && (
        <FormHelperText fontSize="10px" color="gray.600" mt={1}>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
}

export function HyperparameterPanel({
  hyperparameters: hp,
  onChange,
  isDisabled = false,
  onBack,
}: HyperparameterPanelProps) {
  const update = (key: keyof Hyperparameters, value: any) => {
    onChange({ ...hp, [key]: value });
  };

  const showKernel = hp.algorithm === "svm";
  const showDepth = hp.algorithm === "random_forest" || hp.algorithm === "svm";
  const showHiddenLayers = hp.algorithm === "neural_net";
  const depthLabel = hp.algorithm === "random_forest" ? "Max Depth" : hp.algorithm === "neural_net" ? "Hidden Layers" : "Max Depth";

  const formatLR = (v: number) => {
    if (v < 0.001) return v.toExponential(2);
    return v.toFixed(4);
  };

  return (
    <Box
      bg="dark.card"
      border="1px solid"
      borderColor="dark.border"
      borderRadius="2xl"
      p={5}
      h="auto"
    >
      {/* Header */}
      <HStack justify="space-between" mb={5}>
        <HStack spacing={2}>
          <Icon as={MdTune} color="neon.purple" boxSize={5} />
          <Text fontWeight={800} fontSize="lg" color="white">
            Hyperparameters
          </Text>
          <Badge colorScheme="purple" variant="subtle" fontSize="10px">
            TUNING
          </Badge>
        </HStack>
        {onBack && (
          <Button
            size="xs"
            variant="ghost"
            leftIcon={<Icon as={FaArrowLeft} />}
            color="gray.400"
            _hover={{ color: "white", bg: "rgba(255,255,255,0.1)" }}
            onClick={onBack}
            isDisabled={isDisabled}
          >
            Back
          </Button>
        )}
      </HStack>

      <VStack spacing={5} align="stretch">
        {/* Algorithm Select */}
        <FormControl isDisabled={isDisabled}>
          <HStack justify="space-between" mb={2}>
            <FormLabel mb={0} fontSize="sm" fontWeight={600} color="gray.300">
              Algorithm
            </FormLabel>
            <Tooltip
              label="Choose the ML algorithm for training"
              hasArrow
              placement="left"
            >
              <Box cursor="help">
                <Icon as={FaQuestionCircle} color="gray.600" boxSize={3.5} />
              </Box>
            </Tooltip>
          </HStack>
          <Select
            value={hp.algorithm}
            onChange={(e) => update("algorithm", e.target.value as AlgorithmType)}
            bg="dark.panel"
            borderColor="dark.border"
            color="white"
            _hover={{ borderColor: "neon.purple" }}
            _focus={{ borderColor: "neon.cyan", boxShadow: "0 0 0 1px var(--chakra-colors-neon-cyan)" }}
            isDisabled={isDisabled}
            size="md"
          >
            <option value="random_forest">🌲 Random Forest</option>
            <option value="neural_net">🧠 Neural Network</option>
            <option value="svm">⚡ Support Vector Machine</option>
            <option value="logistic_regression">📊 Logistic Regression</option>
            <option value="knn">🎯 K-Nearest Neighbors (KNN)</option>
          </Select>
        </FormControl>

        <Divider borderColor="dark.border" />

        {/* Optimizer Select */}
        <FormControl isDisabled={isDisabled}>
          <HStack justify="space-between" mb={2}>
            <FormLabel mb={0} fontSize="sm" fontWeight={600} color="gray.300">
              Optimizer
            </FormLabel>
          </HStack>
          <Select
            value={hp.optimizer}
            onChange={(e) => update("optimizer", e.target.value)}
            bg="dark.panel"
            borderColor="dark.border"
            color="white"
            _hover={{ borderColor: "neon.purple" }}
            _focus={{ borderColor: "neon.cyan", boxShadow: "0 0 0 1px var(--chakra-colors-neon-cyan)" }}
            isDisabled={isDisabled || hp.algorithm === "random_forest"}
            size="md"
          >
            <option value="adam">Adam (Adaptive Moment Estimation)</option>
            <option value="rmsprop">RMSprop</option>
            <option value="sgd">SGD (Stochastic Gradient Descent)</option>
          </Select>
        </FormControl>

        <Divider borderColor="dark.border" />

        {/* Learning Rate */}
        {hp.algorithm !== "knn" && (
          <ParamSlider
            label="Learning Rate"
            value={hp.learningRate}
            min={0.0001}
            max={1.0}
            step={0.0001}
            displayValue={formatLR(hp.learningRate)}
            helperText="Lower = more stable, slower convergence. Sweet spot: 0.001–0.1"
            onChange={(v) => update("learningRate", v)}
            isDisabled={isDisabled || hp.algorithm === "random_forest"}
          />
        )}

        {/* Max Depth / Hidden Layers */}
        {hp.algorithm !== "knn" && (
          <ParamSlider
            label={depthLabel}
            value={hp.maxDepth}
            min={1}
            max={20}
            step={1}
            displayValue={hp.maxDepth.toString()}
            helperText={
              hp.algorithm === "neural_net"
                ? "Number of hidden layers in the network"
                : "Max tree depth — deeper = more complex but risks overfitting"
            }
            onChange={(v) => update("maxDepth", v)}
            isDisabled={isDisabled}
            color="cyan"
          />
        )}

        {/* K for KNN */}
        {hp.algorithm === "knn" && (
          <ParamSlider
            label="Number of Neighbors (K)"
            value={hp.k}
            min={1}
            max={50}
            step={1}
            displayValue={hp.k.toString()}
            helperText="Number of closest points to consider. Odd numbers are preferred."
            onChange={(v) => update("k", v)}
            isDisabled={isDisabled}
            color="cyan"
          />
        )}

        {/* n_estimators / Epochs */}
        {(hp.algorithm !== "logistic_regression" && hp.algorithm !== "knn") && (
          <ParamSlider
            label={hp.algorithm === "neural_net" ? "Epochs" : hp.algorithm === "svm" ? "Max Iterations" : "N Estimators"}
            value={hp.algorithm === "neural_net" ? hp.epochs : hp.nEstimators}
            min={hp.algorithm === "neural_net" ? 5 : 10}
            max={hp.algorithm === "neural_net" ? 100 : 500}
            step={hp.algorithm === "neural_net" ? 5 : 10}
            displayValue={(hp.algorithm === "neural_net" ? hp.epochs : hp.nEstimators).toString()}
            helperText={
              hp.algorithm === "neural_net"
                ? "More epochs = more training time but better accuracy"
                : "More trees = more robust but slower to train"
            }
            onChange={(v) =>
              hp.algorithm === "neural_net"
                ? update("epochs", v)
                : update("nEstimators", v)
            }
            isDisabled={isDisabled}
            color="purple"
          />
        )}

        {/* Epochs slider for non-NN */}
        {hp.algorithm !== "neural_net" && (
          <ParamSlider
            label="Training Epochs"
            value={hp.epochs}
            min={5}
            max={100}
            step={5}
            displayValue={hp.epochs.toString()}
            helperText="Simulation epochs to visualize convergence"
            onChange={(v) => update("epochs", v)}
            isDisabled={isDisabled}
            color="cyan"
          />
        )}

        {/* Batch Size for NN */}
        {hp.algorithm === "neural_net" && (
          <ParamSlider
            label="Batch Size"
            value={hp.batchSize}
            min={8}
            max={128}
            step={8}
            displayValue={hp.batchSize.toString()}
            helperText="Smaller batches = noisier updates but faster epoch times. Typical: 16-64"
            onChange={(v) => update("batchSize", v)}
            isDisabled={isDisabled}
            color="cyan"
          />
        )}

        <Divider borderColor="dark.border" />

        {/* Kernel Type — only for SVM */}
        {showKernel && (
          <FormControl isDisabled={isDisabled}>
            <HStack justify="space-between" mb={2}>
              <FormLabel mb={0} fontSize="sm" fontWeight={600} color="gray.300">
                Kernel Type
              </FormLabel>
            </HStack>
            <Select
              value={hp.kernel}
              onChange={(e) => update("kernel", e.target.value as KernelType)}
              bg="dark.panel"
              borderColor="dark.border"
              color="white"
              _hover={{ borderColor: "neon.purple" }}
              _focus={{ borderColor: "neon.cyan", boxShadow: "0 0 0 1px var(--chakra-colors-neon-cyan)" }}
              isDisabled={isDisabled}
            >
              <option value="rbf">RBF (Radial Basis Function)</option>
              <option value="linear">Linear</option>
              <option value="polynomial">Polynomial</option>
            </Select>
            <FormHelperText fontSize="10px" color="gray.600">
              RBF works best for most non-linear problems
            </FormHelperText>
          </FormControl>
        )}

        {/* Regularization switch */}
        <FormControl isDisabled={isDisabled}>
          <HStack justify="space-between">
            <Box>
              <FormLabel mb={0} fontSize="sm" fontWeight={600} color="gray.300">
                L2 Regularization
              </FormLabel>
              <FormHelperText fontSize="10px" color="gray.600" mt={0.5}>
                Penalizes large weights to reduce overfitting
              </FormHelperText>
            </Box>
            <Switch
              id="regularization"
              isChecked={hp.regularization}
              onChange={(e) => update("regularization", e.target.checked)}
              colorScheme="purple"
              size="md"
              isDisabled={isDisabled}
            />
          </HStack>
        </FormControl>
      </VStack>
    </Box>
  );
}
