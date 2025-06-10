// Google Maps API サービス
import { GOOGLE_MAPS_API_KEY } from '../config/api'

export interface PlaceResult {
  place_id: string
  name: string
  formatted_address: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  rating?: number
  user_ratings_total?: number
  price_level?: number // 0-4 (0=無料, 4=非常に高価)
  opening_hours?: {
    open_now?: boolean
    weekday_text?: string[]
  }
  formatted_phone_number?: string
  website?: string
  photos?: any[]
  reviews?: any[]
  types?: string[]
  business_status?: string
  
  // 追加の分析データ
  popular_times?: {
    day: number
    hours: Array<{
      hour: number
      popularity: number
    }>
  }[]
}

export interface CompetitorAnalysis {
  directCompetitors: PlaceResult[]
  indirectCompetitors: PlaceResult[]
  marketInsights: {
    averageRating: number
    priceDistribution: { [key: number]: number }
    totalReviews: number
    marketSaturation: number
  }
}

class GoogleMapsService {
  private map: google.maps.Map | null = null
  private placesService: google.maps.places.PlacesService | null = null
  private isInitialized = false

  // サービス初期化
  async initialize(mapElement?: HTMLElement): Promise<void> {
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps APIキーが設定されていません')
    }

    if (this.isInitialized) {
      console.log('✅ Google Maps Service 既に初期化済み')
      return
    }

