import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import Groq from 'groq-sdk'
import type { 
  GenerateQuestionsRequest, 
  GeneratedQuestion,
  StudyPlanData,
  } from '../types'

// AI Provider interface
interface AIProvider {
  name: string
  isAvailable: boolean
  generateQuestions(request: GenerateQuestionsRequest): Promise<GeneratedQuestion[]>
  generateStudyPlan(subject: string, topics: string[], duration: number): Promise<StudyPlanData>
  analyzePerformance(data: any): Promise<string>
}

// OpenAI Provider
class OpenAIProvider implements AIProvider {
  name = 'openai'
  isAvailable = false
  private client: OpenAI | null = null

  constructor() {
    const apiKey = import.meta.env.OPENAI_API_KEY
    if (apiKey) {
      this.client = new OpenAI({ apiKey })
      this.isAvailable = true
    }
  }

  async generateQuestions(request: GenerateQuestionsRequest): Promise<GeneratedQuestion[]> {
    if (!this.client) throw new Error('OpenAI client not initialized')

    const prompt = this.buildQuestionPrompt(request)
    
    const response = await this.client.chat.completions.create({
      model: 'gpt-4',
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
    if (!content) throw new Error('No response from OpenAI')

    return this.parseQuestionsResponse(content, request)
  }

  async generateStudyPlan(subject: string, topics: string[], duration: number): Promise<StudyPlanData> {
    if (!this.client) throw new Error('OpenAI client not initialized')

    const prompt = this.buildStudyPlanPrompt(subject, topics, duration)
    
    const response = await this.client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert study planner. Create comprehensive, structured study plans that are realistic and effective.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 3000
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response from OpenAI')

    return this.parseStudyPlanResponse(content)
  }

  async analyzePerformance(data: any): Promise<string> {
    if (!this.client) throw new Error('OpenAI client not initialized')

    const prompt = `Analyze the following study performance data and provide insights and recommendations:

${JSON.stringify(data, null, 2)}

Please provide:
1. Key strengths and areas for improvement
2. Study pattern analysis
3. Specific recommendations for better performance
4. Goal alignment assessment`

    const response = await this.client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educational analyst. Provide insightful, actionable feedback on study performance.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500
    })

    return response.choices[0]?.message?.content || 'Unable to analyze performance data'
  }

  private buildQuestionPrompt(request: GenerateQuestionsRequest): string {
    const { topic, question_type, difficulty, count, include_explanations } = request
    
    let prompt = `Generate ${count} ${difficulty} level ${question_type} questions`
    
    if (topic) {
      prompt += ` about "${topic}"`
    }
    
    prompt += `. Each question should be educational and test understanding.`
    
    if (include_explanations) {
      prompt += ` Include detailed explanations for each answer.`
    }
    
    prompt += `\n\nFormat the response as a JSON array with the following structure:
[
  {
    "question_text": "The question text",
    "question_type": "${question_type}",
    "options": ["Option A", "Option B", "Option C", "Option D"], // Only for multiple choice
    "correct_answer": "The correct answer",
    "explanation": "Detailed explanation of the answer",
    "difficulty": "${difficulty}",
    "tags": ["tag1", "tag2"]
  }
]`

    return prompt
  }

  private buildStudyPlanPrompt(subject: string, topics: string[], duration: number): string {
    return `Create a comprehensive study plan for "${subject}" covering these topics: ${topics.join(', ')}.
    
The study plan should be designed for ${duration} hours of total study time.

Format the response as JSON with this structure:
{
  "topics": [
    {
      "id": "unique_id",
      "name": "Topic name",
      "description": "Topic description",
      "estimated_hours": number,
      "prerequisites": ["prereq1", "prereq2"],
      "resources": [
        {
          "type": "video|article|book|practice|other",
          "title": "Resource title",
          "url": "optional_url",
          "description": "Resource description"
        }
      ]
    }
  ],
  "schedule": {
    "daily_hours": number,
    "weekly_schedule": {
      "monday": ["topic1", "topic2"],
      "tuesday": ["topic3"],
      // ... other days
    },
    "review_sessions": {
      "frequency": "daily|weekly|biweekly",
      "topics": ["topic1", "topic2"]
    }
  },
  "milestones": [
    {
      "id": "unique_id",
      "name": "Milestone name",
      "description": "Milestone description",
      "target_date": "YYYY-MM-DD",
      "topics": ["topic1", "topic2"],
      "is_completed": false
    }
  ],
  "estimated_duration": ${duration},
  "difficulty_progression": ["beginner", "intermediate", "advanced"]
}`
  }

