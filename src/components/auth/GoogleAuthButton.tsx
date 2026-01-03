'use client';

import { GoogleLogin } from '@react-oauth/google';
import { showErrorToast, showSuccessToast } from '@/lib/toast';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';

export function GoogleAuthButton({ text = 'Continue with Google' }: { text?: string }) {
    const { login } = useAuth(); // We might need to expose a direct method to set user state or just reload
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/';

    const handleSuccess = async (credentialResponse: any) => {
        try {
            const response = await fetch('/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    credential: credentialResponse.credential,
                }),
            });

            const data = await response.json();

            if (data.success) {
                showSuccessToast('Successfully logged in with Google! 🎉');
                // Force a hard reload to pick up the new cookie/state if useAuth doesn't auto-detect
                // Or better, let's trigger a client-side state update if possible.
                // For now, simple redirect
                window.location.href = redirectTo;
            } else {
                showErrorToast(data.error?.message || 'Google login failed');
            }
        } catch (error) {
            console.error('Google login error:', error);
            showErrorToast('Something went wrong with Google login');
        }
    };

    return (
        <div className="w-full flex justify-center">
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => {
                    showErrorToast('Google Login Failed');
                    console.log('Login Failed');
                }}
                useOneTap
                auto_select={false}
                shape="rectangular"
                theme="outline"
                size="large"
                width="100%"
                text={text === 'Sign up with Google' ? 'signup_with' : 'signin_with'}
            />
        </div>
    );
}
