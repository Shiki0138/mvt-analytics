import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Divider,
  LinearProgress,
  IconButton,
  Tooltip,
  Tab,
  Tabs
} from '@mui/material'
import {
  Assessment as AssessmentIcon,
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
  LocationOn as LocationOnIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Store as StoreIcon,
  Timeline as TimelineIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
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
      id={`analysis-tabpanel-${index}`}
      aria-labelledby={`analysis-tab-${index}`}
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

interface AnalysisResult {
  type: 'demographics' | 'competitors' | 'demand'
  status: 'completed' | 'processing' | 'failed'
  completed_at?: string
  data: any
}

function Analysis() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [project, setProject] = useState<any>(null)
  const [tabValue, setTabValue] = useState(0)
  const [analyzing, setAnalyzing] = useState(false)
  const [results, setResults] = useState<{ [key: string]: AnalysisResult }>({})

  useEffect(() => {
    fetchProjectData()
  }, [projectId])

  const fetchProjectData = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`)
      const data = await response.json()
      setProject(data)

      // 分析結果の取得
      const analysisResponse = await fetch(`/api/projects/${projectId}/analyses`)
      const analysisData = await analysisResponse.json()
      setResults(analysisData.results || {})
    } catch (err) {
      setError('プロジェクト情報の取得に失敗しました')
      console.error('データ取得エラー:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const startAnalysis = async (type: 'demographics' | 'competitors' | 'demand') => {
    setAnalyzing(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      })

      if (!response.ok) {
        throw new Error('分析の開始に失敗しました')
      }

      // 分析開始を反映
      setResults(prev => ({
        ...prev,
        [type]: {
          type,
          status: 'processing',
          data: null
        }
      }))

      // 分析完了までポーリング
      const pollResult = async () => {
        const pollResponse = await fetch(`/api/projects/${projectId}/analyses/${type}`)
        const result = await pollResponse.json()

        if (result.status === 'completed') {
          setResults(prev => ({
            ...prev,
            [type]: result
          }))
          return true
        }
        return false
      }

      // 実際のAPIが実装されるまでのモック
      setTimeout(() => {
        const mockResults = {
          demographics: {
            type: 'demographics',
            status: 'completed',
            completed_at: new Date().toISOString(),
            data: {
              total_population: 45823,
              target_population: 12500,
              age_groups: {
                '20-29': 0.15,
                '30-39': 0.25,
                '40-49': 0.22,
                '50-59': 0.20,
                '60+': 0.18
              },
              gender_ratio: {
                male: 0.48,
                female: 0.52
              },
              income_levels: {
                low: 0.25,
                medium: 0.45,
                high: 0.30
              },
              household_types: {
                single: 0.35,
                couple: 0.25,
                family: 0.40
              }
            }
          },
          competitors: {
            type: 'competitors',
            status: 'completed',
            completed_at: new Date().toISOString(),
            data: {
              total_competitors: 12,
              direct_competitors: 5,
              indirect_competitors: 7,
              market_share: {
                leader: 0.25,
                second: 0.20,
                others: 0.55
              },
              price_range: {
                min: 3000,
                max: 15000,
                average: 8000
              },
              competitor_strengths: [
                { name: '集客力', score: 4.2 },
                { name: 'サービス品質', score: 3.8 },
                { name: '価格競争力', score: 3.5 },
                { name: 'ブランド認知度', score: 4.0 }
              ]
            }
          },
          demand: {
            type: 'demand',
            status: 'completed',
            completed_at: new Date().toISOString(),
            data: {
              market_size: 890000000,
              growth_rate: 0.05,
              seasonality: {
                spring: 1.1,
                summer: 0.9,
                autumn: 1.0,
                winter: 1.2
              },
              demand_factors: [
                { factor: '人口増加', impact: 'positive', strength: 0.8 },
                { factor: '消費者嗜好', impact: 'positive', strength: 0.7 },
                { factor: '経済状況', impact: 'neutral', strength: 0.5 }
              ],
              forecast: {
                optimistic: 1000000000,
                realistic: 890000000,
                pessimistic: 780000000
              }
            }
          }
        }

        setResults(prev => ({
          ...prev,
          [type]: mockResults[type as keyof typeof mockResults]
        }))
      }, 2000)

    } catch (err) {
      setError('分析の開始に失敗しました')
      console.error('分析開始エラー:', err)
    } finally {
      setAnalyzing(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          プロジェクト情報を読み込み中...
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
          onClick={() => navigate(`/projects/${projectId}`)}
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          プロジェクト詳細に戻る
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              市場分析
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {project.name}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip
                icon={<BusinessIcon />}
                label={project.industry_type}
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
          </Box>
          <Box>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={() => {/* TODO: 分析結果の保存 */}}
              disabled={!Object.keys(results).length}
              sx={{ mr: 1 }}
            >
              分析結果を保存
            </Button>
          </Box>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* タブナビゲーション */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="商圏分析" />
          <Tab label="競合分析" />
          <Tab label="需要予測" />
        </Tabs>
      </Box>

      {/* 商圏分析タブ */}
      <TabPanel value={tabValue} index={0}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                商圏人口分析
              </Typography>
              <Button
                variant="contained"
                startIcon={<PeopleIcon />}
                onClick={() => startAnalysis('demographics')}
                disabled={analyzing || results.demographics?.status === 'processing'}
              >
                分析を実行
              </Button>
            </Box>

            {results.demographics?.status === 'processing' ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={40} />
                <Typography variant="body1" sx={{ mt: 2 }}>
                  商圏データを分析中...
                </Typography>
              </Box>
            ) : results.demographics?.status === 'completed' ? (
              <Grid container spacing={3}>
                {/* 基本情報 */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        商圏人口概要
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h4" color="primary">
                          {results.demographics.data.total_population.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          総人口
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="h5" color="secondary">
                          {results.demographics.data.target_population.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ターゲット層人口
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* 年齢構成 */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        年齢構成
                      </Typography>
                      {Object.entries(results.demographics.data.age_groups).map(([age, ratio]) => (
                        <Box key={age} sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2">{age}歳</Typography>
                            <Typography variant="body2">{formatPercentage(ratio as number)}</Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(ratio as number) * 100}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>

                {/* 世帯タイプ */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        世帯タイプ
                      </Typography>
                      {Object.entries(results.demographics.data.household_types).map(([type, ratio]) => (
                        <Box key={type} sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2">
                              {type === 'single' ? '単身世帯' :
                               type === 'couple' ? '夫婦世帯' : '家族世帯'}
                            </Typography>
                            <Typography variant="body2">{formatPercentage(ratio as number)}</Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(ratio as number) * 100}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>

                {/* 所得水準 */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        所得水準
                      </Typography>
                      {Object.entries(results.demographics.data.income_levels).map(([level, ratio]) => (
                        <Box key={level} sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2">
                              {level === 'low' ? '低所得層' :
                               level === 'medium' ? '中所得層' : '高所得層'}
                            </Typography>
                            <Typography variant="body2">{formatPercentage(ratio as number)}</Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(ratio as number) * 100}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <PeopleIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  商圏分析を実行してください
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* 競合分析タブ */}
      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                競合店舗分析
              </Typography>
              <Button
                variant="contained"
                startIcon={<StoreIcon />}
                onClick={() => startAnalysis('competitors')}
                disabled={analyzing || results.competitors?.status === 'processing'}
              >
                分析を実行
              </Button>
            </Box>

            {results.competitors?.status === 'processing' ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={40} />
                <Typography variant="body1" sx={{ mt: 2 }}>
                  競合データを分析中...
                </Typography>
              </Box>
            ) : results.competitors?.status === 'completed' ? (
              <Grid container spacing={3}>
                {/* 競合概要 */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        競合店舗概要
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="primary">
                              {results.competitors.data.direct_competitors}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              直接競合
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="secondary">
                              {results.competitors.data.indirect_competitors}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              間接競合
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* 価格帯 */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        市場価格帯
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h5" color="primary">
                          {formatCurrency(results.competitors.data.price_range.average)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          平均価格
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="body1">
                            {formatCurrency(results.competitors.data.price_range.min)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            最低価格
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body1">
                            {formatCurrency(results.competitors.data.price_range.max)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            最高価格
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* 市場シェア */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        市場シェア
                      </Typography>
                      {Object.entries(results.competitors.data.market_share).map(([position, share]) => (
                        <Box key={position} sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2">
                              {position === 'leader' ? 'トップ企業' :
                               position === 'second' ? '2番手企業' : 'その他'}
                            </Typography>
                            <Typography variant="body2">{formatPercentage(share as number)}</Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(share as number) * 100}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>

                {/* 競合力分析 */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        競合力分析
                      </Typography>
                      {results.competitors.data.competitor_strengths.map((strength) => (
                        <Box key={strength.name} sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2">{strength.name}</Typography>
                            <Typography variant="body2">{strength.score.toFixed(1)}</Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(strength.score / 5) * 100}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <StoreIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  競合分析を実行してください
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* 需要予測タブ */}
      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                市場需要予測
              </Typography>
              <Button
                variant="contained"
                startIcon={<TimelineIcon />}
                onClick={() => startAnalysis('demand')}
                disabled={analyzing || results.demand?.status === 'processing'}
              >
                分析を実行
              </Button>
            </Box>

            {results.demand?.status === 'processing' ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={40} />
                <Typography variant="body1" sx={{ mt: 2 }}>
                  需要データを分析中...
                </Typography>
              </Box>
            ) : results.demand?.status === 'completed' ? (
              <Grid container spacing={3}>
                {/* 市場規模 */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        市場規模
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h4" color="primary">
                          {formatCurrency(results.demand.data.market_size)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          年間市場規模
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="h6" color="success.main">
                          +{formatPercentage(results.demand.data.growth_rate)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          年間成長率
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* 需要予測 */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        需要予測シナリオ
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          楽観的シナリオ
                        </Typography>
                        <Typography variant="h6" color="success.main">
                          {formatCurrency(results.demand.data.forecast.optimistic)}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          現実的シナリオ
                        </Typography>
                        <Typography variant="h6">
                          {formatCurrency(results.demand.data.forecast.realistic)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          悲観的シナリオ
                        </Typography>
                        <Typography variant="h6" color="error">
                          {formatCurrency(results.demand.data.forecast.pessimistic)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* 季節変動 */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        季節変動
                      </Typography>
                      {Object.entries(results.demand.data.seasonality).map(([season, ratio]) => (
                        <Box key={season} sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2">
                              {season === 'spring' ? '春季' :
                               season === 'summer' ? '夏季' :
                               season === 'autumn' ? '秋季' : '冬季'}
                            </Typography>
                            <Typography variant="body2">{formatPercentage(ratio as number - 1)}</Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(ratio as number) * 100}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>

                {/* 需要要因 */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        需要影響要因
                      </Typography>
                      {results.demand.data.demand_factors.map((factor) => (
                        <Box key={factor.factor} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2">{factor.factor}</Typography>
                            <Chip
                              label={factor.impact === 'positive' ? '好影響' :
                                    factor.impact === 'negative' ? '悪影響' : '中立'}
                              color={factor.impact === 'positive' ? 'success' :
                                    factor.impact === 'negative' ? 'error' : 'default'}
                              size="small"
                            />
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={factor.strength * 100}
                            sx={{ height: 8, borderRadius: 4 }}
                            color={factor.impact === 'positive' ? 'success' :
                                  factor.impact === 'negative' ? 'error' : 'primary'}
                          />
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <TimelineIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  需要予測を実行してください
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </TabPanel>
    </Container>
  )
}

export default Analysis 