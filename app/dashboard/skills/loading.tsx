export default function SkillsLoading() {
  return (
    <div className="p-6 lg:p-10 max-w-3xl animate-pulse">
      <div className="h-10 w-40 bg-white/5 rounded-2xl mb-8" />
      <div className="space-y-4">
        {[...Array(6)].map((_,i) => <div key={i} className="h-24 bg-white/4 rounded-3xl" />)}
      </div>
    </div>
  )
}
