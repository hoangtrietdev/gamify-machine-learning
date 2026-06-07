// =============================================================================
// Mock & Real Training API Service
// =============================================================================
import axios from "axios";
import * as tf from "@tensorflow/tfjs";
import {
  AlgorithmType, EpochResult, Hyperparameters, TrainingResult,
  PreprocessingConfig, Dataset, ColumnInfo
} from "@/types";

// Axios instance — swap baseURL for real Python backend in the future
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  timeout: 30000,
});

// ---------------------------------------------------------------------------
// Hyperparameter quality heuristics (0.0 – 1.0 score) for Mock Random Forest
// ---------------------------------------------------------------------------
function scoreHyperparameters(hp: Hyperparameters): number {
  let score = 0.5; // baseline

  if (hp.learningRate >= 0.001 && hp.learningRate <= 0.1) score += 0.15;
  else if (hp.learningRate < 0.0005 || hp.learningRate > 0.5) score -= 0.1;

  if (hp.maxDepth >= 4 && hp.maxDepth <= 12) score += 0.1;
  else if (hp.maxDepth > 18) score -= 0.05;

  if (hp.nEstimators >= 100) score += 0.1;
  else if (hp.nEstimators < 20) score -= 0.08;

  if (hp.regularization) score += 0.08;

  if (hp.algorithm === "neural_net" && hp.epochs >= 50) score += 0.05;
  if (hp.algorithm === "svm" && hp.kernel === "rbf") score += 0.05;
  if (hp.algorithm === "random_forest" && hp.nEstimators >= 200) score += 0.05;
  if (hp.algorithm === "knn") {
    if (hp.k >= 3 && hp.k <= 15) score += 0.1;
    if (hp.k % 2 !== 0) score += 0.05; // odd k is better to break ties
  }

  return Math.min(Math.max(score, 0.1), 1.0);
}

// ---------------------------------------------------------------------------
// Simulate epoch-by-epoch accuracy with noise + convergence curve (Random Forest fallback)
// ---------------------------------------------------------------------------
function generateEpochCurve(
  totalEpochs: number,
  peakAccuracy: number,
  startAccuracy: number = 30
): EpochResult[] {
  const results: EpochResult[] = [];

  for (let i = 1; i <= totalEpochs; i++) {
    const progress = i / totalEpochs;
    const base = startAccuracy + (peakAccuracy - startAccuracy) * Math.log1p(progress * (Math.E - 1));
    const noise = (Math.random() - 0.5) * (8 * (1 - progress * 0.8));
    const accuracy = Math.min(99, Math.max(20, base + noise));
    const lossBase = 2.5 * (1 - progress * 0.85);
    const loss = Math.max(0.05, lossBase + (Math.random() - 0.5) * 0.3);

    results.push({
      epoch: i,
      accuracy: parseFloat(accuracy.toFixed(2)),
      loss: parseFloat(loss.toFixed(4)),
    });
  }

  return results;
}

// ---------------------------------------------------------------------------
// Generate Synthetic Data based on the Dataset metadata for real TFJS training
// ---------------------------------------------------------------------------
function generateSyntheticData(
  dataset: Dataset, 
  config: PreprocessingConfig | undefined, 
  modifier: number
) {
  const n = Math.min(dataset.samples, 2000); // Max 2000 for client-side speed
  const features = dataset.columns.filter(
    (c) => !c.isTarget && (!config || config.selectedFeatures.includes(c.id))
  );
  
  if (features.length === 0) {
    throw new Error("No features selected for training.");
  }

  const X_arr: number[][] = [];
  const Y_arr: number[] = [];

  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    let signal = 0;
    
    features.forEach((f) => {
      // Box-Muller transform for normal distribution
      const u1 = Math.random(), u2 = Math.random();
      const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      const val = (f.stats?.mean || 0) + z * (f.stats?.std || 1);
      row.push(val);
      
      // Feature importance contributes to the signal
      signal += z * (f.importance || 0.1);
    });
    
    X_arr.push(row);
    
    // Target variable generation
    if (dataset.taskType === "classification") {
        // sigmoid
        const prob = 1 / (1 + Math.exp(-signal * modifier));
        let label = Math.random() < prob ? 1 : 0;
        
        // Inject noise: 15% of the time, the label is completely random.
        // This naturally caps the maximum achievable accuracy for the TFJS models to ~92.5%
        if (Math.random() < 0.15) {
            label = Math.random() < 0.5 ? 1 : 0;
        }
        Y_arr.push(label);
    } else {
        // Linear
        const noise = (Math.random() - 0.5) * 8; // add noise to regression
        Y_arr.push(signal * 10 * modifier + noise);
    }
  }

  const X = tf.tensor2d(X_arr, [n, features.length]);
  const Y = tf.tensor2d(Y_arr, [n, 1]);

  return { X, Y, featureCount: features.length };
}

