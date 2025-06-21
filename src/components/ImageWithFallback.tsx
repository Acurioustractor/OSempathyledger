import React, { useState } from 'react';
import { Image, ImageProps, Box, Icon } from '@chakra-ui/react';
import { FileMediaIcon } from '@primer/octicons-react';

interface ImageWithFallbackProps extends ImageProps {
  fallbackSrc?: string;
  showFallbackIcon?: boolean;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ 
  src, 
  fallbackSrc,
  showFallbackIcon = true,
  alt,
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (fallbackSrc && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    } else {
      setHasError(true);
    }
  };

  if (hasError && showFallbackIcon) {
    return (
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="center" 
        bg="gray.100" 
        {...props}
      >
        <Icon as={FileMediaIcon} boxSize={8} color="gray.400" />
      </Box>
    );
  }

  return (
    <Image 
      src={imgSrc} 
      alt={alt}
      onError={handleError}
      {...props} 
    />
  );
};

export default ImageWithFallback;