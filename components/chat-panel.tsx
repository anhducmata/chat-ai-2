'use client'

import { Model } from '@/lib/types/models'
import { cn } from '@/lib/utils'
import { Message } from 'ai'
import { CornerDownLeft, MessageCirclePlus, Square } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Textarea from 'react-textarea-autosize'
import { EmptyScreen } from './empty-screen'
import { ModelSelector } from './model-selector'
import { SearchModeToggle } from './search-mode-toggle'
import { Button } from './ui/button'
import { IconLogo } from './ui/icons'

interface ChatPanelProps {
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  messages: Message[]
  setMessages: (messages: Message[]) => void
  query?: string
  stop: () => void
  append: (message: any) => void
  models?: Model[]
}

export function ChatPanel({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  messages,
  setMessages,
  query,
  stop,
  append,
  models
}: ChatPanelProps) {
  const [showEmptyScreen, setShowEmptyScreen] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [uiReady, setUiReady] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const isFirstRender = useRef(true)
  const [isComposing, setIsComposing] = useState(false) // Composition state
  const [enterDisabled, setEnterDisabled] = useState(false) // Disable Enter after composition ends

  const handleCompositionStart = () => setIsComposing(true)

  const handleCompositionEnd = () => {
    setIsComposing(false)
    setEnterDisabled(true)
    setTimeout(() => {
      setEnterDisabled(false)
    }, 300)
  }

  const handleNewChat = () => {
    setMessages([])
    // Use replace instead of push to avoid adding to history stack
    router.replace('/')
    setInitialized(false)
  }

  // Initialize chat with query if present
  useEffect(() => {
    if (isFirstRender.current && query && query.trim().length > 0 && !initialized) {
      append({
        role: 'user',
        content: query
      })
      isFirstRender.current = false
      setInitialized(true)
    }
  }, [query, append, initialized])

  // Focus the input field when the component mounts or after a new chat starts
  useEffect(() => {
    if (messages.length === 0 && inputRef.current && uiReady) {
      inputRef.current.focus()
    }
  }, [messages.length, uiReady])

  // Small delay to allow DOM to be fully rendered before showing content
  useEffect(() => {
    // Short timeout for smooth fade-in
    const timer = setTimeout(() => {
      setUiReady(true)
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Determine if we should show the empty UI
  const showEmptyUI = messages.length === 0 && !initialized;

  return (
    <div
      className={cn(
        'mx-auto w-full',
        messages.length > 0
          ? 'fixed bottom-0 left-0 right-0 bg-background'
          : 'fixed bottom-8 left-0 right-0 top-6 flex flex-col items-center justify-center'
      )}
    >
      {showEmptyUI && (
        <div className={cn(
          "mb-10 flex flex-col items-center gap-4 transition-opacity duration-500",
          uiReady ? "opacity-100" : "opacity-0"
        )}>
          <IconLogo className="size-12 text-muted-foreground" /> 
          <p className="text-center text-3xl font-semibold">
            How can I help you today?
          </p>
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className={cn(
          'max-w-3xl w-full mx-auto',
          messages.length > 0 ? 'px-2 pb-4' : 'px-6'
        )}
      >
        <div className={cn(
          "relative flex flex-col w-full gap-2 bg-muted rounded-3xl border border-input dark:bg-[rgb(132,130,130)]",
          "transition-all duration-500 ease-in-out",
          uiReady ? "opacity-100 transform-none" : "opacity-0 translate-y-2"
        )}>
          <Textarea
            ref={inputRef}
            name="input"
            rows={2}
            maxRows={5}
            tabIndex={0}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder="Ask a question..."
            spellCheck={false}
            value={input}
            className="resize-none w-full min-h-12 h-[82px] bg-white dark:bg-[rgb(132,130,130)] border-0 p-4 text-sm dark:text-white placeholder:text-muted-foreground dark:placeholder:text-gray-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 rounded-t-[25px]"
            onChange={e => {
              handleInputChange(e)
              // Don't change the empty screen state on input change to prevent layout shifts
            }}
            onKeyDown={e => {
              if (
                e.key === 'Enter' &&
                !e.shiftKey &&
                !isComposing &&
                !enterDisabled
              ) {
                if (input.trim().length === 0) {
                  e.preventDefault()
                  return
                }
                e.preventDefault()
                const textarea = e.target as HTMLTextAreaElement
                textarea.form?.requestSubmit()
                if (!initialized) {
                  setInitialized(true)
                }
              }
            }}
            // Remove focus/blur handlers to prevent layout shifts
          />

          {/* Bottom menu area */}
          <div className="flex items-center justify-between p-3 pb-1">
            <div className="flex items-center gap-2">
              <ModelSelector models={models || []} />
              <SearchModeToggle />
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <Button
                  variant="outline"
                  size="xs-icon"
                  onClick={handleNewChat}
                  className="shrink-0 rounded-full group"
                  type="button"
                  disabled={isLoading}
                >
                  <MessageCirclePlus className="size-4 group-hover:rotate-12 transition-all duration-300 ease-in-out" />
                </Button>
              )}
              <Button
                type={isLoading ? 'button' : 'submit'}
                size={'xs-icon'}
                variant={'outline'}
                className={cn(isLoading && 'animate-pulse', 'rounded-full')}
                disabled={input.length === 0 && !isLoading}
                onClick={isLoading ? stop : undefined}
              >
                {isLoading ? <Square size={20} /> : <CornerDownLeft size={20} />}
              </Button>
            </div>
          </div>
        </div>

        {/* Use an absolute positioned div for EmptyScreen to prevent layout shifts */}
        <div className={cn('absolute left-0 right-0 bottom-24', 
          !showEmptyUI || !uiReady ? 'hidden' : ''
        )}>
          {messages.length === 0 && !initialized && (
            <EmptyScreen
              submitMessage={message => {
                handleInputChange({
                  target: { value: message }
                } as React.ChangeEvent<HTMLTextAreaElement>)
                setInitialized(true)
              }}
              className="visible"
            />
          )}
        </div>
      </form>
    </div>
  )
}
