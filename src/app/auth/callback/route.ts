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
            const next = requestUrl.searchParams.get('next') || '/';
            const forwardedHost = request.headers.get('x-forwarded-host');
            const isLocalEnv = process.env.NODE_ENV === 'development';
            
            if (isLocalEnv) {
                return NextResponse.redirect(`${requestUrl.origin}${next}`);
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`);
            } else {
                return NextResponse.redirect(`${requestUrl.origin}${next}`);
            }
        }
    } else {
        console.warn('[AUTH CALLBACK] No code param in URL');
    }

    return NextResponse.redirect(`${requestUrl.origin}/`);
}
