// =============================================================================
// components/ui/TourGuide.tsx — Interactive step-by-step product tour overlay
// =============================================================================
import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Text,
  Button,
  HStack,
  VStack,
  Icon,
  Flex,
  Badge,
  Portal,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaCompass,
  FaCheck,
  FaLightbulb,
} from "react-icons/fa";
import { UseTourReturn } from "@/hooks/useTour";

// ---------------------------------------------------------------------------
// Animations
// ---------------------------------------------------------------------------
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const pulseRing = keyframes`
  0%   { transform: scale(1);   opacity: 0.8; }
  70%  { transform: scale(1.6); opacity: 0; }
  100% { transform: scale(1.6); opacity: 0; }
`;

const shimmer = keyframes`
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
`;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface TourStep {
  /** CSS selector OR id (without #) of the element to highlight */
  targetId?: string;
  title: string;
  description: string;
  /** Emoji icon for the step */
  emoji?: string;
  /** Where to place the tooltip relative to the target */
  placement?: "top" | "bottom" | "left" | "right" | "center";
  /** Optional tip shown at the bottom of the card */
  tip?: string;
  /**
   * Optional: navigate the PreprocessingWizard to this step (1-4).
   * Pass 5 to show the Training Arena.
   */
  wizardStep?: number;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TourGuideProps {
  steps: TourStep[];
  tour: UseTourReturn;
  /** Called when the tour moves to a step that carries a wizardStep value */
  onStepChange?: (step: TourStep) => void;
}

// ---------------------------------------------------------------------------
// Highlight spotlight
// ---------------------------------------------------------------------------
function SpotlightOverlay({ rect }: { rect: Rect | null }) {
  if (!rect) {
    // Fullscreen dimmed overlay with no spotlight
    return (
      <Box
        position="fixed"
        inset={0}
        bg="rgba(5, 8, 18, 0.85)"
        zIndex={9990}
        pointerEvents="all"
      />
    );
  }

  const PAD = 10;
  const r = {
    top: rect.top - PAD,
    left: rect.left - PAD,
    width: rect.width + PAD * 2,
    height: rect.height + PAD * 2,
  };

  return (
    <>
      {/* Top overlay */}
      <Box
        position="fixed"
        top={0} left={0} right={0}
        height={`${r.top}px`}
        bg="rgba(5, 8, 18, 0.85)"
        zIndex={9990}
        pointerEvents="none"
      />
      {/* Bottom overlay */}
      <Box
        position="fixed"
        top={`${r.top + r.height}px`} left={0} right={0} bottom={0}
        bg="rgba(5, 8, 18, 0.85)"
        zIndex={9990}
        pointerEvents="none"
      />
      {/* Left overlay */}
      <Box
        position="fixed"
        top={`${r.top}px`} left={0}
        width={`${r.left}px`}
        height={`${r.height}px`}
        bg="rgba(5, 8, 18, 0.85)"
        zIndex={9990}
        pointerEvents="none"
      />
      {/* Right overlay */}
      <Box
        position="fixed"
        top={`${r.top}px`}
        left={`${r.left + r.width}px`}
        right={0}
        height={`${r.height}px`}
        bg="rgba(5, 8, 18, 0.85)"
        zIndex={9990}
        pointerEvents="none"
      />
      {/* Highlight ring */}
      <Box
        position="fixed"
        top={`${r.top}px`}
        left={`${r.left}px`}
        width={`${r.width}px`}
        height={`${r.height}px`}
        borderRadius="16px"
        border="2px solid"
        borderColor="neon.cyan"
        boxShadow="0 0 0 4px rgba(0,212,255,0.15), 0 0 40px rgba(0,212,255,0.2)"
        zIndex={9991}
        pointerEvents="none"
      />
      {/* Pulse ring */}
      <Box
        position="fixed"
        top={`${r.top}px`}
        left={`${r.left}px`}
        width={`${r.width}px`}
        height={`${r.height}px`}
        borderRadius="16px"
        border="2px solid"
        borderColor="neon.cyan"
        animation={`${pulseRing} 2s ease-out infinite`}
        zIndex={9991}
        pointerEvents="none"
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Progress dots
// ---------------------------------------------------------------------------
function ProgressDots({
  total,
  current,
  onGoTo,
}: {
  total: number;
  current: number;
  onGoTo: (i: number) => void;
}) {
  return (
    <HStack spacing={1.5} justify="center">
      {Array.from({ length: total }).map((_, i) => (
        <Box
          key={i}
          w={i === current ? "20px" : "6px"}
          h="6px"
          borderRadius="full"
          bg={
            i < current
              ? "neon.purple"
              : i === current
              ? "neon.cyan"
              : "dark.border"
          }
          cursor="pointer"
          onClick={() => onGoTo(i)}
          transition="all 0.3s ease"
          _hover={{ bg: i !== current ? "gray.500" : undefined }}
        />
      ))}
    </HStack>
  );
}

// ---------------------------------------------------------------------------
// Tooltip card positioning — with smart auto-flip
// ---------------------------------------------------------------------------
function computeCardPos(
  rect: Rect | null,
  placement: TourStep["placement"],
  cardW: number,
  cardH: number
): { top: number; left: number } {
  const MARGIN = 20;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1440;
  const vh = typeof window !== "undefined" ? window.innerHeight : 900;

  if (!rect || placement === "center") {
    return {
      top: (vh - cardH) / 2,
      left: (vw - cardW) / 2,
    };
  }

  const PAD = 10;
  const r = {
    top: rect.top - PAD,
    left: rect.left - PAD,
    width: rect.width + PAD * 2,
    height: rect.height + PAD * 2,
  };

  // Available space in each direction
  const spaceBelow = vh - (r.top + r.height);
  const spaceAbove = r.top;
  const spaceRight = vw - (r.left + r.width);
  const spaceLeft  = r.left;

  // Resolve preferred placement, auto-flip when there isn't enough room
  let resolved = placement;
  if (placement === "bottom" && spaceBelow < cardH + MARGIN * 2) {
    resolved = spaceAbove >= cardH + MARGIN * 2 ? "top" : "bottom";
  }
  if (placement === "top" && spaceAbove < cardH + MARGIN * 2) {
    resolved = spaceBelow >= cardH + MARGIN * 2 ? "bottom" : "top";
  }
  if (placement === "right" && spaceRight < cardW + MARGIN * 2) {
    resolved = spaceLeft >= cardW + MARGIN * 2 ? "left" : "right";
  }
  if (placement === "left" && spaceLeft < cardW + MARGIN * 2) {
    resolved = spaceRight >= cardW + MARGIN * 2 ? "right" : "left";
  }

  let top = 0;
  let left = 0;

  switch (resolved) {
    case "bottom":
      top  = r.top + r.height + MARGIN;
      left = r.left + r.width / 2 - cardW / 2;
      break;
    case "top":
      top  = r.top - cardH - MARGIN;
      left = r.left + r.width / 2 - cardW / 2;
      break;
    case "right":
      top  = r.top + r.height / 2 - cardH / 2;
      left = r.left + r.width + MARGIN;
      break;
    case "left":
      top  = r.top + r.height / 2 - cardH / 2;
      left = r.left - cardW - MARGIN;
      break;
    default:
      top  = r.top + r.height + MARGIN;
      left = r.left + r.width / 2 - cardW / 2;
  }

  // Clamp within viewport so the card is always fully visible
  left = Math.max(MARGIN, Math.min(left, vw - cardW - MARGIN));
  top  = Math.max(MARGIN, Math.min(top,  vh - cardH - MARGIN));

  return { top, left };
}

// ---------------------------------------------------------------------------
// Main TourGuide
// ---------------------------------------------------------------------------
export function TourGuide({ steps, tour, onStepChange }: TourGuideProps) {
  const { isOpen, currentStep, totalSteps, nextStep, prevStep, goToStep, completeTour, closeTour } = tour;
  const [rect, setRect] = useState<Rect | null>(null);
  const [key, setKey] = useState(0); // force re-animation
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardH, setCardH] = useState(300);

  const step = steps[currentStep];
  const CARD_W = 380;

  // Lock / unlock body scroll while tour is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Notify parent of step changes (for wizard navigation)
  useEffect(() => {
    if (!isOpen || !step) return;
    if (onStepChange) onStepChange(step);
  }, [isOpen, currentStep]); // eslint-disable-line react-hooks/exhaustive-deps

  // Measure actual card height after render
  useEffect(() => {
    if (cardRef.current) {
      setCardH(cardRef.current.offsetHeight);
    }
  });

  // Measure target element
  useEffect(() => {
    if (!isOpen) return;
    if (!step?.targetId) {
      setRect(null);
      setKey((k) => k + 1);
      return;
    }

    const measure = () => {
      const el = document.getElementById(step.targetId!);
      if (!el) {
        setRect(null);
        setKey((k) => k + 1);
        return;
      }

      // Scroll element into view — use 'nearest' to avoid pushing it
      // off-screen when the element is already partially visible.
      el.scrollIntoView({ block: "nearest", behavior: "smooth" });

      // Re-measure after the scroll animation settles
      setTimeout(() => {
        const r = el.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
        setKey((k) => k + 1);
      }, 400);
    };

    // Allow wizard state change + layout to settle before measuring
    const t = setTimeout(measure, 250);
    return () => clearTimeout(t);
  }, [isOpen, currentStep, step?.targetId]);

  if (!isOpen) return null;

  const pos = computeCardPos(rect, step?.placement, CARD_W, cardH);
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  return (
    <Portal>
      {/* Spotlight */}
      <SpotlightOverlay rect={rect} />

      {/* Tour card */}
      <Box
        key={key}
        ref={cardRef}
        position="fixed"
        top={`${pos.top}px`}
        left={`${pos.left}px`}
        width={`${CARD_W}px`}
        zIndex={9999}
        animation={`${fadeIn} 0.3s ease`}
        pointerEvents="all"
      >
        {/* Glassmorphism card */}
        <Box
          bg="rgba(15, 22, 41, 0.97)"
          border="1px solid"
          borderColor="neon.purple"
          borderRadius="2xl"
          boxShadow="0 0 40px rgba(139,92,246,0.25), 0 24px 60px rgba(0,0,0,0.6)"
          overflow="hidden"
        >
          {/* Shimmer top bar */}
          <Box
            h="3px"
            backgroundImage="linear-gradient(90deg, #8B5CF6 0%, #00D4FF 50%, #10F5A0 100%)"
            backgroundSize="200% 100%"
            animation={`${shimmer} 3s linear infinite`}
          />

          <VStack align="stretch" spacing={0} p={5}>
            {/* Header */}
            <Flex justify="space-between" align="flex-start" mb={3}>
              <HStack spacing={2}>
                <Flex
                  w={8}
                  h={8}
                  borderRadius="lg"
                  bg="rgba(139,92,246,0.15)"
                  border="1px solid"
                  borderColor="neon.purple"
                  align="center"
                  justify="center"
                  fontSize="lg"
                  flexShrink={0}
                >
                  {step?.emoji || "🎯"}
                </Flex>
                <Box>
                  <Badge
                    colorScheme="purple"
                    variant="subtle"
                    fontSize="9px"
                    letterSpacing="wider"
                    mb={0.5}
                  >
                    STEP {currentStep + 1} / {totalSteps}
                  </Badge>
                  <Text
                    fontSize="md"
                    fontWeight={800}
                    color="white"
                    lineHeight={1.2}
                  >
                    {step?.title}
                  </Text>
                </Box>
              </HStack>

              {/* Close */}
              <Box
                as="button"
                onClick={closeTour}
                color="gray.600"
                _hover={{ color: "gray.300" }}
                transition="color 0.2s"
                flexShrink={0}
                ml={2}
              >
                <Icon as={FaTimes} boxSize={3.5} />
              </Box>
            </Flex>

            {/* Description */}
            <Text
              fontSize="sm"
              color="gray.300"
              lineHeight={1.7}
              mb={step?.tip ? 3 : 4}
            >
              {step?.description}
            </Text>

            {/* Tip */}
            {step?.tip && (
              <HStack
                spacing={2}
                bg="rgba(251,191,36,0.08)"
                border="1px solid"
                borderColor="rgba(251,191,36,0.2)"
                borderRadius="lg"
                p={3}
                mb={4}
                align="flex-start"
              >
                <Icon as={FaLightbulb} color="yellow.400" boxSize={3} mt={0.5} flexShrink={0} />
                <Text fontSize="xs" color="yellow.300" lineHeight={1.6}>
                  {step.tip}
                </Text>
              </HStack>
            )}

            {/* Progress dots */}
            <ProgressDots
              total={totalSteps}
              current={currentStep}
              onGoTo={goToStep}
            />

            {/* Navigation buttons */}
            <HStack spacing={2} mt={4}>
              {!isFirst && (
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="gray"
                  leftIcon={<Icon as={FaChevronLeft} />}
                  onClick={prevStep}
                  borderColor="dark.border"
                  color="gray.400"
                  _hover={{ borderColor: "gray.500", color: "white" }}
                  flex={1}
                >
                  Back
                </Button>
              )}

              {isFirst && (
                <Button
                  size="sm"
                  variant="ghost"
                  color="gray.600"
                  onClick={completeTour}
                  flex={1}
                  _hover={{ color: "gray.400" }}
                  fontSize="xs"
                >
                  Skip tour
                </Button>
              )}

              <Button
                size="sm"
                flex={2}
                onClick={isLast ? completeTour : nextStep}
                rightIcon={
                  <Icon as={isLast ? FaCheck : FaChevronRight} />
                }
                bgGradient={
                  isLast
                    ? "linear(to-r, neon.green, neon.cyan)"
                    : "linear(to-r, neon.purple, neon.cyan)"
                }
                color="white"
                fontWeight={700}
                letterSpacing="wider"
                _hover={{
                  transform: "translateY(-1px)",
                  boxShadow: isLast
                    ? "0 0 20px rgba(16,245,160,0.4)"
                    : "0 0 20px rgba(139,92,246,0.4)",
                }}
                transition="all 0.2s"
              >
                {isLast ? "Let's Go!" : "Next"}
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Box>
    </Portal>
  );
}

// ---------------------------------------------------------------------------
// TourButton — floating help button to (re)start the tour
// ---------------------------------------------------------------------------
interface TourButtonProps {
  onStart: () => void;
}

export function TourButton({ onStart }: TourButtonProps) {
  return (
    <Box
      as="button"
      onClick={onStart}
      position="relative"
      display="flex"
      alignItems="center"
      gap={2}
      px={3}
      py={1.5}
      borderRadius="full"
      border="1px solid"
      borderColor="rgba(139,92,246,0.4)"
      bg="rgba(139,92,246,0.1)"
      color="neon.purple"
      fontSize="xs"
      fontWeight={700}
      letterSpacing="wider"
      cursor="pointer"
      transition="all 0.2s"
      _hover={{
        bg: "rgba(139,92,246,0.2)",
        borderColor: "neon.purple",
        boxShadow: "0 0 16px rgba(139,92,246,0.3)",
        transform: "translateY(-1px)",
      }}
    >
      <Icon as={FaCompass} boxSize={3} />
      <Text as="span" fontSize="xs" fontWeight={700} letterSpacing="wider">
        TOUR
      </Text>
    </Box>
  );
}
