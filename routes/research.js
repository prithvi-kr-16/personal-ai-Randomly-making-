const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const Topic = require('../models/Topic');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// POST /api/research/learn   { "topic": "latest trends in dropshipping 2026" }
// Claude ko web_search tool ke saath call karte hain taaki current/real info mile,
// phir summary DB me save kar dete hain - taaki dobara pucho to yaad rahe.
router.post('/learn', async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: 'topic is required' });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `Research this topic and give me a clear, well organized summary I can use later: "${topic}"`
      }],
      tools: [{ type: 'web_search_20250305', name: 'web_search' }]
    });

    // Response me multiple content blocks ho sakte hain (text + tool use) - sirf text jodo
    const summary = response.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n');

    // Memory me save karo
    const saved = await Topic.create({ topic, summary });

    res.json({ topic: saved.topic, summary: saved.summary });
  } catch (error) {
    console.error('Research error:', error);
    res.status(500).json({ error: 'Failed to research topic', details: error.message });
  }
});

// GET /api/research/topics   -> ab tak jo bhi topics "seekhe" gaye hain unki list
router.get('/topics', async (req, res) => {
  try {
    const topics = await Topic.find().sort({ createdAt: -1 });
    res.json(topics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch topics', details: error.message });
  }
});

module.exports = router;
