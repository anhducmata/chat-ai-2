import { cn } from '@/lib/utils'

export function EmptyScreen({
  submitMessage,
  className
}: {
  submitMessage: (message: string) => void
  className?: string
}) {
  return (
    <div className={cn('mx-auto w-full transition-all', className)}>
      <div className="bg-background p-2">
        {/* Empty state without suggestions */}
      </div>
    </div>
  )
}
