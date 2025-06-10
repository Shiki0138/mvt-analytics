// Google Maps API テスト用ユーティリティ

import { GOOGLE_MAPS_API_KEY } from '../config/api'
import googleMapsService from '../services/googleMapsService'

export const testGoogleMapsAPIConnection = async (): Promise<boolean> => {
  try {
    console.log('🧪 Google Maps API接続テスト開始')
    
    // 1. APIキー確認
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('❌ APIキーが設定されていません')
      return false
    }
    console.log('✅ APIキー確認:', GOOGLE_MAPS_API_KEY.substring(0, 10) + '...')
    
    // 2. サービス初期化テスト
    await googleMapsService.initialize()
    console.log('✅ Google Maps Service 初期化成功')
    
    // 3. 実際の検索テスト（大阪府吹田市千里丘下周辺）
    const testLocation = { lat: 34.7940, lng: 135.5616 }
    const competitors = await googleMapsService.searchNearbyCompetitors(
      testLocation,
      1000, // 1km
      'beauty_salon'
    )
    
    console.log(`✅ Places API検索成功: ${competitors.length}件の美容室を発見`)
    
    // 4. 検索結果をログ出力
    if (competitors.length > 0) {
      console.log('🏪 発見された店舗:')
      competitors.slice(0, 3).forEach((place, index) => {
        console.log(`  ${index + 1}. ${place.name}`)
        console.log(`     評価: ${place.rating || 'なし'}, レビュー: ${place.user_ratings_total || 0}件`)
        console.log(`     住所: ${place.formatted_address}`)
      })
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Google Maps API テスト失敗:', error)
    return false
  }
}

// ブラウザのコンソールからテスト実行用
if (typeof window !== 'undefined') {
  (window as any).testGoogleMapsAPI = testGoogleMapsAPIConnection
  console.log('💡 Google Maps APIテストを実行するには: testGoogleMapsAPI()')
}