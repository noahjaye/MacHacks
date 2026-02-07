import { Router, Request, Response } from 'express';
import { pdfService } from '../services/pdf.service';
import { analysisService } from '../services/analysis.service';
import { AnalyzeResponse } from '../types';

const router = Router();

router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { uploadId } = req.body;

    if (!uploadId) {
      return res.status(400).json({ error: 'uploadId is required' });
    }

    console.log('🔬 Starting analysis for:', uploadId);

    // Step 1: Get file path
    const filePath = await pdfService.getFilePath(uploadId);

    // Step 2: Extract text from PDF
    const text = await pdfService.extractText(filePath);

    // Step 3: Analyze with LLM
    const analysis = await analysisService.analyzePaper(uploadId, text);

    const response: AnalyzeResponse = {
      uploadId: analysis.uploadId,
      nodes: analysis.nodes,
      edges: analysis.edges
    };

    console.log('✅ Analysis complete');
    res.json(response);

  } catch (error: any) {
    console.error('❌ Analysis error:', error);
    res.status(500).json({ 
      error: error.message || 'Analysis failed'
    });
  }
});

// Optional: Get existing analysis
router.get('/analysis/:uploadId', (req: Request, res: Response) => {
  const { uploadId } = req.params;
  const analysis = analysisService.getAnalysis(uploadId);

  if (!analysis) {
    return res.status(404).json({ error: 'Analysis not found' });
  }

  const response: AnalyzeResponse = {
    uploadId: analysis.uploadId,
    nodes: analysis.nodes,
    edges: analysis.edges
  };

  res.json(response);
});

export default router;
