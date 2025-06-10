import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiConfig } from '../config/api'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  LinearProgress,
  Alert,
  Divider,
  Paper,
  Container,
  CircularProgress
} from '@mui/material'
import {
  Description as ReportIcon,
  GetApp as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Slideshow as PowerPointIcon,
  Preview as PreviewIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  LocationOn as LocationOnIcon,
  People as PeopleIcon
} from '@mui/icons-material'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface ReportTemplate {
  id: string
  name: string
  description: string
  sections: string[]
  type: 'business_plan' | 'market_analysis' | 'simulation_summary'
}

interface GeneratedReport {
  id: string
  title: string
  created_at: string
  has_pdf: boolean
  has_pptx: boolean
  template_type: string
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'business_plan',
    name: '事業計画書',
    description: 'シミュレーション結果を含む事業計画資料',
    sections: ['概要', '市場分析', '収益予測', 'リスク分析', '実行計画'],
    type: 'business_plan'
  },
  {
    id: 'market_analysis',
    name: '市場分析レポート',
    description: '商圏・競合・需要分析に特化したレポート',
    sections: ['商圏人口', '競合状況', '需要予測', '機会分析'],
    type: 'market_analysis'
  },
  {
    id: 'simulation_summary',
    name: 'シミュレーション結果サマリー',
    description: '売上シミュレーション結果の要約資料',
    sections: ['シミュレーション条件', '結果概要', 'シナリオ比較', '推奨事項'],
    type: 'simulation_summary'
  }
]

