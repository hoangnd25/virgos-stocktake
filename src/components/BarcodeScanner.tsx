"use client";

import { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Box,
  Card,
  Input,
  Text,
  Spinner,
  Badge,
  Flex,
  Button,
  Icon,
} from "@chakra-ui/react";
import { parseBarcodeInfo } from "@/lib/barcode";
import { useIsMobile } from "@/hooks/useIsMobile";
import type { BarcodeType } from "@/types/prestashop";

// Dynamically import CameraScanner to avoid SSR issues with Quagga
const CameraScanner = dynamic(
  () => import("@/components/CameraScanner").then((m) => ({ default: m.CameraScanner })),
  { ssr: false }
);

// Import initBeepAudio separately (not dynamically) so we can call it during user gesture
let initBeepAudio: (() => void) | null = null;
if (typeof window !== "undefined") {
  import("@/components/CameraScanner").then((m) => {
    initBeepAudio = m.initBeepAudio;
  });
}

interface BarcodeScannerProps {
  onScan: (barcode: string, type: BarcodeType) => void;
  isProcessing: boolean;
  queueLength: number;
  error: string | null;
  onDismissError: () => void;
}

export function BarcodeScanner({ onScan, isProcessing, queueLength, error, onDismissError }: BarcodeScannerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [detectedType, setDetectedType] = useState<BarcodeType | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const prevErrorRef = useRef<string | null>(null);
  const isMobile = useIsMobile();
  const [cameraMode, setCameraMode] = useState(false);

  // Focus input on mount or when processing ends (only in text mode)
  useEffect(() => {
    if (!isProcessing && !cameraMode) {
      const id = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [isProcessing, cameraMode]);

  // Trigger shake animation when a new error appears and re-focus
  useEffect(() => {
    if (error && error !== prevErrorRef.current) {
      prevErrorRef.current = error;
      const id = setTimeout(() => {
        setShakeKey((k) => k + 1);
        if (!cameraMode) inputRef.current?.focus();
      }, 0);
      return () => clearTimeout(id);
    } else if (!error) {
      prevErrorRef.current = null;
    }
    return undefined;
  }, [error, cameraMode]);

  // When a camera scan completes, auto-switch back to ready state (camera stays open)
  const handleCameraScan = (barcode: string, type: BarcodeType) => {
    onScan(barcode, type);
  };

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
    if (isProcessing && queueLength > 0) return `Processing... (${queueLength} queued)`;
    if (isProcessing) return "Processing...";
    if (queueLength > 0) return `${queueLength} scan${queueLength > 1 ? "s" : ""} queued...`;
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
        {/* Header row */}
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
          <Flex gap={2} align="center">
            {detectedType && !cameraMode && (
              <Badge colorPalette="blue" variant="subtle" borderRadius="full" px={3}>
                {detectedType}
              </Badge>
            )}
            {/* Camera toggle button: shown on mobile, or always when camera is active */}
            {(isMobile || cameraMode) && (
              <Button
                size="xs"
                variant={cameraMode ? "solid" : "outline"}
                colorPalette={cameraMode ? "blue" : "gray"}
                borderRadius="full"
                px={3}
                gap={1}
                onClick={() => {
                  if (!cameraMode) initBeepAudio?.();
                  setCameraMode((v) => !v);
                }}
                aria-label={cameraMode ? "Switch to keyboard input" : "Use camera scanner"}
              >
                <Icon fontSize="sm">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </Icon>
                {cameraMode ? "Keyboard" : "Camera"}
              </Button>
            )}
          </Flex>
        </Flex>

        {/* Camera mode */}
        {cameraMode ? (
          <CameraScanner
            onScan={handleCameraScan}
            onClose={() => setCameraMode(false)}
            isProcessing={isProcessing}
            scanError={error}
            onDismissError={onDismissError}
          />
        ) : (
          <>
            {/* Text input mode */}
            <Box key={shakeKey} className={shakeKey > 0 ? "animate-shake" : undefined}>
              <Input
                ref={inputRef}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
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
          </>
        )}
      </Card.Body>
    </Card.Root>
  );
}
