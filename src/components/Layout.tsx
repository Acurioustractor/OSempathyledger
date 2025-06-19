import { Box, Flex, Link, Button, HStack, useColorModeValue, useColorMode, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { MoonIcon, SunIcon, ChevronDownIcon } from '@chakra-ui/icons'

interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const { colorMode, toggleColorMode } = useColorMode()
  const bgColor = useColorModeValue('gray.100', 'gray.900')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Box minH="100vh">
      <Box bg={bgColor} px={4} shadow="sm" borderBottom="1px" borderColor={borderColor}>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <HStack spacing={8} alignItems={'center'}>
            <Box fontWeight="bold" color="orangeSky.primary">Orange Sky Empathy Ledger</Box>
            <HStack as={'nav'} spacing={4} display={{ base: 'none', md: 'flex' }}>
              <Link as={RouterLink} to="/">Home</Link>
              <Link as={RouterLink} to="/team-experience" color="orangeSky.primary" fontWeight="medium">
                Team Experience
              </Link>
              <Link as={RouterLink} to="/wiki" color="orangeSky.primary" fontWeight="medium">
                Project Wiki
              </Link>
              <Link as={RouterLink} to="/stories">Stories</Link>
              <Link as={RouterLink} to="/storytellers">Storytellers</Link>
              <Link as={RouterLink} to="/analysis">Analysis</Link>
              
              <Menu>
                <MenuButton as={Button} variant="ghost" size="sm" rightIcon={<ChevronDownIcon />}>
                  Vision
                </MenuButton>
                <MenuList>
                  <MenuItem as={RouterLink} to="/vision">
                    Future Vision
                  </MenuItem>
                  <MenuItem as={RouterLink} to="/visualization">
                    Visualization Hub
                  </MenuItem>
                  <MenuItem as={RouterLink} to="/impact">
                    Impact Analytics
                  </MenuItem>
                </MenuList>
              </Menu>
              
              <Menu>
                <MenuButton as={Button} variant="ghost" size="sm" rightIcon={<ChevronDownIcon />}>
                  More
                </MenuButton>
                <MenuList>
                  <MenuItem as={RouterLink} to="/media">
                    Media
                  </MenuItem>
                  <MenuItem as={RouterLink} to="/themes">
                    Themes
                  </MenuItem>
                  <MenuItem as={RouterLink} to="/quotes">
                    Quotes
                  </MenuItem>
                  <MenuItem as={RouterLink} to="/visualisations">
                    Visualisations
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </HStack>
          <Flex alignItems={'center'}>
            <Button onClick={toggleColorMode} size="sm" mr={4}>
              {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            </Button>
          </Flex>
        </Flex>
      </Box>
      <Box as="main" maxW="container.xl" mx="auto" px={4} py={8}>
        {children}
      </Box>
    </Box>
  )
}

export default Layout