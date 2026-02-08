import { Router, Request, Response } from 'express';
import { pdfService } from '../services/pdf.service';
import { analysisService } from '../services/analysis.service';
import { AnalyzeResponse } from '../types';
import { llmService } from '../services/llm.service';
import axios from 'axios';
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
  // We will ask the agent to (1) rate the user's understanding and (2) propose a short list
  // of topics/queries that a search engine (this program) should run on Wikipedia.
  // The agent MUST return two sections separated by a line with exactly
  // "===SEARCH_TOPICS===". The text before that marker is the human-facing
  // rating/feedback. After the marker, return one topic/query per line.
  // Example response:
  // <brief rating text>
  // ===SEARCH_TOPICS===
  // Topic A
  // Topic B

  const prompt = `You are an expert in the academic field which concerns ${req.body.title || 'the topic'}. Be neutral and concise.

Provide a brief qualitative rating of the user's submitted text (no more than ~100 words) and one-line suggestions for next steps.

After the brief rating, on a new line include EXACTLY the marker ===SEARCH_TOPICS=== and then list 3-6 short search queries (one per line) that would be good to search for on Wikipedia (or similar high-quality references) to learn more about this topic. The agent should only propose the queries — it must NOT attempt to fetch or return links. Example output format:

<brief rating text here>
===SEARCH_TOPICS===
Query 1
Query 2
Query 3

Be concise; do not include any additional commentary beyond the two sections above.`;

  const aiResponse = await llmService.runPrompt(req.body.text, prompt);
  if (!aiResponse.success || !aiResponse.data) {
    return res.status(500).json({ error: 'LLM failed to produce a response' });
  }

  const raw = aiResponse.data as string;
  // split at the marker
  const marker = '===SEARCH_TOPICS===';
  const markerIndex = raw.indexOf(marker);
  let humanText = raw;
  let topicLines: string[] = [];

  if (markerIndex >= 0) {
    humanText = raw.slice(0, markerIndex).trim();
    const after = raw.slice(markerIndex + marker.length).trim();
    topicLines = after.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  } else {
    // fallback: try to extract lines that look like topics from the end
    const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length > 3) {
      // take last up to 6 lines as topics
      topicLines = lines.slice(-6);
      humanText = lines.slice(0, -topicLines.length).join('\n');
    }
  }

  // For each proposed topic, perform a Wikipedia opensearch query and collect the top URL.
  const links: string[] = [];
  for (let i = 0; i < topicLines.length; i++) {
    const q = topicLines[i];
    try {
      // Use the search API (action=query&list=search) which is more robust and
      // include a User-Agent header per Wikimedia API policy to avoid 403s.
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&srlimit=1&format=json`;
      const r = await axios.get(searchUrl, {
        timeout: 8000,
        headers: {
          // Wikimedia asks that automated requests include a descriptive User-Agent
          // with contact info. Replace with a real contact if appropriate.
          'User-Agent': 'ActiveReadingApp/1.0 (noahjaye@gmail.com)',
          'Accept': 'application/json'
        }
      });

      const searchData = r.data;
      const hits = searchData?.query?.search;
      if (Array.isArray(hits) && hits.length > 0) {
        const title = hits[0].title;
        const pageUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;
        links.push(pageUrl);
      } else {
        links.push(`No Wikipedia result for "${q}"`);
      }
    } catch (err: any) {
      console.error('Wikipedia lookup failed for', q, err?.message || err);
      const status = err?.response?.status;
      const msg = status ? `Request failed with status code ${status}` : (err?.message || 'error');
      links.push(`Lookup failed for "${q}": ${msg}`);
    }
  }

  // Build the final response: human-facing text, then appended links as "Link #1: <url>"
  const linkLines = links.map((u, idx) => `Link #${idx + 1}: ${u}`);
  const finalText = humanText + '\n\n' + linkLines.join('\n');

  res.json({ data: finalText });
})

export default router;
