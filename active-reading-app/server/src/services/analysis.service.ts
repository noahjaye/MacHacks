import { v4 as uuidv4 } from 'uuid';
import { IdeaNode, IdeaEdge, PaperAnalysis } from '../types';
import { llmService } from './llm.service';
import dotenv from 'dotenv';

dotenv.config();

export class AnalysisService {
  private analyses: Map<string, PaperAnalysis> = new Map();

  async analyzePaper(uploadId: string, text: string): Promise<PaperAnalysis> {
    console.log('🔍 Starting paper analysis...');

    // Step 1: Extract concepts
    const nodes = await this.extractConcepts(text);
    console.log(`📝 Extracted ${nodes.length} concepts`);

    // Step 2: Generate relationships
    const edges = await this.generateRelationships(nodes);
    console.log(`🔗 Generated ${edges.length} relationships`);

    const analysis: PaperAnalysis = {
      uploadId,
      nodes,
      edges,
      rawText: text
    };

    this.analyses.set(uploadId, analysis);
    return analysis;
  }

  private async extractConcepts(text: string): Promise<IdeaNode[]> {
    const systemPrompt = `You are an expert at analyzing academic papers and extracting key concepts.
Your job is to identify the most important ideas, methods, claims, and results.`;

    const userPrompt = `Analyze this academic paper and extract 10-15 key concepts.

For each concept, provide:
- A concise title (2-6 words)
- A clear description (1-2 sentences)
- A relevant quote or paraphrase from the paper

Once you have extracted concepts, try reconstructing the paper only from the concepts you have identified. 
If this cannot be done, re-examine your list and add up to 5 more concepts to fill the gaps.

Return ONLY valid JSON in this exact format:
{
  "concepts": [
    {
      "title": "Graph Neural Networks",
      "description": "Neural networks that operate on graph-structured data by passing messages between nodes.",
      "sourceText": "We propose a novel architecture that learns representations by aggregating information from a node's local neighborhood."
    }
  ]
}

Paper text:
${text}`;

    const response = await llmService.runPrompt(userPrompt, systemPrompt);
    console.log("Analysponse", response)
    if (!response.success || !response.data) {
      throw new Error('Failed to extract concepts: ' + response.error);
    }

    try {
      const parsed = await llmService.extractJSON(response.data);
      const concepts = parsed.concepts || parsed.ideas || [];

      return concepts.map((concept: any) => ({
        id: uuidv4(),
        title: concept.title || 'Untitled Concept',
        description: concept.description || '',
        sourceText: concept.sourceText || concept.quote || ''
      }));

    } catch (error: any) {
      console.error('Failed to parse concepts:', error.message);
      throw new Error('Failed to parse concept extraction results');
    }
  }

  private async generateRelationships(nodes: IdeaNode[]): Promise<IdeaEdge[]> {
    if (nodes.length < 2) {
      return [];
    }

    const systemPrompt = `You are an expert at understanding conceptual relationships in academic papers.
Your job is to identify meaningful connections between ideas.`;

    // Create a simplified representation for the LLM
    const conceptsList = nodes.map((node, idx) => 
      `${idx}: "${node.title}" - ${node.description}`
    ).join('\n');
    console.log("Concepts list", conceptsList)
    const userPrompt = `Given these concepts from an academic paper, identify relationships between them.

Concepts:
${conceptsList}

For each relationship, specify:
- from: the index number of the first concept
- to: the index number of the second concept  
- relation: type of relationship (e.g., "builds upon", "contradicts", "applies", "extends", "supports", "requires")

Return ONLY valid JSON in this exact format:
{
  "relationships": [
    {
      "from": 0,
      "to": 3,
      "relation": "builds upon"
    },
    {
      "from": 2,
      "to": 5,
      "relation": "supports"
    }
  ]
}

Focus on the most important relationships (5-12 total). Avoid creating too many connections.`;

    const response = await llmService.runPrompt(userPrompt, systemPrompt);
    
    if (!response.success || !response.data) {
      console.warn('Failed to generate relationships, continuing without them');
      return [];
    }

    try {
      const parsed = await llmService.extractJSON(response.data);
      const relationships = parsed.relationships || parsed.relations || [];

      return relationships
        .filter((rel: any) => {
          const fromIdx = parseInt(rel.from);
          const toIdx = parseInt(rel.to);
          return !isNaN(fromIdx) && 
                 !isNaN(toIdx) && 
                 fromIdx >= 0 && 
                 fromIdx < nodes.length &&
                 toIdx >= 0 && 
                 toIdx < nodes.length &&
                 fromIdx !== toIdx;
        })
        .map((rel: any) => ({
          from: nodes[parseInt(rel.from)].id,
          to: nodes[parseInt(rel.to)].id,
          relation: rel.relation || 'relates to'
        }));

    } catch (error: any) {
      console.error('Failed to parse relationships:', error.message);
      return []; // Continue without relationships rather than failing
    }
  }

  getAnalysis(uploadId: string): PaperAnalysis | undefined {
    return this.analyses.get(uploadId);
  }
}

export const analysisService = new AnalysisService();
