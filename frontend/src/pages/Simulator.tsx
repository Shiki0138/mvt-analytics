import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Divider,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  Calculate as CalculateIcon,
  Save as SaveIcon,
  Compare as CompareIcon,
  Download as DownloadIcon,
  Info as InfoIcon
} from '@mui/icons-material'

interface SimulationInput {
  targetMonthlySales: number
  averageOrderValue: number
  conversionRate: number
  selectedMedia: string[]
  industryType: string
  fixedCosts: number
  variableCostRate: number
}

interface SimulationResult {
  requiredCustomers: number
  requiredReach: number
  requiredBudget: number
  breakEvenMonths: number
  cashflowProjection: number[]
  funnelData: {
    reach: number
    clicks: number
    customers: number
    sales: number
  }
  mediaBreakdown: Array<{
    type: string
    budget: number
    expectedReach: number
    cpa: number
  }>
}

const mediaTypes = [
  { value: 'google_ads', label: 'Google 広告', cpa: 3000 },
  { value: 'facebook_ads', label: 'Facebook 広告', cpa: 2500 },
  { value: 'instagram_ads', label: 'Instagram 広告', cpa: 2800 },
  { value: 'youtube_ads', label: 'YouTube 広告', cpa: 3500 },
  { value: 'twitter_ads', label: 'Twitter 広告', cpa: 3200 },
  { value: 'line_ads', label: 'LINE 広告', cpa: 2700 }
]

const industryTypes = [
  { value: 'beauty', label: '美容・エステ', cvr: 0.03 },
  { value: 'restaurant', label: '飲食店', cvr: 0.05 },
  { value: 'retail', label: '小売・EC', cvr: 0.02 },
  { value: 'healthcare', label: '医療・健康', cvr: 0.04 },
  { value: 'education', label: '教育・スクール', cvr: 0.035 },
  { value: 'real_estate', label: '不動産', cvr: 0.015 },
  { value: 'financial', label: '金融・保険', cvr: 0.025 },
  { value: 'automotive', label: '自動車', cvr: 0.02 }
]

