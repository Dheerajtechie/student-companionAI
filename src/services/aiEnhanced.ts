import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import Groq from 'groq-sdk'
import type { 
  GenerateQuestionsRequest, 
  GeneratedQuestion,
  StudyPlanData,
  } from '../types'

// Enhanced AI Provider interface
interface EnhancedAIProvider {
  name: string
  isAvailable: boolean
  priority: number
  generateQuestions(request: GenerateQuestionsRequest): Promise<GeneratedQuestion[]>
  generateStudyPlan(subject: string, topics: string[], duration: number): Promise<StudyPlanData>
  analyzePerformance(data: any): Promise<string>
  getUsageStats(): { requests: number; errors: number; avgResponseTime: number }
}

// Enhanced OpenAI Provider with better error handling
class EnhancedOpenAIProvider implements EnhancedAIProvider {
  name = 'openai'
  isAvailable = false
  priority = 1
  private client: OpenAI | null = null
  private stats = { requests: 0, errors: 0, totalResponseTime: 0 }

  constructor() {
    const apiKey = import.meta.env.OPENAI_API_KEY
    if (apiKey && apiKey !== 'your_openai_api_key') {
      this.client = new OpenAI({ 
        apiKey,
        timeout: 30000, // 30 second timeout
        maxRetries: 3
      })
      this.isAvailable = true
    }
  }

  async generateQuestions(request: GenerateQuestionsRequest): Promise<GeneratedQuestion[]> {
    if (!this.client) throw new Error('OpenAI client not initialized')
    
    const startTime = Date.now()
    this.stats.requests++

    try {
      const prompt = this.buildQuestionPrompt(request)
      
      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content creator. Generate high-quality study questions that are clear, accurate, and educational. Always respond with valid JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      })

      const content = response.choices[0]?.message?.content
      if (!content) throw new Error('No response from OpenAI')

      const responseTime = Date.now() - startTime
      this.stats.totalResponseTime += responseTime

      return this.parseQuestionsResponse(content, request)
    } catch (error) {
      this.stats.errors++
      console.error('OpenAI question generation failed:', error)
      throw error
    }
  }

  async generateStudyPlan(subject: string, topics: string[], duration: number): Promise<StudyPlanData> {
    if (!this.client) throw new Error('OpenAI client not initialized')
    
    const startTime = Date.now()
    this.stats.requests++

    try {
      const prompt = `Create a comprehensive study plan for "${subject}" covering these topics: ${topics.join(', ')}. Duration: ${duration} days. Include daily schedules, milestones, and practice exercises.`
      
      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert study planner. Create detailed, actionable study plans with realistic timelines and milestones.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 3000,
        response_format: { type: "json_object" }
      })

      const content = response.choices[0]?.message?.content
      if (!content) throw new Error('No response from OpenAI')

      const responseTime = Date.now() - startTime
      this.stats.totalResponseTime += responseTime

      return this.parseStudyPlanResponse(content)
    } catch (error) {
      this.stats.errors++
      console.error('OpenAI study plan generation failed:', error)
      throw error
    }
  }

  async analyzePerformance(data: any): Promise<string> {
    if (!this.client) throw new Error('OpenAI client not initialized')
    
    const startTime = Date.now()
    this.stats.requests++

    try {
      const prompt = `Analyze this study performance data and provide insights: ${JSON.stringify(data)}`
      
      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert learning analyst. Provide actionable insights and recommendations based on study performance data.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 1000
      })

      const content = response.choices[0]?.message?.content
      if (!content) throw new Error('No response from OpenAI')

      const responseTime = Date.now() - startTime
      this.stats.totalResponseTime += responseTime

      return content
    } catch (error) {
      this.stats.errors++
      console.error('OpenAI performance analysis failed:', error)
      throw error
    }
  }

  getUsageStats() {
    return {
      requests: this.stats.requests,
      errors: this.stats.errors,
      avgResponseTime: this.stats.requests > 0 ? this.stats.totalResponseTime / this.stats.requests : 0
    }
  }

  private buildQuestionPrompt(request: GenerateQuestionsRequest): string {
    return `Generate ${request.count} ${request.difficulty} level ${request.question_type} questions about "${request.topic || 'general knowledge'}".

Requirements:
- Questions should be clear and educational
- Include proper explanations for answers
- Format as JSON with this structure:
{
  "questions": [
    {
      "question": "Question text",
      "type": "${request.question_type}",
      "options": ["A", "B", "C", "D"] (for multiple choice),
      "correct_answer": "Correct answer",
      "explanation": "Detailed explanation",
      "difficulty": "${request.difficulty}",
      "tags": ["tag1", "tag2"]
    }
  ]
}

${request.include_explanations ? 'Include detailed explanations for each answer.' : ''}`
  }

  private parseQuestionsResponse(content: string, request: GenerateQuestionsRequest): GeneratedQuestion[] {
    try {
      const parsed = JSON.parse(content)
      const questions = parsed.questions || parsed
      
      return questions.map((q: any, index: number) => ({
        id: `generated-${Date.now()}-${index}`,
        question_text: q.question || q.question_text,
        question_type: q.type || request.question_type,
        options: q.options || null,
        correct_answer: q.correct_answer,
        explanation: q.explanation || null,
        difficulty: q.difficulty || request.difficulty,
        tags: q.tags || [request.topic || 'general'],
        is_ai_generated: true,
        ai_provider: 'openai'
      }))
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error)
      throw new Error('Invalid response format from OpenAI')
    }
  }

  private parseStudyPlanResponse(content: string): StudyPlanData {
    try {
      const parsed = JSON.parse(content)
      return {
        title: parsed.title || 'Study Plan',
        description: parsed.description || '',
        duration_days: parsed.duration_days || 30,
        topics: parsed.topics || [],
        schedule: parsed.schedule || [],
        milestones: parsed.milestones || [],
        recommendations: parsed.recommendations || []
      }
    } catch (error) {
      console.error('Failed to parse study plan response:', error)
      throw new Error('Invalid study plan format from OpenAI')
    }
  }
}

