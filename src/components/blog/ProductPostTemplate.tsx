"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Image from 'next/image';
import ReadingProgressBar from "@/components/blog/ReadingProgressBar";
import FAQAccordion from "@/components/blog/FAQAccordion";
import CommentSection, { CommentItem } from "./CommentSection";
import { 
  Plus, Trash2, ArrowUp, ArrowDown, Copy, Camera, 
  Save, RotateCcw, X, Edit3, ExternalLink, Check, Loader2, Image as ImageIcon
} from "lucide-react";
import { uploadProductImageAction, updatePostAction } from "@/actions/admin";
import { useRouter } from "next/navigation";

export interface ProductPostTemplateProps {
  isAdmin?: boolean;
  postId?: string;
  slug?: string;
  postType?: "RECOMMEND AND SELL" | "INFORM AND REFER";
  badge?: string;
  readTime?: string;
  title: string;
  date?: string;
  executiveSummary: string;
  heroImageSrc: string;
  heroImageAlt: string;
  scienceHeading?: string;
  scienceContent: React.ReactNode;
  pullQuote: string;
  investContent?: React.ReactNode;
  toolSlot?: React.ReactNode;
  showProtocol?: boolean;
  products?: {
    rank: number;
    name: string;
    badge: string;
    imageSrc: string;
    imageAlt: string;
    description: string;
    price: string;
    buttonLabel?: string;
    affiliateUrl: string;
    honest_limitation?: string;
  }[];
  honorableMentions?: {
    name: string;
    price: string;
    description: string;
    affiliateUrl: string;
  }[];
  protocolSteps?: {
    number: string;
    title: string;
    content: string;
  }[];
  avoidItems?: {
    item: string;
    reason: string;
  }[];
  infoSections?: {
    id: string;
    heading: string;
    content: React.ReactNode;
  }[];
  prosCons?: {
    id: string;
    heading: string;
    pros: string[];
    cons: string[];
  }[];
  embeddedTool?: React.ReactNode;
  faqItems: {
    question: string;
    answer: string;
  }[];
  ctaHeading?: string;
  ctaBody?: string;
  ctaButtonText?: string;
  ctaButtonHref?: string;
  clinicCtaHeading?: string;
  clinicCtaBody?: string;
  clinicCtaButtonText?: string;
  clinicCtaButtonHref?: string;
  relatedPosts: {
    title: string;
    href: string;
  }[];
  tocItems: {
    id: string;
    label: string;
  }[];
  rankedListHeading?: string;
  protocolHeading?: string;
  avoidHeading?: string;
  faqHeading?: string;
  shortAnswerHeading?: string;
  toolMarkers?: { toolId: string; anchor: string }[];
  mode?: "edit" | "create";
  onCreate?: (data: any) => Promise<void>;
  onChange?: (state: any) => void;
  category?: string;
  tags?: string[];
  sharedStateRef?: React.RefObject<any>;
  authorName?: string;
  authorAvatarUrl?: string;
}

// 1. SECTION TOOLBAR helper (Moved outside to preserve focus)
const SectionToolbar = ({ isAdmin, onMoveUp, onMoveDown, onDuplicate, onRemove, isItem = false }: { isAdmin: boolean, onMoveUp?: () => void, onMoveDown?: () => void, onDuplicate?: () => void, onRemove?: () => void, isItem?: boolean }) => {
  if (!isAdmin) return null;
  const hoverClass = isItem ? "group-hover/item:opacity-100" : "group-hover:opacity-100";
  return (
    <div className={`absolute top-0 right-0 z-[100] opacity-0 ${hoverClass} transition-opacity bg-white border border-black flex items-center font-mono text-[9px] uppercase tracking-widest divide-x divide-black pointer-events-auto`}>
      {onMoveUp && <button onClick={onMoveUp} className="px-3 py-2 hover:bg-neutral-50 flex items-center gap-1"><ArrowUp className="w-3 h-3" /> Up</button>}
      {onMoveDown && <button onClick={onMoveDown} className="px-3 py-2 hover:bg-neutral-50 flex items-center gap-1"><ArrowDown className="w-3 h-3" /> Down</button>}
      {onDuplicate && <button onClick={onDuplicate} className="px-3 py-2 hover:bg-neutral-50 flex items-center gap-1"><Copy className="w-3 h-3" /> Dup</button>}
      {onRemove && <button onClick={onRemove} className="px-3 py-2 hover:bg-brand-red hover:text-white transition-colors flex items-center gap-1"><Trash2 className="w-3 h-3" /> Remove</button>}
    </div>
  );
};

