import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  MenuGroup,
  Portal,
  useDisclosure,
  Tooltip,
  HStack,
  Text,
  useColorModeValue,
  Badge,
  Kbd,
  Icon,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  SearchIcon,
  FilterIcon,
  ShareIcon,
  BookmarkIcon,
  DownloadIcon,
  CopyIcon,
  LinkIcon,
  ImageIcon,
  VideoIcon,
  QuoteIcon,
  PeopleIcon,
  TagIcon,
  CalendarIcon,
  GlobeIcon,
} from '@primer/octicons-react';
import { useNavigate } from 'react-router-dom';
import { useHotkeys } from 'react-hotkeys-hook';
import { useFilters } from '../../context/FilterContext';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType;
  action: () => void;
  shortcut?: string;
  category?: string;
  badge?: string;
  color?: string;
}

interface QuickActionsProps {
  position?: 'fixed' | 'relative';
  showLabels?: boolean;
  context?: 'global' | 'story' | 'gallery' | 'analysis';
  storyId?: string;
  onAction?: (actionId: string) => void;
}

const MotionBox = motion(Box);

export const QuickActions: React.FC<QuickActionsProps> = ({
  position = 'fixed',
  showLabels = false,
  context = 'global',
  storyId,
  onAction,
}) => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { updateFilter } = useFilters();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  
  // Define actions based on context
  const getActions = (): QuickAction[] => {
    const baseActions: QuickAction[] = [
      {
        id: 'search',
        label: 'Search',
        icon: SearchIcon,
        shortcut: 'Cmd+K',
        action: () => {
          document.querySelector<HTMLInputElement>('[data-search-input]')?.focus();
        },
        category: 'Navigate',
      },
      {
        id: 'filter',
        label: 'Filters',
        icon: FilterIcon,
        shortcut: 'F',
        action: () => {
          document.querySelector<HTMLElement>('[data-filter-panel]')?.click();
        },
        category: 'Navigate',
        badge: 'New',
      },
    ];
    
    const storyActions: QuickAction[] = [
      {
        id: 'share',
        label: 'Share Story',
        icon: ShareIcon,
        shortcut: 'S',
        action: () => handleShare(),
        category: 'Story',
      },
      {
        id: 'bookmark',
        label: 'Bookmark',
        icon: BookmarkIcon,
        shortcut: 'B',
        action: () => handleBookmark(),
        category: 'Story',
      },
      {
        id: 'copy-link',
        label: 'Copy Link',
        icon: LinkIcon,
        action: () => handleCopyLink(),
        category: 'Story',
      },
    ];
    
    const createActions: QuickAction[] = [
      {
        id: 'new-story',
        label: 'New Story',
        icon: PlusIcon,
        shortcut: 'N',
        action: () => navigate('/stories/new'),
        category: 'Create',
        color: 'green',
      },
      {
        id: 'add-media',
        label: 'Add Media',
        icon: ImageIcon,
        action: () => navigate('/media/upload'),
        category: 'Create',
      },
      {
        id: 'add-quote',
        label: 'Add Quote',
        icon: QuoteIcon,
        action: () => navigate('/quotes/new'),
        category: 'Create',
      },
    ];
    
    const viewActions: QuickAction[] = [
      {
        id: 'view-stories',
        label: 'Stories',
        icon: BookmarkIcon,
        action: () => navigate('/stories'),
        category: 'View',
      },
      {
        id: 'view-people',
        label: 'People',
        icon: PeopleIcon,
        action: () => navigate('/storytellers'),
        category: 'View',
      },
      {
        id: 'view-themes',
        label: 'Themes',
        icon: TagIcon,
        action: () => navigate('/themes'),
        category: 'View',
      },
      {
        id: 'view-gallery',
        label: 'Gallery',
        icon: ImageIcon,
        action: () => navigate('/gallery'),
        category: 'View',
      },
      {
        id: 'view-map',
        label: 'Map',
        icon: GlobeIcon,
        action: () => navigate('/map'),
        category: 'View',
      },
    ];
    
    const exportActions: QuickAction[] = [
      {
        id: 'export-pdf',
        label: 'Export PDF',
        icon: DownloadIcon,
        action: () => handleExport('pdf'),
        category: 'Export',
      },
      {
        id: 'export-data',
        label: 'Export Data',
        icon: DownloadIcon,
        action: () => handleExport('csv'),
        category: 'Export',
      },
    ];
    
    // Return actions based on context
    switch (context) {
      case 'story':
        return [...baseActions, ...storyActions, ...exportActions];
      case 'gallery':
        return [...baseActions, ...createActions.filter(a => a.id === 'add-media'), ...exportActions];
      case 'analysis':
        return [...baseActions, ...viewActions, ...exportActions];
      default:
        return [...baseActions, ...createActions, ...viewActions];
    }
  };
  
  const handleShare = async () => {
    if (navigator.share && storyId) {
      try {
        await navigator.share({
          title: 'Orange Sky Story',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      handleCopyLink();
    }
  };
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedId('copy-link');
    setTimeout(() => setCopiedId(null), 2000);
    if (onAction) onAction('copy-link');
  };
  
  const handleBookmark = () => {
    // Implement bookmark logic
    console.log('Bookmarking story:', storyId);
    if (onAction) onAction('bookmark');
  };
  
  const handleExport = (format: 'pdf' | 'csv') => {
    console.log(`Exporting as ${format}`);
    if (onAction) onAction(`export-${format}`);
  };
  
  const actions = getActions();
  
  // Register keyboard shortcuts
  useHotkeys('cmd+k, ctrl+k', () => actions.find(a => a.id === 'search')?.action());
  useHotkeys('f', () => actions.find(a => a.id === 'filter')?.action());
  useHotkeys('n', () => actions.find(a => a.id === 'new-story')?.action());
  useHotkeys('s', () => actions.find(a => a.id === 'share')?.action());
  useHotkeys('b', () => actions.find(a => a.id === 'bookmark')?.action());
  
  // Group actions by category
  const groupedActions = actions.reduce((acc, action) => {
    const category = action.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(action);
    return acc;
  }, {} as Record<string, QuickAction[]>);
  
  return (
    <>
      {/* Floating Action Button */}
      <MotionBox
        position={position}
        bottom={position === 'fixed' ? 6 : undefined}
        right={position === 'fixed' ? 6 : undefined}
        zIndex={1000}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <Menu isOpen={isOpen} onClose={onClose}>
          <MenuButton
            as={IconButton}
            aria-label="Quick actions"
            icon={<PlusIcon size={24} />}
            size="lg"
            colorScheme="orange"
            isRound
            shadow="lg"
            onClick={onOpen}
            _hover={{ transform: 'scale(1.1)' }}
            _active={{ transform: 'scale(0.95)' }}
          />
          <Portal>
            <MenuList
              bg={bgColor}
              borderColor={borderColor}
              shadow="xl"
              minW="250px"
              maxH="70vh"
              overflowY="auto"
            >
              {Object.entries(groupedActions).map(([category, categoryActions], index) => (
                <MenuGroup key={category} title={category}>
                  {categoryActions.map(action => (
                    <MenuItem
                      key={action.id}
                      icon={<Icon as={action.icon} />}
                      onClick={() => {
                        action.action();
                        onClose();
                        if (onAction) onAction(action.id);
                      }}
                      command={action.shortcut}
                      _hover={{ bg: hoverBg }}
                    >
                      <HStack justify="space-between" w="full">
                        <Text color={action.color}>{action.label}</Text>
                        <HStack spacing={2}>
                          {action.badge && (
                            <Badge size="sm" colorScheme="green">
                              {action.badge}
                            </Badge>
                          )}
                          {copiedId === action.id && (
                            <Badge size="sm" colorScheme="green">
                              Copied!
                            </Badge>
                          )}
                        </HStack>
                      </HStack>
                    </MenuItem>
                  ))}
                  {index < Object.keys(groupedActions).length - 1 && <MenuDivider />}
                </MenuGroup>
              ))}
            </MenuList>
          </Portal>
        </Menu>
      </MotionBox>
      
      {/* Quick Action Bar (optional) */}
      {showLabels && (
        <HStack
          position={position}
          bottom={position === 'fixed' ? 20 : undefined}
          left="50%"
          transform="translateX(-50%)"
          bg={bgColor}
          p={2}
          borderRadius="full"
          shadow="lg"
          borderWidth="1px"
          borderColor={borderColor}
          spacing={2}
        >
          {actions.slice(0, 5).map(action => (
            <Tooltip key={action.id} label={action.label} hasArrow>
              <IconButton
                aria-label={action.label}
                icon={<Icon as={action.icon} />}
                size="sm"
                variant="ghost"
                onClick={() => {
                  action.action();
                  if (onAction) onAction(action.id);
                }}
              />
            </Tooltip>
          ))}
        </HStack>
      )}
      
      {/* Keyboard Shortcuts Help */}
      <AnimatePresence>
        {isOpen && (
          <MotionBox
            position="fixed"
            bottom={position === 'fixed' ? 24 : 16}
            right={6}
            bg={bgColor}
            p={3}
            borderRadius="md"
            shadow="lg"
            borderWidth="1px"
            borderColor={borderColor}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Text fontSize="xs" color="gray.500" mb={2}>
              Keyboard Shortcuts
            </Text>
            <VStack spacing={1} align="start">
              {actions.filter(a => a.shortcut).slice(0, 5).map(action => (
                <HStack key={action.id} fontSize="xs">
                  <Kbd>{action.shortcut}</Kbd>
                  <Text>{action.label}</Text>
                </HStack>
              ))}
            </VStack>
          </MotionBox>
        )}
      </AnimatePresence>
    </>
  );
};

export default QuickActions;