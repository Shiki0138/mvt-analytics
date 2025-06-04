import { Routes, Route } from 'react-router-dom'
import { Box, AppBar, Toolbar, Typography, Container } from '@mui/material'
import Dashboard from './pages/Dashboard'
import ProjectList from './pages/ProjectList'
import ProjectDetail from './pages/ProjectDetail'
import Simulator from './pages/Simulator'
import Analysis from './pages/Analysis'
import Reports from './pages/Reports'
import Navigation from './components/Navigation'

function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* ヘッダー */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            MVT Analytics System
          </Typography>
          <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
            見込み客ボリューム & リスク最適化分析
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {/* サイドナビゲーション */}
        <Navigation />

        {/* メインコンテンツ */}
        <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
          <Container maxWidth="xl" sx={{ py: 3 }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<ProjectList />} />
              <Route path="/projects/:projectId" element={<ProjectDetail />} />
              <Route path="/simulator/:projectId?" element={<Simulator />} />
              <Route path="/analysis/:projectId?" element={<Analysis />} />
              <Route path="/reports/:projectId?" element={<Reports />} />
            </Routes>
          </Container>
        </Box>
      </Box>
    </Box>
  )
}

export default App 