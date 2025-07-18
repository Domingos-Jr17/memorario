import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-indigo-600" />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
