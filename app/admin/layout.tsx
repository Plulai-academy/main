import { ReactNode } from 'react';
import { requireAdminSession } from '@/lib/admin/session';
import { AdminSessionProvider } from '@/components/admin/AdminSessionContext';
import { AdminShell } from '@/components/admin/AdminShell';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requireAdminSession();

  return (
    <AdminSessionProvider session={session}>
      <AdminShell>{children}</AdminShell>
    </AdminSessionProvider>
  );
}