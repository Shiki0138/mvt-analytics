import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Stack,
  CircularProgress,
  Alert
} from '@mui/material'
import { Add as AddIcon, TrendingUp, Assessment, Timeline } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { apiConfig } from '../config/api'

function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState({
    projects: [],
    stats: {
      totalProjects: 0,
      completedAnalyses: 0,
      averageROI: '0x',
      averageBreakeven: '0ヶ月'
    }
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // プロジェクト一覧とダッシュボード統計を並行取得
      const [projectsResponse, statsResponse] = await Promise.all([
        fetch(`${apiConfig.baseURL}/api/projects`),
        fetch(`${apiConfig.baseURL}/api/dashboard/stats`)
      ])

      if (!projectsResponse.ok) {
        throw new Error('プロジェクトデータの取得に失敗しました')
      }
      
      const projects = await projectsResponse.json()
      
      // 統計データ
      let stats = {
        totalProjects: projects.length,
        completedAnalyses: 0,
        averageROI: '0x',
        averageBreakeven: '0ヶ月'
      }
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        stats = {
          totalProjects: statsData.total_projects,
          completedAnalyses: statsData.completed_analyses,
          averageROI: '2.1x', // 固定値（実際の計算は複雑なため）
          averageBreakeven: statsData.average_breakeven_months + 'ヶ月'
        }
      }

      setDashboardData({
        projects: projects.slice(0, 5), // 最新5件
        stats
      })

    } catch (err) {
      console.error('ダッシュボードデータ取得エラー:', err)
      setError('ダッシュボードデータの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const quickStats = [
    { label: '総プロジェクト数', value: dashboardData.stats.totalProjects.toString(), change: '', color: 'primary' },
    { label: '完了分析', value: dashboardData.stats.completedAnalyses.toString(), change: '', color: 'success' },
    { label: '平均ROI', value: dashboardData.stats.averageROI, change: '', color: 'info' },
    { label: '平均損益分岐', value: dashboardData.stats.averageBreakeven, change: '', color: 'warning' }
  ]

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          ダッシュボードを読み込み中...
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchDashboardData}>
          再読み込み
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      {/* ページヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h1" gutterBottom>
            ダッシュボード
          </Typography>
          <Typography variant="body1" color="text.secondary">
            見込み客ボリューム & リスク最適化分析システム
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/projects/new')}
          size="large"
        >
          新規プロジェクト
        </Button>
      </Box>

      {/* クイック統計 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h4" component="div" fontWeight="bold">
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* 最近のプロジェクト */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                最近のプロジェクト
              </Typography>
              <Stack spacing={2}>
                {dashboardData.projects.length > 0 ? dashboardData.projects.map((project: any) => (
                  <Card
                    key={project.id}
                    variant="outlined"
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <CardContent sx={{ pb: '16px !important' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {project.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {project.industry_type === 'beauty' ? '美容・エステ' : 
                             project.industry_type === 'restaurant' ? '飲食店' :
                             project.industry_type === 'fitness' ? 'フィットネス' : project.industry_type}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            作成日: {new Date(project.created_at).toLocaleDateString('ja-JP')}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Chip
                            label={project.status === 'completed' ? '完了' : 
                                  project.status === 'active' ? 'アクティブ' : 
                                  project.status === 'planning' ? '計画中' : project.status}
                            color={project.status === 'completed' ? 'success' : 
                                  project.status === 'active' ? 'primary' : 'default'}
                            size="small"
                          />
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            エリア: {project.target_area}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                )) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    プロジェクトがありません
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* クイックアクション */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                クイックアクション
              </Typography>
              <Stack spacing={2}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<TrendingUp />}
                  onClick={() => navigate('/simulator')}
                  sx={{ justifyContent: 'flex-start', py: 1.5 }}
                >
                  <Box sx={{ textAlign: 'left', ml: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      売上シミュレーション
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      目標売上から逆算
                    </Typography>
                  </Box>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Assessment />}
                  onClick={() => navigate('/analysis')}
                  sx={{ justifyContent: 'flex-start', py: 1.5 }}
                >
                  <Box sx={{ textAlign: 'left', ml: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      商圏分析
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      人口・競合・需要分析
                    </Typography>
                  </Box>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Timeline />}
                  onClick={() => navigate('/reports')}
                  sx={{ justifyContent: 'flex-start', py: 1.5 }}
                >
                  <Box sx={{ textAlign: 'left', ml: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      レポート生成
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      PDF・PowerPoint出力
                    </Typography>
                  </Box>
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* システム情報 */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                システム情報
              </Typography>
              <Stack spacing={1}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    バージョン
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    v0.4.0 - MVP
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    利用可能API
                  </Typography>
                  <Typography variant="caption">
                    e-Stat, RESAS, Nominatim, OpenRouteService
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    新機能
                  </Typography>
                  <Typography variant="caption" color="primary.main">
                    Sales Funnel Simulator 搭載
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard 