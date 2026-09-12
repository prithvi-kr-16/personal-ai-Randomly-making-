const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Chhota helper - ek prompt ke saath Claude ko call karke plain text answer leta hai
async function askClaude(prompt) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }]
  });
  return response.content[0].text;
}

// POST /api/freelance/proposal   { "clientBrief": "client wants a logo + brand kit for a bakery" }
router.post('/proposal', async (req, res) => {
  try {
    const { clientBrief } = req.body;
    if (!clientBrief) return res.status(400).json({ error: 'clientBrief is required' });

    const text = await askClaude(
      `Write a professional freelance project proposal based on this client brief: "${clientBrief}". Include: project understanding, scope of work, timeline, and pricing structure (use placeholder amounts I can edit).`
    );
    res.json({ proposal: text });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate proposal', details: error.message });
  }
});

// POST /api/freelance/invoice   { "clientName": "ABC Corp", "items": [{"description":"Logo design","amount":150}], "currency": "INR" }
router.post('/invoice', async (req, res) => {
  try {
    const { clientName, items, currency } = req.body;
    if (!clientName || !items) return res.status(400).json({ error: 'clientName and items are required' });

    const total = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const itemLines = items.map(i => `- ${i.description}: ${currency || ''} ${i.amount}`).join('\n');

    const text = await askClaude(
      `Format this into a clean, professional invoice text (plain text, ready to send):\nClient: ${clientName}\nItems:\n${itemLines}\nTotal: ${currency || ''} ${total}\nInclude invoice number placeholder, date, and a polite payment note.`
    );
    res.json({ invoice: text, total });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate invoice', details: error.message });
  }
});

// POST /api/freelance/email   { "context": "following up on unpaid invoice from 2 weeks ago", "tone": "polite but firm" }
router.post('/email', async (req, res) => {
  try {
    const { context, tone } = req.body;
    if (!context) return res.status(400).json({ error: 'context is required' });

    const text = await askClaude(
      `Write a client email for this situation: "${context}". Tone: ${tone || 'professional and friendly'}. Include a subject line.`
    );
    res.json({ email: text });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate email', details: error.message });
  }
});

module.exports = router;
