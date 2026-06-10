import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, {
                            ...options,
                            path: '/',
                            sameSite: 'lax',
                            secure: false,
                        })
                    );
                },
            },
        }
    );

    // Protect all /admin, /dashboard/os, /api/admin, or /api/upload routes
    const isProtected = 
        request.nextUrl.pathname.startsWith('/admin') || 
        request.nextUrl.pathname.startsWith('/dashboard/os') ||
        request.nextUrl.pathname.startsWith('/api/admin') ||
        request.nextUrl.pathname.startsWith('/api/upload');

    if (isProtected) {
        // IMPORTANT: Do NOT use getSession() here — getUser() sends a request to the
        // Supabase Auth server each time to revalidate, which is the secure approach.
        const {
            data: { user },
        } = await supabase.auth.getUser();

        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'hotosevents@gmail.com';
        
        // Development bypass for local testing
        const isLocalhost = request.headers.get('host')?.includes('localhost') || request.headers.get('host')?.includes('127.0.0.1');
        const hasBypass = request.nextUrl.searchParams.get('bypass') === 'true';

        if (isLocalhost && hasBypass) {
            return supabaseResponse;
        }

        if (!user || user.email !== adminEmail) {
            // Check if it's an API route
            if (request.nextUrl.pathname.startsWith('/api/')) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            // Redirect unauthorized users to the homepage
            const url = request.nextUrl.clone();
            url.pathname = '/';
            return NextResponse.redirect(url);
        }
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico
         * - public folder assets
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
