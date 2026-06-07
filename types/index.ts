// =============================================================================
// Shared TypeScript Types
// =============================================================================

export type AlgorithmType =
  | "random_forest"
  | "neural_net"
  | "svm"
  | "logistic_regression"
  | "knn";

export type KernelType = "rbf" | "linear" | "polynomial";

// ---------------------------------------------------------------------------
// Preprocessing Types
// ---------------------------------------------------------------------------

export type ColumnDtype = "numeric" | "categorical" | "binary" | "text" | "target";

export interface ColumnInfo {
  id: string;
  name: string;
  dtype: ColumnDtype;
  importance: number;        // 0–1 feature importance score
  missingPct: number;        // 0–100 % missing values
  hasOutliers: boolean;
  isTarget: boolean;
  description: string;
  sampleValues: (string | number)[];  // Example values for preview table
  stats?: {                           // For numeric columns
    mean: number;
    std: number;
    min: number;
    max: number;
    skewness: "low" | "moderate" | "high";
  };
}

// Standardization: transform to zero mean, unit variance (z-score)
export type StandardizationMethod = "none" | "standard" | "robust";
// "standard" = Z-score: (x - mean) / std
// "robust"   = (x - median) / IQR  (outlier-resistant)

// Normalization: scale to a bounded range
export type NormalizationMethod = "none" | "minmax" | "log" | "sqrt";
// "minmax" = (x - min) / (max - min) → [0, 1]
// "log"    = log(x + 1) for right-skewed distributions
// "sqrt"   = sqrt(x) for moderate skew

export type OutlierStrategy = "keep" | "clip" | "remove" | "impute_median";

export interface OutlierConfig {
  columnId: string;
  strategy: OutlierStrategy;
}

export type ActivationFunction = "relu" | "tanh" | "sigmoid" | "leaky_relu" | "elu";

export interface NetworkLayer {
  id: string;
  units: number;           // 8–512
  activation: ActivationFunction;
  dropout: number;         // 0–0.5
}

export interface PreprocessingConfig {
  // Step 2 — Feature selection
  selectedFeatures: string[];    // column ids that are kept

  // Step 3 — Standardization
  standardization: StandardizationMethod;

  // Step 3 — Normalization
  normalization: NormalizationMethod;

  // Step 3 — Outlier handling
  outlierConfigs: OutlierConfig[];

  // Step 4 — Network architecture (Neural Net only)
  networkLayers: NetworkLayer[];
}

export interface PreprocessingScore {
  total: number;           // 0–100
  grade: "A" | "B" | "C" | "D" | "F";
  accuracyModifier: number; // multiplier applied to final accuracy (0.7–1.2)
  breakdown: {
    featureSelection: number;
    scaling: number;
    outliers: number;
    architecture: number;
  };
  tips: string[];
}

// ---------------------------------------------------------------------------
// Core Types
// ---------------------------------------------------------------------------

export interface Hyperparameters {
  algorithm: AlgorithmType;
  learningRate: number;
  maxDepth: number;
  nEstimators: number;
  k: number;
  regularization: boolean;
  kernel: KernelType;
  epochs: number;
  batchSize: number;
  optimizer: "adam" | "sgd" | "rmsprop";
}

export interface EpochResult {
  epoch: number;
  accuracy: number;
  loss: number;
}

export interface TrainingResult {
  epochs: EpochResult[];
  finalAccuracy: number;
  trainingTime: number;
  algorithm: AlgorithmType;
  preprocessingScore: number;
}

export type DifficultyLevel = "beginner" | "intermediate" | "expert";

export interface Dataset {
  id: string;
  name: string;
  description: string;
  objective: number;
  difficulty: DifficultyLevel;
  features: number;
  samples: number;
  taskType: "classification" | "regression";
  icon: string;
  columns: ColumnInfo[];
}

export type StarCount = 0 | 1 | 2 | 3;

export type WizardStep = 1 | 2 | 3 | 4 | 5;
