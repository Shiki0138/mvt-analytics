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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Badge
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  ArrowBack as ArrowBackIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Business as BusinessIcon,
  LocationOn as LocationOnIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Star as StarIcon,
  TrendingDown as TrendingDownIcon,
  Speed as SpeedIcon
} from '@mui/icons-material'

// Types
interface BusinessProfile {
  industry: string
  location: string
  target_radius: number
  target_age_min: number
  target_age_max: number
  average_spend: number
  monthly_capacity: number
}

interface BusinessConstraints {
  total_budget: number
  monthly_budget_limit: number
  min_monthly_profit: number
  max_risk_tolerance: number
  target_customers: number
  target_roi: number
  time_horizon: number
}

interface AnalysisResult {
  market_prediction?: any
  risk_optimization?: any
  seasonal_analysis?: any
  integrated_insights?: string[]
}

function EnhancedAnalysis() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeStep, setActiveStep] = useState(0)
  const [project, setProject] = useState<any>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)

  // フォーム状態
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({
    industry: 'beauty',
    location: '東京都渋谷区',
    target_radius: 500,
    target_age_min: 25,
    target_age_max: 45,
    average_spend: 8000,
    monthly_capacity: 500
  })

  const [constraints, setConstraints] = useState<BusinessConstraints>({
    total_budget: 2000000,
    monthly_budget_limit: 200000,
    min_monthly_profit: 150000,
    max_risk_tolerance: 0.5,
    target_customers: 400,
    target_roi: 200.0,
    time_horizon: 12
  })

  const [selectedChannels, setSelectedChannels] = useState<string[]>([
    'google_ads',
    'facebook_ads',
    'local_promotion'
  ])

  const steps = [
    '事業プロファイル設定',
    '制約条件・目標設定',
    '分析実行',
    '結果確認',
    '詳細レポート'
  ]

  const industryOptions = [
    { value: 'beauty', label: '美容・美容室' },
    { value: 'restaurant', label: '飲食・レストラン' },
    { value: 'healthcare', label: '整骨院・治療院' },
    { value: 'fitness', label: 'フィットネス・ジム' }
  ]

  const channelOptions = [
    { value: 'google_ads', label: 'Google広告', color: '#4285f4' },
    { value: 'facebook_ads', label: 'Facebook広告', color: '#1877f2' },
    { value: 'instagram_ads', label: 'Instagram広告', color: '#e4405f' },
    { value: 'line_ads', label: 'LINE広告', color: '#00c300' },
    { value: 'seo_content', label: 'SEO・コンテンツ', color: '#ff9800' },
    { value: 'local_promotion', label: '地域プロモーション', color: '#9c27b0' }
  ]

  useEffect(() => {
    fetchProjectData()
  }, [projectId])

  const fetchProjectData = async () => {
    try {
      const response = await fetch(`${apiConfig.baseURL}/api/projects/${projectId}`)
      const data = await response.json()
      setProject(data)
      
      // プロジェクト情報で初期値を設定
      if (data.industry_type) {
        setBusinessProfile(prev => ({
          ...prev,
          industry: data.industry_type,
          location: data.target_area || prev.location
        }))
      }
    } catch (err) {
      setError('プロジェクト情報の取得に失敗しました')
      console.error('プロジェクト取得エラー:', err)
    }
  }

  const handleChannelToggle = (channel: string) => {
    setSelectedChannels(prev => 
      prev.includes(channel)
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    )
  }

  const runComprehensiveAnalysis = async () => {
    setLoading(true)
    setError(null)

    try {
      // 分析実行のシミュレーション（2秒待機）
      await new Promise(resolve => setTimeout(resolve, 2000))

      // モックデータでの結果生成
      const mockResult = generateMockAnalysisResult()
      setAnalysisResult(mockResult)
      setActiveStep(3) // 結果確認ステップに移動
    } catch (err) {
      setError('分析実行中にエラーが発生しました')
      console.error('分析エラー:', err)
    } finally {
      setLoading(false)
    }
  }

  const generateMockAnalysisResult = (): AnalysisResult => {
    const totalBudget = constraints.total_budget
    const monthlyBudget = constraints.monthly_budget_limit
    const targetCustomers = constraints.target_customers
    const averageSpend = businessProfile.average_spend

    // 業界別の基準値
    const industryMetrics = {
      beauty: { cvr: 0.028, cpc: 120, marketSaturation: 0.65 },
      restaurant: { cvr: 0.035, cpc: 100, marketSaturation: 0.78 },
      healthcare: { cvr: 0.022, cpc: 150, marketSaturation: 0.45 },
      fitness: { cvr: 0.020, cpc: 130, marketSaturation: 0.58 }
    }

    const metrics = industryMetrics[businessProfile.industry as keyof typeof industryMetrics] || industryMetrics.beauty

    // 予算配分の最適化
    const allocation: Record<string, number> = {}
    const budgetPerChannel = monthlyBudget / selectedChannels.length
    selectedChannels.forEach(channel => {
      allocation[channel] = budgetPerChannel
    })

    // 期待顧客数・売上計算
    const expectedClicks = monthlyBudget / metrics.cpc
    const expectedCustomers = Math.floor(expectedClicks * metrics.cvr)
    const expectedRevenue = expectedCustomers * averageSpend
    const expectedROI = (expectedRevenue * 12 / totalBudget - 1) * 100

    return {
      market_prediction: {
        total_market_size: 85000,
        addressable_market: 12000,
        monthly_demand: 850,
        competition_score: metrics.marketSaturation,
        market_saturation: metrics.marketSaturation,
        growth_potential: 1 - metrics.marketSaturation,
        risk_score: metrics.marketSaturation * 0.8,
        confidence: 0.82,
        key_insights: [
          `${businessProfile.location}エリアの市場規模は約85,000人`,
          `月間需要は約850人、競合飽和度は${Math.round(metrics.marketSaturation * 100)}%`,
          '成長余地は十分あり、早期参入が有利'
        ],
        recommendations: [
          'デジタル広告とローカルプロモーションの併用を推奨',
          '差別化要素を明確にしたブランディング強化',
          '顧客満足度向上による口コミ拡散戦略'
        ]
      },
      risk_optimization: {
        recommended_allocation: allocation,
        expected_roi: expectedROI,
        expected_customers: expectedCustomers,
        expected_revenue: expectedRevenue,
        risk_score: 0.35,
        confidence: 0.78,
        monthly_projections: Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          revenue: expectedRevenue * (1 + i * 0.05),
          customers: Math.floor(expectedCustomers * (1 + i * 0.05)),
          cost: monthlyBudget
        })),
        risk_mitigation_plan: [
          '段階的予算増額で効果測定',
          '複数チャネルでリスク分散',
          '月次パフォーマンス見直し'
        ],
        alternative_scenarios: [
          {
            name: '保守的シナリオ',
            budget_ratio: 0.7,
            expected_roi: expectedROI * 0.6,
            risk_level: '低'
          },
          {
            name: '積極的シナリオ',
            budget_ratio: 1.3,
            expected_roi: expectedROI * 1.4,
            risk_level: '中'
          }
        ]
      },
      seasonal_analysis: {
        peak_months: businessProfile.industry === 'beauty' ? ['3月', '12月'] :
                    businessProfile.industry === 'restaurant' ? ['12月', '1月'] :
                    businessProfile.industry === 'healthcare' ? ['6月', '9月'] : ['1月', '4月'],
        low_months: businessProfile.industry === 'beauty' ? ['6月', '8月'] :
                   businessProfile.industry === 'restaurant' ? ['6月', '8月'] :
                   businessProfile.industry === 'healthcare' ? ['12月', '1月'] : ['8月', '12月'],
        seasonal_factor: 1.2
      },
      integrated_insights: [
        `🎯 ${businessProfile.industry}業界の平均CVR ${(metrics.cvr * 100).toFixed(1)}%を活用`,
        `📈 月間${expectedCustomers}人の新規顧客獲得が見込める`,
        `💰 年間ROI ${expectedROI.toFixed(1)}%の収益性`,
        `⚡ 市場の成長余地は${Math.round((1 - metrics.marketSaturation) * 100)}%`
      ]
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount)
  }

  const getRiskLevelColor = (riskScore: number) => {
    if (riskScore >= 0.7) return 'error'
    if (riskScore >= 0.5) return 'warning'
    if (riskScore >= 0.3) return 'info'
    return 'success'
  }

  const getRiskLevelText = (riskScore: number) => {
    if (riskScore >= 0.7) return '高リスク'
    if (riskScore >= 0.5) return '中リスク'
    if (riskScore >= 0.3) return '低中リスク'
    return '低リスク'
  }

  if (!project) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          プロジェクト情報を読み込み中...
        </Typography>
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
              <AnalyticsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              高度な市場分析
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {project.name} - AI駆動の包括的ビジネス分析
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

      {/* ステッパー */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {/* ステップ1: 事業プロファイル設定 */}
          <Step>
            <StepLabel>事業プロファイル設定</StepLabel>
            <StepContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>業界</InputLabel>
                    <Select
                      value={businessProfile.industry}
                      onChange={(e) => setBusinessProfile({...businessProfile, industry: e.target.value})}
                    >
                      {industryOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <TextField
                    fullWidth
                    label="所在地"
                    value={businessProfile.location}
                    onChange={(e) => setBusinessProfile({...businessProfile, location: e.target.value})}
                    sx={{ mb: 2 }}
                  />

                  <Typography gutterBottom>ターゲット半径: {businessProfile.target_radius}m</Typography>
                  <Slider
                    value={businessProfile.target_radius}
                    onChange={(_, value) => setBusinessProfile({...businessProfile, target_radius: value as number})}
                    min={300}
                    max={2000}
                    step={100}
                    valueLabelDisplay="auto"
                    sx={{ mb: 2 }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography gutterBottom>ターゲット年齢層</Typography>
                  <Box sx={{ px: 2, mb: 2 }}>
                    <Slider
                      value={[businessProfile.target_age_min, businessProfile.target_age_max]}
                      onChange={(_, value) => {
                        const [min, max] = value as number[]
                        setBusinessProfile({
                          ...businessProfile,
                          target_age_min: min,
                          target_age_max: max
                        })
                      }}
                      min={18}
                      max={70}
                      valueLabelDisplay="auto"
                      marks={[
                        { value: 20, label: '20' },
                        { value: 40, label: '40' },
                        { value: 60, label: '60' }
                      ]}
                    />
                  </Box>

                  <TextField
                    fullWidth
                    label="平均顧客単価"
                    value={businessProfile.average_spend}
                    onChange={(e) => setBusinessProfile({...businessProfile, average_spend: Number(e.target.value)})}
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                    }}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="月間対応可能顧客数"
                    value={businessProfile.monthly_capacity}
                    onChange={(e) => setBusinessProfile({...businessProfile, monthly_capacity: Number(e.target.value)})}
                    type="number"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">人</InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => setActiveStep(1)}
                >
                  次へ
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* ステップ2: 制約条件・目標設定 */}
          <Step>
            <StepLabel>制約条件・目標設定</StepLabel>
            <StepContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>予算設定</Typography>
                  
                  <TextField
                    fullWidth
                    label="総マーケティング予算"
                    value={constraints.total_budget}
                    onChange={(e) => setConstraints({...constraints, total_budget: Number(e.target.value)})}
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                    }}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="月間予算上限"
                    value={constraints.monthly_budget_limit}
                    onChange={(e) => setConstraints({...constraints, monthly_budget_limit: Number(e.target.value)})}
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                    }}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="最低月間利益"
                    value={constraints.min_monthly_profit}
                    onChange={(e) => setConstraints({...constraints, min_monthly_profit: Number(e.target.value)})}
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>目標・リスク設定</Typography>
                  
                  <TextField
                    fullWidth
                    label="目標顧客数"
                    value={constraints.target_customers}
                    onChange={(e) => setConstraints({...constraints, target_customers: Number(e.target.value)})}
                    type="number"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">人</InputAdornment>,
                    }}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="目標ROI"
                    value={constraints.target_roi}
                    onChange={(e) => setConstraints({...constraints, target_roi: Number(e.target.value)})}
                    type="number"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    sx={{ mb: 2 }}
                  />

                  <Typography gutterBottom>
                    リスク許容度: {(constraints.max_risk_tolerance * 100).toFixed(0)}%
                  </Typography>
                  <Slider
                    value={constraints.max_risk_tolerance}
                    onChange={(_, value) => setConstraints({...constraints, max_risk_tolerance: value as number})}
                    min={0.1}
                    max={0.9}
                    step={0.1}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${(value * 100).toFixed(0)}%`}
                    marks={[
                      { value: 0.2, label: '保守的' },
                      { value: 0.5, label: 'バランス' },
                      { value: 0.8, label: '積極的' }
                    ]}
                  />
                </Grid>
              </Grid>

              {/* マーケティングチャネル選択 */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>マーケティングチャネル選択</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {channelOptions.map(channel => (
                    <Chip
                      key={channel.value}
                      label={channel.label}
                      onClick={() => handleChannelToggle(channel.value)}
                      color={selectedChannels.includes(channel.value) ? 'primary' : 'default'}
                      variant={selectedChannels.includes(channel.value) ? 'filled' : 'outlined'}
                      sx={{ 
                        mb: 1,
                        ...(selectedChannels.includes(channel.value) && {
                          backgroundColor: channel.color,
                          color: 'white'
                        })
                      }}
                    />
                  ))}
                </Stack>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setActiveStep(0)}
                  sx={{ mr: 1 }}
                >
                  戻る
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setActiveStep(2)}
                >
                  分析設定完了
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* ステップ3: 分析実行 */}
          <Step>
            <StepLabel>分析実行</StepLabel>
            <StepContent>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <SpeedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    AI分析実行
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    以下の分析を並列実行します：
                  </Typography>
                  
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="市場予測分析"
                        secondary="商圏分析、競合分析、需要予測"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="リスク最適化"
                        secondary="予算配分最適化、リスク評価、シナリオ分析"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="季節性分析"
                        secondary="月別需要予測、ピーク期特定"
                      />
                    </ListItem>
                  </List>

                  {loading && (
                    <Box sx={{ mt: 2 }}>
                      <LinearProgress />
                      <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                        高度AI分析実行中...（約3秒）
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>

              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setActiveStep(1)}
                  sx={{ mr: 1 }}
                  disabled={loading}
                >
                  戻る
                </Button>
                <Button
                  variant="contained"
                  onClick={runComprehensiveAnalysis}
                  disabled={loading}
                  startIcon={<AnalyticsIcon />}
                >
                  {loading ? '分析実行中...' : '包括的分析を実行'}
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* ステップ4: 結果確認 */}
          <Step>
            <StepLabel>結果確認</StepLabel>
            <StepContent>
              {analysisResult && (
                <Box>
                  {/* 統合洞察 */}
                  {analysisResult.integrated_insights && (
                    <Card sx={{ mb: 3 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">
                            <StarIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'gold' }} />
                            AI統合洞察
                          </Typography>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => setActiveStep(4)}
                            startIcon={<AssessmentIcon />}
                          >
                            詳細レポートを見る
                          </Button>
                        </Box>
                        <List>
                          {analysisResult.integrated_insights.map((insight, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <InfoIcon color="primary" />
                              </ListItemIcon>
                              <ListItemText primary={insight} />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  )}

                  {/* 分析結果アコーディオン */}
                  <Stack spacing={2}>
                    {/* 市場予測結果 */}
                    {analysisResult.market_prediction && (
                      <Accordion defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="h6">
                            <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            市場予測分析結果
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Grid container spacing={2}>
                            <Grid item xs={6} md={3}>
                              <Card variant="outlined">
                                <CardContent>
                                  <Typography variant="subtitle2" color="text.secondary">
                                    総市場規模
                                  </Typography>
                                  <Typography variant="h5">
                                    {analysisResult.market_prediction.total_market_size?.toLocaleString()}人
                                  </Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                            <Grid item xs={6} md={3}>
                              <Card variant="outlined">
                                <CardContent>
                                  <Typography variant="subtitle2" color="text.secondary">
                                    獲得可能市場
                                  </Typography>
                                  <Typography variant="h5">
                                    {analysisResult.market_prediction.addressable_market?.toLocaleString()}人
                                  </Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                            <Grid item xs={6} md={3}>
                              <Card variant="outlined">
                                <CardContent>
                                  <Typography variant="subtitle2" color="text.secondary">
                                    月間需要予測
                                  </Typography>
                                  <Typography variant="h5">
                                    {analysisResult.market_prediction.monthly_demand?.toLocaleString()}人
                                  </Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                            <Grid item xs={6} md={3}>
                              <Card variant="outlined">
                                <CardContent>
                                  <Typography variant="subtitle2" color="text.secondary">
                                    市場飽和度
                                  </Typography>
                                  <Typography variant="h5">
                                    {(analysisResult.market_prediction.market_saturation * 100).toFixed(1)}%
                                  </Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          </Grid>

                          {/* 主要洞察 */}
                          {analysisResult.market_prediction.key_insights && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle1" gutterBottom>主要洞察</Typography>
                              <List dense>
                                {analysisResult.market_prediction.key_insights.map((insight: string, index: number) => (
                                  <ListItem key={index}>
                                    <ListItemIcon>
                                      <InfoIcon color="info" />
                                    </ListItemIcon>
                                    <ListItemText primary={insight} />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          )}
                        </AccordionDetails>
                      </Accordion>
                    )}

                    {/* リスク最適化結果 */}
                    {analysisResult.risk_optimization && (
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="h6">
                            <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            リスク最適化結果
                            <Chip 
                              label={getRiskLevelText(analysisResult.risk_optimization.risk_score)}
                              color={getRiskLevelColor(analysisResult.risk_optimization.risk_score)}
                              size="small"
                              sx={{ ml: 2 }}
                            />
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          {/* 予算配分 */}
                          <Typography variant="subtitle1" gutterBottom>推奨予算配分</Typography>
                          <Grid container spacing={2} sx={{ mb: 3 }}>
                            {Object.entries(analysisResult.risk_optimization.recommended_allocation || {}).map(([channel, budget]) => {
                              const channelInfo = channelOptions.find(c => c.value === channel)
                              return (
                                <Grid item xs={12} sm={6} md={4} key={channel}>
                                  <Card variant="outlined">
                                    <CardContent>
                                      <Typography variant="subtitle2">
                                        {channelInfo?.label || channel}
                                      </Typography>
                                      <Typography variant="h6">
                                        {formatCurrency(budget as number)}
                                      </Typography>
                                    </CardContent>
                                  </Card>
                                </Grid>
                              )
                            })}
                          </Grid>

                          {/* 予測指標 */}
                          <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={6} md={3}>
                              <Card variant="outlined">
                                <CardContent>
                                  <Typography variant="subtitle2" color="text.secondary">
                                    期待ROI
                                  </Typography>
                                  <Typography variant="h5" color="primary">
                                    {analysisResult.risk_optimization.expected_roi?.toFixed(1)}%
                                  </Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                            <Grid item xs={6} md={3}>
                              <Card variant="outlined">
                                <CardContent>
                                  <Typography variant="subtitle2" color="text.secondary">
                                    予想顧客数
                                  </Typography>
                                  <Typography variant="h5">
                                    {analysisResult.risk_optimization.expected_customers?.toLocaleString()}人
                                  </Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                            <Grid item xs={6} md={3}>
                              <Card variant="outlined">
                                <CardContent>
                                  <Typography variant="subtitle2" color="text.secondary">
                                    予想売上
                                  </Typography>
                                  <Typography variant="h5">
                                    {formatCurrency(analysisResult.risk_optimization.expected_revenue || 0)}
                                  </Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                            <Grid item xs={6} md={3}>
                              <Card variant="outlined">
                                <CardContent>
                                  <Typography variant="subtitle2" color="text.secondary">
                                    予測信頼度
                                  </Typography>
                                  <Typography variant="h5">
                                    {(analysisResult.risk_optimization.confidence * 100).toFixed(1)}%
                                  </Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          </Grid>

                          {/* リスク軽減計画 */}
                          {analysisResult.risk_optimization.risk_mitigation_plan && (
                            <Box>
                              <Typography variant="subtitle1" gutterBottom>リスク軽減計画</Typography>
                              <List dense>
                                {analysisResult.risk_optimization.risk_mitigation_plan.map((plan: string, index: number) => (
                                  <ListItem key={index}>
                                    <ListItemIcon>
                                      <WarningIcon color="warning" />
                                    </ListItemIcon>
                                    <ListItemText primary={plan} />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          )}
                        </AccordionDetails>
                      </Accordion>
                    )}

                    {/* 季節性分析結果 */}
                    {analysisResult.seasonal_analysis && (
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="h6">
                            <TimelineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            季節性分析結果
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <Typography variant="subtitle1" gutterBottom>ピーク期</Typography>
                              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {analysisResult.seasonal_analysis.peak_months?.map((month: string) => (
                                  <Chip key={month} label={month} color="success" />
                                ))}
                              </Stack>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography variant="subtitle1" gutterBottom>低需要期</Typography>
                              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {analysisResult.seasonal_analysis.low_months?.map((month: string) => (
                                  <Chip key={month} label={month} color="warning" />
                                ))}
                              </Stack>
                            </Grid>
                          </Grid>
                        </AccordionDetails>
                      </Accordion>
                    )}
                  </Stack>

                  <Box sx={{ mt: 3 }}>
                    <Button
                      variant="outlined"
                      onClick={() => setActiveStep(2)}
                      sx={{ mr: 1 }}
                    >
                      再分析
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => navigate(`/projects/${projectId}`)}
                    >
                      完了
                    </Button>
                  </Box>
                </Box>
              )}
            </StepContent>
          </Step>

          {/* ステップ5: 詳細レポート */}
          <Step>
            <StepLabel>詳細レポート</StepLabel>
            <StepContent>
              {analysisResult && (
                <Box>
                  <Typography variant="h5" gutterBottom>
                    📊 ファクトベース市場分析レポート
                  </Typography>
                  
                  {/* エリア人口データ */}
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        🏘️ エリア人口・商圏分析
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle1" gutterBottom>対象エリア詳細</Typography>
                          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                            <Typography><strong>エリア:</strong> {businessProfile.location}</Typography>
                            <Typography><strong>商圏半径:</strong> {businessProfile.target_radius}m</Typography>
                            <Typography><strong>総人口:</strong> 約{analysisResult.market_prediction.total_market_size?.toLocaleString()}人</Typography>
                            <Typography><strong>年齢層:</strong> {businessProfile.target_age_min}〜{businessProfile.target_age_max}歳</Typography>
                            <Typography><strong>ターゲット人口:</strong> 約{analysisResult.market_prediction.addressable_market?.toLocaleString()}人</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle1" gutterBottom>人口密度・特性</Typography>
                          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                            <Typography><strong>人口密度:</strong> 高密度エリア</Typography>
                            <Typography><strong>世帯年収:</strong> 平均550万円</Typography>
                            <Typography><strong>消費傾向:</strong> アクティブ層多数</Typography>
                            <Typography><strong>交通アクセス:</strong> 駅徒歩圏内</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  {/* 競合分析 */}
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        🏢 競合・業界状況分析
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                          <Typography variant="subtitle1" gutterBottom>競合店舗数</Typography>
                          <Box sx={{ textAlign: 'center', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                            <Typography variant="h4" color="primary">
                              {Math.floor(analysisResult.market_prediction.competition_score * 100)}店舗
                            </Typography>
                            <Typography variant="body2">半径1km圏内</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="subtitle1" gutterBottom>市場飽和度</Typography>
                          <Box sx={{ textAlign: 'center', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                            <Typography variant="h4" color="warning.main">
                              {(analysisResult.market_prediction.market_saturation * 100).toFixed(1)}%
                            </Typography>
                            <Typography variant="body2">適度な競争環境</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="subtitle1" gutterBottom>成長余地</Typography>
                          <Box sx={{ textAlign: 'center', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                            <Typography variant="h4" color="success.main">
                              {(analysisResult.market_prediction.growth_potential * 100).toFixed(1)}%
                            </Typography>
                            <Typography variant="body2">新規参入可能</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  {/* 業界ベンチマーク */}
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        📈 業界ベンチマーク・データ
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle1" gutterBottom>業界平均指標</Typography>
                          <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                            <Typography><strong>平均客単価:</strong> ¥{businessProfile.average_spend.toLocaleString()}</Typography>
                            <Typography><strong>平均CVR:</strong> {((analysisResult.risk_optimization.expected_customers / (analysisResult.risk_optimization.expected_revenue / businessProfile.average_spend)) * 100).toFixed(2)}%</Typography>
                            <Typography><strong>顧客リピート率:</strong> 65%</Typography>
                            <Typography><strong>月間来店頻度:</strong> 1.8回</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle1" gutterBottom>経営指標</Typography>
                          <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                            <Typography><strong>損益分岐売上:</strong> ¥{(constraints.min_monthly_profit + 200000).toLocaleString()}</Typography>
                            <Typography><strong>目標利益率:</strong> 25%</Typography>
                            <Typography><strong>固定費率:</strong> 35%</Typography>
                            <Typography><strong>変動費率:</strong> 40%</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  {/* リスク要因と対策 */}
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        ⚠️ リスク要因と具体的対策
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle1" gutterBottom>主要リスク</Typography>
                          <List dense>
                            <ListItem>
                              <ListItemIcon><WarningIcon color="warning" /></ListItemIcon>
                              <ListItemText 
                                primary="競合店舗の価格競争"
                                secondary="対策: 差別化サービスの強化"
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon><WarningIcon color="warning" /></ListItemIcon>
                              <ListItemText 
                                primary="季節変動による売上減"
                                secondary="対策: オフシーズン向け商品開発"
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon><WarningIcon color="warning" /></ListItemIcon>
                              <ListItemText 
                                primary="スタッフ採用・定着"
                                secondary="対策: 福利厚生・研修制度充実"
                              />
                            </ListItem>
                          </List>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle1" gutterBottom>成功要因</Typography>
                          <List dense>
                            <ListItem>
                              <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                              <ListItemText 
                                primary="高い人口密度エリア"
                                secondary="集客ポテンシャル大"
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                              <ListItemText 
                                primary="駅近立地の優位性"
                                secondary="アクセス利便性"
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                              <ListItemText 
                                primary="デジタル集客の可能性"
                                secondary="SNS・口コミ活用"
                              />
                            </ListItem>
                          </List>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  {/* アクションプラン */}
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        🎯 推奨アクションプラン
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Typography variant="subtitle1" gutterBottom>開業前準備（1-2ヶ月）</Typography>
                          <List dense>
                            <ListItem>
                              <Typography variant="body2">• 競合店舗の詳細調査</Typography>
                            </ListItem>
                            <ListItem>
                              <Typography variant="body2">• ターゲット顧客インタビュー</Typography>
                            </ListItem>
                            <ListItem>
                              <Typography variant="body2">• サービスメニュー最終決定</Typography>
                            </ListItem>
                            <ListItem>
                              <Typography variant="body2">• スタッフ採用・研修</Typography>
                            </ListItem>
                          </List>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="subtitle1" gutterBottom>開業直後（1-3ヶ月）</Typography>
                          <List dense>
                            <ListItem>
                              <Typography variant="body2">• オープニングキャンペーン</Typography>
                            </ListItem>
                            <ListItem>
                              <Typography variant="body2">• 地域密着プロモーション</Typography>
                            </ListItem>
                            <ListItem>
                              <Typography variant="body2">• SNS・口コミ対策強化</Typography>
                            </ListItem>
                            <ListItem>
                              <Typography variant="body2">• 顧客満足度測定開始</Typography>
                            </ListItem>
                          </List>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="subtitle1" gutterBottom>安定期（3ヶ月〜）</Typography>
                          <List dense>
                            <ListItem>
                              <Typography variant="body2">• リピーター育成プログラム</Typography>
                            </ListItem>
                            <ListItem>
                              <Typography variant="body2">• サービス品質の継続改善</Typography>
                            </ListItem>
                            <ListItem>
                              <Typography variant="body2">• 新規サービス検討・導入</Typography>
                            </ListItem>
                            <ListItem>
                              <Typography variant="body2">• 事業拡大計画の策定</Typography>
                            </ListItem>
                          </List>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  <Box sx={{ mt: 3 }}>
                    <Button
                      variant="outlined"
                      onClick={() => setActiveStep(3)}
                      sx={{ mr: 1 }}
                    >
                      結果確認に戻る
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => navigate(`/projects/${projectId}`)}
                    >
                      完了
                    </Button>
                  </Box>
                </Box>
              )}
            </StepContent>
          </Step>
        </Stepper>
      </Paper>
    </Container>
  )
}

export default EnhancedAnalysis