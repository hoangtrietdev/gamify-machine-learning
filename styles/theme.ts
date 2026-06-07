// =============================================================================
// Custom Chakra UI Theme — Dark Cyberpunk / ML Aesthetic
// =============================================================================
import { extendTheme, ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const colors = {
  brand: {
    50: "#e8f4fd",
    100: "#bee3f8",
    200: "#90cdf4",
    300: "#63b3ed",
    400: "#4299e1",
    500: "#3182ce",
    600: "#2b6cb0",
    700: "#2c5282",
    800: "#2a4365",
    900: "#1A365D",
  },
  neon: {
    cyan: "#00D4FF",
    purple: "#8B5CF6",
    green: "#10F5A0",
    pink: "#F472B6",
    orange: "#FB923C",
  },
  dark: {
    bg: "#0A0E1A",
    card: "#0F1629",
    panel: "#141B2D",
    border: "#1E2A45",
    hover: "#1A2340",
  },
};

const fonts = {
  heading: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, sans-serif`,
  body: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, sans-serif`,
  mono: `'JetBrains Mono', 'Fira Code', 'Courier New', monospace`,
};

const components = {
  Button: {
    variants: {
      neon: {
        bg: "transparent",
        border: "1px solid",
        borderColor: "neon.cyan",
        color: "neon.cyan",
        _hover: {
          bg: "rgba(0,212,255,0.1)",
          boxShadow: "0 0 20px rgba(0,212,255,0.4)",
          transform: "translateY(-1px)",
        },
        _active: {
          transform: "translateY(0)",
        },
        transition: "all 0.2s ease",
      },
      solid: {
        _hover: {
          transform: "translateY(-1px)",
          boxShadow: "lg",
        },
        transition: "all 0.2s ease",
      },
    },
  },
  Card: {
    baseStyle: {
      container: {
        bg: "dark.card",
        border: "1px solid",
        borderColor: "dark.border",
        borderRadius: "xl",
      },
    },
  },
  Progress: {
    baseStyle: {
      filledTrack: {
        transition: "width 0.3s ease",
      },
      track: {
        bg: "dark.border",
      },
    },
  },
  Slider: {
    baseStyle: {
      track: {
        bg: "dark.border",
        h: "6px",
      },
      filledTrack: {
        bg: "linear-gradient(to right, #8B5CF6, #00D4FF)",
      },
      thumb: {
        bg: "white",
        border: "3px solid",
        borderColor: "neon.cyan",
        _focus: {
          boxShadow: "0 0 0 3px rgba(0,212,255,0.3)",
        },
      },
    },
  },
  Tabs: {
    variants: {
      "soft-rounded": {
        tab: {
          color: "gray.400",
          _selected: {
            color: "neon.cyan",
            bg: "rgba(0,212,255,0.1)",
          },
        },
      },
    },
  },
};

const styles = {
  global: {
    "html, body": {
      bg: "dark.bg",
      color: "gray.100",
      fontFamily: "body",
    },
    "::-webkit-scrollbar": {
      width: "6px",
    },
    "::-webkit-scrollbar-track": {
      bg: "dark.bg",
    },
    "::-webkit-scrollbar-thumb": {
      bg: "dark.border",
      borderRadius: "full",
    },
    "::-webkit-scrollbar-thumb:hover": {
      bg: "gray.600",
    },
  },
};

export const theme = extendTheme({
  config,
  colors,
  fonts,
  components,
  styles,
});