// Enhanced Groq Provider (fastest)
class EnhancedGroqProvider implements EnhancedAIProvider {
  name = 'groq'
  isAvailable = false
  priority = 2
  private client: Groq | null = null
  private stats = { requests: 0, errors: 0, totalResponseTime: 0 }

  constructor() {
    const apiKey = import.meta.env.GROQ_API_KEY
    if (apiKey && apiKey !== 'your_groq_api_key') {
      this.client = new Groq({ apiKey })
      this.isAvailable = true
    }
  }

  async generateQuestions(request: GenerateQuestionsRequest): Promise<GeneratedQuestion[]> {
    if (!this.client) throw new Error('Groq client not initialized')
    
    const startTime = Date.now()
    this.stats.requests++

    try {
      const prompt = this.buildQuestionPrompt(request)
      
      const response = await this.client.chat.completions.create({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content creator. Generate high-quality study questions that are clear, accurate, and educational.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })

      const content = response.choices[0]?.message?.content
      if (!content) throw new Error('No response from Groq')

      const responseTime = Date.now() - startTime
      this.stats.totalResponseTime += responseTime

      return this.parseQuestionsResponse(content, request)
    } catch (error) {
      this.stats.errors++
      console.error('Groq question generation failed:', error)
      throw error
    }
  }

  async generateStudyPlan(subject: string, topics: string[], duration: number): Promise<StudyPlanData> {
    if (!this.client) throw new Error('Groq client not initialized')
    
    const startTime = Date.now()
    this.stats.requests++

    try {
      const prompt = `Create a study plan for "${subject}" covering: ${topics.join(', ')}. Duration: ${duration} days.`
      
      const response = await this.client.chat.completions.create({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are an expert study planner. Create detailed, actionable study plans.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 3000
      })

      const content = response.choices[0]?.message?.content
      if (!content) throw new Error('No response from Groq')

      const responseTime = Date.now() - startTime
      this.stats.totalResponseTime += responseTime

      return this.parseStudyPlanResponse(content)
    } catch (error) {
      this.stats.errors++
      console.error('Groq study plan generation failed:', error)
      throw error
    }
  }

  async analyzePerformance(data: any): Promise<string> {
    if (!this.client) throw new Error('Groq client not initialized')
    
    const startTime = Date.now()
    this.stats.requests++

    try {
      const prompt = `Analyze this study performance data: ${JSON.stringify(data)}`
      
      const response = await this.client.chat.completions.create({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are an expert learning analyst. Provide insights and recommendations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 1000
      })

      const content = response.choices[0]?.message?.content
      if (!content) throw new Error('No response from Groq')

      const responseTime = Date.now() - startTime
      this.stats.totalResponseTime += responseTime

      return content
    } catch (error) {
      this.stats.errors++
      console.error('Groq performance analysis failed:', error)
      throw error
    }
  }

