# ⚡ Quick Reference - Hackathon Day

## 🚨 Emergency Commands

### If Something Breaks

```bash
# Kill all node processes
pkill -f node

# Restart backend
cd server
npm run dev

# Restart frontend (new terminal)
cd client
npm run dev

# Check if servers are running
lsof -i :3000  # Frontend
lsof -i :3001  # Backend

# Clear uploads folder
rm -rf server/uploads/*
touch server/uploads/.gitkeep
```

### Quick Smoke Test

```bash
# Test backend
curl http://localhost:3001/api/health

# Should return: {"status":"ok", ...}
```

---

## 📋 Pre-Demo Checklist

**30 Minutes Before:**
- [ ] Both servers running
- [ ] Test upload with sample PDF
- [ ] Verify LLM responses working
- [ ] Clear browser cache
- [ ] Close unnecessary apps (for performance)
- [ ] Charge laptop (or plug in!)
- [ ] Test screen sharing
- [ ] Have backup plan ready

**5 Minutes Before:**
- [ ] Browser at http://localhost:3000
- [ ] Sample PDF file ready on desktop
- [ ] Close extra browser tabs
- [ ] Check internet connection
- [ ] Silence notifications
- [ ] Open dev tools (just in case)

---

## 🎯 Core Files (If You Need to Edit)

### Backend
```
server/src/services/analysis.service.ts  ← LLM prompts
server/src/services/llm.service.ts       ← API configuration
server/src/routes/analyze.ts             ← Main pipeline
```

### Frontend
```
client/src/pages/Upload.tsx              ← Landing page
client/src/pages/Analysis.tsx            ← Main view
client/src/components/IdeaCard.tsx       ← Note cards
client/src/components/Graph.tsx          ← Visualization
```

### Config
```
server/.env                              ← API key
server/src/index.ts                      ← Port settings
client/vite.config.ts                    ← Proxy config
```

---

## 🔧 Common Issues & Fixes

### Issue: "OPENROUTER_API_KEY not set"
**Fix:**
```bash
cd server
cp .env.example .env
# Edit .env and add your key
# Restart server
```

### Issue: Frontend can't reach backend
**Fix:**
```bash
# Check backend is on port 3001
lsof -i :3001

# If not running:
cd server && npm run dev
```

### Issue: Upload fails (file too large)
**Fix:** Edit `server/src/routes/upload.ts`:
```typescript
limits: {
  fileSize: 20 * 1024 * 1024 // Change to 20MB
}
```

### Issue: LLM timeout
**Fix:** Edit `server/src/services/llm.service.ts`:
```typescript
private timeout: number = 120000; // Change to 2 minutes
```

### Issue: No concepts extracted
**Check:**
1. Server logs for LLM response
2. PDF text extraction worked
3. API credits remaining
4. Network connection

### Issue: Graph doesn't render
**Fix:**
```bash
# Reinstall ReactFlow
cd client
npm install reactflow --force
npm run dev
```

---

## 🎤 5-Second Pitch Versions

**Ultra Short:**
> "Active reading app: AI maps the paper, you explain the concepts."

**Elevator (30s):**
> "We built a tool that turns passive paper reading into active learning. Upload a PDF, get AI-extracted concepts and relationships, then you have to write your own explanation for each idea. No summarization—just structured learning."

**Full Pitch (60s):**
> "Research papers are hard to learn from because reading is passive. Most tools make it worse by summarizing papers for you, which means the AI does the thinking. We flipped this: our app uses AI to extract and organize key concepts from a paper, but then forces you to explain each one in your own words. It's the Feynman Technique at scale—if you can't explain it, you don't understand it. Built in 24 hours with React, Node, and Google Gemini."

---

## 📊 Demo Recovery Scenarios

### Scenario 1: Upload Takes Too Long
**Say this:**
> "While we wait, the interesting part is the prompt engineering. Let me show you how we extract concepts..."

**Do this:**
- Switch to VSCode
- Show `analysis.service.ts`
- Explain the prompts
- By then, it should be done

### Scenario 2: API Failure
**Say this:**
> "Looks like we hit the API rate limit! Let me show you a pre-recorded demo..."

