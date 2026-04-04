export default function VendorCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white">
      <div className="aspect-[4/3] skeleton" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-20 skeleton" />
        <div className="h-5 w-3/4 skeleton" />
        <div className="h-3 w-1/2 skeleton" />
        <div className="space-y-2 pt-2">
          <div className="h-3 w-full skeleton" />
          <div className="h-3 w-2/3 skeleton" />
        </div>
        <div className="h-10 w-full skeleton mt-4" />
      </div>
    </div>
  )
}
