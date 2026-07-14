// app/dashboard/assignments/page.tsx — Server component
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStaffRoleIfAny, getStudentAssignmentsList } from '@/lib/supabase/queries'
import AssignmentsClient from '@/components/dashboard/AssignmentsClient'

export default async function AssignmentsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const staffRole = await getStaffRoleIfAny(user.id)
  if (staffRole) redirect(staffRole.role === 'school_admin' ? '/school-admin' : '/teacher')

  const { className, assignments } = await getStudentAssignmentsList(user.id, supabase)

  return <AssignmentsClient userId={user.id} className={className} assignments={assignments} />
}