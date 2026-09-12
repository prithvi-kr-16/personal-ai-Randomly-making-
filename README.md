# My Personal AI (Jarvis-style Assistant)

Ek Node.js + MongoDB + Claude API powered personal assistant jo 5 cheezein karta hai:

1. **Chat** — general instructions samajhta hai, memory ke saath
2. **Office** — Word / Excel / PPT files generate karta hai
3. **Research** — kisi bhi topic ko web search karke "seekh" leta hai aur yaad rakhta hai
4. **Freelance** — proposals, invoices, client emails likhta hai
5. **Dropship** — trending product ideas dhundta hai aur listing descriptions likhta hai

Sab ek hi browser UI me tabs ke through use ho sakta hai.

## Setup Steps

1. **Node.js install karo** (agar nahi hai): https://nodejs.org

2. **Dependencies install karo:**

   ```
   npm install
   ```

3. **MongoDB setup:**
   - Local MongoDB install karo, YA
   - MongoDB Atlas (free tier): https://www.mongodb.com/cloud/atlas
   - Connection string copy kar lo

4. **.env file banao:**
   - `.env.example` ko copy karke `.env` naam do
   - `ANTHROPIC_API_KEY` daalo (console.anthropic.com se milega)
   - `MONGODB_URI` daalo

5. **Server start karo:**

   ```
   npm start
   ```

6. Browser me kholo: **http://localhost:3000**

## Project Structure

```
ai-brain/
├── server.js              # Main entry, sab routes yahan jud'te hain
├── models/
│   ├── Message.js         # Chat memory (MongoDB schema)
│   └── Topic.js           # Researched/learned topics (MongoDB schema)
├── routes/
│   ├── chat.js             # Core brain - chat + memory
│   ├── office.js           # Word/Excel/PPT generator
│   ├── research.js         # Web search + "learn a topic"
│   ├── freelance.js        # Proposal/invoice/email generator
│   └── dropship.js         # Product ideas + listing generator
└── public/
    └── index.html          # Tabbed browser UI for all modules
```

## Module Guide + API Testing

### 1. Chat (`/api/chat`)

```
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "give me 3 startup ideas for a college hackathon"}'
```

### 2. Office (`/api/office/word` | `/excel` | `/ppt`)

```
curl -X POST http://localhost:3000/api/office/ppt \
  -H "Content-Type: application/json" \
  -d '{"instruction": "make a 5 slide pitch deck for a dropshipping business"}'
```

Response: `{ "file": "/generated/xxxx.pptx" }` — is URL ko browser me kholo, download ho jayegi.

### 3. Research (`/api/research/learn`, `/api/research/topics`)

```
curl -X POST http://localhost:3000/api/research/learn \
  -H "Content-Type: application/json" \
  -d '{"topic": "latest trends in AI dropshipping 2026"}'

curl http://localhost:3000/api/research/topics
```

### 4. Freelance (`/api/freelance/proposal` | `/invoice` | `/email`)

```
curl -X POST http://localhost:3000/api/freelance/proposal \
  -H "Content-Type: application/json" \
  -d '{"clientBrief": "client wants a logo and brand kit for a bakery"}'

curl -X POST http://localhost:3000/api/freelance/invoice \
  -H "Content-Type: application/json" \
  -d '{"clientName": "ABC Corp", "items": [{"description":"Logo design","amount":150}], "currency":"INR"}'

curl -X POST http://localhost:3000/api/freelance/email \
  -H "Content-Type: application/json" \
  -d '{"context": "following up on unpaid invoice from 2 weeks ago", "tone": "polite but firm"}'
```

### 5. Dropship (`/api/dropship/ideas`, `/api/dropship/listing`)

```
curl -X POST http://localhost:3000/api/dropship/ideas \
  -H "Content-Type: application/json" \
  -d '{"niche": "home fitness accessories"}'

curl -X POST http://localhost:3000/api/dropship/listing \
  -H "Content-Type: application/json" \
  -d '{"productName": "resistance bands set", "features": ["5 resistance levels","portable pouch"]}'
```

## How It All Fits Together

- **Brain**: Claude API (`@anthropic-ai/sdk`) har module me use hota hai for reasoning/text generation
- **Memory**: MongoDB — chat history (`Message`) aur learned topics (`Topic`) store karta hai
- **Real-time knowledge**: Research aur Dropship modules Claude ke built-in `web_search` tool se current info laate hain
- **File generation**: `docx`, `exceljs`, `pptxgenjs` libraries se real Office files banti hain

## Ideas to Extend Further

- WhatsApp/Telegram bot interface (taaki phone se "live" access mile)
- Voice input/output (speech-to-text + text-to-speech) for actual Jarvis feel
- Scheduled tasks (e.g. daily reminder emails, auto product research runs) using `node-cron`
- User authentication if multiple people will use it
- A dashboard to browse all generated files and saved research topics

## Notes

- `ANTHROPIC_API_KEY` kabhi bhi frontend code ya GitHub par public repo me mat daalna — sirf `.env` me rakho, aur `.env` ko `.gitignore` me add karna mat bhoolna.
- Ye ek learning/portfolio project hai — agar hackathon me submit kar rahe ho, to team ke members alag-alag modules (office/research/freelance/dropship) ko apna-apna "part" bana ke present kar sakte hain.
