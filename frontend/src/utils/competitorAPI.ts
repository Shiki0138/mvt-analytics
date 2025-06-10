// 競合店舗データ取得・算出ユーティリティ

export interface CompetitorData {
  id: string
  name: string
  address: string
  distance_m: number
  coordinates: { lat: number; lng: number }
  service_type: string
  price_range: string
  google_rating: number
  review_count: number
  place_id?: string
  website_url?: string
  phone_number?: string
  business_hours?: string
  photos?: string[]
  
  // 算出データ（透明性を重視）
  estimated_customers_per_month: number
  market_share_percent: number
  calculation_basis: {
    data_sources: string[]
    calculation_method: string
    confidence_level: 'high' | 'medium' | 'low'
    last_updated: string
    disclaimer?: string
  }
  
  strengths: string[]
  weaknesses: string[]
  threat_level: 'high' | 'medium' | 'low'
}

// Google Places APIから競合店舗データ取得
export const getCompetitorsFromGooglePlaces = async (
  centerLat: number,
  centerLng: number,
  radiusMeters: number,
  businessType: string
): Promise<CompetitorData[]> => {
  try {
    // 実際のGoogle Places API実装
    // const response = await fetch(
    //   `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${centerLat},${centerLng}&radius=${radiusMeters}&type=${businessType}&key=${GOOGLE_MAPS_API_KEY}`
    // )
    
    // モックデータ（実際のAPIデータ構造に基づく）
    const mockCompetitors: CompetitorData[] = [
      {
        id: 'comp_001',
        name: 'Beauty Salon A',
        address: '大阪府吹田市千里丘下1-2-3',
        distance_m: 250,
        coordinates: { lat: 34.7940, lng: 135.5616 },
        service_type: 'カット・カラー・パーマ',
        price_range: '¥5,000-12,000',
        google_rating: 4.2,
        review_count: 127,
        place_id: 'ChIJXXXXXXXXXXXXXXXXXX',
        website_url: 'https://beauty-salon-a.example.com',
        phone_number: '06-1234-5678',
        business_hours: '9:00-19:00',
        estimated_customers_per_month: 450,
        market_share_percent: 15.2,
        calculation_basis: {
          data_sources: [
            'Google Places API',
            'Google Reviews',
            '業界平均データ（厚生労働省統計）'
          ],
          calculation_method: '席数×稼働率×営業日数ベース推算',
          confidence_level: 'medium',
          last_updated: new Date().toISOString()
        },
        strengths: ['立地', '価格競争力'],
        weaknesses: ['サービス範囲限定'],
        threat_level: 'medium'
      },
      {
        id: 'comp_002',
        name: 'Hair Studio B',
        address: '大阪府吹田市千里丘下2-1-8',
        distance_m: 180,
        coordinates: { lat: 34.7935, lng: 135.5620 },
        service_type: 'カット・カラー',
        price_range: '¥8,000-18,000',
        google_rating: 4.5,
        review_count: 89,
        place_id: 'ChIJYYYYYYYYYYYYYYYYYY',
        website_url: 'https://hair-studio-b.example.com',
        phone_number: '06-2345-6789',
        business_hours: '10:00-20:00',
        estimated_customers_per_month: 320,
        market_share_percent: 18.7,
        calculation_basis: {
          data_sources: [
            'Google Places API',
            'ホットペッパービューティー',
            '価格帯別来店頻度統計'
          ],
          calculation_method: '価格帯×レビュー数×地域補正係数',
          confidence_level: 'medium',
          last_updated: new Date().toISOString()
        },
        strengths: ['技術力', 'ブランド'],
        weaknesses: ['価格', '認知度'],
        threat_level: 'high'
      }
    ]
    
    return mockCompetitors
    
  } catch (error) {
    console.error('競合店舗データ取得エラー:', error)
    return []
  }
}

