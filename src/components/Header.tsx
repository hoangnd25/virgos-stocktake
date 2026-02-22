"use client";

import { useRouter } from "next/navigation";
import {
  Box,
  Flex,
  Heading,
  Button,
  Badge,
  Text,
} from "@chakra-ui/react";

interface HeaderProps {
  shopUrl: string;
}

export function Header({ shopUrl }: HeaderProps) {
  const router = useRouter();

  const shopDomain = (() => {
    try {
      return new URL(shopUrl).hostname;
    } catch {
      return shopUrl;
    }
  })();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  return (
    <Box
      as="header"
      bg="white"
      _dark={{ bg: "gray.800", borderColor: "gray.700" }}
      borderBottomWidth={1}
      borderColor="gray.200"
      px={4}
      py={3}
      position="sticky"
      top={0}
      zIndex={10}
      boxShadow="sm"
    >
      <Flex align="center" justify="space-between" maxW="1200px" mx="auto">
        <Flex align="center" gap={3}>
          <Box
            bg="blue.600"
            borderRadius="lg"
            w={9}
            h={9}
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="white"
            >
              <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h12v2H3v-2zm0 4h12v2H3v-2zm14-1l4 4-4 4v-3h-4v-2h4v-3z" />
            </svg>
          </Box>
          <Heading size="md" fontWeight="bold" color="gray.900" _dark={{ color: "gray.50" }}>
            PrestaShop Stocktake
          </Heading>
        </Flex>

        <Flex align="center" gap={3}>
          <Badge
            colorPalette="green"
            variant="subtle"
            borderRadius="full"
            px={3}
            py={1}
            display={{ base: "none", sm: "flex" }}
            alignItems="center"
            gap={1}
          >
            <Box w={2} h={2} borderRadius="full" bg="green.500" />
            <Text fontSize="xs">{shopDomain}</Text>
          </Badge>

          <Button
            variant="outline"
            size="sm"
            colorPalette="red"
            onClick={handleLogout}
          >
            Exit
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}
