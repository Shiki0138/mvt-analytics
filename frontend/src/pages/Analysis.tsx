import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Alert,
  Stack,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material'
import {
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Store as StoreIcon,
  Analytics as AnalyticsIcon
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
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

function Analysis() {
  const { projectId } = useParams()
  const [tabValue, setTabValue] = useState(0)
  const [loading, setLoading] = useState(false)
  const [analysisRadius, setAnalysisRadius] = useState(1000) // メートル
  const [targetAge, setTargetAge] = useState('all')

  // モックデータ
  const demographicsData = {
    totalPopulation: 45823,
    ageGroups: [
      { range: '20-29歳', count: 8245, percentage: 18.0 },
      { range: '30-39歳', count: 9876, percentage: 21.5 },
      { range: '40-49歳', count: 12456, percentage: 27.2 },
      { range: '50-59歳', count: 8932, percentage: 19.5 },
      { range: '60歳以上', count: 6314, percentage: 13.8 }
    ],
    households: 23456,
    averageIncome: 5680000,
    workingPopulation: 34567
  }

  const competitorData = [
    {
      id: 1,
      name: 'ヘアサロン ABC',
      category: '美容室',
      distance: 350,
      rating: 4.2,
      reviews: 145,
      priceRange: '¥4,000-8,000',
      features: ['カット', 'カラー', 'パーマ']
    },
    {
      id: 2,
      name: 'ビューティーサロン XYZ',
      category: '美容室',
      distance: 580,
      rating: 4.5,
      reviews: 203,
      priceRange: '¥5,000-12,000',
      features: ['カット', 'カラー', 'トリートメント', 'ヘッドスパ']
    },
    {
      id: 3,
      name: 'カットハウス 123',
      category: '理容室',
      distance: 420,
      rating: 3.8,
      reviews: 89,
      priceRange: '¥2,500-4,000',
      features: ['カット', 'シェービング']
    }
  ]

  const demandData = {
    marketSize: 890000000, // 年間市場規模（円）
    growthRate: 2.3, // 年間成長率（%）
    seasonality: [
      { month: '1月', demand: 85 },
      { month: '2月', demand: 78 },
      { month: '3月', demand: 110 },
      { month: '4月', demand: 105 },
      { month: '5月', demand: 92 },
      { month: '6月', demand: 88 },
      { month: '7月', demand: 95 },
      { month: '8月', demand: 102 },
      { month: '9月', demand: 98 },
      { month: '10月', demand: 108 },
      { month: '11月', demand: 115 },
      { month: '12月', demand: 125 }
    ],
    keywordTrends: [
      { keyword: '美容室 渋谷', volume: 12400, trend: 'up' },
      { keyword: 'ヘアカット 渋谷', volume: 8900, trend: 'stable' },
      { keyword: 'ヘアカラー 渋谷', volume: 6700, trend: 'up' },
      { keyword: 'パーマ 渋谷', volume: 3400, trend: 'down' }
    ]
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const runAnalysis = async () => {
    setLoading(true)
    // 実際の分析処理をシミュレート
    setTimeout(() => {
      setLoading(false)
    }, 2000)
  }

  const formatCurrency = (amount: number) => `¥${amount.toLocaleString()}`
  const formatNumber = (num: number) => num.toLocaleString()

  return (
    <Box>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h1" gutterBottom>
            商圏・競合・需要分析
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {projectId ? `プロジェクトID: ${projectId}` : '地域市場の詳細分析'}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AnalyticsIcon />}
          onClick={runAnalysis}
          disabled={loading}
        >
          {loading ? '分析中...' : '分析実行'}
        </Button>
      </Box>

      {/* 分析条件設定 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            分析条件
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                label="分析半径"
                type="number"
                value={analysisRadius}
                onChange={(e) => setAnalysisRadius(Number(e.target.value))}
                InputProps={{ endAdornment: 'メートル' }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>ターゲット年齢層</InputLabel>
                <Select
                  value={targetAge}
                  onChange={(e) => setTargetAge(e.target.value)}
                >
                  <MenuItem value="all">全年齢</MenuItem>
                  <MenuItem value="20-29">20-29歳</MenuItem>
                  <MenuItem value="30-39">30-39歳</MenuItem>
                  <MenuItem value="40-49">40-49歳</MenuItem>
                  <MenuItem value="50-59">50-59歳</MenuItem>
                  <MenuItem value="60+">60歳以上</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Alert severity="info" sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                MVP版はモックデータを表示
              </Alert>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>分析処理中...</Typography>
            <LinearProgress />
            <Typography variant="body2" sx={{ mt: 1 }}>
              e-Stat、RESAS、Nominatim等のAPIからデータを取得しています
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* 分析タブ */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab 
              label="商圏人口分析" 
              icon={<PeopleIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="競合店舗分析" 
              icon={<StoreIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="需要・トレンド分析" 
              icon={<TrendingUpIcon />} 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* 商圏人口分析 */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    人口統計サマリー
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h4" color="primary">
                            {formatNumber(demographicsData.totalPopulation)}
                          </Typography>
                          <Typography variant="caption">総人口</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h4" color="secondary">
                            {formatNumber(demographicsData.households)}
                          </Typography>
                          <Typography variant="caption">世帯数</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h4" color="info.main">
                            {formatCurrency(demographicsData.averageIncome)}
                          </Typography>
                          <Typography variant="caption">平均年収</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h4" color="success.main">
                            {formatNumber(demographicsData.workingPopulation)}
                          </Typography>
                          <Typography variant="caption">就業人口</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                年齢層分布
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>年齢層</TableCell>
                      <TableCell align="right">人口</TableCell>
                      <TableCell align="right">割合</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {demographicsData.ageGroups.map((group) => (
                      <TableRow key={group.range}>
                        <TableCell>{group.range}</TableCell>
                        <TableCell align="right">{formatNumber(group.count)}</TableCell>
                        <TableCell align="right">{group.percentage}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 競合店舗分析 */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            周辺競合店舗（{analysisRadius}m以内）
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>店舗名</TableCell>
                  <TableCell>カテゴリ</TableCell>
                  <TableCell align="right">距離</TableCell>
                  <TableCell align="center">評価</TableCell>
                  <TableCell>価格帯</TableCell>
                  <TableCell>特徴</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {competitorData.map((competitor) => (
                  <TableRow key={competitor.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BusinessIcon fontSize="small" />
                        {competitor.name}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={competitor.category}
                        size="small"
                        color={competitor.category === '美容室' ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">{competitor.distance}m</TableCell>
                    <TableCell align="center">
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          ★{competitor.rating}
                        </Typography>
                        <Typography variant="caption">
                          ({competitor.reviews}件)
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{competitor.priceRange}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {competitor.features.map((feature) => (
                          <Chip key={feature} label={feature} size="small" variant="outlined" />
                        ))}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Alert severity="warning" sx={{ mt: 2 }}>
            競合店舗データは Google Places API（MVP版ではモック）を使用しています
          </Alert>
        </TabPanel>

        {/* 需要・トレンド分析 */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                市場規模・成長率
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h4" color="primary">
                        {formatCurrency(demandData.marketSize)}
                      </Typography>
                      <Typography variant="caption">年間市場規模</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h4" color="success.main">
                        +{demandData.growthRate}%
                      </Typography>
                      <Typography variant="caption">年間成長率</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                検索キーワードトレンド
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>キーワード</TableCell>
                      <TableCell align="right">検索ボリューム</TableCell>
                      <TableCell align="center">トレンド</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {demandData.keywordTrends.map((keyword) => (
                      <TableRow key={keyword.keyword}>
                        <TableCell>{keyword.keyword}</TableCell>
                        <TableCell align="right">{formatNumber(keyword.volume)}</TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={keyword.trend === 'up' ? '上昇' : keyword.trend === 'down' ? '下降' : '安定'}
                            color={keyword.trend === 'up' ? 'success' : keyword.trend === 'down' ? 'error' : 'default'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                季節性需要パターン
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>月</TableCell>
                      <TableCell align="right">需要指数</TableCell>
                      <TableCell align="right">相対値</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {demandData.seasonality.map((month) => (
                      <TableRow key={month.month}>
                        <TableCell>{month.month}</TableCell>
                        <TableCell align="right">{month.demand}</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box
                              sx={{
                                width: `${month.demand}%`,
                                height: 8,
                                bgcolor: month.demand > 100 ? 'success.main' : 'primary.main',
                                borderRadius: 1,
                                mr: 1
                              }}
                            />
                            {month.demand > 100 ? '高' : month.demand < 90 ? '低' : '普通'}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mt: 2 }}>
            需要データは RESAS API とGoogle Trends（MVP版ではモック）を使用しています
          </Alert>
        </TabPanel>
      </Card>
    </Box>
  )
}

export default Analysis 