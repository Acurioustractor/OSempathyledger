import React from 'react';
import {
  Box,
  BoxProps,
  useColorModeValue,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface AppleCardProps extends BoxProps, Omit<HTMLMotionProps<"div">, keyof BoxProps> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'interactive';
  glassEffect?: boolean;
  hoverScale?: number;
  onClick?: () => void;
}

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const MotionBox = motion(Box);

const AppleCard: React.FC<AppleCardProps> = ({
  children,
  variant = 'default',
  glassEffect = true,
  hoverScale = 1.02,
  onClick,
  ...props
}) => {
  const bgColor = useColorModeValue(
    glassEffect ? 'rgba(255, 255, 255, 0.8)' : 'white',
    glassEffect ? 'rgba(26, 32, 44, 0.8)' : 'gray.800'
  );
  
  const borderColor = useColorModeValue(
    'rgba(255, 255, 255, 0.3)',
    'rgba(255, 255, 255, 0.1)'
  );
  
  const shadowLight = useColorModeValue(
    '0 4px 30px rgba(0, 0, 0, 0.1)',
    '0 4px 30px rgba(0, 0, 0, 0.7)'
  );
  
  const shadowElevated = useColorModeValue(
    '0 8px 40px rgba(0, 0, 0, 0.12)',
    '0 8px 40px rgba(0, 0, 0, 0.8)'
  );
  
  const glowColor = useColorModeValue(
    'rgba(255, 107, 53, 0.1)',
    'rgba(255, 152, 0, 0.1)'
  );

  const baseStyles: BoxProps = {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '16px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: borderColor,
    bg: bgColor,
    backdropFilter: glassEffect ? 'blur(20px) saturate(180%)' : undefined,
    WebkitBackdropFilter: glassEffect ? 'blur(20px) saturate(180%)' : undefined,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: onClick ? 'pointer' : 'default',
    _before: glassEffect ? {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `linear-gradient(135deg, transparent 0%, ${glowColor} 50%, transparent 100%)`,
      opacity: 0,
      transition: 'opacity 0.3s ease',
      pointerEvents: 'none',
    } : undefined,
    _hover: onClick ? {
      borderColor: useColorModeValue('rgba(255, 107, 53, 0.3)', 'rgba(255, 152, 0, 0.3)'),
      boxShadow: variant === 'elevated' ? shadowElevated : shadowLight,
      _before: glassEffect ? {
        opacity: 1,
      } : undefined,
    } : undefined,
  };

  const variantStyles: Record<string, BoxProps> = {
    default: {
      boxShadow: shadowLight,
    },
    elevated: {
      boxShadow: shadowElevated,
      transform: 'translateY(-2px)',
    },
    interactive: {
      boxShadow: shadowLight,
      _after: {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
        animation: `${shimmer} 2s infinite`,
        pointerEvents: 'none',
      },
    },
  };

  const combinedStyles = {
    ...baseStyles,
    ...variantStyles[variant],
    ...props,
  };

  if (onClick) {
    return (
      <MotionBox
        {...combinedStyles}
        onClick={onClick}
        whileHover={{ scale: hoverScale }}
        whileTap={{ scale: 0.98 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 25,
        }}
      >
        {children}
      </MotionBox>
    );
  }

  return (
    <Box {...combinedStyles}>
      {children}
    </Box>
  );
};

export default AppleCard;