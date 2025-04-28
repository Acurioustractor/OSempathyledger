import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import { HashRouter } from 'react-router-dom'
import App from './App'
import theme from './theme'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>
    </HashRouter>
  </React.StrictMode>,
) 