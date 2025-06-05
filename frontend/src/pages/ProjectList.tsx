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
  Alert,
  CircularProgress
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
  Analytics as AnalyticsIcon
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

  // プロジェクトカードのデザイン改善
  const renderProjectCard = (project: Project) => (
    <Card 
      key={project.id} 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
        position: 'relative',
        border: '1px solid',
        borderColor: project.status === 'active' ? 'primary.main' : 
                   project.status === 'completed' ? 'success.main' : 'warning.main'
      }}
    >
      {/* ステータスバッジ */}
      <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1 }}>
        <Chip
          label={project.status === 'active' ? '進行中' : 
                 project.status === 'completed' ? '完了' : '一時停止'}
          color={project.status === 'active' ? 'primary' : 
                 project.status === 'completed' ? 'success' : 'warning'}
          size="small"
          variant="filled"
        />
      </Box>

      <CardContent sx={{ flex: 1, pb: 1 }}>
        {/* プロジェクト名 */}
        <Typography variant="h6" component="h3" gutterBottom sx={{ pr: 8 }}>
          {project.name}
        </Typography>

        {/* 業界・エリア情報 */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip 
            label={getIndustryLabel(project.industry_type)}
            variant="outlined"
            size="small"
            icon={<BusinessIcon />}
          />
          <Chip 
            label={project.target_area}
            variant="outlined"
            size="small"
            icon={<LocationOnIcon />}
          />
        </Box>

        {/* 説明 */}
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.5em'
          }}
        >
          {project.description || 'プロジェクトの詳細説明はありません'}
        </Typography>

        {/* 日付情報 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            作成日: {formatDate(project.created_at)}
          </Typography>
          {project.updated_at && project.updated_at !== project.created_at && (
            <Typography variant="caption" color="text.secondary">
              更新日: {formatDate(project.updated_at)}
            </Typography>
          )}
        </Box>

        {/* シミュレーション情報（もしあれば） */}
        {project.latest_simulation && (
          <Box sx={{ mt: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              最新シミュレーション
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" fontWeight="medium">
                月間売上目標: {formatCurrency(project.latest_simulation.target_monthly_sales)}
              </Typography>
              <Typography variant="body2" color="primary.main">
                {project.latest_simulation.breakeven_months}ヶ月で損益分岐
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>

      {/* アクションボタン */}
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<AnalyticsIcon />}
          onClick={() => {/* TODO: 詳細画面へ */}}
        >
          詳細分析
        </Button>
        <Box>
          <IconButton
            size="small"
            onClick={(e) => handleMenuOpen(e, project)}
            sx={{ ml: 1 }}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>
      </CardActions>
    </Card>
  )

  // 業界ラベル取得関数
  const getIndustryLabel = (industry: string) => {
    const labels: { [key: string]: string } = {
      'beauty': '美容・サロン',
      'restaurant': '飲食店',
      'retail': '小売業',
      'healthcare': 'ヘルスケア',
      'education': '教育',
      'it': 'IT・テック',
      'consulting': 'コンサルティング',
      'finance': '金融',
      'real_estate': '不動産',
      'other': 'その他'
    }
    return labels[industry] || industry
  }

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
    <Box>
      {/* ヘッダー */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        p: 3,
        bgcolor: 'primary.main',
        color: 'white',
        borderRadius: 2,
        boxShadow: 2
      }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            プロジェクト管理
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            事業分析プロジェクトの作成・管理・分析
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
          size="large"
          sx={{ 
            bgcolor: 'white',
            color: 'primary.main',
            '&:hover': {
              bgcolor: 'grey.100'
            },
            px: 3,
            py: 1.5
          }}
        >
          新規プロジェクト作成
        </Button>
      </Box>

      {/* フィルタリング */}
      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterIcon sx={{ mr: 1 }} />
            検索・フィルタ
          </Typography>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                placeholder="プロジェクト名・説明・エリアで検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>ステータス</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="ステータス"
                >
                  <MenuItem value="all">すべてのステータス</MenuItem>
                  <MenuItem value="active">🟢 進行中</MenuItem>
                  <MenuItem value="completed">✅ 完了</MenuItem>
                  <MenuItem value="paused">⏸️ 一時停止</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>業界</InputLabel>
                <Select
                  value={filterIndustry}
                  onChange={(e) => setFilterIndustry(e.target.value)}
                  label="業界"
                >
                  <MenuItem value="all">すべての業界</MenuItem>
                  <MenuItem value="beauty">美容・サロン</MenuItem>
                  <MenuItem value="restaurant">飲食店</MenuItem>
                  <MenuItem value="retail">小売業</MenuItem>
                  <MenuItem value="healthcare">ヘルスケア</MenuItem>
                  <MenuItem value="education">教育</MenuItem>
                  <MenuItem value="it">IT・テック</MenuItem>
                  <MenuItem value="consulting">コンサルティング</MenuItem>
                  <MenuItem value="finance">金融</MenuItem>
                  <MenuItem value="real_estate">不動産</MenuItem>
                  <MenuItem value="other">その他</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={1}>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                {filteredProjects.length} 件
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* プロジェクト一覧 */}
      {filteredProjects.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          bgcolor: 'grey.50',
          borderRadius: 2,
          border: '2px dashed',
          borderColor: 'grey.300'
        }}>
          <BusinessIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchTerm || filterStatus !== 'all' || filterIndustry !== 'all' 
              ? '検索条件に一致するプロジェクトが見つかりません' 
              : 'プロジェクトがまだありません'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            新しいプロジェクトを作成して事業分析を始めましょう
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
            size="large"
          >
            最初のプロジェクトを作成
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredProjects.map(renderProjectCard)}
        </Grid>
      )}

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
                      <Chip label={getIndustryLabel(formData.industry_type)} variant="outlined" />
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
    </Box>
  )
}

export default ProjectList 