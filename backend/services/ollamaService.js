import fetch from 'node-fetch';
import fs from 'fs-extra';

export class OllamaService {
  constructor(baseUrl = null) {
    // Allow configuration via environment variables
    this.baseUrl = baseUrl || 
                   process.env.OLLAMA_URL || 
                   `http://${process.env.OLLAMA_HOST || 'localhost'}:${process.env.OLLAMA_PORT || '11434'}`;
    this.model = 'qwen2.5vl:7b';
    this.maxRetries = 3;
    this.retryDelay = 2000; // 2 seconds
  }

  async checkConnection() {
    try {
      console.log(`Checking Ollama connection at ${this.baseUrl}...`);
      const response = await fetch(`${this.baseUrl}/api/version`, {
        method: 'GET',
        timeout: 5000
      });
      
      if (!response.ok) {
        throw new Error(`Ollama server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Connected to Ollama version: ${data.version || 'unknown'}`);
      return true;
    } catch (error) {
      console.error('Failed to connect to Ollama:', error.message);
      throw new Error(`Cannot connect to Ollama at ${this.baseUrl}. Please ensure Ollama is running and accessible.`);
    }
  }

  async isModelAvailable() {
    try {
      await this.checkConnection();
      
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }
      
      const data = await response.json();
      const modelExists = data.models?.some(model => 
        model.name === this.model || model.name.includes('qwen2.5vl')
      );
      
      console.log(`Model ${this.model} ${modelExists ? 'is' : 'is not'} available`);
      return modelExists;
    } catch (error) {
      console.error('Error checking model availability:', error);
      return false;
    }
  }

