// server/safepay.ts
import { Safepay } from '@sfpy/node-sdk';

const safepay = new Safepay({
  apiKey:        process.env.SAFEPAY_SECRET_KEY || '',
  v1Secret:      process.env.SAFEPAY_SECRET_KEY!,               // ← required by your version
  webhookSecret: process.env.SAFEPAY_WEBHOOK_SECRET || '',      // ← required by your version
  environment:   (process.env.SAFEPAY_ENV || 'sandbox') as any, // ← fixes environment type error
});

export default safepay;