  private parseQuestionsResponse(content: string, request: GenerateQuestionsRequest): GeneratedQuestion[] {
    try {
      const parsed = JSON.parse(content)
      return Array.isArray(parsed) ? parsed : [parsed]
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error)
      throw new Error('Invalid response format from OpenAI')
    }
  }

  private parseStudyPlanResponse(content: string): StudyPlanData {
    try {
      return JSON.parse(content)
    } catch (error) {
      console.error('Failed to parse study plan response:', error)
      throw new Error('Invalid study plan format from OpenAI')
    }
  }
}

// Groq Provider
class GroqProvider implements AIProvider {
  name = 'groq'
  isAvailable = false
  private client: Groq | null = null

  constructor() {
    const apiKey = import.meta.env.GROQ_API_KEY
    if (apiKey) {
      this.client = new Groq({ apiKey })
      this.isAvailable = true
    }
  }

  async generateQuestions(request: GenerateQuestionsRequest): Promise<GeneratedQuestion[]> {
    if (!this.client) throw new Error('Groq client not initialized')

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

    return this.parseQuestionsResponse(content, request)
  }

  async generateStudyPlan(subject: string, topics: string[], duration: number): Promise<StudyPlanData> {
    if (!this.client) throw new Error('Groq client not initialized')

    const prompt = this.buildStudyPlanPrompt(subject, topics, duration)
    
    const response = await this.client.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [
        {
          role: 'system',
          content: 'You are an expert study planner. Create comprehensive, structured study plans that are realistic and effective.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 3000
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response from Groq')

    return this.parseStudyPlanResponse(content)
  }

  async analyzePerformance(data: any): Promise<string> {
    if (!this.client) throw new Error('Groq client not initialized')

    const prompt = `Analyze the following study performance data and provide insights and recommendations:

${JSON.stringify(data, null, 2)}

Please provide:
1. Key strengths and areas for improvement
2. Study pattern analysis
3. Specific recommendations for better performance
4. Goal alignment assessment`

    const response = await this.client.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educational analyst. Provide insightful, actionable feedback on study performance.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500
    })

    return response.choices[0]?.message?.content || 'Unable to analyze performance data'
  }

  private buildQuestionPrompt(request: GenerateQuestionsRequest): string {
    const { topic, question_type, difficulty, count, include_explanations } = request
    
    let prompt = `Generate ${count} ${difficulty} level ${question_type} questions`
    
    if (topic) {
      prompt += ` about "${topic}"`
    }
    
    prompt += `. Each question should be educational and test understanding.`
    
    if (include_explanations) {
      prompt += ` Include detailed explanations for each answer.`
    }
    
    prompt += `\n\nFormat the response as a JSON array with the following structure:
[
  {
    "question_text": "The question text",
    "question_type": "${question_type}",
    "options": ["Option A", "Option B", "Option C", "Option D"], // Only for multiple choice
    "correct_answer": "The correct answer",
    "explanation": "Detailed explanation of the answer",
    "difficulty": "${difficulty}",
    "tags": ["tag1", "tag2"]
  }
]`

    return prompt
  }

  private buildStudyPlanPrompt(subject: string, topics: string[], duration: number): string {
    return `Create a comprehensive study plan for "${subject}" covering these topics: ${topics.join(', ')}.
    
The study plan should be designed for ${duration} hours of total study time.

Format the response as JSON with this structure:
{
  "topics": [
    {
      "id": "unique_id",
      "name": "Topic name",
      "description": "Topic description",
      "estimated_hours": number,
      "prerequisites": ["prereq1", "prereq2"],
      "resources": [
        {
          "type": "video|article|book|practice|other",
          "title": "Resource title",
          "url": "optional_url",
          "description": "Resource description"
        }
      ]
    }
  ],
  "schedule": {
    "daily_hours": number,
    "weekly_schedule": {
      "monday": ["topic1", "topic2"],
      "tuesday": ["topic3"],
      // ... other days
    },
    "review_sessions": {
      "frequency": "daily|weekly|biweekly",
      "topics": ["topic1", "topic2"]
    }
  },
  "milestones": [
    {
      "id": "unique_id",
      "name": "Milestone name",
      "description": "Milestone description",
      "target_date": "YYYY-MM-DD",
      "topics": ["topic1", "topic2"],
      "is_completed": false
    }
  ],
  "estimated_duration": ${duration},
  "difficulty_progression": ["beginner", "intermediate", "advanced"]
}`
  }

  private parseQuestionsResponse(content: string, request: GenerateQuestionsRequest): GeneratedQuestion[] {
    try {
      const parsed = JSON.parse(content)
      return Array.isArray(parsed) ? parsed : [parsed]
    } catch (error) {
      console.error('Failed to parse Groq response:', error)
      throw new Error('Invalid response format from Groq')
    }
  }

