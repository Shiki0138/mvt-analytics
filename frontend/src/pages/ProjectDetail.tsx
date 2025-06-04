import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  Menu,
  MenuItem
} from '@mui/material'
import {
  Edit as EditIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Description as ReportIcon,
  MoreVert as MoreVertIcon,
  Timeline as TimelineIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon
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
}

interface SimulationHistory {
  id: string
  created_at: string
  target_monthly_sales: number
  required_budget: number
  breakeven_months: number
  selected_media: string[]
}

interface AnalysisResult {
  type: 'demographics' | 'competitors' | 'demand'
  status: 'completed' | 'in_progress' | 'failed'
  completed_at?: string
  summary: string
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

function ProjectDetail() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [simulationHistory, setSimulationHistory] = useState<SimulationHistory[]>([])
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [loading, setLoading] = useState(true)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  useEffect(() => {
    if (projectId) {
      fetchProjectData()
    }
  }, [projectId])

  const fetchProjectData = async () => {
    try {
      // プロジェクト詳細取得
      const response = await fetch(`/api/projects/${projectId}`)
      if (response.ok) {
        const projectData = await response.json()
        setProject(projectData)
      } else {
        // モックデータを使用
        setProject({
          id: projectId!,
          name: 'サンプル美容室',
          industry_type: 'beauty',
          target_area: '渋谷区',
          description: '新規美容室の市場分析と集客戦略立案を行うプロジェクト。競合他社の分析、商圏分析、売上シミュレーションを通じて最適な出店戦略を策定する。',
          status: 'active',
          created_at: '2024-01-15T09:00:00Z',
          updated_at: '2024-01-20T15:30:00Z'
        })
      }

      // シミュレーション履歴取得
      const simResponse = await fetch(`/api/projects/${projectId}/simulations`)
      if (simResponse.ok) {
        const simData = await simResponse.json()
        setSimulationHistory(simData)
      } else {
        // モックデータ
        setSimulationHistory([
          {
            id: '1',
            created_at: '2024-01-20T10:30:00Z',
            target_monthly_sales: 1000000,
            required_budget: 450000,
            breakeven_months: 6,
            selected_media: ['google_ads', 'facebook_ads']
          },
          {
            id: '2',
            created_at: '2024-01-18T14:20:00Z',
            target_monthly_sales: 800000,
            required_budget: 320000,
            breakeven_months: 8,
            selected_media: ['google_ads']
          },
          {
            id: '3',
            created_at: '2024-01-16T09:15:00Z',
            target_monthly_sales: 1200000,
            required_budget: 540000,
            breakeven_months: 5,
            selected_media: ['google_ads', 'facebook_ads', 'instagram_ads']
          }
        ])
      }

      // 分析結果取得
      const analysisResponse = await fetch(`/api/projects/${projectId}/analyses`)
      if (analysisResponse.ok) {
        const analysisData = await analysisResponse.json()
        setAnalysisResults(analysisData)
      } else {
        // モックデータ
        setAnalysisResults([
          {
            type: 'demographics',
            status: 'completed',
            completed_at: '2024-01-19T11:20:00Z',
            summary: '商圏内人口 45,823人、主要ターゲット層は30-40代女性（27.2%）'
          },
          {
            type: 'competitors',
            status: 'completed',
            completed_at: '2024-01-19T13:45:00Z',
            summary: '半径1km以内に競合美容室3店舗、平均価格帯¥4,000-8,000'
          },
          {
            type: 'demand',
            status: 'completed',
            completed_at: '2024-01-19T16:10:00Z',
            summary: '年間市場規模¥890M、季節性あり（12月需要最高125%）'
          }
        ])
      }
    } catch (error) {
      console.error('プロジェクトデータ取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => `¥${amount.toLocaleString()}`

  const getIndustryLabel = (value: string) => {
    return industryTypes.find(i => i.value === value)?.label || value
  }

  const getAnalysisTypeLabel = (type: string) => {
    const labels = {
      demographics: '商圏人口分析',
      competitors: '競合店舗分析',
      demand: '需要分析'
    }
    return labels[type as keyof typeof labels] || type
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  if (loading) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>読み込み中...</Typography>
        <LinearProgress />
      </Box>
    )
  }

  if (!project) {
    return (
      <Alert severity="error">
        プロジェクトが見つかりません
      </Alert>
    )
  }

  return (
    <Box>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h1" gutterBottom>
            {project.name}
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip
              label={statusLabels[project.status]}
              color={statusColors[project.status]}
              size="small"
            />
            <Typography variant="body2" color="text.secondary">
              プロジェクトID: {project.id}
            </Typography>
          </Stack>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<TrendingUpIcon />}
            onClick={() => navigate(`/simulator/${projectId}`)}
          >
            シミュレーター
          </Button>
          <IconButton onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* プロジェクト情報 */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            {/* 基本情報 */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  プロジェクト概要
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <BusinessIcon color="primary" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">業界</Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {getIndustryLabel(project.industry_type)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <LocationIcon color="primary" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">対象エリア</Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {project.target_area}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <ScheduleIcon color="primary" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">作成日</Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {formatDate(project.created_at)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <ScheduleIcon color="primary" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">最終更新</Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {formatDate(project.updated_at)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" paragraph>
                  {project.description}
                </Typography>
              </CardContent>
            </Card>

            {/* シミュレーション履歴 */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    シミュレーション履歴
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<TrendingUpIcon />}
                    onClick={() => navigate(`/simulator/${projectId}`)}
                  >
                    新規実行
                  </Button>
                </Box>
                
                {simulationHistory.length === 0 ? (
                  <Alert severity="info">
                    まだシミュレーションが実行されていません
                  </Alert>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>実行日時</TableCell>
                          <TableCell align="right">目標売上</TableCell>
                          <TableCell align="right">必要予算</TableCell>
                          <TableCell align="center">損益分岐</TableCell>
                          <TableCell>メディア</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {simulationHistory.map((sim, index) => (
                          <TableRow key={sim.id}>
                            <TableCell>
                              <Typography variant="body2">
                                {formatDate(sim.created_at)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="medium">
                                {formatCurrency(sim.target_monthly_sales)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="medium">
                                {formatCurrency(sim.required_budget)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={`${sim.breakeven_months}ヶ月`}
                                size="small"
                                color={sim.breakeven_months <= 6 ? 'success' : sim.breakeven_months <= 12 ? 'warning' : 'error'}
                              />
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={0.5}>
                                {sim.selected_media.map(media => (
                                  <Chip
                                    key={media}
                                    label={media.replace('_ads', '')}
                                    size="small"
                                    variant="outlined"
                                  />
                                ))}
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* サイドバー */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* クイックアクション */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  クイックアクション
                </Typography>
                <Stack spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<AssessmentIcon />}
                    onClick={() => navigate(`/analysis/${projectId}`)}
                    fullWidth
                  >
                    分析実行
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ReportIcon />}
                    onClick={() => navigate(`/reports/${projectId}`)}
                    fullWidth
                  >
                    レポート生成
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/projects`)}
                    fullWidth
                  >
                    プロジェクト編集
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {/* 分析結果サマリー */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  分析結果
                </Typography>
                {analysisResults.length === 0 ? (
                  <Alert severity="info">
                    分析がまだ実行されていません
                  </Alert>
                ) : (
                  <Stack spacing={2}>
                    {analysisResults.map((analysis, index) => (
                      <Card key={index} variant="outlined">
                        <CardContent sx={{ pb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle2">
                              {getAnalysisTypeLabel(analysis.type)}
                            </Typography>
                            <Chip
                              label={analysis.status === 'completed' ? '完了' : '処理中'}
                              size="small"
                              color={analysis.status === 'completed' ? 'success' : 'default'}
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary" paragraph>
                            {analysis.summary}
                          </Typography>
                          {analysis.completed_at && (
                            <Typography variant="caption" color="text.secondary">
                              完了: {formatDate(analysis.completed_at)}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>

            {/* 最新シミュレーション結果 */}
            {simulationHistory.length > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    最新シミュレーション
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="primary">
                          {formatCurrency(simulationHistory[0].target_monthly_sales)}
                        </Typography>
                        <Typography variant="caption">目標月商</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box textAlign="center">
                        <Typography variant="h5" color="error">
                          {formatCurrency(simulationHistory[0].required_budget)}
                        </Typography>
                        <Typography variant="caption">必要予算</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box textAlign="center">
                        <Typography variant="h5" color="warning.main">
                          {simulationHistory[0].breakeven_months}
                        </Typography>
                        <Typography variant="caption">損益分岐（月）</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => navigate(`/simulator/${projectId}`)}
                  >
                    詳細を見る
                  </Button>
                </CardContent>
              </Card>
            )}
          </Stack>
        </Grid>
      </Grid>

      {/* アクションメニュー */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          navigate(`/analysis/${projectId}`)
          handleMenuClose()
        }}>
          <AssessmentIcon sx={{ mr: 1 }} />
          分析実行
        </MenuItem>
        <MenuItem onClick={() => {
          navigate(`/reports/${projectId}`)
          handleMenuClose()
        }}>
          <ReportIcon sx={{ mr: 1 }} />
          レポート生成
        </MenuItem>
        <MenuItem onClick={() => {
          // TODO: プロジェクト設定
          handleMenuClose()
        }}>
          <EditIcon sx={{ mr: 1 }} />
          プロジェクト設定
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default ProjectDetail 