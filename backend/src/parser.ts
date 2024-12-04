import AdmZip from 'adm-zip';
import cheerio from 'cheerio';
import { Document } from './types';

export const parseZip = async (zipBuffer: Buffer): Promise<Document[]> => {
  const zip = new AdmZip(zipBuffer);
  const zipEntries = zip.getEntries();
  
  const documents: Document[] = [];
  
  for (const entry of zipEntries) {
    if (entry.entryName.endsWith('.html')) {
      const content = entry.getData().toString('utf8');
      const $ = cheerio.load(content);
      
      // Basic extraction - you can enhance this based on your needs
      const title = $('title').text() || entry.name;
      const bodyContent = $('body').text();
      
      documents.push({
        document_id: crypto.randomUUID(),
        title,
        content: bodyContent,
        summary: '', // Will be filled by AI processing
        tags: [], // Will be filled by AI processing
        source_url: '',
        related_documents: null,
        last_edited_time: new Date().toISOString()
      });
    }
  }
  
  return documents;
}; 