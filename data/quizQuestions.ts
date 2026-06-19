// =============================================================================
// quizQuestions.ts — Question bank for post-training Knowledge Check
// Questions are keyed by topic so we can pick relevant ones based on user config
// =============================================================================

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  topic: "algorithm" | "scaling" | "outliers" | "features" | "general";
  /** Which config values trigger this question */
  triggers?: string[];
  question: string;
  options: QuizOption[];
  correctId: string;
  explanation: string;
}

// ---------------------------------------------------------------------------
// Algorithm questions
// ---------------------------------------------------------------------------
export const ALGORITHM_QUESTIONS: QuizQuestion[] = [
  {
    id: "alg_rf_why",
    topic: "algorithm",
    triggers: ["random_forest"],
    question: "What is the main advantage of Random Forest over a single Decision Tree?",
    options: [
      { id: "a", text: "It trains much faster on large datasets" },
      { id: "b", text: "It reduces overfitting by averaging many trees" },
      { id: "c", text: "It requires no feature scaling" },
      { id: "d", text: "It always achieves 100% training accuracy" },
    ],
    correctId: "b",
    explanation:
      "Random Forest builds many trees on random subsets of data and features, then averages their predictions. This ensemble approach reduces variance and overfitting compared to a single tree.",
  },
  {
    id: "alg_rf_features",
    topic: "algorithm",
    triggers: ["random_forest"],
    question: "Random Forest is generally robust to which of the following?",
    options: [
      { id: "a", text: "Missing values in the target column" },
      { id: "b", text: "Un-scaled features (different value ranges)" },
      { id: "c", text: "Very high dimensionality with no feature selection" },
      { id: "d", text: "Extremely noisy labels" },
    ],
    correctId: "b",
    explanation:
      "Decision tree-based models like Random Forest split on thresholds, not distances, so feature scaling doesn't affect them. Unlike distance-based models (KNN, SVM), you can skip normalization.",
  },
  {
    id: "alg_svm_kernel",
    topic: "algorithm",
    triggers: ["svm"],
    question: "What does the RBF kernel in SVM allow the model to do?",
    options: [
      { id: "a", text: "Train faster on large datasets" },
      { id: "b", text: "Classify data that is not linearly separable" },
      { id: "c", text: "Automatically select the best features" },
      { id: "d", text: "Handle missing values internally" },
    ],
    correctId: "b",
    explanation:
      "The Radial Basis Function (RBF) kernel maps data into a higher-dimensional space, allowing SVM to find non-linear decision boundaries. This is essential when classes are not linearly separable.",
  },
  {
    id: "alg_svm_scaling",
    topic: "algorithm",
    triggers: ["svm"],
    question: "Why is feature scaling critical when using SVM?",
    options: [
      { id: "a", text: "SVM uses gradient descent which needs normalized inputs" },
      { id: "b", text: "SVM computes distances between points, so features with large ranges dominate" },
      { id: "c", text: "SVM cannot handle categorical features without scaling" },
      { id: "d", text: "Scaling prevents the kernel trick from breaking" },
    ],
    correctId: "b",
    explanation:
      "SVM maximizes the margin between classes based on distances. Features with large scales (e.g., income in thousands vs. age in tens) will dominate the margin calculation, leading to biased models.",
  },
  {
    id: "alg_lr_regularization",
    topic: "algorithm",
    triggers: ["logistic_regression"],
    question: "What does regularization do in Logistic Regression?",
    options: [
      { id: "a", text: "It increases training speed by reducing the dataset" },
      { id: "b", text: "It penalizes large coefficients to reduce overfitting" },
      { id: "c", text: "It normalizes the output probabilities to sum to 1" },
      { id: "d", text: "It automatically removes correlated features" },
    ],
    correctId: "b",
    explanation:
      "Regularization adds a penalty term to the loss function for large weights. This discourages the model from fitting noise in training data, improving generalization to unseen data.",
  },
  {
    id: "alg_knn_k",
    topic: "algorithm",
    triggers: ["knn"],
    question: "What happens if you set K too small in KNN?",
    options: [
      { id: "a", text: "The model underfits and ignores patterns" },
      { id: "b", text: "Training becomes very slow" },
      { id: "c", text: "The model overfits, highly sensitive to noise" },
      { id: "d", text: "The decision boundary becomes linear" },
    ],
    correctId: "c",
    explanation:
      "A very small K (e.g., K=1) means the model just looks at the single nearest neighbor, making it extremely sensitive to noisy data points. Larger K smooths the boundary but may underfit.",
  },
  {
    id: "alg_nn_layers",
    topic: "algorithm",
    triggers: ["neural_net"],
    question: "What is the risk of adding too many layers to a neural network?",
    options: [
      { id: "a", text: "The model trains faster but is less accurate" },
      { id: "b", text: "The network may overfit and require more data to generalize" },
      { id: "c", text: "Activation functions stop working beyond 3 layers" },
      { id: "d", text: "Dropout becomes mandatory" },
    ],
    correctId: "b",
    explanation:
      "Deeper networks have more parameters and can memorize training data (overfit) if you don't have enough training samples or regularization. More layers aren't always better.",
  },
];

