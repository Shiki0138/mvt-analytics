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

// 広告メディアの選択肢
const mediaOptions = [
  { value: 'google_ads', label: 'Google広告', minBudget: 30000, maxBudget: 1000000 },
  { value: 'facebook_ads', label: 'Facebook広告', minBudget: 20000, maxBudget: 800000 },
  { value: 'instagram_ads', label: 'Instagram広告', minBudget: 20000, maxBudget: 800000 },
  { value: 'line_ads', label: 'LINE広告', minBudget: 50000, maxBudget: 1500000 },
  { value: 'twitter_ads', label: 'Twitter広告', minBudget: 30000, maxBudget: 1000000 },
  { value: 'yahoo_ads', label: 'Yahoo!広告', minBudget: 30000, maxBudget: 1000000 }
]

// 業界ごとの平均コンバージョン率
const industryConversionRates = {
  beauty: 0.025,
  restaurant: 0.035,
  retail: 0.02,
  healthcare: 0.015,
  education: 0.03,
  real_estate: 0.01,
  financial: 0.012,
  automotive: 0.008
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
    media_budgets: { google_ads: 50000 },
    operating_costs: 300000,
    initial_costs: 1000000
  })
  const [result, setResult] = useState<SimulationResult | null>(null)

  useEffect(() => {
    fetchProjectData()
  }, [projectId])

  const fetchProjectData = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`)
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
    try {
      // 実際のAPIコール
      const response = await fetch(`/api/projects/${projectId}/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        throw new Error('シミュレーション計算に失敗しました')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      // APIが実装されるまでのモックデータ
      const totalMediaBudget = Object.values(params.media_budgets).reduce((sum, budget) => sum + budget, 0)
      const conversionRate = industryConversionRates[project.industry_type as keyof typeof industryConversionRates] || 0.02
      const expectedClicks = totalMediaBudget / 100 // 仮のCPC(100円)で計算
      const expectedCustomers = Math.floor(expectedClicks * conversionRate)
      const monthlyRevenue = expectedCustomers * params.average_customer_spend
      const monthlyProfit = monthlyRevenue - totalMediaBudget - params.operating_costs
      const customerAcquisitionCost = totalMediaBudget / expectedCustomers
      
      setResult({
        monthly_revenue: monthlyRevenue,
        monthly_profit: monthlyProfit,
        breakeven_months: Math.ceil(params.initial_costs / monthlyProfit),
        roi: (monthlyProfit * 12) / (params.initial_costs + totalMediaBudget * 12) * 100,
        customer_acquisition_cost: customerAcquisitionCost,
        required_customers: Math.ceil(params.target_monthly_sales / params.average_customer_spend),
        expected_customers: expectedCustomers,
        conversion_rate: conversionRate
      })
    } finally {
      setCalculating(false)
    }
  }

  const saveSimulation = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/simulations`, {
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
          onClick={() => navigate(`/projects/${projectId}`)}
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          プロジェクト詳細に戻る
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
          <Box>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={saveSimulation}
              disabled={!result}
              sx={{ mr: 1 }}
            >
              シミュレーションを保存
            </Button>
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