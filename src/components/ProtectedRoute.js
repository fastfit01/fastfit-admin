import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  const router = useRouter();

  if (!currentUser) {
    router.push('/login');
    return null;
  }

  return children;
}