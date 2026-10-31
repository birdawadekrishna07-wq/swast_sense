import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  X, 
  Bot, 
  User, 
  AlertTriangle, 
  Languages, 
  ChevronDown, 
  HelpCircle,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const SwasthyaAiChat = ({ isFloating = true }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(!isFloating);
  const [language, setLanguage] = useState('en');
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'assistant',
      text: "Namaste! I am Swasthya AI, your intelligent health assistant. You can ask me questions about symptoms, wellness routines, understanding medical tests, or preparing questions for your doctor. How can I help you today?",
      language: 'en',
      isEmergency: false,
      suggestions: [
        "How do I prepare for my doctor appointment?",
        "What are common causes of headache?",
        "What does high blood pressure mean?"
      ]
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const q = textToSend || inputMessage.trim();
    if (!q || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      language: language
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const patientContext = user ? `Patient: ${user.full_name}, Age: 38, Known conditions: Hypertension` : '';
      const response = await api.sendAiChat(q, language, patientContext);

      const assistantMsg = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        language: response.language,
        isEmergency: response.is_emergency,
        disclaimer: response.disclaimer,
        suggestions: response.suggested_questions || []
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: "I am having temporary trouble reaching the neural service, but remember: for any acute distress please consult a qualified clinician or call emergency services at 112.",
        isEmergency: false
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button (when isFloating is true) */}
      {isFloating && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-brand-600 to-teal-500 hover:from-brand-700 hover:to-teal-600 text-white rounded-full shadow-glow hover:scale-105 transition-all group"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white animate-spin-slow" />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold leading-tight">Swasthya AI</div>
            <div className="text-[10px] text-teal-100 font-medium">Healthcare Assistant</div>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 ring-2 ring-white ml-1"></span>
        </button>
      )}

      {/* Chat Window Modal / Inline Panel */}
      {isOpen && (
        <div className={isFloating 
          ? "fixed bottom-6 right-6 z-50 w-full sm:w-[420px] h-[600px] max-h-[85vh] bg-white rounded-2xl shadow-soft-lg border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
          : "w-full h-full bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden min-h-[600px]"
        }>
          
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-navy-900 to-navy-950 text-white flex items-center justify-between border-b border-navy-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-teal-400 flex items-center justify-center text-white shadow-glow">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  Swasthya AI
                  <span className="text-[10px] bg-brand-500/30 text-brand-300 border border-brand-500/40 px-1.5 py-0.2 rounded font-semibold">Beta</span>
                </h3>
                <p className="text-[10px] text-slate-400">Multilingual Clinical Assistant</p>
              </div>
            </div>

            {/* Language Selector & Close */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="text-xs bg-navy-800 text-slate-200 border border-navy-700 rounded-lg px-2 py-1 pr-6 focus:outline-none cursor-pointer appearance-none"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="mr">मराठी (Marathi)</option>
                  <option value="bn">বাংলা (Bengali)</option>
                  <option value="as">অসমীয়া (Assamese)</option>
                </select>
                <Languages className="w-3.5 h-3.5 text-slate-400 absolute right-1.5 top-2 pointer-events-none" />
              </div>

              {isFloating && (
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-navy-800 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Safety Disclaimer Banner */}
          <div className="px-3.5 py-2 bg-amber-50 border-b border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-tight">
              Swasthya AI provides educational health information and does not replace professional medical advice, diagnosis, or emergency care.
            </p>
          </div>

          {/* Message Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-brand-600 text-white rounded-tr-none'
                    : msg.isEmergency
                    ? 'bg-rose-50 text-rose-950 border-2 border-rose-400 rounded-tl-none'
                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                }`}>
                  {msg.isEmergency && (
                    <div className="flex items-center gap-1.5 font-bold text-rose-600 mb-1.5 text-xs uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4 text-rose-600 animate-bounce" />
                      Emergency Triage Warning
                    </div>
                  )}

                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Suggestion Chips */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Suggested topics:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestions.map((sug, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(sug)}
                            className="text-[11px] text-left px-2.5 py-1 rounded-full bg-slate-100 hover:bg-brand-50 hover:text-brand-600 border border-slate-200 transition-colors"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-300 flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-white rounded-2xl p-3.5 rounded-tl-none border border-slate-100 text-xs text-slate-500 flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <span>Swasthya AI is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-slate-200">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  language === 'hi' ? 'अपने स्वास्थ्य संबंधी प्रश्न पूछें...' :
                  language === 'mr' ? 'आपले आरोग्य प्रश्न विचारा...' :
                  language === 'bn' ? 'আপনার স্বাস্থ্য সম্পর্কিত প্রশ্ন জিজ্ঞাসা করুন...' :
                  language === 'as' ? 'আপোনাৰ স্বাস্থ্য বিষয়ক প্ৰশ্ন সোধক...' :
                  'Ask about symptoms, lab terms, doctor visit prep...'
                }
                className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputMessage.trim() || loading}
                className="p-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white rounded-xl shadow-sm transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-400 mt-2">
              Privacy protected: conversations are encrypted & adhere to medical safety policies.
            </p>
          </div>

        </div>
      )}
    </>
  );
};
