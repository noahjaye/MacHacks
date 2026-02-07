import axios from 'axios';
import dotenv from 'dotenv';
import { response } from 'express';

dotenv.config();

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface LLMResponse {
  success: boolean;
  data?: string;
  error?: string;
}

export class LLMService {
  private apiKey: string;
  private model: string;
  private maxRetries: number = 3;
  private timeout: number = 60000; // 60 seconds

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    this.model = process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-exp:free';
    
    if (!this.apiKey) {
      console.warn('⚠️  OPENROUTER_API_KEY not set in environment');
    }
  }

  async runPrompt(prompt: string, systemPrompt?: string): Promise<LLMResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'API key not configured'
      };
    }

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`🤖 LLM Request (attempt ${attempt}/${this.maxRetries})`);
        console.log('API KEY', process.env.OPENROUTER_API_KEY, this.apiKey)
        const messages = [];
        if (systemPrompt) {
          messages.push({ role: 'system', content: systemPrompt });
        }
        messages.push({ role: 'user', content: prompt });

        /*const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'http://localhost:3000',
              'X-Title': 'Active Reading App'
            },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash-lite',
            messages: [
              {
                role: 'user',
                content: 'What is the meaning of life?',
              },
            ],
          }),
        });
        console.log("RESPONSE", response)*/
        let content = 1
        const response = await axios.post(
          OPENROUTER_API_URL,
          {
            model: 'google/gemini-2.5-flash-lite',
            messages,
            temperature: 0.3,
            max_tokens: 4000
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'http://localhost:3000',
              'X-Title': 'Active Reading App'
            },
            timeout: this.timeout
          }
        ).then(async (response) => {
          console.log("Log", response)
          console.log("LOG  ", response.data.choices[0])
          /*console.log("Res", response.data)
          console.log("HEad", response.headers)
          console.log("Correct data",response.config.data)
          const parsed = JSON.parse(response.config.data)
          console.log("PARSED", parsed)*/
          0/0
          content = response.data.choices[0]?.message?.content;
        
          if (!content) {
            throw new Error('No content in response');
          } else {
            console.log("Content", content)
          }
          console.log("EEOWCH")

          console.log('✅ LLM Response received');
          
          
          console.log("THIS SHOULD NOT PRINT AS WE HAVE ALREADY RETURNED")

          
        })
        return {
            success: true,
            data: content
        };

      } catch (error: any) {
        console.error(`❌ LLM Error (attempt ${attempt}):`, error.message);
        
        if (attempt === this.maxRetries) {
          return {
            success: false,
            error: error.message || 'LLM request failed'
          };
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    return {
      success: false,
      error: 'Max retries exceeded'
    };
  }

  async extractJSON(response: string): Promise<any> {
    // Try to find JSON in the response
    const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/) || 
                     response.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } catch (e) {
        console.error('Failed to parse JSON:', e);
        throw new Error('Invalid JSON in LLM response');
      }
    }
    
    // Try parsing the entire response
    try {
      return JSON.parse(response);
    } catch (e) {
      throw new Error('No valid JSON found in response');
    }
  }
}

export const llmService = new LLMService();
