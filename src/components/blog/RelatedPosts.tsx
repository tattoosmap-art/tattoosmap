"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export interface RelatedPostItem {
  title: string;
  slug: string;
  cover_image_url?: string;
  category?: string;
  read_time_minutes?: number;
}

export default function RelatedPosts({ posts }: { posts: RelatedPostItem[] }) {
  if (!posts || posts.length === 0) return null;
  
  return (
    <div className="w-full border-t border-neutral-100 mt-24 pt-24 pb-16 px-5">
       <div className="max-w-[1100px] mx-auto">
         <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
           <div>
             <span className="font-mono text-[10px] uppercase text-brand-red tracking-[0.2em] font-bold block mb-3">NEVER STOP EXPLORING</span>
             <h2 className="font-display text-[36px] md:text-[48px] leading-none text-black uppercase tracking-tight">Related Posts</h2>
           </div>
           <Link href="/blog" className="font-mono text-[11px] uppercase text-neutral-400 hover:text-black transition-colors flex items-center gap-2 tracking-widest">
             VIEW ALL GUIDES <ArrowRight className="w-3 h-3" />
           </Link>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
           {posts.map((p) => (
              <Link href={`/blog/${p.slug}`} key={p.slug} className="group flex flex-col">
                 <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100 mb-6">
                    <Image 
                      src={p.cover_image_url || "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop"} 
                      alt={p.title}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 350px"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
                 </div>
                 
                 <div className="flex items-center gap-3 mb-3">
                    <span className="font-mono text-[9px] uppercase text-brand-red tracking-widest font-bold">{p.category || 'ARTICLE'}</span>
                    <div className="w-[1px] h-2 bg-neutral-200" />
                    <span className="font-mono text-[9px] uppercase text-neutral-400 tracking-widest">{p.read_time_minutes || 5} MIN READ</span>
                 </div>
                 
                 <h3 className="font-display text-[20px] md:text-[22px] leading-[1.2] text-black mb-4 group-hover:text-brand-red transition-colors duration-300">
                   {p.title}
                 </h3>
                 
                 <div className="mt-auto pt-4 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest font-bold text-black opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                   READ POST <ArrowRight className="w-3 h-3" />
                 </div>
              </Link>
           ))}
         </div>
       </div>
    </div>
  );
}
