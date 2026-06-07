// =============================================================================
// pages/_app.tsx — ChakraProvider + QueryClientProvider
// =============================================================================
import type { AppProps } from "next/app";
import { ChakraProvider, Flex, Text, Box } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { theme } from "@/styles/theme";
import { Analytics } from "@vercel/analytics/next"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Analytics />
      <ChakraProvider theme={theme}>
        {/* Mobile Warning Overlay */}
        <Flex
          display={{ base: "flex", md: "none" }}
          position="fixed"
          inset={0}
          bg="gray.900"
          color="white"
          zIndex={9999}
          align="center"
          justify="center"
          p={6}
          textAlign="center"
          flexDirection="column"
          gap={4}
        >
          <Text fontSize="2xl" fontWeight="bold">
            Not supported for mobile device.
          </Text>
          <Text fontSize="md" color="gray.400">
            Please use the website on a desktop or larger screen.
          </Text>
        </Flex>

        {/* Main App (Desktop) */}
        <Box display={{ base: "none", md: "block" }}>
          <Component {...pageProps} />
        </Box>
      </ChakraProvider>
    </QueryClientProvider>
  );
}
