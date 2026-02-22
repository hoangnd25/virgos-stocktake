"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Field,
  Input,
  Text,
  VStack,
  Alert,
  Spinner,
} from "@chakra-ui/react";
import type { Credentials } from "@/types/stocktake";

export function LoginForm() {
  const router = useRouter();
    const [shopUrl, setShopUrl] = useState("https://virgosfamily.com");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const normalizedUrl = shopUrl.trim().replace(/\/$/, "");
    const trimmedKey = apiKey.trim();

    try {
      const response = await fetch("/api/auth/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopUrl: normalizedUrl, apiKey: trimmedKey } as Credentials),
      });

      const data = await response.json() as { success?: boolean; error?: string };

      if (!response.ok) {
        setError(data.error ?? "Connection failed");
        return;
      }

      router.push("/stocktake");
    } catch {
      setError("Connection failed. Check your internet connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      bg="white"
      _dark={{ bg: "gray.800" }}
      borderRadius="xl"
      boxShadow="md"
      p={8}
      w="full"
      maxW="420px"
    >
      <VStack gap={6} align="stretch">
        <Field.Root required>
          <Field.Label fontWeight="medium">Shop URL</Field.Label>
          <Input
            type="url"
            placeholder="https://myshop.com"
            value={shopUrl}
            onChange={(e) => setShopUrl(e.target.value)}
            disabled={isLoading}
            size="lg"
            required
          />
          <Field.HelperText>Your PrestaShop store address</Field.HelperText>
        </Field.Root>

        <Field.Root required>
          <Field.Label fontWeight="medium">API Key</Field.Label>
          <Box position="relative" w="full">
            <Input
              type={showApiKey ? "text" : "password"}
              placeholder="Your PrestaShop API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={isLoading}
              size="lg"
              required
              fontFamily="mono"
              pr="80px"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              position="absolute"
              right={1}
              top="50%"
              transform="translateY(-50%)"
              zIndex={1}
              onClick={() => setShowApiKey((v) => !v)}
              h="32px"
              minW="60px"
              fontSize="xs"
            >
              {showApiKey ? "Hide" : "Show"}
            </Button>
          </Box>
        </Field.Root>

        {error && (
          <Alert.Root status="error" borderRadius="md">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>{error}</Alert.Description>
            </Alert.Content>
          </Alert.Root>
        )}

        <Button
          type="submit"
          colorPalette="blue"
          size="lg"
          w="full"
          disabled={isLoading || !shopUrl || !apiKey}
          fontWeight="semibold"
          mt={2}
        >
          {isLoading ? (
            <>
              <Spinner size="sm" mr={2} />
              Connecting...
            </>
          ) : (
            "Connect to Shop"
          )}
        </Button>

        <Text textAlign="center" fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }}>
          Your credentials are stored securely in your session
        </Text>
      </VStack>
    </Box>
  );
}
