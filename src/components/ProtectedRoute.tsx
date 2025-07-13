import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <p className="text-center text-gray-600">Loading user session...</p>; // A more descriptive loading message
  }

  return <>{children}</>;
};

export default ProtectedRoute;
