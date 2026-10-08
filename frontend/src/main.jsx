import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { TransactionsProvider } from './context/TransactionsProvider.jsx'
import { RoutesProvider } from './context/RoutesProvider.jsx'
import { CompaniesProvider } from './context/CompaniesProvider.jsx'
import './index.css'
import './styles/layout.css'
import './styles/components.css'
import './styles/modal.css'
import './styles/transactions.css'
import './styles/work.css'
import './styles/routes.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <TransactionsProvider>
        <RoutesProvider>
          <CompaniesProvider>
            <App />
          </CompaniesProvider>
        </RoutesProvider>
      </TransactionsProvider>
    </BrowserRouter>
  </StrictMode>,
)