function Simulator() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  
  const [input, setInput] = useState<SimulationInput>({
    targetMonthlySales: 1000000,
    averageOrderValue: 10000,
    conversionRate: 0.03,
    selectedMedia: ['google_ads'],
    industryType: 'beauty',
    fixedCosts: 300000,
    variableCostRate: 0.3
  })
  
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [savedScenarios, setSavedScenarios] = useState<Array<{
    name: string
    input: SimulationInput
    result: SimulationResult
  }>>([])

  // 業界タイプが変更されたときにCVRを自動更新
  useEffect(() => {
    const industry = industryTypes.find(i => i.value === input.industryType)
    if (industry) {
      setInput(prev => ({ ...prev, conversionRate: industry.cvr }))
    }
  }, [input.industryType])

  const calculateSimulation = async () => {
    setLoading(true)
    
    try {
      // シミュレーション計算
      const requiredCustomers = Math.ceil(input.targetMonthlySales / input.averageOrderValue)
      const requiredReach = Math.ceil(requiredCustomers / input.conversionRate)
      
      // メディア別予算配分
      const selectedMediaData = mediaTypes.filter(m => input.selectedMedia.includes(m.value))
      const avgCPA = selectedMediaData.reduce((sum, m) => sum + m.cpa, 0) / selectedMediaData.length
      const requiredBudget = Math.ceil(requiredCustomers * avgCPA)
      
      // メディア別内訳
      const mediaBreakdown = selectedMediaData.map(media => {
        const allocation = 1 / selectedMediaData.length // 均等配分
        const budget = Math.ceil(requiredBudget * allocation)
        const expectedReach = Math.ceil(budget / media.cpa * (1/input.conversionRate))
        
        return {
          type: media.label,
          budget,
          expectedReach,
          cpa: media.cpa
        }
      })
      
      // キャッシュフロー予測（12ヶ月）
      const monthlyProfit = input.targetMonthlySales * (1 - input.variableCostRate) - input.fixedCosts - (requiredBudget * 0.8) // 広告費は売上の8割として計算
      const cashflowProjection = Array.from({ length: 12 }, (_, i) => {
        const cumulativeProfit = monthlyProfit * (i + 1)
        const initialInvestment = requiredBudget * 2 // 初期投資
        return cumulativeProfit - initialInvestment
      })
      
      // 損益分岐点
      const breakEvenMonths = Math.ceil(Math.abs(cashflowProjection.find(cf => cf >= 0) ? 
        cashflowProjection.findIndex(cf => cf >= 0) + 1 : 12))
      
      const simulationResult: SimulationResult = {
        requiredCustomers,
        requiredReach,
        requiredBudget,
        breakEvenMonths,
        cashflowProjection,
        funnelData: {
          reach: requiredReach,
          clicks: Math.ceil(requiredReach * 0.02), // CTR 2%と仮定
          customers: requiredCustomers,
          sales: input.targetMonthlySales
        },
        mediaBreakdown
      }
      
      setResult(simulationResult)
      
      // APIに送信（実際のプロジェクト更新）
      if (projectId) {
        const response = await fetch(`/api/simulator/calculate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_id: projectId,
            ...input,
            results: simulationResult
          })
        })
        
        if (!response.ok) {
          console.warn('シミュレーション結果の保存に失敗しました')
        }
      }
      
    } catch (error) {
      console.error('シミュレーション計算エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveScenario = () => {
    if (!result) return
    
    const scenarioName = `シナリオ ${savedScenarios.length + 1}`
    setSavedScenarios(prev => [...prev, {
      name: scenarioName,
      input: { ...input },
      result: { ...result }
    }])
  }

  const formatCurrency = (amount: number) => `¥${amount.toLocaleString()}`
  const formatNumber = (num: number) => num.toLocaleString()

  return (
    <Box>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h1" gutterBottom>
            Sales Funnel Simulator
          </Typography>
          <Typography variant="body1" color="text.secondary">
            売上目標から逆算した集客・広告シミュレーション
          </Typography>
          {projectId && (
            <Typography variant="caption" color="text.secondary">
              プロジェクトID: {projectId}
            </Typography>
          )}
        </Box>
        <Stack direction="row" spacing={2}>
          {result && (
            <>
              <Button
                variant="outlined"
                startIcon={<SaveIcon />}
                onClick={saveScenario}
              >
                シナリオ保存
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => {/* TODO: エクスポート機能 */}}
              >
                エクスポート
              </Button>
            </>
          )}
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* 入力パラメータ */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                シミュレーション条件
              </Typography>
              
              <Stack spacing={3}>
                <TextField
                  label="目標月商"
                  type="number"
                  value={input.targetMonthlySales}
                  onChange={(e) => setInput(prev => ({ ...prev, targetMonthlySales: Number(e.target.value) }))}
                  InputProps={{ endAdornment: '円' }}
                  fullWidth
                />
                
                <TextField
                  label="平均単価"
                  type="number"
                  value={input.averageOrderValue}
                  onChange={(e) => setInput(prev => ({ ...prev, averageOrderValue: Number(e.target.value) }))}
                  InputProps={{ endAdornment: '円' }}
                  fullWidth
                />
                
                <FormControl fullWidth>
                  <InputLabel>業界</InputLabel>
                  <Select
                    value={input.industryType}
                    onChange={(e) => setInput(prev => ({ ...prev, industryType: e.target.value }))}
                  >
                    {industryTypes.map(industry => (
                      <MenuItem key={industry.value} value={industry.value}>
                        {industry.label} (CVR: {(industry.cvr * 100).toFixed(1)}%)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <TextField
                  label="コンバージョン率"
                  type="number"
                  value={input.conversionRate}
                  onChange={(e) => setInput(prev => ({ ...prev, conversionRate: Number(e.target.value) }))}
                  InputProps={{ endAdornment: '%', inputProps: { step: 0.001, min: 0, max: 1 } }}
                  fullWidth
                  helperText="業界平均から自動設定されます"
                />
                
                <FormControl fullWidth>
                  <InputLabel>広告メディア</InputLabel>
                  <Select
                    multiple
                    value={input.selectedMedia}
                    onChange={(e) => setInput(prev => ({ ...prev, selectedMedia: e.target.value as string[] }))}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const media = mediaTypes.find(m => m.value === value)
                          return <Chip key={value} label={media?.label} size="small" />
                        })}
                      </Box>
                    )}
                  >
                    {mediaTypes.map(media => (
                      <MenuItem key={media.value} value={media.value}>
                        {media.label} (CPA: {formatCurrency(media.cpa)})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Divider />
                
                <Typography variant="subtitle2">コスト設定</Typography>
                
                <TextField
                  label="固定費"
                  type="number"
                  value={input.fixedCosts}
                  onChange={(e) => setInput(prev => ({ ...prev, fixedCosts: Number(e.target.value) }))}
                  InputProps={{ endAdornment: '円/月' }}
                  fullWidth
                />
                
                <TextField
                  label="変動費率"
                  type="number"
                  value={input.variableCostRate}
                  onChange={(e) => setInput(prev => ({ ...prev, variableCostRate: Number(e.target.value) }))}
                  InputProps={{ endAdornment: '%', inputProps: { step: 0.01, min: 0, max: 1 } }}
                  fullWidth
                />
                
                <Button
                  variant="contained"
                  startIcon={<CalculateIcon />}
                  onClick={calculateSimulation}
                  disabled={loading}
                  fullWidth
                  size="large"
                >
                  シミュレーション実行
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* 結果表示 */}
        <Grid item xs={12} md={8}>
          {loading && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>計算中...</Typography>
                <LinearProgress />
              </CardContent>
            </Card>
          )}
          
          {result && (
            <Stack spacing={3}>
              {/* サマリー */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    シミュレーション結果
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="primary">{formatNumber(result.requiredCustomers)}</Typography>
                        <Typography variant="caption">必要顧客数/月</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="secondary">{formatNumber(result.requiredReach)}</Typography>
                        <Typography variant="caption">必要リーチ/月</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="error">{formatCurrency(result.requiredBudget)}</Typography>
                        <Typography variant="caption">必要広告予算/月</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="warning.main">{result.breakEvenMonths}</Typography>
                        <Typography variant="caption">損益分岐点（月）</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* ファネル */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>顧客獲得ファネル</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ textAlign: 'center', flex: 1 }}>
                      <Typography variant="h5">{formatNumber(result.funnelData.reach)}</Typography>
                      <Typography variant="caption">リーチ</Typography>
                    </Box>
                    <Typography variant="h6">→</Typography>
                    <Box sx={{ textAlign: 'center', flex: 1 }}>
                      <Typography variant="h5">{formatNumber(result.funnelData.clicks)}</Typography>
                      <Typography variant="caption">クリック</Typography>
                    </Box>
                    <Typography variant="h6">→</Typography>
                    <Box sx={{ textAlign: 'center', flex: 1 }}>
                      <Typography variant="h5">{formatNumber(result.funnelData.customers)}</Typography>
                      <Typography variant="caption">顧客</Typography>
                    </Box>
                    <Typography variant="h6">→</Typography>
                    <Box sx={{ textAlign: 'center', flex: 1 }}>
                      <Typography variant="h5">{formatCurrency(result.funnelData.sales)}</Typography>
                      <Typography variant="caption">売上</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* メディア別内訳 */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>メディア別予算配分</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>メディア</TableCell>
                          <TableCell align="right">予算</TableCell>
                          <TableCell align="right">期待リーチ</TableCell>
                          <TableCell align="right">CPA</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {result.mediaBreakdown.map((media, index) => (
                          <TableRow key={index}>
                            <TableCell>{media.type}</TableCell>
                            <TableCell align="right">{formatCurrency(media.budget)}</TableCell>
                            <TableCell align="right">{formatNumber(media.expectedReach)}</TableCell>
                            <TableCell align="right">{formatCurrency(media.cpa)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>

              {/* キャッシュフロー予測 */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    キャッシュフロー予測（12ヶ月）
                    <Tooltip title="売上 - 変動費 - 固定費 - 広告費の累積">
                      <IconButton size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
                    {result.cashflowProjection.map((cf, index) => (
                      <Box key={index} sx={{ textAlign: 'center', minWidth: 80 }}>
                        <Typography variant="caption">{index + 1}月</Typography>
                        <Typography 
                          variant="body2" 
                          color={cf >= 0 ? 'success.main' : 'error.main'}
                          fontWeight="bold"
                        >
                          {cf >= 0 ? '+' : ''}{Math.round(cf / 10000)}万
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          )}
        </Grid>
      </Grid>

      {/* 保存されたシナリオ */}
      {savedScenarios.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              シナリオ比較
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>シナリオ名</TableCell>
                    <TableCell align="right">目標売上</TableCell>
                    <TableCell align="right">必要予算</TableCell>
                    <TableCell align="right">損益分岐</TableCell>
                    <TableCell align="center">アクション</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {savedScenarios.map((scenario, index) => (
                    <TableRow key={index}>
                      <TableCell>{scenario.name}</TableCell>
                      <TableCell align="right">{formatCurrency(scenario.input.targetMonthlySales)}</TableCell>
                      <TableCell align="right">{formatCurrency(scenario.result.requiredBudget)}</TableCell>
                      <TableCell align="right">{scenario.result.breakEvenMonths}ヶ月</TableCell>
                      <TableCell align="center">
                        <Button 
                          size="small"
                          onClick={() => {
                            setInput(scenario.input)
                            setResult(scenario.result)
                          }}
                        >
                          読み込み
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

export default Simulator 