export class CreditAnalyzer {
  constructor(ollamaService) {
    this.ollamaService = ollamaService;
  }

  async analyzeDocuments(processedDocuments, progressCallback) {
    try {
      // Check if Ollama model is available
      const modelAvailable = await this.ollamaService.isModelAvailable();
      if (!modelAvailable) {
        progressCallback('analysis', 75, 'Downloading AI model (this may take a few minutes)...');
        await this.ollamaService.pullModel();
      }

      progressCallback('analysis', 80, 'Extracting financial data from documents...');

      // Extract financial data from each document
      const extractedData = [];
      let docIndex = 0;

      for (const doc of processedDocuments) {
        docIndex++;
        const progressBase = 80 + (docIndex / processedDocuments.length) * 15; // 15% for extraction
        
        progressCallback('analysis', progressBase, `Analyzing ${doc.originalName}...`);

        try {
          const documentAnalysis = await this.analyzeDocument(doc);
          extractedData.push({
            ...documentAnalysis,
            documentId: doc.id,
            documentName: doc.originalName,
            documentType: doc.type
          });
        } catch (error) {
          console.error(`Error analyzing document ${doc.originalName}:`, error);
          extractedData.push({
            documentId: doc.id,
            documentName: doc.originalName,
            documentType: doc.type,
            error: error.message,
            extractedInfo: 'Failed to analyze document'
          });
        }
      }

      progressCallback('analysis', 95, 'Generating credit recommendation...');

      // Generate final credit analysis
      const documentTypes = processedDocuments.map(doc => doc.type);
      const creditAnalysis = await this.ollamaService.generateCreditAnalysis(extractedData, documentTypes);

      return {
        ...creditAnalysis,
        documentAnalysis: extractedData,
        metadata: {
          totalDocuments: processedDocuments.length,
          documentTypes: documentTypes,
          analysisDate: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Credit analysis error:', error);
      throw new Error(`Failed to complete credit analysis: ${error.message}`);
    }
  }

  async analyzeDocument(document) {
    const prompt = this.getDocumentPrompt(document.type);

    if (document.images && document.images.length > 0) {
      // Analyze PDF images
      const imageAnalyses = await this.ollamaService.analyzeMultipleImages(document.images, prompt);
      
      // Combine analyses from all pages
      const combinedAnalysis = this.combinePageAnalyses(imageAnalyses);
      
      return {
        type: document.type,
        pageCount: document.images.length,
        extractedInfo: combinedAnalysis,
        pageAnalyses: imageAnalyses
      };
    } else {
      // For non-PDF documents, analyze the text content
      return {
        type: document.type,
        extractedInfo: document.text || 'No content extracted',
        textAnalysis: true
      };
    }
  }

  getDocumentPrompt(documentType) {
    const basePrompt = "Analyze this financial document and extract key information. Focus on:";
    
    switch (documentType) {
      case 'legal':
        return `${basePrompt}
- Company name and legal structure
- Business registration details
- Legal compliance status
- Any legal issues or pending litigation
- Ownership structure
- Business licenses and permits`;

      case 'profit-loss':
        return `${basePrompt}
- Revenue figures and trends
- Operating expenses breakdown
- Net profit/loss amounts
- Gross margin calculations
- Operating margin
- Period covered
- Year-over-year comparisons
- Key financial ratios`;

      case 'balance-sheet':
        return `${basePrompt}
- Total assets and breakdown
- Current assets vs fixed assets
- Total liabilities and breakdown
- Current liabilities vs long-term debt
- Shareholders' equity
- Working capital
- Debt-to-equity ratio
- Asset turnover ratios`;

      case 'bank-statement':
        return `${basePrompt}
- Account balance trends
- Cash flow patterns
- Regular income sources
- Major expenses and payments
- Overdrafts or negative balances
- Transaction frequency
- Average monthly balance
- Seasonal variations`;

      default:
        return `${basePrompt}
- Document type and purpose
- Key financial figures
- Important dates and periods
- Relevant business information
- Any red flags or concerns
- Positive indicators`;
    }
  }

  combinePageAnalyses(pageAnalyses) {
    const validAnalyses = pageAnalyses.filter(analysis => !analysis.error);
    
    if (validAnalyses.length === 0) {
      return 'Failed to extract information from document pages';
    }

    // Combine all page analyses into a comprehensive summary
    const combinedText = validAnalyses
      .map(analysis => `Page ${analysis.page}: ${analysis.analysis}`)
      .join('\n\n');

    return combinedText;
  }
}