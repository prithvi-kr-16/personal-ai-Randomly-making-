const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// POST /api/dropship/ideas   { "niche": "home fitness accessories" }
// Web search tool use karta hai taaki trending/current product ideas mil sakein.
router.post('/ideas', async (req, res) => {
  try {
    const { niche } = req.body;
    if (!niche) return res.status(400).json({ error: 'niche is required' });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `Find 5 currently trending dropshipping product ideas in the niche: "${niche}". For each, give: product name, why it's trending, estimated cost range, and target audience.`
      }],
      tools: [{ type: 'web_search_20250305', name: 'web_search' }]
    });

    const ideas = response.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n');

    res.json({ niche, ideas });
  } catch (error) {
    console.error('Dropship ideas error:', error);
    res.status(500).json({ error: 'Failed to generate product ideas', details: error.message });
  }
});

// POST /api/dropship/listing   { "productName": "resistance bands set", "features": ["5 resistance levels", "portable pouch"] }
router.post('/listing', async (req, res) => {
  try {
    const { productName, features } = req.body;
    if (!productName) return res.status(400).json({ error: 'productName is required' });

    const featureText = (features || []).join(', ');

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Write a compelling e-commerce product listing for "${productName}" with these features: ${featureText}. Include: catchy title, short description, bullet points for features/benefits, and 5 relevant SEO keywords.`
      }]
    });

    res.json({ listing: response.content[0].text });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate listing', details: error.message });
  }
});

module.exports = router;
