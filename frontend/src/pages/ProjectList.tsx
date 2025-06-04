import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  IconButton,
  Menu,
  Tooltip,
  LinearProgress,
  Alert
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  FilterList as FilterIcon
} from '@mui/icons-material'

interface Project {
  id: string
  name: string
  industry_type: string
  target_area: string
  description: string
  status: 'active' | 'completed' | 'paused'
  created_at: string
  updated_at: string
  latest_simulation?: {
    target_monthly_sales: number
    required_budget: number
    breakeven_months: number
  }
}

interface ProjectFormData {
  name: string
  industry_type: string
  target_area: string
  description: string
}

const industryTypes = [
  { value: 'beauty', label: '美容・エステ' },
  { value: 'restaurant', label: '飲食店' },
  { value: 'retail', label: '小売・EC' },
  { value: 'healthcare', label: '医療・健康' },
  { value: 'education', label: '教育・スクール' },
  { value: 'real_estate', label: '不動産' },
  { value: 'financial', label: '金融・保険' },
  { value: 'automotive', label: '自動車' }
]

const statusColors = {
  active: 'success',
  completed: 'primary',
  paused: 'warning'
} as const

const statusLabels = {
  active: '進行中',
  completed: '完了',
  paused: '一時停止'
} as const

function ProjectList() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterIndustry, setFilterIndustry] = useState<string>('all')
  
  // プロジェクト作成/編集ダイアログ
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    industry_type: 'beauty',
    target_area: '',
    description: ''
  })
  
  // メニュー
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  // プロジェクト一覧取得
  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      } else {
        console.error('プロジェクト取得エラー')
      }
    } catch (error) {
      console.error('プロジェクト取得エラー:', error)
      // モックデータを使用
      setProjects([
        {
          id: '1',
          name: 'サンプル美容室',
          industry_type: 'beauty',
          target_area: '渋谷区',
          description: '新規美容室の市場分析と集客戦略立案',
          status: 'active',
          created_at: '2024-01-15T09:00:00Z',
          updated_at: '2024-01-20T15:30:00Z',
          latest_simulation: {
            target_monthly_sales: 1000000,
            required_budget: 450000,
            breakeven_months: 6
          }
        },
        {
          id: '2',
          name: '新規カフェ店舗',
          industry_type: 'restaurant',
          target_area: '新宿区',
          description: 'カフェチェーン新店舗の出店戦略',
          status: 'completed',
          created_at: '2023-12-01T10:00:00Z',
          updated_at: '2024-01-10T12:00:00Z',
          latest_simulation: {
            target_monthly_sales: 800000,
            required_budget: 320000,
            breakeven_months: 8
          }
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  // フィルタリング処理
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.target_area.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus
    const matchesIndustry = filterIndustry === 'all' || project.industry_type === filterIndustry
    
    return matchesSearch && matchesStatus && matchesIndustry
  })

  // プロジェクト作成/更新
  const handleSubmitProject = async () => {
    try {
      const url = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects'
      const method = editingProject ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        await fetchProjects()
        handleCloseDialog()
      } else {
        console.error('プロジェクト保存エラー')
      }
    } catch (error) {
      console.error('プロジェクト保存エラー:', error)
    }
  }

  // プロジェクト削除
  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm('このプロジェクトを削除しますか？')) return
    
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await fetchProjects()
      } else {
        console.error('プロジェクト削除エラー')
      }
    } catch (error) {
      console.error('プロジェクト削除エラー:', error)
    }
  }

  const handleOpenCreateDialog = () => {
    setEditingProject(null)
    setFormData({
      name: '',
      industry_type: 'beauty',
      target_area: '',
      description: ''
    })
    setDialogOpen(true)
  }

  const handleOpenEditDialog = (project: Project) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      industry_type: project.industry_type,
      target_area: project.target_area,
      description: project.description
    })
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingProject(null)
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, project: Project) => {
    setAnchorEl(event.currentTarget)
    setSelectedProject(project)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedProject(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  const formatCurrency = (amount: number) => `¥${amount.toLocaleString()}`

  return (
    <Box>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h1" gutterBottom>
            プロジェクト一覧
          </Typography>
          <Typography variant="body1" color="text.secondary">
            分析プロジェクトの管理・作成
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
          size="large"
        >
          新規プロジェクト
        </Button>
      </Box>

      {/* フィルタリング */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="プロジェクト名・説明・エリアで検索"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>ステータス</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  startAdornment={<FilterIcon sx={{ mr: 1 }} />}
                >
                  <MenuItem value="all">すべて</MenuItem>
                  <MenuItem value="active">進行中</MenuItem>
                  <MenuItem value="completed">完了</MenuItem>
                  <MenuItem value="paused">一時停止</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>業界</InputLabel>
                <Select
                  value={filterIndustry}
                  onChange={(e) => setFilterIndustry(e.target.value)}
                >
                  <MenuItem value="all">すべて</MenuItem>
                  {industryTypes.map(industry => (
                    <MenuItem key={industry.value} value={industry.value}>
                      {industry.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="body2" color="text.secondary">
                {filteredProjects.length} 件のプロジェクト
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* プロジェクト一覧 */}
      {loading ? (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>読み込み中...</Typography>
            <LinearProgress />
          </CardContent>
        </Card>
      ) : filteredProjects.length === 0 ? (
        <Alert severity="info">
          条件に一致するプロジェクトが見つかりません。
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredProjects.map((project) => (
            <Grid item xs={12} md={6} lg={4} key={project.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  '&:hover': { 
                    boxShadow: 3,
                    cursor: 'pointer'
                  }
                }}
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Typography variant="h6" component="div" gutterBottom>
                      {project.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={statusLabels[project.status]}
                        color={statusColors[project.status]}
                        size="small"
                      />
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMenuOpen(e, project)
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>業界:</strong> {industryTypes.find(i => i.value === project.industry_type)?.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>対象エリア:</strong> {project.target_area}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {project.description}
                    </Typography>
                  </Stack>

                  {project.latest_simulation && (
                    <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>最新シミュレーション</Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={4}>
                          <Typography variant="caption" display="block">目標売上</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {formatCurrency(project.latest_simulation.target_monthly_sales)}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" display="block">必要予算</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {formatCurrency(project.latest_simulation.required_budget)}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" display="block">損益分岐</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {project.latest_simulation.breakeven_months}ヶ月
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </CardContent>
                
                <CardActions>
                  <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                    <Button
                      size="small"
                      startIcon={<TrendingUpIcon />}
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/simulator/${project.id}`)
                      }}
                    >
                      シミュレーター
                    </Button>
                    <Button
                      size="small"
                      startIcon={<TimelineIcon />}
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/analysis/${project.id}`)
                      }}
                    >
                      分析
                    </Button>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                    更新: {formatDate(project.updated_at)}
                  </Typography>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* プロジェクト作成/編集ダイアログ */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProject ? 'プロジェクト編集' : '新規プロジェクト作成'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="プロジェクト名"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              required
            />
            
            <FormControl fullWidth required>
              <InputLabel>業界</InputLabel>
              <Select
                value={formData.industry_type}
                onChange={(e) => setFormData(prev => ({ ...prev, industry_type: e.target.value }))}
              >
                {industryTypes.map(industry => (
                  <MenuItem key={industry.value} value={industry.value}>
                    {industry.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="対象エリア"
              value={formData.target_area}
              onChange={(e) => setFormData(prev => ({ ...prev, target_area: e.target.value }))}
              fullWidth
              required
              placeholder="例: 渋谷区、新宿駅周辺"
            />
            
            <TextField
              label="プロジェクト説明"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              rows={3}
              placeholder="プロジェクトの目的や概要を入力してください"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>キャンセル</Button>
          <Button 
            onClick={handleSubmitProject}
            variant="contained"
            disabled={!formData.name || !formData.target_area}
          >
            {editingProject ? '更新' : '作成'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* アクションメニュー */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem 
          onClick={() => {
            if (selectedProject) {
              handleOpenEditDialog(selectedProject)
            }
            handleMenuClose()
          }}
        >
          <EditIcon sx={{ mr: 1 }} />
          編集
        </MenuItem>
        <MenuItem 
          onClick={() => {
            if (selectedProject) {
              handleDeleteProject(selectedProject.id)
            }
            handleMenuClose()
          }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          削除
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default ProjectList 