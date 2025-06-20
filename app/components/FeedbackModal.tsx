'use client';

import React, { useState } from 'react';

interface FeedbackModalProps {
  open: boolean;
  type: 'positive' | 'negative';
  onClose: () => void;
}

const POSITIVE_OPTIONS = [
  'The energy forecast felt accurate',
  'The daily suggestions were actionable',
  'I liked the crystal and timing tips',
  'The tone felt encouraging and supportive',
  'It matched how I actually felt'
];

const NEGATIVE_OPTIONS = [
  "The forecast didn't feel accurate",
  'Suggestions were too vague',
  'Felt too generic, not personal',
  'Tone felt too negative or unclear',
  "Didn't reflect my actual energy or mood"
];

const FeedbackModal: React.FC<FeedbackModalProps> = ({ open, type, onClose }) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [additional, setAdditional] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const toggleOption = (opt: string) => {
    setSelectedOptions((prev) => (prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');
      const userId = localStorage.getItem('userId') || 'anonymous';
      const payload = {
        userId,
        feedbackType: type,
        reportType: 'monthly',
        content: additional,
        options: selectedOptions
      };
      const res = await fetch('/api/admin/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Submit failed');
      }
      onClose();
      setSelectedOptions([]);
      setAdditional('');
    } catch (e: any) {
      console.error('feedback submit', e);
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const OPTIONS = type === 'positive' ? POSITIVE_OPTIONS : NEGATIVE_OPTIONS;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900 to-purple-950 rounded-xl max-w-md w-full p-6 shadow-xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            {type === 'positive' ? '👍 Awesome! What did you like?' : "👎 Sorry to hear. What didn't work?"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✖
          </button>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-4">
          {OPTIONS.map((opt, idx) => (
            <label key={idx} className="flex items-start text-sm gap-2">
              <input type="checkbox" className="mt-1" checked={selectedOptions.includes(opt)} onChange={() => toggleOption(opt)} />
              <span>{opt}</span>
            </label>
          ))}
        </div>

        {/* Additional */}
        <div className="mb-4">
          <label htmlFor="fb-additional" className="block text-sm mb-2">
            Additional feedback
          </label>
          <textarea
            id="fb-additional"
            value={additional}
            onChange={(e) => setAdditional(e.target.value)}
            className="w-full bg-purple-950/70 border border-purple-800 rounded-md p-2 text-sm text-white"
            rows={3}
          />
        </div>

        {error && <div className="text-red-400 text-sm mb-4">{error}</div>}

        {/* Submit */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded-md text-sm font-medium transition-colors ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal; 