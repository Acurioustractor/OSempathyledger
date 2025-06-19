import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import { HashRouter } from 'react-router-dom'
import App from './App'
import theme from './theme'
import { AirtableDataProvider } from './context/AirtableDataContext'
import './types/fixes.d.ts'
import './types/overrides.d.ts'
import './types/global.d.ts'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <ChakraProvider theme={theme}>
        <AirtableDataProvider>
          <App />
        </AirtableDataProvider>
      </ChakraProvider>
    </HashRouter>
  </React.StrictMode>,
) 