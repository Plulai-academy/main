export default function BadgesLoading() {
  return (
    <div className="p-6 lg:p-10 max-w-4xl animate-pulse">
      <div className="h-10 w-36 bg-white/5 rounded-2xl mb-4" />
      <div className="h-3 bg-white/4 rounded-full mb-8" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_,i) => <div key={i} className="h-40 bg-white/4 rounded-2xl" />)}
      </div>
    </div>
  )
}