  getUsageStats() {
    return {
      requests: this.stats.requests,
      errors: this.stats.errors,
      avgResponseTime: this.stats.requests > 0 ? this.stats.totalResponseTime / this.stats.requests : 0
    }
  }

  private buildQuestionPrompt(request: GenerateQuestionsRequest): string {
    return `Generate ${request.count} ${request.difficulty} level ${request.question_type} questions about "${request.topic || 'general knowledge'}".

Format as JSON:
{
  "questions": [
    {
      "question": "Question text",
      "type": "${request.question_type}",
      "options": ["A", "B", "C", "D"],
      "correct_answer": "Correct answer",
      "explanation": "Explanation",
      "difficulty": "${request.difficulty}",
      "tags": ["tag1", "tag2"]
    }
  ]
}`
  }

  private parseQuestionsResponse(content: string, request: GenerateQuestionsRequest): GeneratedQuestion[] {
    try {
      // Try to extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : content
      const parsed = JSON.parse(jsonString)
      const questions = parsed.questions || parsed
      
      return questions.map((q: any, index: number) => ({
        id: `generated-${Date.now()}-${index}`,
        question_text: q.question || q.question_text,
        question_type: q.type || request.question_type,
        options: q.options || null,
        correct_answer: q.correct_answer,
        explanation: q.explanation || null,
        difficulty: q.difficulty || request.difficulty,
        tags: q.tags || [request.topic || 'general'],
        is_ai_generated: true,
        ai_provider: 'groq'
      }))
    } catch (error) {
      console.error('Failed to parse Groq response:', error)
      throw new Error('Invalid response format from Groq')
    }
  }

  private parseStudyPlanResponse(content: string): StudyPlanData {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : content
      const parsed = JSON.parse(jsonString)
      
      return {
        title: parsed.title || 'Study Plan',
        description: parsed.description || '',
        duration_days: parsed.duration_days || 30,
        topics: parsed.topics || [],
        schedule: parsed.schedule || [],
        milestones: parsed.milestones || [],
        recommendations: parsed.recommendations || []
      }
    } catch (error) {
      console.error('Failed to parse study plan response:', error)
      throw new Error('Invalid study plan format from Groq')
    }
  }
}

// Enhanced Gemini Provider
class EnhancedGeminiProvider implements EnhancedAIProvider {
  name = 'gemini'
  isAvailable = false
  priority = 3
  private client: GoogleGenerativeAI | null = null
  private stats = { requests: 0, errors: 0, totalResponseTime: 0 }

  constructor() {
    const apiKey = import.meta.env.GEMINI_API_KEY
    if (apiKey && apiKey !== 'your_google_gemini_key') {
      this.client = new GoogleGenerativeAI(apiKey)
      this.isAvailable = true
    }
  }

  async generateQuestions(request: GenerateQuestionsRequest): Promise<GeneratedQuestion[]> {
    if (!this.client) throw new Error('Gemini client not initialized')
    
    const startTime = Date.now()
    this.stats.requests++

    try {
      const model = this.client.getGenerativeModel({ model: 'gemini-pro' })
      const prompt = this.buildQuestionPrompt(request)
      
      const result = await model.generateContent(prompt)
      const response = await result.response
      const content = response.text()

      if (!content) throw new Error('No response from Gemini')

      const responseTime = Date.now() - startTime
      this.stats.totalResponseTime += responseTime

      return this.parseQuestionsResponse(content, request)
    } catch (error) {
      this.stats.errors++
      console.error('Gemini question generation failed:', error)
      throw error
    }
  }

  async generateStudyPlan(subject: string, topics: string[], duration: number): Promise<StudyPlanData> {
    if (!this.client) throw new Error('Gemini client not initialized')
    
    const startTime = Date.now()
    this.stats.requests++

    try {
      const model = this.client.getGenerativeModel({ model: 'gemini-pro' })
      const prompt = `Create a study plan for "${subject}" covering: ${topics.join(', ')}. Duration: ${duration} days.`
      
      const result = await model.generateContent(prompt)
      const response = await result.response
      const content = response.text()

      if (!content) throw new Error('No response from Gemini')

      const responseTime = Date.now() - startTime
      this.stats.totalResponseTime += responseTime

      return this.parseStudyPlanResponse(content)
    } catch (error) {
      this.stats.errors++
      console.error('Gemini study plan generation failed:', error)
      throw error
    }
  }

