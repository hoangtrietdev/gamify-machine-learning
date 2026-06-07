// =============================================================================
// useTraining — React Query mutation hook for the training simulation
// =============================================================================
import { useMutation } from "@tanstack/react-query";
import { useState, useCallback, useRef } from "react";
import { simulateTraining } from "@/services/api";
import { EpochResult, Hyperparameters, PreprocessingConfig, TrainingResult, Dataset } from "@/types";

export interface TrainingState {
  epochResults: EpochResult[];
  currentEpoch: number;
  currentAccuracy: number;
  isTraining: boolean;
  isComplete: boolean;
  result: TrainingResult | null;
  progress: number; // 0-100
}

const INITIAL_STATE: TrainingState = {
  epochResults: [],
  currentEpoch: 0,
  currentAccuracy: 0,
  isTraining: false,
  isComplete: false,
  result: null,
  progress: 0,
};

export interface TrainArgs {
  dataset: Dataset;
  hyperparameters: Hyperparameters;
  preprocessingConfig: PreprocessingConfig;
  preprocessingModifier: number;
}

export function useTraining() {
  const [state, setState] = useState<TrainingState>(INITIAL_STATE);
  const totalEpochsRef = useRef<number>(30);

  const handleEpoch = useCallback(
    (epochResult: EpochResult, idx: number) => {
      setState((prev) => ({
        ...prev,
        epochResults: [...prev.epochResults, epochResult],
        currentEpoch: epochResult.epoch,
        currentAccuracy: epochResult.accuracy,
        progress: Math.round(((idx + 1) / totalEpochsRef.current) * 100),
      }));
    },
    []
  );

  const mutation = useMutation<TrainingResult, Error, TrainArgs>({
    mutationFn: async ({ dataset, hyperparameters, preprocessingConfig, preprocessingModifier }: TrainArgs) => {
      totalEpochsRef.current = hyperparameters.epochs;
      setState({
        ...INITIAL_STATE,
        isTraining: true,
      });
      const result = await simulateTraining(
        dataset,
        hyperparameters,
        handleEpoch,
        preprocessingConfig,
        preprocessingModifier
      );
      return result;
    },
    onSuccess: (result) => {
      setState((prev) => ({
        ...prev,
        isTraining: false,
        isComplete: true,
        result,
        progress: 100,
      }));
    },
    onError: () => {
      setState((prev) => ({
        ...prev,
        isTraining: false,
        isComplete: false,
      }));
    },
  });

  const resetTraining = useCallback(() => {
    mutation.reset();
    setState(INITIAL_STATE);
  }, [mutation]);

  return {
    ...state,
    train: mutation.mutate,
    isError: mutation.isError,
    error: mutation.error,
    resetTraining,
  };
}
