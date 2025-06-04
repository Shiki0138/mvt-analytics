import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Stack
} from '@mui/material'
import { Add as AddIcon, TrendingUp, Assessment, Timeline } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const navigate = useNavigate()

  // モックデータ（実際はAPIから取得）
  const recentProjects = [
    {
      id: '1',
      name: 'サンプル美容室',
      industry: 'beauty',
      status: 'completed',
      lastSimulation: '2025-01-02',
      requiredBudget: 450000
    },
    {
      id: '2',
      name: '新規カフェ店舗',
      industry: 'restaurant',
      status: 'in_progress',
      lastSimulation: '2024-12-28',
      requiredBudget: 320000
    }
  ]

  const quickStats = [
    { label: '総プロジェクト数', value: '12', change: '+2', color: 'primary' },
    { label: '完了分析', value: '28', change: '+5', color: 'success' },
    { label: '平均ROI', value: '2.4x', change: '+0.3', color: 'info' },
    { label: '平均損益分岐', value: '6.2ヶ月', change: '-0.8', color: 'warning' }
  ]

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
                <Chip
                  label={stat.change}
                  size="small"
                  color={stat.color as any}
                  variant="outlined"
                />
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
                {recentProjects.map((project) => (
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
                            {project.industry === 'beauty' ? '美容・エステ' : '飲食店'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            最終シミュレーション: {project.lastSimulation}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Chip
                            label={project.status === 'completed' ? '完了' : '進行中'}
                            color={project.status === 'completed' ? 'success' : 'warning'}
                            size="small"
                          />
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            予算: ¥{project.requiredBudget.toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
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