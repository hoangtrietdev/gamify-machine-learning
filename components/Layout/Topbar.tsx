// =============================================================================
// Topbar Component
// =============================================================================
import {
  Box,
  Flex,
  HStack,
  Text,
  Badge,
  Icon,
  Tooltip,
} from "@chakra-ui/react";
import { FaBrain, FaGithub } from "react-icons/fa";
import { MdScience } from "react-icons/md";
import Link from "next/link";

export function Topbar() {
  return (
    <Box
      as="header"
      position="sticky"
      top={0}
      zIndex={100}
      bg="rgba(10, 14, 26, 0.85)"
      backdropFilter="blur(20px)"
      borderBottom="1px solid"
      borderColor="dark.border"
      px={6}
      py={3}
    >
      <Flex align="center" justify="space-between" maxW="1600px" mx="auto">
        {/* Brand */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <HStack spacing={3} cursor="pointer" role="group">
            <Box
              p={2}
              borderRadius="lg"
              bg="rgba(139,92,246,0.15)"
              border="1px solid"
              borderColor="neon.purple"
              _groupHover={{ boxShadow: "0 0 16px rgba(139,92,246,0.5)" }}
              transition="all 0.3s"
            >
              <Icon as={FaBrain} color="neon.purple" boxSize={5} />
            </Box>
            <Box>
              <Text
                fontWeight={800}
                fontSize="lg"
                letterSpacing="-0.02em"
                bgGradient="linear(to-r, neon.purple, neon.cyan)"
                bgClip="text"
                lineHeight={1}
              >
                ML Hyper-Trainer
              </Text>
              <Text fontSize="10px" color="gray.500" fontFamily="mono" lineHeight={1.2}>
                gamified machine learning
              </Text>
            </Box>
          </HStack>
        </Link>

        {/* Right side */}
        <HStack spacing={4}>
          <HStack spacing={1}>
            <Icon as={MdScience} color="neon.green" boxSize={4} />
            <Text fontSize="sm" color="gray.400">
              6 Challenges
            </Text>
          </HStack>
          <Badge
            colorScheme="purple"
            variant="subtle"
            px={3}
            py={1}
            borderRadius="full"
            fontSize="xs"
            letterSpacing="wider"
          >
            MVP
          </Badge>
          <Tooltip label="View source" hasArrow>
            <Box
              as="a"
              href="https://github.com/hoangtrietdev/gamify-machine-learning"
              target="_blank"
              color="gray.500"
              _hover={{ color: "gray.200" }}
              transition="color 0.2s"
            >
              <Icon as={FaGithub} boxSize={5} />
            </Box>
          </Tooltip>
        </HStack>
      </Flex>
    </Box>
  );
}
