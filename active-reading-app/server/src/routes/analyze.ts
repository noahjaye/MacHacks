import { Router, Request, Response } from 'express';
import { pdfService } from '../services/pdf.service';
import { analysisService } from '../services/analysis.service';
import { AnalyzeResponse } from '../types';
import { llmService } from '../services/llm.service';
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


router.post('/summarize', async (req: Request, res: Response) => {
  console.log("REQBODY", req.body)
  const prompt = `
  You are an expert in the academic field which concerns ${req.body.title}. You have neutral tone and are very concise.

  You do not provide explanations beyond what is necessary.
  
  The user is trying to understand ${req.body.title}, but they may have conceptual gaps in their understanding. 
  Please qualitatively rate their understanding of ${req.body.title}.
  
  Keep it very brief, no more than 100 words. Provide the rating on a scale of 1-10, where 1 means "No understanding" and 10 means "Expert understanding".
  
  Do not introduce the topic for them, just rate their understanding based on the text they provided. This will be shown to them, so refer to them as "you".
  
  Provide your response in the following format:
  <your qualitative rating here> (This should be between 1 and 2 sentences.)

  Overall, you scored a <your numeric rating here>/10
  <Suggestion of amount of further study needed here>
  <Optional: brief suggestion of next steps to improve understanding here>
  <Wikipedia links or other resources for further study here, in the format "For more information, see: <link>". Provide between one and a few links, depending on what you think is necessary. Do not provide markdown links. >`
  const summary = await llmService.runPrompt(req.body.text, prompt )
  console.log(summary.data)

  res.json({data: summary.data});
})

export default router;
