import VendorCardSkeleton from '@/components/vendors/VendorCardSkeleton'

export default function VendorsLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="h-8 w-64 skeleton mb-2" />
        <div className="h-4 w-40 skeleton mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <VendorCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