  async analyzePerformance(data: any): Promise<string> {
    if (!this.client) throw new Error('Gemini client not initialized')
    
    const startTime = Date.now()
    this.stats.requests++

    try {
      const model = this.client.getGenerativeModel({ model: 'gemini-pro' })
      const prompt = `Analyze this study performance data: ${JSON.stringify(data)}`
      
      const result = await model.generateContent(prompt)
      const response = await result.response
      const content = response.text()

      if (!content) throw new Error('No response from Gemini')

      const responseTime = Date.now() - startTime
      this.stats.totalResponseTime += responseTime

      return content
    } catch (error) {
      this.stats.errors++
      console.error('Gemini performance analysis failed:', error)
      throw error
    }
  }

  getUsageStats() {
    return {
      requests: this.stats.requests,
      errors: this.stats.errors,
      avgResponseTime: this.stats.requests > 0 ? this.stats.totalResponseTime / this.stats.requests : 0
    }
  }

  private buildQuestionPrompt(request: GenerateQuestionsRequest): string {
    return `Generate ${request.count} ${request.difficulty} level ${request.question_type} questions about "${request.topic || 'general knowledge'}".

Format as JSON:
{
  "questions": [
    {
      "question": "Question text",
      "type": "${request.question_type}",
      "options": ["A", "B", "C", "D"],
      "correct_answer": "Correct answer",
      "explanation": "Explanation",
      "difficulty": "${request.difficulty}",
      "tags": ["tag1", "tag2"]
    }
  ]
}`
  }

  private parseQuestionsResponse(content: string, request: GenerateQuestionsRequest): GeneratedQuestion[] {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : content
      const parsed = JSON.parse(jsonString)
      const questions = parsed.questions || parsed
      
      return questions.map((q: any, index: number) => ({
        id: `generated-${Date.now()}-${index}`,
        question_text: q.question || q.question_text,
        question_type: q.type || request.question_type,
        options: q.options || null,
        correct_answer: q.correct_answer,
        explanation: q.explanation || null,
        difficulty: q.difficulty || request.difficulty,
        tags: q.tags || [request.topic || 'general'],
        is_ai_generated: true,
        ai_provider: 'gemini'
      }))
    } catch (error) {
      console.error('Failed to parse Gemini response:', error)
      throw new Error('Invalid response format from Gemini')
    }
  }

  private parseStudyPlanResponse(content: string): StudyPlanData {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : content
      const parsed = JSON.parse(jsonString)
      
      return {
        title: parsed.title || 'Study Plan',
        description: parsed.description || '',
        duration_days: parsed.duration_days || 30,
        topics: parsed.topics || [],
        schedule: parsed.schedule || [],
        milestones: parsed.milestones || [],
        recommendations: parsed.recommendations || []
      }
    } catch (error) {
      console.error('Failed to parse study plan response:', error)
      throw new Error('Invalid study plan format from Gemini')
    }
  }
}

// Enhanced AI Service with intelligent orchestration
export class EnhancedAIService {
  private providers: EnhancedAIProvider[]
  private providerStats: Map<string, { success: number; failures: number; avgResponseTime: number }>
  private retryAttempts = 3
  private retryDelay = 1000 // 1 second

  constructor() {
    this.providers = [
      new EnhancedOpenAIProvider(),
      new EnhancedGroqProvider(),
      new EnhancedGeminiProvider()
    ]
    
    this.providerStats = new Map()
    
    // Initialize provider stats
    this.providers.forEach(provider => {
      this.providerStats.set(provider.name, { success: 0, failures: 0, avgResponseTime: 0 })
    })
  }

  // Intelligent provider selection based on performance and availability
  private selectOptimalProvider(task: string): EnhancedAIProvider {
    const availableProviders = this.providers.filter(p => p.isAvailable)
    
    if (availableProviders.length === 0) {
      throw new Error('No AI providers available')
    }

    // Sort by priority and performance
    return availableProviders.sort((a, b) => {
      const statsA = this.providerStats.get(a.name)!
      const statsB = this.providerStats.get(b.name)!
      
      // Calculate success rate
      const successRateA = statsA.success / (statsA.success + statsA.failures) || 0
      const successRateB = statsB.success / (statsB.success + statsB.failures) || 0
      
      // Prioritize by success rate, then by priority, then by response time
      if (successRateA !== successRateB) {
        return successRateB - successRateA
      }
      
      if (a.priority !== b.priority) {
        return a.priority - b.priority
      }
      
      return statsA.avgResponseTime - statsB.avgResponseTime
    })[0]
  }

