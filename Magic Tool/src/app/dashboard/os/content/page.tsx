import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import ContentTrackerClient from './ContentTrackerClient'

export const metadata = {
  title: 'Content Tracker | OS',
}

export default async function ContentTrackerPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {}
      },
    }
  )

  const { data: keywords, error } = await supabase
    .from('keyword_progress')
    .select('*')
    .order('cluster', { ascending: true })
    .order('monthly_volume', { ascending: false })

  if (error) {
    console.error('Failed to fetch keyword_progress in ContentTrackerPage:', error.message)
  }

  return <ContentTrackerClient initialData={keywords || []} />
}
