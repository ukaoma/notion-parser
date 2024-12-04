import dotenv from 'dotenv';
dotenv.config();

export const config = {
  openaiApiKey: process.env.OPENAI_API_KEY,
  maxFileSize: 1024 * 1024 * 1024, // 1GB
  allowedFileTypes: ['application/zip'],
  port: parseInt(process.env.PORT || '3001'),
}; 