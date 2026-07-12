'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function updateKeyword(id: string, updates: any) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (_) {}
        },
      },
    }
  )

  const { error } = await supabase
    .from('keyword_progress')
    .update(updates)
    .eq('id', id)

  if (error) {
    console.error('Update error:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/os/content')
  return { success: true }
}
