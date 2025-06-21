import { Box, Flex, HStack, Link, useColorModeValue } from '@chakra-ui/react'
import React from 'react'
import { Link as RouterLink } from 'react-router-dom'

interface LayoutProps {
  children: React.ReactNode
}

const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <Link
    as={RouterLink}
    to={to}
    px={2}
    py={1}
    rounded={'md'}
    _hover={{
      textDecoration: 'none',
      bg: useColorModeValue('gray.200', 'gray.700'),
    }}
  >
    {children}
  </Link>
)

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const bgColor = useColorModeValue('gray.100', 'gray.900')
  const headerBgColor = useColorModeValue('white', 'gray.800')

  return (
    <Box minH="100vh" bg={bgColor}>
      <Box bg={headerBgColor} px={4} shadow="md">
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <HStack spacing={8} alignItems={'center'}>
            <Box fontWeight="bold">Empathy Ledger</Box>
            <HStack as={'nav'} spacing={4} display={{ base: 'none', md: 'flex' }}>
              <NavLink to="/">Home</NavLink>
              <NavLink to="/stories">Stories</NavLink>
              <NavLink to="/media">Media</NavLink>
              <NavLink to="/themes">Themes</NavLink>
              <NavLink to="/quotes">Quotes</NavLink>
              <NavLink to="/wiki">Wiki</NavLink>
            </HStack>
          </HStack>
        </Flex>
      </Box>

      <Box as="main" p={8}>
        {children}
      </Box>

      <Box
        as="footer"
        py={4}
        px={8}
        mt={8}
        textAlign="center"
        borderTop="1px"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
      >
        <p>© {new Date().getFullYear()} Orange Sky. All rights reserved.</p>
      </Box>
    </Box>
  )
}

export default Layout