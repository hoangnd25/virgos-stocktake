import NextImage from "next/image";
import { Box, Flex, Heading, Text, Link } from "@chakra-ui/react";

export default function Home() {
  return (
    <Flex minH="100vh" alignItems="center" justifyContent="center" bg="gray.50" _dark={{ bg: "black" }}>
      <Box
        as="main"
        display="flex"
        flexDirection="column"
        alignItems={{ base: "center", sm: "flex-start" }}
        justifyContent="space-between"
        minH="100vh"
        w="full"
        maxW="3xl"
        py={32}
        px={16}
        bg="white"
        _dark={{ bg: "black" }}
      >
        <Box _dark={{ filter: "invert(1)" }}>
          <NextImage src="/next.svg" alt="Next.js logo" width={100} height={20} priority />
        </Box>
        <Flex flexDirection="column" alignItems={{ base: "center", sm: "flex-start" }} gap={6} textAlign={{ base: "center", sm: "left" }}>
          <Heading as="h1" maxW="xs" fontSize="3xl" fontWeight="semibold" lineHeight={10} letterSpacing="tight">
            To get started, edit the page.tsx file.
          </Heading>
          <Text maxW="md" fontSize="lg" lineHeight={8} color="zinc.600" _dark={{ color: "zinc.400" }}>
            Looking for a starting point or more instructions? Head over to{" "}
            <Link href="https://vercel.com/templates" fontWeight="medium">
              Templates
            </Link>{" "}
            or the{" "}
            <Link href="https://nextjs.org/learn" fontWeight="medium">
              Learning
            </Link>{" "}
            center.
          </Text>
        </Flex>
        <Flex flexDirection={{ base: "column", sm: "row" }} gap={4} fontSize="base" fontWeight="medium">
          <Link
            href="https://vercel.com/new"
            target="_blank"
            rel="noopener noreferrer"
            display="flex"
            h={12}
            w={{ base: "full", md: "158px" }}
            alignItems="center"
            justifyContent="center"
            gap={2}
            borderRadius="full"
            bg="black"
            color="white"
            px={5}
            _hover={{ bg: "gray.800" }}
            _dark={{ bg: "white", color: "black", _hover: { bg: "gray.200" } }}
          >
            <Box _dark={{ filter: "invert(1)" }}>
              <NextImage src="/vercel.svg" alt="Vercel logomark" width={16} height={16} />
            </Box>
            Deploy Now
          </Link>
          <Link
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
            display="flex"
            h={12}
            w={{ base: "full", md: "158px" }}
            alignItems="center"
            justifyContent="center"
            borderRadius="full"
            border="1px solid"
            borderColor="blackAlpha.100"
            px={5}
            _hover={{ borderColor: "transparent", bg: "blackAlpha.50" }}
            _dark={{ borderColor: "whiteAlpha.200", _hover: { bg: "whiteAlpha.100" } }}
          >
            Documentation
          </Link>
        </Flex>
      </Box>
    </Flex>
  );
}
