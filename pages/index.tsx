// =============================================================================
// pages/index.tsx — Landing / Dataset Selector
// =============================================================================
import type { NextPage } from "next";
import Head from "next/head";
import { keyframes } from "@emotion/react";
import {
  Box,
  SimpleGrid,
  Text,
  VStack,
  HStack,
  Badge,
  Icon,
  Flex,
  Button,
} from "@chakra-ui/react";
import { FaTrophy } from "react-icons/fa";
import { MdPlayArrow } from "react-icons/md";
import Link from "next/link";
import { Layout } from "@/components/Layout/Layout";
import { DATASETS, DIFFICULTY_CONFIG } from "@/data/datasets";
import { Dataset } from "@/types";

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

const glow = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
`;

function DatasetCard({ dataset }: { dataset: Dataset }) {
  const config = DIFFICULTY_CONFIG[dataset.difficulty];

  return (
    <Link href={`/play/${dataset.id}`} style={{ textDecoration: "none" }}>
      <Box
        role="group"
        bg="dark.card"
        border="1px solid"
        borderColor="dark.border"
        borderRadius="2xl"
        p={5}
        cursor="pointer"
        position="relative"
        overflow="hidden"
        transition="all 0.3s ease"
        _hover={{
          borderColor: "neon.purple",
          transform: "translateY(-6px)",
          boxShadow: "0 20px 60px rgba(139,92,246,0.2)",
        }}
      >
        {/* Glow effect */}
        <Box
          position="absolute"
          inset={0}
          bgGradient={`linear(to-br, ${config.color}.900, transparent)`}
          opacity={0}
          _groupHover={{ opacity: 0.15 }}
          transition="opacity 0.3s"
          borderRadius="2xl"
          pointerEvents="none"
        />

        {/* Top row */}
        <Flex justify="space-between" align="flex-start" mb={3}>
          <Text
            fontSize="3xl"
            animation={`${float} 3s ease-in-out infinite`}
            display="inline-block"
          >
            {dataset.icon}
          </Text>
          <Badge
            colorScheme={config.colorScheme}
            variant="subtle"
            fontSize="10px"
            px={2}
            py={0.5}
            borderRadius="full"
            fontWeight={700}
            letterSpacing="wider"
          >
            {config.label.toUpperCase()}
          </Badge>
        </Flex>

        {/* Name and description */}
        <Text
          fontWeight={800}
          fontSize="md"
          color="white"
          mb={1}
          _groupHover={{ color: "neon.cyan" }}
          transition="color 0.2s"
        >
          {dataset.name}
        </Text>
        <Text fontSize="xs" color="gray.500" lineHeight={1.6} mb={4} noOfLines={2}>
          {dataset.description}
        </Text>

        {/* Stats row */}
        <HStack spacing={3} mb={4}>
          <VStack spacing={0} align="flex-start">
            <Text fontSize="10px" color="gray.600" letterSpacing="wider">
              FEATURES
            </Text>
            <Text fontSize="sm" fontWeight={700} color="gray.300" fontFamily="mono">
              {dataset.features.toLocaleString()}
            </Text>
          </VStack>
          <Box w="1px" h="24px" bg="dark.border" />
          <VStack spacing={0} align="flex-start">
            <Text fontSize="10px" color="gray.600" letterSpacing="wider">
              SAMPLES
            </Text>
            <Text fontSize="sm" fontWeight={700} color="gray.300" fontFamily="mono">
              {dataset.samples >= 1000
                ? `${(dataset.samples / 1000).toFixed(0)}K`
                : dataset.samples}
            </Text>
          </VStack>
          <Box w="1px" h="24px" bg="dark.border" />
          <VStack spacing={0} align="flex-start">
            <Text fontSize="10px" color="gray.600" letterSpacing="wider">
              TARGET
            </Text>
            <Text
              fontSize="sm"
              fontWeight={700}
              color="neon.green"
              fontFamily="mono"
            >
              {dataset.objective}%
            </Text>
          </VStack>
        </HStack>

        {/* Play button */}
        <Button
          w="full"
          size="sm"
          colorScheme="purple"
          variant="outline"
          rightIcon={<Icon as={MdPlayArrow} />}
          _groupHover={{
            bg: "rgba(139,92,246,0.2)",
            borderColor: "neon.purple",
          }}
          transition="all 0.2s"
          fontWeight={700}
          fontSize="xs"
          letterSpacing="wider"
        >
          START CHALLENGE
        </Button>
      </Box>
    </Link>
  );
}

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>ML Hyper-Trainer — Gamified Machine Learning</title>
        <meta
          name="description"
          content="Learn machine learning by tuning hyperparameters in an interactive gamified environment. Choose your dataset, pick an algorithm, and train your model!"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout showSidebar={false}>
        <Box maxW="1200px" mx="auto" px={6} py={12}>
          {/* Hero section */}
          <VStack spacing={6} mb={16} textAlign="center">
            {/* Badge */}
            <Badge
              colorScheme="purple"
              variant="subtle"
              px={4}
              py={1.5}
              borderRadius="full"
              fontSize="xs"
              letterSpacing="widest"
            >
              🎮 INTERACTIVE ML TRAINING
            </Badge>

            {/* Title */}
            <Text
              as="h1"
              fontSize={{ base: "4xl", md: "6xl" }}
              fontWeight={900}
              lineHeight={1.1}
              letterSpacing="-0.03em"
              bgGradient="linear(to-r, white 20%, neon.cyan 60%, neon.purple 100%)"
              bgClip="text"
            >
              Master Machine Learning
              <br />
              <Text
                as="span"
                bgGradient="linear(to-r, neon.purple, neon.cyan)"
                bgClip="text"
              >
                by Playing
              </Text>
            </Text>

            {/* Subtitle */}
            <Text
              fontSize={{ base: "md", md: "xl" }}
              color="gray.400"
              maxW="600px"
              lineHeight={1.7}
            >
              Tune hyperparameters, watch your model train in real-time, and earn
              stars based on accuracy. No coding required, just pure intuition. 
              Current phase just simulates training in the browser, Python backend for real model training will update in the future!
            </Text>

            {/* Feature pills */}
            <HStack spacing={3} flexWrap="wrap" justify="center">
              {[
                { icon: "⚡", text: "Live Training Simulation" },
                { icon: "🎛️", text: "Interactive Hyperparameters" },
                { icon: "⭐", text: "Star Rating System" },
                { icon: "📊", text: "Real Dataset Challenges" },
              ].map(({ icon, text }) => (
                <HStack
                  key={text}
                  spacing={2}
                  bg="dark.card"
                  border="1px solid"
                  borderColor="dark.border"
                  px={4}
                  py={2}
                  borderRadius="full"
                >
                  <Text>{icon}</Text>
                  <Text fontSize="sm" color="gray.400">
                    {text}
                  </Text>
                </HStack>
              ))}
            </HStack>

            {/* Scroll CTA */}
            <HStack spacing={2} color="gray.600">
              <Icon as={FaTrophy} boxSize={3.5} color="yellow.500" />
              <Text fontSize="sm">
                6 challenges across 3 difficulty levels
              </Text>
            </HStack>
          </VStack>

          {/* Difficulty sections */}
          {(["beginner", "intermediate", "expert"] as const).map((diff) => {
            const config = DIFFICULTY_CONFIG[diff];
            const datasets = DATASETS.filter((d) => d.difficulty === diff);

            return (
              <Box key={diff} mb={12}>
                <HStack spacing={3} mb={5}>
                  <Box
                    w="4px"
                    h="24px"
                    borderRadius="full"
                    bgGradient={config.gradient}
                  />
                  <Text
                    fontSize="xs"
                    fontWeight={700}
                    color={`${config.color}.400`}
                    letterSpacing="widest"
                    textTransform="uppercase"
                  >
                    {config.label}
                  </Text>
                  <Box flex={1} h="1px" bg="dark.border" />
                  <Text fontSize="xs" color="gray.700">
                    {datasets.length} challenges
                  </Text>
                </HStack>

                <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
                  {datasets.map((dataset) => (
                    <DatasetCard key={dataset.id} dataset={dataset} />
                  ))}
                </SimpleGrid>
              </Box>
            );
          })}

          {/* Footer note */}
          <Box
            textAlign="center"
            py={8}
            borderTop="1px solid"
            borderColor="dark.border"
          >
            <Text fontSize="sm" color="gray.700">
              All training is simulated in the browser.
            </Text>
          </Box>
        </Box>
      </Layout>
    </>
  );
};

export default Home;
