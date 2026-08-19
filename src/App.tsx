import { HashRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { CompaniesPage } from './pages/CompaniesPage'
import { ModelsPage } from './pages/ModelsPage'
import { CompanyPage } from './pages/CompanyPage'
import { ModelPage } from './pages/ModelPage'
import { NotFoundPage } from './pages/NotFoundPage'

function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/companies/:id" element={<CompanyPage />} />
          <Route path="/models" element={<ModelsPage />} />
          <Route path="/models/:id" element={<ModelPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </HashRouter>
  )
}

export default App
