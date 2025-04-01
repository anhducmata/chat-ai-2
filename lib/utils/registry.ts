import { anthropic } from '@ai-sdk/anthropic'
import { createAzure } from '@ai-sdk/azure'
import { deepseek } from '@ai-sdk/deepseek'
import { createFireworks, fireworks } from '@ai-sdk/fireworks'
import { google } from '@ai-sdk/google'
import { groq } from '@ai-sdk/groq'
import { createOpenAI, openai } from '@ai-sdk/openai'
import { xai } from '@ai-sdk/xai'
import {
    experimental_createProviderRegistry as createProviderRegistry,
    extractReasoningMiddleware,
    wrapLanguageModel
} from 'ai'
import { createOllama } from 'ollama-ai-provider'

export const registry = createProviderRegistry({
  openai,
  anthropic,
  google,
  groq,
  ollama: createOllama({
    baseURL: `${process.env.OLLAMA_BASE_URL}/api`
  }),
  azure: createAzure({
    apiKey: process.env.AZURE_API_KEY,
    resourceName: process.env.AZURE_RESOURCE_NAME
  }),
  deepseek,
  fireworks: {
    ...createFireworks({
      apiKey: process.env.FIREWORKS_API_KEY
    }),
    languageModel: fireworks
  },
  'openai-compatible': createOpenAI({
    apiKey: process.env.OPENAI_COMPATIBLE_API_KEY,
    baseURL: process.env.OPENAI_COMPATIBLE_API_BASE_URL
  }),
  xai
})

// Type for valid provider strings
type ProviderPrefix = 
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'groq'
  | 'ollama'
  | 'azure'
  | 'deepseek'
  | 'fireworks'
  | 'openai-compatible'
  | 'xai';

export function getModel(model: string) {
  // If the model already has a provider prefix (contains ':'), use it directly
  if (model.includes(':')) {
    const [provider, ...modelNameParts] = model.split(':')
    const modelName = modelNameParts.join(':')

    if (provider === 'ollama') {
      const ollama = createOllama({
        baseURL: `${process.env.OLLAMA_BASE_URL}/api`
      })

      // if model is deepseek-r1, add reasoning middleware
      if (modelName.includes('deepseek-r1')) {
        return wrapLanguageModel({
          model: ollama(modelName),
          middleware: extractReasoningMiddleware({
            tagName: 'think'
          })
        })
      }

      // if ollama provider, set simulateStreaming to true
      return ollama(modelName, {
        simulateStreaming: true
      })
    }

    // if model is groq and includes deepseek-r1, add reasoning middleware
    if (provider === 'groq' && modelName.includes('deepseek-r1')) {
      return wrapLanguageModel({
        model: groq(modelName),
        middleware: extractReasoningMiddleware({
          tagName: 'think'
        })
      })
    }

    // if model is fireworks and includes deepseek-r1, add reasoning middleware
    if (provider === 'fireworks' && modelName.includes('deepseek-r1')) {
      return wrapLanguageModel({
        model: fireworks(modelName),
        middleware: extractReasoningMiddleware({
          tagName: 'think'
        })
      })
    }

    // Handle each provider specifically with the correct type
    switch (provider as ProviderPrefix) {
      case 'openai':
        return registry.languageModel(`openai:${modelName}` as `openai:${string}`)
      case 'anthropic':
        return registry.languageModel(`anthropic:${modelName}` as `anthropic:${string}`)
      case 'google':
        return registry.languageModel(`google:${modelName}` as `google:${string}`)
      case 'groq':
        return registry.languageModel(`groq:${modelName}` as `groq:${string}`)
      case 'ollama':
        return registry.languageModel(`ollama:${modelName}` as `ollama:${string}`)
      case 'azure':
        return registry.languageModel(`azure:${modelName}` as `azure:${string}`)
      case 'deepseek':
        return registry.languageModel(`deepseek:${modelName}` as `deepseek:${string}`)
      case 'fireworks':
        return registry.languageModel(`fireworks:${modelName}` as `fireworks:${string}`)
      case 'openai-compatible':
        return registry.languageModel(`openai-compatible:${modelName}` as `openai-compatible:${string}`)
      case 'xai':
        return registry.languageModel(`xai:${modelName}` as `xai:${string}`)
      default:
        // Default to OpenAI if provider is not recognized
        return registry.languageModel(`openai:${modelName}` as `openai:${string}`)
    }
  }

  // For models without provider prefix in the config, map them to the correct format
  // These are models from the default-models.json file
  switch (model) {
    case 'o3-mini':
      return registry.languageModel('openai:o3-mini' as `openai:${string}`)
    case 'gpt-4o':
      return registry.languageModel('openai:gpt-4o' as `openai:${string}`)
    case 'gpt-4o-mini':
      return registry.languageModel('openai:gpt-4o-mini' as `openai:${string}`)
    case 'grok-2-1212':
      return registry.languageModel('xai:grok-2-1212' as `xai:${string}`)
    case 'grok-2-vision-1212':
      return registry.languageModel('xai:grok-2-vision-1212' as `xai:${string}`)
    default:
      // If provider can't be determined, default to OpenAI
      return registry.languageModel(`openai:${model}` as `openai:${string}`)
  }
}

