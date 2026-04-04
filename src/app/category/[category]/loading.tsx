import VendorCardSkeleton from '@/components/vendors/VendorCardSkeleton'

export default function CategoryLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <div className="bg-[#111111] py-14 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="h-16 w-16 skeleton-dark rounded-2xl mx-auto mb-5" />
          <div className="h-10 w-80 skeleton-dark mx-auto mb-4" />
          <div className="h-4 w-60 skeleton-dark mx-auto" />
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <VendorCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
