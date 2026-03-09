// app/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="p-6 lg:p-10 max-w-5xl animate-pulse">
      <div className="h-10 w-48 bg-white/5 rounded-2xl mb-2" />
      <div className="h-4 w-72 bg-white/4 rounded-xl mb-8" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_,i) => <div key={i} className="h-28 bg-white/4 rounded-3xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_,i) => <div key={i} className="h-64 bg-white/4 rounded-3xl" />)}
      </div>
    </div>
  )
}
