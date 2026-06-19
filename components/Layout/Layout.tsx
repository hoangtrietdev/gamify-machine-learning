// =============================================================================
// Layout Component — wraps all pages
// =============================================================================
import { Box, Flex } from "@chakra-ui/react";
import { ReactNode } from "react";
import { Topbar } from "./Topbar";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  onStartTour?: () => void;
}

export function Layout({ children, showSidebar = true, onStartTour }: LayoutProps) {
  return (
    <Box minH="100vh" bg="dark.bg">
      <Topbar onStartTour={onStartTour} />
      <Flex>
        {showSidebar && <Sidebar />}
        <Box flex={1} minW={0}>
          {children}
        </Box>
      </Flex>
    </Box>
  );
}
