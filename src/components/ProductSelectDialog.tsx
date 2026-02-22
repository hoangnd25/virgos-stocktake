"use client";

import {
  Button,
  CloseButton,
  Dialog,
  Portal,
  Box,
  Flex,
  Text,
  Badge,
} from "@chakra-ui/react";
import type { ProductMatch } from "@/types/prestashop";

interface ProductSelectDialogProps {
  isOpen: boolean;
  products: ProductMatch[];
  onSelect: (product: ProductMatch) => void;
  onCancel: () => void;
}

export function ProductSelectDialog({
  isOpen,
  products,
  onSelect,
  onCancel,
}: ProductSelectDialogProps) {
  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(e) => { if (!e.open) onCancel(); }}
      placement="center"
      motionPreset="slide-in-bottom"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="500px">
            <Dialog.Header>
              <Dialog.Title>Multiple Products Found</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body pb={2}>
              <Text color="gray.600" _dark={{ color: "gray.400" }} mb={4} fontSize="sm">
                Multiple products found. Please select the correct one.
              </Text>

              <Flex direction="column" gap={3}>
                {products.map((product, index) => (
                  <Box
                    key={index}
                    as="button"
                    w="full"
                    textAlign="left"
                    p={4}
                    borderRadius="lg"
                    borderWidth={1}
                    borderColor="gray.200"
                    _dark={{ borderColor: "gray.600", bg: "gray.700", _hover: { bg: "gray.600" } }}
                    bg="gray.50"
                    _hover={{ bg: "blue.50", borderColor: "blue.300" }}
                    transition="all 0.15s"
                    cursor="pointer"
                    onClick={() => onSelect(product)}
                  >
                    <Flex align="flex-start" gap={3}>
                      <Box flex={1} minW={0}>
                        <Flex align="center" gap={2} mb={1} flexWrap="wrap">
                          <Text fontWeight="semibold" fontSize="sm" color="gray.900" _dark={{ color: "gray.50" }}>
                            {product.name}
                          </Text>
                          <Badge
                            colorPalette={product.type === "product" ? "blue" : "purple"}
                            variant="subtle"
                            size="xs"
                          >
                            {product.type === "product" ? "Product" : "Variant"}
                          </Badge>
                        </Flex>
                        {product.reference && (
                          <Text fontSize="xs" color="gray.500" _dark={{ color: "gray.400" }}>
                            REF: {product.reference}
                          </Text>
                        )}
                      </Box>
                    </Flex>
                  </Box>
                ))}
              </Flex>
            </Dialog.Body>

            <Dialog.Footer pt={4}>
              <Button variant="outline" size="sm" onClick={onCancel}>
                Cancel
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
