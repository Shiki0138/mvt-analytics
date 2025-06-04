import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
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
  Divider
} from '@mui/material'
import {
  Description as ReportIcon,
  GetApp as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Slideshow as PowerPointIcon,
  Preview as PreviewIcon,
  Add as AddIcon
} from '@mui/icons-material'

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
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [reportTitle, setReportTitle] = useState('')
  const [includeAnalysis, setIncludeAnalysis] = useState(true)
  const [includeSimulation, setIncludeSimulation] = useState(true)
  const [chartTypes, setChartTypes] = useState<string[]>(['funnel', 'cashflow', 'demographics'])
  const [reports, setReports] = useState<GeneratedReport[]>([])
  const [generating, setGenerating] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewContent, setPreviewContent] = useState<any>(null)

  // モックデータ - 既存のレポート
  useEffect(() => {
    setReports([
      {
        id: '1',
        title: 'サンプル美容室 事業計画書',
        created_at: '2024-01-20T10:30:00Z',
        has_pdf: true,
        has_pptx: true,
        template_type: 'business_plan'
      },
      {
        id: '2',
        title: '渋谷区市場分析レポート',
        created_at: '2024-01-18T14:20:00Z',
        has_pdf: true,
        has_pptx: false,
        template_type: 'market_analysis'
      }
    ])
  }, [])

  const availableChartTypes = [
    { value: 'funnel', label: '顧客獲得ファネル' },
    { value: 'cashflow', label: 'キャッシュフロー予測' },
    { value: 'demographics', label: '人口統計' },
    { value: 'competitors', label: '競合分析' },
    { value: 'seasonality', label: '季節性分析' }
  ]

  const handleGenerateReport = async () => {
    if (!selectedTemplate || !reportTitle) return

    setGenerating(true)
    
    try {
      // レポート生成API呼び出し
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          title: reportTitle,
          template_id: selectedTemplate,
          include_analysis: includeAnalysis,
          include_simulation: includeSimulation,
          chart_types: chartTypes
        })
      })

      if (response.ok) {
        const newReport = await response.json()
        setReports(prev => [newReport, ...prev])
        
        // フォームリセット
        setSelectedTemplate('')
        setReportTitle('')
        
        alert('レポートが正常に生成されました！')
      } else {
        console.error('レポート生成エラー')
        alert('レポート生成に失敗しました')
      }
    } catch (error) {
      console.error('レポート生成エラー:', error)
      // MVP版では仮のレポートを追加
      const mockReport: GeneratedReport = {
        id: Date.now().toString(),
        title: reportTitle,
        created_at: new Date().toISOString(),
        has_pdf: false,
        has_pptx: false,
        template_type: selectedTemplate
      }
      setReports(prev => [mockReport, ...prev])
      setSelectedTemplate('')
      setReportTitle('')
      alert('レポートが生成されました（MVP版）')
    } finally {
      setGenerating(false)
    }
  }

  const handleExportReport = async (reportId: string, format: 'pdf' | 'pptx') => {
    try {
      const response = await fetch(`/api/reports/${reportId}/export?format=${format}`, {
        method: 'POST'
      })

      if (response.ok) {
        const result = await response.json()
        alert(`${format.toUpperCase()}エクスポートが完了しました`)
        
        // レポートリストを更新
        setReports(prev => prev.map(report => 
          report.id === reportId 
            ? { ...report, [format === 'pdf' ? 'has_pdf' : 'has_pptx']: true }
            : report
        ))
      } else {
        alert('エクスポートに失敗しました')
      }
    } catch (error) {
      console.error('エクスポートエラー:', error)
      alert('MVP版では実際のファイル生成は行いません')
    }
  }

  const handlePreviewReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}`)
      if (response.ok) {
        const reportData = await response.json()
        setPreviewContent(reportData)
        setPreviewOpen(true)
      }
    } catch (error) {
      console.error('プレビューエラー:', error)
      // モックプレビューデータ
      setPreviewContent({
        title: 'サンプルレポート',
        sections: [
          { title: '概要', content: 'プロジェクトの概要説明...' },
          { title: '市場分析', content: '商圏分析の結果...' },
          { title: '収益予測', content: 'シミュレーション結果...' }
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

  return (
    <Box>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h1" gutterBottom>
            レポート生成
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {projectId ? `プロジェクトID: ${projectId}` : '分析結果の資料生成・エクスポート'}
          </Typography>
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
                                  onClick={() => window.open(`/api/reports/download/${report.id}?format=pdf`)}
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
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          レポートプレビュー
        </DialogTitle>
        <DialogContent>
          {previewContent && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {previewContent.title}
              </Typography>
              {previewContent.sections?.map((section: any, index: number) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {section.title}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {section.content}
                  </Typography>
                </Box>
              ))}
              <Alert severity="info">
                MVP版では簡易プレビューのみ表示しています
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>閉じる</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Reports 