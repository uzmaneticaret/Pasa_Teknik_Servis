'use client';

import { LoginForm } from '@/components/auth/login-form';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Eğer kullanıcı zaten login olmuşsa dashboard'a yönlendir
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Loading durumunda spinner göster
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Kullanıcı zaten login olmuşsa hiçbir şey gösterme (yönlendirilecek)
  if (user) {
    return null;
  }

  return <LoginForm />;
}