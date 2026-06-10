import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (code) {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, {
                                    ...options,
                                    path: '/',
                                    sameSite: 'lax',
                                    secure: process.env.NODE_ENV === 'production',
                                })
                            );
                        } catch (err) {
                            console.error('[AUTH CALLBACK] Cookie set failed:', err);
                        }
                    },
                },
            }
        );

        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            console.error('[AUTH CALLBACK] Exchange FAILED:', error.message);
        } else {
            console.log('[AUTH CALLBACK] Exchange SUCCESS — user:', data.session?.user?.email);
        }
    } else {
        console.warn('[AUTH CALLBACK] No code param in URL');
    }

    return NextResponse.redirect(new URL('/', requestUrl.origin));
}
