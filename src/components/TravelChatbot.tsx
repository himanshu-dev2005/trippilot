import { useEffect, useRef, useState } from 'react';
import { Bot, MessageCircle, Send, Sparkles, Trash2, X } from 'lucide-react';
import { askTravelAssistant } from '@/lib/trips';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  modelName?: string;
};

type ActiveTripContext = {
  destination?: string;
  numberOfDays?: number;
  budget?: number;
  travelers?: number;
  transportMode?: string;
  stopsSummary?: string;
};

const QUICK_PROMPTS = [
  'Best local food & street stalls?',
  'Local transport & scam tips?',
  'What should I pack?',
  'Suggest a hidden gem nearby',
];

function readTripContext(): ActiveTripContext | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = window.sessionStorage.getItem('trippilot:active-trip-context');
    return raw ? (JSON.parse(raw) as ActiveTripContext) : undefined;
  } catch {
    return undefined;
  }
}

export function TravelChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [tripContext, setTripContext] = useState<ActiveTripContext | undefined>(undefined);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hi! I am TripPilot AI. Ask me for local food spots, cab/scooter tips, packing advice, hidden gems, or help tweaking your itinerary.',
      modelName: 'TripPilot AI',
    },
  ]);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setTripContext(readTripContext());
    const onContextUpdate = () => setTripContext(readTripContext());
    window.addEventListener('trippilot:trip-context', onContextUpdate);
    return () => window.removeEventListener('trippilot:trip-context', onContextUpdate);
  }, []);

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const latestContext = readTripContext() ?? tripContext;
      const res = await askTravelAssistant({
        data: {
          message: trimmed,
          history: nextMessages
            .filter((m) => m.id !== 'welcome')
            .slice(-8)
            .map((m) => ({ role: m.role, content: m.content })),
          ...(latestContext ? { tripContext: latestContext } : {}),
        },
      });
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: res.reply,
          modelName: res.modelName,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I could not reach the assistant right now. Please try again in a moment.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="no-print fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6">
      {open ? (
        <div className="flex h-[500px] w-[calc(100vw-2rem)] max-w-[390px] flex-col overflow-hidden rounded-3xl border border-border/80 bg-card text-card-foreground shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-[#6C3FE4] to-[#8B5CF6] px-4 py-3.5 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-xl bg-white/20">
                <Bot className="size-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">TripPilot AI Chat</h3>
                <p className="text-[11px] text-white/85">
                  {tripContext?.destination
                    ? `Context: ${tripContext.destination} (${tripContext.numberOfDays ?? ''}d)`
                    : 'India Travel Co-Pilot'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Clear chat"
                title="Clear chat"
                onClick={() =>
                  setMessages((prev) => prev.slice(0, 1))
                }
                className="rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
              >
                <Trash2 className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Close AI chat"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-background/60 p-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'rounded-br-sm bg-primary text-primary-foreground'
                      : 'rounded-bl-sm border border-border/60 bg-card text-foreground shadow-xs'
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === 'assistant' && msg.modelName && (
                  <span className="mt-1 px-1 text-[10px] text-muted-foreground">
                    {msg.modelName}
                  </span>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-start">
                <div className="rounded-2xl rounded-bl-sm border border-border/60 bg-card px-3.5 py-2.5 text-xs text-muted-foreground">
                  Thinking…
                </div>
              </div>
            )}
          </div>

          {/* Quick prompts */}
          <div className="flex gap-1.5 overflow-x-auto border-t border-border/50 bg-card px-3 py-2">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => void sendMessage(prompt)}
                className="shrink-0 rounded-full border border-border/70 bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage(input);
            }}
            className="flex items-center gap-2 border-t border-border/60 bg-card p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                tripContext?.destination
                  ? `Ask about ${tripContext.destination}…`
                  : 'Ask about any destination in India…'
              }
              className="h-9 flex-1 rounded-xl border border-border/70 bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open TripPilot AI Chatbot"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#6C3FE4] to-[#8B5CF6] px-4 py-3 text-xs font-bold text-white shadow-lg transition-transform hover:scale-105"
        >
          <Sparkles className="size-4" />
          <span>Ask AI</span>
          <MessageCircle className="size-4 opacity-90" />
        </button>
      )}
    </div>
  );
}
