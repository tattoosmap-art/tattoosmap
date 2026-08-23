import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { hasStudioAccess, isAdmin } from '@/lib/admin';

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        // Log error on server without crashing, let request proceed but warn admin
        console.error("⚠️ Supabase environment variables are missing in middleware context!");
        return supabaseResponse;
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
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

        // Development bypass for local testing
        const isLocalhost = request.headers.get('host')?.includes('localhost') || request.headers.get('host')?.includes('127.0.0.1');
        const hasBypass = request.nextUrl.searchParams.get('bypass') === 'true';

        if (isLocalhost && hasBypass) {
            return supabaseResponse;
        }

        if (!user || !user.email) {
            // Check if it's an API route
            if (request.nextUrl.pathname.startsWith('/api/')) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            // Redirect unauthorized users to the homepage
            const url = request.nextUrl.clone();
            url.pathname = '/';
            return NextResponse.redirect(url);
        }

        // Protect studio route — only admin or studio emails allowed
        if (request.nextUrl.pathname.startsWith('/admin/seo-studio')) {
            if (!hasStudioAccess(user.email)) {
                const url = request.nextUrl.clone();
                url.pathname = '/';
                return NextResponse.redirect(url);
            }
            return supabaseResponse;
        }

        // All other admin/protected pages — admin only
        if (!isAdmin(user.email)) {
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
