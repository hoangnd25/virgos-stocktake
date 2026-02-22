"use client";

import { useRef, useEffect, useState } from "react";
import {
  Box,
  Card,
  Input,
  Text,
  Spinner,
  Badge,
  Flex,
} from "@chakra-ui/react";
import { parseBarcodeInfo } from "@/lib/barcode";
import type { BarcodeType } from "@/types/prestashop";

interface BarcodeScannerProps {
  onScan: (barcode: string, type: BarcodeType) => void;
  isProcessing: boolean;
  error: string | null;
}

export function BarcodeScanner({ onScan, isProcessing, error }: BarcodeScannerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [detectedType, setDetectedType] = useState<BarcodeType | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const prevErrorRef = useRef<string | null>(null);

  // Focus input on mount, when processing ends, or when a new error occurs
  useEffect(() => {
    if (!isProcessing) {
      // Small delay to let any remount (shake animation key change) settle first
      const id = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [isProcessing]);

  // Trigger shake animation when a new error appears and re-focus
  useEffect(() => {
    if (error && error !== prevErrorRef.current) {
      prevErrorRef.current = error;
      const id = setTimeout(() => {
        setShakeKey((k) => k + 1);
        inputRef.current?.focus();
      }, 0);
      return () => clearTimeout(id);
    } else if (!error) {
      prevErrorRef.current = null;
    }
    return undefined;
  }, [error]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (newValue) {
      const info = parseBarcodeInfo(newValue);
      setDetectedType(info.type !== "UNKNOWN" ? info.type : null);
    } else {
      setDetectedType(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim()) {
      const info = parseBarcodeInfo(value.trim());
      onScan(info.code, info.type);
      setValue("");
      setDetectedType(null);
    }
  };

  const statusMessage = (() => {
    if (isProcessing) return "Searching...";
    if (error) return error;
    return "Ready to scan...";
  })();

  const statusColor = (() => {
    if (isProcessing) return "blue.500";
    if (error) return "red.500";
    return "gray.400";
  })();

  return (
    <Card.Root
      bg="white"
      _dark={{ bg: "gray.800" }}
      borderRadius="xl"
      boxShadow="sm"
      overflow="hidden"
    >
      <Card.Body p={6}>
        <Flex justify="space-between" align="center" mb={4}>
          <Text
            fontWeight="semibold"
            fontSize="sm"
            textTransform="uppercase"
            letterSpacing="wider"
            color="gray.500"
            _dark={{ color: "gray.400" }}
          >
            Scan Barcode
          </Text>
          {detectedType && (
            <Badge colorPalette="blue" variant="subtle" borderRadius="full" px={3}>
              {detectedType}
            </Badge>
          )}
        </Flex>

        <Box key={shakeKey} className={shakeKey > 0 ? "animate-shake" : undefined}>
          <Input
            ref={inputRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            readOnly={isProcessing}
            placeholder="Scan or type barcode..."
            size="lg"
            fontSize="xl"
            fontFamily="mono"
            borderWidth={2}
            borderColor={error ? "red.300" : "gray.200"}
            _dark={{
              borderColor: error ? "red.600" : "gray.600",
            }}
            _focus={{
              borderColor: error ? "red.400" : "blue.400",
              boxShadow: error
                ? "0 0 0 3px rgba(239, 68, 68, 0.2)"
                : "0 0 0 3px rgba(59, 130, 246, 0.2)",
            }}
            transition="all 0.15s"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
        </Box>

        <Flex align="center" gap={2} mt={3}>
          {isProcessing && <Spinner size="xs" color="blue.500" />}
          <Text fontSize="sm" color={statusColor} _dark={{ color: statusColor }}>
            {statusMessage}
          </Text>
        </Flex>
      </Card.Body>
    </Card.Root>
  );
}
