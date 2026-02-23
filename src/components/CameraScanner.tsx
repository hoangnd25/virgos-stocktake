"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Quagga from "@ericblade/quagga2";
import {
  Box,
  Button,
  Text,
  VStack,
  Flex,
  Icon,
  Spinner,
} from "@chakra-ui/react";
import { parseBarcodeInfo } from "@/lib/barcode";
import type { BarcodeType } from "@/types/prestashop";

// Base64-encoded 150ms two-tone beep WAV (1600Hz + 2000Hz, 22050Hz sample rate)
const BEEP_DATA_URI = "data:audio/wav;base64,UklGRvwZAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YdgZAAAAAEEA6wC1AUACNAJgAcz/wP23+0P66Pny+l79zwCYBN8H0QnOCZ4HgAMv/rv4WPQX8qbyI/YG/DgDQgqcD/8RtRDICwwE/fp08k3s9+ko7KbySfwwBxwR6BcAGrwWjg75Akb2FOvO4yPipOae8C7+oAz3GIkgmCGwG9EPQgAi8MriGdvX2kziJ/C2AW8ToiFCKYkoYh95D+z7sujL2WzSTtRK31Px1wZ4G+gq1DGbLqohdg0D9hvgTtAFysHOxd0u9IENkSSNNAE6lzNkIsEJnu6L1pDGIsJkytzdvfh2FdUtzzxiPwE1zR8aBJDnBNBGwiTB2cwC4xf/WxsJMn4+Lz4sMR0auf3L4QrM5sCmwu7Q1eh3BfsgwzWOP1482SwrFF33VNyTyCbAxMR81ePuyQtHJvM4/T/0ORUoBQ4Y8TfXqsUJwHnHddod9f4RMiuTO8k/9jbqIrsH+OqB0lbDj8C9ys7fcvsEGK8vmz3yPm0zZh1eAQ7lQM6bwbbBis555dMBzh2yMwc/ez1gL5gX/fpp333KgMB7w9TSZ+svCEsjMjfSP2g72yqNEar0F9pCxwbA28WR14nxdw5vKCU6+j++OOklVgtz7iXVmMQuwM7ItdzR95kULC2FPIA/gzWXIAMFaOig0IXC+cBOzDLiLf6HGnYxSj5lPsAx8hqi/prik8wOwWXCUdD8544EMiBDNXE/qjx/LQgVRfgW3QrJN8BtxM7UAu7jCoslhzj3P1Y6ySjoDvvx69cMxgPADce52Tf0HRGEKjw72j9tN6wjowjV6yfTosNywD3KBd+J+isXEi9aPRo/9jM1HkcC4+XUztHBgsH3zaXk6QD+HCcz3D66PfwvcBjm+zPg/8qewDHDMNKK6kcHiCK6Nr8/vTuIK20SkPXU2rDHDcB7xd3WpvCTDbknwjn/Pyg5pCY8DFPv09XwxB/AWcjz2+r2vBOGLDc8nD8CNl8h6wVC6T7Rx8LTwMbLZeFE/bIZ4TATPpc+UjLFG4v/auMfzTrBJ8K3zyTnpQNoH8A0UT/zPCIu4xUt+dvdg8lMwBnEI9Qj7f0JzSQYOO4/tDp8KcsP3/Kj2HDGAcCkxv/YUvM8ENUp4jroP+A3bSSKCbPsztPxw1jAwMk+3qH5URZyLhY9QD99NAIfMQO55mvPCsJRwWfN0uMAAC4cmTKvPvY9lTBHGc/8/uCDy8DA6sKO0a/pXwbCIUA2qD8PPDIsTRN29pPbIMgYwB7FK9bE764MASdcOf8/kDldJyENNfCE1kzFEsDoxzPbA/bdEt0r5zu0P302JSLTBh3q3tENw6/AQMuY4Fv83BhJMNk9xj7hMpYcdQA75K7NacHtwR/PTua8ApseOjQtPzk9wi6+FhX6od7+yWTAycN600TsFgkNJKc34T8QOy0qrRDE81zZ2MYBwD7GR9ht8loPIymFOvM/UDgsJXAKk+141EPEQcBGyXjdufh2FdAtzzxiPwE1zR8aBJDnBNBGwiTB2cwC4xf/WxsJMn4+Lz4sMR0auf3L4QrM5sCmwu7Q1eh3BfsgwzWOP1482SwrFF33VNyTyCbAxMR81ePuyQtHJvM4/T/0ORUoBQ4Y8TfXqsUJwHnHddod9f4RMiuTO8k/9jbqIrsH+OqB0lbDj8C9ys7fcvsEGK8vmz3yPm0zZh1eAQ7lQM6bwbbBis555dMBzh2yMwc/ez1gL5gX/fpp333KgMB7w9TSZ+svCEsjMjfSP2g72yqNEar0F9pCxwbA28WR14nxdw5vKCU6+j++OOklVgtz7iXVmMQuwM7ItdzR95kULC2FPIA/gzWXIAMFaOig0IXC+cBOzDLiLf6HGnYxSj5lPsAx8hqi/prik8wOwWXCUdD8544EMiBDNXE/qjx/LQgVRfgW3QrJN8BtxM7UAu7jCoslhzj3P1Y6ySjoDvvx69cMxgPADce52Tf0HRGEKjw72j9tN6wjowjV6yfTosNywD3KBd+J+isXEi9aPRo/9jM1HkcC4+XUztHBgsH3zaXk6QD+HCcz3D66PfwvcBjm+zPg/8qewDHDMNKK6kcHiCK6Nr8/vTuIK20SkPXU2rDHDcB7xd3WpvCTDbknwjn/Pyg5pCY8DFPv09XwxB/AWcjz2+r2vBOGLDc8nD8CNl8h6wVC6T7Rx8LTwMbLZeFE/bIZ4TATPpc+UjLFG4v/auMfzTrBJ8K3zyTnpQNoH8A0UT/zPCIu4xUt+dvdg8lMwBnEI9Qj7f0JzSQYOO4/tDp8KcsP3/Kj2HDGAcCkxv/YUvM8ENUp4jroP+A3bSSKCbPsztPxw1jAwMk+3qH5URZyLhY9QD99NAIfMQO55mvPCsJRwWfN0uMAAC4cmTKvPvY9lTBHGc/8/uCDy8DA6sKO0a/pXwbCIUA2qD8PPDIsTRN29pPbIMgYwB7FK9bE764MASdcOf8/kDldJyENNfCE1kzFEsDoxzPbA/bdEt0r5zu0P302JSLTBh3q3tENw6/AQMuY4Fv83BhJMNk9xj7hMpYcdQA75K7NacHtwR/PTua8ApseOjQtPzk9wi6+FhX6od7+yWTAycN600TsFgkNJKc34T8QOy0qrRDE81zZ2MYBwD7GR9ht8loPIymFOvM/UDgsJXAKk+141EPEQcBGyXjdufh2FdAtzzxiPwE1zR8aBJDnBNBGwiTB2cwC4xf/WxsJMn4+Lz4sMR0auf3L4QrM5sCmwu7Q1eh3BfsgwzWOP1482SwrFF33VNyTyCbAxMR81ePuyQtHJvM4/T/0ORUoBQ4Y8TfXqsUJwHnHddod9f4RMiuTO8k/9jbqIrsH+OqB0lbDj8C9ys7fcvsEGK8vmz3yPm0zZh1eAQ7lQM6bwbbBis555dMBzh2yMwc/ez1gL5gX/fpp333KgMB7w9TSZ+svCEsjMjfSP2g72yqNEar0F9pCxwbA28WR14nxdCC4WHZ5UHqnW14mMel+tLOVt5NRrevZYwz+Nk1P2VDjPSEe8/sI4YzTrNTb4JbxAABeB6AGdQDx+U74ov5cDCcdSyoULXYh+wc65pXFhLA+r9DEme3NH+hNe2oubMVQLh4w4Qiq54ebhKehsdd2GLdSBncGfPpgzC2z8Bu6Cphaktiou9M/BoEyfE3iUSdBdCIAAL/jadTR0/Defu+F/ugGGQddAZX6G/hj/VsKGhsYKXktvCPHC5rqPckysieu7cC857UZ2kg/aJdtqVVjJdboDbCdijGDbZwD0F4QXUwVdDp96mURNVD4DcDVmnCRsqSqzQAAvS1NS5VSM0S3JicEquaC1SbTGt1g7e78UAZ6B0ACS/sI+ET8aggDGb4npC3HJW0P+e4OzS60bq1dvQziExOKQ5hliW4pWmUsi/Bhts2NTYKfl4nIMwivRaZw6H1yaiY8AABMxhKe+5DloL7Hrvm2KMNI71IAR+YqYwjI6djWrdJf2z3rPfuWBcEHHAMR/BX4R/uMBuUWQCaXLZYn6RJR8wTRdLYSrSC6j9ywDAA+i2IDb0FeLTNG+P28dJHvgUGTS8EAAIgiJTpiP5UwbRJz7gTQwMB7xbXcF//CIcI5gD8sMU0TU++g0ObAHsXz2y3++yBcOZw/wDErFDXwPtEOwcTEM9tE/TIg8zi0P1IyCBUY8d7ROsFtxHXaW/xoH4c4yT/hMuMV+/GB0mnBGcS52XL7mx4YONo/bTO+Ft/yJ9ObwcnD/9iJ+s4dpzfoP/YzmBfE887T0cF7w0fYofn+HDI38z99NHAYqvR41ArCMcOR17n4Lhy6Nvo/ATVHGZD1JdVGwurC3dbR91sbQDb/P4M1HRp29tPVhcKmwivW6vaHGsM1/z8CNvIaXfeE1sfCZcJ81QP2shlDNf0/fTbFG0X4N9cNwyfCztQd9dwYwDT3P/Y2lhwt+evXVsPtwSPUN/QEGDo07j9tN2YdFfqj2KLDtsF601LzKxeyM+E/4Dc1Hv36XNnxw4LB1NJt8lEWJzPSP1A4Ah/m+xfaQ8RRwTDSifF2FZkyvz++OM0fz/zU2pjEJMGO0abwmRQJMqg/KDmXILn9k9vwxPnA7tDE77wTdjGOP5A5XyGi/lTcTMXTwFHQ4+7dEuEwcT/0OSUii/8W3arFr8C3zwLu/hFJMFE/VjrqInUA290Mxo/AH88j7R0Rry8tP7Q6rCNeAaHecMZywIrOROw8EBIvBz8QO20kRwJp39jGWMD3zWfrWg9yLtw+aDssJTEDM+BCx0HAZ82K6ncO0C2vPr076SUaBP7gsMcuwNnMr+mTDSwtfj4PPKQmAwXL4SDIH8BOzNXorgyGLEo+XjxdJ+sFmuKTyBLAxsv858kL3SsTPqo8FSjTBmrjCckJwEDLJOfjCjIr2T3zPMkouwc75IPJA8C9yk7m/QmEKps9OT18KaMIDuX+yQHAPcp55RYJ1SlaPXs9LSqKCePlfcoBwMDJpeQvCCMpFj26PdsqcAq55v/KBsBGydLjRwdvKM888j2IK1YLkOeDyw3AzsgC418GuSeFPC8+Miw8DGjoCswYwFnIMuJ3BQEnNzxlPtksIQ1C6ZPMJsDox2XhjgRHJuc7lz5/LQUOHeofzTfAeceY4KUDiyWTO8Y+Ii7oDvjqrs1MwA3Hzt+8As0kPDvyPsIuyw/V60DOZMCkxgXf0wENJOI6Gj9gL60Qs+zUzoDAPsY+3ukASyOFOkA//C+NEZPta8+ewNvFeN0AAIgiJTpiP5UwbRJz7gTQwMB7xbXcF//CIcI5gD8sMU0TU++g0ObAHsXz2y3++yBcOZw/wDErFDXwPtEOwcTEM9tE/TIg8zi0P1IyCBUY8d7ROsFtxHXaW/xoH4c4yT/hMuMV+/GB0mnBGcS52XL7mx4YONo/bTO+Ft/yJ9ObwcnD/9iJ+s4dpzfoP/YzmBfE887T0cF7w0fYofn+HDI38z99NHAYqvR41ArCMcOR17n4Lhy6Nvo/ATVHGZD1JdVGwurC3dbR91sbQDb/P4M1HRp29tPVhcKmwivW6vaHGsM1/z8CNvIaXfeE1sfCZcJ81QP2shlDNf0/fTbFG0X4N9cNwyfCztQd9dwYwDT3P/Y2lhwt+evXVsPtwSPUN/QEGDo07j9tN2YdFfqj2KLDtsF601LzKxeyM+E/4Dc1Hv36XNnxw4LB1NJt8lEWJzPSP1A4Ah/m+xfaQ8RRwTDSifF2FZkyvz++OM0fz/zU2pjEJMGO0abwmRQJMqg/KDmXILn9k9vwxPnA7tDE77wTdjGOP5A5XyGi/lTcTMXTwFHQ4+7dEuEwcT/0OSUii/8W3arFr8C3zwLu+BEfMPU+3zmPInMAXN4Ix8jBLdCW7asQVS4+PcY4bCJRAfTf28hBw9bQO+1oD48shjulNz0iIwKE4avKv8SK0evsLw7QKs05fTYDIukCDON4zEHGR9Ko7AENFikTOE41viGkA4vkQ87Hxw7TcezdC2MnWDYYNG4hUwQC5gvQUcne00bsxQq1JZ002zISIfUEb+fQ0d/Kt9Qm7LcJDiTiMpcxrCCMBdToktNwzJnVE+y0CG4iKDFOMDsgGAYv6k/VBM6E1gvsvAfUIG0v/i7AH5cGgesJ15rPd9cP7M8GQR+0LagtOh8KB8nsv9g00XPYHuzuBbYd+ytNLKkecgcI7nDaz9J42TnsGAUyHEMq7SoOHs0HPe8d3G3UhNpg7EwEtRqNKIcpah0dCGjwxd0M1pjbkuyNA0AZ2SYcKLscYQiJ8Wjfrde03M/s2QLTFyYlrSYCHJkIoPIG4U/Z190Y7TACbxZ2IzklQBvGCKzznuLz2gHfa+2SARIVyCHBI3Qa5giv9DHkl9wz4MrtAQG+Ex0gRSKfGfsIpvW+5Tzea+E07nsAcxJ0HsYgwRgECZT2Refh36riqO4AADARzxxCH9oXAQl298XohuHv4yfvkf/2Dy0bvB3qFvMITvg/6ivjO+Wx7y7/xQ6PGTMc8RXZCBv5suvP5IzmRfDW/p4N9RenGvAUtAjd+R7tc+bj5+Twi/5/DF4WGBnnE4MIlfqE7hboQOmM8Ur+awvMFIcX1RJHCEH74u+36aHqP/IW/mAKPxP0FbwRAAjh+zjxWOsI7Pzy7f1eCbYRYBSbEK0Hd/yH8vbsdO3C89D9ZwgyEMoScg9PBwH9zvOT7uXuk/S//XoHsw4yEUIO5gaA/Q31LfBZ8Gz1uf2WBjoNmg8LDXIG9P1D9sXx0vFQ9r/9vQXGCwAOzQvzBVz+cvdb80/zPPfR/e8EWQpnDIgKagW5/pj48fTP9DH47/0rBPEIzQo9CdUECv+1+Xz2U/Yv+Rb+cQOQBzMJ6wc2BFD/yfoI+Nr3NvpL/sICNQaZB5QGjQOK/9X7kflk+Ub7iv4eAuAEAAY2BdkCuf/X/BX78fpe/NX+hQGTA2cE0wMbAtz/0P2W/ID8fv0s//YATQLPAmoCUwHz/7/+Ev4R/qb+jv9zAA4BOQH8AIEA//+l/4n/pP/W//v/";

