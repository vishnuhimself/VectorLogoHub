export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-secondary rounded mb-4" />
        <div className="h-4 w-24 bg-secondary rounded mb-8" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {[...Array(18)].map((_, i) => (
            <div key={i} className="aspect-square bg-secondary rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
} 