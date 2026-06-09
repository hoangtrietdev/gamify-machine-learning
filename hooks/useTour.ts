// =============================================================================
// hooks/useTour.ts — Tour state management with localStorage persistence
// =============================================================================
import { useState, useEffect, useCallback } from "react";

const TOUR_KEY = "ml-gamify-tour-completed";

export type TourPage = "home" | "play";

export interface UseTourReturn {
  isOpen: boolean;
  currentStep: number;
  totalSteps: number;
  hasSeenTour: boolean;
  startTour: () => void;
  closeTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  completeTour: () => void;
}

export function useTour(page: TourPage, totalSteps: number): UseTourReturn {
  const storageKey = `${TOUR_KEY}-${page}`;
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(true);

  // On mount: check if tour has been seen
  useEffect(() => {
    const seen = typeof window !== "undefined"
      ? localStorage.getItem(storageKey) === "true"
      : true;
    setHasSeenTour(seen);
    if (!seen) {
      // Small delay so the page content renders first
      const timer = setTimeout(() => setIsOpen(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [storageKey]);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsOpen(true);
  }, []);

  const closeTour = useCallback(() => {
    setIsOpen(false);
  }, []);

  const completeTour = useCallback(() => {
    setIsOpen(false);
    setHasSeenTour(true);
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, "true");
    }
  }, [storageKey]);

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      completeTour();
    }
  }, [currentStep, totalSteps, completeTour]);

  const prevStep = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.max(0, Math.min(step, totalSteps - 1)));
  }, [totalSteps]);

  return {
    isOpen,
    currentStep,
    totalSteps,
    hasSeenTour,
    startTour,
    closeTour,
    nextStep,
    prevStep,
    goToStep,
    completeTour,
  };
}
