// File: xp.ts
// Placement: lib/xp.ts
//
// Pulled out of DashboardClient since ProfileClient needs the same math.
// DashboardClient still has its own local copy — safe to switch it to
// import from here too whenever it's convenient, not required right now.

export const XP_PER_LEVEL = 1000

export const getLevel = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1