**Do this:**
- Switch to backup video
- Or show screenshots
- Focus on explaining the philosophy

### Scenario 3: Server Crash
**Say this:**
> "And this is why error handling matters! The good news is the architecture is simple to restart..."

**Do this:**
- Show the codebase
- Explain the tech stack
- Emphasize learning from failure

---

## 💾 Data for Demo

### Good Test Papers (Short, Clear Structure)
1. "Attention Is All You Need" (Transformers)
2. "BERT" (Language Models)
3. "ResNet" (Computer Vision)
4. "GraphSAGE" (Graph Learning)
5. Any recent 5-10 page arxiv paper

### Where to Get Them
```bash
# Example: Download Attention paper
wget https://arxiv.org/pdf/1706.03762.pdf -O attention.pdf
```

---

## 🎬 Streaming Setup

### OBS/Screen Share Settings
- Resolution: 1920x1080
- FPS: 30 (smooth enough)
- Capture: Browser window only
- Zoom: 125-150% for readability

### Browser Setup
- Full screen browser (F11)
- Hide bookmarks bar
- Clear cache
- One tab only

---

## 🏆 Judge Q&A Prep

**Q: How is this different from ChatGPT?**
> "ChatGPT summarizes. We make you explain. It's the difference between reading a summary and actually learning."

**Q: What if the AI is wrong?**
> "Great question! The student still has to process and explain it themselves, which forces critical thinking. Plus, they can check the source quotes we show."

**Q: Did you use any AI to build this?**
> "For code suggestions, yes. But the architecture, UX decisions, and educational philosophy are all human."

**Q: What's next for this project?**
> "Quiz generation from student notes, spaced repetition reminders, instructor dashboard to review student understanding, and multi-paper comparison."

**Q: How scalable is it?**
> "Current version is stateless—each session is isolated. To scale, we'd add a database for user sessions, use job queues for LLM processing, and implement caching."

---

## 📱 If You're Pitching Remotely

### Video Call Setup
- Good lighting (face the window)
- Camera at eye level
- Headphones (not AirPods, they cut out)
- Wired internet if possible
- Close Slack/Discord/etc
- Test screen share beforehand

### Virtual Demo Tips
- Share just the browser window (not whole screen)
- Talk while things load
- Have slides ready as backup
- Record locally (insurance)

---

## ⏰ Time Management

**You have 5 minutes. Use them wisely:**

| Time | Activity |
|------|----------|
| 0:00-0:30 | Hook + Problem |
| 0:30-1:00 | Upload demo |
| 1:00-2:30 | Processing + UI walkthrough |
| 2:30-4:00 | Fill out a concept card live |
| 4:00-4:30 | Philosophy + impact |
| 4:30-5:00 | Questions |

**Practice with a timer!**

---

## 🎯 What Judges Look For

1. **Problem-Solution Fit**: Does this actually solve a real problem?
2. **Technical Execution**: Does it work? Is the code clean?
3. **Innovation**: What's new here?
4. **Polish**: Does it feel finished?
5. **Presentation**: Can you explain it clearly?

**Our Strengths:**
✅ Clear problem (passive learning)
✅ Novel approach (structure not summary)
✅ Working demo (if everything goes well)
✅ Educational impact (helps students)
✅ Clean architecture (well-structured code)

---

## 🚀 Final Reminders

1. **Breathe.** You've built something cool.
2. **Smile.** Enthusiasm is contagious.
3. **Tell a story.** Not just features—impact.
4. **Show, don't tell.** Live demo beats slides.
5. **Own failures.** If it breaks, explain what you learned.

**You got this! 🎉**

---

## 📞 Emergency Contacts

- Teammate 1: [phone]
- Teammate 2: [phone]
- OpenRouter Support: support@openrouter.ai
- Hackathon Discord: [link]

---

## 🎁 Bonus: If Everything Works Perfectly

### Extra Features to Mention
- TypeScript for type safety
- Error handling with retries
- Progress tracking
- Graph visualization
- Responsive design
- PDF size limits
- Modular architecture

### Future Vision
> "Imagine this in every university. Students don't just read papers—they master them. Instructors can see which concepts students struggle with. Research becomes active, not passive."

**End on a high note! 🚀**
