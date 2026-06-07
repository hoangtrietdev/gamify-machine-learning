// =============================================================================
// Step 1: Data Preview Panel
// =============================================================================
import {
  Box, Text, HStack, VStack, Badge, Icon, Table, Thead, Tbody, Tr, Th, Td,
  TableContainer, Flex, Tooltip, SimpleGrid, Button,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, useDisclosure,
} from "@chakra-ui/react";
import { FaDatabase, FaExclamationTriangle, FaCheckCircle, FaTable, FaDownload } from "react-icons/fa";
import { MdNumbers, MdCategory, MdToggleOn, MdTextFields } from "react-icons/md";
import { Dataset, ColumnInfo } from "@/types";

const DTYPE_CONFIG = {
  numeric:     { label: "Numeric",     icon: MdNumbers,   color: "cyan"   },
  categorical: { label: "Categorical", icon: MdCategory,  color: "purple" },
  binary:      { label: "Binary",      icon: MdToggleOn,  color: "green"  },
  text:        { label: "Text",        icon: MdTextFields,color: "orange" },
  target:      { label: "Target",      icon: FaCheckCircle,color: "yellow"},
};

function DistributionBar({ skewness }: { skewness?: "low"|"moderate"|"high" }) {
  if (!skewness) return null;
  const bars = [12, 28, 48, 38, 22, 14, 8, 5, 3, 2];
  const skewed = skewness === "high"
    ? [52, 28, 12, 5, 2, 1, 0, 0, 0, 0]
    : skewness === "moderate"
    ? [8, 20, 38, 42, 35, 22, 12, 6, 3, 1]
    : bars;
  const max = Math.max(...skewed);
  return (
    <HStack spacing="1px" align="flex-end" h="24px">
      {skewed.map((v, i) => (
        <Box key={i} w="6px" bg="neon.cyan" opacity={0.6} borderRadius="1px"
          h={`${(v / max) * 24}px`} />
      ))}
    </HStack>
  );
}

function ColumnRow({ col }: { col: ColumnInfo }) {
  const cfg = DTYPE_CONFIG[col.dtype];
  return (
    <Tr _hover={{ bg: "dark.hover" }} transition="bg 0.1s">
      <Td borderColor="dark.border" py={2}>
        <HStack spacing={2}>
          <Icon as={cfg.icon} color={`${cfg.color}.400`} boxSize={3.5} />
          <Text fontSize="sm" fontWeight={600} color="white">{col.name}</Text>
          {col.isTarget && (
            <Badge colorScheme="yellow" fontSize="9px" variant="subtle">TARGET</Badge>
          )}
        </HStack>
        <Text fontSize="10px" color="gray.600" mt={0.5} noOfLines={1}>{col.description}</Text>
      </Td>
      <Td borderColor="dark.border" py={2}>
        <Badge colorScheme={cfg.color as any} variant="subtle" fontSize="10px">
          {cfg.label}
        </Badge>
      </Td>
      <Td borderColor="dark.border" py={2}>
        <HStack spacing={1}>
          {col.sampleValues.slice(0, 3).map((v, i) => (
            <Badge key={i} variant="outline" colorScheme="gray" fontSize="10px"
              fontFamily="mono" px={1.5}>{String(v)}</Badge>
          ))}
        </HStack>
      </Td>
      <Td borderColor="dark.border" py={2}>
        {col.stats ? (
          <VStack spacing={0.5} align="flex-start">
            <DistributionBar skewness={col.stats.skewness} />
            <Text fontSize="9px" color="gray.600" fontFamily="mono">
              μ={col.stats.mean} σ={col.stats.std}
            </Text>
          </VStack>
        ) : (
          <Text fontSize="xs" color="gray.600">—</Text>
        )}
      </Td>
      <Td borderColor="dark.border" py={2}>
        {col.missingPct > 0 ? (
          <Tooltip label={`${col.missingPct}% missing values`} hasArrow>
            <Badge colorScheme={col.missingPct > 20 ? "red" : "orange"}
              variant="subtle" fontSize="10px">
              {col.missingPct}%
            </Badge>
          </Tooltip>
        ) : (
          <Badge colorScheme="green" variant="subtle" fontSize="10px">None</Badge>
        )}
      </Td>
      <Td borderColor="dark.border" py={2}>
        {col.hasOutliers ? (
          <HStack spacing={1}>
            <Icon as={FaExclamationTriangle} color="orange.400" boxSize={3} />
            <Text fontSize="10px" color="orange.400">Yes</Text>
          </HStack>
        ) : (
          <HStack spacing={1}>
            <Icon as={FaCheckCircle} color="green.400" boxSize={3} />
            <Text fontSize="10px" color="green.400">No</Text>
          </HStack>
        )}
      </Td>
      <Td borderColor="dark.border" py={2}>
        {!col.isTarget && (
          <Box w="80px">
            <Box h="4px" bg="dark.border" borderRadius="full" overflow="hidden">
              <Box
                h="full" borderRadius="full"
                w={`${col.importance * 100}%`}
                bg={col.importance >= 0.7 ? "neon.green" : col.importance >= 0.4 ? "neon.cyan" : "gray.600"}
              />
            </Box>
            <Text fontSize="9px" color="gray.600" mt={0.5} fontFamily="mono">
              {(col.importance * 100).toFixed(0)}%
            </Text>
          </Box>
        )}
      </Td>
    </Tr>
  );
}

interface DataPreviewPanelProps {
  dataset: Dataset;
}

