'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { TeacherSession } from '@/types/teacher';

const TeacherSessionContext = createContext<TeacherSession | null>(null);

export function TeacherSessionProvider({
  session,
  children,
}: {
  session: TeacherSession;
  children: ReactNode;
}) {
  return <TeacherSessionContext.Provider value={session}>{children}</TeacherSessionContext.Provider>;
}

/** Use inside any page/component under app/teacher/. */
export function useTeacherSession(): TeacherSession {
  const ctx = useContext(TeacherSessionContext);
  if (!ctx) {
    throw new Error('useTeacherSession must be used within app/teacher/layout.tsx');
  }
  return ctx;
}