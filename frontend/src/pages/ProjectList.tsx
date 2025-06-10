import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiConfig } from '../config/api'
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
  Alert,
  CircularProgress,
  Container,
  InputAdornment
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  FilterList as FilterIcon,
  Business as BusinessIcon,
  LocationOn as LocationOnIcon,
  Analytics as AnalyticsIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon,
  Close as CloseIcon
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

const statusOptions = [
  { value: 'all', label: 'すべて' },
  { value: 'active', label: '進行中' },
  { value: 'completed', label: '完了' },
  { value: 'paused', label: '一時停止' }
]

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
      console.log('プロジェクト取得開始:', `${apiConfig.baseURL}/api/projects`)
      const response = await fetch(`${apiConfig.baseURL}/api/projects`)
      console.log('レスポンス状況:', response.status, response.statusText)
      
      if (response.ok) {
        const data = await response.json()
        console.log('プロジェクトデータ取得成功:', data.length + '件')
        setProjects(data)
      } else {
        console.error('プロジェクト取得エラー:', response.status, response.statusText)
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
      const url = editingProject ? `${apiConfig.baseURL}/api/projects/${editingProject.id}` : `${apiConfig.baseURL}/api/projects`
      const method = editingProject ? 'PUT' : 'POST'
      
      // status フィールドを追加
      const projectData = {
        ...formData,
        status: editingProject ? editingProject.status : 'active'
      }
      
      console.log('プロジェクト送信データ:', projectData)
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('プロジェクト作成/更新成功:', result)
        await fetchProjects()
        handleCloseDialog()
      } else {
        const errorText = await response.text()
        console.error('プロジェクト保存エラー:', response.status, errorText)
        alert(`プロジェクト保存に失敗しました: ${response.status} ${errorText}`)
      }
    } catch (error) {
      console.error('プロジェクト保存エラー:', error)
      alert(`プロジェクト保存エラー: ${error}`)
    }
  }

  // プロジェクト削除
  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm('このプロジェクトを削除しますか？')) return
    
    try {
      const response = await fetch(`${apiConfig.baseURL}/api/projects/${projectId}`, {
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

  // プロジェクトカードのデザイン改善
  const renderProjectCard = (project: Project) => (
    <Grid item xs={12} md={6} key={project.id}>
      <Card
        sx={{
          cursor: 'pointer',
          '&:hover': {
            boxShadow: 6,
            transform: 'translateY(-2px)',
            transition: 'all 0.2s ease-in-out'
          }
        }}
        onClick={() => navigate(`/projects/${project.id}`)}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              {project.name}
            </Typography>
            <Chip
              label={statusLabels[project.status as keyof typeof statusLabels]}
              color={statusColors[project.status as keyof typeof statusColors]}
              size="small"
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {project.description}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Chip
              icon={<BusinessIcon />}
              label={industryTypes.find(i => i.value === project.industry_type)?.label || project.industry_type}
              variant="outlined"
              size="small"
            />
            <Chip
              icon={<LocationOnIcon />}
              label={project.target_area}
              variant="outlined"
              size="small"
            />
          </Stack>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ScheduleIcon fontSize="small" color="action" sx={{ mr: 1 }} />
              <Typography variant="caption" color="text.secondary">
                作成日: {formatDate(project.created_at)}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/simulator/${project.id}`)
                }}
              >
                <TrendingUpIcon />
              </IconButton>
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/analysis/${project.id}`)
                }}
              >
                <AssessmentIcon />
              </IconButton>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  )

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          プロジェクトを読み込み中...
        </Typography>
      </Box>
    )
  }

  return (
    <Container maxWidth="lg">
      {/* ヘッダー */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          プロジェクト一覧
        </Typography>
        <Typography variant="body1" color="text.secondary">
          MVTアナリティクスで管理しているプロジェクトの一覧です
        </Typography>
      </Box>

      {/* フィルタリング */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            placeholder="プロジェクト名、説明、エリアで検索"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <CloseIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>業界</InputLabel>
            <Select
              value={filterIndustry}
              label="業界"
              onChange={(e) => setFilterIndustry(e.target.value)}
            >
              <MenuItem value="all">すべての業界</MenuItem>
              {industryTypes.map(type => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>ステータス</InputLabel>
            <Select
              value={filterStatus}
              label="ステータス"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              {statusOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            fullWidth
            onClick={handleOpenCreateDialog}
            sx={{ height: '100%' }}
          >
            新規作成
          </Button>
        </Grid>
      </Grid>

      {/* プロジェクト一覧 */}
      <Grid container spacing={3}>
        {filteredProjects.length === 0 ? (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                プロジェクトが見つかりません
              </Typography>
              <Typography variant="body2" color="text.secondary">
                検索条件を変更するか、新しいプロジェクトを作成してください
              </Typography>
            </Box>
          </Grid>
        ) : (
          filteredProjects.map(renderProjectCard)
        )}
      </Grid>

      {/* 新規プロジェクト作成ダイアログ */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          bgcolor: 'primary.main',
          color: 'white',
          mb: 3
        }}>
          <AddIcon sx={{ mr: 2 }} />
          {editingProject ? 'プロジェクト編集' : '新規プロジェクト作成'}
        </DialogTitle>
        
        <DialogContent sx={{ px: 4, py: 3 }}>
          <Grid container spacing={3}>
            {/* プロジェクト名 */}
            <Grid item xs={12}>
              <TextField
                autoFocus
                label="プロジェクト名"
                fullWidth
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例: 渋谷区 新規美容室プロジェクト"
                required
                error={!formData.name}
                helperText={!formData.name ? 'プロジェクト名は必須です' : ''}
                variant="outlined"
              />
            </Grid>

            {/* 業界選択 */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>業界・業種</InputLabel>
                <Select
                  value={formData.industry_type}
                  onChange={(e) => setFormData({ ...formData, industry_type: e.target.value })}
                  label="業界・業種"
                >
                  <MenuItem value="beauty">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      💇 美容・サロン
                    </Box>
                  </MenuItem>
                  <MenuItem value="restaurant">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      🍽️ 飲食店
                    </Box>
                  </MenuItem>
                  <MenuItem value="retail">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      🛍️ 小売業
                    </Box>
                  </MenuItem>
                  <MenuItem value="healthcare">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      🏥 ヘルスケア
                    </Box>
                  </MenuItem>
                  <MenuItem value="education">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      📚 教育
                    </Box>
                  </MenuItem>
                  <MenuItem value="it">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      💻 IT・テック
                    </Box>
                  </MenuItem>
                  <MenuItem value="consulting">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      📊 コンサルティング
                    </Box>
                  </MenuItem>
                  <MenuItem value="finance">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      💰 金融
                    </Box>
                  </MenuItem>
                  <MenuItem value="real_estate">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      🏢 不動産
                    </Box>
                  </MenuItem>
                  <MenuItem value="other">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      📦 その他
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* ターゲットエリア */}
            <Grid item xs={12} md={6}>
              <TextField
                label="ターゲットエリア"
                fullWidth
                value={formData.target_area}
                onChange={(e) => setFormData({ ...formData, target_area: e.target.value })}
                placeholder="例: 渋谷区、新宿区、東京都内"
                required
                error={!formData.target_area}
                helperText={!formData.target_area ? 'ターゲットエリアは必須です' : ''}
                variant="outlined"
                InputProps={{
                  startAdornment: <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>

            {/* プロジェクト説明 */}
            <Grid item xs={12}>
              <TextField
                label="プロジェクト説明"
                fullWidth
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="プロジェクトの概要、目的、特徴などを詳しく記載してください。&#10;例: 渋谷駅徒歩5分の立地を活かした20〜30代女性向け美容室の新規出店プロジェクト。カット・カラー・トリートメントを中心とした高品質サービスの提供を目指す。"
                variant="outlined"
                helperText="詳細な説明により、より精度の高い分析が可能になります"
              />
            </Grid>

            {/* プロジェクト概要カード */}
            <Grid item xs={12}>
              <Card sx={{ bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.300' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    📋 プロジェクト概要プレビュー
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {formData.name && (
                      <Chip label={`📝 ${formData.name}`} variant="outlined" />
                    )}
                    {formData.industry_type && (
                      <Chip label={industryTypes.find(i => i.value === formData.industry_type)?.label || formData.industry_type} variant="outlined" />
                    )}
                    {formData.target_area && (
                      <Chip label={`📍 ${formData.target_area}`} variant="outlined" />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {formData.description || '説明が入力されると、ここにプレビューが表示されます'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ px: 4, py: 3, gap: 2 }}>
          <Button 
            onClick={handleCloseDialog} 
            variant="outlined"
            size="large"
          >
            キャンセル
          </Button>
          <Button 
            onClick={handleSubmitProject} 
            variant="contained"
            disabled={!formData.name || !formData.target_area}
            size="large"
            startIcon={editingProject ? <EditIcon /> : <AddIcon />}
          >
            {editingProject ? 'プロジェクトを更新' : 'プロジェクトを作成'}
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
    </Container>
  )
}

export default ProjectList 