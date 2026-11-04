import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import ErrorBoundary from './components/ui/ErrorBoundary.jsx'
import { ErrorLogProvider } from './context/ErrorLogProvider.jsx'
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
import './styles/errors.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ErrorLogProvider>
        <BrowserRouter>
          <TransactionsProvider>
            <RoutesProvider>
              <CompaniesProvider>
                <App />
              </CompaniesProvider>
            </RoutesProvider>
          </TransactionsProvider>
        </BrowserRouter>
      </ErrorLogProvider>
    </ErrorBoundary>
  </StrictMode>,
)
