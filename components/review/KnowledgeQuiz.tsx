// =============================================================================
// KnowledgeQuiz — MCQ quiz engine for post-training review
// =============================================================================
import { useState } from "react";
import { keyframes } from "@emotion/react";
import {
  Box, VStack, HStack, Text, Icon, Badge, Button, Progress,
  SimpleGrid, Fade, Collapse,
} from "@chakra-ui/react";
import {
  FaBrain, FaCheck, FaTimes, FaChevronRight,
} from "react-icons/fa";
import { QuizQuestion } from "@/data/quizQuestions";

const popIn = keyframes`
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-6px); }
  40%       { transform: translateX(6px); }
  60%       { transform: translateX(-4px); }
  80%       { transform: translateX(4px); }
`;

interface KnowledgeQuizProps {
  questions: QuizQuestion[];
  onComplete: (score: number, total: number, wrongTopics: string[]) => void;
}

interface AnswerState {
  selected: string | null;
  isCorrect: boolean | null;
}

export function KnowledgeQuiz({ questions, onComplete }: KnowledgeQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerState[]>(
    questions.map(() => ({ selected: null, isCorrect: null }))
  );
  const [showExplanation, setShowExplanation] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const current = questions[currentIndex];
  const currentAnswer = answers[currentIndex];
  const hasAnswered = currentAnswer.selected !== null;
  const isLast = currentIndex === questions.length - 1;

  const correctCount = answers.filter((a) => a.isCorrect).length;
  const wrongTopics = questions
    .filter((_, i) => answers[i].isCorrect === false)
    .map((q) => q.topic);

  const handleSelect = (optionId: string) => {
    if (hasAnswered) return;
    const isCorrect = optionId === current.correctId;
    const newAnswers = [...answers];
    newAnswers[currentIndex] = { selected: optionId, isCorrect };
    setAnswers(newAnswers);
    setShowExplanation(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (isLast) {
      setIsFinished(true);
      const finalCorrect = answers.filter((a) => a.isCorrect).length;
      const finalWrong = questions
        .filter((_, i) => answers[i].isCorrect === false)
        .map((q) => q.topic);
      onComplete(finalCorrect, questions.length, finalWrong);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const getOptionStyle = (optId: string) => {
    if (!hasAnswered) {
      return {
        bg: "dark.panel",
        borderColor: "dark.border",
        color: "gray.300",
        cursor: "pointer",
        _hover: { borderColor: "neon.cyan", color: "white", bg: "whiteAlpha.50" },
      };
    }
    if (optId === current.correctId) {
      return {
        bg: "rgba(72,199,116,0.15)",
        borderColor: "green.400",
        color: "green.300",
        cursor: "default",
        _hover: {},
      };
    }
    if (optId === currentAnswer.selected) {
      return {
        bg: "rgba(252,129,74,0.15)",
        borderColor: "red.400",
        color: "red.300",
        cursor: "default",
        animation: `${shake} 0.4s ease`,
        _hover: {},
      };
    }
    return {
      bg: "dark.panel",
      borderColor: "dark.border",
      color: "gray.600",
      cursor: "default",
      opacity: 0.5,
      _hover: {},
    };
  };

  if (isFinished) {
    return null; // Parent handles the finished state via onComplete callback
  }

  return (
    <Box>
      {/* Section header */}
      <HStack spacing={3} mb={6}>
        <Box
          w={10} h={10} borderRadius="xl"
          bgGradient="linear(to-br, cyan.600, blue.700)"
          display="flex" alignItems="center" justifyContent="center"
          boxShadow="0 0 20px rgba(0,212,255,0.4)"
        >
          <Icon as={FaBrain} color="white" boxSize={4} />
        </Box>
        <Box flex={1}>
          <Text fontSize="xl" fontWeight={900} color="white">
            Knowledge Check
          </Text>
          <Text fontSize="sm" color="gray.500">
            Test your understanding of the choices you made.
          </Text>
        </Box>
        <Badge
          colorScheme="cyan"
          variant="subtle"
          fontSize="sm"
          px={3}
          py={1}
          borderRadius="full"
          fontFamily="mono"
        >
          {currentIndex + 1} / {questions.length}
        </Badge>
      </HStack>

      {/* Progress bar */}
      <Progress
        value={((currentIndex) / questions.length) * 100}
        colorScheme="cyan"
        borderRadius="full"
        h="6px"
        bg="dark.border"
        mb={6}
        transition="all 0.3s"
      />

      {/* Question card */}
      <Box
        key={currentIndex}
        animation={`${popIn} 0.3s ease`}
        bg="dark.card"
        border="1px solid"
        borderColor="dark.border"
        borderRadius="2xl"
        p={6}
        mb={4}
      >
        <HStack spacing={2} mb={4}>
          <Badge
            colorScheme={
              current.topic === "algorithm" ? "purple" :
              current.topic === "scaling" ? "cyan" :
              current.topic === "outliers" ? "orange" :
              current.topic === "features" ? "green" : "gray"
            }
            variant="subtle"
            fontSize="10px"
            textTransform="uppercase"
            letterSpacing="wider"
          >
            {current.topic}
          </Badge>
        </HStack>

        <Text fontSize="md" fontWeight={700} color="white" mb={5} lineHeight={1.6}>
          {current.question}
        </Text>

        {/* Options */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
          {current.options.map((opt) => {
            const style = getOptionStyle(opt.id);
            const isSelected = currentAnswer.selected === opt.id;
            const isCorrectOpt = opt.id === current.correctId;

            return (
              <Box
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                border="1px solid"
                borderRadius="xl"
                p={4}
                transition="all 0.2s"
                position="relative"
                {...style}
              >
                <HStack spacing={3} align="flex-start">
                  <Box
                    w={6} h={6} borderRadius="full"
                    bg={hasAnswered && isCorrectOpt ? "green.500" :
                        hasAnswered && isSelected && !isCorrectOpt ? "red.500" :
                        "dark.border"}
                    border="2px solid"
                    borderColor={hasAnswered && isCorrectOpt ? "green.400" :
                                hasAnswered && isSelected ? "red.400" : "dark.border"}
                    display="flex" alignItems="center" justifyContent="center"
                    flexShrink={0}
                    mt={0.5}
                    transition="all 0.2s"
                  >
                    {hasAnswered && isCorrectOpt && <Icon as={FaCheck} boxSize={2.5} color="white" />}
                    {hasAnswered && isSelected && !isCorrectOpt && <Icon as={FaTimes} boxSize={2.5} color="white" />}
                    {!hasAnswered && (
                      <Text fontSize="10px" fontWeight={700} color="gray.500">
                        {opt.id.toUpperCase()}
                      </Text>
                    )}
                  </Box>
                  <Text fontSize="sm" lineHeight={1.5} fontWeight={500}>
                    {opt.text}
                  </Text>
                </HStack>
              </Box>
            );
          })}
        </SimpleGrid>
      </Box>

      {/* Explanation */}
      <Collapse in={showExplanation} animateOpacity>
        <Box
          bg={currentAnswer.isCorrect ? "rgba(72,199,116,0.08)" : "rgba(252,129,74,0.08)"}
          border="1px solid"
          borderColor={currentAnswer.isCorrect ? "green.700" : "orange.700"}
          borderRadius="2xl"
          p={4}
          mb={4}
        >
          <HStack spacing={2} mb={2}>
            <Icon
              as={currentAnswer.isCorrect ? FaCheck : FaTimes}
              color={currentAnswer.isCorrect ? "green.400" : "orange.400"}
              boxSize={3.5}
            />
            <Text
              fontSize="sm"
              fontWeight={700}
              color={currentAnswer.isCorrect ? "green.400" : "orange.400"}
            >
              {currentAnswer.isCorrect ? "Correct!" : "Not quite."}
            </Text>
          </HStack>
          <Text fontSize="sm" color="gray.300" lineHeight={1.7}>
            {current.explanation}
          </Text>
        </Box>
      </Collapse>

      {/* Next button */}
      {hasAnswered && (
        <Fade in>
          <Button
            rightIcon={<Icon as={FaChevronRight} />}
            colorScheme="cyan"
            variant="outline"
            onClick={handleNext}
            w="full"
            size="lg"
            fontWeight={700}
            _hover={{
              bg: "rgba(0,212,255,0.1)",
              transform: "translateY(-1px)",
              boxShadow: "0 0 20px rgba(0,212,255,0.2)",
            }}
            transition="all 0.2s"
          >
            {isLast ? "See My Results" : "Next Question"}
          </Button>
        </Fade>
      )}
    </Box>
  );
}
