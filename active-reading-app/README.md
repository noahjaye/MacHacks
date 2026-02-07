# 📚 Active Reading App

**AI organizes the paper; you do the understanding.**

A hackathon project that transforms passive paper reading into active learning. Upload an academic PDF, get AI-extracted concepts, then write your own understanding of each idea.

---

## 🎯 Core Philosophy

Instead of AI summarizing papers for you (passive consumption), this tool:
1. **Extracts** key concepts from the paper
2. **Maps** relationships between ideas  
3. **Forces** you to explain each concept in your own words
4. **Visualizes** the knowledge graph

You learn by writing, not by reading summaries.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenRouter API key (free tier available at https://openrouter.ai)

### Installation

1. **Clone and setup:**
```bash
cd active-reading-app

# Install server dependencies
cd server
npm install

# Install client dependencies  
cd ../client
npm install
```

2. **Configure API key:**
```bash
cd server
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY
```

3. **Run both servers:**

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
cd client
npm run dev
```

4. **Open browser:**
```
http://localhost:3000
```

---

## 🎬 Demo Flow

### For Presentation

1. **Upload Phase** (10 seconds)
   - Show the clean upload interface
   - Drop a sample PDF (have one ready!)
   - Click "Upload & Analyze"

2. **Processing** (30-60 seconds)
   - Mention what's happening:
     * PDF → text extraction
     * LLM identifies concepts
     * LLM generates relationships
   - This is a good time to explain the philosophy

3. **Analysis View** (demo the main features)
   - **Concept Graph**: Interactive visualization
     * Click nodes to highlight cards
     * Show relationships between ideas
   - **Idea Cards**: Show the pedagogical core
     * AI description (gray box)
     * Empty text box requiring YOUR explanation
     * Red border → not complete
     * Green border → you've written something
   - **Progress Bar**: Shows completion status

4. **The Key Moment** (this is your narrative hook)
   - Fill out 2-3 concept cards live
   - Show how you have to think and write
   - Point out: "The AI didn't do my learning for me"

5. **Completion** (if time permits)
   - Show progress going to 100%
   - Green success message appears

---

## 📂 Project Structure

```
active-reading-app/
├── server/
│   ├── src/
│   │   ├── index.ts              # Express app
│   │   ├── routes/
│   │   │   ├── upload.ts         # PDF upload endpoint
│   │   │   ├── analyze.ts        # Main analysis pipeline
│   │   │   └── health.ts         # Health check
│   │   ├── services/
│   │   │   ├── pdf.service.ts    # PDF text extraction
│   │   │   ├── llm.service.ts    # OpenRouter/Gemini integration
│   │   │   └── analysis.service.ts # Concept extraction logic
│   │   └── types/
│   │       └── index.ts          # TypeScript interfaces
│   └── uploads/                  # Temporary PDF storage
│
└── client/
    ├── src/
    │   ├── App.tsx               # Router setup
    │   ├── pages/
    │   │   ├── Upload.tsx        # Landing page
    │   │   └── Analysis.tsx      # Main analysis view
    │   ├── components/
    │   │   ├── IdeaCard.tsx      # Note-taking card
    │   │   └── Graph.tsx         # React Flow visualization
    │   └── api/
    │       └── client.ts         # Backend API calls
    └── index.html
```

---

## 🔧 Tech Stack

### Backend
- **Node.js + Express** - REST API
- **TypeScript** - Type safety
- **pdf-parse** - PDF text extraction
- **OpenRouter** - LLM gateway (uses Google Gemini)
- **multer** - File upload handling

### Frontend  
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **React Router** - Client-side routing
- **ReactFlow** - Graph visualization
- **Axios** - HTTP client

---

## 🎨 Key Features

### ✅ Implemented
- [x] PDF upload with validation
- [x] Text extraction from PDFs
- [x] LLM-powered concept extraction
- [x] Relationship mapping between concepts
- [x] Interactive graph visualization
- [x] Note-taking cards with validation
- [x] Progress tracking
- [x] Responsive design

### 🚧 Future Extensions (if time)
- [ ] Export notes as Markdown
- [ ] Save/load sessions (localStorage)
- [ ] Quiz generation from concepts
- [ ] Multi-paper comparison
- [ ] Spaced repetition reminders

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if uploads directory exists
cd server
mkdir -p uploads

# Verify .env file
cat .env
# Should show: OPENROUTER_API_KEY=sk-...
```

### Frontend can't reach backend
- Backend must be running on port 3001
- Check `vite.config.ts` proxy settings
- CORS is enabled by default

### LLM requests failing
- Verify API key is valid
- Check OpenRouter dashboard for credits
- Look at server console for detailed errors

### PDF upload fails
- File must be < 10MB
- Must be valid PDF (not scanned image)
- Check server logs for extraction errors

---

## 💡 Demo Tips

### Best Sample Papers
- Short papers (5-10 pages) work best
- Papers with clear structure (intro, methods, results)
- Well-known papers (audience might recognize them)
- Avoid: Dense math, pure theory, scanned PDFs

### Good Demo Papers to Try
- "Attention Is All You Need" (Transformers)
- "BERT: Pre-training of Deep Bidirectional Transformers"  
- "Graph Neural Networks: A Review of Methods and Applications"
- Any recent arxiv paper in ML/AI

### Presentation Script

**Opening** (30 sec):
> "How many of you have read an academic paper and forgotten everything the next day? 
> That's because reading is passive. This tool forces you to actively engage."

**Demo** (2 min):
> [Upload paper]
> "I'm uploading a paper on graph neural networks. The AI will extract key concepts..."
> [While processing]
> "...but it WON'T summarize it for me. Instead, it'll give me a structure to fill in myself."
> [Show results]
> "See these empty boxes? I have to write my own explanation. The AI organized it, but I do the learning."

**Close** (30 sec):
> "This is active reading. You can't bullshit your way through - if you can't explain a concept, 
> you don't understand it yet. And that's the point."

---

## 📊 LLM Prompts

Located in `server/src/services/analysis.service.ts`:

### Concept Extraction Prompt
```
Analyze this academic paper and extract 10-15 key concepts.
For each: title (2-6 words), description (1-2 sentences), relevant quote.
Return JSON only.
```

### Relationship Generation Prompt  
```
Given these concepts, identify relationships between them.
For each: from (index), to (index), relation (type).
Focus on 5-12 most important connections.
```

You can tune these prompts for better results!

---

## 🤝 Team Division (if 3 people)

- **Person 1** (you): Backend + LLM pipeline + API
- **Person 2**: React UI + components + styling  
- **Person 3**: Demo prep + testing + presentation slides

---

## ⏱️ Time Budget Breakdown

| Phase | Time | Status |
|-------|------|--------|
| Setup | 1h | ✅ Done |
| Upload flow | 1h | ✅ Done |
| PDF parsing | 1h | ✅ Done |
| LLM integration | 2h | ✅ Done |
| Concept extraction | 2h | ✅ Done |
| Relationships | 1h | ✅ Done |
| Frontend UI | 3h | ✅ Done |
| Graph viz | 2h | ✅ Done |
| Polish & bugs | 2h | 🎯 You are here |
| Demo prep | 1h | ⏳ Next |

**Total:** ~16 hours (leaves buffer for unexpected issues)

---

## 🎓 Educational Value

This project teaches:
- The importance of **active learning** over passive consumption
- How to **structure complex information** (concept mapping)
- The **Feynman technique** (if you can't explain it simply, you don't understand it)
- How to use AI as a **tool for organization** rather than a crutch for thinking

---

## 📝 License

Built for educational purposes at [Your Hackathon Name].
Free to use, modify, and extend.

---

## 🙏 Acknowledgments

- OpenRouter for LLM access
- ReactFlow for graph visualization
- pdf-parse for PDF extraction

---

**Questions?** Check the code comments or raise an issue.

**Good luck with your demo! 🚀**
