// 全国都道府県・市町村データベース
export interface Prefecture {
  code: string
  name: string
  center: { lat: number; lng: number }
  zoom: number
  cities: City[]
}

export interface City {
  code: string
  name: string
  center: { lat: number; lng: number }
  zoom: number
  population?: number
  area?: number
}

// 全国47都道府県の主要都市データ
export const japanPrefectures: Prefecture[] = [
  {
    code: '01',
    name: '北海道',
    center: { lat: 43.0642, lng: 141.3469 },
    zoom: 11,
    cities: [
      { code: '01100', name: '札幌市', center: { lat: 43.0642, lng: 141.3469 }, zoom: 12, population: 1973395 },
      { code: '01202', name: '函館市', center: { lat: 41.7687, lng: 140.7288 }, zoom: 13, population: 251634 },
      { code: '01203', name: '小樽市', center: { lat: 43.1907, lng: 140.9946 }, zoom: 13, population: 110950 },
      { code: '01204', name: '旭川市', center: { lat: 43.7706, lng: 142.3649 }, zoom: 12, population: 325797 },
      { code: '01205', name: '室蘭市', center: { lat: 42.3169, lng: 140.9740 }, zoom: 13, population: 81064 }
    ]
  },
  {
    code: '02',
    name: '青森県',
    center: { lat: 40.8244, lng: 140.7400 },
    zoom: 12,
    cities: [
      { code: '02201', name: '青森市', center: { lat: 40.8244, lng: 140.7400 }, zoom: 13, population: 278964 },
      { code: '02202', name: '弘前市', center: { lat: 40.6039, lng: 140.4639 }, zoom: 13, population: 168626 },
      { code: '02203', name: '八戸市', center: { lat: 40.5127, lng: 141.4886 }, zoom: 13, population: 225395 },
      { code: '02204', name: '黒石市', center: { lat: 40.6427, lng: 140.5897 }, zoom: 14, population: 31719 },
      { code: '02205', name: 'five所川原市', center: { lat: 40.8048, lng: 140.4408 }, zoom: 14, population: 55584 }
    ]
  },
  {
    code: '03',
    name: '岩手県',
    center: { lat: 39.7036, lng: 141.1527 },
    zoom: 12,
    cities: [
      { code: '03201', name: '盛岡市', center: { lat: 39.7036, lng: 141.1527 }, zoom: 13, population: 290700 },
      { code: '03202', name: '宮古市', center: { lat: 39.6407, lng: 141.9608 }, zoom: 13, population: 51286 },
      { code: '03203', name: '大船渡市', center: { lat: 39.0342, lng: 141.7267 }, zoom: 14, population: 35016 },
      { code: '03205', name: '花巻市', center: { lat: 39.3882, lng: 141.1133 }, zoom: 13, population: 94244 },
      { code: '03206', name: '北上市', center: { lat: 39.2864, lng: 141.1136 }, zoom: 13, population: 92701 }
    ]
  },
  {
    code: '04',
    name: '宮城県',
    center: { lat: 38.2682, lng: 140.8719 },
    zoom: 12,
    cities: [
      { code: '04100', name: '仙台市', center: { lat: 38.2682, lng: 140.8719 }, zoom: 12, population: 1096704 },
      { code: '04202', name: '石巻市', center: { lat: 38.4344, lng: 141.3025 }, zoom: 13, population: 138615 },
      { code: '04203', name: '塩竈市', center: { lat: 38.3117, lng: 141.0218 }, zoom: 14, population: 52662 },
      { code: '04205', name: '気仙沼市', center: { lat: 38.9077, lng: 141.5707 }, zoom: 13, population: 59803 },
      { code: '04206', name: '白石市', center: { lat: 38.0013, lng: 140.6197 }, zoom: 14, population: 33231 }
    ]
  },
  {
    code: '05',
    name: '秋田県',
    center: { lat: 39.7186, lng: 140.1024 },
    zoom: 12,
    cities: [
      { code: '05201', name: '秋田市', center: { lat: 39.7186, lng: 140.1024 }, zoom: 13, population: 302274 },
      { code: '05202', name: '能代市', center: { lat: 40.2137, lng: 140.0264 }, zoom: 13, population: 51493 },
      { code: '05203', name: '横手市', center: { lat: 39.3092, lng: 140.5562 }, zoom: 13, population: 86156 },
      { code: '05204', name: '大館市', center: { lat: 40.2721, lng: 140.5661 }, zoom: 13, population: 71505 },
      { code: '05206', name: '湯沢市', center: { lat: 39.1619, lng: 140.4958 }, zoom: 13, population: 43051 }
    ]
  },
  {
    code: '06',
    name: '山形県',
    center: { lat: 38.2404, lng: 140.3633 },
    zoom: 12,
    cities: [
      { code: '06201', name: '山形市', center: { lat: 38.2404, lng: 140.3633 }, zoom: 13, population: 248772 },
      { code: '06202', name: '米沢市', center: { lat: 37.9242, lng: 140.1208 }, zoom: 13, population: 81005 },
      { code: '06203', name: '鶴岡市', center: { lat: 38.7281, lng: 139.8256 }, zoom: 13, population: 124019 },
      { code: '06204', name: '酒田市', center: { lat: 38.9144, lng: 139.8313 }, zoom: 13, population: 100273 },
      { code: '06205', name: '新庄市', center: { lat: 38.7629, lng: 140.3005 }, zoom: 14, population: 35844 }
    ]
  },
  {
    code: '07',
    name: '福島県',
    center: { lat: 37.7503, lng: 140.4676 },
    zoom: 12,
    cities: [
      { code: '07201', name: '福島市', center: { lat: 37.7503, lng: 140.4676 }, zoom: 13, population: 283814 },
      { code: '07202', name: '会津若松市', center: { lat: 37.4953, lng: 139.9284 }, zoom: 13, population: 119440 },
      { code: '07203', name: '郡山市', center: { lat: 37.4000, lng: 140.3947 }, zoom: 13, population: 321710 },
      { code: '07204', name: 'いわき市', center: { lat: 37.0480, lng: 140.8869 }, zoom: 12, population: 334355 },
      { code: '07205', name: '白河市', center: { lat: 37.1252, lng: 140.2114 }, zoom: 14, population: 59959 }
    ]
  },
  {
    code: '08',
    name: '茨城県',
    center: { lat: 36.3411, lng: 140.4467 },
    zoom: 12,
    cities: [
      { code: '08201', name: '水戸市', center: { lat: 36.3411, lng: 140.4467 }, zoom: 13, population: 269330 },
      { code: '08202', name: '日立市', center: { lat: 36.5984, lng: 140.6508 }, zoom: 13, population: 174219 },
      { code: '08203', name: '土浦市', center: { lat: 36.0783, lng: 140.2041 }, zoom: 13, population: 141804 },
      { code: '08205', name: '古河市', center: { lat: 36.1801, lng: 139.7006 }, zoom: 13, population: 140946 },
      { code: '08207', name: 'つくば市', center: { lat: 36.0840, lng: 140.1137 }, zoom: 13, population: 245528 }
    ]
  },
  {
    code: '09',
    name: '栃木県',
    center: { lat: 36.5658, lng: 139.8836 },
    zoom: 12,
    cities: [
      { code: '09201', name: '宇都宮市', center: { lat: 36.5658, lng: 139.8836 }, zoom: 13, population: 519223 },
      { code: '09202', name: '足利市', center: { lat: 36.3361, lng: 139.4497 }, zoom: 13, population: 143058 },
      { code: '09203', name: '栃木市', center: { lat: 36.3816, lng: 139.7344 }, zoom: 13, population: 157000 },
      { code: '09204', name: '佐野市', center: { lat: 36.3141, lng: 139.5592 }, zoom: 13, population: 116764 },
      { code: '09205', name: '鹿沼市', center: { lat: 36.5669, lng: 139.6750 }, zoom: 13, population: 95322 }
    ]
  },
  {
    code: '10',
    name: '群馬県',
    center: { lat: 36.3911, lng: 139.0608 },
    zoom: 12,
    cities: [
      { code: '10201', name: '前橋市', center: { lat: 36.3911, lng: 139.0608 }, zoom: 13, population: 335352 },
      { code: '10202', name: '高崎市', center: { lat: 36.3225, lng: 139.0133 }, zoom: 13, population: 374358 },
      { code: '10203', name: '桐生市', center: { lat: 36.4081, lng: 139.3308 }, zoom: 13, population: 108530 },
      { code: '10204', name: '伊勢崎市', center: { lat: 36.3114, lng: 139.1953 }, zoom: 13, population: 213303 },
      { code: '10205', name: '太田市', center: { lat: 36.2928, lng: 139.3736 }, zoom: 13, population: 224207 }
    ]
  },
  {
    code: '11',
    name: '埼玉県',
    center: { lat: 35.8617, lng: 139.6455 },
    zoom: 11,
    cities: [
      { code: '11100', name: 'さいたま市', center: { lat: 35.8617, lng: 139.6455 }, zoom: 12, population: 1324854 },
      { code: '11201', name: '川越市', center: { lat: 35.9249, lng: 139.4856 }, zoom: 13, population: 353214 },
      { code: '11202', name: '熊谷市', center: { lat: 36.1475, lng: 139.3881 }, zoom: 13, population: 195277 },
      { code: '11203', name: '川口市', center: { lat: 35.8072, lng: 139.7192 }, zoom: 13, population: 594896 },
      { code: '11206', name: '所沢市', center: { lat: 35.7992, lng: 139.4689 }, zoom: 13, population: 344625 }
    ]
  },
  {
    code: '12',
    name: '千葉県',
    center: { lat: 35.6074, lng: 140.1065 },
    zoom: 11,
    cities: [
      { code: '12100', name: '千葉市', center: { lat: 35.6074, lng: 140.1065 }, zoom: 12, population: 979768 },
      { code: '12202', name: '市川市', center: { lat: 35.7206, lng: 139.9306 }, zoom: 13, population: 491716 },
      { code: '12203', name: '船橋市', center: { lat: 35.6947, lng: 139.9825 }, zoom: 13, population: 644668 },
      { code: '12204', name: '館山市', center: { lat: 34.9947, lng: 139.8744 }, zoom: 14, population: 44747 },
      { code: '12205', name: '木更津市', center: { lat: 35.3778, lng: 139.9139 }, zoom: 13, population: 136950 }
    ]
  },
  {
    code: '13',
    name: '東京都',
    center: { lat: 35.6762, lng: 139.6503 },
    zoom: 11,
    cities: [
      { code: '13101', name: '千代田区', center: { lat: 35.6939, lng: 139.7538 }, zoom: 14, population: 66680 },
      { code: '13102', name: '中央区', center: { lat: 35.6717, lng: 139.7728 }, zoom: 14, population: 171560 },
      { code: '13103', name: '港区', center: { lat: 35.6581, lng: 139.7514 }, zoom: 14, population: 260379 },
      { code: '13104', name: '新宿区', center: { lat: 35.6938, lng: 139.7036 }, zoom: 14, population: 346235 },
      { code: '13105', name: '文京区', center: { lat: 35.7083, lng: 139.7519 }, zoom: 14, population: 229421 },
      { code: '13106', name: '台東区', center: { lat: 35.7078, lng: 139.7797 }, zoom: 14, population: 207844 },
      { code: '13107', name: '墨田区', center: { lat: 35.7100, lng: 139.8017 }, zoom: 14, population: 275979 },
      { code: '13108', name: '江東区', center: { lat: 35.6733, lng: 139.8167 }, zoom: 14, population: 527109 },
      { code: '13109', name: '品川区', center: { lat: 35.6092, lng: 139.7300 }, zoom: 14, population: 404562 },
      { code: '13110', name: '目黒区', center: { lat: 35.6444, lng: 139.6989 }, zoom: 14, population: 279434 },
      { code: '13111', name: '大田区', center: { lat: 35.5617, lng: 139.7161 }, zoom: 13, population: 738424 },
      { code: '13112', name: '世田谷区', center: { lat: 35.6464, lng: 139.6533 }, zoom: 13, population: 936659 },
      { code: '13113', name: '渋谷区', center: { lat: 35.6586, lng: 139.7017 }, zoom: 14, population: 230264 },
      { code: '13114', name: '中野区', center: { lat: 35.7081, lng: 139.6656 }, zoom: 14, population: 334779 },
      { code: '13115', name: '杉並区', center: { lat: 35.6993, lng: 139.6364 }, zoom: 14, population: 579899 },
      { code: '13116', name: '豊島区', center: { lat: 35.7297, lng: 139.7156 }, zoom: 14, population: 294673 },
      { code: '13117', name: '北区', center: { lat: 35.7539, lng: 139.7331 }, zoom: 14, population: 353678 },
      { code: '13118', name: '荒川区', center: { lat: 35.7361, lng: 139.7831 }, zoom: 14, population: 217424 },
      { code: '13119', name: '板橋区', center: { lat: 35.7500, lng: 139.7086 }, zoom: 14, population: 578512 },
      { code: '13120', name: '練馬区', center: { lat: 35.7353, lng: 139.6533 }, zoom: 14, population: 738905 },
      { code: '13121', name: '足立区', center: { lat: 35.7750, lng: 139.8042 }, zoom: 14, population: 696647 },
      { code: '13122', name: '葛飾区', center: { lat: 35.7436, lng: 139.8486 }, zoom: 14, population: 463913 },
      { code: '13123', name: '江戸川区', center: { lat: 35.7061, lng: 139.8686 }, zoom: 14, population: 695797 },
      { code: '13201', name: '八王子市', center: { lat: 35.6558, lng: 139.3236 }, zoom: 13, population: 577513 },
      { code: '13202', name: '立川市', center: { lat: 35.7144, lng: 139.4086 }, zoom: 14, population: 184190 },
      { code: '13203', name: '武蔵野市', center: { lat: 35.7183, lng: 139.5656 }, zoom: 14, population: 147492 },
      { code: '13204', name: '三鷹市', center: { lat: 35.6831, lng: 139.5597 }, zoom: 14, population: 190748 },
      { code: '13205', name: '青梅市', center: { lat: 35.7881, lng: 139.2756 }, zoom: 13, population: 131339 }
    ]
  },
  {
    code: '14',
    name: '神奈川県',
    center: { lat: 35.4478, lng: 139.6425 },
    zoom: 11,
    cities: [
      { code: '14100', name: '横浜市', center: { lat: 35.4478, lng: 139.6425 }, zoom: 12, population: 3777491 },
      { code: '14130', name: '川崎市', center: { lat: 35.5306, lng: 139.7025 }, zoom: 12, population: 1538262 },
      { code: '14150', name: '相模原市', center: { lat: 35.5694, lng: 139.3694 }, zoom: 12, population: 720780 },
      { code: '14201', name: '横須賀市', center: { lat: 35.2806, lng: 139.6700 }, zoom: 13, population: 383723 },
      { code: '14203', name: '平塚市', center: { lat: 35.3350, lng: 139.3472 }, zoom: 13, population: 257316 }
    ]
  },
  {
    code: '15',
    name: '新潟県',
    center: { lat: 37.9026, lng: 139.0232 },
    zoom: 11,
    cities: [
      { code: '15100', name: '新潟市', center: { lat: 37.9026, lng: 139.0232 }, zoom: 12, population: 795591 },
      { code: '15202', name: '長岡市', center: { lat: 37.4461, lng: 138.8517 }, zoom: 13, population: 267420 },
      { code: '15204', name: '三条市', center: { lat: 37.6339, lng: 138.9553 }, zoom: 13, population: 95184 },
      { code: '15205', name: '柏崎市', center: { lat: 37.3667, lng: 138.5556 }, zoom: 13, population: 81659 },
      { code: '15206', name: '新発田市', center: { lat: 37.9503, lng: 139.3278 }, zoom: 13, population: 95742 }
    ]
  },
  {
    code: '16',
    name: '富山県',
    center: { lat: 36.6953, lng: 137.2114 },
    zoom: 12,
    cities: [
      { code: '16201', name: '富山市', center: { lat: 36.6953, lng: 137.2114 }, zoom: 13, population: 415844 },
      { code: '16202', name: '高岡市', center: { lat: 36.7522, lng: 137.0136 }, zoom: 13, population: 168739 },
      { code: '16204', name: '魚津市', center: { lat: 36.8183, lng: 137.4053 }, zoom: 14, population: 42187 },
      { code: '16205', name: '氷見市', center: { lat: 36.8589, lng: 136.9892 }, zoom: 14, population: 46019 },
      { code: '16206', name: '滑川市', center: { lat: 36.7764, lng: 137.3428 }, zoom: 14, population: 32459 }
    ]
  },
  {
    code: '17',
    name: '石川県',
    center: { lat: 36.5947, lng: 136.6256 },
    zoom: 12,
    cities: [
      { code: '17201', name: '金沢市', center: { lat: 36.5947, lng: 136.6256 }, zoom: 13, population: 465699 },
      { code: '17202', name: '七尾市', center: { lat: 37.0425, lng: 136.9661 }, zoom: 13, population: 52524 },
      { code: '17203', name: '小松市', center: { lat: 36.4003, lng: 136.4428 }, zoom: 13, population: 108647 },
      { code: '17204', name: '輪島市', center: { lat: 37.3892, lng: 136.9000 }, zoom: 14, population: 26827 },
      { code: '17205', name: '珠洲市', center: { lat: 37.5061, lng: 137.2558 }, zoom: 14, population: 13531 }
    ]
  },
  {
    code: '18',
    name: '福井県',
    center: { lat: 36.0653, lng: 136.2217 },
    zoom: 12,
    cities: [
      { code: '18201', name: '福井市', center: { lat: 36.0653, lng: 136.2217 }, zoom: 13, population: 262123 },
      { code: '18202', name: '敦賀市', center: { lat: 35.6447, lng: 136.0522 }, zoom: 13, population: 63185 },
      { code: '18204', name: '小浜市', center: { lat: 35.4947, lng: 135.7464 }, zoom: 14, population: 29670 },
      { code: '18205', name: '大野市', center: { lat: 35.9794, lng: 136.4861 }, zoom: 13, population: 31139 },
      { code: '18206', name: '勝山市', center: { lat: 36.0611, lng: 136.5011 }, zoom: 14, population: 23085 }
    ]
  },
  {
    code: '19',
    name: '山梨県',
    center: { lat: 35.6642, lng: 138.5683 },
    zoom: 12,
    cities: [
      { code: '19201', name: '甲府市', center: { lat: 35.6642, lng: 138.5683 }, zoom: 13, population: 187851 },
      { code: '19202', name: '富士吉田市', center: { lat: 35.4858, lng: 138.8025 }, zoom: 13, population: 47612 },
      { code: '19204', name: '都留市', center: { lat: 35.5544, lng: 138.9056 }, zoom: 14, population: 29884 },
      { code: '19205', name: '山梨市', center: { lat: 35.6919, lng: 138.6806 }, zoom: 14, population: 33669 },
      { code: '19206', name: '大月市', center: { lat: 35.6122, lng: 138.9447 }, zoom: 14, population: 23003 }
    ]
  },
  {
    code: '20',
    name: '長野県',
    center: { lat: 36.6513, lng: 138.1811 },
    zoom: 11,
    cities: [
      { code: '20201', name: '長野市', center: { lat: 36.6513, lng: 138.1811 }, zoom: 13, population: 368181 },
      { code: '20202', name: '松本市', center: { lat: 36.2381, lng: 137.9722 }, zoom: 13, population: 239466 },
      { code: '20203', name: '上田市', center: { lat: 36.3981, lng: 138.2497 }, zoom: 13, population: 153808 },
      { code: '20204', name: '岡谷市', center: { lat: 36.0656, lng: 138.0458 }, zoom: 14, population: 48616 },
      { code: '20205', name: '飯田市', center: { lat: 35.5150, lng: 137.8217 }, zoom: 13, population: 98331 }
    ]
  },
  {
    code: '21',
    name: '岐阜県',
    center: { lat: 35.3911, lng: 136.7222 },
    zoom: 12,
    cities: [
      { code: '21201', name: '岐阜市', center: { lat: 35.3911, lng: 136.7222 }, zoom: 13, population: 400118 },
      { code: '21202', name: '大垣市', center: { lat: 35.3581, lng: 136.6153 }, zoom: 13, population: 158526 },
      { code: '21203', name: '高山市', center: { lat: 36.1397, lng: 137.2514 }, zoom: 13, population: 87736 },
      { code: '21204', name: '多治見市', center: { lat: 35.3317, lng: 137.1344 }, zoom: 13, population: 106748 },
      { code: '21205', name: '関市', center: { lat: 35.4964, lng: 136.9147 }, zoom: 13, population: 88618 }
    ]
  },
  {
    code: '22',
    name: '静岡県',
    center: { lat: 34.9756, lng: 138.3831 },
    zoom: 11,
    cities: [
      { code: '22100', name: '静岡市', center: { lat: 34.9756, lng: 138.3831 }, zoom: 12, population: 693389 },
      { code: '22130', name: '浜松市', center: { lat: 34.7100, lng: 137.7267 }, zoom: 12, population: 790718 },
      { code: '22203', name: '沼津市', center: { lat: 35.0956, lng: 138.8617 }, zoom: 13, population: 193539 },
      { code: '22205', name: '熱海市', center: { lat: 35.0953, lng: 139.0775 }, zoom: 14, population: 35993 },
      { code: '22206', name: '三島市', center: { lat: 35.1181, lng: 138.9183 }, zoom: 14, population: 108407 }
    ]
  },
  {
    code: '23',
    name: '愛知県',
    center: { lat: 35.1803, lng: 136.9067 },
    zoom: 11,
    cities: [
      { code: '23100', name: '名古屋市', center: { lat: 35.1803, lng: 136.9067 }, zoom: 12, population: 2332176 },
      { code: '23201', name: '豊橋市', center: { lat: 34.7697, lng: 137.3914 }, zoom: 13, population: 372479 },
      { code: '23202', name: '岡崎市', center: { lat: 34.9553, lng: 137.1744 }, zoom: 13, population: 386529 },
      { code: '23203', name: '一宮市', center: { lat: 35.3058, lng: 136.8014 }, zoom: 13, population: 380868 },
      { code: '23204', name: '瀬戸市', center: { lat: 35.2242, lng: 137.0839 }, zoom: 13, population: 127659 }
    ]
  },
  {
    code: '24',
    name: '三重県',
    center: { lat: 34.7303, lng: 136.5086 },
    zoom: 12,
    cities: [
      { code: '24201', name: '津市', center: { lat: 34.7303, lng: 136.5086 }, zoom: 13, population: 274865 },
      { code: '24202', name: '四日市市', center: { lat: 34.9658, lng: 136.6252 }, zoom: 13, population: 310259 },
      { code: '24203', name: '伊勢市', center: { lat: 34.4883, lng: 136.7106 }, zoom: 13, population: 123533 },
      { code: '24204', name: '松阪市', center: { lat: 34.5783, lng: 136.5253 }, zoom: 13, population: 159145 },
      { code: '24205', name: '桑名市', center: { lat: 35.0622, lng: 136.6842 }, zoom: 13, population: 140303 }
    ]
  },
  {
    code: '25',
    name: '滋賀県',
    center: { lat: 35.0044, lng: 135.8686 },
    zoom: 12,
    cities: [
      { code: '25201', name: '大津市', center: { lat: 35.0044, lng: 135.8686 }, zoom: 13, population: 343991 },
      { code: '25202', name: '彦根市', center: { lat: 35.2764, lng: 136.2514 }, zoom: 13, population: 112193 },
      { code: '25203', name: '長浜市', center: { lat: 35.3814, lng: 136.2697 }, zoom: 13, population: 114334 },
      { code: '25204', name: '近江八幡市', center: { lat: 35.1281, lng: 136.0972 }, zoom: 13, population: 81405 },
      { code: '25206', name: '草津市', center: { lat: 35.0189, lng: 135.9597 }, zoom: 13, population: 144526 }
    ]
  },
  {
    code: '26',
    name: '京都府',
    center: { lat: 35.0211, lng: 135.7536 },
    zoom: 12,
    cities: [
      { code: '26100', name: '京都市', center: { lat: 35.0211, lng: 135.7536 }, zoom: 12, population: 1463723 },
      { code: '26201', name: '福知山市', center: { lat: 35.2989, lng: 135.1214 }, zoom: 13, population: 77353 },
      { code: '26202', name: '舞鶴市', center: { lat: 35.4747, lng: 135.3856 }, zoom: 13, population: 79350 },
      { code: '26203', name: '綾部市', center: { lat: 35.2975, lng: 135.2586 }, zoom: 14, population: 32111 },
      { code: '26204', name: '宇治市', center: { lat: 34.8842, lng: 135.7992 }, zoom: 13, population: 179781 }
    ]
  },
  {
    code: '27',
    name: '大阪府',
    center: { lat: 34.6937, lng: 135.5023 },
    zoom: 11,
    cities: [
      { code: '27100', name: '大阪市', center: { lat: 34.6937, lng: 135.5023 }, zoom: 12, population: 2740202 },
      { code: '27140', name: '堺市', center: { lat: 34.5739, lng: 135.4828 }, zoom: 12, population: 838271 },
      { code: '27202', name: '岸和田市', center: { lat: 34.4647, lng: 135.3658 }, zoom: 13, population: 196621 },
      { code: '27203', name: '豊中市', center: { lat: 34.7814, lng: 135.4681 }, zoom: 13, population: 399621 },
      { code: '27204', name: '池田市', center: { lat: 34.8225, lng: 135.4281 }, zoom: 14, population: 102142 }
    ]
  },
  {
    code: '28',
    name: '兵庫県',
    center: { lat: 34.6913, lng: 135.1831 },
    zoom: 11,
    cities: [
      { code: '28100', name: '神戸市', center: { lat: 34.6913, lng: 135.1831 }, zoom: 12, population: 1525152 },
      { code: '28201', name: '姫路市', center: { lat: 34.8161, lng: 134.6850 }, zoom: 13, population: 533079 },
      { code: '28202', name: '尼崎市', center: { lat: 34.7333, lng: 135.4058 }, zoom: 13, population: 459045 },
      { code: '28203', name: '明石市', center: { lat: 34.6436, lng: 134.9981 }, zoom: 13, population: 304268 },
      { code: '28204', name: '西宮市', center: { lat: 34.7386, lng: 135.3414 }, zoom: 13, population: 489659 }
    ]
  },
  {
    code: '29',
    name: '奈良県',
    center: { lat: 34.6851, lng: 135.8048 },
    zoom: 12,
    cities: [
      { code: '29201', name: '奈良市', center: { lat: 34.6851, lng: 135.8048 }, zoom: 13, population: 357204 },
      { code: '29202', name: '大和高田市', center: { lat: 34.5153, lng: 135.7356 }, zoom: 14, population: 63004 },
      { code: '29203', name: '大和郡山市', center: { lat: 34.6494, lng: 135.7781 }, zoom: 14, population: 84857 },
      { code: '29204', name: '天理市', center: { lat: 34.5958, lng: 135.8381 }, zoom: 14, population: 64506 },
      { code: '29205', name: '橿原市', center: { lat: 34.5075, lng: 135.7922 }, zoom: 14, population: 121829 }
    ]
  },
  {
    code: '30',
    name: '和歌山県',
    center: { lat: 34.2261, lng: 135.1675 },
    zoom: 12,
    cities: [
      { code: '30201', name: '和歌山市', center: { lat: 34.2261, lng: 135.1675 }, zoom: 13, population: 355622 },
      { code: '30202', name: '海南市', center: { lat: 34.1556, lng: 135.2067 }, zoom: 14, population: 48204 },
      { code: '30203', name: '橋本市', center: { lat: 34.3153, lng: 135.6028 }, zoom: 14, population: 60525 },
      { code: '30204', name: '有田市', center: { lat: 34.0831, lng: 135.1294 }, zoom: 14, population: 26667 },
      { code: '30205', name: '御坊市', center: { lat: 33.8917, lng: 135.1592 }, zoom: 14, population: 22187 }
    ]
  },
  {
    code: '31',
    name: '鳥取県',
    center: { lat: 35.5014, lng: 134.2381 },
    zoom: 12,
    cities: [
      { code: '31201', name: '鳥取市', center: { lat: 35.5014, lng: 134.2381 }, zoom: 13, population: 185711 },
      { code: '31202', name: '米子市', center: { lat: 35.4286, lng: 133.3306 }, zoom: 13, population: 149313 },
      { code: '31203', name: '倉吉市', center: { lat: 35.4297, lng: 133.8256 }, zoom: 14, population: 46549 },
      { code: '31204', name: '境港市', center: { lat: 35.5425, lng: 133.2344 }, zoom: 14, population: 33431 }
    ]
  },
  {
    code: '32',
    name: '島根県',
    center: { lat: 35.4722, lng: 133.0506 },
    zoom: 12,
    cities: [
      { code: '32201', name: '松江市', center: { lat: 35.4722, lng: 133.0506 }, zoom: 13, population: 202008 },
      { code: '32202', name: '浜田市', center: { lat: 34.8969, lng: 132.0853 }, zoom: 13, population: 54032 },
      { code: '32203', name: '出雲市', center: { lat: 35.3658, lng: 132.7539 }, zoom: 13, population: 175925 },
      { code: '32204', name: '益田市', center: { lat: 34.6706, lng: 131.8436 }, zoom: 14, population: 44109 },
      { code: '32205', name: '大田市', center: { lat: 35.1944, lng: 132.5022 }, zoom: 14, population: 33317 }
    ]
  },
  {
    code: '33',
    name: '岡山県',
    center: { lat: 34.6617, lng: 133.9353 },
    zoom: 12,
    cities: [
      { code: '33100', name: '岡山市', center: { lat: 34.6617, lng: 133.9353 }, zoom: 12, population: 720841 },
      { code: '33202', name: '倉敷市', center: { lat: 34.5839, lng: 133.7722 }, zoom: 13, population: 482300 },
      { code: '33203', name: '津山市', center: { lat: 35.0636, lng: 134.0044 }, zoom: 13, population: 99865 },
      { code: '33204', name: '玉野市', center: { lat: 34.4906, lng: 133.9469 }, zoom: 14, population: 57009 },
      { code: '33205', name: '笠岡市', center: { lat: 34.5056, lng: 133.5072 }, zoom: 14, population: 46969 }
    ]
  },
  {
    code: '34',
    name: '広島県',
    center: { lat: 34.3853, lng: 132.4553 },
    zoom: 12,
    cities: [
      { code: '34100', name: '広島市', center: { lat: 34.3853, lng: 132.4553 }, zoom: 12, population: 1199775 },
      { code: '34202', name: '呉市', center: { lat: 34.2500, lng: 132.5697 }, zoom: 13, population: 218615 },
      { code: '34203', name: '竹原市', center: { lat: 34.3408, lng: 132.9119 }, zoom: 14, population: 24941 },
      { code: '34204', name: '三原市', center: { lat: 34.3981, lng: 133.0769 }, zoom: 13, population: 93171 },
      { code: '34205', name: '尾道市', center: { lat: 34.4089, lng: 133.2050 }, zoom: 13, population: 133762 }
    ]
  },
  {
    code: '35',
    name: '山口県',
    center: { lat: 34.1861, lng: 131.4706 },
    zoom: 12,
    cities: [
      { code: '35201', name: '下関市', center: { lat: 33.9617, lng: 130.9408 }, zoom: 13, population: 255051 },
      { code: '35202', name: '宇部市', center: { lat: 33.9461, lng: 131.2483 }, zoom: 13, population: 161965 },
      { code: '35203', name: '山口市', center: { lat: 34.1861, lng: 131.4706 }, zoom: 13, population: 193814 },
      { code: '35204', name: '萩市', center: { lat: 34.4114, lng: 131.4011 }, zoom: 13, population: 44891 },
      { code: '35206', name: '岩国市', center: { lat: 34.1667, lng: 132.2200 }, zoom: 13, population: 132934 }
    ]
  },
  {
    code: '36',
    name: '徳島県',
    center: { lat: 34.0658, lng: 134.5592 },
    zoom: 12,
    cities: [
      { code: '36201', name: '徳島市', center: { lat: 34.0658, lng: 134.5592 }, zoom: 13, population: 255824 },
      { code: '36202', name: '鳴門市', center: { lat: 34.1761, lng: 134.6089 }, zoom: 14, population: 56781 },
      { code: '36203', name: '小松島市', center: { lat: 34.0044, lng: 134.5947 }, zoom: 14, population: 37133 },
      { code: '36204', name: '阿南市', center: { lat: 33.9172, lng: 134.6586 }, zoom: 13, population: 71106 },
      { code: '36205', name: '吉野川市', center: { lat: 34.0767, lng: 134.3481 }, zoom: 14, population: 39506 }
    ]
  },
  {
    code: '37',
    name: '香川県',
    center: { lat: 34.3406, lng: 134.0431 },
    zoom: 12,
    cities: [
      { code: '37201', name: '高松市', center: { lat: 34.3406, lng: 134.0431 }, zoom: 13, population: 418125 },
      { code: '37202', name: '丸亀市', center: { lat: 34.2897, lng: 133.7975 }, zoom: 13, population: 108541 },
      { code: '37203', name: '坂出市', center: { lat: 34.3147, lng: 133.8644 }, zoom: 14, population: 50618 },
      { code: '37204', name: '善通寺市', center: { lat: 34.2281, lng: 133.7889 }, zoom: 14, population: 31588 },
      { code: '37205', name: '観音寺市', center: { lat: 34.1289, lng: 133.6611 }, zoom: 14, population: 58617 }
    ]
  },
  {
    code: '38',
    name: '愛媛県',
    center: { lat: 33.8414, lng: 132.7661 },
    zoom: 12,
    cities: [
      { code: '38201', name: '松山市', center: { lat: 33.8414, lng: 132.7661 }, zoom: 13, population: 506420 },
      { code: '38202', name: '今治市', center: { lat: 34.0667, lng: 132.9975 }, zoom: 13, population: 152461 },
      { code: '38203', name: '宇和島市', center: { lat: 33.2233, lng: 132.5561 }, zoom: 13, population: 75180 },
      { code: '38204', name: '八幡浜市', center: { lat: 33.4639, lng: 132.6242 }, zoom: 14, population: 33381 },
      { code: '38205', name: '新居浜市', center: { lat: 33.9444, lng: 133.2844 }, zoom: 13, population: 117572 }
    ]
  },
  {
    code: '39',
    name: '高知県',
    center: { lat: 33.5597, lng: 133.5311 },
    zoom: 12,
    cities: [
      { code: '39201', name: '高知市', center: { lat: 33.5597, lng: 133.5311 }, zoom: 13, population: 322579 },
      { code: '39202', name: '室戸市', center: { lat: 33.2892, lng: 134.1506 }, zoom: 14, population: 12073 },
      { code: '39203', name: '安芸市', center: { lat: 33.5003, lng: 133.9053 }, zoom: 14, population: 16953 },
      { code: '39204', name: '南国市', center: { lat: 33.5758, lng: 133.6419 }, zoom: 14, population: 47186 },
      { code: '39205', name: '土佐市', center: { lat: 33.4939, lng: 133.4106 }, zoom: 14, population: 26427 }
    ]
  },
  {
    code: '40',
    name: '福岡県',
    center: { lat: 33.6064, lng: 130.4181 },
    zoom: 11,
    cities: [
      { code: '40100', name: '福岡市', center: { lat: 33.6064, lng: 130.4181 }, zoom: 12, population: 1612392 },
      { code: '40130', name: '北九州市', center: { lat: 33.8839, lng: 130.8756 }, zoom: 12, population: 939029 },
      { code: '40202', name: '久留米市', center: { lat: 33.3197, lng: 130.5089 }, zoom: 13, population: 304552 },
      { code: '40203', name: '直方市', center: { lat: 33.7481, lng: 130.7281 }, zoom: 14, population: 56334 },
      { code: '40204', name: '飯塚市', center: { lat: 33.6456, lng: 130.6869 }, zoom: 13, population: 127888 }
    ]
  },
  {
    code: '41',
    name: '佐賀県',
    center: { lat: 33.2494, lng: 130.2989 },
    zoom: 12,
    cities: [
      { code: '41201', name: '佐賀市', center: { lat: 33.2494, lng: 130.2989 }, zoom: 13, population: 231506 },
      { code: '41202', name: '唐津市', center: { lat: 33.4497, lng: 129.9686 }, zoom: 13, population: 117264 },
      { code: '41203', name: '鳥栖市', center: { lat: 33.3781, lng: 130.5083 }, zoom: 14, population: 74977 },
      { code: '41204', name: '多久市', center: { lat: 33.2897, lng: 130.0983 }, zoom: 14, population: 18761 },
      { code: '41205', name: '伊万里市', center: { lat: 33.2717, lng: 129.8839 }, zoom: 14, population: 54676 }
    ]
  },
  {
    code: '42',
    name: '長崎県',
    center: { lat: 32.7503, lng: 129.8781 },
    zoom: 12,
    cities: [
      { code: '42201', name: '長崎市', center: { lat: 32.7503, lng: 129.8781 }, zoom: 13, population: 409118 },
      { code: '42202', name: '佐世保市', center: { lat: 33.1706, lng: 129.7239 }, zoom: 13, population: 247739 },
      { code: '42203', name: '島原市', center: { lat: 32.7881, lng: 130.3681 }, zoom: 14, population: 43780 },
      { code: '42204', name: '諫早市', center: { lat: 32.8428, lng: 130.0511 }, zoom: 13, population: 134800 },
      { code: '42205', name: '大村市', center: { lat: 32.9039, lng: 129.9561 }, zoom: 14, population: 97136 }
    ]
  },
  {
    code: '43',
    name: '熊本県',
    center: { lat: 32.7898, lng: 130.7417 },
    zoom: 12,
    cities: [
      { code: '43100', name: '熊本市', center: { lat: 32.7898, lng: 130.7417 }, zoom: 12, population: 738865 },
      { code: '43202', name: '八代市', center: { lat: 32.5050, lng: 130.6031 }, zoom: 13, population: 124115 },
      { code: '43203', name: '人吉市', center: { lat: 32.2092, lng: 130.7633 }, zoom: 14, population: 31203 },
      { code: '43204', name: '荒尾市', center: { lat: 32.9864, lng: 130.4306 }, zoom: 14, population: 52017 },
      { code: '43205', name: '水俣市', center: { lat: 32.2106, lng: 130.4006 }, zoom: 14, population: 24059 }
    ]
  },
  {
    code: '44',
    name: '大分県',
    center: { lat: 33.2382, lng: 131.6125 },
    zoom: 12,
    cities: [
      { code: '44201', name: '大分市', center: { lat: 33.2382, lng: 131.6125 }, zoom: 13, population: 479146 },
      { code: '44202', name: '別府市', center: { lat: 33.2839, lng: 131.4917 }, zoom: 13, population: 113551 },
      { code: '44203', name: '中津市', center: { lat: 33.5989, lng: 131.1881 }, zoom: 13, population: 82985 },
      { code: '44204', name: '日田市', center: { lat: 33.3225, lng: 130.9411 }, zoom: 13, population: 62895 },
      { code: '44205', name: '佐伯市', center: { lat: 32.9597, lng: 131.9011 }, zoom: 13, population: 66115 }
    ]
  },
  {
    code: '45',
    name: '宮崎県',
    center: { lat: 31.9111, lng: 131.4239 },
    zoom: 12,
    cities: [
      { code: '45201', name: '宮崎市', center: { lat: 31.9111, lng: 131.4239 }, zoom: 13, population: 401138 },
      { code: '45202', name: '都城市', center: { lat: 31.7211, lng: 131.0658 }, zoom: 13, population: 161978 },
      { code: '45203', name: '延岡市', center: { lat: 32.5817, lng: 131.6644 }, zoom: 13, population: 115889 },
      { code: '45204', name: '日南市', center: { lat: 31.5989, lng: 131.3689 }, zoom: 14, population: 50862 },
      { code: '45205', name: '小林市', center: { lat: 31.9981, lng: 130.9781 }, zoom: 14, population: 43629 }
    ]
  },
  {
    code: '46',
    name: '鹿児島県',
    center: { lat: 31.5606, lng: 130.5581 },
    zoom: 12,
    cities: [
      { code: '46100', name: '鹿児島市', center: { lat: 31.5606, lng: 130.5581 }, zoom: 13, population: 595049 },
      { code: '46203', name: '鹿屋市', center: { lat: 31.3781, lng: 130.8519 }, zoom: 13, population: 102143 },
      { code: '46204', name: '枕崎市', center: { lat: 31.2725, lng: 130.2989 }, zoom: 14, population: 20853 },
      { code: '46206', name: '阿久根市', center: { lat: 32.0206, lng: 130.1983 }, zoom: 14, population: 19019 },
      { code: '46208', name: '出水市', center: { lat: 32.0906, lng: 130.3547 }, zoom: 14, population: 50448 }
    ]
  },
  {
    code: '47',
    name: '沖縄県',
    center: { lat: 26.2125, lng: 127.6792 },
    zoom: 11,
    cities: [
      { code: '47201', name: '那覇市', center: { lat: 26.2125, lng: 127.6792 }, zoom: 13, population: 321467 },
      { code: '47205', name: '宜野湾市', center: { lat: 26.2811, lng: 127.7806 }, zoom: 14, population: 98717 },
      { code: '47207', name: '石垣市', center: { lat: 24.3389, lng: 124.1556 }, zoom: 13, population: 48816 },
      { code: '47208', name: '浦添市', center: { lat: 26.2456, lng: 127.7219 }, zoom: 14, population: 115518 },
      { code: '47209', name: '名護市', center: { lat: 26.5906, lng: 127.9769 }, zoom: 13, population: 63147 }
    ]
  }
]

// 都道府県検索ヘルパー関数
export const findPrefectureByName = (name: string): Prefecture | undefined => {
  return japanPrefectures.find(pref => pref.name === name)
}

export const findCityByName = (prefectureName: string, cityName: string): City | undefined => {
  const prefecture = findPrefectureByName(prefectureName)
  return prefecture?.cities.find(city => city.name === cityName)
}

export const getAllCities = (): Array<City & { prefecture: string }> => {
  return japanPrefectures.flatMap(pref => 
    pref.cities.map(city => ({
      ...city,
      prefecture: pref.name
    }))
  )
}

// 地域ブロック分け
export const regionBlocks = {
  '北海道': ['北海道'],
  '東北': ['青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'],
  '関東': ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'],
  '中部': ['新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県'],
  '近畿': ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'],
  '中国': ['鳥取県', '島根県', '岡山県', '広島県', '山口県'],
  '四国': ['徳島県', '香川県', '愛媛県', '高知県'],
  '九州': ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県']
}