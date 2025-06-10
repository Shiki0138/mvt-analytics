import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { GOOGLE_MAPS_API_KEY } from '../config/api'
import { japanPrefectures, findPrefectureByName, findCityByName, type Prefecture, type City } from '../data/japanRegions'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  Fab,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  Switch,
  FormControlLabel
} from '@mui/material'
import {
  LocationOn as LocationIcon,
  Search as SearchIcon,
  MyLocation as MyLocationIcon,
  Layers as LayersIcon,
  Business as BusinessIcon,
  Analytics as AnalyticsIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material'

// Google Maps API型定義
declare global {
  interface Window {
    google: any
    initGoogleMaps: () => void
  }
}

interface GoogleMapsComponentProps {
  center?: { lat: number; lng: number }
  zoom?: number
  height?: string | number
  width?: string | number
  onLocationSelect?: (location: { lat: number; lng: number; address?: string }) => void
  showCompetitors?: boolean
  showDemographics?: boolean
  showCatchmentArea?: boolean
  projectData?: any
}

interface MapMarker {
  id: string
  position: { lat: number; lng: number }
  title: string
  type: 'target' | 'competitor' | 'demographic' | 'poi'
  data?: any
}

interface LayerConfig {
  competitors: boolean
  demographics: boolean
  catchmentArea: boolean
  realEstate: boolean
  transportation: boolean
}

const GoogleMapsComponent: React.FC<GoogleMapsComponentProps> = ({
  center = { lat: 35.6762, lng: 139.6503 }, // 東京駅（デフォルト）
  zoom = 13,
  height = 400,
  width = '100%',
  onLocationSelect,
  showCompetitors = true,
  showDemographics = true,
  showCatchmentArea = true,
  projectData
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [markers, setMarkers] = useState<MapMarker[]>([])
  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const [searchAddress, setSearchAddress] = useState('')
  const [layersOpen, setLayersOpen] = useState(false)
  const [catchmentRadius, setCatchmentRadius] = useState(1000) // メートル
  const [selectedPrefecture, setSelectedPrefecture] = useState<Prefecture | null>(null)
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [regionPickerOpen, setRegionPickerOpen] = useState(false)
  const [currentCenter, setCurrentCenter] = useState(center)
  
  const [layers, setLayers] = useState<LayerConfig>({
    competitors: showCompetitors,
    demographics: showDemographics,
    catchmentArea: showCatchmentArea,
    realEstate: false,
    transportation: true
  })

  // Google Maps API読み込み
  useEffect(() => {
    const loadGoogleMapsAPI = async () => {
      // 既に読み込み済みの場合
      if (window.google && window.google.maps) {
        setIsLoaded(true)
        setLoading(false)
        return
      }

      if (!GOOGLE_MAPS_API_KEY) {
        setError('Google Maps API キーが設定されていません（環境変数VITE_GOOGLE_MAPS_API_KEYを確認してください）')
        setLoading(false)
        return
      }

      console.log('🔑 Google Maps API キー設定確認済み')

      try {
        const loader = new Loader({
          apiKey: GOOGLE_MAPS_API_KEY,
          version: 'weekly',
          libraries: ['places', 'geometry', 'visualization']
        })

        await loader.load()
        setIsLoaded(true)
        setLoading(false)
      } catch (error) {
        setError('Google Maps APIの読み込みに失敗しました')
        setLoading(false)
      }
    }

    loadGoogleMapsAPI()
  }, [])

  // マップ初期化
  const initializeMap = useCallback(() => {
    if (!isLoaded || !mapRef.current || googleMapRef.current) return

    try {
      googleMapRef.current = new window.google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi.business',
            stylers: [{ visibility: 'on' }]
          }
        ]
      })

      // クリックイベント
      googleMapRef.current.addListener('click', (event: any) => {
        const lat = event.latLng.lat()
        const lng = event.latLng.lng()
        
        // 逆ジオコーディングで住所取得
        const geocoder = new window.google.maps.Geocoder()
        geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
          if (status === 'OK' && results[0]) {
            const location = {
              lat,
              lng,
              address: results[0].formatted_address
            }
            setSelectedLocation(location)
            onLocationSelect?.(location)
          }
        })
      })

      loadInitialData()
    } catch (err) {
      setError('マップの初期化に失敗しました')
    }
  }, [isLoaded, center, zoom, onLocationSelect])

  useEffect(() => {
    initializeMap()
  }, [initializeMap])

  // 初期データ読み込み
  const loadInitialData = async () => {
    if (!googleMapRef.current) return

    try {
      // 地域別競合店舗データ生成
      const generateRegionalCompetitors = () => {
        const baseCompetitors = [
          { type: 'beauty', names: ['美容室', 'ヘアサロン', 'ビューティーサロン'] },
          { type: 'restaurant', names: ['レストラン', 'カフェ', '居酒屋'] },
          { type: 'fitness', names: ['フィットネス', 'ジム', 'ヨガスタジオ'] },
          { type: 'retail', names: ['コンビニ', '薬局', 'スーパー'] }
        ]

        return baseCompetitors.flatMap((category, categoryIndex) => {
          return Array.from({ length: 2 }, (_, i) => {
            const angle = (categoryIndex * 90 + i * 45) * (Math.PI / 180)
            const distance = 0.005 + Math.random() * 0.01 // 500m-1.5km範囲
            
            return {
              id: `comp-${categoryIndex}-${i}`,
              position: {
                lat: currentCenter.lat + Math.cos(angle) * distance,
                lng: currentCenter.lng + Math.sin(angle) * distance
              },
              title: `${category.names[i % category.names.length]}${String.fromCharCode(65 + i)}`,
              type: 'competitor' as const,
              data: { 
                name: `${category.names[i % category.names.length]}${String.fromCharCode(65 + i)}`,
                category: category.type,
                rating: 3.5 + Math.random() * 1.0,
                reviews: Math.floor(50 + Math.random() * 200),
                prefecture: selectedPrefecture?.name || '東京都',
                city: selectedCity?.name || '千代田区'
              }
            }
          })
        })
      }

      const regionalCompetitors = generateRegionalCompetitors()

      if (layers.competitors) {
        addCompetitorMarkers(regionalCompetitors)
      }

      if (layers.catchmentArea) {
        drawCatchmentArea(currentCenter, catchmentRadius)
      }

      if (layers.demographics) {
        loadDemographicsData()
      }

    } catch (err) {
      console.error('データ読み込みエラー:', err)
    }
  }

  // 競合店マーカー追加
  const addCompetitorMarkers = (competitors: MapMarker[]) => {
    competitors.forEach(competitor => {
      const marker = new window.google.maps.Marker({
        position: competitor.position,
        map: googleMapRef.current,
        title: competitor.title,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#f44336" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(24, 24)
        }
      })

      // 情報ウィンドウ
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="max-width: 250px;">
            <h4>${competitor.data?.name}</h4>
            <p>評価: ⭐ ${competitor.data?.rating?.toFixed(1)} (${competitor.data?.reviews}件)</p>
            <p>業種: ${competitor.data?.category}</p>
            <p>地域: ${competitor.data?.prefecture} ${competitor.data?.city}</p>
            <small style="color: #666;">競合店舗</small>
          </div>
        `
      })

      marker.addListener('click', () => {
        infoWindow.open(googleMapRef.current, marker)
      })
    })
  }

  // 商圏エリア描画
  const drawCatchmentArea = (center: { lat: number; lng: number }, radius: number) => {
    new window.google.maps.Circle({
      strokeColor: '#1976d2',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#1976d2',
      fillOpacity: 0.15,
      map: googleMapRef.current,
      center: center,
      radius: radius
    })
  }

  // 人口統計データ読み込み
  const loadDemographicsData = () => {
    // 地域別人口密度データ生成
    const generateRegionalHeatmapData = () => {
      const basePopulationDensity = selectedCity?.population || 100000
      const points: any[] = []
      
      // 中心点周辺に人口密度に応じてデータポイント生成
      for (let i = 0; i < 20; i++) {
        const angle = (i * 18) * (Math.PI / 180) // 18度ずつ
        const distance = 0.002 + Math.random() * 0.008 // 200m-1km範囲
        const weight = Math.max(0.1, (basePopulationDensity / 500000) + Math.random() * 0.5)
        
        points.push({
          location: new window.google.maps.LatLng(
            currentCenter.lat + Math.cos(angle) * distance,
            currentCenter.lng + Math.sin(angle) * distance
          ),
          weight: weight
        })
      }

      // 商業地域の高密度ポイント追加
      if (selectedPrefecture) {
        const commercialAreas = [
          { lat: currentCenter.lat + 0.003, lng: currentCenter.lng + 0.002, weight: 0.8 },
          { lat: currentCenter.lat - 0.002, lng: currentCenter.lng + 0.004, weight: 0.6 },
          { lat: currentCenter.lat + 0.001, lng: currentCenter.lng - 0.003, weight: 0.7 }
        ]

        commercialAreas.forEach(area => {
          points.push({
            location: new window.google.maps.LatLng(area.lat, area.lng),
            weight: area.weight
          })
        })
      }

      return points
    }

    const heatmapData = generateRegionalHeatmapData()

    new window.google.maps.visualization.HeatmapLayer({
      data: heatmapData,
      map: googleMapRef.current,
      radius: 40,
      opacity: 0.6,
      gradient: [
        'rgba(0, 255, 255, 0)',
        'rgba(0, 255, 255, 1)',
        'rgba(0, 191, 255, 1)',
        'rgba(0, 127, 255, 1)',
        'rgba(0, 63, 255, 1)',
        'rgba(0, 0, 255, 1)',
        'rgba(0, 0, 223, 1)',
        'rgba(0, 0, 191, 1)',
        'rgba(0, 0, 159, 1)',
        'rgba(0, 0, 127, 1)',
        'rgba(63, 0, 91, 1)',
        'rgba(127, 0, 63, 1)',
        'rgba(191, 0, 31, 1)',
        'rgba(255, 0, 0, 1)'
      ]
    })
  }

  // 住所検索
  const handleAddressSearch = () => {
    if (!searchAddress || !googleMapRef.current) return

    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode({ address: searchAddress }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location
        googleMapRef.current.setCenter(location)
        googleMapRef.current.setZoom(15)
        
        // マーカー追加
        new window.google.maps.Marker({
          position: location,
          map: googleMapRef.current,
          title: searchAddress
        })
      } else {
        setError('住所が見つかりませんでした')
      }
    })
  }

  // 現在位置取得
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          googleMapRef.current.setCenter(pos)
          googleMapRef.current.setZoom(15)
        },
        () => {
          setError('現在位置の取得に失敗しました')
        }
      )
    }
  }

  // レイヤー切り替え
  const handleLayerToggle = (layerName: keyof LayerConfig) => {
    setLayers(prev => ({
      ...prev,
      [layerName]: !prev[layerName]
    }))
  }

  // 都道府県選択
  const handlePrefectureChange = (prefecture: Prefecture) => {
    setSelectedPrefecture(prefecture)
    setSelectedCity(null)
    setCurrentCenter(prefecture.center)
    if (googleMapRef.current) {
      googleMapRef.current.setCenter(prefecture.center)
      googleMapRef.current.setZoom(prefecture.zoom)
    }
  }

  // 市町村選択
  const handleCityChange = (city: City) => {
    setSelectedCity(city)
    setCurrentCenter(city.center)
    if (googleMapRef.current) {
      googleMapRef.current.setCenter(city.center)
      googleMapRef.current.setZoom(city.zoom)
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={height}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Google Maps を読み込み中...
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ height: height }}>
        {error}
        <br />
        <Typography variant="caption">
          注意: Google Maps API キーが必要です。
          <br />
          環境変数 VITE_GOOGLE_MAPS_API_KEY を設定してください。
        </Typography>
      </Alert>
    )
  }

  return (
    <Box position="relative" width={width} height={height}>
      {/* マップ本体 */}
      <Box
        ref={mapRef}
        width="100%"
        height="100%"
        sx={{ borderRadius: 1 }}
      />

      {/* 検索バー */}
      <Card
        sx={{
          position: 'absolute',
          top: 10,
          left: 10,
          right: 10,
          zIndex: 1000
        }}
      >
        <CardContent sx={{ py: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              placeholder="住所を検索..."
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddressSearch()}
              sx={{ flexGrow: 1 }}
            />
            <Button
              variant="contained"
              size="small"
              startIcon={<SearchIcon />}
              onClick={handleAddressSearch}
            >
              検索
            </Button>
            <Tooltip title="現在位置">
              <Fab
                size="small"
                color="primary"
                onClick={getCurrentLocation}
              >
                <MyLocationIcon />
              </Fab>
            </Tooltip>
            <Tooltip title="地域選択">
              <Button
                variant="outlined"
                size="small"
                startIcon={<LocationIcon />}
                onClick={() => setRegionPickerOpen(true)}
              >
                {selectedCity ? selectedCity.name : selectedPrefecture ? selectedPrefecture.name : '地域選択'}
              </Button>
            </Tooltip>
          </Stack>
        </CardContent>
      </Card>

      {/* レイヤーコントロール */}
      <Fab
        color="secondary"
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16
        }}
        onClick={() => setLayersOpen(true)}
      >
        <LayersIcon />
      </Fab>

      {/* 選択位置情報 */}
      {selectedLocation && (
        <Card
          sx={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            maxWidth: 300,
            zIndex: 1000
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <LocationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              選択位置
            </Typography>
            <Typography variant="body2">
              {selectedLocation.address}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              緯度: {selectedLocation.lat.toFixed(6)}
              <br />
              経度: {selectedLocation.lng.toFixed(6)}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* レイヤー設定ダイアログ */}
      <Dialog
        open={layersOpen}
        onClose={() => setLayersOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>マップレイヤー設定</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={layers.competitors}
                  onChange={() => handleLayerToggle('competitors')}
                />
              }
              label="競合店舗"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={layers.demographics}
                  onChange={() => handleLayerToggle('demographics')}
                />
              }
              label="人口統計ヒートマップ"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={layers.catchmentArea}
                  onChange={() => handleLayerToggle('catchmentArea')}
                />
              }
              label="商圏エリア"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={layers.transportation}
                  onChange={() => handleLayerToggle('transportation')}
                />
              }
              label="交通情報"
            />
            
            {layers.catchmentArea && (
              <Box>
                <Typography gutterBottom>
                  商圏半径: {catchmentRadius}m
                </Typography>
                <Slider
                  value={catchmentRadius}
                  onChange={(_, value) => setCatchmentRadius(value as number)}
                  min={500}
                  max={3000}
                  step={100}
                  marks={[
                    { value: 500, label: '500m' },
                    { value: 1000, label: '1km' },
                    { value: 2000, label: '2km' },
                    { value: 3000, label: '3km' }
                  ]}
                />
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLayersOpen(false)}>閉じる</Button>
          <Button
            variant="contained"
            onClick={() => {
              setLayersOpen(false)
              loadInitialData() // レイヤー再読み込み
            }}
          >
            適用
          </Button>
        </DialogActions>
      </Dialog>

      {/* 地域選択ダイアログ */}
      <Dialog
        open={regionPickerOpen}
        onClose={() => setRegionPickerOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>地域選択</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            {/* 都道府県選択 */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                都道府県
              </Typography>
              <FormControl fullWidth>
                <InputLabel>都道府県を選択</InputLabel>
                <Select
                  value={selectedPrefecture?.code || ''}
                  onChange={(e) => {
                    const prefecture = japanPrefectures.find(p => p.code === e.target.value)
                    if (prefecture) handlePrefectureChange(prefecture)
                  }}
                >
                  {japanPrefectures.map((prefecture) => (
                    <MenuItem key={prefecture.code} value={prefecture.code}>
                      {prefecture.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* 市町村選択 */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                市町村
              </Typography>
              <FormControl fullWidth disabled={!selectedPrefecture}>
                <InputLabel>市町村を選択</InputLabel>
                <Select
                  value={selectedCity?.code || ''}
                  onChange={(e) => {
                    const city = selectedPrefecture?.cities.find(c => c.code === e.target.value)
                    if (city) handleCityChange(city)
                  }}
                >
                  {selectedPrefecture?.cities.map((city) => (
                    <MenuItem key={city.code} value={city.code}>
                      {city.name}
                      {city.population && (
                        <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                          (人口: {city.population.toLocaleString()}人)
                        </Typography>
                      )}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* 地域ブロック別クイック選択 */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                地域ブロック別クイック選択
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {Object.entries({
                  '北海道': ['北海道'],
                  '東北': ['青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'],
                  '関東': ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'],
                  '中部': ['新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県'],
                  '近畿': ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'],
                  '中国': ['鳥取県', '島根県', '岡山県', '広島県', '山口県'],
                  '四国': ['徳島県', '香川県', '愛媛県', '高知県'],
                  '九州': ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県']
                }).map(([region, prefectures]) => (
                  <Chip
                    key={region}
                    label={region}
                    variant="outlined"
                    clickable
                    onClick={() => {
                      const firstPref = japanPrefectures.find(p => prefectures.includes(p.name))
                      if (firstPref) handlePrefectureChange(firstPref)
                    }}
                  />
                ))}
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegionPickerOpen(false)}>閉じる</Button>
          <Button
            variant="contained"
            onClick={() => {
              setRegionPickerOpen(false)
              if (selectedCity || selectedPrefecture) {
                loadInitialData() // 地域データ再読み込み
              }
            }}
            disabled={!selectedPrefecture}
          >
            この地域に移動
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default GoogleMapsComponent