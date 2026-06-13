"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  ArrowUp, ArrowDown, Copy, Trash2, Image as ImageIcon, ChevronDown, Plus, X
} from "lucide-react";
import { uploadProductImageAction } from "@/actions/admin";
import ReadingProgressBar from "@/components/blog/ReadingProgressBar";
import FAQAccordion from "@/components/blog/FAQAccordion";
import BlogTOC from "./BlogTOC";
import RelatedPosts, { RelatedPostItem } from "./RelatedPosts";
import CommentSection, { CommentItem } from "./CommentSection";

// SECTION TOOLBAR helper
const SectionToolbar = ({ 
  isAdmin, onMoveUp, onMoveDown, onDuplicate, onRemove, isItem = false 
}: { 
  isAdmin: boolean, onMoveUp?: () => void, onMoveDown?: () => void, onDuplicate?: () => void, onRemove?: () => void, isItem?: boolean 
}) => {
  if (!isAdmin) return null;
  const hoverClass = isItem ? "group-hover/item:opacity-100" : "group-hover:opacity-100";
  return (
    <div className={`absolute top-2 right-2 z-[100] opacity-0 ${hoverClass} transition-opacity bg-white border border-black flex items-center font-mono text-[9px] uppercase tracking-widest divide-x divide-black pointer-events-auto`}>
      {onMoveUp && <button onClick={onMoveUp} className="px-3 py-2 hover:bg-neutral-50 flex items-center gap-1"><ArrowUp className="w-3 h-3" /> Up</button>}
      {onMoveDown && <button onClick={onMoveDown} className="px-3 py-2 hover:bg-neutral-50 flex items-center gap-1"><ArrowDown className="w-3 h-3" /> Down</button>}
      {onDuplicate && <button onClick={onDuplicate} className="px-3 py-2 hover:bg-neutral-50 flex items-center gap-1"><Copy className="w-3 h-3" /> Dup</button>}
      {onRemove && <button onClick={onRemove} className="px-3 py-2 hover:bg-brand-red hover:text-white transition-colors flex items-center gap-1"><Trash2 className="w-3 h-3" /> Remove</button>}
    </div>
  );
};

// EDITABLE WRAPPER helper
const Editable = ({ 
  isAdmin, children, onSave, onInputText, className = "", multiline = false, tag: Tag = "span", placeholder 
}: { 
  isAdmin: boolean, children: React.ReactNode, onSave: (val: string) => void, onInputText?: (val: string) => void, className?: string, multiline?: boolean, tag?: any, placeholder?: string 
}) => {
  if (!isAdmin) return <Tag className={className}>{children}</Tag>;
  return (
    <Tag 
      contentEditable 
      suppressContentEditableWarning
      onBlur={(e: any) => onSave(e.currentTarget.innerText)}
      onInput={(e: any) => onInputText?.(e.currentTarget.innerText)}
      data-placeholder={placeholder}
      className={`outline-none transition-all hover:outline-dashed hover:outline-brand-red/40 focus:outline-solid focus:outline-brand-red empty:before:content-[attr(data-placeholder)] empty:before:text-neutral-300 empty:before:pointer-events-none empty:before:italic ${className} ${multiline ? 'block' : 'inline-block'}`}
    >
      {children}
    </Tag>
  );
};

