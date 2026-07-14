'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { SchoolAdminSession } from '@/types/schoolAdmin';

const SchoolAdminSessionContext = createContext<SchoolAdminSession | null>(null);

export function SchoolAdminSessionProvider({
  session,
  children,
}: {
  session: SchoolAdminSession;
  children: ReactNode;
}) {
  return <SchoolAdminSessionContext.Provider value={session}>{children}</SchoolAdminSessionContext.Provider>;
}

/** Use inside any page/component under app/school-admin/. */
export function useSchoolAdminSession(): SchoolAdminSession {
  const ctx = useContext(SchoolAdminSessionContext);
  if (!ctx) {
    throw new Error('useSchoolAdminSession must be used within app/school-admin/layout.tsx');
  }
  return ctx;
}
