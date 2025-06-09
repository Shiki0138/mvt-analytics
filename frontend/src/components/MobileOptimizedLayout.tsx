import React, { useState } from 'react'
import {
  Box,
  useTheme,
  useMediaQuery,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Fab,
  Zoom,
  Stack,
  BottomNavigation,
  BottomNavigationAction,
  Paper
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  Psychology as PsychologyIcon,
  Assessment as AssessmentIcon,
  Description as ReportIcon,
  Add as AddIcon
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'

interface MobileOptimizedLayoutProps {
  children: React.ReactNode
  title?: string
}

const MobileOptimizedLayout: React.FC<MobileOptimizedLayoutProps> = ({ 
  children, 
  title = "MVT Analytics" 
}) => {
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  const [mobileOpen, setMobileOpen] = useState(false)
  const [bottomNavValue, setBottomNavValue] = useState(() => {
    const path = location.pathname
    if (path.includes('/projects')) return 1
    if (path.includes('/simulator')) return 2
    if (path.includes('/analysis')) return 3
    if (path.includes('/reports')) return 4
    return 0
  })

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const navigationItems = [
    { label: 'ダッシュボード', icon: <DashboardIcon />, path: '/' },
    { label: 'プロジェクト', icon: <BusinessIcon />, path: '/projects' },
    { label: 'シミュレーター', icon: <PsychologyIcon />, path: '/simulator' },
    { label: '分析', icon: <AssessmentIcon />, path: '/analysis' },
    { label: 'レポート', icon: <ReportIcon />, path: '/reports' }
  ]

  const handleBottomNavigation = (event: React.SyntheticEvent, newValue: number) => {
    setBottomNavValue(newValue)
    navigate(navigationItems[newValue].path)
  }

  if (!isMobile) {
    // デスクトップ表示は既存のレイアウトを使用
    return <>{children}</>
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* モバイル用ヘッダー */}
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* サイドドロワー（モバイル用） */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 }
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', p: 2 }}>
          <Stack spacing={1}>
            {navigationItems.map((item, index) => (
              <Box
                key={item.label}
                onClick={() => {
                  navigate(item.path)
                  setBottomNavValue(index)
                  setMobileOpen(false)
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  borderRadius: 1,
                  cursor: 'pointer',
                  bgcolor: bottomNavValue === index ? 'primary.light' : 'transparent',
                  color: bottomNavValue === index ? 'primary.contrastText' : 'text.primary',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                {item.icon}
                <Typography variant="body1">{item.label}</Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Drawer>

      {/* メインコンテンツエリア */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: 8, // AppBarの高さ分
          pb: 8, // BottomNavigationの高さ分
          px: 1,
          overflow: 'auto'
        }}
      >
        {children}
      </Box>

      {/* フローティングアクションボタン */}
      <Zoom in={true}>
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 80, // BottomNavigationの上
            right: 16,
            zIndex: theme.zIndex.fab
          }}
          onClick={() => navigate('/projects')}
        >
          <AddIcon />
        </Fab>
      </Zoom>

      {/* ボトムナビゲーション */}
      <Paper 
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          zIndex: theme.zIndex.appBar 
        }} 
        elevation={3}
      >
        <BottomNavigation
          value={bottomNavValue}
          onChange={handleBottomNavigation}
          showLabels
        >
          {navigationItems.map((item) => (
            <BottomNavigationAction
              key={item.label}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  )
}

export default MobileOptimizedLayout