export function DataPreviewPanel({ dataset }: DataPreviewPanelProps) {
  const numericCols = dataset.columns.filter((c) => c.dtype === "numeric" && !c.isTarget);
  const missingCols = dataset.columns.filter((c) => c.missingPct > 0);
  const outlierCols = dataset.columns.filter((c) => c.hasOutliers && !c.isTarget);
  const avgImportance = numericCols.length > 0
    ? numericCols.reduce((s, c) => s + c.importance, 0) / numericCols.length
    : 0;

  const { isOpen, onOpen, onClose } = useDisclosure();
  const maxRows = Math.max(...dataset.columns.map(c => c.sampleValues.length));

  const downloadCSV = () => {
    const headers = dataset.columns.map((c) => c.name).join(",");
    const rows = [];
    const rowCount = Math.min(dataset.samples, 2000); // Generate up to 2000 rows
    for (let i = 0; i < rowCount; i++) {
      const row = dataset.columns.map((c) => {
        const vals = c.sampleValues;
        return vals[i % vals.length];
      });
      rows.push(row.join(","));
    }
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${dataset.id}_dataset.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Flex direction="column" flex={1} overflow="hidden" h="full">
      {/* Header */}
      <HStack justify="space-between" mb={4} flexShrink={0}>
        <HStack spacing={2}>
          <Icon as={FaDatabase} color="neon.cyan" boxSize={5} />
          <Text fontSize="xl" fontWeight={800} color="white">Dataset Overview</Text>
          <Badge colorScheme="cyan" variant="subtle">{dataset.samples.toLocaleString()} rows</Badge>
        </HStack>
        <HStack spacing={2}>
          <Button size="sm" colorScheme="purple" variant="outline" leftIcon={<Icon as={FaDownload} />} onClick={downloadCSV}>
            Download CSV
          </Button>
          <Button size="sm" colorScheme="cyan" variant="outline" leftIcon={<Icon as={FaTable} />} onClick={onOpen}>
            Preview Data
          </Button>
        </HStack>
      </HStack>

      {/* Summary stats */}
      <SimpleGrid columns={4} spacing={3} mb={5} flexShrink={0}>
        {[
          { label: "Total Columns", value: dataset.columns.length, color: "neon.cyan" },
          { label: "Numeric Features", value: numericCols.length, color: "neon.purple" },
          { label: "Missing Columns", value: missingCols.length, color: missingCols.length > 0 ? "orange.400" : "green.400" },
          { label: "Outlier Columns", value: outlierCols.length, color: outlierCols.length > 0 ? "orange.400" : "green.400" },
        ].map(({ label, value, color }) => (
          <Box key={label} bg="dark.panel" border="1px solid" borderColor="dark.border"
            borderRadius="lg" p={3} textAlign="center">
            <Text fontSize="2xl" fontWeight={900} color={color} fontFamily="mono">{value}</Text>
            <Text fontSize="10px" color="gray.600" letterSpacing="wider">{label.toUpperCase()}</Text>
          </Box>
        ))}
      </SimpleGrid>

      <Box flex={1} overflowY="auto" pr={2} pb={2}>
        {/* Insights bar */}
        {(missingCols.length > 0 || outlierCols.length > 0) && (
        <Box bg="rgba(251,146,60,0.08)" border="1px solid" borderColor="orange.800"
          borderRadius="lg" p={3} mb={4}>
          <HStack spacing={2} mb={1}>
            <Icon as={FaExclamationTriangle} color="orange.400" boxSize={3.5} />
            <Text fontSize="sm" fontWeight={700} color="orange.300">Data Quality Issues Detected</Text>
          </HStack>
          <VStack align="flex-start" spacing={0.5}>
            {missingCols.map((c) => (
              <Text key={c.id} fontSize="xs" color="gray.400">
                • <Text as="span" color="orange.300">{c.name}</Text>: {c.missingPct}% missing values
              </Text>
            ))}
            {outlierCols.map((c) => (
              <Text key={c.id} fontSize="xs" color="gray.400">
                • <Text as="span" color="yellow.300">{c.name}</Text>: contains outliers
              </Text>
            ))}
          </VStack>
        </Box>
      )}

      {/* Data table */}
      <TableContainer
        border="1px solid" borderColor="dark.border" borderRadius="xl" overflow="auto"
      >
        <Table size="sm" variant="unstyled">
          <Thead bg="dark.panel">
            <Tr>
              {["Column", "Type", "Sample Values", "Distribution", "Missing", "Outliers", "Importance"].map((h) => (
                <Th key={h} color="gray.500" fontSize="10px" letterSpacing="wider"
                  borderBottom="1px solid" borderColor="dark.border" py={2}>
                  {h}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {dataset.columns.map((col) => (
              <ColumnRow key={col.id} col={col} />
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      </Box>

      <Text fontSize="xs" color="gray.700" mt={3} textAlign="center" fontFamily="mono" flexShrink={0}>
        💡 Review the data carefully — understanding your features helps you make better preprocessing choices.
      </Text>

      {/* Raw Data Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg="dark.panel" border="1px solid" borderColor="dark.border">
          <ModalHeader color="white">Raw Data Preview</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody pb={6}>
            <TableContainer border="1px solid" borderColor="dark.border" borderRadius="md" overflowY="auto" maxH="60vh">
              <Table size="sm" variant="simple">
                <Thead bg="dark.bg">
                  <Tr>
                    {dataset.columns.map(c => (
                      <Th key={c.id} color="gray.400" borderColor="dark.border">{c.name}</Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {Array.from({ length: maxRows }).map((_, i) => (
                    <Tr key={i}>
                      {dataset.columns.map(c => (
                        <Td key={c.id} borderColor="dark.border" color="gray.300">
                          {c.sampleValues[i] !== undefined ? String(c.sampleValues[i]) : "—"}
                        </Td>
                      ))}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
}