// ---------------------------------------------------------------------------
// Scaling questions
// ---------------------------------------------------------------------------
export const SCALING_QUESTIONS: QuizQuestion[] = [
  {
    id: "scale_standard",
    topic: "scaling",
    triggers: ["standard"],
    question: "What does StandardScaler (Z-score normalization) transform your data to?",
    options: [
      { id: "a", text: "Values between 0 and 1" },
      { id: "b", text: "Zero mean and unit variance" },
      { id: "c", text: "Log-transformed values" },
      { id: "d", text: "Rank-ordered values" },
    ],
    correctId: "b",
    explanation:
      "StandardScaler subtracts the mean and divides by the standard deviation: z = (x - μ) / σ. The result has mean = 0 and std = 1. Useful for algorithms sensitive to feature scale like SVM and Logistic Regression.",
  },
  {
    id: "scale_robust",
    topic: "scaling",
    triggers: ["robust"],
    question: "When should you prefer RobustScaler over StandardScaler?",
    options: [
      { id: "a", text: "When your data is perfectly normally distributed" },
      { id: "b", text: "When your dataset has significant outliers" },
      { id: "c", text: "When you're using a Random Forest" },
      { id: "d", text: "When all features are categorical" },
    ],
    correctId: "b",
    explanation:
      "RobustScaler uses the median and IQR instead of mean and std, making it resistant to outliers. StandardScaler's mean/std can be heavily distorted by extreme values.",
  },
  {
    id: "scale_minmax",
    topic: "scaling",
    triggers: ["minmax"],
    question: "What is the disadvantage of Min-Max scaling?",
    options: [
      { id: "a", text: "It changes the distribution shape" },
      { id: "b", text: "It is very sensitive to outliers" },
      { id: "c", text: "It cannot handle negative values" },
      { id: "d", text: "It only works for binary features" },
    ],
    correctId: "b",
    explanation:
      "Min-Max scaling uses (x - min) / (max - min). If there's one extreme outlier, it compresses all other values into a tiny range, losing information. RobustScaler handles this better.",
  },
  {
    id: "scale_log",
    topic: "scaling",
    triggers: ["log"],
    question: "Log transformation is most useful for which type of distribution?",
    options: [
      { id: "a", text: "Normally distributed features" },
      { id: "b", text: "Right-skewed features with a long tail" },
      { id: "c", text: "Binary features (0 or 1)" },
      { id: "d", text: "Features with many zero values" },
    ],
    correctId: "b",
    explanation:
      "Log transformation compresses large values and expands small ones, pulling a right-skewed distribution towards normality. It's commonly used for income, price, and count data.",
  },
];

