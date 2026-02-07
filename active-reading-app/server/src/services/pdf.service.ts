import pdf from 'pdf-parse';
import fs from 'fs/promises';
import path from 'path';

export class PDFService {
  private uploadsDir: string;

  constructor() {
    this.uploadsDir = path.join(__dirname, '../../uploads');
  }

  async extractText(filePath: string): Promise<string> {
    try {
      console.log('📄 Reading PDF:', filePath);
      
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdf(dataBuffer);
      
      let text = data.text;
      
      // Basic cleanup
      text = text
        .replace(/\s+/g, ' ')           // Normalize whitespace
        .replace(/\n{3,}/g, '\n\n')     // Remove excessive newlines
        .trim();

      console.log(`✅ Extracted ${text.length} characters from PDF`);
      
      // Limit to ~15k tokens worth of text (~60k chars) to avoid API limits
      const MAX_CHARS = 60000;
      if (text.length > MAX_CHARS) {
        console.log(`⚠️  Truncating text from ${text.length} to ${MAX_CHARS} chars`);
        text = text.substring(0, MAX_CHARS) + '\n\n[... truncated for length ...]';
      }

      return text;

    } catch (error: any) {
      console.error('❌ PDF extraction error:', error.message);
      throw new Error(`Failed to extract PDF: ${error.message}`);
    }
  }

  async getFilePath(uploadId: string): Promise<string> {
    const files = await fs.readdir(this.uploadsDir);
    const file = files.find(f => f.startsWith(uploadId));
    
    if (!file) {
      throw new Error('Upload not found');
    }
    
    return path.join(this.uploadsDir, file);
  }

  async cleanup(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      console.log('🗑️  Cleaned up:', filePath);
    } catch (error) {
      console.error('Failed to cleanup file:', error);
    }
  }
}

export const pdfService = new PDFService();
