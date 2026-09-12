const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const Message = require('../models/Message');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// POST /api/chat
// Body: { "message": "your instruction here" }
router.post('/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ error: 'message field is required' });
    }

    // 1. Purana context DB se nikalo (last 10 messages) - ye hi "memory" hai
    const history = await Message.find().sort({ createdAt: -1 }).limit(10);
    const orderedHistory = history.reverse(); // oldest first

    // 2. Claude API ke liye messages format banao
    const apiMessages = orderedHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    apiMessages.push({ role: 'user', content: userMessage });

    // 3. Claude API call karo
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: apiMessages
    });

    const aiReply = response.content[0].text;

    // 4. Dono messages (user + AI) DB me save karo -> ye future context ke liye kaam aayega
    await Message.create({ role: 'user', content: userMessage });
    await Message.create({ role: 'assistant', content: aiReply });

    // 5. Reply wapas bhejo
    res.json({ reply: aiReply });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Something went wrong', details: error.message });
  }
});

module.exports = router;