// ---------------------------------------------------------------------------
// Outlier questions
// ---------------------------------------------------------------------------
export const OUTLIER_QUESTIONS: QuizQuestion[] = [
  {
    id: "out_clip",
    topic: "outliers",
    triggers: ["clip"],
    question: "What does 'clipping' outliers mean?",
    options: [
      { id: "a", text: "Removing rows with outlier values from the dataset" },
      { id: "b", text: "Replacing outliers with the median value" },
      { id: "c", text: "Capping values at a defined threshold (e.g., 3 std from mean)" },
      { id: "d", text: "Transforming outliers with a log function" },
    ],
    correctId: "c",
    explanation:
      "Clipping caps extreme values at a threshold (e.g., 3 standard deviations). Values beyond the cap are set to the cap value. This preserves the row but limits the outlier's influence.",
  },
  {
    id: "out_remove",
    topic: "outliers",
    triggers: ["remove"],
    question: "What is the main risk of removing outliers from your dataset?",
    options: [
      { id: "a", text: "The model will train faster but less accurately" },
      { id: "b", text: "You may remove legitimate rare events the model needs to learn" },
      { id: "c", text: "The remaining data will no longer be numeric" },
      { id: "d", text: "Scaling becomes impossible without outliers" },
    ],
    correctId: "b",
    explanation:
      "Removing outliers can eliminate rare but important cases. For fraud detection or medical data, outliers may be exactly the signals you want to detect. Always consider the domain context.",
  },
  {
    id: "out_impute",
    topic: "outliers",
    triggers: ["impute_median"],
    question: "Why use median instead of mean for outlier imputation?",
    options: [
      { id: "a", text: "Median is always larger than mean" },
      { id: "b", text: "Mean is not defined for skewed data" },
      { id: "c", text: "Median is robust to extreme values and not pulled by outliers" },
      { id: "d", text: "Imputing with mean causes data leakage" },
    ],
    correctId: "c",
    explanation:
      "The median is the middle value, unaffected by extremes. If income values are mostly $50k but one person earns $10M, the mean is skewed upward while the median remains representative.",
  },
  {
    id: "out_keep",
    topic: "outliers",
    triggers: ["keep"],
    question: "When is it appropriate to KEEP outliers in your dataset?",
    options: [
      { id: "a", text: "When your model cannot handle large values" },
      { id: "b", text: "When the outliers represent real, meaningful variation you want to model" },
      { id: "c", text: "Only when using tree-based models" },
      { id: "d", text: "When the dataset has fewer than 1000 rows" },
    ],
    correctId: "b",
    explanation:
      "If outliers are genuine data points (not errors), removing them could make your model blind to important patterns. Tree-based models are naturally robust to outliers, so keeping them is often fine.",
  },
];

// ---------------------------------------------------------------------------
// Feature selection questions
// ---------------------------------------------------------------------------
export const FEATURE_QUESTIONS: QuizQuestion[] = [
  {
    id: "feat_too_many",
    topic: "features",
    question: "What is the 'curse of dimensionality'?",
    options: [
      { id: "a", text: "Too many samples makes training very slow" },
      { id: "b", text: "Adding more features can make the model worse if they are irrelevant" },
      { id: "c", text: "High-dimensional data cannot be split into train/test sets" },
      { id: "d", text: "Models with many features always overfit" },
    ],
    correctId: "b",
    explanation:
      "As you add more features, the data becomes sparser in high-dimensional space. Many ML algorithms require exponentially more data to maintain the same density, and irrelevant features add noise.",
  },
  {
    id: "feat_importance",
    topic: "features",
    question: "Why is feature importance a useful guide when selecting features?",
    options: [
      { id: "a", text: "It tells you exactly which features cause the target variable" },
      { id: "b", text: "It estimates how much each feature contributes to model predictions" },
      { id: "c", text: "It removes correlated features automatically" },
      { id: "d", text: "It guarantees the selected features are optimal" },
    ],
    correctId: "b",
    explanation:
      "Feature importance scores (from models like Random Forest) show which features contribute most to predictions. High-importance features are good candidates to keep, but causation shouldn't be assumed.",
  },
  {
    id: "feat_correlated",
    topic: "features",
    question: "What problem can arise from including two highly correlated features?",
    options: [
      { id: "a", text: "The model will assign them both zero importance" },
      { id: "b", text: "Multicollinearity can make model coefficients unstable and hard to interpret" },
      { id: "c", text: "Training will fail with an error" },
      { id: "d", text: "The features will cancel each other out in prediction" },
    ],
    correctId: "b",
    explanation:
      "Highly correlated features carry redundant information. In linear models, this leads to multicollinearity, making coefficients unstable. Tree models are less affected but still have split redundancy.",
  },
];