// 月間客数推算ロジック
export const calculateMonthlyCustomers = (
  businessType: string,
  priceRange: string,
  rating: number,
  reviewCount: number,
  distanceFromCenter: number
): { estimate: number; method: string; confidence: 'high' | 'medium' | 'low' } => {
  
  // 業界別基準データ
  const industryBaselines = {
    beauty_salon: {
      base_customers_per_month: 300,
      price_multiplier: {
        'low': 1.2,    // 低価格帯は客数多め
        'medium': 1.0,
        'high': 0.7    // 高価格帯は客数少なめ
      },
      rating_multiplier: {
        4.5: 1.2,
        4.0: 1.0,
        3.5: 0.8,
        3.0: 0.6
      }
    }
  }
  
  // 価格帯判定
  const avgPrice = extractAveragePrice(priceRange)
  let priceCategory: 'low' | 'medium' | 'high' = 'medium'
  if (avgPrice < 6000) priceCategory = 'low'
  else if (avgPrice > 12000) priceCategory = 'high'
  
  // レビュー数補正（多いほど実際の客数が多い）
  const reviewMultiplier = Math.min(1.5, Math.max(0.5, reviewCount / 100))
  
  // 距離補正（中心部に近いほど有利）
  const distanceMultiplier = Math.max(0.7, 1 - (distanceFromCenter / 1000) * 0.3)
  
  // 評価補正
  const ratingMultiplier = industryBaselines.beauty_salon.rating_multiplier[rating as keyof typeof industryBaselines.beauty_salon.rating_multiplier] || 1.0
  
  // 最終計算
  const baseline = industryBaselines.beauty_salon.base_customers_per_month
  const priceEffect = industryBaselines.beauty_salon.price_multiplier[priceCategory]
  
  const estimate = Math.round(
    baseline * priceEffect * ratingMultiplier * reviewMultiplier * distanceMultiplier
  )
  
  // 信頼度判定
  let confidence: 'high' | 'medium' | 'low' = 'medium'
  if (reviewCount > 100 && rating > 4.0) confidence = 'high'
  else if (reviewCount < 20 || rating < 3.5) confidence = 'low'
  
  return {
    estimate,
    method: `業界基準${baseline}人×価格補正${priceEffect}×評価補正${ratingMultiplier.toFixed(1)}×レビュー補正${reviewMultiplier.toFixed(1)}×立地補正${distanceMultiplier.toFixed(1)}`,
    confidence
  }
}

// 価格帯から平均価格を抽出
const extractAveragePrice = (priceRange: string): number => {
  const matches = priceRange.match(/¥([\d,]+)-([\d,]+)/)
  if (matches) {
    const min = parseInt(matches[1].replace(/,/g, ''))
    const max = parseInt(matches[2].replace(/,/g, ''))
    return (min + max) / 2
  }
  return 8000 // デフォルト
}

// 市場シェア算出
export const calculateMarketShare = (
  competitors: CompetitorData[],
  totalMarketSize: number
): CompetitorData[] => {
  const totalCompetitorCustomers = competitors.reduce(
    (sum, comp) => sum + comp.estimated_customers_per_month, 0
  )
  
  return competitors.map(competitor => ({
    ...competitor,
    market_share_percent: Math.round(
      (competitor.estimated_customers_per_month / totalCompetitorCustomers) * 100 * 10
    ) / 10
  }))
}

// 間接競合判定ロジック
export const identifyIndirectCompetitors = (
  primaryBusinessType: string,
  allBusinesses: any[]
): CompetitorData[] => {
  
  const indirectMappings = {
    beauty_salon: [
      'nail_salon',      // ネイルサロン
      'eyelash_salon',   // まつげサロン
      'massage_salon',   // マッサージ・リラクゼーション
      'spa',             // スパ・エステ
      'barber_shop'      // 理容室（一部顧客重複）
    ],
    restaurant: [
      'cafe',
      'bar',
      'bakery',
      'convenience_store'
    ]
  }
  
  const targetTypes = indirectMappings[primaryBusinessType as keyof typeof indirectMappings] || []
  
  return allBusinesses
    .filter(business => targetTypes.includes(business.type))
    .map(business => ({
      ...business,
      threat_level: 'low' as const,
      calculation_basis: {
        ...business.calculation_basis,
        calculation_method: '間接競合：顧客時間・予算の奪い合い'
      }
    }))
}

// データソース透明性の向上
export const addDataSourceTransparency = (competitor: CompetitorData): CompetitorData => {
  return {
    ...competitor,
    calculation_basis: {
      ...competitor.calculation_basis,
      data_sources: [
        `Google Places API (place_id: ${competitor.place_id?.substring(0, 10)}...)`,
        `Google Reviews (${competitor.review_count}件のレビュー)`,
        `業界統計データ（${competitor.service_type}業界平均）`,
        `位置情報解析（中心地から${competitor.distance_m}m）`
      ],
      disclaimer: '推定値であり、実際の数値とは異なる場合があります。参考データとしてご利用ください。'
    }
  }
}