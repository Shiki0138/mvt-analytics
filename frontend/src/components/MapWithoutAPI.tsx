import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  Alert,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import {
  LocationOn as LocationIcon,
  Search as SearchIcon,
  Info as InfoIcon,
  Business as BusinessIcon
} from '@mui/icons-material'

interface SimpleMapComponentProps {
  center?: { lat: number; lng: number }
  zoom?: number
  markers?: any[]
  selectedRadius?: number
  showRadius?: boolean
  onLocationSelect?: (location: { lat: number; lng: number }) => void
  projectData?: any
}

// 無料のOpenStreetMap代替案
const SimpleMapComponent: React.FC<SimpleMapComponentProps> = ({
  center = { lat: 35.6762, lng: 139.6503 },
  zoom = 13,
  markers = [],
  selectedRadius = 1.0,
  showRadius = true,
  onLocationSelect,
  projectData
}) => {
  const [address, setAddress] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const [mockAnalysis, setMockAnalysis] = useState<any>(null)
  const [analysisOpen, setAnalysisOpen] = useState(false)

  // 住所解析（モック）
  const analyzeLocation = (address: string) => {
    // 実際の実装では、無料のジオコーディングAPIまたは
    // バックエンドでの住所解析を使用
    const mockData = {
      address: address,
      estimated_location: {
        lat: 35.6762 + (Math.random() - 0.5) * 0.01,
        lng: 139.6503 + (Math.random() - 0.5) * 0.01
      },
      area_analysis: {
        population_density: '高',
        business_district: true,
        station_access: '徒歩5分以内',
        competitor_count: Math.floor(Math.random() * 10) + 1,
        foot_traffic: ['平日: 多', '週末: 非常に多'],
        demographics: {
          '20-30代': '35%',
          '30-40代': '28%', 
          '40-50代': '22%',
          '50代以上': '15%'
        }
      },
      business_score: Math.floor(Math.random() * 30) + 70, // 70-100
      recommendations: [
        '駅からのアクセスが良好で集客に有利',
        'ターゲット層の人口密度が高い',
        '競合が適度にあり市場が形成されている',
        '平日・週末ともに人通りが多い'
      ]
    }

    setSelectedLocation(mockData)
    setMockAnalysis(mockData)
    onLocationSelect?.(mockData.estimated_location)
  }

  const handleSearch = () => {
    if (!address.trim()) return
    analyzeLocation(address)
  }

  return (
    <Box>
      {/* 検索セクション */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <LocationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            立地分析
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              fullWidth
              label="住所または駅名を入力"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="例: 渋谷駅、東京都渋谷区神南1-1-1"
            />
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              disabled={!address.trim()}
            >
              分析
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* 代替マップエリア */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            地図エリア（シンプル版）
          </Typography>
          <Box
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const x = e.clientX - rect.left
              const y = e.clientY - rect.top
              const lat = center.lat + (0.5 - y / rect.height) * 0.01
              const lng = center.lng + (x / rect.width - 0.5) * 0.01
              onLocationSelect?.({ lat, lng })
              setAddress(`緯度: ${lat.toFixed(6)}, 経度: ${lng.toFixed(6)}`)
            }}
            sx={{
              height: 300,
              bgcolor: 'lightblue',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1,
              border: '2px solid',
              borderColor: 'primary.main',
              cursor: 'crosshair',
              position: 'relative',
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          >
            <Stack alignItems="center" spacing={2}>
              <LocationIcon sx={{ fontSize: 48, color: 'primary.main' }} />
              <Typography variant="h6" color="primary.main">
                📍 クリックして位置を選択
              </Typography>
              <Typography variant="body2" color="grey.600" textAlign="center">
                この地図エリアをクリックして商圏の中心地を設定
                <br />
                選択した位置: 緯度 {center.lat.toFixed(4)}, 経度 {center.lng.toFixed(4)}
                <br />
                商圏半径: {selectedRadius}km
              </Typography>
              {showRadius && (
                <Box sx={{ 
                  position: 'absolute',
                  width: `${selectedRadius * 60}px`,
                  height: `${selectedRadius * 60}px`,
                  border: '2px dashed red',
                  borderRadius: '50%',
                  pointerEvents: 'none'
                }} />
              )}
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* 分析結果 */}
      {selectedLocation && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📍 立地分析結果
            </Typography>
            
            <Grid container spacing={3}>
              {/* 基本情報 */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  基本情報
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>住所:</strong> {selectedLocation.address}
                  </Typography>
                  <Typography variant="body2">
                    <strong>最寄駅:</strong> {selectedLocation.area_analysis.station_access}
                  </Typography>
                  <Typography variant="body2">
                    <strong>人口密度:</strong> {selectedLocation.area_analysis.population_density}
                  </Typography>
                  <Typography variant="body2">
                    <strong>競合店舗数:</strong> {selectedLocation.area_analysis.competitor_count}店舗
                  </Typography>
                </Stack>
              </Grid>

              {/* ビジネススコア */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  総合評価
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h3" color="primary" sx={{ mr: 2 }}>
                    {selectedLocation.business_score}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    / 100点
                  </Typography>
                </Box>
                <Chip
                  label={selectedLocation.business_score >= 85 ? '優秀な立地' : 
                         selectedLocation.business_score >= 70 ? '良好な立地' : '検討要'}
                  color={selectedLocation.business_score >= 85 ? 'success' : 
                         selectedLocation.business_score >= 70 ? 'warning' : 'error'}
                />
              </Grid>

              {/* 人通り */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  人通り分析
                </Typography>
                <Stack spacing={1}>
                  {selectedLocation.area_analysis.foot_traffic.map((traffic: string, index: number) => (
                    <Typography key={index} variant="body2">
                      • {traffic}
                    </Typography>
                  ))}
                </Stack>
              </Grid>

              {/* 年齢層分布 */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  年齢層分布
                </Typography>
                <Grid container spacing={1}>
                  {Object.entries(selectedLocation.area_analysis.demographics).map(([age, percent]) => (
                    <Grid item xs={6} key={age}>
                      <Typography variant="body2">
                        {age}: {String(percent)}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              {/* 推奨事項 */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  💡 立地の特徴・推奨事項
                </Typography>
                <Stack spacing={1}>
                  {selectedLocation.recommendations.map((rec: string, index: number) => (
                    <Alert key={index} severity="info" sx={{ py: 0 }}>
                      {rec}
                    </Alert>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* 実装予定機能ダイアログ */}
      <Dialog
        open={analysisOpen}
        onClose={() => setAnalysisOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          🗺️ Google Maps 統合予定機能
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            <Alert severity="info">
              <Typography variant="subtitle2" gutterBottom>
                📍 インタラクティブマップ
              </Typography>
              • 詳細な地図表示・ズーム・移動
              • クリックで正確な位置選択
              • ストリートビュー統合
            </Alert>

            <Alert severity="success">
              <Typography variant="subtitle2" gutterBottom>
                🏪 競合店舗マッピング
              </Typography>
              • 半径内の同業種店舗を自動検索
              • 店舗詳細・評価・写真表示
              • 競合密度の可視化
            </Alert>

            <Alert severity="warning">
              <Typography variant="subtitle2" gutterBottom>
                👥 人口統計ヒートマップ
              </Typography>
              • 年齢層・所得層の分布表示
              • ターゲット顧客密度の可視化
              • 時間帯別人流データ
            </Alert>

            <Alert severity="error">
              <Typography variant="subtitle2" gutterBottom>
                🚇 交通アクセス分析
              </Typography>
              • 最寄駅・バス停の表示
              • 徒歩・車でのアクセス時間
              • 駐車場・駐輪場情報
            </Alert>

            <Typography variant="h6" color="primary">
              💰 実装費用: 月額 $0〜50
            </Typography>
            <Typography variant="body2" color="text.secondary">
              小規模利用なら Google Maps API の無料枠内で実現可能です
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnalysisOpen(false)}>閉じる</Button>
          <Button
            variant="contained"
            onClick={() => {
              setAnalysisOpen(false)
              window.open('/docs/GoogleMaps_Implementation_Guide.md', '_blank')
            }}
          >
            実装ガイドを見る
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SimpleMapComponent