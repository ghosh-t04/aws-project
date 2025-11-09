'use client'

import { useState, useEffect, useRef } from 'react'
import { PaperAirplaneIcon, UserIcon, CpuChipIcon } from '@heroicons/react/24/outline'
import { ChatMessage } from '@/types'
import toast from 'react-hot-toast'
import { LoadingSpinner } from './LoadingSpinner'

interface ChatInterfaceProps {
  userId: string
  userContext: {
    quizResponse?: any
    savingsGoal?: any
    name: string
  }
}

/* GEMINI DIRECT CALL (client-side testing only) */
/* ✅ GEMINI DIRECT CALL (client-side testing only) */
async function callGemini(message: string, context: any) {
  const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY

  if (!API_KEY) {
    throw new Error("Missing Gemini API Key! Add NEXT_PUBLIC_GEMINI_API_KEY to .env.local")
  }

  const MODEL = "gemini-2.5-flash"

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `You are an AI financial advisor.
Here is the user context: ${JSON.stringify(context, null, 2)}
User message: ${message}`
          }
        ]
      }
    ]
  }

  // ✅ Corrected endpoint (v1 instead of v1beta)
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }
  )

  const data = await response.json()
  console.log("✅ Gemini raw response:", response.status, data)

  if (!response.ok) {
    throw new Error(data?.error?.message || `Gemini returned HTTP ${response.status}`)
  }

  const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!aiText) throw new Error("No text returned from Gemini (candidates empty)")

  return aiText
}

export function ChatInterface({ userId, userContext }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadChatHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadChatHistory = async () => {
    setIsLoadingHistory(false)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      userId,
      message: inputMessage.trim(),
      isUser: true,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const geminiResponse = await callGemini(userMessage.message, userContext)

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        userId,
        message: geminiResponse,
        isUser: false,
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (err: any) {
      console.error('Gemini Error:', err)
      toast.error(`Failed to get response from Gemini: ${err?.message ?? ''}`)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const suggestedQuestions = [
    "How can I save more money?",
    "What's the best way to budget?",
    "Should I invest my savings?",
    "How do I reduce unnecessary expenses?"
  ]

  const handleSuggestedQuestion = (question: string) => {
    setInputMessage(question)
  }

  return (
    <div className="card h-[600px] flex flex-col">
      <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-lg">
          <CpuChipIcon className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">AI Financial Advisor</h3>
          <p className="text-sm text-gray-600">Get personalized financial advice</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {isLoadingHistory ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <CpuChipIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Start a conversation with your AI financial advisor!</p>

            <div className="space-y-2">
              <p className="text-sm text-gray-400 mb-3">Try asking:</p>
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestedQuestion(q)}
                  className="block w-full text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex items-start space-x-2 max-w-[80%] ${
                  m.isUser ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    m.isUser ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  {m.isUser ? (
                    <UserIcon className="w-5 h-5 text-white" />
                  ) : (
                    <CpuChipIcon className="w-5 h-5 text-gray-600" />
                  )}
                </div>

                <div
                  className={`rounded-lg px-4 py-2 ${
                    m.isUser ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{m.message}</p>
                  <p className={`text-xs mt-1 ${m.isUser ? 'text-primary-100' : 'text-gray-500'}`}>
                    {formatTime(m.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <CpuChipIcon className="w-5 h-5 text-gray-600" />
              </div>
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <div className="flex items-center space-x-2">
                  <LoadingSpinner size="sm" />
                  <span className="text-sm text-gray-600">AI is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="flex space-x-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask about your finances..."
          className="flex-1 input-field"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PaperAirplaneIcon className="w-4 h-4" />
        </button>
      </form>

      {/* Context Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-700">
          💡 Your AI advisor uses your spending patterns and savings goals for personalized advice.
        </p>
      </div>
    </div>
  )
}