// ---------------------------------------------------------------------------
// Main simulation/training function
// ---------------------------------------------------------------------------
export async function simulateTraining(
  dataset: Dataset,
  hyperparameters: Hyperparameters,
  onEpochComplete?: (result: EpochResult, epochIndex: number) => void,
  preprocessingConfig?: PreprocessingConfig,
  preprocessingModifier: number = 1.0
): Promise<TrainingResult> {
  const startTime = Date.now();

  // FALLBACK: Random Forest and KNN are simulated since TF.js doesn't natively support them well
  if (hyperparameters.algorithm === "random_forest" || hyperparameters.algorithm === "knn") {
    const quality = scoreHyperparameters(hyperparameters);
    
    // Scale accuracy: Base 40% + up to 45% based on hyperparameters (Max 85%)
    // Multiplied by preprocessing modifier (e.g. 1.1) yields a max of ~93.5%
    const rawAccuracy = 30 + quality * 45; 
    const finalAccuracy = parseFloat(
      Math.min(90, rawAccuracy * preprocessingModifier).toFixed(2)
    );
    const epochResults = generateEpochCurve(hyperparameters.epochs, finalAccuracy);
    const msPerEpoch = Math.max(80, 3000 / hyperparameters.epochs);

    await new Promise<void>((resolve) => {
      let i = 0;
      const interval = setInterval(() => {
        if (i >= epochResults.length) {
          clearInterval(interval);
          resolve();
          return;
        }
        onEpochComplete?.(epochResults[i], i);
        i++;
      }, msPerEpoch);
    });

    return {
      epochs: epochResults,
      finalAccuracy,
      trainingTime: Date.now() - startTime,
      algorithm: hyperparameters.algorithm,
      preprocessingScore: Math.round(preprocessingModifier * 100 - 72 + 50),
    };
  }

  // REAL TRAINING WITH TF.js (Neural Net, Logistic Regression, SVM Proxy)
  const { X, Y, featureCount } = generateSyntheticData(dataset, preprocessingConfig, preprocessingModifier);

  const model = tf.sequential();
  
  if (hyperparameters.algorithm === "neural_net") {
    // Map maxDepth to number of hidden layers (cap at 5)
    const layers = Math.min(Math.max(1, Math.floor(hyperparameters.maxDepth / 3)), 5);
    const units = hyperparameters.nEstimators ? Math.min(64, hyperparameters.nEstimators) : 32;
    
    for (let i = 0; i < layers; i++) {
        model.add(tf.layers.dense({
            units,
            activation: 'relu',
            inputShape: i === 0 ? [featureCount] : undefined,
            kernelRegularizer: hyperparameters.regularization ? tf.regularizers.l2({l2: 0.01}) : undefined
        }));
    }
    model.add(tf.layers.dense({ 
      units: 1, 
      activation: dataset.taskType === "classification" ? 'sigmoid' : 'linear' 
    }));
  } else if (hyperparameters.algorithm === "logistic_regression") {
    model.add(tf.layers.dense({
        units: 1, 
        activation: 'sigmoid', 
        inputShape: [featureCount],
        kernelRegularizer: hyperparameters.regularization ? tf.regularizers.l2({l2: 0.01}) : undefined
    }));
  } else if (hyperparameters.algorithm === "svm") {
    // Proxy SVM with linear activation + hinge loss
    model.add(tf.layers.dense({
        units: 1,
        activation: 'linear',
        inputShape: [featureCount],
        kernelRegularizer: tf.regularizers.l2({l2: 0.01})
    }));
  }

  const isClass = dataset.taskType === "classification";
  const lossFn = hyperparameters.algorithm === "svm" ? 'hinge' : (isClass ? 'binaryCrossentropy' : 'meanSquaredError');
  const lr = hyperparameters.learningRate || 0.01;
  const tfOptimizer = hyperparameters.optimizer === "rmsprop" 
    ? tf.train.rmsprop(lr)
    : hyperparameters.optimizer === "sgd"
    ? tf.train.sgd(lr)
    : tf.train.adam(lr);

  model.compile({
    optimizer: tfOptimizer,
    loss: lossFn,
    metrics: ['accuracy'],
  });

  // Convert labels to -1, 1 for SVM hinge loss
  const trainY = hyperparameters.algorithm === "svm" ? Y.mul(2).sub(1) : Y;

  const epochResults: EpochResult[] = [];
  
  await model.fit(X, trainY, {
    epochs: hyperparameters.epochs,
    batchSize: hyperparameters.batchSize || 32,
    callbacks: {
      onEpochEnd: async (epoch, logs) => {
        let acc = logs?.acc ?? logs?.accuracy ?? 0;
        let lss = logs?.loss ?? 0;
        
        // Proxy accuracy calculations if true accuracy isn't available
        if (!isClass && hyperparameters.algorithm !== "svm") {
           acc = Math.max(0, 1 - (lss / 100)); // Regression mock
        }
        if (hyperparameters.algorithm === "svm") {
           acc = Math.max(0, 1 - lss); // Hinge mock
        }
        
        acc = Math.min(100, Math.max(0, acc * 100));

        const res = {
           epoch: epoch + 1,
           accuracy: parseFloat(acc.toFixed(2)),
           loss: parseFloat(lss.toFixed(4)),
        };
        epochResults.push(res);
        onEpochComplete?.(res, epoch);
        
        // Yield thread so React UI updates smoothly
        await tf.nextFrame();
      }
    }
  });

  const finalAccuracy = epochResults.length > 0 ? epochResults[epochResults.length - 1].accuracy : 0;

  // Cleanup tensors to prevent memory leaks
  X.dispose();
  Y.dispose();
  if (trainY !== Y) trainY.dispose();
  model.dispose();

  return {
    epochs: epochResults,
    finalAccuracy,
    trainingTime: Date.now() - startTime,
    algorithm: hyperparameters.algorithm,
    preprocessingScore: Math.round(preprocessingModifier * 100 - 72 + 50),
  };
}

// ---------------------------------------------------------------------------
// Future: Real backend training endpoint
// ---------------------------------------------------------------------------
export async function trainModelReal(
  algorithm: AlgorithmType,
  hyperparameters: Hyperparameters
): Promise<TrainingResult> {
  const { data } = await apiClient.post<TrainingResult>("/api/train", {
    algorithm,
    hyperparameters,
  });
  return data;
}
