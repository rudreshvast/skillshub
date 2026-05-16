'use client';

import { useState, useEffect } from 'react';
import RichTextEditor from '@/app/components/rich-text-editor';

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; content: string; linked_skill?: string }) => void;
  mode: 'innovation' | 'shortcoming';
  initialData?: { title: string; content: string; linked_skill?: string } | null;
  isSaving?: boolean;
}

export default function KnowledgeBaseModal({
  isOpen,
  onClose,
  onSave,
  mode,
  initialData,
  isSaving,
}: KnowledgeBaseModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [linkedSkill, setLinkedSkill] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title ?? '');
      setContent(initialData?.content ?? '');
      setLinkedSkill(initialData?.linked_skill ?? '');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const isInnovation = mode === 'innovation';
  const label = isInnovation ? 'Innovation' : 'Shortcoming';
  const headerColor = isInnovation ? 'bg-teal-50 border-teal-200' : 'bg-amber-50 border-amber-200';
  const headerText = isInnovation ? 'text-teal-800' : 'text-amber-800';
  const btnColor = isInnovation
    ? 'bg-teal-600 hover:bg-teal-700 text-white'
    : 'bg-amber-500 hover:bg-amber-600 text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b rounded-t-xl ${headerColor}`}>
          <h2 className={`text-base font-semibold ${headerText}`}>
            {initialData ? `Edit ${label}` : `Add ${label}`}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                isInnovation
                  ? 'e.g. Migrated to microservices architecture'
                  : 'e.g. Redis caching caused race conditions'
              }
              className="w-full border border-[#EBEEF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
          </div>

          {/* Linked skill — shortcomings only */}
          {!isInnovation && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Linked Technology / Skill
                <span className="text-slate-400 font-normal ml-1">(optional)</span>
              </label>
              <input
                type="text"
                value={linkedSkill}
                onChange={(e) => setLinkedSkill(e.target.value)}
                placeholder="e.g. Redis, WebSockets, Kubernetes"
                className="w-full border border-[#EBEEF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
              <p className="text-xs text-slate-400 mt-1">
                Links this shortcoming to a skill in the skills directory.
              </p>
            </div>
          )}

          {/* Rich text content */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {isInnovation ? 'What worked and why' : 'What failed and why'}
            </label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder={
                isInnovation
                  ? 'Describe the innovation, what problem it solved, and why it worked well. Add images, links, bullet points...'
                  : 'Describe what failed, the root cause, and what you would do differently. Add images, links, bullet points...'
              }
              minHeight="240px"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#EBEEF0]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 border border-[#EBEEF0] rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              onSave({
                title,
                content,
                linked_skill: linkedSkill || undefined,
              })
            }
            disabled={!title.trim() || !content.trim() || isSaving}
            className={`px-4 py-2 text-sm rounded-lg font-medium disabled:opacity-50 ${btnColor}`}
          >
            {isSaving ? 'Saving...' : initialData ? `Update ${label}` : `Add ${label}`}
          </button>
        </div>
      </div>
    </div>
  );
}