    try {
      console.log('🔄 Google Maps Service を初期化中...')
      
      // Google Maps API が読み込まれているかチェック
      if (!window.google?.maps) {
        console.log('📦 Google Maps API を読み込み中...')
        // Loaderで読み込み
        const { Loader } = await import('@googlemaps/js-api-loader')
        const loader = new Loader({
          apiKey: GOOGLE_MAPS_API_KEY,
          version: 'weekly',
          libraries: ['places', 'geometry']
        })
        await loader.load()
        console.log('✅ Google Maps API 読み込み完了')
      }

      // ダミーマップ要素作成（Places Service用）
      if (!mapElement) {
        mapElement = document.createElement('div')
        document.body.appendChild(mapElement)
      }

      // マップとPlaces Serviceを初期化
      this.map = new google.maps.Map(mapElement, {
        center: { lat: 35.6762, lng: 139.6503 },
        zoom: 13
      })
      this.placesService = new google.maps.places.PlacesService(this.map)
      this.isInitialized = true
      
      console.log('✅ Google Maps Service 初期化完了')
    } catch (error) {
      console.error('❌ Google Maps初期化エラー:', error)
      throw error
    }
  }

  // 近隣の競合店舗を検索
  async searchNearbyCompetitors(
    location: { lat: number; lng: number },
    radius: number = 1000,
    businessType: string = 'beauty_salon'
  ): Promise<PlaceResult[]> {
    
    console.log(`🔍 Places検索開始: ${businessType}, 半径${radius}m, 座標(${location.lat}, ${location.lng})`)
    
    if (!this.placesService) {
      console.log('🔄 Places Service を初期化中...')
      await this.initialize()
    }

    return new Promise((resolve, reject) => {
      const request: google.maps.places.PlaceSearchRequest = {
        location: new google.maps.LatLng(location.lat, location.lng),
        radius: radius,
        type: businessType,
        language: 'ja'
      }

      console.log('📡 Google Places API リクエスト送信中...', request)

      this.placesService!.nearbySearch(request, (results, status) => {
        console.log(`📊 Places API レスポンス: ${status}, 件数: ${results?.length || 0}`)
        
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const places: PlaceResult[] = results.map(place => {
            const placeData = {
              place_id: place.place_id!,
              name: place.name!,
              formatted_address: place.vicinity || '',
              geometry: {
                location: {
                  lat: place.geometry!.location!.lat(),
                  lng: place.geometry!.location!.lng()
                }
              },
              rating: place.rating,
              user_ratings_total: place.user_ratings_total,
              price_level: place.price_level,
              opening_hours: place.opening_hours as any,
              types: place.types,
              business_status: place.business_status
            }
            console.log(`📍 店舗発見: ${place.name} (評価: ${place.rating}, レビュー: ${place.user_ratings_total})`)
            return placeData
          })
          
          console.log(`✅ 競合店舗検索完了: ${places.length}件`)
          resolve(places)
        } else {
          console.error(`❌ Places検索失敗: ${status}`)
          reject(new Error(`Places検索失敗: ${status}`))
        }
      })
    })
  }

  // 場所の詳細情報を取得
  async getPlaceDetails(placeId: string): Promise<PlaceResult> {
    if (!this.placesService) {
      const mapDiv = document.createElement('div')
      await this.initialize(mapDiv)
    }

    return new Promise((resolve, reject) => {
      const request: google.maps.places.PlaceDetailsRequest = {
        placeId: placeId,
        fields: [
          'name',
          'formatted_address',
          'formatted_phone_number',
          'website',
          'rating',
          'user_ratings_total',
          'price_level',
          'opening_hours',
          'reviews',
          'photos',
          'geometry'
        ],
        language: 'ja'
      }

      this.placesService!.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          const result: PlaceResult = {
            place_id: place.place_id!,
            name: place.name!,
            formatted_address: place.formatted_address!,
            geometry: {
              location: {
                lat: place.geometry!.location!.lat(),
                lng: place.geometry!.location!.lng()
              }
            },
            rating: place.rating,
            user_ratings_total: place.user_ratings_total,
            price_level: place.price_level,
            opening_hours: place.opening_hours as any,
            formatted_phone_number: place.formatted_phone_number,
            website: place.website,
            reviews: place.reviews,
            photos: place.photos
          }
          resolve(result)
        } else {
          reject(new Error(`場所詳細取得失敗: ${status}`))
        }
      })
    })
  }

  // 月間客数を推定（レビュー数と業界データから）
  estimateMonthlyCustomers(place: PlaceResult, businessType: string): number {
    // 業界別の基準値
    const industryBaselines: { [key: string]: { reviewToCustomerRatio: number, baseCustomers: number } } = {
      beauty_salon: { reviewToCustomerRatio: 0.05, baseCustomers: 200 }, // レビュー率5%
      restaurant: { reviewToCustomerRatio: 0.03, baseCustomers: 500 },
      fitness_center: { reviewToCustomerRatio: 0.08, baseCustomers: 300 },
      spa: { reviewToCustomerRatio: 0.06, baseCustomers: 150 }
    }

    const baseline = industryBaselines[businessType] || { reviewToCustomerRatio: 0.05, baseCustomers: 200 }
    
    // レビュー数から推定
    const reviewBasedEstimate = (place.user_ratings_total || 0) / baseline.reviewToCustomerRatio / 12 // 年間を月間に

    // 価格帯による補正
    const priceMultiplier = place.price_level 
      ? (5 - place.price_level) / 3 // 高価格ほど客数少ない
      : 1

    // 評価による補正
    const ratingMultiplier = place.rating 
      ? place.rating / 4 // 高評価ほど客数多い
      : 0.8

    // 最終推定値
    const estimate = Math.round(
      Math.max(
        baseline.baseCustomers,
        reviewBasedEstimate * priceMultiplier * ratingMultiplier
      )
    )

    return Math.min(estimate, 2000) // 上限値設定
  }

  // 競合分析の実行
  async analyzeCompetitors(
    location: { lat: number; lng: number },
    radius: number = 1000,
    businessType: string = 'beauty_salon'
  ): Promise<CompetitorAnalysis> {
    try {
      // 直接競合を検索
      const directCompetitors = await this.searchNearbyCompetitors(location, radius, businessType)

      // 間接競合のタイプを定義
      const indirectTypes: { [key: string]: string[] } = {
        beauty_salon: ['spa', 'nail_salon'],
        restaurant: ['cafe', 'bar'],
        fitness_center: ['gym', 'yoga_studio']
      }

      // 間接競合を検索
      let indirectCompetitors: PlaceResult[] = []
      const relatedTypes = indirectTypes[businessType] || []
      
      for (const type of relatedTypes) {
        const results = await this.searchNearbyCompetitors(location, radius, type)
        indirectCompetitors = [...indirectCompetitors, ...results]
      }

      // 市場分析
      const allCompetitors = [...directCompetitors, ...indirectCompetitors]
      const marketInsights = {
        averageRating: this.calculateAverage(allCompetitors.map(c => c.rating || 0)),
        priceDistribution: this.calculatePriceDistribution(allCompetitors),
        totalReviews: allCompetitors.reduce((sum, c) => sum + (c.user_ratings_total || 0), 0),
        marketSaturation: allCompetitors.length / (Math.PI * (radius / 1000) ** 2) // 店舗数/km²
      }

      return {
        directCompetitors,
        indirectCompetitors,
        marketInsights
      }
    } catch (error) {
      console.error('競合分析エラー:', error)
      throw error
    }
  }

  // ユーティリティ関数
  private calculateAverage(numbers: number[]): number {
    const filtered = numbers.filter(n => n > 0)
    return filtered.length > 0 
      ? filtered.reduce((a, b) => a + b, 0) / filtered.length 
      : 0
  }

  private calculatePriceDistribution(places: PlaceResult[]): { [key: number]: number } {
    const distribution: { [key: number]: number } = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 }
    
    places.forEach(place => {
      if (place.price_level !== undefined) {
        distribution[place.price_level]++
      }
    })
    
    return distribution
  }

  // 距離計算
  calculateDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
  ): number {
    if (!window.google?.maps?.geometry) {
      // Haversine formula fallback
      const R = 6371e3 // 地球の半径（メートル）
      const φ1 = point1.lat * Math.PI / 180
      const φ2 = point2.lat * Math.PI / 180
      const Δφ = (point2.lat - point1.lat) * Math.PI / 180
      const Δλ = (point2.lng - point1.lng) * Math.PI / 180

      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

      return R * c
    }

    const from = new google.maps.LatLng(point1.lat, point1.lng)
    const to = new google.maps.LatLng(point2.lat, point2.lng)
    return google.maps.geometry.spherical.computeDistanceBetween(from, to)
  }
}

export default new GoogleMapsService()