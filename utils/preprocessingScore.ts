// =============================================================================
// Preprocessing Score Utility
// =============================================================================
import {
  PreprocessingConfig,
  PreprocessingScore,
  AlgorithmType,
  ColumnInfo,
} from "@/types";

function gradeFromScore(score: number): PreprocessingScore["grade"] {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 45) return "D";
  return "F";
}

export function computePreprocessingScore(
  config: PreprocessingConfig,
  allColumns: ColumnInfo[],
  algorithm: AlgorithmType
): PreprocessingScore {
  const tips: string[] = [];
  let featureScore = 50;
  let scalingScore = 50;
  let outlierScore = 50;
  let archScore = 75; // default (no arch needed for non-NN)

  // ── Feature selection ──────────────────────────────────────────────────────
  const nonTargetCols = allColumns.filter((c) => !c.isTarget);
  const selected = config.selectedFeatures;
  const highImportanceKept = nonTargetCols
    .filter((c) => c.importance >= 0.5)
    .filter((c) => selected.includes(c.id)).length;
  const highImportanceTotal = nonTargetCols.filter((c) => c.importance >= 0.5).length;
  const lowImportanceDropped = nonTargetCols
    .filter((c) => c.importance < 0.25)
    .filter((c) => !selected.includes(c.id)).length;
  const highMissingDropped = nonTargetCols
    .filter((c) => c.missingPct > 50)
    .filter((c) => !selected.includes(c.id)).length;

  featureScore = 30;
  if (highImportanceTotal > 0) featureScore += (highImportanceKept / highImportanceTotal) * 40;
  featureScore += lowImportanceDropped * 8;
  featureScore += highMissingDropped * 10;
  if (selected.length === 0) featureScore = 0;
  featureScore = Math.min(100, featureScore);

  if (highImportanceTotal > 0 && highImportanceKept < highImportanceTotal)
    tips.push("Keep high-importance features — you're dropping useful signal.");
  if (lowImportanceDropped < nonTargetCols.filter((c) => c.importance < 0.25).length)
    tips.push("Remove low-importance features (<25%) to reduce noise.");
  if (highMissingDropped < nonTargetCols.filter((c) => c.missingPct > 50).length)
    tips.push("Drop columns with >50% missing values — they hurt more than help.");

  // ── Scaling (Standardization + Normalization) ─────────────────────────────
  const needsScaling = ["svm", "neural_net", "logistic_regression"].includes(algorithm);
  const hasHighSkew = nonTargetCols.some(
    (c) => c.stats?.skewness === "high" && selected.includes(c.id)
  );

  scalingScore = 40;

  // Standardization scoring
  if (needsScaling) {
    if (config.standardization === "standard") scalingScore += 30;
    else if (config.standardization === "robust") scalingScore += 25;
    else tips.push(`${algorithm.toUpperCase()} performs much better with standardization (Z-score or Robust).`);
  } else {
    // Random Forest doesn't need scaling
    if (config.standardization !== "none") scalingScore += 10; // bonus for trying
    else scalingScore += 20;
  }

  // Normalization scoring
  if (hasHighSkew && config.normalization === "log") scalingScore += 20;
  else if (hasHighSkew && config.normalization === "sqrt") scalingScore += 15;
  else if (hasHighSkew && config.normalization === "none") {
    scalingScore += 5;
    tips.push("Some features are highly skewed — try Log or Sqrt normalization.");
  } else scalingScore += 10;

  scalingScore = Math.min(100, scalingScore);

  // ── Outlier handling ───────────────────────────────────────────────────────
  const outlierCols = nonTargetCols.filter(
    (c) => c.hasOutliers && selected.includes(c.id)
  );
  if (outlierCols.length === 0) {
    outlierScore = 90; // no outlier columns = no penalty
  } else {
    const configured = config.outlierConfigs.filter(
      (o) => o.strategy !== "keep"
    ).length;
    outlierScore = 30 + (configured / outlierCols.length) * 60;
    if (configured === 0)
      tips.push("You have outlier columns — consider clipping or imputing them.");
  }
  outlierScore = Math.min(100, outlierScore);

  // ── Network architecture (Neural Net only) ────────────────────────────────
  if (algorithm === "neural_net") {
    const layers = config.networkLayers;
    if (layers.length === 0) {
      archScore = 10;
      tips.push("Add at least 2 hidden layers to your neural network.");
    } else {
      archScore = 50;
      if (layers.length >= 2 && layers.length <= 6) archScore += 20;
      else if (layers.length > 8) {
        archScore -= 10;
        tips.push("Very deep networks can overfit — try 3–5 layers.");
      }
      const hasDropout = layers.some((l) => l.dropout > 0);
      if (hasDropout) archScore += 15;
      else tips.push("Add dropout to hidden layers to prevent overfitting.");
      const hasGoodActivation = layers.some((l) =>
        ["relu", "leaky_relu", "elu"].includes(l.activation)
      );
      if (hasGoodActivation) archScore += 15;
      else tips.push("ReLU or LeakyReLU activations usually work best.");
    }
    archScore = Math.min(100, Math.max(0, archScore));
  }

  const total = Math.round(
    featureScore * 0.3 +
    scalingScore * 0.3 +
    outlierScore * 0.2 +
    archScore * 0.2
  );

  // Convert score to accuracy multiplier: 0–100 → 0.72–1.18
  const accuracyModifier = 0.72 + (total / 100) * 0.46;

  return {
    total,
    grade: gradeFromScore(total),
    accuracyModifier,
    breakdown: {
      featureSelection: Math.round(featureScore),
      scaling: Math.round(scalingScore),
      outliers: Math.round(outlierScore),
      architecture: Math.round(archScore),
    },
    tips: tips.slice(0, 3),
  };
}

export function getDefaultPreprocessingConfig(
  columns: ColumnInfo[]
): PreprocessingConfig {
  return {
    selectedFeatures: columns
      .filter((c) => !c.isTarget && c.missingPct < 50 && c.importance > 0.1)
      .map((c) => c.id),
    standardization: "none",
    normalization: "none",
    outlierConfigs: columns
      .filter((c) => c.hasOutliers && !c.isTarget)
      .map((c) => ({ columnId: c.id, strategy: "keep" as const })),
    networkLayers: [
      { id: "l1", units: 128, activation: "relu", dropout: 0.2 },
      { id: "l2", units: 64, activation: "relu", dropout: 0.1 },
    ],
  };
}
