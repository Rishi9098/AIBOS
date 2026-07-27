'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, Lock, ArrowLeft } from 'lucide-react';
import { getAuthUser } from '@/lib/api';

export interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const user = getAuthUser();
    if (!user || !user.token || !user.role) {
      setIsAuthorized(false);
      setUserRole('PUBLIC');
      return;
    }

    setUserRole(user.role);

    // Super Admin or allowed role check
    if (user.role === 'SUPER_ADMIN' || allowedRoles.includes(user.role) || (user.role === 'EVALUATOR' && allowedRoles.includes('TEACHER'))) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
  }, [allowedRoles]);

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-xs">
        Checking Role-Based Access Control (RBAC) Permissions...
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-8 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-rose-500/40 rounded-3xl p-8 space-y-6 text-center shadow-2xl animate-in fade-in">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-100">403 Forbidden Access</h1>
            <p className="text-xs text-rose-400 font-mono">
              Access Restricted by Role-Based Access Control (RBAC) Policy.
            </p>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Your current authenticated role (<strong className="text-slate-200">{userRole}</strong>) does not hold authorization permissions to view this administrative resource.
          </p>

          <Link
            href="/"
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 block"
          >
            <ArrowLeft className="w-4 h-4 inline" />
            <span>Return to Main Portal Login</span>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