  private updateProviderStats(providerName: string, success: boolean, responseTime: number) {
    const stats = this.providerStats.get(providerName)!
    
    if (success) {
      stats.success++
    } else {
      stats.failures++
    }
    
    // Update average response time
    const totalRequests = stats.success + stats.failures
    stats.avgResponseTime = (stats.avgResponseTime * (totalRequests - 1) + responseTime) / totalRequests
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async generateQuestions(request: GenerateQuestionsRequest): Promise<GeneratedQuestion[]> {
    const startTime = Date.now()
    let lastError: Error | null = null

    // Try optimal provider first
    for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
      try {
        const optimalProvider = this.selectOptimalProvider('generateQuestions')
        console.log(`Using ${optimalProvider.name} for question generation (attempt ${attempt + 1})`)
        
        const result = await optimalProvider.generateQuestions(request)
        const responseTime = Date.now() - startTime
        
        this.updateProviderStats(optimalProvider.name, true, responseTime)
        return result
      } catch (error) {
        console.warn(`Provider failed, trying fallback providers:`, error)
        lastError = error as Error
        this.updateProviderStats(this.selectOptimalProvider('generateQuestions').name, false, Date.now() - startTime)
        
        if (attempt < this.retryAttempts - 1) {
          await this.delay(this.retryDelay * (attempt + 1))
        }
      }
    }

    // Fallback to other providers
    for (const provider of this.providers) {
      if (!provider.isAvailable) continue
      
      try {
        console.log(`Trying fallback provider: ${provider.name}`)
        const result = await provider.generateQuestions(request)
        const responseTime = Date.now() - startTime
        
        this.updateProviderStats(provider.name, true, responseTime)
        return result
      } catch (error) {
        console.warn(`Failed to generate questions with ${provider.name}:`, error)
        lastError = error as Error
        this.updateProviderStats(provider.name, false, Date.now() - startTime)
        continue
      }
    }
    
    throw new Error(`All AI providers failed to generate questions. Last error: ${lastError?.message}`)
  }

  async generateStudyPlan(subject: string, topics: string[], duration: number): Promise<StudyPlanData> {
    const startTime = Date.now()
    let lastError: Error | null = null

    for (const provider of this.providers) {
      if (!provider.isAvailable) continue
      
      try {
        console.log(`Using ${provider.name} for study plan generation`)
        const result = await provider.generateStudyPlan(subject, topics, duration)
        const responseTime = Date.now() - startTime
        
        this.updateProviderStats(provider.name, true, responseTime)
        return result
      } catch (error) {
        console.warn(`Failed to generate study plan with ${provider.name}:`, error)
        lastError = error as Error
        this.updateProviderStats(provider.name, false, Date.now() - startTime)
        continue
      }
    }
    
    throw new Error(`All AI providers failed to generate study plan. Last error: ${lastError?.message}`)
  }

  async analyzePerformance(data: any): Promise<string> {
    const startTime = Date.now()
    let lastError: Error | null = null

    for (const provider of this.providers) {
      if (!provider.isAvailable) continue
      
      try {
        console.log(`Using ${provider.name} for performance analysis`)
        const result = await provider.analyzePerformance(data)
        const responseTime = Date.now() - startTime
        
        this.updateProviderStats(provider.name, true, responseTime)
        return result
      } catch (error) {
        console.warn(`Failed to analyze performance with ${provider.name}:`, error)
        lastError = error as Error
        this.updateProviderStats(provider.name, false, Date.now() - startTime)
        continue
      }
    }
    
    throw new Error(`All AI providers failed to analyze performance. Last error: ${lastError?.message}`)
  }

  // Get provider statistics
  getProviderStats() {
    const stats: Record<string, any> = {}
    
    this.providers.forEach(provider => {
      const providerStats = this.providerStats.get(provider.name)!
      const usageStats = provider.getUsageStats()
      
      stats[provider.name] = {
        isAvailable: provider.isAvailable,
        priority: provider.priority,
        success: providerStats.success,
        failures: providerStats.failures,
        successRate: providerStats.success / (providerStats.success + providerStats.failures) || 0,
        avgResponseTime: providerStats.avgResponseTime,
        totalRequests: usageStats.requests,
        totalErrors: usageStats.errors
      }
    })
    
    return stats
  }

  // Get available providers
  getAvailableProviders(): string[] {
    return this.providers.filter(p => p.isAvailable).map(p => p.name)
  }
}

// Export singleton instance
export const enhancedAIService = new EnhancedAIService()
