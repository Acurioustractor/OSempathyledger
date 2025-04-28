import { Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Flex, 
  HStack, 
  Link, 
  Button, 
  useColorMode, 
  useColorModeValue, 
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Text
} from '@chakra-ui/react';
import { MoonIcon, SunIcon, ChevronDownIcon } from '@chakra-ui/icons';

const NavBar = () => {
  const { colorMode, toggleColorMode } = useColorMode()
  const bgColor = useColorModeValue('gray.100', 'gray.900')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Box bg={bgColor} px={4} shadow="sm" borderBottom="1px" borderColor={borderColor}>
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        <HStack spacing={8} alignItems={'center'}>
          <Box fontWeight="bold">Empathy Ledger</Box>
          <HStack as={'nav'} spacing={4} display={{ base: 'none', md: 'flex' }}>
            <Link as={RouterLink} to="/">Home</Link>
            <Link as={RouterLink} to="/media">Media</Link>
            <Link as={RouterLink} to="/themes">Themes</Link>
            <Link as={RouterLink} to="/quotes">Quotes</Link>
            <Link as={RouterLink} to="/stories">Stories</Link>
            <Link as={RouterLink} to="/storytellers">Storytellers</Link>
            <Link as={RouterLink} to="/analysis">Analysis</Link>
            <Link as={RouterLink} to="/visualisations">Visualisations</Link>
            
            <Menu>
              <MenuButton as={Button} variant="ghost" size="sm" rightIcon={<ChevronDownIcon />}>
                Examples
              </MenuButton>
              <MenuList>
                <MenuItem as={RouterLink} to="/map-examples">
                  Map Components
                </MenuItem>
                <MenuItem as={RouterLink} to="/test-google-maps">
                  Google Maps Test
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
  )
}

export default NavBar 