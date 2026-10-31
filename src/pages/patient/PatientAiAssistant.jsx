import React from 'react';
import { SwasthyaAiChat } from '../../components/ai/SwasthyaAiChat';
import { Sparkles, ShieldCheck, Heart, Languages, AlertTriangle } from 'lucide-react';

export const PatientAiAssistant = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>AI Clinical Education & Triage Guidance</span>
          </div>
          <h2 className="text-2xl font-extrabold text-navy-900">Swasthya AI Healthcare Assistant</h2>
          <p className="text-xs text-slate-500">
            Multilingual AI assistant available in English, Hindi, Marathi, Bengali, and Assamese
          </p>
        </div>
      </div>

      {/* Embedded Full Assistant Terminal */}
      <div className="h-[700px] w-full">
        <SwasthyaAiChat isFloating={false} />
      </div>
    </div>
  );
};