// ---------------------------------------------------------------------------
// General ML questions
// ---------------------------------------------------------------------------
export const GENERAL_QUESTIONS: QuizQuestion[] = [
  {
    id: "gen_overfit",
    topic: "general",
    question: "What is the main sign that a model is overfitting?",
    options: [
      { id: "a", text: "High training accuracy but low test/validation accuracy" },
      { id: "b", text: "Low training accuracy and low test accuracy" },
      { id: "c", text: "Training accuracy equal to test accuracy" },
      { id: "d", text: "Very slow training time" },
    ],
    correctId: "a",
    explanation:
      "Overfitting means the model memorized the training data but fails to generalize. The gap between training accuracy (high) and test accuracy (low) is the key diagnostic signal.",
  },
  {
    id: "gen_bias_variance",
    topic: "general",
    question: "A model that consistently makes the same wrong prediction has high...",
    options: [
      { id: "a", text: "Variance" },
      { id: "b", text: "Bias" },
      { id: "c", text: "Entropy" },
      { id: "d", text: "Regularization" },
    ],
    correctId: "b",
    explanation:
      "High bias means the model consistently misses the target in the same direction — it has made wrong assumptions. High variance means predictions vary wildly with small changes in training data.",
  },
];

// ---------------------------------------------------------------------------
// Question selector — pick relevant questions based on user's config
// ---------------------------------------------------------------------------
export function selectQuizQuestions(params: {
  algorithm: string;
  standardization: string;
  normalization: string;
  outlierStrategies: string[];
  featureCount: number;
  totalFeatures: number;
  count?: number;
}): QuizQuestion[] {
  const { algorithm, standardization, normalization, outlierStrategies, featureCount, totalFeatures, count = 5 } = params;

  const pool: QuizQuestion[] = [];

  // Algorithm questions
  const algQs = ALGORITHM_QUESTIONS.filter(
    (q) => !q.triggers || q.triggers.includes(algorithm)
  );
  pool.push(...algQs.slice(0, 2));

  // Scaling questions
  const scalingTriggers = [standardization, normalization].filter((s) => s !== "none");
  if (scalingTriggers.length > 0) {
    const scaleQs = SCALING_QUESTIONS.filter(
      (q) => !q.triggers || q.triggers.some((t) => scalingTriggers.includes(t))
    );
    pool.push(...scaleQs.slice(0, 1));
  }

  // Outlier questions
  const uniqueStrategies = [...new Set(outlierStrategies)].filter((s) => s !== "keep");
  if (uniqueStrategies.length > 0) {
    const outQs = OUTLIER_QUESTIONS.filter(
      (q) => !q.triggers || q.triggers.some((t) => outlierStrategies.includes(t))
    );
    pool.push(...outQs.slice(0, 1));
  } else {
    // User kept outliers — ask about that
    const keepQ = OUTLIER_QUESTIONS.find((q) => q.triggers?.includes("keep"));
    if (keepQ) pool.push(keepQ);
  }

  // Feature selection question if they selected a small or large subset
  if (featureCount < totalFeatures * 0.5 || featureCount > totalFeatures * 0.8) {
    pool.push(...FEATURE_QUESTIONS.slice(0, 1));
  }

  // General questions to fill up
  pool.push(...GENERAL_QUESTIONS);

  // Deduplicate and slice to count
  const seen = new Set<string>();
  const unique = pool.filter((q) => {
    if (seen.has(q.id)) return false;
    seen.add(q.id);
    return true;
  });

  return unique.slice(0, count);
}
