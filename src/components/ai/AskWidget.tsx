'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const STARTERS = [
  'Is it safe to take ibuprofen while pregnant?',
  'My 6-month-old isn\'t rolling yet — is that normal?',
  'How do I know if my baby is getting enough milk?',
  'What foods should I avoid in the first trimester?',
];

export function AskWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || streaming) return;

    const userMsg: Message = { role: 'user', content };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setStreaming(true);

    // Add empty assistant message to stream into
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    abortRef.current = new AbortController();
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        setMessages(prev => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' };
          return copy;
        });
        setStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content ?? '';
            if (delta) {
              setMessages(prev => {
                const copy = [...prev];
                copy[copy.length - 1] = {
                  role: 'assistant',
                  content: copy[copy.length - 1].content + delta,
                };
                return copy;
              });
            }
          } catch { /* skip malformed chunks */ }
        }
      }
    } catch (e: unknown) {
      if ((e as Error).name !== 'AbortError') {
        setMessages(prev => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: 'assistant', content: 'Connection interrupted. Please try again.' };
          return copy;
        });
      }
    } finally {
      setStreaming(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  function reset() {
    abortRef.current?.abort();
    setMessages([]);
    setInput('');
    setStreaming(false);
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 w-13 h-13 rounded-full shadow-lg flex items-center justify-center transition-all duration-200',
          open ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        )}
        style={{ backgroundColor: '#8B1A2B', width: 52, height: 52 }}
        aria-label="Ask Veri"
      >
        <Sparkles size={22} className="text-white" />
      </button>

      {/* Chat window */}
      <div className={cn(
        'fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 w-[92vw] max-w-sm rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right',
        open ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none'
      )}
        style={{ height: 520, backgroundColor: '#FAF8F3', border: '1px solid rgba(201,168,76,0.2)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100 flex-shrink-0" style={{ backgroundColor: '#8B1A2B' }}>
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Sparkles size={14} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white leading-none">Ask Veri</p>
            <p className="text-[10px] text-white/70 mt-0.5">Maternal health assistant</p>
          </div>
          <button onClick={reset} className="p-1.5 text-white/60 hover:text-white transition-colors" title="New conversation">
            <RotateCcw size={14} />
          </button>
          <button onClick={() => setOpen(false)} className="p-1.5 text-white/60 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col justify-center">
              <div className="text-center mb-5">
                <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: 'rgba(139,26,43,0.08)' }}>
                  <Sparkles size={18} style={{ color: '#8B1A2B' }} />
                </div>
                <p className="text-sm font-semibold text-gray-800">Hi, I'm Veri</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Your maternal health guide. Ask me anything about pregnancy or your baby's first two years.
                </p>
              </div>
              <div className="space-y-2">
                {STARTERS.map(s => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="w-full text-left text-xs px-3 py-2.5 rounded-xl border border-gray-200 bg-white hover:border-brand-crimson/40 hover:bg-brand-crimson/5 transition-colors text-gray-700 leading-snug"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full flex-shrink-0 mr-2 mt-0.5 flex items-center justify-center" style={{ backgroundColor: 'rgba(139,26,43,0.10)' }}>
                    <Sparkles size={11} style={{ color: '#8B1A2B' }} />
                  </div>
                )}
                <div className={cn(
                  'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'text-white rounded-tr-sm'
                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
                )}
                  style={msg.role === 'user' ? { backgroundColor: '#8B1A2B' } : {}}
                >
                  {msg.content || (
                    <span className="flex gap-1 items-center py-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Disclaimer */}
        <div className="px-3 py-1.5 text-center flex-shrink-0">
          <p className="text-[9px] text-gray-400 leading-tight">
            Veri provides general information only — not medical advice. Always consult your doctor.
          </p>
        </div>

        {/* Input */}
        <div className="p-3 border-t border-gray-100 flex-shrink-0 bg-white">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask anything about pregnancy or your baby…"
              rows={1}
              className="flex-1 resize-none text-sm px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-crimson/20 focus:border-brand-crimson/50 bg-gray-50 leading-snug max-h-24 overflow-y-auto"
              style={{ minHeight: 40 }}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || streaming}
              className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40 transition-opacity"
              style={{ backgroundColor: '#8B1A2B' }}
            >
              <Send size={15} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
