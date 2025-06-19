import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Image,
  Link as ChakraLink,
  Grid,
  Card,
  CardBody,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  List,
  ListItem,
  ListIcon,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  Code,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  AspectRatio,
} from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { 
  FiCheckCircle, 
  FiExternalLink,
  FiDownload,
  FiPlay,
  FiImage,
  FiFileText,
  FiUsers,
  FiMapPin,
  FiTrendingUp,
  FiAward
} from 'react-icons/fi'
import { WikiSection } from '../../data/wikiContent'
import ReactMarkdown from 'react-markdown'

interface WikiContentProps {
  section: WikiSection
}

const WikiContent = ({ section }: WikiContentProps) => {
  const cardBg = useColorModeValue('gray.50', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  
  // Custom markdown components
  const markdownComponents = {
    h1: ({ children }: any) => <Heading as="h1" size="xl" mt={8} mb={4}>{children}</Heading>,
    h2: ({ children }: any) => <Heading as="h2" size="lg" mt={6} mb={3}>{children}</Heading>,
    h3: ({ children }: any) => <Heading as="h3" size="md" mt={4} mb={2}>{children}</Heading>,
    p: ({ children }: any) => <Text mb={4} lineHeight="tall">{children}</Text>,
    ul: ({ children }: any) => <List spacing={2} mb={4}>{children}</List>,
    li: ({ children }: any) => <ListItem><ListIcon as={FiCheckCircle} color="green.500" />{children}</ListItem>,
    a: ({ href, children }: any) => <ChakraLink color="orangeSky.primary" href={href} isExternal>{children}</ChakraLink>,
    blockquote: ({ children }: any) => (
      <Alert status="info" variant="left-accent" my={4}>
        <AlertIcon />
        <Box>{children}</Box>
      </Alert>
    ),
    code: ({ children }: any) => <Code colorScheme="orange">{children}</Code>,
    table: ({ children }: any) => <Table variant="simple" size="sm" my={4}>{children}</Table>,
    thead: ({ children }: any) => <Thead>{children}</Thead>,
    tbody: ({ children }: any) => <Tbody>{children}</Tbody>,
    tr: ({ children }: any) => <Tr>{children}</Tr>,
    th: ({ children }: any) => <Th>{children}</Th>,
    td: ({ children }: any) => <Td>{children}</Td>,
  }

  // Render different types of content blocks
  const renderContentBlock = (block: any, index: number) => {
    switch (block.type) {
      case 'stats':
        return (
          <Grid key={index} templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4} my={6}>
            {block.data.map((stat: any, i: number) => (
              <Card key={i} bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                <CardBody>
                  <Stat>
                    <StatLabel>{stat.label}</StatLabel>
                    <StatNumber color="orangeSky.primary">{stat.value}</StatNumber>
                    {stat.help && <StatHelpText>{stat.help}</StatHelpText>}
                  </Stat>
                </CardBody>
              </Card>
            ))}
          </Grid>
        )
      
      case 'gallery':
        return (
          <Grid key={index} templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4} my={6}>
            {block.images.map((image: any, i: number) => (
              <Card key={i} overflow="hidden" cursor="pointer" _hover={{ transform: 'scale(1.02)' }} transition="all 0.2s">
                <AspectRatio ratio={16 / 9}>
                  <Image src={image.src} alt={image.alt} objectFit="cover" />
                </AspectRatio>
                <CardBody>
                  <Text fontSize="sm" fontWeight="medium">{image.caption}</Text>
                </CardBody>
              </Card>
            ))}
          </Grid>
        )
      
      case 'demo-link':
        return (
          <Card key={index} bg="orange.50" borderColor="orange.200" borderWidth="1px" my={6}>
            <CardBody>
              <HStack justify="space-between" align="start">
                <VStack align="start" spacing={2} flex="1">
                  <HStack>
                    <FiPlay />
                    <Heading size="sm">{block.title}</Heading>
                  </HStack>
                  <Text fontSize="sm">{block.description}</Text>
                </VStack>
                <Button
                  as={Link}
                  to={block.link}
                  colorScheme="brand"
                  size="sm"
                  rightIcon={<FiExternalLink />}
                >
                  View Demo
                </Button>
              </HStack>
            </CardBody>
          </Card>
        )
      
      case 'file-download':
        return (
          <Card key={index} borderWidth="1px" borderColor={borderColor} my={4}>
            <CardBody>
              <HStack justify="space-between">
                <HStack>
                  <FiFileText />
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="medium">{block.filename}</Text>
                    <Text fontSize="xs" color="gray.500">{block.description}</Text>
                  </VStack>
                </HStack>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<FiDownload />}
                  onClick={() => console.log('Download:', block.filename)}
                >
                  Download
                </Button>
              </HStack>
            </CardBody>
          </Card>
        )
      
      case 'timeline':
        return (
          <Box key={index} my={6}>
            <VStack align="stretch" spacing={4}>
              {block.events.map((event: any, i: number) => (
                <HStack key={i} align="start" spacing={4}>
                  <Box>
                    <Box w="12px" h="12px" borderRadius="full" bg="orangeSky.primary" />
                    {i < block.events.length - 1 && (
                      <Box w="2px" h="50px" bg="gray.300" ml="5px" mt={2} />
                    )}
                  </Box>
                  <VStack align="start" flex="1">
                    <Badge colorScheme="orange">{event.date}</Badge>
                    <Heading size="sm">{event.title}</Heading>
                    <Text fontSize="sm" color="gray.600">{event.description}</Text>
                  </VStack>
                </HStack>
              ))}
            </VStack>
          </Box>
        )
      
      default:
        return null
    }
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Page Header */}
      <Box>
        <Heading size="2xl" mb={2} color="orangeSky.primary">
          {section.title}
        </Heading>
        {section.description && (
          <Text fontSize="lg" color="gray.600">
            {section.description}
          </Text>
        )}
      </Box>

      <Divider />

      {/* Main Content */}
      {section.content && (
        <Box>
          <ReactMarkdown components={markdownComponents}>
            {section.content}
          </ReactMarkdown>
        </Box>
      )}

      {/* Dynamic Content Blocks */}
      {section.blocks && section.blocks.map((block, index) => renderContentBlock(block, index))}

      {/* Related Links */}
      {section.relatedLinks && (
        <Box mt={8}>
          <Heading size="md" mb={4}>Related Resources</Heading>
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
            {section.relatedLinks.map((link, index) => (
              <Card key={index} borderWidth="1px" borderColor={borderColor} _hover={{ shadow: 'md' }}>
                <CardBody>
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="medium">{link.title}</Text>
                      <Text fontSize="sm" color="gray.500">{link.description}</Text>
                    </VStack>
                    <Button
                      as={link.external ? ChakraLink : Link}
                      href={link.external ? link.url : undefined}
                      to={!link.external ? link.url : undefined}
                      size="sm"
                      variant="ghost"
                      rightIcon={<FiExternalLink />}
                    >
                      View
                    </Button>
                  </HStack>
                </CardBody>
              </Card>
            ))}
          </Grid>
        </Box>
      )}

      {/* Navigation */}
      {(section.prevSection || section.nextSection) && (
        <Box mt={12}>
          <Divider mb={6} />
          <HStack justify="space-between">
            {section.prevSection && (
              <Button
                as={Link}
                to={`/wiki/${section.prevSection.id}`}
                variant="outline"
                size="sm"
              >
                ← {section.prevSection.title}
              </Button>
            )}
            {section.nextSection && (
              <Button
                as={Link}
                to={`/wiki/${section.nextSection.id}`}
                variant="outline"
                size="sm"
                ml="auto"
              >
                {section.nextSection.title} →
              </Button>
            )}
          </HStack>
        </Box>
      )}
    </VStack>
  )
}

export default WikiContent