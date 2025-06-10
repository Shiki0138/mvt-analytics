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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Divider,
  InputAdornment,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material'
import DataVisualization from '../components/DataVisualization'
import {
  TrendingUp as TrendingUpIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Calculate as CalculateIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Info as InfoIcon,
  Business as BusinessIcon,
  LocationOn as LocationOnIcon
} from '@mui/icons-material'

// 広告メディアの選択肢（予算範囲: 1万円〜50万円）
const mediaOptions = [
  { value: 'google_ads', label: 'Google広告', minBudget: 10000, maxBudget: 500000 },
  { value: 'facebook_ads', label: 'Facebook広告', minBudget: 10000, maxBudget: 500000 },
  { value: 'instagram_ads', label: 'Instagram広告', minBudget: 10000, maxBudget: 500000 },
  { value: 'line_ads', label: 'LINE広告', minBudget: 15000, maxBudget: 500000 },
  { value: 'twitter_ads', label: 'Twitter広告', minBudget: 10000, maxBudget: 500000 },
  { value: 'yahoo_ads', label: 'Yahoo!広告', minBudget: 10000, maxBudget: 500000 },
  { value: 'local_promotion', label: '地域密着プロモーション', minBudget: 10000, maxBudget: 200000 },
  { value: 'seo_content', label: 'SEO・コンテンツ', minBudget: 10000, maxBudget: 300000 }
]

// 業界・媒体別の詳細指標
const industryChannelMetrics = {
  beauty: {
    label: '美容・エステ業界',
    google_ads: { cvr: 2.8, cpc: 120, ctr: 3.2 },
    facebook_ads: { cvr: 2.5, cpc: 85, ctr: 3.5 },
    instagram_ads: { cvr: 3.2, cpc: 95, ctr: 4.5 },
    line_ads: { cvr: 3.0, cpc: 140, ctr: 2.5 },
    seo_content: { cvr: 3.5, cpc: 0, ctr: 5.5 },
    local_promotion: { cvr: 5.5, cpc: 60, ctr: 8.0 }
  },
  restaurant: {
    label: '飲食業界',
    google_ads: { cvr: 3.5, cpc: 100, ctr: 2.8 },
    facebook_ads: { cvr: 4.0, cpc: 75, ctr: 3.8 },
    instagram_ads: { cvr: 3.8, cpc: 80, ctr: 4.2 },
    line_ads: { cvr: 4.5, cpc: 130, ctr: 3.0 },
    seo_content: { cvr: 3.2, cpc: 0, ctr: 4.8 },
    local_promotion: { cvr: 6.5, cpc: 45, ctr: 9.0 }
  },
  healthcare: {
    label: '医療・整骨院',
    google_ads: { cvr: 2.2, cpc: 150, ctr: 2.5 },
    facebook_ads: { cvr: 1.8, cpc: 110, ctr: 2.0 },
    instagram_ads: { cvr: 1.5, cpc: 120, ctr: 1.8 },
    line_ads: { cvr: 2.5, cpc: 180, ctr: 2.2 },
    seo_content: { cvr: 4.0, cpc: 0, ctr: 6.5 },
    local_promotion: { cvr: 5.0, cpc: 70, ctr: 7.5 }
  },
  fitness: {
    label: 'フィットネス・ジム',
    google_ads: { cvr: 2.0, cpc: 130, ctr: 3.0 },
    facebook_ads: { cvr: 2.2, cpc: 90, ctr: 3.5 },
    instagram_ads: { cvr: 2.8, cpc: 100, ctr: 4.0 },
    line_ads: { cvr: 1.8, cpc: 160, ctr: 2.0 },
    seo_content: { cvr: 2.5, cpc: 0, ctr: 4.5 },
    local_promotion: { cvr: 3.5, cpc: 80, ctr: 6.0 }
  }
}

interface SimulationParams {
  target_monthly_sales: number
  average_customer_spend: number
  selected_media: string[]
  media_budgets: { [key: string]: number }
  operating_costs: number
  initial_costs: number
}

interface SimulationResult {
  monthly_revenue: number
  monthly_profit: number
  breakeven_months: number
  roi: number
  customer_acquisition_cost: number
  required_customers: number
  expected_customers: number
  conversion_rate: number
}

