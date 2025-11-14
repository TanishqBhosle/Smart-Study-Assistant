const express = require('express');
const router = express.Router();
const wiki = require('../lib/wiki');
const AI = require('../lib/ai');

router.get('/', async (req, res) => {
  const topic = (req.query.topic || '').trim();
  const mode = (req.query.mode || '').trim().toLowerCase()

  if (!topic) return res.status(400).json({ status: 'error', error: 'Missing topic parameter' });

  try {
    const page = await wiki.fetchExtract(topic);
    if (!page || !page.extract) {
      return res.status(404).json({ status: 'error', error: `No wiki content found for '${topic}'` });
    }

    // Compose prompt payload for AI wrapper
    const promptPayload = {
      topic,
      wikiExtract: page.extract,
      mode
    };

    const ai = AI();
    const aiRes = await ai.generateLesson(promptPayload);

    return res.json({ status: 'ok', data: { topic, source: page.content_urls?.desktop?.page || null, ...aiRes } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', error: 'Internal server error' });
  }
});

module.exports = router;