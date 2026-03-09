export default function ChallengesLoading() {
  return (
    <div className="p-6 lg:p-10 max-w-3xl animate-pulse">
      <div className="h-10 w-48 bg-white/5 rounded-2xl mb-8" />
      <div className="space-y-4">
        {[...Array(3)].map((_,i) => <div key={i} className="h-36 bg-white/4 rounded-3xl" />)}
      </div>
    </div>
  )
}
