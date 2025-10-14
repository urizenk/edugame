import { Router } from 'express';
import { recognizeSpeech } from '../services/baiduSpeech';

const router = Router();

router.post('/recognize', async (req, res, next) => {
  const { audioBase64, sampleRate = 16000, format = 'wav' } = req.body ?? {};

  if (!audioBase64 || typeof audioBase64 !== 'string') {
    return res.status(400).json({ message: '缺少有效的音频数据。' });
  }

  try {
    const result = await recognizeSpeech({
      audioBase64,
      sampleRate,
      format
    });

    return res.json({
      text: result.text,
      alternatives: result.raw,
      requestId: result.requestId
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
