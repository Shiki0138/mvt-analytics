import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material'
import { useTheme, useMediaQuery } from '@mui/material'

interface DataVisualizationProps {
  data: any
  type: 'simulation' | 'analysis' | 'market'
}

const DataVisualization: React.FC<DataVisualizationProps> = ({ data, type }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  // ROI可視化コンポーネント
  const ROIGauge = ({ value, target = 25 }: { value: number, target?: number }) => {
    const percentage = Math.min((value / (target * 2)) * 100, 100)
    const getColor = () => {
      if (value >= target * 1.5) return 'success'
      if (value >= target) return 'warning'
      return 'error'
    }

    return (
      <Box sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">ROI</Typography>
          <Typography variant="body2" color={`${getColor()}.main`}>
            {value.toFixed(1)}%
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={percentage} 
          color={getColor()}
          sx={{ height: 8, borderRadius: 4 }}
        />
        <Typography variant="caption" color="text.secondary">
          目標: {target}%
        </Typography>
      </Box>
    )
  }

  // リスク可視化コンポーネント
  const RiskMatrix = ({ risks }: { risks: any[] }) => {
    const getRiskColor = (probability: number, impact: number) => {
      const riskScore = probability * impact
      if (riskScore >= 0.6) return 'error'
      if (riskScore >= 0.3) return 'warning'
      return 'success'
    }

    const getRiskIcon = (probability: number, impact: number) => {
      const riskScore = probability * impact
      if (riskScore >= 0.6) return <ErrorIcon />
      if (riskScore >= 0.3) return <WarningIcon />
      return <CheckCircleIcon />
    }

    return (
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>リスク要因</TableCell>
              <TableCell align="center">発生確率</TableCell>
              <TableCell align="center">影響度</TableCell>
              <TableCell align="center">総合評価</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {risks.map((risk, index) => (
              <TableRow key={index}>
                <TableCell>{risk.factor}</TableCell>
                <TableCell align="center">
                  <LinearProgress 
                    variant="determinate" 
                    value={risk.probability * 100}
                    color={risk.probability > 0.6 ? 'error' : risk.probability > 0.3 ? 'warning' : 'success'}
                    sx={{ width: 60, height: 6 }}
                  />
                </TableCell>
                <TableCell align="center">
                  <LinearProgress 
                    variant="determinate" 
                    value={risk.impact * 100}
                    color={risk.impact > 0.6 ? 'error' : risk.impact > 0.3 ? 'warning' : 'success'}
                    sx={{ width: 60, height: 6 }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    icon={getRiskIcon(risk.probability, risk.impact)}
                    label={`${(risk.probability * risk.impact * 100).toFixed(0)}%`}
                    size="small"
                    color={getRiskColor(risk.probability, risk.impact)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )
  }

  // メディア効果可視化
  const MediaEffectiveness = ({ mediaBreakdown }: { mediaBreakdown: any }) => {
    const mediaEntries = Object.entries(mediaBreakdown || {})
    
    const getMediaName = (key: string) => {
      const names: { [key: string]: string } = {
        'google_ads': 'Google広告',
        'facebook_ads': 'Facebook広告',
        'instagram_ads': 'Instagram広告',
        'line_ads': 'LINE広告',
        'youtube_ads': 'YouTube広告',
        'tiktok_ads': 'TikTok広告',
        'local_promotion': '地域プロモーション',
        'referral_program': '紹介プログラム'
      }
      return names[key] || key
    }

    return (
      <Grid container spacing={2}>
        {mediaEntries.map(([media, data]: [string, any]) => (
          <Grid item xs={12} md={isMobile ? 12 : 6} key={media}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {getMediaName(media)}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">予算</Typography>
                    <Typography variant="h6">¥{data.budget?.toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">獲得予想</Typography>
                    <Typography variant="h6">{data.expected_customers}名</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">CPC</Typography>
                    <Typography variant="body1">¥{data.cpc}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">CVR</Typography>
                    <Typography variant="body1">{(data.cvr * 100).toFixed(1)}%</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">品質スコア</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(data.quality_score / 10) * 100}
                      color={data.quality_score >= 8 ? 'success' : data.quality_score >= 6 ? 'warning' : 'error'}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                    <Typography variant="caption">{data.quality_score}/10</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    )
  }

  // 業界比較チャート
  const IndustryComparison = ({ comparison }: { comparison: any }) => {
    return (
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                売上比較
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {comparison.revenue?.includes('上回る') ? (
                  <TrendingUpIcon color="success" />
                ) : (
                  <TrendingDownIcon color="error" />
                )}
                <Typography variant="body1">
                  {comparison.revenue}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                利益率比較
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {comparison.margin?.includes('優秀') || comparison.margin?.includes('良好') ? (
                  <TrendingUpIcon color="success" />
                ) : (
                  <TrendingDownIcon color="error" />
                )}
                <Typography variant="body1">
                  {comparison.margin}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }

  // 投資回収可視化
  const InvestmentRecovery = ({ analysis }: { analysis: any }) => {
    const months = analysis.breakeven_months || 12
    const monthlyProfit = analysis.monthly_profit || 0
    
    // 12ヶ月間のキャッシュフロー予測
    const cashflowData = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1
      const cumulativeProfit = monthlyProfit * month
      return {
        month,
        profit: monthlyProfit,
        cumulative: cumulativeProfit,
        recovered: month >= months
      }
    })

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          投資回収シミュレーション
        </Typography>
        <Grid container spacing={1}>
          {cashflowData.map((data) => (
            <Grid item xs={1} key={data.month}>
              <Box
                sx={{
                  height: 60,
                  bgcolor: data.recovered ? 'success.light' : 'grey.300',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'end',
                  justifyContent: 'center',
                  pb: 1
                }}
              >
                <Typography variant="caption" color={data.recovered ? 'success.dark' : 'text.secondary'}>
                  {data.month}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {months}ヶ月目に投資回収完了予定
        </Typography>
      </Box>
    )
  }

  // メインレンダリング
  if (type === 'simulation') {
    return (
      <Box>
        <Grid container spacing={3}>
          {/* ROI可視化 */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <ROIGauge value={data.roi || 0} />
              </CardContent>
            </Card>
          </Grid>
          
          {/* 主要指標 */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>主要指標</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">月間売上</Typography>
                    <Typography variant="h6">¥{data.monthly_revenue?.toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">月間利益</Typography>
                    <Typography variant="h6">¥{data.monthly_profit?.toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">回収期間</Typography>
                    <Typography variant="h6">{data.breakeven_months}ヶ月</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">顧客獲得数</Typography>
                    <Typography variant="h6">{data.expected_customers}名</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* メディア効果分析 */}
          {data.media_breakdown && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>メディア効果分析</Typography>
                  <MediaEffectiveness mediaBreakdown={data.media_breakdown} />
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* 業界比較 */}
          {data.industry_comparison && Object.keys(data.industry_comparison).length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>業界平均との比較</Typography>
                  <IndustryComparison comparison={data.industry_comparison} />
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* リスク分析 */}
          {data.risk_factors && data.risk_factors.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>リスク分析</Typography>
                  <RiskMatrix risks={data.risk_factors} />
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* 投資回収可視化 */}
          {data.enhanced_analysis && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <InvestmentRecovery analysis={data.enhanced_analysis} />
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>
    )
  }

  // その他のタイプは基本表示
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          データ可視化 ({type})
        </Typography>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </CardContent>
    </Card>
  )
}

export default DataVisualization