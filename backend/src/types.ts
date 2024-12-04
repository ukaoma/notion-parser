export interface Document {
  document_id: string;
  title: string;
  content: string;
  summary: string;
  tags: string[];
  source_url: string;
  related_documents: null;
  last_edited_time: string;
}

export interface ParsedData {
  documents: Document[];
} 