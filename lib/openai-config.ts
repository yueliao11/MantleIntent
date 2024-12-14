import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  console.warn('警告: OPENAI_API_KEY 未设置');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'default_key',
  baseURL: 'https://api.lingyiwanwu.com/v1',
}); 