// Module-level audio element — shared across component mounts
let beepAudio: HTMLAudioElement | null = null;

// Call this during a user gesture (e.g., button click) to unlock audio on iOS
export function initBeepAudio(): void {
  try {
    if (!beepAudio) {
      beepAudio = new Audio(BEEP_DATA_URI);
      beepAudio.preload = "auto";
      beepAudio.volume = 1.0;
    }
    // iOS unlock: play during user gesture, then immediately pause
    beepAudio.currentTime = 0;
    const playPromise = beepAudio.play();
    if (playPromise) {
      playPromise.then(() => {
        setTimeout(() => {
          beepAudio?.pause();
          if (beepAudio) beepAudio.currentTime = 0;
        }, 1);
      }).catch(() => {});
    }
  } catch {
    // Not supported
  }
}

// Play the beep sound
function playBeep(): void {
  if (!beepAudio) return;
  try {
    beepAudio.currentTime = 0;
    beepAudio.play().catch(() => {});
  } catch {
    // Not supported
  }
}

interface CameraScannerProps {
  onScan: (barcode: string, type: BarcodeType) => void;
  onClose: () => void;
  isProcessing: boolean;
  scanError: string | null;
  onDismissError: () => void;
}

type ScannerState = "idle" | "requesting" | "active" | "error";

