// =============================================================================
// data/tourSteps.ts — Step definitions for each page tour
// =============================================================================
import { TourStep } from "@/components/ui/TourGuide";

// ---------------------------------------------------------------------------
// Home page tour
// ---------------------------------------------------------------------------
export const HOME_TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to ML Hyper-Trainer! 🎮",
    emoji: "🧠",
    description:
      "This is an interactive playground where you learn machine learning by doing, no coding required.",
    placement: "center",
    tip: "The tour auto-saves your progress. You can replay it anytime.",
  },
  {
    targetId: "tour-difficulty-beginner",
    title: "Difficulty Levels",
    emoji: "🎯",
    description:
      "Challenges are grouped into three difficulty levels — Beginner, Intermediate, and Expert.",
    placement: "bottom",
    tip: "Start with a Beginner dataset to get familiar!",
  },
  {
    targetId: "tour-dataset-card-0",
    title: "Dataset Cards",
    emoji: "📊",
    description:
      "Each card represents a real-world ML dataset. You'll see the number of features, sample size, and the accuracy target you need to hit to earn ⭐⭐⭐ stars. Click a card to start the challenge!",
    placement: "bottom",
  },
  {
    targetId: "tour-feature-pills",
    title: "What You'll Learn",
    emoji: "⚡",
    description:
      "The app covers four core ML skills: live training simulation, interactive hyperparameter tuning, a star-rating system to track performance, and real dataset exploration.",
    placement: "bottom",
    tip: "Hyperparameter tuning is one of the most important real-world ML skills. Here you'll develop intuition for it through experimentation.",
  },
];

// ---------------------------------------------------------------------------
// Play page tour
// ---------------------------------------------------------------------------
export const PLAY_TOUR_STEPS: TourStep[] = [
  {
    title: "The Training Arena 🏟️",
    emoji: "🏟️",
    description:
      "This is where the action happens! You'll go through a 4-step preprocessing pipeline, then tune hyperparameters and train your model. Let's walk through each section.",
    placement: "center",
  },
  {
    targetId: "tour-preprocessing-stepper",
    title: "Step 1 — Preprocessing Pipeline",
    emoji: "🔧",
    description:
      "Before training, you need to prepare your data. The wizard guides you through 4 steps: Data Preview → Feature Selection → Scaling & Normalization → (Architecture for Neural Nets) → Training.",
    placement: "bottom",
    tip: "Your preprocessing choices directly affect model accuracy. A better pipeline = a higher score modifier!",
    wizardStep: 1,
  },
  {
    targetId: "tour-data-preview",
    title: "Step 1 — Data Preview",
    emoji: "🔍",
    description:
      "Explore the dataset — examine column types, distributions, missing values, and correlations. Understanding your data is the foundation of any successful ML project.",
    placement: "bottom",
    wizardStep: 1,
  },
  {
    targetId: "tour-feature-selection",
    title: "Step 2 — Feature Selection",
    emoji: "🎛️",
    description:
      "Choose which features (columns) to include in training. Irrelevant or noisy features can hurt performance. At least 2 features must be selected to proceed.",
    placement: "bottom",
    tip: "Select features correlated with the target label, and drop ones that are purely IDs or near-constant.",
    wizardStep: 2,
  },
  {
    targetId: "tour-scaling-panel",
    title: "Step 3 — Scaling & Normalization",
    emoji: "⚖️",
    description:
      "Standardize numerical features and encode categorical ones. Proper scaling is critical — especially for distance-based algorithms like KNN and SVM.",
    placement: "bottom",
    wizardStep: 3,
  },
  {
    targetId: "tour-pipeline-score",
    title: "Pipeline Score",
    emoji: "🏆",
    description:
      "Your preprocessing choices are scored in real-time across four dimensions: Features, Scaling, Outliers, and Architecture. A higher score gives you an accuracy multiplier at training time!",
    placement: "left",
    tip: "Aim for a grade of A or B to get the best accuracy boost. The score updates live as you change settings.",
    wizardStep: 3,
  },
  {
    targetId: "tour-hyperparameter-panel",
    title: "Hyperparameter Tuning",
    emoji: "🎚️",
    description:
      "Pick your ML algorithm (Random Forest, Neural Net, SVM, etc.) and tune its hyperparameters — learning rate, depth, epochs, regularization, and more. Each choice has a real effect on training!",
    placement: "left",
    tip: "Random Forest is a great default. Neural Networks can achieve the highest accuracy but need more careful tuning.",
    wizardStep: 5,
  },
  {
    targetId: "tour-training-panel",
    title: "Training Arena",
    emoji: "⚡",
    description:
      "Hit TRAIN MODEL to start! Watch live metrics — epoch count, accuracy, and loss — update in real-time. When complete, you'll receive a star rating based on how close you got to the target accuracy.",
    placement: "left",
    tip: "You can retrain with different hyperparameters as many times as you want. Experiment freely!",
    wizardStep: 5,
  },
  {
    title: "You're Ready! 🚀",
    emoji: "🚀",
    description:
      "That covers everything! Start by exploring the dataset, make smart preprocessing decisions, tune your hyperparameters, and shoot for ⭐⭐⭐ accuracy. Good luck, and have fun learning ML!",
    placement: "center",
    wizardStep: 1,
  },
];