export function isProviderEnabled(providerId: string): boolean {
  switch (providerId) {
    case 'openai':
      return !!process.env.OPENAI_API_KEY
    case 'anthropic':
      return !!process.env.ANTHROPIC_API_KEY
    case 'google':
      return !!process.env.GOOGLE_GENERATIVE_AI_API_KEY
    case 'groq':
      return !!process.env.GROQ_API_KEY
    case 'ollama':
      return !!process.env.OLLAMA_BASE_URL
    case 'azure':
      return !!process.env.AZURE_API_KEY && !!process.env.AZURE_RESOURCE_NAME
    case 'deepseek':
      return !!process.env.DEEPSEEK_API_KEY
    case 'fireworks':
      return !!process.env.FIREWORKS_API_KEY
    case 'xai':
      return !!process.env.XAI_API_KEY
    case 'openai-compatible':
      return (
        !!process.env.OPENAI_COMPATIBLE_API_KEY &&
        !!process.env.OPENAI_COMPATIBLE_API_BASE_URL
      )
    default:
      return false
  }
}

export function getToolCallModel(model?: string) {
  const [provider, ...modelNameParts] = model?.split(':') ?? []
  const modelName = modelNameParts.join(':')
  switch (provider) {
    case 'deepseek':
      return getModel('deepseek:deepseek-chat')
    case 'fireworks':
      return getModel(
        'fireworks:accounts/fireworks/models/llama-v3p1-8b-instruct'
      )
    case 'groq':
      return getModel('groq:llama-3.1-8b-instant')
    case 'ollama':
      const ollamaModel =
        process.env.NEXT_PUBLIC_OLLAMA_TOOL_CALL_MODEL || modelName
      return getModel(`ollama:${ollamaModel}`)
    case 'google':
      return getModel('google:gemini-2.0-flash')
    default:
      return getModel('openai:gpt-4o-mini')
  }
}

export function isToolCallSupported(model?: string) {
  const [provider, ...modelNameParts] = model?.split(':') ?? []
  const modelName = modelNameParts.join(':')

  if (provider === 'ollama') {
    return false
  }

  if (provider === 'google') {
    return false
  }

  // Deepseek R1 is not supported
  // Deepseek v3's tool call is unstable, so we include it in the list
  return !modelName?.includes('deepseek')
}

export function isReasoningModel(model: string): boolean {
  if (typeof model !== 'string') {
    return false
  }
  return (
    model.includes('deepseek-r1') ||
    model.includes('deepseek-reasoner') ||
    model.includes('o3-mini')
  )
}
