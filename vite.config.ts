import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const isBuild = command === 'build';

  return {
    plugins: [react()],
    base: '/',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        // Mock MCP for production builds
        ...(isBuild && {
          'mcp': path.resolve(__dirname, './src/services/mcp-mock.ts'),
        }),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'chakra-vendor': ['@chakra-ui/react', '@emotion/react', '@emotion/styled'],
            'chart-vendor': ['recharts'],
            'octicons': ['@primer/octicons-react']
          }
        }
      },
      chunkSizeWarningLimit: 1000
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      strictPort: true,
      cors: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  }
}) 