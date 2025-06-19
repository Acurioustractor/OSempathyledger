import {
  Box,
  Flex,
  VStack,
  Heading,
  Text,
  useColorModeValue,
  Container,
  Button,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  FiSearch, 
  FiHome, 
  FiChevronRight,
  FiPrinter,
  FiDownload,
  FiExternalLink
} from 'react-icons/fi'
import WikiSidebar from '../components/wiki/WikiSidebar'
import WikiContent from '../components/wiki/WikiContent'
import { wikiContent, WikiSection } from '../data/wikiContent'

const ProjectWiki = () => {
  const { sectionId = 'overview' } = useParams()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentSection, setCurrentSection] = useState<WikiSection | null>(null)
  
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const sidebarBg = useColorModeValue('white', 'gray.800')
  const contentBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    // Find current section from wiki content
    const findSection = (sections: WikiSection[], id: string): WikiSection | null => {
      for (const section of sections) {
        if (section.id === id) return section
        if (section.children) {
          const found = findSection(section.children, id)
          if (found) return found
        }
      }
      return null
    }
    
    const section = findSection(wikiContent, sectionId)
    setCurrentSection(section)
  }, [sectionId])

  const handleSectionChange = (newSectionId: string) => {
    navigate(`/wiki/${newSectionId}`)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    // In a real implementation, this would generate a PDF
    console.log('Exporting wiki as PDF...')
  }

  const getBreadcrumbs = () => {
    const crumbs = [{ label: 'Wiki', path: '/wiki' }]
    
    if (currentSection) {
      // Build breadcrumb trail
      const findParents = (sections: WikiSection[], target: string, path: any[] = []): any[] | null => {
        for (const section of sections) {
          if (section.id === target) {
            return [...path, { label: section.title, path: `/wiki/${section.id}` }]
          }
          if (section.children) {
            const found = findParents(section.children, target, [...path, { label: section.title, path: `/wiki/${section.id}` }])
            if (found) return found
          }
        }
        return null
      }
      
      const trail = findParents(wikiContent, sectionId) || []
      return [...crumbs, ...trail]
    }
    
    return crumbs
  }

  return (
    <Box minH="100vh" bg={bgColor}>
      {/* Top Navigation Bar */}
      <Box 
        bg={contentBg} 
        borderBottom="1px" 
        borderColor={borderColor}
        position="sticky"
        top="0"
        zIndex="10"
        px={6}
        py={3}
      >
        <Flex justify="space-between" align="center">
          <HStack spacing={4}>
            <Heading size="md" color="orangeSky.primary">
              Orange Sky Empathy Ledger
            </Heading>
            <Text color="gray.500" fontSize="sm">Project Documentation</Text>
          </HStack>
          
          <HStack spacing={3}>
            <InputGroup size="sm" maxW="300px">
              <InputLeftElement>
                <FiSearch />
              </InputLeftElement>
              <Input
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
            
            <IconButton
              aria-label="Print"
              icon={<FiPrinter />}
              size="sm"
              variant="ghost"
              onClick={handlePrint}
            />
            
            <Button
              leftIcon={<FiDownload />}
              size="sm"
              variant="outline"
              onClick={handleExport}
            >
              Export PDF
            </Button>
            
            <Button
              as={Link}
              to="/"
              leftIcon={<FiExternalLink />}
              size="sm"
              colorScheme="brand"
            >
              View Platform
            </Button>
          </HStack>
        </Flex>
      </Box>

      <Flex>
        {/* Sidebar */}
        <Box
          w="280px"
          bg={sidebarBg}
          borderRight="1px"
          borderColor={borderColor}
          h="calc(100vh - 60px)"
          position="sticky"
          top="60px"
          overflowY="auto"
          className="wiki-sidebar"
        >
          <WikiSidebar 
            currentSection={sectionId}
            onSectionChange={handleSectionChange}
            searchQuery={searchQuery}
          />
        </Box>

        {/* Main Content */}
        <Box flex="1" overflowY="auto">
          <Container maxW="container.xl" py={8}>
            {/* Breadcrumbs */}
            <Breadcrumb 
              spacing='8px' 
              separator={<FiChevronRight color='gray.500' />}
              mb={6}
            >
              <BreadcrumbItem>
                <BreadcrumbLink as={Link} to="/">
                  <FiHome />
                </BreadcrumbLink>
              </BreadcrumbItem>
              {getBreadcrumbs().map((crumb, index) => (
                <BreadcrumbItem key={index}>
                  <BreadcrumbLink 
                    as={Link} 
                    to={crumb.path}
                    isCurrentPage={index === getBreadcrumbs().length - 1}
                  >
                    {crumb.label}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              ))}
            </Breadcrumb>

            {/* Content Area */}
            <Box
              bg={contentBg}
              borderRadius="lg"
              shadow="sm"
              p={8}
              minH="600px"
            >
              {currentSection ? (
                <WikiContent section={currentSection} />
              ) : (
                <VStack spacing={4} py={20}>
                  <Heading size="lg" color="gray.400">
                    Section not found
                  </Heading>
                  <Text color="gray.500">
                    Please select a section from the sidebar
                  </Text>
                  <Button
                    as={Link}
                    to="/wiki/overview"
                    colorScheme="brand"
                    size="sm"
                  >
                    Go to Overview
                  </Button>
                </VStack>
              )}
            </Box>
          </Container>
        </Box>
      </Flex>

      {/* Print Styles */}
      <style>{`
        @media print {
          .wiki-sidebar {
            display: none;
          }
          .chakra-button {
            display: none;
          }
          .chakra-input {
            display: none;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </Box>
  )
}

export default ProjectWiki