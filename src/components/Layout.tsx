import { Box, Flex, Link, Button, HStack, useColorModeValue } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'

interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const bg = useColorModeValue('white', 'gray.800')

  return (
    <Box minH="100vh">
      <Box as="nav" bg={bg} px={4} py={4} shadow="sm">
        <Flex maxW="1200px" mx="auto" align="center" justify="space-between">
          <HStack spacing={8}>
            <Link as={RouterLink} to="/" fontWeight="bold" fontSize="xl">
              Empathy Ledger
            </Link>
            <HStack spacing={4}>
              <Link as={RouterLink} to="/media">Media</Link>
              <Link as={RouterLink} to="/themes">Themes</Link>
              <Link as={RouterLink} to="/storytellers">Storytellers</Link>
              <Link as={RouterLink} to="/quotes">Quotes</Link>
              <Link as={RouterLink} to="/galleries">Galleries</Link>
              <Link as={RouterLink} to="/stories">Stories</Link>
              <Link as={RouterLink} to="/tags">Tags</Link>
              <Link as={RouterLink} to="/analysis">Analysis</Link>
              <Link as={RouterLink} to="/visualisations">Visualisations</Link>
              <Link as={RouterLink} to="/test">Test</Link>
            </HStack>
          </HStack>
          <HStack spacing={4}>
            <Button variant="ghost">Sign In</Button>
            <Button colorScheme="blue">Get Started</Button>
          </HStack>
        </Flex>
      </Box>
      <Box as="main" maxW="1200px" mx="auto" px={4} py={8}>
        {children}
      </Box>
    </Box>
  )
}

export default Layout 