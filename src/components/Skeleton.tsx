interface SkeletonProps {
  className?: string
  count?: number
}

export default function Skeleton({ className = '', count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`skeleton ${className}`} />
      ))}
    </>
  )
}

export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="pet-card p-4">
          <div className="skeleton h-32 w-full mb-4 rounded-2xl" />
          <div className="skeleton h-4 w-24 mb-2" />
          <div className="skeleton h-3 w-16" />
        </div>
      ))}
    </div>
  )
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="pet-card p-4 flex items-center gap-4">
          <div className="skeleton h-12 w-12 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-32" />
            <div className="skeleton h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}
