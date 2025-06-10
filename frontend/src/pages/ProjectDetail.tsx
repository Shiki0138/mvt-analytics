import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiConfig } from '../config/api'
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Divider,
  Tab,
  Tabs,
  CircularProgress,
  IconButton,
  LinearProgress
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  LocationOn as LocationOnIcon,
  Business as BusinessIcon,
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon
} from '@mui/icons-material'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  )
}

function ProjectDetail() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [tabValue, setTabValue] = useState(0)
  const [project, setProject] = useState<any>(null)
  const [simulations, setSimulations] = useState<any[]>([])
  const [analyses, setAnalyses] = useState<any[]>([])

  useEffect(() => {
    fetchProjectData()
  }, [projectId])

  const fetchProjectData = async () => {
    try {
      console.log('プロジェクト詳細取得開始:', projectId)
      
      // プロジェクト基本情報の取得
      const projectResponse = await fetch(`${apiConfig.baseURL}/api/projects/${projectId}`)
      console.log('プロジェクト取得レスポンス:', projectResponse.status)
      
      if (!projectResponse.ok) {
        throw new Error(`プロジェクト取得失敗: ${projectResponse.status}`)
      }
      
      const projectData = await projectResponse.json()
      console.log('プロジェクトデータ:', projectData)
      setProject(projectData)

      // シミュレーションデータの取得
      try {
        const simulationsResponse = await fetch(`${apiConfig.baseURL}/api/projects/${projectId}/simulations`)
        if (simulationsResponse.ok) {
          const simulationsData = await simulationsResponse.json()
          setSimulations(simulationsData.simulations || [])
        }
      } catch (err) {
        console.warn('シミュレーションデータ取得失敗:', err)
      }

      // 分析データの取得
      try {
        const analysesResponse = await fetch(`${apiConfig.baseURL}/api/projects/${projectId}/analyses`)
        if (analysesResponse.ok) {
          const analysesData = await analysesResponse.json()
          setAnalyses(analysesData.analyses || [])
        }
      } catch (err) {
        console.warn('分析データ取得失敗:', err)
      }
      
    } catch (error) {
      console.error('データ取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount)
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          データを読み込み中...
        </Typography>
      </Box>
    )
  }

  if (!project) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h5" color="error">
          プロジェクトが見つかりません
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/projects')}
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          プロジェクト一覧に戻る
        </Button>
      </Box>
    )
  }

  return (
    <Container maxWidth="lg">
      {/* ヘッダー */}
      <Box sx={{ mb: 4 }}>
        <Button
          variant="text"
          onClick={() => navigate('/projects')}
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          プロジェクト一覧に戻る
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {project.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip
                icon={<BusinessIcon />}
                label={project.industry_type}
                variant="outlined"
              />
              <Chip
                icon={<LocationOnIcon />}
                label={project.target_area}
                variant="outlined"
              />
              <Chip
                label={project.status === 'active' ? '進行中' : 
                       project.status === 'completed' ? '完了' : '一時停止'}
                color={project.status === 'active' ? 'primary' : 
                       project.status === 'completed' ? 'success' : 'warning'}
              />
            </Box>
            <Typography variant="body1" color="text.secondary">
              {project.description}
            </Typography>
          </Box>
          <Box>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              sx={{ mr: 1 }}
              onClick={() => {/* TODO: 編集ダイアログを開く */}}
            >
              編集
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => {/* TODO: 削除確認 */}}
            >
              削除
            </Button>
          </Box>
        </Box>
      </Box>

      {/* タブナビゲーション */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="基本情報" />
          <Tab label="シミュレーション" />
          <Tab label="市場分析" />
          <Tab label="レポート" />
        </Tabs>
      </Box>

      {/* 基本情報タブ */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  プロジェクト概要
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      作成日
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(project.created_at)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      最終更新日
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(project.updated_at)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      業界
                    </Typography>
                    <Typography variant="body1">
                      {project.industry_type}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      対象エリア
                    </Typography>
                    <Typography variant="body1">
                      {project.target_area}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  最新シミュレーション結果
                </Typography>
                <Divider sx={{ my: 2 }} />
                {project.latest_simulation ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        月間売上目標
                      </Typography>
                      <Typography variant="h5" color="primary">
                        {formatCurrency(project.latest_simulation.target_monthly_sales)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        初期投資
                      </Typography>
                      <Typography variant="h5">
                        {formatCurrency(project.latest_simulation.required_budget)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        損益分岐点
                      </Typography>
                      <Typography variant="h5" color="success.main">
                        {project.latest_simulation.breakeven_months}ヶ月
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      startIcon={<TrendingUpIcon />}
                      fullWidth
                      onClick={() => setTabValue(1)}
                    >
                      シミュレーション詳細を見る
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      シミュレーションがまだ実行されていません
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<TrendingUpIcon />}
                      onClick={() => setTabValue(1)}
                    >
                      新規シミュレーション作成
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* シミュレーションタブ */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<TrendingUpIcon />}
            onClick={() => navigate(`/simulator/${projectId}`)}
          >
            売上シミュレーション
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AnalyticsIcon />}
            onClick={() => navigate(`/enhanced-analysis/${projectId}`)}
          >
            🚀 AI高度分析（NEW）
          </Button>
        </Box>

        <Grid container spacing={3}>
          {simulations.map((simulation) => (
            <Grid item xs={12} key={simulation.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      {simulation.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(simulation.created_at)}
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        月間売上
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {formatCurrency(simulation.monthly_revenue)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        年間売上
                      </Typography>
                      <Typography variant="h6">
                        {formatCurrency(simulation.annual_revenue)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Button
                        variant="outlined"
                        startIcon={<AnalyticsIcon />}
                        fullWidth
                      >
                        詳細を見る
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* 市場分析タブ */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AssessmentIcon />}
            onClick={() => {/* TODO: 新規分析 */}}
          >
            新規分析を実行
          </Button>
        </Box>

        <Grid container spacing={3}>
          {analyses.map((analysis) => (
            <Grid item xs={12} md={6} key={analysis.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      {analysis.title}
                    </Typography>
                    <Chip
                      label={analysis.status}
                      color={analysis.status === 'completed' ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {analysis.type === 'market_analysis' ? '市場分析レポート' : 'リスク分析レポート'}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mb: 2 }}>
                    作成日: {formatDate(analysis.created_at)}
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AnalyticsIcon />}
                    fullWidth
                  >
                    分析結果を見る
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* レポートタブ */}
      <TabPanel value={tabValue} index={3}>
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AssessmentIcon />}
            onClick={() => {/* TODO: 新規レポート */}}
          >
            新規レポート作成
          </Button>
        </Box>

        <Grid container spacing={3}>
          {project.reports?.map((report: any) => (
            <Grid item xs={12} key={report.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6">
                        {report.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        作成日: {formatDate(report.created_at)}
                      </Typography>
                    </Box>
                    <IconButton
                      color="primary"
                      onClick={() => {/* TODO: レポートダウンロード */}}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Box>
                  <LinearProgress
                    variant={report.status === 'processing' ? 'indeterminate' : 'determinate'}
                    value={report.status === 'ready' ? 100 : 0}
                    sx={{ mt: 2 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>
    </Container>
  )
}

export default ProjectDetail 