import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  colors: {
    brand: {
      50: '#fff8f1',
      100: '#ffecd6',
      200: '#ffd6ad',
      300: '#ffb874',
      400: '#ff9139',
      500: '#ff6b0a', // Orange Sky primary orange
      600: '#e55a00',
      700: '#c44700',
      800: '#a13800',
      900: '#7f2c00',
    },
    orangeSky: {
      primary: '#ff6b0a',
      secondary: '#003366', // Deep blue for contrast
      accent: '#ffb874',
      light: '#fff8f1',
      dark: '#7f2c00',
    },
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      },
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
  },
})

export default theme 