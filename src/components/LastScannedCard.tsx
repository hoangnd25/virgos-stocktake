"use client";

import {
  Box,
  Card,
  Flex,
  Text,
  Badge,
  Spinner,
} from "@chakra-ui/react";
import type { ScannedItem } from "@/types/stocktake";

interface LastScannedCardProps {
  item: ScannedItem | null;
  isUpdating: boolean;
}

export function LastScannedCard({ item, isUpdating }: LastScannedCardProps) {
  if (isUpdating) {
    return (
      <Card.Root
        bg="white"
        _dark={{ bg: "gray.800" }}
        borderRadius="xl"
        boxShadow="sm"
      >
        <Card.Body p={6}>
          <Text
            fontWeight="semibold"
            fontSize="sm"
            textTransform="uppercase"
            letterSpacing="wider"
            color="gray.500"
            _dark={{ color: "gray.400" }}
            mb={4}
          >
            Last Scanned
          </Text>
          <Flex align="center" justify="center" py={8} gap={3}>
            <Spinner size="md" color="blue.500" />
            <Text color="gray.500" _dark={{ color: "gray.400" }}>
              Updating stock...
            </Text>
          </Flex>
        </Card.Body>
      </Card.Root>
    );
  }

  if (!item) {
    return (
      <Card.Root
        bg="white"
        _dark={{ bg: "gray.800" }}
        borderRadius="xl"
        boxShadow="sm"
      >
        <Card.Body p={6}>
          <Text
            fontWeight="semibold"
            fontSize="sm"
            textTransform="uppercase"
            letterSpacing="wider"
            color="gray.500"
            _dark={{ color: "gray.400" }}
            mb={4}
          >
            Last Scanned
          </Text>
          <Flex align="center" justify="center" py={8}>
            <Text color="gray.400" _dark={{ color: "gray.600" }} fontSize="md">
              No items scanned yet
            </Text>
          </Flex>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root
      bg="white"
      _dark={{ bg: "gray.800" }}
      borderRadius="xl"
      boxShadow="sm"
      className="animate-slide-up animate-flash-green"
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
            Last Scanned
          </Text>
          <Badge colorPalette="green" variant="solid" borderRadius="full" px={3}>
            +{item.quantityAdded} ✓
          </Badge>
        </Flex>

        <Flex gap={4} align="flex-start">
          {item.imageUrl ? (
            <Box
              flexShrink={0}
              w="64px"
              h="64px"
              borderRadius="lg"
              overflow="hidden"
              bg="gray.100"
              _dark={{ bg: "gray.700" }}
              position="relative"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt={item.productName}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>
          ) : (
            <Box
              flexShrink={0}
              w="64px"
              h="64px"
              borderRadius="lg"
              bg="gray.100"
              _dark={{ bg: "gray.700" }}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize="2xl">📦</Text>
            </Box>
          )}

          <Box flex={1} minW={0}>
            <Text
              fontWeight="bold"
              fontSize="lg"
              color="gray.900"
              _dark={{ color: "gray.50" }}
              lineClamp={2}
              mb={1}
            >
              {item.productName}
            </Text>
            <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }} mb={2}>
              {item.reference && `REF: ${item.reference}`}
              {item.reference && item.barcode && " | "}
              {item.barcode && `${item.barcodeType}: ${item.barcode}`}
            </Text>
            <Flex align="center" gap={2}>
              <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }}>
                Stock:
              </Text>
              <Text fontWeight="semibold" fontSize="sm" color="gray.700" _dark={{ color: "gray.300" }}>
                {item.previousStock}
              </Text>
              <Text fontSize="sm" color="gray.400">→</Text>
              <Text fontWeight="bold" fontSize="sm" color="green.600" _dark={{ color: "green.400" }}>
                {item.newStock}
              </Text>
            </Flex>
          </Box>
        </Flex>
      </Card.Body>
    </Card.Root>
  );
}