export function CameraScanner({ onScan, onClose, isProcessing, scanError, onDismissError }: CameraScannerProps) {
  const viewfinderRef = useRef<HTMLDivElement>(null);
  const [scannerState, setScannerState] = useState<ScannerState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isRunningRef = useRef(false);
  const isMountedRef = useRef(true);
  // Keep latest onScan in a ref so the effect never needs it as a dependency
  const onScanRef = useRef(onScan);
  useEffect(() => { onScanRef.current = onScan; }, [onScan]);


  // Single confirmed decode is enough — look-away lock prevents repeat scans
  const LOOK_AWAY_FRAMES = 15;
  const lockedCodeRef = useRef<string | null>(null);
  const missFramesRef = useRef(0);
  // Retry trigger: incrementing this reruns the start effect
  const [retryCount, setRetryCount] = useState(0);

  // Ref so the onDetected closure always sees the latest scanError without re-registering
  const scanErrorRef = useRef<string | null>(null);
  useEffect(() => {
    scanErrorRef.current = scanError;
  }, [scanError]);

  // Ref so the onDetected closure always sees the latest isProcessing without re-registering
  const isProcessingRef = useRef(false);
  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

  const stopScanner = useCallback(() => {
    if (isRunningRef.current) {
      try {
        Quagga.stop();
      } catch {
        // ignore errors during stop
      }
      isRunningRef.current = false;
    }
  }, []);

  // Tear down on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopScanner();
    };
  }, [stopScanner]);

  // Start the scanner (re-runs on retryCount change)
  useEffect(() => {
    if (!viewfinderRef.current) return;
    const target = viewfinderRef.current;

      void (async () => {
      if (!isMountedRef.current) return;
      setScannerState("requesting");
      setErrorMessage(null);

      try {
        await new Promise<void>((resolve, reject) => {
          Quagga.init(
            {
              inputStream: {
                type: "LiveStream",
                target,
                constraints: {
                  facingMode: "environment",
                  width: { min: 640, ideal: 1280, max: 1920 },
                  height: { min: 480, ideal: 720, max: 1080 },
                },
              },
              decoder: {
                readers: ["ean_reader", "ean_8_reader", "upc_reader"],
                multiple: false,
              },
              locate: true,
              locator: {
                patchSize: "medium",
                halfSample: false,
              },
            },
            (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            }
          );
        });

        if (!isMountedRef.current) return;

        Quagga.start();
        isRunningRef.current = true;
        setScannerState("active");

        // Apply continuous autofocus via applyConstraints after stream starts
        // (focusMode in getUserMedia constraints is not reliably supported)
        try {
          const track = Quagga.CameraAccess.getActiveTrack();
          if (track) {
            const caps = track.getCapabilities() as MediaTrackCapabilities & { focusMode?: string[] };
            if (caps.focusMode?.includes("continuous")) {
              await track.applyConstraints({
                // @ts-expect-error — focusMode not in TS lib but widely supported on Android/iOS
                focusMode: "continuous",
              });
            }
          }
        } catch {
          // Autofocus not supported on this device — continue without it
        }

        Quagga.onDetected((result) => {
          const code = result.codeResult?.code;
          if (!code) return;

          // Check confidence via decodedCodes errors — lower is better
          // Filter to valid error values (numbers, not NaN/undefined)
          const errors = result.codeResult?.decodedCodes
            ?.map((d: { error?: number }) => d.error)
            .filter((e): e is number => typeof e === "number" && !isNaN(e));
          
          if (errors && errors.length > 0) {
            const avgError = errors.reduce((a, b) => a + b, 0) / errors.length;
            // Reject low-confidence scans (threshold ~0.1 is reasonably strict)
            if (avgError > 0.1) return;
          }

          // Skip if this code is already locked (scanned, awaiting look-away)
          if (lockedCodeRef.current === code) {
            missFramesRef.current = 0;
            return;
          }

          // Don't scan while a scan error is waiting for user dismissal
          if (scanErrorRef.current) return;

          // Don't register new scans while processing a previous scan
          if (isProcessingRef.current) return;

          // Lock and fire immediately — look-away handles repeat prevention
          lockedCodeRef.current = code;
          missFramesRef.current = 0;

          playBeep();
          const info = parseBarcodeInfo(code);
          onScanRef.current(info.code, info.type);
        });

        // Track frames where the locked code is NOT detected, to unlock after look-away
        Quagga.onProcessed((result) => {
          const detected = result?.codeResult?.code;

          // Manage look-away unlock for locked code
          if (lockedCodeRef.current) {
            if (detected !== lockedCodeRef.current) {
              missFramesRef.current += 1;
              if (missFramesRef.current >= LOOK_AWAY_FRAMES) {
                lockedCodeRef.current = null;
                missFramesRef.current = 0;
              }
            } else {
              missFramesRef.current = 0;
            }
          }

          // Reset pending confirmation only if a *different* code is confidently detected
          // (not on null/empty frames — those are just frames where Quagga found nothing)
        });
      } catch (err) {
        if (!isMountedRef.current) return;
        let msg = "Failed to start camera. Please try again.";
        if (err instanceof Error) {
          if (err.name === "NotAllowedError") {
            msg = "Camera access denied. Please allow camera access and try again.";
          } else if (err.name === "NotFoundError") {
            msg = "No camera found on this device.";
          } else if (err.name === "NotSupportedError" || err.message?.includes("https")) {
            msg = "Camera requires a secure connection (HTTPS). Cannot use camera over HTTP.";
          } else if (err.name === "OverconstrainedError") {
            msg = "Camera does not support the required settings. Try again.";
          } else {
            msg = `Camera error (${err.name}): ${err.message}`;
          }
        }
        setErrorMessage(msg);
        setScannerState("error");
      }
    })();

    return () => {
      stopScanner();
    };
  }, [retryCount, stopScanner]);

  return (
    <VStack gap={0} align="stretch">
      {/* Viewfinder area */}
      <Box
        position="relative"
        width="100%"
        bg="black"
        borderRadius="lg"
        overflow="hidden"
        style={{ aspectRatio: "4/3" }}
      >
        {/* Quagga mounts the video element here */}
        <Box
          ref={viewfinderRef}
          width="100%"
          height="100%"
          className="quagga-viewport"
        />

        {/* Scanning overlay: aim rectangle */}
        {scannerState === "active" && (
          <Box
            position="absolute"
            inset={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            pointerEvents="none"
          >
            <Box
              width="70%"
              height="35%"
              border="2px solid"
              borderColor={isProcessing ? "green.400" : "white"}
              borderRadius="md"
              opacity={0.8}
              transition="border-color 0.3s"
            />
          </Box>
        )}

        {/* Requesting camera state */}
        {scannerState === "requesting" && (
          <Flex
            position="absolute"
            inset={0}
            align="center"
            justify="center"
            direction="column"
            gap={3}
            style={{ background: "rgba(0,0,0,0.7)" }}
          >
            <Spinner size="lg" color="white" />
            <Text color="white" fontSize="sm">
              Starting camera...
            </Text>
          </Flex>
        )}

        {/* Error state (camera init failed) */}
        {scannerState === "error" && (
          <Flex
            position="absolute"
            inset={0}
            align="center"
            justify="center"
            direction="column"
            gap={4}
            style={{ background: "rgba(0,0,0,0.85)" }}
            p={6}
          >
            <Icon fontSize="2xl" color="red.400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </Icon>
            <Text color="white" textAlign="center" fontSize="sm">
              {errorMessage}
            </Text>
            <Button size="sm" colorPalette="blue" onClick={() => setRetryCount((n) => n + 1)}>
              Try Again
            </Button>
          </Flex>
        )}

        {/* Scan error overlay — only shown when not actively processing */}
        {scanError && scannerState === "active" && !isProcessing && (
          <Flex
            position="absolute"
            inset={0}
            align="center"
            justify="center"
            direction="column"
            gap={5}
            style={{ background: "rgba(0,0,0,0.88)" }}
            p={6}
          >
            <Box
              bg="red.500"
              borderRadius="full"
              p={3}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon fontSize="2xl" color="white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </Icon>
            </Box>
            <Text
              color="white"
              textAlign="center"
              fontSize="md"
              fontWeight="semibold"
              lineHeight="short"
            >
              {scanError}
            </Text>
            <Button
              colorPalette="red"
              size="lg"
              width="100%"
              onClick={() => {
                lockedCodeRef.current = null;
                missFramesRef.current = 0;
                onDismissError();
              }}
            >
              Dismiss & Scan Again
            </Button>
          </Flex>
        )}

        {/* Processing overlay */}
        {scannerState === "active" && (
          <Flex
            position="absolute"
            inset={0}
            align="center"
            justify="center"
            style={{
              background: "rgba(0,0,0,0.5)",
              opacity: isProcessing ? 1 : 0,
              pointerEvents: isProcessing ? "auto" : "none",
              transition: "opacity 0.2s ease",
            }}
          >
            <Flex
              align="center"
              gap={2}
              bg="green.500"
              px={4}
              py={2}
              borderRadius="full"
            >
              <Spinner size="xs" color="white" />
              <Text color="white" fontSize="sm" fontWeight="semibold">
                Processing...
              </Text>
            </Flex>
          </Flex>
        )}
      </Box>

      {/* Hint text */}
      {scannerState === "active" && !isProcessing && (
        <Text
          textAlign="center"
          fontSize="xs"
          color="gray.500"
          _dark={{ color: "gray.400" }}
          mt={2}
        >
          Point camera at barcode to scan
        </Text>
      )}

      {/* Close button */}
      <Button
        mt={3}
        variant="outline"
        colorPalette="gray"
        size="sm"
        onClick={() => {
          stopScanner();
          onClose();
        }}
      >
        Close Camera
      </Button>
    </VStack>
  );
}
