import { useLocation, useNavigate } from 'react-router-dom'
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  FolderOpen as ProjectIcon,
  TrendingUp as SimulatorIcon,
  Assessment as AnalysisIcon,
  Description as ReportIcon
} from '@mui/icons-material'

const drawerWidth = 280

interface NavigationItem {
  id: string
  label: string
  path: string
  icon: React.ReactNode
  description?: string
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'ダッシュボード',
    path: '/',
    icon: <DashboardIcon />,
    description: '概要とKPI'
  },
  {
    id: 'projects',
    label: 'プロジェクト一覧',
    path: '/projects',
    icon: <ProjectIcon />,
    description: '分析プロジェクト管理'
  },
  {
    id: 'simulator',
    label: 'シミュレーター',
    path: '/simulator',
    icon: <SimulatorIcon />,
    description: '売上逆算シミュレーション'
  },
  {
    id: 'analysis',
    label: '分析ツール',
    path: '/analysis',
    icon: <AnalysisIcon />,
    description: '商圏・競合・需要分析'
  },
  {
    id: 'reports',
    label: 'レポート',
    path: '/reports',
    icon: <ReportIcon />,
    description: '資料生成・エクスポート'
  }
]

function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          position: 'relative',
          border: 'none',
          borderRight: '1px solid #e0e0e0'
        },
      }}
    >
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="subtitle1" fontWeight="bold">
          MVT Analytics
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
          v0.4.0 - MVP
        </Typography>
      </Box>

      <List sx={{ pt: 1 }}>
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path))

          return (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                selected={isActive}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'white' : 'inherit',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  secondary={item.description}
                  secondaryTypographyProps={{
                    fontSize: '0.75rem',
                    color: isActive ? 'rgba(255,255,255,0.7)' : 'text.secondary'
                  }}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      <Divider sx={{ my: 1 }} />

      <Box sx={{ p: 2, mt: 'auto' }}>
        <Typography variant="caption" color="text.secondary">
          Sales Funnel Simulator 搭載
        </Typography>
      </Box>
    </Drawer>
  )
}

export default Navigation 