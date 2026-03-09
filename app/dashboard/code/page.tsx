// app/dashboard/code/page.tsx
// Code Lab has been merged into the lesson viewer.
// Redirect users to the skill tree where coding lessons live.
import { redirect } from 'next/navigation'
export default function CodeLabPage() {
  redirect('/dashboard/skills')
}