  async pullModel() {
    try {
      console.log(`Pulling model ${this.model}...`);
      
      const response = await fetch(`${this.baseUrl}/api/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: this.model })
      });

      if (!response.ok) {
        throw new Error(`Failed to pull model: ${response.status} ${response.statusText}`);
      }

      // Stream the response to track progress
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let lastStatus = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.status && data.status !== lastStatus) {
              console.log(`Model pull status: ${data.status}`);
              lastStatus = data.status;
            }
            if (data.error) {
              throw new Error(`Model pull error: ${data.error}`);
            }
          } catch (e) {
            if (e.message.includes('Model pull error')) {
              throw e;
            }
            // Ignore JSON parse errors for non-JSON lines
          }
        }
      }

      console.log('Model pulled successfully');
      
      // Verify the model is now available
      const isAvailable = await this.isModelAvailable();
      if (!isAvailable) {
        throw new Error('Model pull completed but model is not available');
      }
      
    } catch (error) {
      console.error('Error pulling model:', error);
      throw new Error(`Failed to pull model ${this.model}: ${error.message}`);
    }
  }

  async analyzeImage(imagePath, prompt, retryCount = 0) {
    try {
      // Verify image file exists
      if (!await fs.pathExists(imagePath)) {
        throw new Error(`Image file not found: ${imagePath}`);
      }

      // Read and encode image as base64
      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = imageBuffer.toString('base64');

      console.log(`Analyzing image: ${imagePath} (${Math.round(imageBuffer.length / 1024)}KB)`);

      const requestBody = {
        model: this.model,
        prompt: prompt,
        images: [base64Image],
        stream: false,
        options: {
          temperature: 0.1,
          top_p: 0.9,
          num_predict: 2000
        }
      };

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        timeout: 120000 // 2 minutes timeout
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.response) {
        throw new Error('Empty response from Ollama');
      }

      return data.response;
    } catch (error) {
      console.error(`Error analyzing image (attempt ${retryCount + 1}):`, error);
      
      if (retryCount < this.maxRetries) {
        console.log(`Retrying in ${this.retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.analyzeImage(imagePath, prompt, retryCount + 1);
      }
      
      throw new Error(`Failed to analyze image after ${this.maxRetries + 1} attempts: ${error.message}`);
    }
  }

  async analyzeMultipleImages(imagePaths, prompt) {
    const results = [];
    
    console.log(`Starting analysis of ${imagePaths.length} images...`);
    
    for (let i = 0; i < imagePaths.length; i++) {
      const imagePath = imagePaths[i];
      console.log(`Analyzing image ${i + 1}/${imagePaths.length}: ${imagePath}`);
      
      try {
        const pagePrompt = `${prompt}\n\nThis is page ${i + 1} of ${imagePaths.length}. Please analyze this page and extract relevant financial information. Be specific and detailed in your analysis.`;
        const result = await this.analyzeImage(imagePath, pagePrompt);
        results.push({
          page: i + 1,
          imagePath,
          analysis: result,
          success: true
        });
        
        console.log(`Successfully analyzed page ${i + 1}`);
      } catch (error) {
        console.error(`Error analyzing page ${i + 1}:`, error);
        results.push({
          page: i + 1,
          imagePath,
          error: error.message,
          success: false
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`Completed analysis: ${successCount}/${imagePaths.length} pages successful`);
    
    return results;
  }

  async generateCreditAnalysis(extractedData, documentTypes) {
    const prompt = `
You are a financial analyst specializing in credit assessment. Based on the following extracted financial data from various documents, provide a comprehensive credit analysis.

Document types analyzed: ${documentTypes.join(', ')}

Extracted financial data:
${JSON.stringify(extractedData, null, 2)}

Please provide a detailed credit analysis including:

1. Credit Score (0-100) - Be realistic based on the actual data
2. Credit Rating (Excellent/Good/Fair/Poor)
3. Summary of financial health (2-3 sentences)
4. Key strengths (at least 3 specific points)
5. Risk factors (at least 3 specific concerns)
6. Specific recommendations for improvement (at least 4 actionable items)
7. Detailed analysis breakdown with scores 0-100:
   - Financial Health
   - Cash Flow
   - Debt Ratio  
   - Profitability

IMPORTANT: Respond ONLY with a valid JSON object in this exact format:
{
  "score": 75,
  "rating": "Good",
  "summary": "Brief summary here",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "riskFactors": ["risk 1", "risk 2", "risk 3"],
  "recommendations": ["rec 1", "rec 2", "rec 3", "rec 4"],
  "detailedAnalysis": {
    "financialHealth": 80,
    "cashFlow": 70,
    "debtRatio": 75,
    "profitability": 65
  }
}

Do not include any text before or after the JSON object.
`;

    try {
      console.log('Generating final credit analysis...');
      
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.2,
            top_p: 0.8,
            num_predict: 3000
          }
        }),
        timeout: 180000 // 3 minutes timeout
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Try to parse the JSON response
      try {
        // Clean the response - remove any markdown formatting
        let cleanResponse = data.response.trim();
        if (cleanResponse.startsWith('```json')) {
          cleanResponse = cleanResponse.replace(/```json\s*/, '').replace(/```\s*$/, '');
        }
        if (cleanResponse.startsWith('```')) {
          cleanResponse = cleanResponse.replace(/```\s*/, '').replace(/```\s*$/, '');
        }
        
        const analysisResult = JSON.parse(cleanResponse);
        
        // Validate the structure
        if (!analysisResult.score || !analysisResult.rating || !analysisResult.summary) {
          throw new Error('Invalid analysis structure');
        }
        
        console.log('Successfully generated credit analysis');
        return analysisResult;
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        console.log('Raw response:', data.response);
        return this.generateFallbackAnalysis(extractedData);
      }
    } catch (error) {
      console.error('Error generating credit analysis:', error);
      return this.generateFallbackAnalysis(extractedData);
    }
  }

  generateFallbackAnalysis(extractedData) {
    console.log('Using fallback analysis due to Ollama error');
    
    const documentCount = extractedData.length;
    const successfulAnalyses = extractedData.filter(doc => !doc.error).length;
    const hasFinancialDocs = extractedData.some(doc => 
      ['profit-loss', 'balance-sheet', 'bank-statement'].includes(doc.documentType)
    );
    
    const baseScore = hasFinancialDocs ? 70 : 50;
    const analysisBonus = (successfulAnalyses / documentCount) * 20;
    const score = Math.min(100, Math.max(30, baseScore + analysisBonus));

    return {
      score: Math.round(score),
      rating: score >= 80 ? 'Excellent' : score >= 70 ? 'Good' : score >= 60 ? 'Fair' : 'Poor',
      summary: `Based on analysis of ${documentCount} documents (${successfulAnalyses} successfully processed), the credit profile shows ${score >= 70 ? 'strong' : score >= 60 ? 'moderate' : 'limited'} financial indicators. ${hasFinancialDocs ? 'Financial statements were provided for comprehensive analysis.' : 'Additional financial statements would improve assessment accuracy.'}`,
      strengths: [
        'Complete documentation provided for review',
        'Organized approach to financial record keeping',
        'Transparent submission of required documents',
        hasFinancialDocs ? 'Comprehensive financial statements included' : 'Willingness to provide documentation'
      ],
      riskFactors: [
        'Limited AI analysis due to technical constraints',
        'Market volatility and economic uncertainty factors',
        !hasFinancialDocs ? 'Missing key financial statements' : 'Need for more detailed financial trend analysis'
      ],
      recommendations: [
        'Maintain consistent and detailed financial reporting',
        'Implement regular cash flow monitoring and forecasting',
        'Diversify revenue streams to reduce business risk',
        'Build emergency reserves covering 3-6 months of expenses',
        hasFinancialDocs ? 'Continue providing comprehensive financial documentation' : 'Submit profit & loss statements and balance sheets for better assessment'
      ],
      detailedAnalysis: {
        financialHealth: Math.round(score * 0.9),
        cashFlow: Math.round(score * 0.8),
        debtRatio: Math.round(score * 0.85),
        profitability: Math.round(score * 0.75)
      }
    };
  }
}