function Simulator() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [project, setProject] = useState<any>(null)
  const [calculating, setCalculating] = useState(false)
  const [params, setParams] = useState<SimulationParams>({
    target_monthly_sales: 1000000,
    average_customer_spend: 5000,
    selected_media: ['google_ads'],
    media_budgets: { google_ads: 30000 },
    operating_costs: 300000,
    initial_costs: 1000000
  })
  const [result, setResult] = useState<SimulationResult | null>(null)

  useEffect(() => {
    fetchProjectData()
  }, [projectId])

  const fetchProjectData = async () => {
    try {
      // プロジェクトIDがない場合は新規シミュレーションモード
      if (!projectId) {
        setProject({
          id: 'new',
          name: '新規シミュレーション',
          industry_type: 'beauty',
          target_area: '東京都',
          description: '新規プロジェクトのシミュレーション'
        })
        setLoading(false)
        return
      }

      const response = await fetch(`${apiConfig.baseURL}/api/projects/${projectId}`)
      const data = await response.json()
      setProject(data)
      
      // 前回のシミュレーション結果がある場合は初期値として設定
      if (data.latest_simulation) {
        setParams({
          target_monthly_sales: data.latest_simulation.target_monthly_sales,
          average_customer_spend: data.latest_simulation.average_customer_spend,
          selected_media: data.latest_simulation.selected_media,
          media_budgets: data.latest_simulation.media_budgets,
          operating_costs: data.latest_simulation.operating_costs,
          initial_costs: data.latest_simulation.initial_costs
        })
      }
    } catch (err) {
      setError('プロジェクト情報の取得に失敗しました')
      console.error('プロジェクト取得エラー:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleMediaSelect = (media: string) => {
    const newSelectedMedia = params.selected_media.includes(media)
      ? params.selected_media.filter(m => m !== media)
      : [...params.selected_media, media]
    
    const newMediaBudgets = { ...params.media_budgets }
    if (!params.selected_media.includes(media)) {
      newMediaBudgets[media] = mediaOptions.find(m => m.value === media)?.minBudget || 0
    } else {
      delete newMediaBudgets[media]
    }

    setParams({
      ...params,
      selected_media: newSelectedMedia,
      media_budgets: newMediaBudgets
    })
  }

  const handleMediaBudgetChange = (media: string, value: number) => {
    setParams({
      ...params,
      media_budgets: {
        ...params.media_budgets,
        [media]: value
      }
    })
  }

  const calculateSimulation = async () => {
    setCalculating(true)
    setError(null)
    
    console.log('シミュレーション開始:', params) // デバッグ用
    
    try {
      // 実際のAPIコール
      const response = await fetch(`${apiConfig.baseURL}/api/projects/${projectId}/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`シミュレーション計算に失敗しました: ${errorText}`)
      }

      const data = await response.json()
      console.log('API レスポンス:', data) // デバッグ用
      
      // APIレスポンス構造に合わせて調整
      if (data.result) {
        setResult(data.result)
      } else {
        setResult(data)
      }
    } catch (err) {
      console.error('シミュレーションエラー:', err) // デバッグ用
      setError(`シミュレーション実行中にエラーが発生しました: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setCalculating(false)
    }
  }

  const saveSimulation = async () => {
    try {
      const response = await fetch(`${apiConfig.baseURL}/api/projects/${projectId}/simulations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          params,
          result
        }),
      })

      if (!response.ok) {
        throw new Error('シミュレーション結果の保存に失敗しました')
      }

      // 保存成功後、プロジェクト詳細画面に戻る
      navigate(`/projects/${projectId}`)
    } catch (err) {
      setError('シミュレーション結果の保存に失敗しました')
      console.error('保存エラー:', err)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount)
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
          onClick={() => navigate(projectId ? `/projects/${projectId}` : '/projects')}
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          {projectId ? 'プロジェクト詳細に戻る' : 'プロジェクト一覧に戻る'}
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              売上シミュレーション
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
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* パラメータ設定 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                シミュレーション設定
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {/* 業界選択（新規シミュレーションの場合のみ） */}
              {!projectId && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    業界選択
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={project.industry_type}
                      onChange={(e) => setProject({ ...project, industry_type: e.target.value })}
                    >
                      <MenuItem value="beauty">美容・エステ業界</MenuItem>
                      <MenuItem value="restaurant">飲食業界</MenuItem>
                      <MenuItem value="healthcare">医療・整骨院</MenuItem>
                      <MenuItem value="fitness">フィットネス・ジム</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              )}

              {/* 目標売上・客単価 */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" gutterBottom>
                  売上目標設定
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="目標月間売上"
                      value={params.target_monthly_sales}
                      onChange={(e) => setParams({ ...params, target_monthly_sales: Number(e.target.value) })}
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="平均客単価"
                      value={params.average_customer_spend}
                      onChange={(e) => setParams({ ...params, average_customer_spend: Number(e.target.value) })}
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* 業界指標の表示 */}
              {project && project.industry_type && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    📊 {industryChannelMetrics[project.industry_type as keyof typeof industryChannelMetrics]?.label || project.industry_type} の業界指標
                  </Typography>
                  <Card variant="outlined" sx={{ p: 2, bgcolor: 'info.main', color: 'info.contrastText' }}>
                    <Grid container spacing={2}>
                      {params.selected_media.length > 0 ? params.selected_media.map(media => {
                        const metrics = industryChannelMetrics[project.industry_type as keyof typeof industryChannelMetrics]?.[media as keyof (typeof industryChannelMetrics)[keyof typeof industryChannelMetrics]]
                        const mediaOption = mediaOptions.find(m => m.value === media)
                        if (!metrics || !mediaOption || typeof metrics === 'string') return null
                        return (
                          <Grid item xs={12} sm={6} md={4} key={media}>
                            <Box sx={{ 
                              textAlign: 'center', 
                              p: 2, 
                              border: '2px solid', 
                              borderColor: 'primary.main', 
                              borderRadius: 2,
                              bgcolor: 'background.paper',
                              color: 'text.primary'
                            }}>
                              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                {mediaOption.label}
                              </Typography>
                              <Typography variant="h5" color="primary" gutterBottom>
                                CVR: {metrics.cvr}%
                              </Typography>
                              <Typography variant="body1" color="text.secondary">
                                CPC: ¥{metrics.cpc.toLocaleString()}
                              </Typography>
                              <Typography variant="body1" color="text.secondary">
                                CTR: {metrics.ctr}%
                              </Typography>
                            </Box>
                          </Grid>
                        )
                      }) : (
                        <Grid item xs={12}>
                          <Typography variant="body1" sx={{ textAlign: 'center', py: 2, color: 'inherit' }}>
                            広告メディアを選択すると、{industryChannelMetrics[project.industry_type as keyof typeof industryChannelMetrics]?.label || project.industry_type}の業界指標が表示されます
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Card>
                </Box>
              )}

              {/* 広告メディア選択 */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" gutterBottom>
                  広告メディア選択
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                  {mediaOptions.map(media => (
                    <Chip
                      key={media.value}
                      label={media.label}
                      onClick={() => handleMediaSelect(media.value)}
                      color={params.selected_media.includes(media.value) ? 'primary' : 'default'}
                      variant={params.selected_media.includes(media.value) ? 'filled' : 'outlined'}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Stack>
                {params.selected_media.map(media => {
                  const mediaOption = mediaOptions.find(m => m.value === media)
                  if (!mediaOption) return null
                  return (
                    <Box key={media} sx={{ mb: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        {mediaOption.label} 予算
                      </Typography>
                      <Slider
                        value={params.media_budgets[media]}
                        onChange={(_, value) => handleMediaBudgetChange(media, value as number)}
                        min={mediaOption.minBudget}
                        max={mediaOption.maxBudget}
                        step={1000}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) => `¥${value.toLocaleString()}`}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">
                          最小: {formatCurrency(mediaOption.minBudget)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          最大: {formatCurrency(mediaOption.maxBudget)}
                        </Typography>
                      </Box>
                    </Box>
                  )
                })}
              </Box>

              {/* コスト設定 */}
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  コスト設定
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="月間運営コスト"
                      value={params.operating_costs}
                      onChange={(e) => setParams({ ...params, operating_costs: Number(e.target.value) })}
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="初期投資"
                      value={params.initial_costs}
                      onChange={(e) => setParams({ ...params, initial_costs: Number(e.target.value) })}
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<CalculateIcon />}
              onClick={calculateSimulation}
              disabled={calculating}
            >
              シミュレーション実行
            </Button>
          </Box>
        </Grid>

        {/* 結果表示 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                シミュレーション結果
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {calculating ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress size={40} />
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    計算中...
                  </Typography>
                </Box>
              ) : !result ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <TimelineIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    シミュレーションを実行してください
                  </Typography>
                </Box>
              ) : (
                <>
                  {/* 主要指標 */}
                  <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            予想月間売上
                          </Typography>
                          <Typography variant="h5" color="primary">
                            {formatCurrency(result.monthly_revenue)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            予想月間利益
                          </Typography>
                          <Typography
                            variant="h5"
                            color={result.monthly_profit >= 0 ? 'success.main' : 'error'}
                          >
                            {formatCurrency(result.monthly_profit)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* 詳細指標 */}
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          損益分岐点
                        </Typography>
                        <Typography variant="h6">
                          {result.breakeven_months}ヶ月
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          投資利益率 (ROI)
                        </Typography>
                        <Typography variant="h6">
                          {result.roi.toFixed(1)}%
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          顧客獲得コスト
                        </Typography>
                        <Typography variant="h6">
                          {formatCurrency(result.customer_acquisition_cost)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          コンバージョン率
                        </Typography>
                        <Typography variant="h6">
                          {(result.conversion_rate * 100).toFixed(2)}%
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  {/* 顧客数予測 */}
                  <Typography variant="subtitle1" gutterBottom>
                    顧客数予測
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        目標達成に必要な顧客数: {result.required_customers}人
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        予想獲得顧客数: {result.expected_customers}人
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((result.expected_customers / result.required_customers) * 100, 100)}
                      color={result.expected_customers >= result.required_customers ? 'success' : 'warning'}
                    />
                  </Box>

                  {/* 分析コメント */}
                  <Alert
                    severity={result.monthly_profit >= 0 ? 'success' : 'warning'}
                    sx={{ mt: 2 }}
                  >
                    {result.monthly_profit >= 0
                      ? `月間${formatCurrency(result.monthly_profit)}の利益が見込めます。${result.breakeven_months}ヶ月で初期投資の回収が可能です。`
                      : '現在の設定では赤字となります。広告予算やコストの見直しを検討してください。'
                    }
                  </Alert>

                  {/* データ可視化 */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      データ可視化
                    </Typography>
                    <DataVisualization data={result} type="simulation" />
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Simulator 