import React, { useState, useEffect, useRef, useCallback } from 'react'
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
  center = { lat: 35.6762, lng: 139.6503 }, // 東京駅
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
  
  const [layers, setLayers] = useState<LayerConfig>({
    competitors: showCompetitors,
    demographics: showDemographics,
    catchmentArea: showCatchmentArea,
    realEstate: false,
    transportation: true
  })

  // Google Maps API読み込み
  useEffect(() => {
    const loadGoogleMapsAPI = () => {
      // 既に読み込み済みの場合
      if (window.google && window.google.maps) {
        setIsLoaded(true)
        setLoading(false)
        return
      }

      // Google Maps APIスクリプトを動的に読み込み
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'}&libraries=places,geometry,visualization`
      script.async = true
      script.defer = true
      
      script.onload = () => {
        setIsLoaded(true)
        setLoading(false)
      }
      
      script.onerror = () => {
        setError('Google Maps APIの読み込みに失敗しました')
        setLoading(false)
      }

      document.head.appendChild(script)
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
      // モックデータ：実際の実装では API から取得
      const mockCompetitors = [
        {
          id: 'comp-1',
          position: { lat: 35.6785, lng: 139.6551 },
          title: '競合店A',
          type: 'competitor' as const,
          data: { name: '美容室ABC', rating: 4.2, reviews: 145 }
        },
        {
          id: 'comp-2', 
          position: { lat: 35.6745, lng: 139.6485 },
          title: '競合店B',
          type: 'competitor' as const,
          data: { name: 'ヘアサロンXYZ', rating: 4.0, reviews: 89 }
        }
      ]

      if (layers.competitors) {
        addCompetitorMarkers(mockCompetitors)
      }

      if (layers.catchmentArea) {
        drawCatchmentArea(center, catchmentRadius)
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
          <div style="max-width: 200px;">
            <h4>${competitor.data?.name}</h4>
            <p>評価: ⭐ ${competitor.data?.rating} (${competitor.data?.reviews}件)</p>
            <p>競合店舗</p>
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
    // ヒートマップレイヤー（人口密度）
    const heatmapData = [
      new window.google.maps.LatLng(35.6762, 139.6503),
      new window.google.maps.LatLng(35.6785, 139.6551),
      new window.google.maps.LatLng(35.6745, 139.6485)
    ]

    new window.google.maps.visualization.HeatmapLayer({
      data: heatmapData,
      map: googleMapRef.current,
      radius: 50,
      opacity: 0.6
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
          環境変数 REACT_APP_GOOGLE_MAPS_API_KEY を設定してください。
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
    </Box>
  )
}

export default GoogleMapsComponent