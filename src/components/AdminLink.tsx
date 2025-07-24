'use client';

import Link from 'next/link';
import { useAuth } from '@/context/useAuth';
import { LayoutDashboard } from 'lucide-react';

export default function AdminLink() {
  const { user, isAdmin, loading } = useAuth();

  if (loading || !user || !isAdmin) {
    return null; // Don't render anything if not loading, not logged in, or not admin
  }

  return (
    <Link href="/admin" className="flex items-center px-4 py-2 text-text hover:bg-accent rounded-md transition-colors">
      <LayoutDashboard className="w-5 h-5 mr-2" />
      Admin Dashboard
    </Link>
  );
}