// 2. ADD SECTION BUTTON helper (Moved outside to preserve focus)
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
        <div className="absolute top-10 z-[150] bg-white border border-black p-6 shadow-2xl w-[400px]">
          <div className="flex justify-between items-center mb-6">
            <span className="font-mono text-[10px] uppercase tracking-widest font-bold">Add Section</span>
            <button onClick={() => setIsOpen(false)}><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {['Product Card', 'Honorable Mention', 'Protocol Section', 'FAQ Section', 'Avoid Section', 'Pros Cons Grid', 'Pull Quote', 'Invest Block', 'Science Section', 'Short Answer', 'Info Section', 'Tool'].map(type => (
              <button 
                key={type}
                onClick={() => { onAdd(type, anchor); setIsOpen(false); }}
                className="border border-black p-3 font-mono text-[9px] uppercase tracking-widest hover:bg-neutral-50 text-left flex items-center gap-2"
              >
                <Plus className="w-3 h-3" /> {type}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// 3. EDITABLE WRAPPER helper (Moved outside to preserve focus)
const Editable = ({ isAdmin, children, onSave, onInputText, className = "", multiline = false, tag: Tag = "span", placeholder }: { isAdmin: boolean, children: React.ReactNode, onSave: (val: string) => void, onInputText?: (val: string) => void, className?: string, multiline?: boolean, tag?: any, placeholder?: string }) => {
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

export default function ProductPostTemplate({
  isAdmin = false,
  postId,
  slug: initialSlug,
  postType: initialPostType = "RECOMMEND AND SELL",
  badge: initialBadge = "PRODUCT GUIDE",
  readTime: initialReadTime = "7 MIN READ",
  title: initialTitle = "",
  date: initialDate = "Updated April 2026",
  executiveSummary: initialExecutiveSummary = "",
  heroImageSrc: initialHeroImageSrc = "https://images.unsplash.com/photo-1590210315325-d41fe0dfc73c?q=80&w=2670&auto=format&fit=crop",
  heroImageAlt: initialHeroImageAlt = "Tattoo Art",
  scienceHeading: initialScienceHeading = "Why Fragrance-Free Is Non-Negotiable",
  scienceContent: initialScienceContent = "",
  pullQuote: initialPullQuote = "",
  investContent: initialInvestContent = "",
  toolSlot,
  showProtocol: initialShowProtocol = true,
  products: initialProducts = [],
  honorableMentions: initialHonorableMentions = [],
  protocolSteps: initialProtocolSteps = [],
  avoidItems: initialAvoidItems = [],
  infoSections: initialInfoSections = [],
  prosCons: initialProsCons = [],
  embeddedTool,
  faqItems: initialFaqItems = [],
  ctaHeading: initialCtaHeading = "Find Your Perfect Design",
  ctaBody: initialCtaBody = "Browse verified designs, see how they age over 5 years, and save your favorites before your consultation.",
  ctaButtonText: initialCtaButtonText = "EXPLORE THE GALLERY →",
  ctaButtonHref: initialCtaButtonHref = "/gallery",
  clinicCtaHeading: initialClinicCtaHeading = "Ready To Start?",
  clinicCtaBody: initialClinicCtaBody = "Get a free consultation from a verified removal clinic.",
  clinicCtaButtonText: initialClinicCtaButtonText = "FIND A CLINIC NEAR YOU",
  clinicCtaButtonHref: initialClinicCtaButtonHref = "/removal",
  relatedPosts: initialRelatedPosts = [],
  tocItems: initialTocItems = [],
  toolMarkers: initialToolMarkers = [],
  mode = "edit",
  onCreate,
  onChange,
  category: initialCategory = "Aftercare",
  tags: initialTags = ["Tattoo Guide"],
  rankedListHeading: initialRankedListHeading = "The Ranked List",
  protocolHeading: initialProtocolHeading = "Exactly What To Do, Day by Day",
  avoidHeading: initialAvoidHeading = "What To Never Use",
  faqHeading: initialFaqHeading = "Frequently Asked Questions",
  shortAnswerHeading: initialShortAnswerHeading = "The Short Answer",
  sharedStateRef,
  authorName,
  authorAvatarUrl
}: ProductPostTemplateProps) {
  const router = useRouter();

  // EDITOR STATE
  const [title, setTitle] = useState(initialTitle);
  const [executiveSummary, setExecutiveSummary] = useState(initialExecutiveSummary);
  const [scienceHeading, setScienceHeading] = useState(initialScienceHeading);
  const [scienceContent, setScienceContent] = useState(initialScienceContent);
  const [pullQuote, setPullQuote] = useState(initialPullQuote);
  const [products, setProducts] = useState(initialProducts);
  const [honorableMentions, setHonorableMentions] = useState(initialHonorableMentions);
  const [protocolSteps, setProtocolSteps] = useState(initialProtocolSteps);
  const [avoidItems, setAvoidItems] = useState(initialAvoidItems);
  const [infoSections, setInfoSections] = useState(initialInfoSections);
  const [prosCons, setProsCons] = useState(initialProsCons);
  const [faqItems, setFaqItems] = useState(initialFaqItems);
  const [heroImageSrc, setHeroImageSrc] = useState(initialHeroImageSrc);
  const [heroImageAlt, setHeroImageAlt] = useState(initialHeroImageAlt);
  const [badge, setBadge] = useState(initialBadge);
  const [readTime, setReadTime] = useState(initialReadTime);
  const [ctaHeading, setCtaHeading] = useState(initialCtaHeading);
  const [ctaBody, setCtaBody] = useState(initialCtaBody);
  const [ctaButtonText, setCtaButtonText] = useState(initialCtaButtonText);
  const [ctaButtonHref, setCtaButtonHref] = useState(initialCtaButtonHref);
  const [clinicCtaHeading, setClinicCtaHeading] = useState(initialClinicCtaHeading);
  const [clinicCtaBody, setClinicCtaBody] = useState(initialClinicCtaBody);
  const [clinicCtaButtonText, setClinicCtaButtonText] = useState(initialClinicCtaButtonText);
  const [clinicCtaButtonHref, setClinicCtaButtonHref] = useState(initialClinicCtaButtonHref);
  const [investContent, setInvestContent] = useState(initialInvestContent);
  const [postType, setPostType] = useState(initialPostType);
  const [category, setCategory] = useState(initialCategory);
  const [tags, setTags] = useState(initialTags);
  const [rankedListHeading, setRankedListHeading] = useState(initialRankedListHeading);
  const [protocolHeading, setProtocolHeading] = useState(initialProtocolHeading);
  const [avoidHeading, setAvoidHeading] = useState(initialAvoidHeading);
  const [faqHeading, setFaqHeading] = useState(initialFaqHeading);
  const [shortAnswerHeading, setShortAnswerHeading] = useState(initialShortAnswerHeading);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'undo'} | null>(null);
  const [removedItem, setRemovedItem] = useState<{array: string, index: number, item: any} | null>(null);

  const [showToolPicker, setShowToolPicker] = useState(false);
  const [toolPickerAnchor, setToolPickerAnchor] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [toolMarkers, setToolMarkers] = useState<{ toolId: string, anchor: string }[]>(initialToolMarkers);

  const [updatedDate, setUpdatedDate] = useState(() => {
    if (initialDate && initialDate !== "Updated April 2026") return initialDate;
    const now = new Date();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `Updated ${months[now.getMonth()]} ${now.getFullYear()}`;
  });

  const autoTocItems = useMemo(() => {
    const items: { id: string; label: string }[] = [];

    // Short answer is always first if title exists
    if (title) {
      items.push({ id: 'auto-short-answer', label: 'The Short Answer' });
    }

    // Science section if content exists
    if (scienceContent) {
      items.push({ id: 'science', label: scienceHeading || 'Why This Matters' });
    }

    // Info sections for INFORM AND REFER
    infoSections.forEach(sec => {
      items.push({ id: sec.id, label: sec.heading });
    });

    // Pros & Cons sections
    prosCons.forEach(pc => {
      items.push({ id: pc.id, label: pc.heading });
    });

    // Ranked list for RECOMMEND AND SELL
    if (postType === 'RECOMMEND AND SELL' && products.length > 0) {
      items.push({ id: 'ranked-list', label: 'The Ranked List' });
    }

    // Protocol steps
    if (protocolSteps.length > 0) {
      items.push({ id: 'protocol', label: 'What To Do, Day by Day' });
    }

    // Avoid list
    if (avoidItems.length > 0) {
      items.push({ id: 'avoid-list', label: 'What To Never Use' });
    }

    // FAQ
    if (faqItems.length > 0) {
      items.push({ id: 'faq', label: 'Frequently Asked Questions' });
    }

    // Append Community Discussion
    items.push({ id: 'discussion', label: 'Community Discussion' });

    return items;
  }, [title, scienceContent, scienceHeading, infoSections, prosCons, postType, products, protocolSteps, avoidItems, faqItems]);

  // SYNCHRONOUS REF SYNCING (Mutates shared reference with no re-renders or infinite loop risks)
  useEffect(() => {
    if (sharedStateRef && sharedStateRef.current) {
      Object.assign(sharedStateRef.current, {
        title, executiveSummary, scienceHeading, scienceContent, pullQuote, products, honorableMentions, protocolSteps,
        avoidItems, infoSections, prosCons, faqItems, heroImageSrc, heroImageAlt, badge, readTime, ctaHeading, ctaBody,
        ctaButtonText, ctaButtonHref, clinicCtaHeading, clinicCtaBody, clinicCtaButtonText, clinicCtaButtonHref,
        investContent, postType, category, tags, selectedTool, updatedDate, toolMarkers,
        rankedListHeading, protocolHeading, avoidHeading, faqHeading, shortAnswerHeading
      });
    }
  }, [
    title, executiveSummary, scienceHeading, scienceContent, pullQuote, products, honorableMentions, protocolSteps,
    avoidItems, infoSections, prosCons, faqItems, heroImageSrc, heroImageAlt, badge, readTime, ctaHeading, ctaBody,
    ctaButtonText, ctaButtonHref, clinicCtaHeading, clinicCtaBody, clinicCtaButtonText, clinicCtaButtonHref,
    investContent, postType, category, tags, selectedTool, updatedDate, toolMarkers,
    rankedListHeading, protocolHeading, avoidHeading, faqHeading, shortAnswerHeading, sharedStateRef
  ]);

  // Helper to synchronously update the shared ref on rapid keystroke events before local blur state commits
  const updateSharedRef = (key: string, val: any) => {
    if (sharedStateRef && sharedStateRef.current) {
      sharedStateRef.current[key] = val;
    }
  };

  // SAFE DEBOUNCED PREVIEW SYNC (Handles live previews without triggering synchronous render cycles/loops)
  useEffect(() => {
    if (onChange) {
      const handler = setTimeout(() => {
        onChange({
          title, executiveSummary, scienceHeading, scienceContent, pullQuote, products, honorableMentions, protocolSteps,
          avoidItems, infoSections, prosCons, faqItems, heroImageSrc, heroImageAlt, badge, readTime, ctaHeading, ctaBody,
          ctaButtonText, ctaButtonHref, clinicCtaHeading, clinicCtaBody, clinicCtaButtonText, clinicCtaButtonHref,
          investContent, postType, category, tags, selectedTool, updatedDate, toolMarkers,
          rankedListHeading, protocolHeading, avoidHeading, faqHeading, shortAnswerHeading
        });
      }, 400);
      return () => clearTimeout(handler);
    }
  }, [
    title, executiveSummary, scienceHeading, scienceContent, pullQuote, products, honorableMentions, protocolSteps,
    avoidItems, infoSections, prosCons, faqItems, heroImageSrc, heroImageAlt, badge, readTime, ctaHeading, ctaBody,
    ctaButtonText, ctaButtonHref, clinicCtaHeading, clinicCtaBody, clinicCtaButtonText, clinicCtaButtonHref,
    investContent, postType, category, tags, onChange, selectedTool, updatedDate, toolMarkers,
    rankedListHeading, protocolHeading, avoidHeading, faqHeading, shortAnswerHeading
  ]);

  // UNSAVED CHANGES GUARD
  useEffect(() => {
    if (!isAdmin) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, isAdmin]);

  // SYNC PROPS TO STATE (Fix: Category auto-clear)
  useEffect(() => {
    if (initialCategory && initialCategory !== category) {
      setCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    if (initialTags && JSON.stringify(initialTags) !== JSON.stringify(tags)) {
      setTags(initialTags);
    }
  }, [initialTags]);

  // HELPER: Auto-save field changes to state
  const handleTextChange = (setter: Function, value: any) => {
    setter(value);
    setHasUnsavedChanges(true);
  };

  const discardChanges = () => {
    setTitle(initialTitle);
    setExecutiveSummary(initialExecutiveSummary);
    setScienceHeading(initialScienceHeading);
    setScienceContent(initialScienceContent);
    setPullQuote(initialPullQuote);
    setProducts(initialProducts);
    setHonorableMentions(initialHonorableMentions);
    setProtocolSteps(initialProtocolSteps);
    setAvoidItems(initialAvoidItems);
    setInfoSections(initialInfoSections);
    setProsCons(initialProsCons);
    setFaqItems(initialFaqItems);
    setHeroImageSrc(initialHeroImageSrc);
    setHeroImageAlt(initialHeroImageAlt);
    setBadge(initialBadge);
    setReadTime(initialReadTime);
    setCtaHeading(initialCtaHeading);
    setCtaBody(initialCtaBody);
    setCtaButtonText(initialCtaButtonText);
    setCtaButtonHref(initialCtaButtonHref);
    setClinicCtaHeading(initialClinicCtaHeading);
    setClinicCtaBody(initialClinicCtaBody);
    setClinicCtaButtonText(initialClinicCtaButtonText);
    setClinicCtaButtonHref(initialClinicCtaButtonHref);
    setInvestContent(initialInvestContent);
    setPostType(initialPostType);
    setHasUnsavedChanges(false);
    setShowDiscardConfirm(false);
  };

  const handlePublish = async () => {
    if (!hasUnsavedChanges || !postId) return;
    setIsPublishing(true);
    
    try {
      // Reconstruct Body Content (Markdown) and inject markers
      const getToolMarkersForAnchor = (anchor: string) => {
          return toolMarkers
              .filter((tm: any) => tm.anchor === anchor)
              .map((tm: any) => `:::tool[${tm.toolId}]:::\n\n`)
              .join("");
      };

      let mdBody = "";
      
      // Top anchor
      mdBody += executiveSummary ? `${executiveSummary}\n\n` : '';
      mdBody += getToolMarkersForAnchor("top");
      
      // Science anchor
      mdBody += scienceContent ? `## ${scienceHeading || "Why This Matters — The Science"}\n\n${scienceContent}\n\n` : '';
      mdBody += getToolMarkersForAnchor("science");
      
      // Pull quote anchor
      mdBody += pullQuote ? `:::invest\n💡 ${pullQuote}\n:::\n\n` : '';
      mdBody += getToolMarkersForAnchor("pull-quote");
      
      // Invest anchor
      mdBody += investContent ? `:::invest\n${investContent}\n:::\n\n` : '';
      mdBody += getToolMarkersForAnchor("invest");

      // Info sections
      if (infoSections && infoSections.length > 0) {
          infoSections.forEach((sec: any) => {
              mdBody += `## ${sec.heading}\n\n${sec.content}\n\n`;
              mdBody += getToolMarkersForAnchor(`info-${sec.id}`);
          });
      }

      // Pros & Cons sections
      if (prosCons && prosCons.length > 0) {
          prosCons.forEach((pc: any) => {
              mdBody += `### ${pc.heading}\n\n`;
              mdBody += `#### PROS\n`;
              if (pc.pros && pc.pros.length > 0) {
                  pc.pros.forEach((p: string) => mdBody += `- ${p}\n`);
              }
              mdBody += `\n#### CONS\n`;
              if (pc.cons && pc.cons.length > 0) {
                  pc.cons.forEach((c: string) => mdBody += `- ${c}\n`);
              }
              mdBody += `\n`;
              mdBody += getToolMarkersForAnchor(`proscons-${pc.id}`);
          });
      }

      // Products anchor
      mdBody += getToolMarkersForAnchor("products");

      // Protocol anchor
      mdBody += getToolMarkersForAnchor("protocol");

      // Avoid anchor
      mdBody += getToolMarkersForAnchor("avoid");

      // FAQ anchor
      mdBody += getToolMarkersForAnchor("faq");

      const formData = new FormData();
      formData.append("id", postId);
      formData.append("title", title);
      formData.append("excerpt", executiveSummary);
      formData.append("slug", initialSlug || "");
      formData.append("body_content", mdBody);
      formData.append("tool_markers", JSON.stringify(toolMarkers));
      formData.append("related_products", JSON.stringify(products));
      formData.append("protocol_steps", JSON.stringify(protocolSteps));
      formData.append("avoid_items", JSON.stringify(avoidItems));
      formData.append("faq_items", JSON.stringify(faqItems));
      formData.append("category", category);
      formData.append("tags", tags.join(', '));
      formData.append("current_image_url", heroImageSrc);

      if (mode === "create" && onCreate) {
        await onCreate({
          title,
          executiveSummary,
          body_content: mdBody,
          cover_image_url: heroImageSrc,
          cover_image_alt: heroImageAlt,
          category,
          tags,
          read_time_minutes: parseInt(readTime) || 5,
        });
      } else {
        const res = await updatePostAction(formData);
        if (res.success) {
          setHasUnsavedChanges(false);
          setToast({ message: "CHANGES PUBLISHED", type: "success" });
          setTimeout(() => setToast(null), 3000);
        } else {
          setToast({ message: "PUBLISH FAILED", type: "error" });
        }
      }
    } catch (err) {
      setToast({ message: "CONNECTION ERROR", type: "error" });
    } finally {
      setIsPublishing(false);
    }
  };

  const defaultInvestContent = (
    <p className="font-sans text-[15px] leading-relaxed text-black">
      Already have your design? Each design in our library includes the recommended aftercare protocol for its specific style and placement — fine line heals differently from blackwork.{' '}
      <a 
        href="/gallery" 
        className="inline-flex items-center gap-2 bg-brand-red text-white font-mono text-[10px] uppercase tracking-widest px-4 py-2 mt-3 hover:bg-red-600 transition-all hover:gap-3 group"
      >
        Browse verified designs <ArrowDown className="w-3 h-3 -rotate-90 group-hover:translate-x-1 transition-transform" />
      </a>
    </p>
  );

  const isRecommendAndSell = postType === "RECOMMEND AND SELL";
  const isInformAndRefer = postType === "INFORM AND REFER";

  // ARRAY HELPERS
  const handleArrayChange = (setter: Function, array: any[], index: number, field: string, value: any) => {
    const newArr = [...array];
    newArr[index] = { ...newArr[index], [field]: value };
    setter(newArr);
    setHasUnsavedChanges(true);
  };

  const handleArrayMove = (setter: Function, array: any[], index: number, direction: 'up' | 'down') => {
    const newArr = [...array];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newArr.length) return;
    [newArr[index], newArr[targetIndex]] = [newArr[targetIndex], newArr[index]];
    setter(newArr);
    setHasUnsavedChanges(true);
  };

  const handleArrayDuplicate = (setter: Function, array: any[], index: number) => {
    const newArr = [...array];
    const newItem = { ...newArr[index] };
    if (newItem.rank) newItem.rank = array.length + 1; // Simplistic rank update
    newArr.splice(index + 1, 0, newItem);
    setter(newArr);
    setHasUnsavedChanges(true);
  };

  const handleArrayRemove = (setter: Function, array: any[], index: number, arrayName: string) => {
    const item = array[index];
    setRemovedItem({ array: arrayName, index, item });
    const newArr = array.filter((_, i) => i !== index);
    setter(newArr);
    setHasUnsavedChanges(true);
    setToast({ message: `${arrayName.toUpperCase()} REMOVED`, type: 'undo' });
    setTimeout(() => setToast(null), 5000);
  };

  const undoRemove = () => {
    if (!removedItem) return;
    const { array, index, item } = removedItem;
    if (array === 'products') setProducts(prev => { const n = [...prev]; n.splice(index, 0, item); return n; });
    if (array === 'protocolSteps') setProtocolSteps(prev => { const n = [...prev]; n.splice(index, 0, item); return n; });
    if (array === 'prosCons') setProsCons(prev => { const n = [...prev]; n.splice(index, 0, item); return n; });
    if (array === 'faqItems') setFaqItems(prev => { const n = [...prev]; n.splice(index, 0, item); return n; });
    setRemovedItem(null);
    setToast(null);
  };

  const handleAddSection = (type: string, anchor: string) => {
    setHasUnsavedChanges(true);
    if (type === 'Product Card' || type === 'Product') {
      setProducts(prev => [...prev, {
        rank: prev.length + 1,
        name: "Product Name",
        badge: "BEST OVERALL",
        imageSrc: "",
        imageAlt: "",
        description: "Click to edit — explain why this product works using specific ingredient or mechanism reasoning.",
        price: "$0.00",
        buttonLabel: "VIEW ON AMAZON",
        affiliateUrl: "#affiliate",
        honest_limitation: "Click to edit — add one honest limitation."
      }]);
      setToast({ message: `ADDED PRODUCT CARD`, type: 'success' });
      setTimeout(() => {
        const cards = document.querySelectorAll('[data-section="product"]');
        const lastCard = cards[cards.length - 1];
        if (lastCard) lastCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
    if (type === 'Honorable Mention') {
      setHonorableMentions(prev => [...prev, {
        name: "Mention Name",
        description: "Brief reasoning of why it works but missed the cut.",
        price: "$0.00",
        affiliateUrl: "#affiliate"
      }]);
      setToast({ message: `ADDED HONORABLE MENTION`, type: 'success' });
    }
    if (type === 'Protocol Step' || type === 'Protocol Section') {
      setProtocolSteps(prev => {
        if (prev.length > 0) return [...prev, { number: `0${prev.length + 1}`, title: "New Step", content: "Description." }];
        if (!protocolHeading) setProtocolHeading(initialProtocolHeading);
        return [
          { number: "01", title: "Step One Name", content: "First essential step in this process." },
          { number: "02", title: "Step Two Name", content: "Second essential step in this process." },
          { number: "03", title: "Step Three Name", content: "Third essential step in this process." }
        ];
      });
      setToast({ message: `ADDED PROTOCOL SECTION`, type: 'success' });
    }
    if (type === 'FAQ Item' || type === 'FAQ Section') {
      setFaqItems(prev => {
        if (prev.length > 0) return [...prev, { question: "New Question?", answer: "Answer goes here." }];
        if (!faqHeading) setFaqHeading(initialFaqHeading);
        return [
          { question: "First Frequently Asked Question?", answer: "Comprehensive answer goes here." },
          { question: "Second Frequently Asked Question?", answer: "Comprehensive answer goes here." },
          { question: "Third Frequently Asked Question?", answer: "Comprehensive answer goes here." }
        ];
      });
      setToast({ message: `ADDED FAQ SECTION`, type: 'success' });
    }
    if (type === 'Avoid Item' || type === 'Avoid Section') {
      setAvoidItems(prev => {
        if (prev.length > 0) return [...prev, { item: "New Item", reason: "Why to avoid." }];
        if (!avoidHeading) setAvoidHeading(initialAvoidHeading);
        return [
          { item: "First Item to Avoid", reason: "Scientific reasoning why this causes issues." },
          { item: "Second Item to Avoid", reason: "Scientific reasoning why this causes issues." },
          { item: "Third Item to Avoid", reason: "Scientific reasoning why this causes issues." }
        ];
      });
      setToast({ message: `ADDED AVOID SECTION`, type: 'success' });
    }
    if (type === 'Info Section') {
      setInfoSections(prev => [...prev, { id: `sec-${Date.now()}`, heading: "New Section", content: "Section content." }]);
    }
    if (type === 'Pros Cons Grid') {
      setProsCons(prev => [...prev, { 
        id: `pc-${Date.now()}`, 
        heading: "Comparison Topic", 
        pros: ["High impact benefit", "Fast results"], 
        cons: ["Longer recovery time", "Higher upfront investment"] 
      }]);
      setToast({ message: `ADDED PROS & CONS GRID`, type: 'success' });
    }
    if (type === 'Tool') {
      setToolPickerAnchor(anchor);
      setShowToolPicker(true);
    }
    if (type === 'Pull Quote') {
      setPullQuote("Click to edit — one surprising fact that readers will share...");
      setToast({ message: `ADDED PULL QUOTE`, type: 'success' });
    }
    if (type === 'Invest Block') {
      setInvestContent(defaultInvestContent);
      setToast({ message: `ADDED INVEST BLOCK`, type: 'success' });
    }
    if (type === 'Science Section') {
      setScienceContent("Click to write the science section — explain the biological mechanism that makes this topic important...");
      setToast({ message: `ADDED SCIENCE SECTION`, type: 'success' });
    }
    if (type === 'Short Answer' || type === 'Short Answer Section') {
      setExecutiveSummary("Click to write your executive summary — 2 sentences that hook the reader...");
      setToast({ message: `ADDED SHORT ANSWER`, type: 'success' });
    }
    setToast({ message: `ADDED ${type.toUpperCase()}`, type: 'success' });
    setTimeout(() => setToast(null), 3000);
  };


  return (
    <div className={`min-h-screen bg-white font-sans text-black selection:bg-brand-red selection:text-white ${isAdmin && mode === 'edit' ? 'pt-[48px]' : ''}`}>
      {/* EDIT MODE TOOLBAR */}
      {isAdmin && mode === 'edit' && (
        <div className="fixed top-0 left-0 right-0 h-[48px] bg-black text-white z-[200] flex items-center justify-between px-6 font-mono text-[11px]">
          <div className="flex items-center gap-4">
            <span className="font-bold tracking-widest text-white uppercase">Edit Mode</span>
            <span className="text-neutral-400">/blog/{initialSlug || 'loading...'}</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowDiscardConfirm(true)}
              className="border border-white/30 px-3 py-1.5 hover:bg-white/10 transition-colors uppercase text-white"
            >
              Discard Changes
            </button>
            <button 
              onClick={handlePublish}
              disabled={!hasUnsavedChanges || isPublishing}
              className={`px-5 py-1.5 transition-colors uppercase flex items-center gap-2 text-white ${hasUnsavedChanges ? 'bg-brand-red hover:bg-red-700' : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'}`}
            >
              {isPublishing ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              {hasUnsavedChanges ? 'Publish Changes →' : 'No Changes'}
            </button>
          </div>
        </div>
      )}

      {/* DISCARD CONFIRMATION MODAL */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 bg-black/80 z-[300] flex items-center justify-center p-6">
          <div className="bg-white p-8 max-w-[400px] w-full text-center">
            <h3 className="font-display text-[24px] mb-4 uppercase tracking-tight">Discard Changes?</h3>
            <p className="font-sans text-[15px] text-gray-mid mb-8">This will revert all edits since your last publish. This cannot be undone.</p>
            <div className="flex flex-col gap-3">
              <button onClick={discardChanges} className="bg-brand-red text-white font-mono text-[11px] py-4 uppercase tracking-widest hover:bg-red-700">Discard Everything</button>
              <button onClick={() => setShowDiscardConfirm(false)} className="bg-transparent border border-black font-mono text-[11px] py-4 uppercase tracking-widest hover:bg-neutral-50">Keep Editing</button>
            </div>
          </div>
        </div>
      )}

      {/* 1. READING PROGRESS BAR */}
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

            {isAdmin && (
              <div className="flex gap-4 items-center justify-center mb-6 text-center border-t border-b border-gray-light py-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] uppercase text-neutral-400">Category:</span>
                  <select 
                    value={category} 
                    onChange={(e) => { setCategory(e.target.value); setHasUnsavedChanges(true); }}
                    className="font-mono text-[10px] uppercase text-black bg-transparent outline-none cursor-pointer"
                  >
                    <option value="" disabled>Select Category...</option>
                    {["Styles", "Technique", "Culture", "History", "Ink & Equipment", "Artist Spotlight", "Aftercare", "Trends", "Meaning & Symbolism", "Tattoo Removal", "Pain & Placement", "Body Zone Specific", "Design Subject Direct", "Style Guides", "Design Ideas", "Cost & Pricing", "First Timer", "FAQ & How-To", "Artist & Studio", "Products & Equipment", "Zodiac & Astrology", "Cultural & Themed", "Pop Culture", "Comparison & Versus", "Temporary & Henna"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="w-[1px] h-3 bg-gray-light" />
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] uppercase text-neutral-400">Tags:</span>
                  <Editable isAdmin={isAdmin} 
                    onSave={(v) => { setTags(v.split(',').map(t => t.trim())); setHasUnsavedChanges(true); }}
                    className="font-mono text-[10px] uppercase text-black"
                  >
                    {tags.join(', ')}
                  </Editable>
                </div>
              </div>
            )}

            <h1 className="font-display text-[34px] md:text-[48px] leading-[1.1] text-black mb-6 text-center">
              <Editable isAdmin={isAdmin} onInputText={(v) => updateSharedRef('title', v)} onSave={(v) => handleTextChange(setTitle, v)} placeholder="Click to write your post title...">{title}</Editable>
            </h1>

            <div className="italic text-[18px] border-l-[3px] border-brand-red pl-6 mb-8 text-black/90 leading-[1.6]">
              <Editable isAdmin={isAdmin} onInputText={(v) => updateSharedRef('executiveSummary', v)} onSave={(v) => handleTextChange(setExecutiveSummary, v)} placeholder="Click to write your executive summary — 2 sentences that hook the reader...">{executiveSummary}</Editable>
            </div>

            <div className="font-mono text-[11px] text-neutral-400 mb-8 uppercase tracking-widest text-center">
              By {authorName || "TattoosMap"} — <Editable isAdmin={isAdmin} onSave={(v) => handleTextChange(setUpdatedDate, v)}>{updatedDate}</Editable>
            </div>

            <div className="font-mono text-[11px] text-neutral-400 leading-[1.5]">
              DISCLOSURE: This post contains affiliate links. We earn a commission if you buy through our links at no extra cost to you.
            </div>
          </div>
        </div>

        {/* 2. HERO SECTION */}
        <div className="w-full relative aspect-[16/9] mb-12 order-2 md:order-1 bg-neutral-100 group">
          {heroImageSrc && heroImageSrc.trim() !== '' && !heroImageSrc.includes("placeholder") ? (
            <Image 
              src={heroImageSrc} 
              alt={heroImageAlt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center pointer-events-none">
              <ImageIcon className="w-8 h-8 text-neutral-400 mb-3" />
              <span className="font-mono text-[12px] text-neutral-400 uppercase tracking-widest mb-1">Click to Upload Hero Image</span>
              <span className="font-mono text-[10px] text-neutral-300 uppercase tracking-widest">1600 × 900px recommended — WebP or AVIF under 400KB</span>
            </div>
          )}
          {isAdmin && (
            <div className={`absolute inset-0 ${heroImageSrc && heroImageSrc.trim() !== '' && !heroImageSrc.includes("placeholder") ? 'bg-black/40 opacity-0 group-hover:opacity-100' : 'opacity-0'} transition-opacity flex items-center justify-center cursor-pointer`} onClick={() => document.getElementById('hero-upload')?.click()}>
              <input 
                id="hero-upload"
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
                      handleTextChange(setHeroImageSrc, res.url);
                    } else {
                      setToast({message: "Image upload failed", type: 'error'});
                    }
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Remaining content in main */}
        <main className="max-w-[680px] mx-auto px-5 pb-24 order-3">
          {/* 4. TABLE OF CONTENTS */}
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
              {isAdmin && autoTocItems.length === 0 && (
                <p className="font-mono text-[10px] text-neutral-300 uppercase tracking-widest italic">
                  Contents will appear here as you add sections
                </p>
              )}
            </div>
          )}

          <div className="prose prose-neutral max-w-none">
            {/* 5. SHORT ANSWER */}
            {executiveSummary && (
              <div className="relative group border border-transparent hover:border-neutral-100 p-4 -mx-4 transition-colors">
                <SectionToolbar isAdmin={isAdmin} onRemove={() => { if(window.confirm("Remove entire short answer section?")) handleTextChange(setExecutiveSummary, null); }} />
                
                {shortAnswerHeading && (
                  <h2 id="auto-short-answer" className="font-display text-[28px] uppercase tracking-tight text-black mb-4 mt-12 text-center">
                    <Editable isAdmin={isAdmin} onSave={(v) => handleTextChange(setShortAnswerHeading, v)}>{shortAnswerHeading}</Editable>
                  </h2>
                )}
                
                <p className="font-sans text-[17px] leading-[1.5] text-black/90 mb-12">
                  <Editable isAdmin={isAdmin} onSave={(v) => handleTextChange(setExecutiveSummary, v)} placeholder="Click to write your executive summary — 2 sentences that hook the reader...">{executiveSummary}</Editable>
                </p>
              </div>
            )}

            {/* TOOL MARKER PLACEHOLDER: TOP */}
            {toolMarkers.filter(tm => tm.anchor === 'top').map((tm, i) => (
              <div key={`tool-top-${i}`} className="relative group my-8 border border-brand-red/30 bg-brand-red/5 p-6">
                <SectionToolbar isAdmin={isAdmin} onRemove={() => setToolMarkers(prev => prev.filter(p => p !== tm))} />
                <div className="text-center">
                  <span className="font-mono text-[9px] uppercase text-brand-red tracking-widest block mb-2">EMBEDDED TOOL</span>
                  <p className="font-display text-[18px] uppercase text-black mb-1">{tm.toolId === 'PAIN_SIMULATOR' ? 'Laser Removal Pain Simulator' : tm.toolId.replace(/_/g, ' ')}</p>
                </div>
              </div>
            ))}
            <AddSectionButton isAdmin={isAdmin} onAdd={handleAddSection} anchor="top" />

            {/* 6. THE SCIENCE SECTION */}
            {scienceContent && (
              <div className="relative group border border-transparent hover:border-neutral-100 p-4 -mx-4 transition-colors my-12">
                <SectionToolbar isAdmin={isAdmin} onRemove={() => { if(window.confirm("Remove entire science section?")) handleTextChange(setScienceContent, null); }} />
                
                {scienceHeading && (
                  <h2 id="science" className="font-display text-[28px] uppercase tracking-tight text-black mb-4 mt-8 text-center">
                    <Editable isAdmin={isAdmin} onInputText={(v) => updateSharedRef('scienceHeading', v)} onSave={(v) => handleTextChange(setScienceHeading, v)}>{scienceHeading}</Editable>
                  </h2>
                )}
                
                <Editable isAdmin={isAdmin} onInputText={(v) => updateSharedRef('scienceContent', v)} onSave={(v) => handleTextChange(setScienceContent, v)} tag="div" multiline={true} placeholder="Click to write the science section — explain the biological mechanism that makes this topic important...">
                  {scienceContent}
                </Editable>
              </div>
            )}

            {/* TOOL MARKER PLACEHOLDER: SCIENCE */}
            {toolMarkers.filter(tm => tm.anchor === 'science').map((tm, i) => (
              <div key={`tool-science-${i}`} className="relative group my-8 border border-brand-red/30 bg-brand-red/5 p-6">
                <SectionToolbar isAdmin={isAdmin} onRemove={() => setToolMarkers(prev => prev.filter(p => p !== tm))} />
                <div className="text-center">
                  <span className="font-mono text-[9px] uppercase text-brand-red tracking-widest block mb-2">EMBEDDED TOOL</span>
                  <p className="font-display text-[18px] uppercase text-black mb-1">{tm.toolId === 'PAIN_SIMULATOR' ? 'Laser Removal Pain Simulator' : tm.toolId.replace(/_/g, ' ')}</p>
                </div>
              </div>
            ))}
            <AddSectionButton isAdmin={isAdmin} onAdd={handleAddSection} anchor="science" />

            {/* PULL QUOTE - Fully Toggleable Atomic Section */}
            {pullQuote && (
              <div className="relative group border-l-4 border-brand-red bg-black p-6 my-12">
                <SectionToolbar isAdmin={isAdmin} onRemove={() => { if(window.confirm("Remove pull quote?")) handleTextChange(setPullQuote, ""); }} />
                <span className="font-mono text-[9px] uppercase text-neutral-500 tracking-widest block mb-3">SHARE THIS</span>
                <p className="font-display text-[20px] text-white italic leading-snug">
                  "<Editable isAdmin={isAdmin} onInputText={(v) => updateSharedRef('pullQuote', v)} onSave={(v) => handleTextChange(setPullQuote, v)} placeholder="Click to write your pull quote — one surprising fact that readers will share...">{pullQuote}</Editable>"
                </p>
              </div>
            )}

            {/* TOOL MARKER PLACEHOLDER: PULL-QUOTE */}
            {toolMarkers.filter(tm => tm.anchor === 'pull-quote').map((tm, i) => (
              <div key={`tool-pull-quote-${i}`} className="relative group my-8 border border-brand-red/30 bg-brand-red/5 p-6">
                <SectionToolbar isAdmin={isAdmin} onRemove={() => setToolMarkers(prev => prev.filter(p => p !== tm))} />
                <div className="text-center">
                  <span className="font-mono text-[9px] uppercase text-brand-red tracking-widest block mb-2">EMBEDDED TOOL</span>
                  <p className="font-display text-[18px] uppercase text-black mb-1">{tm.toolId === 'PAIN_SIMULATOR' ? 'Laser Removal Pain Simulator' : tm.toolId.replace(/_/g, ' ')}</p>
                </div>
              </div>
            ))}
            <AddSectionButton isAdmin={isAdmin} onAdd={handleAddSection} anchor="pull-quote" />

            {/* INVEST BLOCK - Fully Toggleable Atomic Section */}
            {investContent && (
              <div className="relative group border border-brand-red p-6 my-8" style={{background: 'rgba(226,75,74,0.04)'}}>
                <SectionToolbar isAdmin={isAdmin} onRemove={() => { if(window.confirm("Remove invest block?")) handleTextChange(setInvestContent, null); }} />
                <span className="font-mono text-[9px] uppercase text-brand-red tracking-widest block mb-3">FROM TATTOOSMAP</span>
                <div className="font-sans text-[15px] leading-relaxed text-black">
                  <Editable isAdmin={isAdmin} onSave={(v) => handleTextChange(setInvestContent, v)} tag="div" multiline={true}>
                    {investContent}
                  </Editable>
                </div>
              </div>
            )}

            {/* TOOL MARKER PLACEHOLDER: INVEST */}
            {toolMarkers.filter(tm => tm.anchor === 'invest').map((tm, i) => (
              <div key={`tool-invest-${i}`} className="relative group my-8 border border-brand-red/30 bg-brand-red/5 p-6 text-center">
                <SectionToolbar isAdmin={isAdmin} onRemove={() => setToolMarkers(prev => prev.filter(p => p !== tm))} />
                <div className="text-center">
                  <span className="font-mono text-[9px] uppercase text-brand-red tracking-widest block mb-2">EMBEDDED TOOL</span>
                  <p className="font-display text-[18px] uppercase text-black mb-1">{tm.toolId === 'PAIN_SIMULATOR' ? 'Laser Removal Pain Simulator' : tm.toolId.replace(/_/g, ' ')}</p>
                </div>
              </div>
            ))}

            <AddSectionButton isAdmin={isAdmin} onAdd={handleAddSection} anchor="invest" />

            {/* FIX 4: Tool Slot */}
            {toolSlot && (
              <div className="my-8">{toolSlot}</div>
            )}

            {/* Info Sections - Global */}
            {infoSections.map((sec, idx) => (
              <div key={sec.id} className="relative group">
                <SectionToolbar isAdmin={isAdmin} 
                  onMoveUp={idx > 0 ? () => handleArrayMove(setInfoSections, infoSections, idx, 'up') : undefined}
                  onMoveDown={idx < infoSections.length - 1 ? () => handleArrayMove(setInfoSections, infoSections, idx, 'down') : undefined}
                  onRemove={() => handleArrayRemove(setInfoSections, infoSections, idx, 'infoSections')}
                />
                <h2 id={sec.id} className="font-display text-[28px] uppercase tracking-tight text-black mb-4 mt-12 text-center">
                  <Editable isAdmin={isAdmin} onSave={(v) => handleArrayChange(setInfoSections, infoSections, idx, 'heading', v)}>{sec.heading}</Editable>
                </h2>
                <Editable isAdmin={isAdmin} onSave={(v) => handleArrayChange(setInfoSections, infoSections, idx, 'content', v)} tag="div" multiline={true}>
                  {sec.content}
                </Editable>
                
                {/* TOOL MARKER PLACEHOLDER: INFO-SECTION */}
                {toolMarkers.filter(tm => tm.anchor === `info-${sec.id}`).map((tm, i) => (
                  <div key={`tool-info-${sec.id}-${i}`} className="relative group my-8 border border-brand-red/30 bg-brand-red/5 p-6">
                    <SectionToolbar isAdmin={isAdmin} onRemove={() => setToolMarkers(prev => prev.filter(p => p !== tm))} />
                    <div className="text-center">
                      <span className="font-mono text-[9px] uppercase text-brand-red tracking-widest block mb-2">EMBEDDED TOOL</span>
                      <p className="font-display text-[18px] uppercase text-black mb-1">{tm.toolId === 'PAIN_SIMULATOR' ? 'Laser Removal Pain Simulator' : tm.toolId.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                ))}
                <AddSectionButton isAdmin={isAdmin} onAdd={handleAddSection} anchor={`info-${sec.id}`} />
              </div>
            ))}

            {/* Pros & Cons Sections */}
            {prosCons.map((pc, idx) => (
              <React.Fragment key={pc.id}>
                <div className="relative group border border-black/10 my-16 bg-white shadow-sm">
                   <SectionToolbar isAdmin={isAdmin} 
                      onMoveUp={idx > 0 ? () => handleArrayMove(setProsCons, prosCons, idx, 'up') : undefined}
                      onMoveDown={idx < prosCons.length - 1 ? () => handleArrayMove(setProsCons, prosCons, idx, 'down') : undefined}
                      onRemove={() => handleArrayRemove(setProsCons, prosCons, idx, 'prosCons')}
                   />
                   
                   {/* Heading */}
                   <div className="border-b border-black/10 p-6 text-center bg-neutral-50">
                      <h3 id={pc.id} className="font-display text-[22px] uppercase tracking-wide text-black">
                         <Editable isAdmin={isAdmin} onSave={(v) => handleArrayChange(setProsCons, prosCons, idx, 'heading', v)}>{pc.heading}</Editable>
                      </h3>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-black/10">
                      {/* Pros */}
                      <div className="p-8">
                         <h4 className="font-mono text-[11px] uppercase tracking-widest text-black font-bold mb-6 flex items-center gap-2">
                            <span className="w-5 h-5 bg-black text-white flex items-center justify-center text-[10px] font-bold">✓</span> THE BENEFITS
                         </h4>
                         <ul className="space-y-4">
                            {pc.pros.map((pro, pIdx) => (
                               <li key={pIdx} className="relative group/item font-sans text-[15px] text-black/80 leading-relaxed flex gap-3 items-start">
                                  <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                                  <div className="flex-grow">
                                    <Editable isAdmin={isAdmin} onSave={(v) => {
                                       const newPros = [...pc.pros];
                                       newPros[pIdx] = v;
                                       handleArrayChange(setProsCons, prosCons, idx, 'pros', newPros);
                                    }}>{pro}</Editable>
                                  </div>
                                  {isAdmin && (
                                     <button onClick={() => {
                                        const newPros = pc.pros.filter((_, i) => i !== pIdx);
                                        handleArrayChange(setProsCons, prosCons, idx, 'pros', newPros);
                                     }} className="opacity-0 group-hover/item:opacity-100 text-neutral-400 hover:text-brand-red mt-1 transition-opacity"><X className="w-3 h-3" /></button>
                                  )}
                               </li>
                            ))}
                            {isAdmin && (
                               <button onClick={() => {
                                  const newPros = [...pc.pros, "New advantage"];
                                  handleArrayChange(setProsCons, prosCons, idx, 'pros', newPros);
                               }} className="font-mono text-[9px] uppercase text-neutral-400 hover:text-black mt-4 flex items-center gap-1 transition-colors border border-dashed border-neutral-300 px-2 py-1 hover:border-neutral-500">+ Add Pro</button>
                            )}
                         </ul>
                      </div>

                      {/* Cons */}
                      <div className="p-8 bg-neutral-50/30">
                         <h4 className="font-mono text-[11px] uppercase tracking-widest text-brand-red font-bold mb-6 flex items-center gap-2">
                            <span className="w-5 h-5 bg-brand-red text-white flex items-center justify-center text-[12px] font-bold leading-none">—</span> THE DRAWBACKS
                         </h4>
                         <ul className="space-y-4">
                            {pc.cons.map((con, cIdx) => (
                               <li key={cIdx} className="relative group/item font-sans text-[15px] text-black/80 leading-relaxed flex gap-3 items-start">
                                  <div className="w-1.5 h-1.5 rounded-full bg-brand-red mt-2 shrink-0" />
                                  <div className="flex-grow">
                                    <Editable isAdmin={isAdmin} onSave={(v) => {
                                       const newCons = [...pc.cons];
                                       newCons[cIdx] = v;
                                       handleArrayChange(setProsCons, prosCons, idx, 'cons', newCons);
                                    }}>{con}</Editable>
                                  </div>
                                  {isAdmin && (
                                     <button onClick={() => {
                                        const newCons = pc.cons.filter((_, i) => i !== cIdx);
                                        handleArrayChange(setProsCons, prosCons, idx, 'cons', newCons);
                                     }} className="opacity-0 group-hover/item:opacity-100 text-neutral-400 hover:text-brand-red mt-1 transition-opacity"><X className="w-3 h-3" /></button>
                                  )}
                               </li>
                            ))}
                            {isAdmin && (
                               <button onClick={() => {
                                  const newCons = [...pc.cons, "New drawback"];
                                  handleArrayChange(setProsCons, prosCons, idx, 'cons', newCons);
                               }} className="font-mono text-[9px] uppercase text-neutral-400 hover:text-black mt-4 flex items-center gap-1 transition-colors border border-dashed border-neutral-300 px-2 py-1 hover:border-neutral-500">+ Add Con</button>
                            )}
                         </ul>
                      </div>
                   </div>
                </div>
                <AddSectionButton isAdmin={isAdmin} onAdd={handleAddSection} anchor={`proscons-${pc.id}`} />
              </React.Fragment>
            ))}

            {/* 7. PRODUCT RANKINGS - Fully Toggleable Atomic Section */}
            {products.length > 0 && (
              <div className="relative group border border-transparent hover:border-neutral-100 p-4 -mx-4 transition-colors my-12">
                <SectionToolbar isAdmin={isAdmin} onRemove={() => { if(window.confirm("Remove all product rankings?")) setProducts([]); }} />
                
                {rankedListHeading && (
                  <h2 id="ranked-list" className="font-display text-[28px] uppercase tracking-tight text-black mb-6 mt-8 text-center">
                    <Editable isAdmin={isAdmin} onSave={(v) => handleTextChange(setRankedListHeading, v)}>{rankedListHeading}</Editable>
                  </h2>
                )}
                
                <div className="space-y-6 mb-8">
                  {products.map((product, idx) => (
                    <div key={idx} id={product.name?.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').substring(0, 80)} data-section="product" className="relative group/item border border-gray-light p-6 bg-white flex flex-col items-start gap-1 border border-transparent hover:border-dashed hover:border-neutral-300 scroll-mt-24">
                      <SectionToolbar isAdmin={isAdmin} isItem={true}
                        onMoveUp={idx > 0 ? () => handleArrayMove(setProducts, products, idx, 'up') : undefined}
                        onMoveDown={idx < products.length - 1 ? () => handleArrayMove(setProducts, products, idx, 'down') : undefined}
                        onDuplicate={() => handleArrayDuplicate(setProducts, products, idx)}
                        onRemove={() => handleArrayRemove(setProducts, products, idx, 'products')}
                      />
                      <span className="font-display text-[48px] text-neutral-200 leading-none absolute top-6 right-6">{product.rank}</span>
                      <h3 className="font-display text-[22px] text-black pr-12 mb-1">
                        <Editable isAdmin={isAdmin} onSave={(v) => handleArrayChange(setProducts, products, idx, 'name', v)}>{product.name}</Editable>
                      </h3>
                      <span className="font-mono text-[10px] uppercase text-brand-red bg-brand-red/5 px-2 py-0.5 tracking-wider mb-3">
                        <Editable isAdmin={isAdmin} onSave={(v) => handleArrayChange(setProducts, products, idx, 'badge', v)}>{product.badge}</Editable>
                      </span>
                      
                       <div className="w-full aspect-[2/1] relative mb-6 bg-off-white border border-gray-light group overflow-hidden flex items-center justify-center min-h-[160px]">
                        {product.imageSrc && product.imageSrc.trim() !== '' ? (
                              <Image 
                                src={product.imageSrc} 
                                alt={product.imageAlt}
                                fill
                                sizes="(max-width: 768px) 100vw, 680px"
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                              />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-neutral-300">
                            <ImageIcon className="w-6 h-6 mb-2" />
                            <span className="font-mono text-[9px] uppercase tracking-widest">No Product Image</span>
                          </div>
                        )}
                        {isAdmin && (
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer z-10">
                            <label className="bg-white text-black font-mono text-[10px] uppercase tracking-widest px-4 py-2 cursor-pointer hover:bg-neutral-50 transition-colors flex items-center gap-2">
                              <Camera className="w-4 h-4" /> {product.imageSrc ? 'Replace' : 'Upload Image'}
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const formData = new FormData();
                                    formData.append("file", file);
                                    const res = await uploadProductImageAction(formData);
                                    if (res.success && res.url) {
                                      handleArrayChange(setProducts, products, idx, 'imageSrc', res.url);
                                    }
                                  }
                                }}
                              />
                            </label>
                          </div>
                        )}
                      </div>

                      <p className="font-sans text-[15px] leading-[1.6] text-black/90 mb-4">
                        <Editable isAdmin={isAdmin} onSave={(v) => handleArrayChange(setProducts, products, idx, 'description', v)}>{product.description}</Editable>
                      </p>

                      <div className="w-full bg-neutral-50 border-l-2 border-neutral-200 p-4 mb-6">
                        <span className="font-mono text-[9px] uppercase text-neutral-400 tracking-widest block mb-2 font-bold">HONEST LIMITATION</span>
                        <p className="font-sans text-[13px] text-neutral-600 italic">
                          <Editable isAdmin={isAdmin} onSave={(v) => handleArrayChange(setProducts, products, idx, 'honest_limitation', v)} placeholder="Click to add one honest limitation...">{product.honest_limitation}</Editable>
                        </p>
                      </div>

                      <div className="flex items-center justify-between w-full mt-auto pt-4 border-t border-gray-light">
                        <span className="font-mono text-[14px] text-black font-bold">
                          <Editable isAdmin={isAdmin} onSave={(v) => handleArrayChange(setProducts, products, idx, 'price', v)}>{product.price}</Editable>
                        </span>
                        <div className="flex items-center gap-4 min-w-0">
                          {isAdmin && (
                            <div className="flex items-center gap-1 min-w-0">
                              <Editable isAdmin={isAdmin} onSave={(v) => handleArrayChange(setProducts, products, idx, 'affiliateUrl', v)} className="text-[9px] text-neutral-400 font-mono underline uppercase tracking-widest truncate max-w-[120px]">URL: {product.affiliateUrl}</Editable>
                              {isAdmin && (!product.affiliateUrl || product.affiliateUrl === '#' || product.affiliateUrl === '#affiliate') && (
                                <span className="font-mono text-[9px] text-brand-red uppercase tracking-widest">⚠ ADD REAL URL</span>
                              )}
                            </div>
                          )}
                          <a 
                            href={product.affiliateUrl && product.affiliateUrl !== '#affiliate' && product.affiliateUrl !== '#' ? product.affiliateUrl : undefined}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => { if (!product.affiliateUrl || product.affiliateUrl === '#' || product.affiliateUrl === '#affiliate') e.preventDefault(); }}
                            className={`bg-black text-white font-mono text-[10px] uppercase px-5 py-2 transition-colors shrink-0 whitespace-nowrap ${(!product.affiliateUrl || product.affiliateUrl === '#' || product.affiliateUrl === '#affiliate') ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-900 cursor-pointer'}`}
                          >
                            <Editable isAdmin={isAdmin} onSave={(v) => handleArrayChange(setProducts, products, idx, 'buttonLabel', v)}>{product.buttonLabel || "VIEW ON AMAZON"}</Editable>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isAdmin && (
                    <div className="pt-4 flex justify-center">
                      <button 
                        onClick={() => handleAddSection('Product Card', 'products')}
                        className="border border-neutral-300 font-mono text-[11px] uppercase tracking-widest px-8 py-4 hover:border-black transition-colors flex items-center gap-2 text-neutral-500 hover:text-black"
                      >
                        <Plus className="w-4 h-4" /> Add Another Product
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 8. HONORABLE MENTIONS - Fully Toggleable Independent Atomic Section */}
            {honorableMentions.length > 0 && (
              <div className="relative group border border-transparent hover:border-neutral-100 p-4 -mx-4 transition-colors my-12">
                <SectionToolbar isAdmin={isAdmin} onRemove={() => { if(window.confirm("Remove entire Honorable Mentions section?")) setHonorableMentions([]); }} />
                
                <div className="mb-8">
                  <span className="font-mono text-[11px] uppercase text-black block mb-6 tracking-widest text-center">Also Worth Considering</span>
                  <div className="space-y-6">
                    {honorableMentions.map((item, idx) => (
                      <div key={idx} className="relative group/item border border-gray-light p-5 bg-white hover:border-neutral-300">
                        <SectionToolbar isAdmin={isAdmin} isItem={true}
                          onMoveUp={idx > 0 ? () => handleArrayMove(setHonorableMentions, honorableMentions, idx, 'up') : undefined}
                          onMoveDown={idx < honorableMentions.length - 1 ? () => handleArrayMove(setHonorableMentions, honorableMentions, idx, 'down') : undefined}
                          onRemove={() => handleArrayRemove(setHonorableMentions, honorableMentions, idx, 'honorableMentions')}
                        />
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-display text-[18px] text-black uppercase tracking-tight">
                            <Editable isAdmin={isAdmin} onSave={(v) => handleArrayChange(setHonorableMentions, honorableMentions, idx, 'name', v)}>{item.name}</Editable>
                          </h3>
                          <span className="font-mono text-[13px] text-black font-bold">
                            <Editable isAdmin={isAdmin} onSave={(v) => handleArrayChange(setHonorableMentions, honorableMentions, idx, 'price', v)}>{item.price}</Editable>
                          </span>
                        </div>
                        <p className="font-sans text-[14px] text-black/70 leading-relaxed mb-4">
                          <Editable isAdmin={isAdmin} onSave={(v) => handleArrayChange(setHonorableMentions, honorableMentions, idx, 'description', v)}>{item.description}</Editable>
                        </p>
                        <div className="flex items-center gap-4">
                          {isAdmin && (
                            <Editable isAdmin={isAdmin} onSave={(v) => handleArrayChange(setHonorableMentions, honorableMentions, idx, 'affiliateUrl', v)} className="text-[9px] text-neutral-400 font-mono underline">Edit URL</Editable>
                          )}
                          <a href={item.affiliateUrl} className="font-mono text-[10px] uppercase text-brand-red hover:underline tracking-widest">View Details →</a>
                        </div>
                      </div>
                    ))}
                    
                    {isAdmin && (
                      <div className="pt-4 flex justify-center">
                        <button 
                          onClick={() => handleAddSection('Honorable Mention', 'products')}
                          className="border border-neutral-300 font-mono text-[11px] uppercase tracking-widest px-8 py-3 hover:border-black transition-colors flex items-center gap-2 text-neutral-500 hover:text-black"
                        >
                          <Plus className="w-4 h-4" /> Add Honorable Mention
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ADD PRODUCT BUTTON (Render if zero products in editor mode to allow addition) */}
            {isAdmin && products.length === 0 && (
              <div className="border-2 border-dashed border-neutral-200 p-8 text-center mb-16">
                <p className="font-mono text-[11px] text-neutral-300 uppercase tracking-widest mb-4">Add Product Rankings</p>
                <button 
                  onClick={() => handleAddSection('Product Card', 'products')}
                  className="border border-neutral-300 font-mono text-[11px] uppercase tracking-widest px-6 py-3 hover:border-black transition-colors flex items-center justify-center mx-auto gap-2"
                >
                  <Plus className="w-4 h-4" /> Add First Product
                </button>
              </div>
            )}

            {/* TOOL MARKER PLACEHOLDER: PRODUCTS */}
            {toolMarkers.filter(tm => tm.anchor === 'products').map((tm, i) => (
              <div key={`tool-products-${i}`} className="relative group my-8 border border-brand-red/30 bg-brand-red/5 p-6">
                <SectionToolbar isAdmin={isAdmin} onRemove={() => setToolMarkers(prev => prev.filter(p => p !== tm))} />
                <div className="text-center">
                  <span className="font-mono text-[9px] uppercase text-brand-red tracking-widest block mb-2">EMBEDDED TOOL</span>
                  <p className="font-display text-[18px] uppercase text-black mb-1">{tm.toolId === 'PAIN_SIMULATOR' ? 'Laser Removal Pain Simulator' : tm.toolId.replace(/_/g, ' ')}</p>
                </div>
              </div>
            ))}
            <AddSectionButton isAdmin={isAdmin} onAdd={handleAddSection} anchor="products" />

            {/* PROTOCOL - Fully Toggleable Atomic Section */}
            {protocolSteps.length > 0 && (
              <div className="relative group border border-transparent hover:border-neutral-100 p-4 -mx-4 transition-colors my-12">
                <SectionToolbar isAdmin={isAdmin} onRemove={() => { if(window.confirm("Remove entire protocol section?")) setProtocolSteps([]); }} />
                
                {protocolHeading && (
                  <h2 id="protocol" className="font-display text-[28px] uppercase tracking-tight text-black mb-6 mt-8 text-center">
                    <Editable isAdmin={isAdmin} onSave={(v) => handleTextChange(setProtocolHeading, v)}>{protocolHeading}</Editable>
                  </h2>
                )}
                
                <div className="space-y-8 mb-8">
                  {protocolSteps.map((step, idx) => (
                    <div key={idx} data-section="protocol" className="relative group/item flex gap-6 border border-transparent hover:border-dashed hover:border-neutral-200 p-2">
                      <SectionToolbar isAdmin={isAdmin} isItem={true}
                        onMoveUp={idx > 0 ? () => handleArrayMove(setProtocolSteps, protocolSteps, idx, 'up') : undefined}
                        onMoveDown={idx < protocolSteps.length - 1 ? () => handleArrayMove(setProtocolSteps, protocolSteps, idx, 'down') : undefined}
                        onDuplicate={() => handleArrayDuplicate(setProtocolSteps, protocolSteps, idx)}
                        onRemove={() => handleArrayRemove(setProtocolSteps, protocolSteps, idx, 'protocolSteps')}
                      />
                      <span className="font-mono text-[10px] text-brand-red mt-1 shrink-0">
                        <Editable isAdmin={isAdmin} onSave={(v) => handleArrayChange(setProtocolSteps, protocolSteps, idx, 'number', v)}>{step.number}</Editable>
                      </span>
                      <div>
                        <h3 className="font-display text-[17px] text-black mb-2 uppercase tracking-tight">
                          <Editable isAdmin={isAdmin} onSave={(v) => handleArrayChange(setProtocolSteps, protocolSteps, idx, 'title', v)}>{step.title}</Editable>
                        </h3>
                        <p className="font-sans text-[15px] text-black/70 leading-relaxed">
                          <Editable isAdmin={isAdmin} onSave={(v) => handleArrayChange(setProtocolSteps, protocolSteps, idx, 'content', v)}>{step.content}</Editable>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TOOL MARKER PLACEHOLDER: PROTOCOL */}
            {toolMarkers.filter(tm => tm.anchor === 'protocol').map((tm, i) => (
              <div key={`tool-protocol-${i}`} className="relative group my-8 border border-brand-red/30 bg-brand-red/5 p-6">
                <SectionToolbar isAdmin={isAdmin} onRemove={() => setToolMarkers(prev => prev.filter(p => p !== tm))} />
                <div className="text-center">
                  <span className="font-mono text-[9px] uppercase text-brand-red tracking-widest block mb-2">EMBEDDED TOOL</span>
                  <p className="font-display text-[18px] uppercase text-black mb-1">{tm.toolId === 'PAIN_SIMULATOR' ? 'Laser Removal Pain Simulator' : tm.toolId.replace(/_/g, ' ')}</p>
                </div>
              </div>
            ))}
            <AddSectionButton isAdmin={isAdmin} onAdd={handleAddSection} anchor="protocol" />

            {/* WHAT TO NEVER USE - Fully Toggleable Atomic Section */}
            {avoidItems.length > 0 && (
              <div className="relative group border border-transparent hover:border-neutral-100 p-4 -mx-4 transition-colors my-12">
                <SectionToolbar isAdmin={isAdmin} onRemove={() => { if(window.confirm("Remove entire Avoid list?")) setAvoidItems([]); }} />
                
                {avoidHeading && (
                  <h2 id="avoid-list" className="font-display text-[28px] uppercase tracking-tight text-black mb-6 mt-8 text-center">
                    <Editable isAdmin={isAdmin} onSave={(v) => handleTextChange(setAvoidHeading, v)}>{avoidHeading}</Editable>
                  </h2>
                )}
                
                <div className="space-y-4 mb-8">
                  {avoidItems.map((entry, idx) => (
                    <div key={idx} className="relative group/item flex gap-4 border-l-2 border-brand-red pl-4 py-2 border border-transparent hover:border-dashed hover:border-neutral-200">
                      <SectionToolbar isAdmin={isAdmin} isItem={true}
                        onMoveUp={idx > 0 ? () => handleArrayMove(setAvoidItems, avoidItems, idx, 'up') : undefined}
                        onMoveDown={idx < avoidItems.length - 1 ? () => handleArrayMove(setAvoidItems, avoidItems, idx, 'down') : undefined}
                        onRemove={() => handleArrayRemove(setAvoidItems, avoidItems, idx, 'avoidItems')}
                      />
                      <div>
                        <p className="font-display text-[15px] text-black mb-1">
                          <Editable isAdmin={isAdmin} onSave={(v) => handleArrayChange(setAvoidItems, avoidItems, idx, 'item', v)}>{entry.item}</Editable>
                        </p>
                        <p className="font-sans text-[13px] text-black/60 leading-relaxed">
                          <Editable isAdmin={isAdmin} onSave={(v) => handleArrayChange(setAvoidItems, avoidItems, idx, 'reason', v)}>{entry.reason}</Editable>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TOOL MARKER PLACEHOLDER: AVOID */}
            {toolMarkers.filter(tm => tm.anchor === 'avoid').map((tm, i) => (
              <div key={`tool-avoid-${i}`} className="relative group my-8 border border-brand-red/30 bg-brand-red/5 p-6">
                <SectionToolbar isAdmin={isAdmin} onRemove={() => setToolMarkers(prev => prev.filter(p => p !== tm))} />
                <div className="text-center">
                  <span className="font-mono text-[9px] uppercase text-brand-red tracking-widest block mb-2">EMBEDDED TOOL</span>
                  <p className="font-display text-[18px] uppercase text-black mb-1">{tm.toolId === 'PAIN_SIMULATOR' ? 'Laser Removal Pain Simulator' : tm.toolId.replace(/_/g, ' ')}</p>
                </div>
              </div>
            ))}
            <AddSectionButton isAdmin={isAdmin} onAdd={handleAddSection} anchor="avoid" />

            {/* FAQ - Fully Toggleable Atomic Section */}
            {faqItems.length > 0 && (
              <div className="relative group border border-transparent hover:border-neutral-100 p-4 -mx-4 transition-colors">
                <SectionToolbar isAdmin={isAdmin} onRemove={() => { if(window.confirm("Remove entire FAQ section?")) setFaqItems([]); }} />
                
                {faqHeading && (
                  <h2 id="faq" className="font-display text-[28px] uppercase tracking-tight text-black mb-6 mt-12 text-center">
                    <Editable isAdmin={isAdmin} onSave={(v) => handleTextChange(setFaqHeading, v)}>{faqHeading}</Editable>
                  </h2>
                )}
                
                <div className="space-y-0">
                  {faqItems.map((item, idx) => (
                    <div key={idx} data-section="faq" className="relative group/item border border-transparent hover:border-dashed hover:border-neutral-200">
                      <SectionToolbar isAdmin={isAdmin} isItem={true}
                        onMoveUp={idx > 0 ? () => handleArrayMove(setFaqItems, faqItems, idx, 'up') : undefined}
                        onMoveDown={idx < faqItems.length - 1 ? () => handleArrayMove(setFaqItems, faqItems, idx, 'down') : undefined}
                        onDuplicate={() => handleArrayDuplicate(setFaqItems, faqItems, idx)}
                        onRemove={() => handleArrayRemove(setFaqItems, faqItems, idx, 'faqItems')}
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

            {/* TOOL MARKER PLACEHOLDER: FAQ */}
            {toolMarkers.filter(tm => tm.anchor === 'faq').map((tm, i) => (
              <div key={`tool-faq-${i}`} className="relative group my-8 border border-brand-red/30 bg-brand-red/5 p-6">
                <SectionToolbar isAdmin={isAdmin} onRemove={() => setToolMarkers(prev => prev.filter(p => p !== tm))} />
                <div className="text-center">
                  <span className="font-mono text-[9px] uppercase text-brand-red tracking-widest block mb-2">EMBEDDED TOOL</span>
                  <p className="font-display text-[18px] uppercase text-black mb-1">{tm.toolId === 'PAIN_SIMULATOR' ? 'Laser Removal Pain Simulator' : tm.toolId.replace(/_/g, ' ')}</p>
                </div>
              </div>
            ))}
            <AddSectionButton isAdmin={isAdmin} onAdd={handleAddSection} anchor="faq" />

            {/* CTA SECTION - Swapped based on type */}
            {isRecommendAndSell ? (
              ctaHeading && (
                <section className="bg-black py-16 px-8 my-16 text-center relative group">
                  <SectionToolbar 
                    isAdmin={isAdmin} 
                    onRemove={() => { setCtaHeading(""); setToast({message: "Call to Action removed", type: 'success'}); }}
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
                      <Editable isAdmin={isAdmin} onSave={(v) => handleTextChange(setCtaButtonHref, v)} className="text-[10px] text-neutral-500 font-mono underline uppercase tracking-widest">Button URL: {ctaButtonHref}</Editable>
                    )}
                    <a 
                      href={ctaButtonHref} 
                      className="inline-block bg-brand-red text-white font-mono text-[12px] uppercase px-10 py-4 hover:bg-red-700 transition-colors tracking-widest"
                    >
                      <Editable isAdmin={isAdmin} onSave={(v) => handleTextChange(setCtaButtonText, v)}>{ctaButtonText}</Editable>
                    </a>
                  </div>
                </section>
              )
            ) : (
              clinicCtaHeading && (
                <section className="bg-black py-16 px-8 my-16 text-center relative group">
                  <SectionToolbar 
                    isAdmin={isAdmin} 
                    onRemove={() => { setClinicCtaHeading(""); setToast({message: "Clinic Call to Action removed", type: 'success'}); }}
                  />
                  <span className="font-mono text-[10px] uppercase text-neutral-500 tracking-widest block mb-4">TATTOOSMAP CLINIC NETWORK</span>
                  <h2 className="font-display text-[36px] text-white leading-tight mb-4 uppercase">
                    <Editable isAdmin={isAdmin} onSave={(v) => handleTextChange(setClinicCtaHeading, v)}>{clinicCtaHeading}</Editable>
                  </h2>
                  <p className="font-sans text-[16px] text-neutral-400 max-w-[420px] mx-auto mb-8 leading-relaxed">
                    <Editable isAdmin={isAdmin} onSave={(v) => handleTextChange(setClinicCtaBody, v)}>{clinicCtaBody}</Editable>
                  </p>
                  <div className="flex flex-col items-center gap-4">
                    {isAdmin && (
                      <Editable isAdmin={isAdmin} onSave={(v) => handleTextChange(setClinicCtaButtonHref, v)} className="text-[10px] text-neutral-500 font-mono underline uppercase tracking-widest">Button URL: {clinicCtaButtonHref}</Editable>
                    )}
                    <a 
                      href={clinicCtaButtonHref} 
                      className="inline-block bg-brand-red text-white font-mono text-[12px] uppercase px-10 py-4 hover:bg-red-700 transition-colors tracking-widest"
                    >
                      <Editable isAdmin={isAdmin} onSave={(v) => handleTextChange(setClinicCtaButtonText, v)}>{clinicCtaButtonText}</Editable>
                    </a>
                  </div>
                </section>
              )
            )}
          </div>


        </main>
      </div>
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[500] flex items-center gap-4 bg-black text-white px-6 py-4 font-mono text-[11px] uppercase tracking-widest shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2">
            {toast.type === 'success' && <Check className="w-4 h-4 text-green-400" />}
            {toast.type === 'error' && <X className="w-4 h-4 text-brand-red" />}
            {toast.message}
          </div>
          {toast.type === 'undo' && (
            <button onClick={undoRemove} className="text-brand-red font-bold hover:underline">UNDO</button>
          )}
          <button onClick={() => setToast(null)}><X className="w-3 h-3 text-neutral-500 hover:text-white" /></button>
        </div>
      )}
      {showToolPicker && (
        <div className="fixed inset-0 bg-black/70 z-[300] flex items-center justify-center p-6">
          <div className="bg-white max-w-[540px] w-full border border-black p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-display text-[24px] uppercase tracking-tight">Choose A Tool</h3>
              <button onClick={() => setShowToolPicker(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'SKIN_COMPATIBILITY', label: 'Skin Compatibility Checker', desc: 'For aftercare product posts' },
                { id: 'PAIN_SIMULATOR', label: 'Laser Removal Pain Simulator', desc: 'For tattoo removal posts only — describes laser removal pain not tattoo-getting pain' },
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
                    setHasUnsavedChanges(true);
                    setToast({ message: `TOOL ADDED — ${tool.label.toUpperCase()}`, type: 'success' });
                    setTimeout(() => setToast(null), 3000);
                  }}
                  className="border border-black p-4 text-left hover:bg-neutral-50 transition-colors"
                >
                  <span className="font-mono text-[10px] uppercase tracking-widest font-bold block mb-1">{tool.label}</span>
                  <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest">{tool.desc}</span>
                </button>
              ))}
            </div>
            <button 
              onClick={() => setShowToolPicker(false)}
              className="w-full mt-6 border border-neutral-300 font-mono text-[11px] uppercase py-3 hover:bg-neutral-50 transition-colors"
            >
              CANCEL — NO TOOL NEEDED
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