function Reports() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const reportRef = useRef<HTMLDivElement>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [reportTitle, setReportTitle] = useState('')
  const [includeAnalysis, setIncludeAnalysis] = useState(true)
  const [includeSimulation, setIncludeSimulation] = useState(true)
  const [chartTypes, setChartTypes] = useState<string[]>(['funnel', 'cashflow', 'demographics'])
  const [reports, setReports] = useState<GeneratedReport[]>([])
  const [generating, setGenerating] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewContent, setPreviewContent] = useState<any>(null)
  const [project, setProject] = useState<any>(null)
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [simulationData, setSimulationData] = useState<any>(null)
  const [exportingPDF, setExportingPDF] = useState(false)

  // プロジェクトデータの取得
  useEffect(() => {
    fetchProjectData()
    loadExistingReports()
  }, [projectId])

  const fetchProjectData = async () => {
    try {
      if (projectId) {
        const response = await fetch(`${apiConfig.baseURL}/api/projects/${projectId}`)
        const data = await response.json()
        setProject(data)

        // 分析データも取得（失敗してもモックデータで補完）
        try {
          const analysisResponse = await fetch(`${apiConfig.baseURL}/api/projects/${projectId}/analyses`)
          const analysisResult = await analysisResponse.json()
          setAnalysisData(analysisResult.results || {})
        } catch (err) {
          console.log('分析データの取得をスキップ - モックデータを使用')
          // モック分析データを設定
          setAnalysisData({
            demographics: {
              data: {
                total_population: 45823,
                target_population: 12500,
                age_groups: { '20-29': 0.15, '30-39': 0.25, '40-49': 0.22, '50-59': 0.20, '60+': 0.18 },
                household_types: { single: 0.35, couple: 0.25, family: 0.40 },
                income_levels: { low: 0.25, medium: 0.45, high: 0.30 }
              }
            },
            competitors: {
              data: {
                direct_competitors: 5,
                indirect_competitors: 7,
                market_share: { leader: 0.25, second: 0.20, others: 0.55 },
                direct_competitor_list: [
                  { name: 'Beauty Salon A', address: '渋谷区道玄坂1-2-3', distance_m: 250 },
                  { name: 'Hair Studio B', address: '渋谷区円山町2-1-8', distance_m: 180 },
                  { name: 'Salon C', address: '渋谷区神南1-15-2', distance_m: 320 }
                ]
              }
            }
          })
        }

        // シミュレーションデータも取得
        try {
          const simulationResponse = await fetch(`${apiConfig.baseURL}/api/projects/${projectId}/simulations/latest`)
          const simulationResult = await simulationResponse.json()
          setSimulationData(simulationResult)
        } catch (err) {
          console.log('シミュレーションデータの取得をスキップ - モックデータを使用')
          // モックシミュレーションデータを設定
          setSimulationData({
            monthly_revenue: 1200000,
            monthly_profit: 350000,
            roi: 28.5,
            breakeven_months: 6,
            expected_customers: 240,
            customer_acquisition_cost: 2500
          })
        }
      }
    } catch (err) {
      console.error('プロジェクトデータ取得エラー:', err)
    }
  }

  const loadExistingReports = () => {
    // モックデータ - 既存のレポート
    setReports([
      {
        id: '1',
        title: 'サンプル美容室 事業計画書',
        created_at: '2024-01-20T10:30:00Z',
        has_pdf: false, // PDF生成可能に設定
        has_pptx: false,
        template_type: 'business_plan'
      },
      {
        id: '2',
        title: '渋谷区市場分析レポート',
        created_at: '2024-01-18T14:20:00Z',
        has_pdf: false, // PDF生成可能に設定
        has_pptx: false,
        template_type: 'market_analysis'
      },
      {
        id: '3',
        title: '売上シミュレーション結果サマリー',
        created_at: '2024-01-15T09:15:00Z',
        has_pdf: false,
        has_pptx: false,
        template_type: 'simulation_summary'
      }
    ])
  }

  const availableChartTypes = [
    { value: 'funnel', label: '顧客獲得ファネル' },
    { value: 'cashflow', label: 'キャッシュフロー予測' },
    { value: 'demographics', label: '人口統計' },
    { value: 'competitors', label: '競合分析' },
    { value: 'seasonality', label: '季節性分析' }
  ]

  const generateReportContent = (templateId?: string) => {
    const template = reportTemplates.find(t => t.id === (templateId || selectedTemplate || 'business_plan'))
    if (!template) {
      // デフォルトテンプレートを使用
      const defaultTemplate = reportTemplates[0]
      if (!defaultTemplate) return null
      return generateReportWithTemplate(defaultTemplate, reportTitle || 'サンプルレポート')
    }
    
    return generateReportWithTemplate(template, reportTitle || template.name)
  }

  const generateReportWithTemplate = (template: any, title: string) => {
    return {
      title: title,
      template: template.name,
      created_at: new Date().toISOString(),
      project: project,
      sections: generateSections(template.type)
    }
  }

  const generateSections = (templateType: string) => {
    const sections = []

    // エグゼクティブサマリー: 出店戦略の核心
    sections.push({
      title: '🎯 出店戦略サマリー',
      content: {
        projectName: project?.name || 'プロジェクト名',
        industry: project?.industry_type || 'beauty',
        targetArea: project?.target_area || '東京都',
        description: project?.description || 'プロジェクト説明',
        recommendation: getStrategicRecommendation(),
        investmentRecommendation: getInvestmentRecommendation(),
        riskLevel: calculateRiskLevel(),
        expectedROI: simulationData?.roi || 25.5,
        timeToBreakeven: simulationData?.breakeven_months || 8
      }
    })

    // 立地戦略分析
    sections.push({
      title: '📍 立地戦略分析',
      content: {
        locationScore: calculateLocationScore(),
        footTraffic: getFootTrafficAnalysis(),
        accessibility: getAccessibilityScore(),
        competitionDensity: getCompetitionDensity(),
        rentEstimate: getRentEstimate(),
        growthPotential: getGrowthPotential()
      }
    })

    // 収益性分析
    sections.push({
      title: '💰 収益性・投資分析',
      content: {
        investmentSummary: getInvestmentRecommendation(),
        revenueProjection: getRevenueProjection(),
        profitabilityAnalysis: getProfitabilityAnalysis(),
        cashFlow: getCashFlowAnalysis(),
        sensitivityAnalysis: getSensitivityAnalysis()
      }
    })

    // 競合戦略分析
    sections.push({
      title: '⚔️ 競合戦略・差別化',
      content: {
        competitionDensity: getCompetitionDensity(),
        competitivePositioning: getCompetitivePositioning(),
        differentiationStrategy: getDifferentiationStrategy(),
        pricingStrategy: getPricingStrategy(),
        marketingStrategy: getMarketingStrategy()
      }
    })

    if (templateType === 'business_plan') {
      // 実行計画・タイムライン
      sections.push({
        title: '📅 開業実行計画',
        content: {
          timeline: getImplementationTimeline(),
          milestones: getKeyMilestones(),
          resourceAllocation: getResourceAllocation(),
          contingencyPlan: getContingencyPlan()
        }
      })

      // リスク管理・緩和策
      sections.push({
        title: '🛡️ リスク管理戦略',
        content: {
          riskAssessment: getRiskAssessment(),
          mitigationStrategies: getMitigationStrategies(),
          monitoringKPIs: getMonitoringKPIs(),
          exitStrategy: getExitStrategy()
        }
      })
    }

    if (templateType === 'simulation_summary' || templateType === 'business_plan') {
      // シミュレーション結果セクション
      if (simulationData) {
        sections.push({
          title: '売上シミュレーション',
          content: {
            monthlyRevenue: simulationData.monthly_revenue || 1000000,
            monthlyProfit: simulationData.monthly_profit || 300000,
            roi: simulationData.roi || 25.5,
            breakevenMonths: simulationData.breakeven_months || 8,
            expectedCustomers: simulationData.expected_customers || 200
          }
        })
      }
    }

    if (templateType === 'business_plan') {
      // 事業計画特有のセクション
      sections.push({
        title: 'リスク分析・対策',
        content: {
          riskFactors: [
            '競合店舗の価格競争',
            '季節変動による売上減',
            'スタッフ採用・定着',
            '消費者嗜好の変化'
          ],
          mitigationPlans: [
            '差別化サービスの強化',
            'オフシーズン向け商品開発',
            '福利厚生・研修制度充実',
            '顧客ニーズの定期調査'
          ]
        }
      })

      sections.push({
        title: '実行計画',
        content: {
          phases: [
            { period: '開業前（1-2ヶ月）', tasks: ['競合調査', 'ターゲット分析', 'スタッフ研修'] },
            { period: '開業直後（1-3ヶ月）', tasks: ['オープニング施策', '地域プロモーション', 'SNS対策'] },
            { period: '安定期（3ヶ月〜）', tasks: ['リピーター育成', 'サービス改善', '事業拡大検討'] }
          ]
        }
      })
    }

    return sections
  }

  const handleGenerateReport = async () => {
    if (!selectedTemplate || !reportTitle) return

    setGenerating(true)
    
    try {
      // レポートコンテンツを生成
      const reportContent = generateReportContent()
      
      // 新しいレポートを作成
      const newReport: GeneratedReport = {
        id: Date.now().toString(),
        title: reportTitle,
        created_at: new Date().toISOString(),
        has_pdf: false,
        has_pptx: false,
        template_type: selectedTemplate
      }
      
      // レポート内容をプレビューコンテンツとして設定
      setPreviewContent(reportContent)
      
      // レポートリストに追加
      setReports(prev => [newReport, ...prev])
      
      // フォームリセット
      setSelectedTemplate('')
      setReportTitle('')
      
      // プレビューを表示
      setPreviewOpen(true)
      
    } catch (error) {
      console.error('レポート生成エラー:', error)
      alert('レポート生成に失敗しました')
    } finally {
      setGenerating(false)
    }
  }

  const exportToPDF = async () => {
    if (!reportRef.current || !previewContent) return
    
    setExportingPDF(true)
    
    try {
      // HTMLからキャンバスに変換（容量最適化設定）
      const canvas = await html2canvas(reportRef.current, {
        scale: 1.2, // スケールを下げて容量削減
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: reportRef.current.scrollWidth,
        height: reportRef.current.scrollHeight,
        foreignObjectRendering: false, // パフォーマンス向上
        removeContainer: true
      })
      
      // JPEG形式で圧縮して容量削減
      const imgData = canvas.toDataURL('image/jpeg', 0.8) // JPEG、品質80%
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      
      // 複数ページに分割する場合の計算
      const ratio = pdfWidth / imgWidth
      const scaledHeight = imgHeight * ratio
      
      if (scaledHeight <= pdfHeight - 20) {
        // 1ページに収まる場合
        const imgY = 10
        pdf.addImage(imgData, 'JPEG', 0, imgY, pdfWidth, scaledHeight)
      } else {
        // 複数ページに分割
        const pageHeight = pdfHeight - 20
        const totalPages = Math.ceil(scaledHeight / pageHeight)
        
        for (let i = 0; i < totalPages; i++) {
          if (i > 0) pdf.addPage()
          
          const sourceY = (i * pageHeight) / ratio
          const sourceHeight = Math.min(pageHeight / ratio, imgHeight - sourceY)
          
          // ページごとのキャンバス作成
          const pageCanvas = document.createElement('canvas')
          const pageCtx = pageCanvas.getContext('2d')
          pageCanvas.width = imgWidth
          pageCanvas.height = sourceHeight
          
          pageCtx?.drawImage(canvas, 0, sourceY, imgWidth, sourceHeight, 0, 0, imgWidth, sourceHeight)
          const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.8)
          
          pdf.addImage(pageImgData, 'JPEG', 0, 10, pdfWidth, sourceHeight * ratio)
        }
      }
      
      // PDFをダウンロード
      const fileName = `${previewContent.title.replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
      
      alert('PDFのダウンロードが完了しました')
      
    } catch (error) {
      console.error('PDF生成エラー:', error)
      alert('PDF生成に失敗しました')
    } finally {
      setExportingPDF(false)
    }
  }

  const handleExportReport = async (reportId: string, format: 'pdf' | 'pptx') => {
    const report = reports.find(r => r.id === reportId)
    if (!report) return
    
    if (format === 'pdf') {
      // 該当レポートの内容を生成してPDF出力
      const reportContent = generateReportContent()
      setPreviewContent(reportContent)
      
      // 少し待ってからPDF生成（DOMの更新を待つ）
      setTimeout(() => {
        exportToPDF()
      }, 500)
    } else {
      alert('PPTX出力は今後実装予定です')
    }
    
    // レポートリストを更新
    setReports(prev => prev.map(r => 
      r.id === reportId 
        ? { ...r, [format === 'pdf' ? 'has_pdf' : 'has_pptx']: true }
        : r
    ))
  }

  const handlePreviewReport = async (reportId: string) => {
    try {
      // 報告書IDから対応するテンプレートを推定
      const report = reports.find(r => r.id === reportId)
      const templateType = report?.template_type || 'business_plan'
      
      // リアルタイムでレポートコンテンツを生成
      const reportContent = generateReportContent(templateType)
      
      if (reportContent) {
        // レポートタイトルを既存レポートのタイトルに設定
        reportContent.title = report?.title || reportContent.title
        setPreviewContent(reportContent)
        setPreviewOpen(true)
      } else {
        // フォールバック: シンプルなモックデータ
        setPreviewContent({
          title: report?.title || 'サンプルレポート',
          template: '事業計画書',
          created_at: new Date().toISOString(),
          project: project,
          sections: [
            { 
              title: 'プロジェクト概要', 
              content: {
                projectName: project?.name || 'サンプル美容室',
                industry: project?.industry_type || 'beauty',
                targetArea: project?.target_area || '渋谷区',
                description: project?.description || 'プロジェクト説明'
              }
            },
            { 
              title: '市場分析', 
              content: {
                totalPopulation: 45823,
                targetPopulation: 12500,
                ageGroups: { '20-29': 0.15, '30-39': 0.25, '40-49': 0.22, '50-59': 0.20, '60+': 0.18 }
              }
            },
            { 
              title: '売上シミュレーション', 
              content: {
                monthlyRevenue: 1000000,
                monthlyProfit: 300000,
                roi: 25.5,
                breakevenMonths: 8
              }
            }
          ]
        })
        setPreviewOpen(true)
      }
    } catch (error) {
      console.error('プレビューエラー:', error)
      // エラー時のフォールバック
      const report = reports.find(r => r.id === reportId)
      setPreviewContent({
        title: report?.title || 'レポート',
        template: '事業計画書',
        created_at: new Date().toISOString(),
        project: project,
        sections: [
          { 
            title: 'プロジェクト概要', 
            content: {
              projectName: project?.name || 'サンプル美容室',
              industry: project?.industry_type || 'beauty',
              targetArea: project?.target_area || '渋谷区',
              description: project?.description || 'プロジェクト説明'
            }
          }
        ]
      })
      setPreviewOpen(true)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  // 戦略分析用のヘルパー関数群
  const getStrategicRecommendation = () => {
    const roi = simulationData?.roi || 25.5
    const breakeven = simulationData?.breakeven_months || 8
    const competition = analysisData?.competitors?.data?.direct_competitors || 5
    
    if (roi > 30 && breakeven <= 6 && competition <= 3) {
      return "🟢 強く推奨: 優秀な立地条件で早期収益が期待できます"
    } else if (roi > 20 && breakeven <= 12 && competition <= 6) {
      return "🟡 推奨: 適度なリスクで安定した収益が見込めます"
    } else if (roi > 15 && breakeven <= 18) {
      return "🟠 条件付き推奨: 慎重な出店計画とコスト管理が必要です"
    } else {
      return "🔴 慎重検討: 立地や事業計画の見直しを推奨します"
    }
  }

  const getInvestmentRecommendation = () => {
    const initialCost = 15000000 // 1500万円想定
    const monthlyProfit = simulationData?.monthly_profit || 350000
    const breakeven = simulationData?.breakeven_months || 8
    
    return {
      initialInvestment: initialCost,
      monthlyProfit: monthlyProfit,
      annualReturn: monthlyProfit * 12,
      paybackPeriod: breakeven,
      investmentRisk: breakeven <= 12 ? "低" : breakeven <= 24 ? "中" : "高",
      recommendation: breakeven <= 12 ? "推奨投資" : breakeven <= 24 ? "慎重投資" : "高リスク投資"
    }
  }

  const calculateRiskLevel = () => {
    const factors = [
      analysisData?.competitors?.data?.direct_competitors || 5,
      (simulationData?.breakeven_months || 8) / 2,
      10 - (simulationData?.roi || 25) / 5
    ]
    const avgRisk = factors.reduce((a, b) => a + b, 0) / factors.length
    
    if (avgRisk <= 3) return { level: "低", color: "success.main", score: avgRisk }
    if (avgRisk <= 6) return { level: "中", color: "warning.main", score: avgRisk }
    return { level: "高", color: "error.main", score: avgRisk }
  }

  const calculateLocationScore = () => {
    const population = analysisData?.demographics?.data?.target_population || 12500
    const competition = analysisData?.competitors?.data?.direct_competitors || 5
    const score = Math.min(100, (population / 100) - (competition * 5) + 50)
    
    return {
      overall: Math.round(score),
      population: Math.min(100, population / 150),
      competition: Math.max(0, 100 - competition * 10),
      accessibility: 85, // モック値
      visibility: 75 // モック値
    }
  }

  const getFootTrafficAnalysis = () => {
    return {
      weekdayMorning: { level: "中", count: "150-200人/時" },
      weekdayAfternoon: { level: "高", count: "250-300人/時" },
      weekendMorning: { level: "高", count: "300-400人/時" },
      weekendAfternoon: { level: "非常に高", count: "400-500人/時" },
      peakHours: ["11:00-14:00", "16:00-19:00"],
      recommendation: "平日夕方と週末が主要な集客時間帯です"
    }
  }

  const getAccessibilityScore = () => {
    return {
      stationDistance: "徒歩3分",
      parkingSpaces: 15,
      publicTransport: "優秀",
      carAccess: "良好",
      overallScore: 88
    }
  }

  const getCompetitionDensity = () => {
    const direct = analysisData?.competitors?.data?.direct_competitors || 5
    const indirect = analysisData?.competitors?.data?.indirect_competitors || 7
    
    return {
      directCompetitors: direct,
      indirectCompetitors: indirect,
      marketSaturation: direct <= 3 ? "低" : direct <= 6 ? "中" : "高",
      competitiveAdvantage: getCompetitiveAdvantage(),
      marketGap: getMarketGap()
    }
  }

  const getRentEstimate = () => {
    const baseRent = 450000 // 45万円/月想定
    return {
      monthlyRent: baseRent,
      sqmPrice: 15000,
      areaSize: 30,
      deposit: baseRent * 6,
      keyMoney: baseRent * 2,
      totalInitialCost: baseRent * 9
    }
  }

  const getGrowthPotential = () => {
    return {
      marketGrowth: "年3.2%成長",
      populationTrend: "微増",
      developmentPlans: ["駅前再開発計画", "商業施設拡張"],
      futureProspects: "良好",
      investmentValue: "資産価値向上が期待される立地"
    }
  }

  const getCompetitiveAdvantage = () => {
    const industry = project?.industry_type || 'beauty'
    const advantages = {
      beauty: ["最新技術・機器", "経験豊富なスタイリスト", "居心地の良い空間"],
      restaurant: ["独自メニュー", "高品質食材", "優れた接客"],
      healthcare: ["専門資格", "最新設備", "アフターケア"],
      fitness: ["パーソナル指導", "最新マシン", "栄養指導"]
    }
    return advantages[industry as keyof typeof advantages] || advantages.beauty
  }

  const getMarketGap = () => {
    return [
      "高品質・適正価格のサービス不足",
      "20-30代女性向けサービスの需要過多",
      "夜間営業の店舗不足",
      "SNS映えする空間の不足"
    ]
  }

  const getRevenueProjection = () => {
    const monthly = simulationData?.monthly_revenue || 1200000
    return {
      year1: monthly * 12,
      year2: monthly * 12 * 1.15,
      year3: monthly * 12 * 1.32,
      monthlyGrowth: "1.2%",
      seasonalVariation: "±15%"
    }
  }

  const getProfitabilityAnalysis = () => {
    const revenue = simulationData?.monthly_revenue || 1200000
    const profit = simulationData?.monthly_profit || 350000
    return {
      grossMargin: ((revenue - 480000) / revenue * 100).toFixed(1) + "%",
      netMargin: (profit / revenue * 100).toFixed(1) + "%",
      breakEvenPoint: simulationData?.breakeven_months || 8,
      profitabilityRating: profit > 300000 ? "優秀" : profit > 200000 ? "良好" : "改善要"
    }
  }

  const getCashFlowAnalysis = () => {
    return {
      initialOutflow: -15000000,
      monthlyInflow: simulationData?.monthly_profit || 350000,
      cumulativeBreakeven: 8,
      yearEndBalance: 2200000,
      cashFlowHealth: "健全"
    }
  }

  const getSensitivityAnalysis = () => {
    const baseProfit = simulationData?.monthly_profit || 350000
    return {
      customerDecrease10: Math.round(baseProfit * 0.85),
      customerIncrease10: Math.round(baseProfit * 1.15),
      priceDecrease5: Math.round(baseProfit * 0.92),
      priceIncrease5: Math.round(baseProfit * 1.08),
      mostSensitive: "顧客数変動",
      recommendedFocus: "顧客獲得・維持戦略"
    }
  }

  const getCompetitivePositioning = () => {
    return {
      marketPosition: "プレミアム・中価格帯",
      targetSegment: "品質重視の25-40歳女性",
      valueProposition: "高品質サービス × リーズナブル価格",
      uniqueSellingPoint: "最新技術 + 個別カウンセリング"
    }
  }

  const getDifferentiationStrategy = () => {
    return {
      serviceQuality: "業界トップレベルの技術力",
      customerExperience: "完全個室 + アフターケア",
      pricing: "競合より10-15%高単価での価値提供",
      marketing: "Instagram + 口コミマーケティング"
    }
  }

  const getPricingStrategy = () => {
    return {
      strategy: "バリューベース価格設定",
      averagePrice: "¥8,500",
      competitorRange: "¥6,000-12,000",
      pricePositioning: "中上位",
      promotionalPricing: "新規50%OFF、紹介割引20%"
    }
  }

  const getMarketingStrategy = () => {
    return {
      digitalMarketing: "Instagram広告 + Google マイビジネス",
      localMarketing: "地域イベント参加 + フリーペーパー",
      referralProgram: "紹介キャンペーン + ポイント制度",
      budget: "月10万円（売上の8%）",
      expectedCustomerAcquisition: "月30名の新規顧客"
    }
  }

  const getImplementationTimeline = () => {
    return [
      { phase: "準備期間", duration: "1-2ヶ月", tasks: ["物件契約", "内装工事", "設備導入", "スタッフ採用"] },
      { phase: "開業準備", duration: "2週間", tasks: ["試営業", "マーケティング開始", "オペレーション確認"] },
      { phase: "グランドオープン", duration: "1ヶ月", tasks: ["開業イベント", "顧客獲得", "運営改善"] },
      { phase: "安定運営", duration: "継続", tasks: ["品質向上", "リピーター獲得", "事業拡大検討"] }
    ]
  }

  const getKeyMilestones = () => {
    return [
      { milestone: "物件契約完了", deadline: "開業3ヶ月前", status: "pending" },
      { milestone: "内装工事完了", deadline: "開業1ヶ月前", status: "pending" },
      { milestone: "スタッフ研修完了", deadline: "開業2週間前", status: "pending" },
      { milestone: "100名顧客獲得", deadline: "開業3ヶ月後", status: "target" },
      { milestone: "月次黒字達成", deadline: "開業6ヶ月後", status: "target" }
    ]
  }

  const getResourceAllocation = () => {
    return {
      initialInvestment: 15000000,
      breakdown: {
        interior: 6000000,
        equipment: 4000000,
        deposit: 2700000,
        marketing: 800000,
        workingCapital: 1500000
      },
      monthlyOperating: 850000,
      staffing: "フルタイム2名 + パートタイム2名"
    }
  }

  const getContingencyPlan = () => {
    return [
      "開業遅延時: 仮営業での段階的オープン",
      "顧客獲得不足: 割引キャンペーン強化",
      "競合激化: 差別化サービス追加",
      "スタッフ不足: 外部研修生受け入れ"
    ]
  }

  const getRiskAssessment = () => {
    return [
      { risk: "顧客獲得遅延", probability: "中", impact: "高", mitigation: "マーケティング強化" },
      { risk: "競合店新規参入", probability: "中", impact: "中", mitigation: "差別化戦略" },
      { risk: "人材確保困難", probability: "高", impact: "中", mitigation: "待遇改善・研修充実" },
      { risk: "経済環境悪化", probability: "低", impact: "高", mitigation: "価格戦略見直し" }
    ]
  }

  const getMitigationStrategies = () => {
    return [
      "キャッシュフロー管理: 月次予実管理の徹底",
      "顧客獲得: 複数チャネルでのマーケティング",
      "品質維持: 定期的なスタッフ研修・技術向上",
      "競合対策: 独自サービスの継続的開発"
    ]
  }

  const getMonitoringKPIs = () => {
    return [
      { kpi: "月次売上高", target: "120万円", frequency: "毎月" },
      { kpi: "新規顧客数", target: "30名/月", frequency: "毎月" },
      { kpi: "リピート率", target: "65%", frequency: "四半期" },
      { kpi: "顧客満足度", target: "4.5/5.0", frequency: "四半期" }
    ]
  }

  const getExitStrategy = () => {
    return {
      timeframe: "5-7年後",
      options: ["事業売却", "フランチャイズ化", "多店舗展開"],
      expectedValue: "3000-5000万円",
      conditions: "安定収益・ブランド確立後"
    }
  }

  const ReportContent = ({ content }: { content: any }) => {
    if (!content) return null

    return (
      <Box ref={reportRef} sx={{ p: 4, bgcolor: 'white', minHeight: '100vh' }}>
        {/* ヘッダー */}
        <Box sx={{ mb: 4, borderBottom: '2px solid #1976d2', pb: 2 }}>
          <Typography variant="h4" color="primary" gutterBottom>
            {content.title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {content.template} | 作成日: {formatDate(content.created_at)}
          </Typography>
          {content.project && (
            <Box sx={{ mt: 2 }}>
              <Stack direction="row" spacing={2}>
                <Chip icon={<BusinessIcon />} label={content.project.industry_type} variant="outlined" />
                <Chip icon={<LocationOnIcon />} label={content.project.target_area} variant="outlined" />
              </Stack>
            </Box>
          )}
        </Box>

        {/* セクション */}
        {content.sections?.map((section: any, index: number) => (
          <Box key={index} sx={{ mb: 4 }}>
            <Typography variant="h5" color="primary" gutterBottom sx={{ borderLeft: '4px solid #1976d2', pl: 2 }}>
              {section.title}
            </Typography>
            
            {section.title === 'プロジェクト概要' && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>基本情報</Typography>
                      <Typography><strong>プロジェクト名:</strong> {section.content.projectName}</Typography>
                      <Typography><strong>業界:</strong> {section.content.industry}</Typography>
                      <Typography><strong>対象エリア:</strong> {section.content.targetArea}</Typography>
                      <Typography><strong>説明:</strong> {section.content.description}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {section.title === '🎯 出店戦略サマリー' && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ bgcolor: '#f5f5f5' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">
                        📊 投資判定結果
                      </Typography>
                      <Typography variant="h4" color="success.main" sx={{ mb: 2 }}>
                        {section.content.recommendation}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6} md={3}>
                          <Typography variant="subtitle2">期待ROI</Typography>
                          <Typography variant="h6" color="primary">{section.content.expectedROI?.toFixed(1)}%</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="subtitle2">回収期間</Typography>
                          <Typography variant="h6">{section.content.timeToBreakeven}ヶ月</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="subtitle2">リスクレベル</Typography>
                          <Typography variant="h6" color={section.content.riskLevel?.color || 'primary'}>{section.content.riskLevel?.level || '中'}</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="subtitle2">投資推奨度</Typography>
                          <Typography variant="h6" color="success.main">推奨</Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {section.title === '📍 立地戦略分析' && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>立地スコア総合評価</Typography>
                      <Typography variant="h3" color="primary" sx={{ textAlign: 'center' }}>
                        {section.content.locationScore?.overall || 85}/100
                      </Typography>
                      <Typography variant="h6" sx={{ textAlign: 'center', mb: 2, color: 'success.main' }}>優良立地</Typography>
                      
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>🚶 アクセス:</strong> {section.content.accessibility?.stationDistance || '徒歩3分'}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>👥 人通り:</strong> {section.content.footTraffic?.weekendAfternoon?.level || '非常に高'} ({section.content.footTraffic?.weekendAfternoon?.count || '400-500人/時'})
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>⚔️ 競合密度:</strong> {section.content.competitionDensity?.marketSaturation || '中'}レベル
                      </Typography>
                      <Typography variant="body1">
                        <strong>📈 成長性:</strong> {section.content.growthPotential?.futureProspects || '良好'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>💰 賃料・コスト分析</Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>月額賃料:</strong> {formatCurrency(section.content.rentEstimate?.monthlyRent || 450000)}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>坪単価:</strong> ¥{section.content.rentEstimate?.sqmPrice?.toLocaleString() || '15,000'}/坪
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>敷金・礼金:</strong> {formatCurrency(section.content.rentEstimate?.totalInitialCost || 4050000)}
                      </Typography>
                      <Box sx={{ mt: 2, p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
                        <Typography variant="body2" color="success.dark">
                          💡 同エリア平均より15%低い賃料水準で非常に有利
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {section.title === '💰 収益性・投資分析' && (
              <Box>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" color="primary">
                          {formatCurrency(section.content.revenueProjection?.year1 || 14400000)}
                        </Typography>
                        <Typography variant="body2">初年度売上予測</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" color="success.main">
                          {section.content.profitabilityAnalysis?.netMargin || '29.2%'}
                        </Typography>
                        <Typography variant="body2">営業利益率</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" color="info.main">
                          {section.content.investmentSummary?.paybackPeriod || 8}ヶ月
                        </Typography>
                        <Typography variant="body2">投資回収期間</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>📊 感度分析</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2">顧客数 -10%</Typography>
                        <Typography variant="h6" color="error.main">{formatCurrency(section.content.sensitivityAnalysis?.customerDecrease10 || 297500)}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">顧客数 +10%</Typography>
                        <Typography variant="h6" color="success.main">{formatCurrency(section.content.sensitivityAnalysis?.customerIncrease10 || 402500)}</Typography>
                      </Grid>
                    </Grid>
                    <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                      ⚠️ 最重要指標: {section.content.sensitivityAnalysis?.mostSensitive || '顧客数変動'}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            )}

            {section.title === '⚔️ 競合戦略・差別化' && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>🎯 競合ポジショニング</Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>市場ポジション:</strong> {section.content.competitivePositioning?.marketPosition || 'プレミアム・中価格帯'}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>メインターゲット:</strong> {section.content.competitivePositioning?.targetSegment || '品質重視の25-40歳女性'}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>価値提案:</strong> {section.content.competitivePositioning?.valueProposition || '高品質サービス × リーズナブル価格'}
                      </Typography>
                      <Typography variant="body1">
                        <strong>独自性:</strong> {section.content.competitivePositioning?.uniqueSellingPoint || '最新技術 + 個別カウンセリング'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>🚀 差別化戦略</Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>サービス品質:</strong> {section.content.differentiationStrategy?.serviceQuality || '業界トップレベルの技術力'}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>顧客体験:</strong> {section.content.differentiationStrategy?.customerExperience || '完全個室 + アフターケア'}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>価格戦略:</strong> {section.content.differentiationStrategy?.pricing || '競合より10-15%高単価での価値提供'}
                      </Typography>
                      <Typography variant="body1">
                        <strong>マーケティング:</strong> {section.content.differentiationStrategy?.marketing || 'Instagram + 口コミマーケティング'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {section.title === '📅 開業実行計画' && (
              <Grid container spacing={2}>
                {section.content.timeline?.map((phase: any, idx: number) => (
                  <Grid item xs={12} md={3} key={idx}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom color="primary">
                          {phase.phase}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          📅 期間: {phase.duration}
                        </Typography>
                        {phase.tasks?.map((task: string, taskIdx: number) => (
                          <Typography key={taskIdx} variant="body2" sx={{ mb: 0.5 }}>
                            ✓ {task}
                          </Typography>
                        ))}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            {section.title === '🛡️ リスク管理戦略' && (
              <Box>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>⚠️ 主要リスク評価</Typography>
                    {section.content.riskAssessment?.map((risk: any, idx: number) => (
                      <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, p: 1, border: '1px solid #ddd', borderRadius: 1 }}>
                        <Typography variant="body1">{risk.risk}</Typography>
                        <Box>
                          <Chip label={`確率: ${risk.probability}`} size="small" color={risk.probability === '高' ? 'error' : risk.probability === '中' ? 'warning' : 'success'} sx={{ mr: 1 }} />
                          <Chip label={`影響: ${risk.impact}`} size="small" color={risk.impact === '高' ? 'error' : risk.impact === '中' ? 'warning' : 'success'} />
                        </Box>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
                
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>📊 KPI監視指標</Typography>
                    <Grid container spacing={2}>
                      {section.content.monitoringKPIs?.map((kpi: any, idx: number) => (
                        <Grid item xs={12} md={6} key={idx}>
                          <Box sx={{ p: 1, border: '1px solid #ddd', borderRadius: 1 }}>
                            <Typography variant="body1"><strong>{kpi.kpi}</strong></Typography>
                            <Typography variant="body2">目標: {kpi.target} | 頻度: {kpi.frequency}</Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Box>
            )}

            {section.title === '商圏人口分析' && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {section.content.totalPopulation?.toLocaleString()}
                      </Typography>
                      <Typography variant="body2">総人口</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="secondary">
                        {section.content.targetPopulation?.toLocaleString()}
                      </Typography>
                      <Typography variant="body2">ターゲット層人口</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>年齢構成</Typography>
                      {Object.entries(section.content.ageGroups || {}).map(([age, ratio]) => (
                        <Typography key={age} variant="body2">
                          {age}歳: {formatPercentage(ratio as number)}
                        </Typography>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {section.title === '競合分析' && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>競合店舗数</Typography>
                      <Typography variant="h4" color="warning.main">
                        直接競合: {section.content.directCompetitors}店舗
                      </Typography>
                      <Typography variant="h4" color="info.main">
                        間接競合: {section.content.indirectCompetitors}店舗
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>市場シェア</Typography>
                      {Object.entries(section.content.marketShare || {}).map(([position, share]) => (
                        <Typography key={position} variant="body1">
                          {position === 'leader' ? 'トップ企業' :
                           position === 'second' ? '2番手企業' : 'その他'}: {formatPercentage(share as number)}
                        </Typography>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {section.title === '売上シミュレーション' && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" color="primary">
                        {formatCurrency(section.content.monthlyRevenue)}
                      </Typography>
                      <Typography variant="body2">月間売上</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" color="success.main">
                        {formatCurrency(section.content.monthlyProfit)}
                      </Typography>
                      <Typography variant="body2">月間利益</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h5">
                        {section.content.roi?.toFixed(1)}%
                      </Typography>
                      <Typography variant="body2">ROI</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h5">
                        {section.content.breakevenMonths}ヶ月
                      </Typography>
                      <Typography variant="body2">損益分岐点</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {section.title === 'リスク分析・対策' && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>主要リスク</Typography>
                      {section.content.riskFactors?.map((risk: string, idx: number) => (
                        <Typography key={idx} variant="body1" sx={{ mb: 1 }}>
                          • {risk}
                        </Typography>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>対策案</Typography>
                      {section.content.mitigationPlans?.map((plan: string, idx: number) => (
                        <Typography key={idx} variant="body1" sx={{ mb: 1 }}>
                          • {plan}
                        </Typography>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {section.title === '実行計画' && (
              <Grid container spacing={2}>
                {section.content.phases?.map((phase: any, idx: number) => (
                  <Grid item xs={12} md={4} key={idx}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>{phase.period}</Typography>
                        {phase.tasks?.map((task: string, taskIdx: number) => (
                          <Typography key={taskIdx} variant="body2" sx={{ mb: 0.5 }}>
                            • {task}
                          </Typography>
                        ))}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        ))}
        
        {/* フッター */}
        <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #ddd', textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            MVT Analytics System で生成 | {formatDate(content.created_at)}
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Container maxWidth="xl">
      {/* ヘッダー */}
      <Box sx={{ mb: 4 }}>
        <Button
          variant="text"
          onClick={() => navigate(projectId ? `/projects/${projectId}` : '/projects')}
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          {projectId ? 'プロジェクト詳細に戻る' : 'プロジェクト一覧に戻る'}
        </Button>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              <ReportIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              レポート生成
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {project ? `${project.name} - ` : ''}分析結果の資料生成・エクスポート
            </Typography>
            {project && (
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip icon={<BusinessIcon />} label={project.industry_type} variant="outlined" size="small" />
                <Chip icon={<LocationOnIcon />} label={project.target_area} variant="outlined" size="small" />
              </Stack>
            )}
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* レポート生成フォーム */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                新規レポート生成
              </Typography>
              
              <Stack spacing={3}>
                <FormControl fullWidth>
                  <InputLabel>レポートテンプレート</InputLabel>
                  <Select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                  >
                    {reportTemplates.map(template => (
                      <MenuItem key={template.id} value={template.id}>
                        <Box>
                          <Typography variant="body1">{template.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {template.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {selectedTemplate && (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>含まれるセクション</Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {reportTemplates.find(t => t.id === selectedTemplate)?.sections.map(section => (
                          <Chip key={section} label={section} size="small" variant="outlined" />
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                )}

                <TextField
                  label="レポートタイトル"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  fullWidth
                  placeholder="例: 美容室ABC 事業計画書"
                />

                <Divider />

                <Typography variant="subtitle2">含めるデータ</Typography>
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeAnalysis}
                      onChange={(e) => setIncludeAnalysis(e.target.checked)}
                    />
                  }
                  label="分析結果（商圏・競合・需要）"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeSimulation}
                      onChange={(e) => setIncludeSimulation(e.target.checked)}
                    />
                  }
                  label="シミュレーション結果"
                />

                <FormControl fullWidth>
                  <InputLabel>含めるチャート</InputLabel>
                  <Select
                    multiple
                    value={chartTypes}
                    onChange={(e) => setChartTypes(e.target.value as string[])}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const chart = availableChartTypes.find(c => c.value === value)
                          return <Chip key={value} label={chart?.label} size="small" />
                        })}
                      </Box>
                    )}
                  >
                    {availableChartTypes.map(chart => (
                      <MenuItem key={chart.value} value={chart.value}>
                        {chart.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleGenerateReport}
                  disabled={!selectedTemplate || !reportTitle || generating}
                  fullWidth
                  size="large"
                >
                  {generating ? 'レポート生成中...' : 'レポート生成'}
                </Button>

                {generating && (
                  <Box>
                    <LinearProgress />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                      分析データを集計し、レポートを生成しています...
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* 生成済みレポート一覧 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                生成済みレポート
              </Typography>

              {reports.length === 0 ? (
                <Alert severity="info">
                  まだレポートが生成されていません
                </Alert>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>タイトル</TableCell>
                        <TableCell align="center">作成日時</TableCell>
                        <TableCell align="center">エクスポート</TableCell>
                        <TableCell align="center">アクション</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {report.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {reportTemplates.find(t => t.id === report.template_type)?.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="caption">
                              {formatDate(report.created_at)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={1} justifyContent="center">
                              {report.has_pdf ? (
                                <Chip
                                  icon={<PdfIcon />}
                                  label="PDF"
                                  size="small"
                                  color="error"
                                  clickable
                                  onClick={() => {
                                    // プレビューから PDF を生成
                                    handlePreviewReport(report.id)
                                  }}
                                />
                              ) : (
                                <Button
                                  size="small"
                                  startIcon={<PdfIcon />}
                                  onClick={() => handleExportReport(report.id, 'pdf')}
                                >
                                  PDF
                                </Button>
                              )}
                              
                              {report.has_pptx ? (
                                <Chip
                                  icon={<PowerPointIcon />}
                                  label="PPTX"
                                  size="small"
                                  color="info"
                                  clickable
                                  onClick={() => window.open(`/api/reports/download/${report.id}?format=pptx`)}
                                />
                              ) : (
                                <Button
                                  size="small"
                                  startIcon={<PowerPointIcon />}
                                  onClick={() => handleExportReport(report.id, 'pptx')}
                                >
                                  PPTX
                                </Button>
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              size="small"
                              startIcon={<PreviewIcon />}
                              onClick={() => handlePreviewReport(report.id)}
                            >
                              プレビュー
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* プレビューダイアログ */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: { height: '90vh' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">レポートプレビュー</Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={exportingPDF ? <CircularProgress size={16} /> : <PdfIcon />}
                onClick={exportToPDF}
                disabled={exportingPDF}
                color="error"
              >
                {exportingPDF ? 'PDF生成中...' : 'PDF出力'}
              </Button>
              <Button onClick={() => setPreviewOpen(false)}>閉じる</Button>
            </Stack>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {previewContent && (
            <Box sx={{ height: '100%', overflow: 'auto' }}>
              <ReportContent content={previewContent} />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  )
}

export default Reports 