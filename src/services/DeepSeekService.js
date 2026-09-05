// src/services/DeepSeekService.js
import { apiPost, apiGet, isSuperAdmin, getUserPlan } from './api';

class DeepSeekService {
  constructor() {
    this.cache = new Map();
    this.cacheTTL = 3600000; // 1 hour
  }

  /**
   * Generate HSE Document using DeepSeek
   */
  async generateDocument(params) {
    const {
      documentType,
      industry,
      requirements,
      generationMode,
      companyInfo,
      customSections = []
    } = params;

    // Check cache first
    const cacheKey = this.getCacheKey('document', {
      documentType,
      industry,
      generationMode,
      requirementsHash: this.hashString(requirements)
    });

    const cached = this.getCached(cacheKey);
    if (cached) {
      console.log('✅ DeepSeek cache hit for document');
      return cached;
    }

    try {
      const response = await apiPost(API_ENDPOINTS.DEEPSEEK_GENERATE_DOCUMENT, {
        document_type: documentType,
        industry: industry,
        requirements: requirements,
        generation_mode: generationMode,
        company_info: companyInfo,
        custom_sections: customSections
      });

      if (response.success) {
        // Cache the response
        this.setCached(cacheKey, response);
        return response;
      } else {
        throw new Error(response.error || 'Generation failed');
      }
    } catch (error) {
      console.error('DeepSeek document generation error:', error);
      
      // Check if it's a plan error
      if (error.isPlanError || error.response?.data?.code === 'UPGRADE_REQUIRED') {
        const upgradeInfo = error.response?.data || {
          code: 'UPGRADE_REQUIRED',
          message: 'DeepSeek AI requires Pro plan or higher',
          requiredPlan: 'pro'
        };
        window.dispatchEvent(new CustomEvent('showUpgradeModal', { detail: upgradeInfo }));
        throw upgradeInfo;
      }
      
      throw error;
    }
  }

  /**
   * Chat with DeepSeek AI
   */
  async chat(message, context = {}) {
    const {
      industry,
      conversationHistory = [],
      personality = 'professional',
      detailLevel = 3
    } = context;

    try {
      const response = await apiPost(API_ENDPOINTS.DEEPSEEK_CHAT, {
        message: message,
        industry: industry,
        conversation_history: conversationHistory,
        personality: personality,
        detail_level: detailLevel
      });

      return {
        success: true,
        response: response.content,
        usage: response.usage,
        responseTime: response.response_time
      };
    } catch (error) {
      console.error('DeepSeek chat error:', error);
      
      if (error.isPlanError) {
        window.dispatchEvent(new CustomEvent('showUpgradeModal', { 
          detail: error.response?.data 
        }));
      }
      
      return {
        success: false,
        error: error.message,
        fallback: true
      };
    }
  }

  /**
   * Generate CSP Exam Questions
   */
  async generateExamQuestions(params) {
    const {
      topic,
      difficulty = 'advanced',
      count = 10,
      domain = 'safety_management',
      includeExplanations = true,
      scenarioBased = true
    } = params;

    const cacheKey = this.getCacheKey('exam', {
      topic,
      difficulty,
      count,
      domain
    });

    const cached = this.getCached(cacheKey);
    if (cached) {
      console.log('✅ DeepSeek cache hit for exam questions');
      return cached;
    }

    try {
      const response = await apiPost(API_ENDPOINTS.DEEPSEEK_GENERATE_EXAM, {
        topic: topic,
        difficulty: difficulty,
        count: count,
        domain: domain,
        include_explanations: includeExplanations,
        scenario_based: scenarioBased
      });

      if (response.success) {
        this.setCached(cacheKey, response);
        return response;
      } else {
        throw new Error(response.error || 'Exam generation failed');
      }
    } catch (error) {
      console.error('DeepSeek exam generation error:', error);
      return {
        success: false,
        error: error.message,
        questions: this.getFallbackExamQuestions(topic, count)
      };
    }
  }

  /**
   * Enhance existing document content
   */
  async enhanceContent(content, enhancementType = 'professional') {
    try {
      const response = await apiPost(API_ENDPOINTS.DEEPSEEK_ENHANCE_CONTENT, {
        content: content,
        enhancement_type: enhancementType
      });

      return {
        success: true,
        enhancedContent: response.enhanced_content,
        usage: response.usage
      };
    } catch (error) {
      console.error('DeepSeek enhancement error:', error);
      return {
        success: false,
        enhancedContent: content,
        error: error.message
      };
    }
  }

  /**
   * Get usage statistics for current user
   */
  async getUsageStats() {
    try {
      const response = await apiGet(API_ENDPOINTS.DEEPSEEK_USAGE_STATS);
      return response;
    } catch (error) {
      console.error('Failed to get DeepSeek usage stats:', error);
      return {
        success: false,
        usage: {
          today: 0,
          thisMonth: 0,
          limit: 0,
          remaining: 0
        }
      };
    }
  }

  // ============= UTILITY METHODS =============

  getCacheKey(prefix, params) {
    const sorted = Object.keys(params)
      .sort()
      .map(k => `${k}:${params[k]}`)
      .join('|');
    return `${prefix}:${this.hashString(sorted)}`;
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  }

  getCached(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }
    return null;
  }

  setCached(key, data) {
    this.cache.set(key, {
      data: data,
      timestamp: Date.now()
    });
  }

  getFallbackExamQuestions(topic, count) {
    // Fallback questions when DeepSeek is unavailable
    const fallbacks = {
      safety_management: [
        {
          question: "What is the primary purpose of a Safety Management System (SMS)?",
          options: [
            "A) To eliminate all workplace hazards",
            "B) To systematically manage safety risks",
            "C) To comply with insurance requirements",
            "D) To reduce operational costs"
          ],
          correct_answer: "B",
          explanation: "An SMS provides a systematic approach to managing safety risks."
        }
      ],
      risk_assessment: [
        {
          question: "In a 5x5 risk matrix, a hazard with Likelihood=4 and Severity=5 has a risk level of:",
          options: [
            "A) Low (1-4)",
            "B) Medium (5-9)",
            "C) High (10-15)",
            "D) Extreme (16-25)"
          ],
          correct_answer: "D",
          explanation: "4 × 5 = 20, which falls in the Extreme category (16-25)."
        }
      ]
    };
    
    const baseQuestions = fallbacks[topic] || fallbacks.safety_management;
    const questions = [];
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const base = baseQuestions[i % baseQuestions.length];
      questions.push({
        ...base,
        id: `fallback_${i}_${Date.now()}`
      });
    }
    
    return questions;
  }
}

// Create and export singleton instance
const deepSeekService = new DeepSeekService();
export default deepSeekService;