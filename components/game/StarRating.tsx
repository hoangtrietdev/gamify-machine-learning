// =============================================================================
// StarRating — 1-3 stars based on accuracy vs objective
// =============================================================================
import { keyframes } from "@emotion/react";
import { HStack, Text, VStack, Box, Icon, Badge } from "@chakra-ui/react";
import { FaStar, FaRegStar } from "react-icons/fa";
import { StarCount } from "@/types";

const popIn = keyframes`
  0% { transform: scale(0) rotate(-30deg); opacity: 0; }
  70% { transform: scale(1.3) rotate(5deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
`;

interface StarRatingProps {
  accuracy: number;
  objective: number;
}

function getStarCount(accuracy: number, objective: number): StarCount {
  // const ratio = accuracy / objective;
  if (accuracy >= objective * 1.05 || accuracy >= 80) return 3;
  if (accuracy >= objective * 0.95 || accuracy >= 75) return 2;
  if (accuracy >= objective * 0.80 || accuracy >= 65) return 1;
  return 0;
}

function getResultMessage(stars: StarCount, accuracy: number): { title: string; subtitle: string; color: string } {
  switch (stars) {
    case 3:
      return {
        title: "🏆 Perfect Run!",
        subtitle: "You've mastered this dataset. Legendary hyperparameter tuning!",
        color: "yellow.400",
      };
    case 2:
      return {
        title: "🥈 Great Result!",
        subtitle: "Solid performance. A bit more tuning could push you to 3 stars.",
        color: "cyan.400",
      };
    case 1:
      return {
        title: "🥉 Good Start!",
        subtitle: "You're on the right track. Try adjusting your learning rate or depth.",
        color: "orange.400",
      };
    default:
      return {
        title: "💡 Keep Training!",
        subtitle: "Your model needs more work. Try different algorithms or hyperparameters.",
        color: "red.400",
      };
  }
}

export function StarRating({ accuracy, objective }: StarRatingProps) {
  const stars = getStarCount(accuracy, objective);
  const message = getResultMessage(stars, accuracy);

  return (
    <VStack spacing={2} py={2} align="center">
      {/* Stars */}
      <HStack spacing={2}>
        {[1, 2, 3].map((n) => (
          <Box
            key={n}
            animation={n <= stars ? `${popIn} 0.5s ${(n - 1) * 0.15}s both ease-out` : undefined}
          >
            <Icon
              as={n <= stars ? FaStar : FaRegStar}
              boxSize={8}
              color={n <= stars ? "yellow.400" : "gray.700"}
              filter={n <= stars ? "drop-shadow(0 0 8px rgba(251,191,36,0.7))" : undefined}
            />
          </Box>
        ))}
      </HStack>

      {/* Accuracy badge */}
      <Badge
        px={3}
        py={0.5}
        borderRadius="full"
        fontSize="md"
        fontFamily="mono"
        fontWeight={900}
        bgGradient={stars >= 3 ? "linear(to-r, yellow.400, orange.400)" : "linear(to-r, neon.purple, neon.cyan)"}
        color="white"
        boxShadow={stars >= 3 ? "0 0 20px rgba(251,191,36,0.4)" : "0 0 20px rgba(139,92,246,0.4)"}
      >
        {accuracy.toFixed(2)}%
      </Badge>

      {/* Message */}
      <VStack spacing={0} textAlign="center">
        <Text fontSize="md" fontWeight={800} color={message.color}>
          {message.title}
        </Text>
        <Text fontSize="xs" color="gray.400" maxW="280px" lineHeight={1.4}>
          {message.subtitle}
        </Text>
      </VStack>

      {/* Stars legend */}
      <HStack spacing={6} pt={0.5}>
        {[
          { label: "≥70%", stars: 1 },
          { label: "≥80%", stars: 2 },
          { label: "≥90%", stars: 3 },
        ].map(({ label, stars: n }) => (
          <HStack key={n} spacing={1}>
            <Icon as={FaStar} boxSize={3} color={n <= stars ? "yellow.400" : "gray.700"} />
            <Text fontSize="10px" color="gray.600" fontFamily="mono">
              {label}
            </Text>
          </HStack>
        ))}
      </HStack>
    </VStack>
  );
}
