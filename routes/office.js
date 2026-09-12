const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { Document, Packer, Paragraph, HeadingLevel } = require('docx');
const ExcelJS = require('exceljs');
const PptxGenJS = require('pptxgenjs');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Generated files yahan save honge, aur server.js unhe download ke liye serve karega
const OUTPUT_DIR = path.join(__dirname, '..', 'generated');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

// Helper: Claude se sirf JSON format me structured content mangwata hai
async function getStructuredContent(instruction, formatHint) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `${instruction}\n\nRespond ONLY with valid JSON, no markdown fences, no extra text. Format: ${formatHint}`
    }]
  });
  const rawText = response.content[0].text.trim();
  const cleaned = rawText.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

// -------- WORD DOCUMENT --------
// POST /api/office/word  { "instruction": "write a project proposal for a food delivery app" }
router.post('/word', async (req, res) => {
  try {
    const { instruction } = req.body;
    if (!instruction) return res.status(400).json({ error: 'instruction is required' });

    // 1. Claude se title + paragraphs mangwao
    const data = await getStructuredContent(
      instruction,
      '{ "title": "string", "paragraphs": ["string", "string", ...] }'
    );

    // 2. Word document banao
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ text: data.title, heading: HeadingLevel.HEADING_1 }),
          ...data.paragraphs.map(p => new Paragraph({ text: p, spacing: { after: 200 } }))
        ]
      }]
    });

    // 3. File save karo
    const fileName = `document-${Date.now()}.docx`;
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(path.join(OUTPUT_DIR, fileName), buffer);

    res.json({ file: `/generated/${fileName}` });
  } catch (error) {
    console.error('Word generation error:', error);
    res.status(500).json({ error: 'Failed to generate Word file', details: error.message });
  }
});

// -------- EXCEL SPREADSHEET --------
// POST /api/office/excel  { "instruction": "make a budget tracker for a college fest with 5 expense categories" }
router.post('/excel', async (req, res) => {
  try {
    const { instruction } = req.body;
    if (!instruction) return res.status(400).json({ error: 'instruction is required' });

    // 1. Claude se headers + rows mangwao
    const data = await getStructuredContent(
      instruction,
      '{ "sheetName": "string", "headers": ["string", ...], "rows": [["value", "value", ...], ...] }'
    );

    // 2. Excel workbook banao
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(data.sheetName || 'Sheet1');
    sheet.addRow(data.headers);
    sheet.getRow(1).font = { bold: true };
    data.rows.forEach(row => sheet.addRow(row));
    sheet.columns.forEach(col => { col.width = 20; });

    // 3. File save karo
    const fileName = `sheet-${Date.now()}.xlsx`;
    await workbook.xlsx.writeFile(path.join(OUTPUT_DIR, fileName));

    res.json({ file: `/generated/${fileName}` });
  } catch (error) {
    console.error('Excel generation error:', error);
    res.status(500).json({ error: 'Failed to generate Excel file', details: error.message });
  }
});

// -------- POWERPOINT PRESENTATION --------
// POST /api/office/ppt  { "instruction": "make a 5 slide pitch deck for a dropshipping business" }
router.post('/ppt', async (req, res) => {
  try {
    const { instruction } = req.body;
    if (!instruction) return res.status(400).json({ error: 'instruction is required' });

    // 1. Claude se slides mangwao
    const data = await getStructuredContent(
      instruction,
      '{ "slides": [{ "title": "string", "bullets": ["string", "string", ...] }, ...] }'
    );

    // 2. PPTX banao
    const pptx = new PptxGenJS();
    data.slides.forEach(slideData => {
      const slide = pptx.addSlide();
      slide.addText(slideData.title, { x: 0.5, y: 0.3, fontSize: 24, bold: true });
      slide.addText(
        slideData.bullets.map(b => ({ text: b, options: { bullet: true, breakLine: true } })),
        { x: 0.5, y: 1.2, fontSize: 16 }
      );
    });

    // 3. File save karo
    const fileName = `slides-${Date.now()}.pptx`;
    await pptx.writeFile({ fileName: path.join(OUTPUT_DIR, fileName) });

    res.json({ file: `/generated/${fileName}` });
  } catch (error) {
    console.error('PPT generation error:', error);
    res.status(500).json({ error: 'Failed to generate PPT file', details: error.message });
  }
});

module.exports = router;
