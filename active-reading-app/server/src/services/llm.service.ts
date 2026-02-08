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
  private geminiKey: string;
  private geminiUrl: string;
  private model: string;
  private maxRetries: number = 3;
  private timeout: number = 60000; // 60 seconds

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    this.geminiKey = process.env.GEMINI_API_KEY || '';
    this.geminiUrl = process.env.GEMINI_API_URL || '';
    this.model = process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-exp:free';
    
    if (!this.apiKey) {
      console.warn('⚠️  OPENROUTER_API_KEY not set in environment');
    }
  }

  /**
   * Run a chat prompt. By default this uses the OpenRouter API. If useGemini
   * is true, the Gemini API (configured via GEMINI_API_URL and GEMINI_API_KEY)
   * will be called instead. The existing OpenRouter flow is unchanged.
   */
  async runPrompt(prompt: string, systemPrompt?: string, useGemini: boolean = false): Promise<LLMResponse> {
    if (useGemini) {
      if (!this.geminiKey || !this.geminiUrl) {
        return { success: false, error: 'Gemini API not configured (GEMINI_API_KEY/GEMINI_API_URL)'.toString() };
      }

      for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
        try {
          console.log(`🤖 Gemini Request (attempt ${attempt}/${this.maxRetries})`);
          const messages: any[] = [];
          if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
          messages.push({ role: 'user', content: prompt });

          const body = {
            model: process.env.GEMINI_MODEL || 'gemini',
            messages,
            temperature: 0.3,
            max_tokens: 4000
          };

          const r = await axios.post(this.geminiUrl, body, {
            headers: {
              'Authorization': `Bearer ${this.geminiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: this.timeout
          });

          // Try a few common response shapes (OpenAI-like or Gemini-like)
          const data = r.data;
          let content: any = null;
          if (data?.choices && data.choices[0]?.message?.content) {
            content = data.choices[0].message.content;
          } else if (data?.output && Array.isArray(data.output) && data.output[0]?.content) {
            // e.g., Google generative responses
            const c = data.output[0].content;
            if (Array.isArray(c)) {
              // content may be [{type: 'output_text', text: '...'}]
              const txt = c.map((part: any) => part?.text || '').join('');
              content = txt;
            } else if (typeof c === 'string') {
              content = c;
            } else if (c?.text) {
              content = c.text;
            }
          } else if (typeof data === 'string') {
            content = data;
          }

          if (!content) throw new Error('No content in Gemini response');

          return { success: true, data: content };
        } catch (error: any) {
          console.error(`❌ Gemini Error (attempt ${attempt}):`, error?.message || error);
          if (attempt === this.maxRetries) {
            return { success: false, error: error?.message || 'Gemini request failed' };
          }
          await new Promise(r => setTimeout(r, 1000 * attempt));
        }
      }

      return { success: false, error: 'Max retries exceeded' };
    }

    // Default: OpenRouter flow (unchanged)
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
  let content: string = '';
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
