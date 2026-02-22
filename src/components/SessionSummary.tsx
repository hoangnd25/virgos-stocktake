"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  Flex,
  Table,
  Text,
  Badge,
} from "@chakra-ui/react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { ScannedItem } from "@/types/stocktake";

interface SessionSummaryProps {
  items: ScannedItem[];
  onClear: () => void;
}

export function SessionSummary({ items, onClear }: SessionSummaryProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const totalScans = items.reduce((acc, item) => acc + item.quantityAdded, 0);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      <Card.Root
        bg="white"
        _dark={{ bg: "gray.800" }}
        borderRadius="xl"
        boxShadow="sm"
        overflow="hidden"
      >
        <Card.Header p={6} pb={4}>
          <Flex justify="space-between" align="center">
            <Text
              fontWeight="semibold"
              fontSize="sm"
              textTransform="uppercase"
              letterSpacing="wider"
              color="gray.500"
              _dark={{ color: "gray.400" }}
            >
              Session Summary
            </Text>
            <Badge colorPalette="blue" variant="subtle" borderRadius="full" px={3}>
              Total: {totalScans} scan{totalScans !== 1 ? "s" : ""}
            </Badge>
          </Flex>
        </Card.Header>

        {items.length === 0 ? (
          <Card.Body px={6} pb={6} pt={0}>
            <Flex align="center" justify="center" py={8}>
              <Text color="gray.400" _dark={{ color: "gray.600" }} fontSize="md">
                No items scanned this session
              </Text>
            </Flex>
          </Card.Body>
        ) : (
          <>
            <Box overflowX="auto" maxH="360px" overflowY="auto">
              <Table.Root size="sm" interactive>
                <Table.Header>
                  <Table.Row bg="gray.50" _dark={{ bg: "gray.750" }}>
                    <Table.ColumnHeader
                      fontWeight="semibold"
                      color="gray.600"
                      _dark={{ color: "gray.400" }}
                      pl={6}
                    >
                      Product
                    </Table.ColumnHeader>
                    <Table.ColumnHeader
                      fontWeight="semibold"
                      color="gray.600"
                      _dark={{ color: "gray.400" }}
                    >
                      Reference
                    </Table.ColumnHeader>
                    <Table.ColumnHeader
                      fontWeight="semibold"
                      color="gray.600"
                      _dark={{ color: "gray.400" }}
                      textAlign="center"
                    >
                      Qty Added
                    </Table.ColumnHeader>
                    <Table.ColumnHeader
                      fontWeight="semibold"
                      color="gray.600"
                      _dark={{ color: "gray.400" }}
                      textAlign="right"
                      pr={6}
                    >
                      Last Scan
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {items.map((item) => (
                    <Table.Row
                      key={item.id}
                      _hover={{ bg: "gray.50", _dark: { bg: "gray.750" } }}
                      transition="background 0.1s"
                    >
                      <Table.Cell pl={6} maxW="200px">
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color="gray.900"
                          _dark={{ color: "gray.100" }}
                          overflow="hidden"
                          textOverflow="ellipsis"
                          whiteSpace="nowrap"
                        >
                          {item.productName}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }} fontFamily="mono">
                          {item.reference || "—"}
                        </Text>
                      </Table.Cell>
                      <Table.Cell textAlign="center">
                        <Badge colorPalette="green" variant="subtle">
                          +{item.quantityAdded}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell textAlign="right" pr={6}>
                        <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }}>
                          {formatTime(item.lastScannedAt)}
                        </Text>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>

            <Card.Footer px={6} py={4} borderTopWidth={1} borderColor="gray.100" _dark={{ borderColor: "gray.700" }}>
              <Flex justify="flex-end" w="full">
                <Button
                  variant="outline"
                  colorPalette="red"
                  size="sm"
                  onClick={() => setConfirmOpen(true)}
                >
                  Clear Session
                </Button>
              </Flex>
            </Card.Footer>
          </>
        )}
      </Card.Root>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Clear Session"
        description="Are you sure you want to clear all scanned items? This cannot be undone."
        confirmLabel="Clear"
        onConfirm={() => {
          onClear();
          setConfirmOpen(false);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
