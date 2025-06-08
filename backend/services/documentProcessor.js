import fs from 'fs-extra';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import pdf2pic from 'pdf2pic';
import { v4 as uuidv4 } from 'uuid';

export class DocumentProcessor {
  constructor(tempDir) {
    this.tempDir = tempDir;
  }

  async processDocument(filePath, fileInfo) {
    const result = {
      id: fileInfo.id,
      originalName: fileInfo.originalName,
      type: fileInfo.type,
      mimetype: fileInfo.mimetype,
      size: fileInfo.size,
      images: [],
      text: '',
      metadata: {}
    };

    try {
      if (fileInfo.mimetype === 'application/pdf') {
        result.images = await this.processPDF(filePath, fileInfo.id);
        result.metadata.pageCount = result.images.length;
      } else {
        // For non-PDF files, we'll handle them differently
        result.text = await this.extractTextFromFile(filePath, fileInfo.mimetype);
      }

      return result;
    } catch (error) {
      console.error(`Error processing document ${fileInfo.originalName}:`, error);
      throw new Error(`Failed to process ${fileInfo.originalName}: ${error.message}`);
    }
  }

  async processPDF(filePath, documentId) {
    try {
      // First, check if PDF is encrypted and handle it
      const pdfBuffer = await fs.readFile(filePath);
      let processedPdfPath = filePath;

      try {
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        // If we can load it without error, it's not encrypted or password is empty
      } catch (error) {
        if (error.message.includes('encrypted') || error.message.includes('password')) {
          console.log('PDF is encrypted, attempting to handle...');
          processedPdfPath = await this.handleEncryptedPDF(filePath, documentId);
        } else {
          throw error;
        }
      }

      // Convert PDF to images using pdf2pic
      const outputDir = path.join(this.tempDir, documentId);
      await fs.ensureDir(outputDir);

      const convert = pdf2pic.fromPath(processedPdfPath, {
        density: 200, // DPI
        saveFilename: "page",
        savePath: outputDir,
        format: "png",
        width: 1200,
        height: 1600
      });

      // Use bulk conversion for better performance
      const results = await convert.bulk(-1, { responseType: "image" });
      
      const imagePaths = results.map(result => result.path);
      
      console.log(`Converted PDF to ${imagePaths.length} images`);
      return imagePaths;

    } catch (error) {
      console.error('PDF processing error:', error);
      throw new Error(`Failed to process PDF: ${error.message}`);
    }
  }

  async handleEncryptedPDF(filePath, documentId) {
    try {
      // Try common passwords first
      const commonPasswords = ['', 'password', '123456', 'admin', 'user'];
      
      for (const password of commonPasswords) {
        try {
          const pdfBuffer = await fs.readFile(filePath);
          const pdfDoc = await PDFDocument.load(pdfBuffer, { password });
          
          // If successful, create a new unencrypted PDF
          const unencryptedPdfBytes = await pdfDoc.save();
          const unencryptedPath = path.join(this.tempDir, `${documentId}_unencrypted.pdf`);
          await fs.writeFile(unencryptedPath, unencryptedPdfBytes);
          
          console.log(`Successfully decrypted PDF with password: "${password}"`);
          return unencryptedPath;
        } catch (error) {
          // Continue to next password
          continue;
        }
      }
      
      throw new Error('Could not decrypt PDF - password protected');
    } catch (error) {
      console.error('Encrypted PDF handling error:', error);
      throw error;
    }
  }

  async extractTextFromFile(filePath, mimetype) {
    // For non-PDF files, we'll return basic file info
    // In a production environment, you might want to use libraries like:
    // - mammoth for .docx files
    // - xlsx for Excel files
    // - csv-parser for CSV files
    
    const stats = await fs.stat(filePath);
    return `File: ${path.basename(filePath)}, Size: ${stats.size} bytes, Type: ${mimetype}`;
  }

  async cleanup(documentId) {
    try {
      const outputDir = path.join(this.tempDir, documentId);
      await fs.remove(outputDir);
      
      // Also remove any unencrypted PDF files
      const unencryptedPath = path.join(this.tempDir, `${documentId}_unencrypted.pdf`);
      await fs.remove(unencryptedPath).catch(() => {});
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
}