  private parseStudyPlanResponse(content: string): StudyPlanData {
    try {
      return JSON.parse(content)
    } catch (error) {
      console.error('Failed to parse study plan response:', error)
      throw new Error('Invalid study plan format from Groq')
    }
  }
}

// Google Gemini Provider
class GeminiProvider implements AIProvider {
  name = 'gemini'
  isAvailable = false
  private client: GoogleGenerativeAI | null = null

  constructor() {
    const apiKey = import.meta.env.GEMINI_API_KEY
    if (apiKey) {
      this.client = new GoogleGenerativeAI(apiKey)
      this.isAvailable = true
    }
  }

  async generateQuestions(request: GenerateQuestionsRequest): Promise<GeneratedQuestion[]> {
    if (!this.client) throw new Error('Gemini client not initialized')

    const prompt = this.buildQuestionPrompt(request)
    const model = this.client.getGenerativeModel({ model: 'gemini-pro' })
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const content = response.text()

    if (!content) throw new Error('No response from Gemini')

    return this.parseQuestionsResponse(content, request)
  }

  async generateStudyPlan(subject: string, topics: string[], duration: number): Promise<StudyPlanData> {
    if (!this.client) throw new Error('Gemini client not initialized')

    const prompt = this.buildStudyPlanPrompt(subject, topics, duration)
    const model = this.client.getGenerativeModel({ model: 'gemini-pro' })
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const content = response.text()

    if (!content) throw new Error('No response from Gemini')

    return this.parseStudyPlanResponse(content)
  }

  async analyzePerformance(data: any): Promise<string> {
    if (!this.client) throw new Error('Gemini client not initialized')

    const prompt = `Analyze the following study performance data and provide insights and recommendations:

${JSON.stringify(data, null, 2)}

Please provide:
1. Key strengths and areas for improvement
2. Study pattern analysis
3. Specific recommendations for better performance
4. Goal alignment assessment`

    const model = this.client.getGenerativeModel({ model: 'gemini-pro' })
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const content = response.text()

    return content || 'Unable to analyze performance data'
  }

  private buildQuestionPrompt(request: GenerateQuestionsRequest): string {
    const { topic, question_type, difficulty, count, include_explanations } = request
    
    let prompt = `Generate ${count} ${difficulty} level ${question_type} questions`
    
    if (topic) {
      prompt += ` about "${topic}"`
    }
    
    prompt += `. Each question should be educational and test understanding.`
    
    if (include_explanations) {
      prompt += ` Include detailed explanations for each answer.`
    }
    
    prompt += `\n\nFormat the response as a JSON array with the following structure:
[
  {
    "question_text": "The question text",
    "question_type": "${question_type}",
    "options": ["Option A", "Option B", "Option C", "Option D"], // Only for multiple choice
    "correct_answer": "The correct answer",
    "explanation": "Detailed explanation of the answer",
    "difficulty": "${difficulty}",
    "tags": ["tag1", "tag2"]
  }
]`

    return prompt
  }

  private buildStudyPlanPrompt(subject: string, topics: string[], duration: number): string {
    return `Create a comprehensive study plan for "${subject}" covering these topics: ${topics.join(', ')}.
    
The study plan should be designed for ${duration} hours of total study time.

Format the response as JSON with this structure:
{
  "topics": [
    {
      "id": "unique_id",
      "name": "Topic name",
      "description": "Topic description",
      "estimated_hours": number,
      "prerequisites": ["prereq1", "prereq2"],
      "resources": [
        {
          "type": "video|article|book|practice|other",
          "title": "Resource title",
          "url": "optional_url",
          "description": "Resource description"
        }
      ]
    }
  ],
  "schedule": {
    "daily_hours": number,
    "weekly_schedule": {
      "monday": ["topic1", "topic2"],
      "tuesday": ["topic3"],
      // ... other days
    },
    "review_sessions": {
      "frequency": "daily|weekly|biweekly",
      "topics": ["topic1", "topic2"]
    }
  },
  "milestones": [
    {
      "id": "unique_id",
      "name": "Milestone name",
      "description": "Milestone description",
      "target_date": "YYYY-MM-DD",
      "topics": ["topic1", "topic2"],
      "is_completed": false
    }
  ],
  "estimated_duration": ${duration},
  "difficulty_progression": ["beginner", "intermediate", "advanced"]
}`
  }