// ADD SECTION BUTTON helper
const AddSectionButton = ({ isAdmin, onAdd, anchor }: { isAdmin: boolean, onAdd: (type: string, anchor: string) => void, anchor: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  if (!isAdmin) return null;
  return (
    <div className="relative group/add flex justify-center py-4 my-4">
      <div className="absolute inset-0 flex items-center pointer-events-none">
        <div className="w-full border-t border-gray-light opacity-0 group-hover/add:opacity-100 transition-opacity" />
      </div>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-10 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-mono text-[20px] transition-transform hover:scale-110 group-hover/add:opacity-100"
      >
        +
      </button>
      {isOpen && (
        <div className="absolute top-10 z-[150] bg-white border border-black p-6 shadow-2xl w-[400px] text-left">
          <div className="flex justify-between items-center mb-6">
            <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-black">Add Section</span>
            <button onClick={() => setIsOpen(false)}><X className="w-4 h-4 text-black" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {['Short Answer', 'Science Section', 'Pull Quote', 'FAQ Item', 'Step', 'Tool', 'Invest Section'].map(type => (
              <button 
                key={type}
                onClick={() => { onAdd(type, anchor); setIsOpen(false); }}
                className="border border-black p-3 font-mono text-[9px] uppercase tracking-widest hover:bg-neutral-50 text-left text-black"
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export interface VisualStep {
  id: string;
  number: string;
  title: string;
  content: string;
  imageSrc?: string;
  imageAlt?: string;
  tip?: string;
  tipType?: 'tip' | 'warning';
}

interface VisualStepTemplateProps {
  isAdmin?: boolean;
  postType?: "VISUAL STEP GUIDE";
  badge?: string;
  readTime?: string;
  title: string;
  executiveSummary: string;
  shortAnswer: string;
  heroImageSrc?: string;
  heroImageAlt?: string;
  scienceHeading?: string;
  scienceContent?: string;
  pullQuote?: string;
  steps: VisualStep[];
  faqItems: { question: string; answer: string }[];
  ctaHeading?: string;
  ctaBody?: string;
  ctaButtonText?: string;
  ctaButtonHref?: string;
  relatedPosts?: RelatedPostItem[];
  comments?: CommentItem[];
  postId?: string;
  toolMarkers?: { toolId: string; anchor: string }[];
  investContent?: string;
  onChange?: (state: any) => void;
  shortAnswerHeading?: string;
  stepsHeading?: string;
  faqHeading?: string;
  mode?: "edit" | "create";
  sharedStateRef?: React.RefObject<any>;
  authorName?: string;
  authorAvatarUrl?: string;
}

export default function VisualStepTemplate({
  isAdmin = false,
  postType = "VISUAL STEP GUIDE",
  badge: initialBadge = "VISUAL GUIDE",
  readTime: initialReadTime = "6 MIN READ",
  title: initialTitle = "",
  executiveSummary: initialExecutiveSummary = "",
  shortAnswer: initialShortAnswer = "",
  heroImageSrc: initialHeroImageSrc = "https://images.unsplash.com/photo-1590210315325-d41fe0dfc73c?q=80&w=2670&auto=format&fit=crop",
  heroImageAlt: initialHeroImageAlt = "Tattoo Stage",
  scienceHeading: initialScienceHeading = "Why This Matters — The Science",
  scienceContent: initialScienceContent = "",
  pullQuote: initialPullQuote = "",
  steps: initialSteps = [],
  faqItems: initialFaqItems = [],
  ctaHeading: initialCtaHeading = "Ready for your next tattoo?",
  ctaBody: initialCtaBody = "Discover thousands of design subjects and styles on TattoosMap.",
  ctaButtonText: initialCtaButtonText = "BROWSE DESIGNS",
  ctaButtonHref: initialCtaButtonHref = "/gallery",
  relatedPosts: initialRelatedPosts = [],
  comments = [],
  postId = "",
  toolMarkers: initialToolMarkers = [],
  investContent: initialInvestContent = "",
  onChange,
  shortAnswerHeading: initialShortAnswerHeading = "The Short Answer",
  stepsHeading: initialStepsHeading = "Step-by-Step Sequence",
  faqHeading: initialFaqHeading = "Frequently Asked Questions",
  mode = "create",
  sharedStateRef,
  authorName,
  authorAvatarUrl
}: VisualStepTemplateProps) {
  const router = useRouter();

  // STATE VARIABLES
  const [badge, setBadge] = useState(initialBadge);
  const [readTime, setReadTime] = useState(initialReadTime);
  const [title, setTitle] = useState(initialTitle);
  const [updatedDate, setUpdatedDate] = useState("Updated May 2026");
  const [executiveSummary, setExecutiveSummary] = useState(initialExecutiveSummary);
  const [shortAnswer, setShortAnswer] = useState(initialShortAnswer);
  const [heroImageSrc, setHeroImageSrc] = useState(initialHeroImageSrc);
  const [heroImageAlt, setHeroImageAlt] = useState(initialHeroImageAlt);
  const [scienceHeading, setScienceHeading] = useState(initialScienceHeading);
  const [scienceContent, setScienceContent] = useState(initialScienceContent);
  const [pullQuote, setPullQuote] = useState(initialPullQuote);
  const [steps, setSteps] = useState<VisualStep[]>(initialSteps);
  const [faqItems, setFaqItems] = useState(initialFaqItems);
  const [ctaHeading, setCtaHeading] = useState(initialCtaHeading);
  const [ctaBody, setCtaBody] = useState(initialCtaBody);
  const [ctaButtonText, setCtaButtonText] = useState(initialCtaButtonText);
  const [ctaButtonHref, setCtaButtonHref] = useState(initialCtaButtonHref);
  const [relatedPosts, setRelatedPosts] = useState(initialRelatedPosts);
  const [toolMarkers, setToolMarkers] = useState<{ toolId: string, anchor: string }[]>(initialToolMarkers);
  const [investContent, setInvestContent] = useState(initialInvestContent);
  const [shortAnswerHeading, setShortAnswerHeading] = useState(initialShortAnswerHeading);
  const [stepsHeading, setStepsHeading] = useState(initialStepsHeading);
  const [faqHeading, setFaqHeading] = useState(initialFaqHeading);
  const [showToolPicker, setShowToolPicker] = useState(false);
  const [toolPickerAnchor, setToolPickerAnchor] = useState<string | null>(null);

  // Undo state for removed steps
  const [undoStack, setUndoStack] = useState<{ index: number, step: VisualStep } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Synchronize state when template loads or changes safely with comparison checks
  useEffect(() => {
    setBadge(initialBadge);
    setReadTime(initialReadTime);
    setTitle(initialTitle);
    setExecutiveSummary(initialExecutiveSummary);
    setShortAnswer(initialShortAnswer);
    setHeroImageSrc(initialHeroImageSrc);
    setHeroImageAlt(initialHeroImageAlt);
    setScienceHeading(initialScienceHeading);
    setScienceContent(initialScienceContent);
    setPullQuote(initialPullQuote);
    setCtaHeading(initialCtaHeading);
    setCtaBody(initialCtaBody);
    setCtaButtonText(initialCtaButtonText);
    setCtaButtonHref(initialCtaButtonHref);
    setInvestContent(initialInvestContent);
    
    // Only set array/object states if deep contents are actually different to prevent reference-identity infinite loops
    if (JSON.stringify(initialSteps) !== JSON.stringify(steps)) setSteps(initialSteps);
    if (JSON.stringify(initialFaqItems) !== JSON.stringify(faqItems)) setFaqItems(initialFaqItems);
    if (JSON.stringify(initialRelatedPosts || []) !== JSON.stringify(relatedPosts)) setRelatedPosts(initialRelatedPosts || []);
    if (JSON.stringify(initialToolMarkers) !== JSON.stringify(toolMarkers)) setToolMarkers(initialToolMarkers);
  }, [
    initialBadge, initialReadTime, initialTitle, initialExecutiveSummary, initialShortAnswer,
    initialHeroImageSrc, initialHeroImageAlt, initialScienceHeading, initialScienceContent,
    initialPullQuote, initialSteps, initialFaqItems, initialCtaHeading, initialCtaBody,
    initialCtaButtonText, initialCtaButtonHref, initialRelatedPosts, initialToolMarkers,
    initialInvestContent, initialShortAnswerHeading, initialStepsHeading, initialFaqHeading
  ]);
  
  useEffect(() => {
    setShortAnswerHeading(initialShortAnswerHeading);
    setStepsHeading(initialStepsHeading);
    setFaqHeading(initialFaqHeading);
  }, [initialShortAnswerHeading, initialStepsHeading, initialFaqHeading]);

  // SYNCHRONOUS REF SYNCING (Synchronously assigns updates to Parent Shared Ref with no rendering loops)
  useEffect(() => {
    if (sharedStateRef && sharedStateRef.current) {
      Object.assign(sharedStateRef.current, {
        badge, readTime, title, executiveSummary, shortAnswer, heroImageSrc, heroImageAlt,
        scienceHeading, scienceContent, pullQuote, steps, faqItems, ctaHeading, ctaBody,
        ctaButtonText, ctaButtonHref, relatedPosts, updatedDate, postType: "VISUAL STEP GUIDE",
        toolMarkers, investContent, shortAnswerHeading, stepsHeading, faqHeading
      });
    }
  }, [
    badge, readTime, title, executiveSummary, shortAnswer, heroImageSrc, heroImageAlt,
    scienceHeading, scienceContent, pullQuote, steps, faqItems, ctaHeading, ctaBody,
    ctaButtonText, ctaButtonHref, relatedPosts, updatedDate, toolMarkers, investContent,
    shortAnswerHeading, stepsHeading, faqHeading, sharedStateRef
  ]);

  // Helper to synchronously push raw keystrokes directly to Parent Ref before blurring
  const updateSharedRef = (key: string, val: any) => {
    if (sharedStateRef && sharedStateRef.current) {
      sharedStateRef.current[key] = val;
    }
  };

  // SAFE DEBOUNCED PREVIEW SYNC (Triggers parent UI updates smoothly with no synchronous state render loops)
  useEffect(() => {
    if (onChange) {
      const handler = setTimeout(() => {
        onChange({
          badge, readTime, title, executiveSummary, shortAnswer, heroImageSrc, heroImageAlt,
          scienceHeading, scienceContent, pullQuote, steps, faqItems, ctaHeading, ctaBody,
          ctaButtonText, ctaButtonHref, relatedPosts, updatedDate, postType: "VISUAL STEP GUIDE",
          toolMarkers, investContent, shortAnswerHeading, stepsHeading, faqHeading
        });
      }, 400);
      return () => clearTimeout(handler);
    }
  }, [
    badge, readTime, title, executiveSummary, shortAnswer, heroImageSrc, heroImageAlt,
    scienceHeading, scienceContent, pullQuote, steps, faqItems, ctaHeading, ctaBody,
    ctaButtonText, ctaButtonHref, relatedPosts, updatedDate, toolMarkers, investContent, onChange,
    shortAnswerHeading, stepsHeading, faqHeading
  ]);

  // Toast Auto-Dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // STATE CHANGE HANDLERS
  const handleTextChange = (setter: any, val: string) => {
    setter(val);
  };

  const handleArrayChange = (setter: any, arr: any[], index: number, key: string, val: string) => {
    const updated = [...arr];
    updated[index] = { ...updated[index], [key]: val };
    setter(updated);
  };

  const handleArrayMove = (setter: any, arr: any[], index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === arr.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...arr];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setter(updated);
  };

  const handleArrayRemove = (setter: any, arr: any[], index: number, contextLabel: string = 'item') => {
    setter(arr.filter((_, idx) => idx !== index));
    setToast(`Removed ${contextLabel}`);
  };

  // STEP ACTIONS
  const addStep = (index: number) => {
    const newStep: VisualStep = {
      id: `step-${Date.now()}`,
      number: `0${steps.length + 1}`,
      title: "Step Title",
      content: "Click to write the step content...",
      imageSrc: "",
      imageAlt: "",
      tip: "",
      tipType: "tip"
    };
    const updated = [...steps];
    updated.splice(index + 1, 0, newStep);
    setSteps(updated);
    setToast("Step added successfully");
  };

  const handleAddSection = (type: string, anchor: string) => {
    if (type === 'Short Answer') {
      setShortAnswer("The peeling in Week 2 is not your tattoo falling off. The itching is not an infection. The dull cloudy appearance in Week 3 is not permanent color loss. This guide explains the biology of every healing stage so you stop panicking and start healing correctly.");
    }
    if (type === 'Science Section') {
      setScienceContent("When a tattoo needle deposits ink into the dermis the epidermis above it is damaged. For the first 14 days the skin rebuilds this surface layer through keratinocyte migration — the cells that form the outer skin layer travel horizontally to close the wound. The dermis takes 3 to 4 months to fully stabilize.");
    }
    if (type === 'Pull Quote') {
      setPullQuote("The dull cloudy appearance of a healing tattoo in weeks 3 and 4 is not color loss. It is semi-opaque new epidermal cells. The color returns between months 2 and 4.");
    }
    if (type === 'FAQ Item') {
      setFaqItems(prev => [...prev, { question: "Is peeling normal for a healing tattoo?", answer: "Yes completely normal. Peeling in Week 2 is dead epidermal cells shedding as new ones form beneath. The ink is in the dermis below — it does not peel away with the surface skin." }]);
    }
    if (type === 'Step') {
      addStep(steps.length - 1);
    }
    if (type === 'Invest Section') {
      setInvestContent("Already have your design? Each design in our library includes the recommended aftercare protocol for its specific style and placement. Browse verified designs →");
    }
    if (type === 'Tool') {
      setToolPickerAnchor(anchor);
      setShowToolPicker(true);
    }
    setToast(`Added ${type.toUpperCase()}`);
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === steps.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...steps];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setSteps(updated);
  };

  const duplicateStep = (index: number) => {
    const orig = steps[index];
    const dupe: VisualStep = {
      ...orig,
      id: `step-${Date.now()}`,
      number: `${orig.number} (Copy)`
    };
    const updated = [...steps];
    updated.splice(index + 1, 0, dupe);
    setSteps(updated);
    setToast("Step duplicated");
  };

  const removeStep = (index: number) => {
    const removed = steps[index];
    setUndoStack({ index, step: removed });
    
    const updated = steps.filter((_, idx) => idx !== index);
    setSteps(updated);
    setToast("Step removed. Click undo to restore.");
  };

  const undoRemove = () => {
    if (undoStack) {
      const updated = [...steps];
      updated.splice(undoStack.index, 0, undoStack.step);
      setSteps(updated);
      setUndoStack(null);
      setToast("Step restored");
    }
  };

  const onStepImageUpload = (stepId: string, url: string) => {
    setSteps(prev => prev.map(s => s.id === stepId ? { ...s, imageSrc: url } : s));
  };

  // TOC Generation
  const autoTocItems = useMemo(() => {
    const items: { id: string; label: string }[] = [];
    if (shortAnswer) {
      items.push({ id: 'quick-answer', label: 'The Short Answer' });
    }
    if (scienceContent) {
      items.push({ id: 'science', label: scienceHeading || 'Why This Matters' });
    }
    if (steps.length > 0) {
      items.push({ id: 'steps', label: 'Step-by-Step Sequence' });
    }
    if (faqItems.length > 0) {
      items.push({ id: 'faq', label: 'Frequently Asked Questions' });
    }
    // Append Community for high-friction access
    items.push({ id: 'discussion', label: 'Community Discussion' });
    return items;
  }, [shortAnswer, scienceContent, scienceHeading, steps.length, faqItems.length]);

  return (
    <div className="bg-white min-h-screen">
      <ReadingProgressBar />

      {/* FIX 2: Mobile reorder wrapper */}
      <div className="flex flex-col">
        {/* 3. ARTICLE HEADER */}
        <div className="max-w-[680px] mx-auto px-5 mb-12 order-1 md:order-2 w-full">
          <div className="mt-12 md:mt-0">
            <div className="flex gap-4 items-center justify-center mb-4 text-center">
              <span className="font-mono text-[10px] uppercase text-brand-red border-[0.5px] border-brand-red px-[8px] py-[3px]">
                <Editable isAdmin={isAdmin} onSave={(v) => handleTextChange(setBadge, v)}>{badge}</Editable>
              </span>
              <span className="font-mono text-[11px] text-neutral-400 uppercase tracking-widest">
                <Editable isAdmin={isAdmin} onSave={(v) => handleTextChange(setReadTime, v)}>{readTime}</Editable>
              </span>
            </div>

            <h1 className="font-display text-[34px] md:text-[48px] leading-[1.1] text-black mb-6 text-center">
              <Editable isAdmin={isAdmin} onInputText={(v) => updateSharedRef('title', v)} onSave={(v) => handleTextChange(setTitle, v)} placeholder="Click to write your post title...">{title}</Editable>
            </h1>

            <div className="italic text-[18px] border-l-[3px] border-brand-red pl-6 mb-8 text-black/90 leading-[1.6]">
              <Editable isAdmin={isAdmin} onInputText={(v) => updateSharedRef('executiveSummary', v)} onSave={(v) => handleTextChange(setExecutiveSummary, v)} placeholder="Click to write executive summary...">{executiveSummary}</Editable>
            </div>

            <div className="font-mono text-[11px] text-neutral-400 mb-8 uppercase tracking-widest text-center">
              By {authorName || "TattoosMap"} — <Editable isAdmin={isAdmin} onSave={(v) => handleTextChange(setUpdatedDate, v)}>{updatedDate}</Editable>
            </div>
          </div>
        </div>

        {/* 2. HERO SECTION */}
        <div className="w-full relative aspect-[16/9] md:aspect-[21/9] max-h-[500px] overflow-hidden mb-12 order-2 md:order-1 bg-neutral-100 group">
          {heroImageSrc && typeof heroImageSrc === "string" && heroImageSrc.trim() !== "" && !heroImageSrc.includes("placeholder") ? (
            <Image
              src={heroImageSrc}
              alt={heroImageAlt || title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center pointer-events-none">
              <ImageIcon className="w-8 h-8 text-neutral-400 mb-3" />
              <span className="font-mono text-[12px] text-neutral-400 uppercase tracking-widest mb-1">Click to Upload Hero Image</span>
              <span className="font-mono text-[10px] text-neutral-300 uppercase tracking-widest">1600 × 900px recommended — WebP or AVIF under 400KB</span>
            </div>
          )}
          {isAdmin && (
            <label className="absolute bottom-4 right-4 z-[10] bg-black text-white hover:bg-neutral-900 border border-neutral-800 font-mono text-[9px] uppercase tracking-widest px-4 py-2 cursor-pointer transition-colors">
              CHANGE HERO IMAGE
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const fd = new FormData();
                    fd.append('file', file);
                    const res = await uploadProductImageAction(fd);
                    if (res.success && res.url) {
                      setHeroImageSrc(res.url);
                    }
                  }
                }}
              />
            </label>
          )}
        </div>

        {/* MAIN BODY */}
        <main className="max-w-[680px] mx-auto px-5 pb-24 order-3">
          {/* TABLE OF CONTENTS */}
          {autoTocItems.length > 0 && (
            <div className="border border-gray-light bg-off-white p-6 mb-12">
              <div className="font-mono text-[11px] uppercase text-black mb-4 tracking-widest">CONTENTS</div>
              <ol className="list-decimal pl-5 space-y-2 font-sans text-[14px] text-brand-red marker:text-brand-red">
                {autoTocItems.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`} className="hover:underline">{item.label}</a>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <AddSectionButton isAdmin={isAdmin} onAdd={handleAddSection} anchor="top" />

          {/* TOOL MARKER PLACEHOLDER: TOP */}
          {toolMarkers.filter(tm => tm.anchor === 'top').map((tm, i) => (
            <div key={`tool-top-${i}`} className="relative group my-8 border border-brand-red/30 bg-brand-red/5 p-6 text-left">
              <SectionToolbar isAdmin={isAdmin} onRemove={() => setToolMarkers(prev => prev.filter(p => p !== tm))} />
              <div className="text-center">
                <span className="font-mono text-[9px] uppercase text-brand-red tracking-widest block mb-2 font-bold">EMBEDDED TOOL</span>
                <p className="font-display text-[18px] uppercase text-black mb-1">{tm.toolId.replace(/_/g, ' ')}</p>
              </div>
            </div>
          ))}

          {/* QUICK ANSWER / EXECUTIVE SUMMARY */}
          {shortAnswer && (
            <div id="quick-answer" className="mb-16 relative group text-center">
              <SectionToolbar 
                isAdmin={isAdmin} 
                onRemove={() => { setShortAnswer(""); setToast("Quick Answer removed"); }}
              />
              {shortAnswerHeading && (
                <h2 className="font-display text-[28px] uppercase tracking-tight text-black mb-4 mt-12 text-center">
                  <Editable isAdmin={isAdmin} onSave={(v) => handleTextChange(setShortAnswerHeading, v)}>{shortAnswerHeading}</Editable>
                </h2>
              )}
              <p className="font-sans text-[18px] leading-[1.6] text-black/90 max-w-[620px] mx-auto mb-12">
                <Editable isAdmin={isAdmin} onInputText={(v) => updateSharedRef('shortAnswer', v)} onSave={(v) => handleTextChange(setShortAnswer, v)} placeholder="Click to write the quick summary answer...">{shortAnswer}</Editable>
              </p>
            </div>
          )}

          <AddSectionButton isAdmin={isAdmin} onAdd={handleAddSection} anchor="science" />

          {/* TOOL MARKER PLACEHOLDER: SCIENCE */}
          {toolMarkers.filter(tm => tm.anchor === 'science').map((tm, i) => (
            <div key={`tool-science-${i}`} className="relative group my-8 border border-brand-red/30 bg-brand-red/5 p-6 text-left">
              <SectionToolbar isAdmin={isAdmin} onRemove={() => setToolMarkers(prev => prev.filter(p => p !== tm))} />
              <div className="text-center">
                <span className="font-mono text-[9px] uppercase text-brand-red tracking-widest block mb-2 font-bold">EMBEDDED TOOL</span>
                <p className="font-display text-[18px] uppercase text-black mb-1">{tm.toolId.replace(/_/g, ' ')}</p>
              </div>
            </div>
          ))}

          {/* THE SCIENCE SECTION */}
          {scienceContent && (
            <div id="science" className="mb-16 relative group">
              <SectionToolbar 
                isAdmin={isAdmin} 
                onRemove={() => { setScienceContent(""); setToast("Science Section removed"); }}
              />
              <h2 className="font-display text-[28px] uppercase tracking-tight text-black mb-4 mt-12 text-center">
                <Editable isAdmin={isAdmin} onInputText={(v) => updateSharedRef('scienceHeading', v)} onSave={(v) => handleTextChange(setScienceHeading, v)}>{scienceHeading}</Editable>
              </h2>
              <div className="font-sans text-[17px] leading-[1.6] text-black/90">
                <Editable isAdmin={isAdmin} onInputText={(v) => updateSharedRef('scienceContent', v)} onSave={(v) => handleTextChange(setScienceContent, v)} tag="div" multiline={true} placeholder="Click to write biological mechanism...">
                  {scienceContent}
                </Editable>
              </div>
            </div>
          )}

          <AddSectionButton isAdmin={isAdmin} onAdd={handleAddSection} anchor="pull-quote" />

          {/* TOOL MARKER PLACEHOLDER: PULL QUOTE */}
          {toolMarkers.filter(tm => tm.anchor === 'pull-quote').map((tm, i) => (
            <div key={`tool-pull-quote-${i}`} className="relative group my-8 border border-brand-red/30 bg-brand-red/5 p-6 text-left">
              <SectionToolbar isAdmin={isAdmin} onRemove={() => setToolMarkers(prev => prev.filter(p => p !== tm))} />
              <div className="text-center">
                <span className="font-mono text-[9px] uppercase text-brand-red tracking-widest block mb-2 font-bold">EMBEDDED TOOL</span>
                <p className="font-display text-[18px] uppercase text-black mb-1">{tm.toolId.replace(/_/g, ' ')}</p>
              </div>
            </div>
          ))}

          {/* PULL QUOTE */}
          {pullQuote && (
            <div className="relative group border-l-4 border-brand-red bg-black p-6 my-16">
              <SectionToolbar 
                isAdmin={isAdmin} 
                onRemove={() => { setPullQuote(""); setToast("Pull Quote removed"); }}
              />
              <span className="font-mono text-[9px] uppercase text-neutral-500 tracking-widest block mb-3">SHARE THIS</span>
              <p className="font-display text-[20px] text-white italic leading-snug">
                "<Editable isAdmin={isAdmin} onInputText={(v) => updateSharedRef('pullQuote', v)} onSave={(v) => handleTextChange(setPullQuote, v)} placeholder="Click to write shareable pull quote...">{pullQuote}</Editable>"
              </p>
            </div>
          )}

          {/* INVEST BLOCK */}
          {investContent && (
            <div className="relative group border border-brand-red p-6 my-8" style={{background: 'rgba(226,75,74,0.04)'}}>
              <SectionToolbar isAdmin={isAdmin} onRemove={() => { setInvestContent(""); setToast("Invest Section removed"); }} />
              <span className="font-mono text-[9px] uppercase text-brand-red tracking-widest block mb-3">FROM TATTOOSMAP</span>
              <Editable isAdmin={isAdmin} onSave={(v) => handleTextChange(setInvestContent, v)} tag="div" multiline={true} placeholder="Click to write from tattoosmap content...">
                {investContent}
              </Editable>
            </div>
          )}

          <AddSectionButton isAdmin={isAdmin} onAdd={handleAddSection} anchor="steps" />

          {/* TOOL MARKER PLACEHOLDER: STEPS */}
          {toolMarkers.filter(tm => tm.anchor === 'steps').map((tm, i) => (
            <div key={`tool-steps-${i}`} className="relative group my-8 border border-brand-red/30 bg-brand-red/5 p-6 text-left">
              <SectionToolbar isAdmin={isAdmin} onRemove={() => setToolMarkers(prev => prev.filter(p => p !== tm))} />
              <div className="text-center">
                <span className="font-mono text-[9px] uppercase text-brand-red tracking-widest block mb-2 font-bold">EMBEDDED TOOL</span>
                <p className="font-display text-[18px] uppercase text-black mb-1">{tm.toolId.replace(/_/g, ' ')}</p>
              </div>
            </div>
          ))}

          {/* STEP BY STEP SEQUENCE */}
          {steps.length > 0 && (
            <div id="steps" className="relative group border border-transparent hover:border-neutral-100 p-4 -mx-4 transition-colors mb-12">
              <SectionToolbar isAdmin={isAdmin} onRemove={() => { if(window.confirm("Remove entire sequence?")) setSteps([]); }} />
              
              {stepsHeading && (
                <h2 className="font-display text-[24px] uppercase tracking-tight text-black mb-8 border-b border-neutral-200 pb-3 text-center">
                  <Editable isAdmin={isAdmin} onSave={(v) => handleTextChange(setStepsHeading, v)}>{stepsHeading}</Editable>
                </h2>
              )}

              {steps.map((step, idx) => (
                <div key={step.id}>
                  {/* STEP CARD */}
                  <div className="border border-gray-light p-6 mb-8 relative group/item border border-transparent hover:border-dashed hover:border-neutral-200 transition-colors">
                    <SectionToolbar 
                      isAdmin={isAdmin} 
                      isItem={true}
                      onMoveUp={idx > 0 ? () => moveStep(idx, 'up') : undefined}
                      onMoveDown={idx < steps.length - 1 ? () => moveStep(idx, 'down') : undefined}
                      onDuplicate={() => duplicateStep(idx)}
                      onRemove={() => removeStep(idx)}
                    />

                    {/* Step number */}
                    <span className="font-mono text-[10px] text-brand-red uppercase tracking-widest block mb-3 font-bold">
                      <Editable isAdmin={isAdmin} onSave={(v) => handleArrayChange(setSteps, steps, idx, 'number', v)}>{step.number}</Editable>
                    </span>

                    {/* Two column on desktop, single on mobile */}
                    <div className="flex flex-col md:flex-row md:gap-8 md:items-start">

                      {/* LEFT — Text content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-[20px] uppercase tracking-tight text-black mb-4">
                          <Editable isAdmin={isAdmin} onSave={(v) => handleArrayChange(setSteps, steps, idx, 'title', v)}>{step.title}</Editable>
                        </h3>
                        <div className="font-sans text-[15px] leading-relaxed text-black/80 mb-4">
                          <Editable isAdmin={isAdmin} onSave={(v) => handleArrayChange(setSteps, steps, idx, 'content', v)} tag="p" multiline={true}>
                            {step.content}
                          </Editable>
                        </div>

                        {/* Optional tip or warning callout */}
                        {step.tip && (
                          <div className={`border-l-2 pl-4 py-2 ${
                            step.tipType === 'warning'
                              ? 'border-brand-red bg-brand-red/5'
                              : 'border-amber-400 bg-amber-50'
                          }`}>
                            <span className={`font-mono text-[9px] uppercase tracking-widest block mb-1 font-bold ${
                              step.tipType === 'warning' ? 'text-brand-red' : 'text-amber-600'
                            }`}>
                              {step.tipType === 'warning' ? 'WARNING' : 'TIP'}
                            </span>
                            <div className="font-sans text-[13px] text-black/70">
                              <Editable isAdmin={isAdmin} onSave={(v) => handleArrayChange(setSteps, steps, idx, 'tip', v)} placeholder="Click to edit callout text...">{step.tip}</Editable>
                            </div>
                          </div>
                        )}

                        {/* TIP/WARNING TOGGLES (ADMIN ONLY) */}
                        {isAdmin && (
                          <div className="mt-4 flex gap-2">
                            {step.tip ? (
                              <button 
                                onClick={() => handleArrayChange(setSteps, steps, idx, 'tip', '')}
                                className="border border-neutral-300 font-mono text-[8px] uppercase tracking-widest px-3 py-1 hover:border-black text-neutral-500 hover:text-black transition-colors"
                              >
                                REMOVE {step.tipType === 'warning' ? 'WARNING' : 'TIP'}
                              </button>
                            ) : (
                              <>
                                <button 
                                  onClick={() => {
                                    const updated = [...steps];
                                    updated[idx] = { ...updated[idx], tip: "Click to write a tip...", tipType: "tip" };
                                    setSteps(updated);
                                  }}
                                  className="border border-neutral-300 font-mono text-[8px] uppercase tracking-widest px-3 py-1 hover:border-black text-neutral-500 hover:text-black transition-colors"
                                >
                                  + ADD TIP
                                </button>
                                <button 
                                  onClick={() => {
                                    const updated = [...steps];
                                    updated[idx] = { ...updated[idx], tip: "Click to write a warning...", tipType: "warning" };
                                    setSteps(updated);
                                  }}
                                  className="border border-neutral-300 font-mono text-[8px] uppercase tracking-widest px-3 py-1 hover:border-black text-neutral-500 hover:text-black transition-colors"
                                >
                                  + ADD WARNING
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {/* RIGHT — Image */}
                      <div className="w-full md:w-[280px] shrink-0 mt-4 md:mt-0">
                        {step.imageSrc ? (
                          <div className="relative aspect-square w-full overflow-hidden bg-off-white border border-gray-light">
                            <Image
                              src={step.imageSrc}
                              alt={step.imageAlt || step.title}
                              fill
                              sizes="(max-width: 768px) 100vw, 280px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="aspect-square w-full bg-off-white border border-dashed border-neutral-300 flex flex-col items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-neutral-300 mb-2" />
                            <span className="font-mono text-[9px] uppercase text-neutral-300 tracking-widest text-center px-2">
                              Add image for this step
                            </span>
                          </div>
                        )}

                        {/* Image upload button — admin only */}
                        {isAdmin && (
                          <label className="block mt-2 w-full border border-neutral-300 font-mono text-[9px] uppercase tracking-widest py-2 text-center text-neutral-400 hover:border-black hover:text-black transition-colors cursor-pointer">
                            {step.imageSrc ? 'Replace Image' : 'Upload Image'}
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const fd = new FormData();
                                  fd.append('file', file);
                                  const res = await uploadProductImageAction(fd);
                                  if (res.success && res.url) {
                                    onStepImageUpload(step.id, res.url);
                                  }
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ADD STEP BUTTON BETWEEN STEPS */}
                  {isAdmin && (
                    <button
                      onClick={() => addStep(idx)}
                      className="w-full border border-dashed border-neutral-300 py-4 font-mono text-[10px] uppercase tracking-widest text-neutral-400 hover:border-brand-red hover:text-brand-red transition-colors mb-8"
                    >
                      + ADD STEP HERE
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Handle Empty Steps Block For Creation */}
          {steps.length === 0 && isAdmin && (
            <div className="mb-12">
              <button
                onClick={() => addStep(-1)}
                className="w-full border-2 border-dashed border-neutral-200 py-12 font-mono text-[11px] uppercase tracking-widest text-neutral-400 hover:border-brand-red hover:text-brand-red hover:bg-neutral-50 transition-all flex flex-col items-center justify-center gap-3 group/add mb-8"
              >
                <Plus className="w-6 h-6 text-neutral-400 group-hover/add:text-brand-red transition-colors" />
                <span>+ Add Step Sequence</span>
              </button>
            </div>
          )}

          <AddSectionButton isAdmin={isAdmin} onAdd={handleAddSection} anchor="faq" />

          {/* FAQ ACCORDION */}
          {faqItems.length > 0 && (
            <div id="faq" className="relative group border border-transparent hover:border-neutral-100 p-4 -mx-4 transition-colors mb-12">
              <SectionToolbar isAdmin={isAdmin} onRemove={() => { if(window.confirm("Remove entire FAQ section?")) setFaqItems([]); }} />
              
              {faqHeading && (
                <h2 className="font-display text-[24px] uppercase tracking-tight text-black mb-6 text-center">
                  <Editable isAdmin={isAdmin} onSave={(v) => handleTextChange(setFaqHeading, v)}>{faqHeading}</Editable>
                </h2>
              )}
              <div className="border border-neutral-200 divide-y divide-neutral-200">
                {faqItems.map((item, idx) => (
                  <div key={idx} className="relative group/item border border-transparent hover:border-dashed hover:border-neutral-200">
                    <SectionToolbar isAdmin={isAdmin} isItem={true}
                      onMoveUp={idx > 0 ? () => handleArrayMove(setFaqItems, faqItems, idx, 'up') : undefined}
                      onMoveDown={idx < faqItems.length - 1 ? () => handleArrayMove(setFaqItems, faqItems, idx, 'down') : undefined}
                      onRemove={() => handleArrayRemove(setFaqItems, faqItems, idx, 'faqItem')}
                    />
                    <FAQAccordion 
                      question={isAdmin ? <Editable isAdmin={isAdmin} onSave={(v) => handleArrayChange(setFaqItems, faqItems, idx, 'question', v)}>{item.question}</Editable> : item.question} 
                      answer={isAdmin ? <Editable isAdmin={isAdmin} onSave={(v) => handleArrayChange(setFaqItems, faqItems, idx, 'answer', v)}>{item.answer}</Editable> : item.answer} 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* COMMENT DISCUSSION */}
          {!isAdmin && postId && (
            <div id="discussion-anchor" className="my-12">
              <CommentSection postId={postId} comments={comments} />
            </div>
          )}

          {/* CALL TO ACTION */}
          {ctaHeading && (
            <section className="bg-black py-16 px-8 my-16 text-center relative group">
              <SectionToolbar 
                isAdmin={isAdmin} 
                onRemove={() => { setCtaHeading(""); setToast("Call to Action removed"); }}
              />
              <span className="font-mono text-[10px] uppercase text-neutral-500 tracking-widest block mb-4">TATTOOSMAP DESIGN LIBRARY</span>
              <h2 className="font-display text-[36px] text-white leading-tight mb-4 uppercase">
                <Editable isAdmin={isAdmin} onSave={(v) => handleTextChange(setCtaHeading, v)}>{ctaHeading}</Editable>
              </h2>
              <p className="font-sans text-[16px] text-neutral-400 max-w-[420px] mx-auto mb-8 leading-relaxed">
                <Editable isAdmin={isAdmin} onSave={(v) => handleTextChange(setCtaBody, v)}>{ctaBody}</Editable>
              </p>
              <div className="flex flex-col items-center gap-4">
                {isAdmin && (
                  <div className="mb-2">
                    <Editable isAdmin={isAdmin} onSave={(v) => handleTextChange(setCtaButtonHref, v)} className="text-[10px] text-neutral-500 font-mono underline uppercase tracking-widest">Button URL: {ctaButtonHref}</Editable>
                  </div>
                )}
                <a 
                  href={ctaButtonHref} 
                  className="inline-block bg-brand-red text-white font-mono text-[12px] uppercase px-10 py-4 hover:bg-red-700 transition-colors tracking-widest"
                >
                  <Editable isAdmin={isAdmin} onSave={(v) => handleTextChange(setCtaButtonText, v)}>{ctaButtonText}</Editable>
                </a>
              </div>
            </section>
          )}
        </main>
        
        {/* UNIFIED HIGH-END RELATED POSTS (Full Width, Order 5) */}
        <div className="order-5 w-full">
          <RelatedPosts posts={relatedPosts || []} />
        </div>
      </div>

      {/* UNDO / TOAST BANNER (ADMIN ONLY) */}
      {(toast || undoStack) && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black text-white font-mono text-[11px] uppercase tracking-widest py-4 px-6 shadow-2xl z-[500] flex items-center gap-4">
          <span>{toast || "Action performed"}</span>
          {undoStack && (
            <button 
              onClick={undoRemove}
              className="text-amber-400 hover:text-amber-300 font-bold underline transition-colors"
            >
              UNDO
            </button>
          )}
        </div>
      )}

      {showToolPicker && (
        <div className="fixed inset-0 bg-black/70 z-[300] flex items-center justify-center p-6">
          <div className="bg-white max-w-[540px] w-full border border-black p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-display text-[24px] uppercase tracking-tight text-black">Choose A Tool</h3>
              <button onClick={() => setShowToolPicker(false)}><X className="w-5 h-5 text-black" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-left">
              {[
                { id: 'SKIN_COMPATIBILITY', label: 'Skin Compatibility Checker', desc: 'For aftercare product posts' },
                { id: 'PAIN_SIMULATOR', label: 'Laser Removal Pain Simulator', desc: 'For tattoo removal posts only' },
                { id: 'HEALING_TRACKER', label: 'Healing Day Tracker', desc: 'For aftercare and healing posts' },
                { id: 'JOURNEY_ESTIMATOR', label: 'Removal Journey Estimator', desc: 'For tattoo removal posts' },
                { id: 'PAIN_MAP', label: 'Pain Map', desc: 'For placement and pain posts' },
                { id: 'COST_CALCULATOR', label: 'Size + Cost Calculator', desc: 'For cost and pricing posts' },
              ].map(tool => (
                <button
                  key={tool.id}
                  onClick={() => {
                    if (toolPickerAnchor) {
                      setToolMarkers(prev => [...prev, { toolId: tool.id, anchor: toolPickerAnchor }]);
                      setToolPickerAnchor(null);
                    }
                    setShowToolPicker(false);
                    setToast(`Tool Added — ${tool.label.toUpperCase()}`);
                  }}
                  className="border border-black p-4 text-left hover:bg-neutral-50 transition-colors text-black"
                >
                  <span className="font-mono text-[10px] uppercase tracking-widest font-bold block mb-1">{tool.label}</span>
                  <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest">{tool.desc}</span>
                </button>
              ))}
            </div>
            <button 
              onClick={() => setShowToolPicker(false)}
              className="w-full mt-6 border border-neutral-300 font-mono text-[11px] uppercase py-3 hover:bg-neutral-50 transition-colors text-black"
            >
              CANCEL — NO TOOL NEEDED
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
