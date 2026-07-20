'use client';

import { useState } from 'react';
import { publishFromQueueAction, deleteFromQueueAction } from '@/actions/admin';
import { X, Send, Trash2, Loader2 } from 'lucide-react';

interface QueuePost {
  id: string;
  title: string;
  post_intent: string;
  category: string;
  created_at: string;
  read_time_minutes: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  posts: QueuePost[];
  onRefresh: () => Promise<void>;
  onToast: (msg: string) => void;
}

export default function PublishQueueDrawer({
  isOpen,
  onClose,
  posts,
  onRefresh,
  onToast,
}: Props) {
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handlePublish = async (postId: string, title: string) => {
    setPublishingId(postId);
    try {
      const result = await publishFromQueueAction(postId);
      if (result.success) {
        onToast(`PUBLISHED — ${title.substring(0, 40)}`);
        await onRefresh();
      } else {
        onToast('Publish failed');
      }
    } finally {
      setPublishingId(null);
    }
  };

  const handleDelete = async (postId: string) => {
    setDeletingId(postId);
    try {
      const result = await deleteFromQueueAction(postId);
      if (result.success) {
        onToast('REMOVED FROM QUEUE');
        await onRefresh();
      }
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-[410]"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-[480px] max-w-[100vw] bg-white z-[420] border-l border-black flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-light bg-off-white">
          <div>
            <p className="font-display text-[20px] uppercase tracking-tight text-black">
              Publishing Queue
            </p>
            <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mt-1 font-bold">
              {posts.length} post{posts.length !== 1 ? 's' : ''} waiting
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 border border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors bg-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-8 text-center text-neutral-400">
              <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-300 mb-2 font-bold">
                Queue is empty
              </p>
              <p className="font-sans text-[13px] text-neutral-500">
                Click ADD TO QUEUE when creating a post to add it here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-light">
              {posts.map((post, index) => (
                <div
                  key={post.id}
                  className="px-6 py-5 hover:bg-neutral-50 transition-colors group"
                >
                  <div className="flex items-start gap-4">

                    {/* Position number */}
                    <span className="font-mono text-[10px] text-neutral-300 w-6 shrink-0 pt-1 font-bold">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    {/* Post info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-[15px] font-medium text-black leading-[1.3] mb-2 line-clamp-2">
                        {post.title}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        {post.post_intent && (
                          <span className="font-mono text-[8px] uppercase tracking-widest text-neutral-500 border border-neutral-200 bg-white px-1.5 py-0.5">
                            {post.post_intent === 'RECOMMEND AND SELL'
                              ? 'SELL'
                              : 'INFORM'}
                          </span>
                        )}
                        {post.category && (
                          <span className="font-mono text-[8px] uppercase tracking-widest text-neutral-500">
                            {post.category}
                          </span>
                        )}
                        <span className="font-mono text-[8px] text-neutral-300">•</span>
                        {post.read_time_minutes > 0 && (
                          <>
                            <span className="font-mono text-[8px] text-neutral-400">
                              {post.read_time_minutes} MIN
                            </span>
                            <span className="font-mono text-[8px] text-neutral-300">•</span>
                          </>
                        )}
                        <span className="font-mono text-[8px] text-neutral-400">
                          {post.created_at && !isNaN(Date.parse(post.created_at)) ? new Date(post.created_at).toLocaleDateString(
                            'en-US',
                            { month: 'short', day: 'numeric' }
                          ) : '—'}
                        </span>
                      </div>
                      
                      {/* Action buttons (only visible on hover or mobile) */}
                      <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handlePublish(post.id, post.title)}
                          disabled={publishingId === post.id}
                          className="flex items-center gap-1.5 bg-black text-white font-mono text-[9px] uppercase tracking-widest px-3 py-1.5 hover:bg-brand-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {publishingId === post.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Send className="w-3 h-3" />
                          )}
                          {publishingId === post.id ? '...' : 'PUBLISH'}
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          disabled={deletingId === post.id}
                          className="flex items-center gap-1.5 border border-neutral-200 text-neutral-500 font-mono text-[9px] uppercase tracking-widest px-3 py-1.5 hover:border-brand-red hover:text-brand-red transition-colors disabled:opacity-50 bg-white"
                        >
                          {deletingId === post.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                          REMOVE
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-light px-6 py-4 bg-off-white">
          <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 text-center font-bold">
            Publish one post per day for best SEO results
          </p>
        </div>
      </div>
    </>
  );
}
