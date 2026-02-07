# 🎯 Prompt Engineering Guide

## Current Prompts & Optimization Tips

This guide helps you tune the LLM prompts in `server/src/services/analysis.service.ts` for better results.

---

## Prompt 1: Concept Extraction

### Current Version
```typescript
const systemPrompt = `You are an expert at analyzing academic papers and extracting key concepts.
Your job is to identify the most important ideas, methods, claims, and results.`;

const userPrompt = `Analyze this academic paper and extract 10-15 key concepts.

For each concept, provide:
- A concise title (2-6 words)
- A clear description (1-2 sentences)
- A relevant quote or paraphrase from the paper

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
```

### What Works Well
✅ Clear output format (JSON schema)
✅ Concrete examples in prompt
✅ Specific constraints (10-15, 2-6 words, 1-2 sentences)
✅ Asks for source quotes (attribution)

### Common Issues & Fixes

#### Issue: Too Many Generic Concepts
**Symptom:** Concepts like "Introduction", "Background", "Methodology"

**Fix:** Add this to systemPrompt:
```typescript
Avoid generic section headers. Focus on substantive intellectual contributions:
- Novel methods or techniques
- Key claims or findings  
- Important theoretical constructs
- Specific algorithms or models
```

#### Issue: Too Technical or Too Simple
**Symptom:** Concepts that are either jargon-heavy or too dumbed down

**Fix:** Add to userPrompt:
```typescript
Target explanation level: Smart undergraduate who hasn't read this specific paper.
Use technical terms when necessary, but define them.
```

#### Issue: Inconsistent JSON Format
**Symptom:** LLM returns markdown, explanations, or malformed JSON

**Fix:** Make format requirements even more explicit:
```typescript
CRITICAL: Your response must be ONLY the JSON object.
No markdown code blocks (```json), no preamble, no explanation.
Start with { and end with }
```

### Advanced: Few-Shot Examples

For better quality, add 1-2 examples to the prompt:

```typescript
Example of a good concept:
{
  "title": "Multi-Head Self-Attention",
  "description": "A mechanism that allows the model to jointly attend to information from different representation subspaces, enabling it to capture multiple types of relationships.",
  "sourceText": "Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions."
}

Example of a bad concept (too generic):
{
  "title": "Introduction",
  "description": "The paper introduces the topic.",
  "sourceText": "In this paper, we introduce..."
}

Now extract concepts from this paper:
${text}
```

---

## Prompt 2: Relationship Generation

### Current Version
```typescript
const systemPrompt = `You are an expert at understanding conceptual relationships in academic papers.
Your job is to identify meaningful connections between ideas.`;

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
    }
  ]
}

Focus on the most important relationships (5-12 total). Avoid creating too many connections.`;
```

### What Works Well
✅ Uses concept indices (easier than IDs for LLM)
✅ Provides example relation types
✅ Limits scope (5-12 relationships)

### Common Issues & Fixes

#### Issue: Too Many Obvious/Weak Connections
**Symptom:** Everything relates to everything, low signal-to-noise

**Fix:** Add selectivity criteria:
```typescript
Only include relationships that are:
1. Direct and specific (not vague)
2. Intellectually meaningful (not just "both mentioned in paper")
3. Non-obvious (not just sequential concepts)

Good: "Multi-head attention" → "Positional encoding" (relation: "requires")
Bad: "Introduction" → "Conclusion" (relation: "mentioned after")
```

#### Issue: Unclear Relation Types
**Symptom:** Vague relations like "relates to", "connected to"

**Fix:** Provide a taxonomy:
```typescript
Use ONLY these relation types:
- "builds upon" - B extends or improves A
- "requires" - B needs A as a prerequisite
- "contradicts" - B challenges or refutes A
- "applies" - B is a concrete use case of A
- "supports" - B provides evidence for A
- "enables" - A makes B possible
- "compares with" - A and B are alternatives
```

#### Issue: Wrong Directionality
**Symptom:** Edge points the wrong way (e.g., "output" → "input")

**Fix:** Add direction guidance:
```typescript
Direction matters! 
"from" should be the prerequisite/foundation/cause
"to" should be the dependent/derivative/effect

Example: 
Correct: "Self-Attention" (from) → "Transformer Architecture" (to) [builds upon]
Wrong: "Transformer Architecture" (from) → "Self-Attention" (to)
```

### Advanced: Graph Quality

To get a more balanced graph structure:

```typescript
Aim for a well-connected but not overcrowded graph:
- Each concept should have 1-3 connections on average
- Avoid chains (A→B→C→D...) - include some cross-links
- Identify 2-3 "hub" concepts that many others relate to
- Ensure no isolated nodes (unless truly independent)
```

---

## Testing Your Prompts

### Method 1: Direct Testing
Add a test endpoint in `server/src/routes/analyze.ts`:

```typescript
router.post('/test-prompt', async (req, res) => {
  const { text } = req.body;
  const nodes = await analysisService.extractConcepts(text);
  res.json({ nodes });
});
```

Then test with curl:
```bash
curl -X POST http://localhost:3001/api/test-prompt \
  -H "Content-Type: application/json" \
  -d '{"text": "Your test paper text here..."}'
```

### Method 2: A/B Testing
Create two versions of a prompt and compare outputs:

```typescript
// Version A: current
// Version B: with your modifications

// Test on 3-5 different papers
// Evaluate which gives better results
```

### Evaluation Criteria
Rate each output on:
- ✅ **Relevance** (are these the key concepts?)
- ✅ **Clarity** (would a student understand?)
- ✅ **Coverage** (do they span the whole paper?)
- ✅ **Balance** (not too technical, not too simple)
- ✅ **Format** (valid JSON, no hallucinations)

---

## Model-Specific Tips

### Google Gemini (Current)
- ✅ Great at following JSON schemas
- ✅ Good instruction following
- ⚠️ Can be overly cautious (might refuse edge cases)
- 💡 Tip: Be very explicit about format

### If You Switch to Claude
- ✅ Excellent at nuanced relationships
- ✅ Strong reasoning about academic content
- ⚠️ More expensive
- 💡 Tip: Can handle more complex prompts

### If You Switch to GPT-4
- ✅ Consistent JSON output
- ✅ Good at following constraints
- ⚠️ Can be verbose
- 💡 Tip: Use temperature=0.3 for consistency

---

## Prompt Iteration Workflow

1. **Identify Issue**
   - Run app with test paper
   - Note what's wrong with output

2. **Hypothesize Fix**
   - Add constraint, example, or instruction
   - Keep changes small

3. **Test**
   - Run same paper again
   - Check if issue is fixed

4. **Compare**
   - Does new version improve quality?
   - Does it break anything else?

5. **Commit or Revert**
   - Keep if better overall
   - Document what you changed

---

## Advanced: Chained Prompts

For even better results, break extraction into stages:

### Stage 1: Extract Raw Concepts (quantity)
```typescript
"List every concept, method, claim, and result mentioned in this paper.
Don't filter yet - just extract everything."
```

### Stage 2: Filter & Rank (quality)
```typescript
"Given these 30 concepts, select the 10-15 most important.
Prioritize novel contributions over standard background."
```

### Stage 3: Polish Descriptions
```typescript
"For each concept, write a clear 1-2 sentence explanation 
suitable for someone who hasn't read the paper."
```

This uses more tokens but can produce higher quality output.

---

## Debugging Checklist

When prompts aren't working:

- [ ] Check LLM response in server logs
- [ ] Verify JSON parsing isn't silently failing
- [ ] Test with a simpler, shorter paper
- [ ] Try the prompt directly in OpenRouter playground
- [ ] Check if API rate limits are hit
- [ ] Validate that extracted text is reasonable quality

---

## Quick Fixes Reference

| Problem | Solution |
|---------|----------|
| Too many concepts | Add "limit to X most important" |
| Too few concepts | Lower bar: "X-Y concepts" range |
| Generic concepts | "Avoid section headers, focus on ideas" |
| JSON errors | "Return ONLY JSON, no markdown" |
| Wrong format | Add explicit example in prompt |
| Hallucinations | "Only use info from the paper text" |
| Too technical | "Explain for smart undergrad" |
| Too simple | "Use precise technical terms" |
| Vague relations | Provide relation taxonomy |
| Too many edges | "5-12 most important relationships" |
| Wrong direction | Explain edge semantics clearly |

---

## Further Reading

- [OpenAI Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [Anthropic Prompt Guide](https://docs.anthropic.com/claude/docs/introduction-to-prompt-design)
- [Prompt Engineering Tutorial (Coursera)](https://www.coursera.org/learn/prompt-engineering)

---

**Remember:** Prompts are code. Version control them, test them, iterate on them.

Good luck! 🚀
