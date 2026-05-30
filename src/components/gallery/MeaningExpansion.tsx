'use client';

import { useState } from 'react';
import { Design } from '@/types/database.types';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface MeaningExpansionProps {
    design: Design;
    blogPostContent?: string;
    blogPostSlug?: string;
}

const MarkdownComponents: any = {
    p: ({...props}: any) => <p className="mb-[20px] font-sans text-[17px] leading-[1.5] text-black/90 break-words" {...props} />,
    h2: ({...props}: any) => <h2 className="text-[24px] font-display mt-12 mb-[20px] uppercase tracking-tight font-medium" {...props} />,
    h3: ({...props}: any) => <h3 className="text-[19px] font-display mt-8 mb-[20px] font-medium" {...props} />,
    blockquote: ({...props}: any) => (
        <blockquote className="bg-amber-50 border-l-[4px] border-amber-500 pl-6 py-4 my-[20px] italic text-[17px] font-sans text-amber-900 leading-[1.5]" {...props} />
    ),
    ul: ({...props}: any) => <ul className="list-disc pl-6 mb-[20px] space-y-2 text-[17px] leading-[1.5]" {...props} />,
    ol: ({...props}: any) => <ol className="list-decimal pl-6 mb-[20px] space-y-2 text-[17px] leading-[1.5]" {...props} />,
    li: ({node, className, ...props}: any) => {
        const isCheckbox = className?.includes('task-list-item');
        return (
        <li className={`font-sans ${isCheckbox ? 'list-none flex items-start gap-2 -ml-6' : ''}`}>
            {props.children}
        </li>
        )
    },
    input: ({type, ...props}: any) => {
        if (type === 'checkbox') return <input type="checkbox" className="mt-1.5 w-4 h-4 text-brand-red accent-brand-red rounded-none" {...props} />
        return <input {...props} />
    },
    pre: ({...props}: any) => <pre className="bg-black text-white p-6 whitespace-pre-wrap break-words mb-[20px] font-mono text-[14px] leading-relaxed" {...props} />,
    code: ({...props}: any) => {
        return <code className="font-mono text-[0.9em]" {...props} />
    },
    table: ({...props}: any) => <div className="overflow-x-auto mb-[20px]"><table className="w-full text-left border-collapse border border-gray-light font-sans text-[15px]" {...props} /></div>,
    th: ({...props}: any) => <th className="bg-off-white border border-gray-light p-3 font-medium text-black" {...props} />,
    td: ({...props}: any) => <td className="border border-gray-light p-3 text-black/80" {...props} />,
    img: ({ src, alt, ...props }: any) => {
        if (!src) return null;
        return (
            <span className="block w-screen relative left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] md:w-full md:static md:mx-0 my-[20px]">
                <span className="block aspect-video relative overflow-hidden bg-off-white border border-gray-light w-full">
                    <Image
                        src={src}
                        alt={alt || ""}
                        fill
                        sizes="(max-width: 768px) 100vw, 800px"
                        className="object-cover"
                        {...props}
                    />
                </span>
            </span>
        );
    }
};

export default function MeaningExpansion({ design, blogPostContent, blogPostSlug }: MeaningExpansionProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="mt-8 flex flex-col items-start w-full">
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-brand-red hover:text-black transition-colors py-2 border-b border-dashed border-brand-red/30"
                aria-expanded={isExpanded}
            >
                {isExpanded ? (
                    <>COLLAPSE FULL STORY <ChevronUp className="w-3 h-3" /></>
                ) : (
                    <>READ THE FULL STORY <ChevronDown className="w-3 h-3" /></>
                )}
            </button>

            <div 
                className="overflow-hidden transition-all duration-700 ease-in-out w-full"
                style={{ maxHeight: isExpanded ? '9999px' : '0px', opacity: isExpanded ? 1 : 0 }}
                aria-hidden={!isExpanded}
            >
                <div className="pt-8 pb-4 flex flex-col gap-8 text-[15px] leading-relaxed text-black/80 w-full lg:max-w-3xl">
                    {blogPostContent ? (
                        <div className="prose prose-sm max-w-none text-black/80 font-serif">
                            <ReactMarkdown components={MarkdownComponents}>{blogPostContent}</ReactMarkdown>
                            <Link href={`/blog/${blogPostSlug}`} className="inline-block mt-8 text-brand-red font-mono text-[12px] uppercase tracking-widest hover:underline">
                                Read full guide →
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-8">
                            <div className="flex flex-col gap-2">
                                <h3 className="font-mono text-[11px] uppercase tracking-[0.1em] text-black/40 mb-2 font-bold italic">Historical Context</h3>
                                <p className="font-serif text-[17px] leading-[1.6]">
                                    {design.meaning}
                                </p>
                            </div>
                            
                            <div className="flex flex-col gap-2 pt-4 border-t border-neutral-50">
                                <h3 className="font-mono text-[11px] uppercase tracking-[0.1em] text-black/40 mb-2 font-bold italic">Cultural Analysis</h3>
                                <p className="font-serif text-[17px] leading-[1.6]">
                                    This design originates from <strong>{design.cultural_origin || "Modern Western Minimalist"}</strong>. It traditionally embodies themes of {design.emotion_tags?.[0] || 'transformation'} and {design.emotion_tags?.[1] || 'resilience'}.
                                </p>
                            </div>

                            <div className="flex flex-col gap-2 pt-4 border-t border-neutral-50">
                                <h3 className="font-mono text-[11px] uppercase tracking-[0.1em] text-black/40 mb-2 font-bold italic">Collector's Choice</h3>
                                <p className="font-serif text-[17px] leading-[1.6]">
                                    Resonating with collectors who identify with its themes of {design.emotion_tags?.join(', ') || 'personal growth'}, this piece appeals particularly as a {design.gender_suitability?.toLowerCase() || 'men and women'} design for individuals seeking deep personal narrative.
                                </p>
                            </div>

                            <div className="flex flex-col gap-2 pt-4 border-t border-neutral-50">
                                <h3 className="font-mono text-[11px] uppercase tracking-[0.1em] text-black/40 mb-2 font-bold italic">Placement & Scale</h3>
                                <p className="font-serif text-[17px] leading-[1.6]">
                                    Anatomical optimization suggests {design.placement_recommendations?.slice(0, 3).join(', ') || 'forearm or wrist placement'}. To preserve clarity, a minimum scale of {design.minimum_size_cm || 5.0}cm is recommended for long-term ink integrity.
                                </p>
                            </div>

                            <div className="flex flex-col gap-2 pt-4 border-t border-neutral-50">
                                <h3 className="font-mono text-[11px] uppercase tracking-[0.1em] text-black/40 mb-2 font-bold italic">Longevity Prediction</h3>
                                <p className="font-serif text-[17px] leading-[1.6]">
                                    {design.aging_prediction}
                                </p>
                            </div>

                            {design.artist_technical_notes && (
                                <div className="flex flex-col gap-2 pt-4 border-t border-neutral-50">
                                    <h3 className="font-mono text-[11px] uppercase tracking-[0.1em] text-black/40 mb-2 font-bold italic">Technical Spec</h3>
                                    <p className="font-serif text-[17px] leading-[1.6]">
                                        Professional specialization notes: {design.artist_technical_notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
