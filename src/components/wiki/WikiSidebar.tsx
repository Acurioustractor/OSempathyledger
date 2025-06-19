import {
  Box,
  VStack,
  Text,
  Collapse,
  Button,
  Icon,
  useColorModeValue,
  Divider,
} from '@chakra-ui/react'
import { useState } from 'react'
import { 
  FiChevronDown, 
  FiChevronRight,
  FiBookOpen,
  FiMap,
  FiUsers,
  FiTrendingUp,
  FiSettings,
  FiAward,
  FiTarget,
  FiPackage,
  FiGlobe,
  FiCompass
} from 'react-icons/fi'
import { wikiContent, WikiSection } from '../../data/wikiContent'

interface WikiSidebarProps {
  currentSection: string
  onSectionChange: (sectionId: string) => void
  searchQuery?: string
}

const iconMap: { [key: string]: any } = {
  overview: FiBookOpen,
  journey: FiMap,
  implementation: FiSettings,
  collection: FiUsers,
  platform: FiPackage,
  impact: FiTrendingUp,
  recommendations: FiTarget,
  'project-overview': FiCompass,
  'canberra-reflection': FiGlobe,
  'impact-metrics': FiAward,
}

const WikiSidebar = ({ currentSection, onSectionChange, searchQuery = '' }: WikiSidebarProps) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['overview', 'journey', 'implementation'])
  )
  
  const hoverBg = useColorModeValue('gray.50', 'gray.700')
  const activeBg = useColorModeValue('orange.50', 'rgba(255, 107, 10, 0.1)')
  const activeColor = useColorModeValue('orangeSky.primary', 'orange.300')
  const textColor = useColorModeValue('gray.700', 'gray.200')
  const mutedColor = useColorModeValue('gray.500', 'gray.400')

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const filterSections = (sections: WikiSection[]): WikiSection[] => {
    if (!searchQuery) return sections
    
    return sections.filter(section => {
      const matchesSearch = section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.description?.toLowerCase().includes(searchQuery.toLowerCase())
      
      if (section.children) {
        const filteredChildren = filterSections(section.children)
        return matchesSearch || filteredChildren.length > 0
      }
      
      return matchesSearch
    })
  }

  const renderSection = (section: WikiSection, level: number = 0) => {
    const isActive = currentSection === section.id
    const hasChildren = section.children && section.children.length > 0
    const isExpanded = expandedSections.has(section.id)
    const Icon = iconMap[section.id] || FiBookOpen
    
    return (
      <Box key={section.id}>
        <Button
          variant="ghost"
          justifyContent="flex-start"
          w="full"
          pl={level * 4 + 4}
          pr={2}
          py={2}
          h="auto"
          minH="40px"
          bg={isActive ? activeBg : 'transparent'}
          color={isActive ? activeColor : textColor}
          _hover={{ bg: hoverBg }}
          onClick={() => {
            if (hasChildren) {
              toggleSection(section.id)
            }
            onSectionChange(section.id)
          }}
        >
          <Icon as={hasChildren ? (isExpanded ? FiChevronDown : FiChevronRight) : Icon} mr={2} />
          <Text fontSize="sm" fontWeight={isActive ? 'medium' : 'normal'} flex="1" textAlign="left">
            {section.title}
          </Text>
        </Button>
        
        {hasChildren && (
          <Collapse in={isExpanded}>
            <VStack spacing={0} align="stretch">
              {filterSections(section.children!).map(child => renderSection(child, level + 1))}
            </VStack>
          </Collapse>
        )}
      </Box>
    )
  }

  const filteredContent = filterSections(wikiContent)

  return (
    <VStack spacing={4} align="stretch" p={4}>
      {/* Header */}
      <Box>
        <Text fontSize="xs" fontWeight="bold" color={mutedColor} textTransform="uppercase" mb={2}>
          Documentation
        </Text>
        <Divider />
      </Box>

      {/* Navigation */}
      <VStack spacing={0} align="stretch">
        {filteredContent.map(section => renderSection(section))}
      </VStack>

      {/* Footer Info */}
      <Box pt={4} borderTop="1px" borderColor="gray.200">
        <VStack spacing={2} align="start">
          <Text fontSize="xs" color={mutedColor}>
            Orange Sky × Empathy Ledger
          </Text>
          <Text fontSize="xs" color={mutedColor}>
            6-Month Project Report
          </Text>
          <Text fontSize="xs" color={mutedColor}>
            April - June 2024
          </Text>
        </VStack>
      </Box>
    </VStack>
  )
}

export default WikiSidebar