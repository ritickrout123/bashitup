'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';


export function AppProviders({ children }: { children: React.ReactNode }) {
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        console.error('Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable. Google Auth will not work.');
    }

    return (
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
            <AuthProvider>
                {children}
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#363636',
                            color: '#fff',
                        },
                    }}
                />
            </AuthProvider>
        </GoogleOAuthProvider>
    );
}