  private parseQuestionsResponse(content: string, request: GenerateQuestionsRequest): GeneratedQuestion[] {
    try {
      const parsed = JSON.parse(content)
      return Array.isArray(parsed) ? parsed : [parsed]
    } catch (error) {
      console.error('Failed to parse Gemini response:', error)
      throw new Error('Invalid response format from Gemini')
    }
  }

  private parseStudyPlanResponse(content: string): StudyPlanData {
    try {
      return JSON.parse(content)
    } catch (error) {
      console.error('Failed to parse study plan response:', error)
      throw new Error('Invalid study plan format from Gemini')
    }
  }
}

// AI Service with intelligent provider orchestration
export class AIService {
  private providers: AIProvider[]
  private currentProvider: AIProvider
  private providerStats: Map<string, { success: number; failures: number; avgResponseTime: number }>

  constructor() {
    this.providers = [
      new OpenAIProvider(),
      new GroqProvider(),
      new GeminiProvider()
    ]
    
    this.providerStats = new Map()
    
    // Initialize provider stats
    this.providers.forEach(provider => {
      this.providerStats.set(provider.name, { success: 0, failures: 0, avgResponseTime: 0 })
    })
    
    // Select the first available provider
    this.currentProvider = this.providers.find(p => p.isAvailable) || this.providers[0]
  }

  // Intelligent provider selection based on performance and availability
  private selectOptimalProvider(task: string): AIProvider {
    const availableProviders = this.providers.filter(p => p.isAvailable)
    
    if (availableProviders.length === 0) {
      throw new Error('No AI providers available')
    }

    // For question generation, prefer faster providers
    if (task === 'generateQuestions') {
      // Groq is typically fastest for simple tasks
      const groq = availableProviders.find(p => p.name === 'groq')
      if (groq) return groq
    }

    // For complex tasks, prefer OpenAI GPT-4
    if (task === 'generateStudyPlan' || task === 'analyzePerformance') {
      const openai = availableProviders.find(p => p.name === 'openai')
      if (openai) return openai
    }

    // Fallback to provider with best success rate
    let bestProvider = availableProviders[0]
    let bestScore = 0

    availableProviders.forEach(provider => {
      const stats = this.providerStats.get(provider.name)
      if (stats) {
        const successRate = stats.success / (stats.success + stats.failures || 1)
        const score = successRate * (1 / (stats.avgResponseTime + 1)) // Higher is better
        
        if (score > bestScore) {
          bestScore = score
          bestProvider = provider
        }
      }
    })

    return bestProvider
  }

  // Track provider performance
  private updateProviderStats(providerName: string, success: boolean, responseTime: number) {
    const stats = this.providerStats.get(providerName)
    if (stats) {
      if (success) {
        stats.success++
      } else {
        stats.failures++
      }
      
      // Update average response time
      const totalRequests = stats.success + stats.failures
      stats.avgResponseTime = (stats.avgResponseTime * (totalRequests - 1) + responseTime) / totalRequests
    }
  }

  async generateQuestions(request: GenerateQuestionsRequest): Promise<GeneratedQuestion[]> {
    const startTime = Date.now()
    let lastError: Error | null = null

    // Try optimal provider first
    try {
      const optimalProvider = this.selectOptimalProvider('generateQuestions')
      console.log(`Using ${optimalProvider.name} for question generation`)
      
      const result = await optimalProvider.generateQuestions(request)
      const responseTime = Date.now() - startTime
      
      this.updateProviderStats(optimalProvider.name, true, responseTime)
      return result
    } catch (error) {
      console.warn(`Optimal provider failed, trying fallback providers:`, error)
      lastError = error as Error
      this.updateProviderStats(this.selectOptimalProvider('generateQuestions').name, false, Date.now() - startTime)
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
    for (const provider of this.providers) {
      if (!provider.isAvailable) continue
      
      try {
        return await provider.generateStudyPlan(subject, topics, duration)
      } catch (error) {
        console.warn(`Failed to generate study plan with ${provider.name}:`, error)
        continue
      }
    }
    
    throw new Error('All AI providers failed to generate study plan')
  }

  async analyzePerformance(data: any): Promise<string> {
    for (const provider of this.providers) {
      if (!provider.isAvailable) continue
      
      try {
        return await provider.analyzePerformance(data)
      } catch (error) {
        console.warn(`Failed to analyze performance with ${provider.name}:`, error)
        continue
      }
    }
    
    throw new Error('All AI providers failed to analyze performance')
  }

  getAvailableProviders(): string[] {
    return this.providers.filter(p => p.isAvailable).map(p => p.name)
  }

  getCurrentProvider(): string {
    return this.currentProvider.name
  }
}

// Export singleton instance
export const aiService = new AIService()