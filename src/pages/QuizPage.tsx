import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  Lightbulb, RefreshCw, ClipboardCheck, MessageSquarePlus, LoaderCircle,
  ThumbsUp, ThumbsDown, Info, Check, Flame, ShieldAlert, X, Globe2,
} from 'lucide-react';
import { submitSuggestion, submitPollAnswer, fetchPollResults, type PollResults } from '../lib/api';

const FUN_FACTS = [
  'A residential fire can turn from a small flame to a fully engulfed room in under 3 minutes.',
  'Cooking is the leading cause of home fires worldwide — and most start when the cook briefly leaves the kitchen.',
  'Modern synthetic furniture burns faster and produces more toxic smoke than furniture made decades ago.',
  'The "stop, drop, and roll" technique was popularized in the 1970s and is still the correct response if your clothing catches fire.',
  'Smoke alarms cut the risk of dying in a reported home fire by roughly half.',
  'A fire needs three things to burn — heat, fuel, and oxygen — remove any one, and it goes out. This is called the "fire triangle."',
  'Most fire deaths are caused by smoke inhalation, not burns.',
  'Firefighting foam works by smothering a fire, cutting off its oxygen supply, rather than cooling it like water does.',
  "Bengaluru's Fire & Emergency Services responds to thousands of calls every year — many for entirely preventable electrical fires.",
  'A single overloaded extension board is one of the most common fire hazards found in Indian homes and small offices.',
  'Fire doors are specifically engineered to hold back flames for a set duration (often 30–120 minutes) to allow safe evacuation.',
  'India loses thousands of lives annually to fire-related incidents, a large share of which fire-safety awareness could help prevent.',
  'A greasy kitchen exhaust hood is dramatically more flammable than a regularly cleaned one — grease itself burns readily.',
  'Battery-related fires (from damaged lithium-ion batteries) are a fast-growing hazard category worldwide, including in India.',
];

const SELF_ASSESSMENT: { id: string; q: string; hint: string }[] = [
  {
    id: 'checked-extinguisher',
    q: 'Have you checked your fire extinguisher (or confirmed you have one) in the last 6 months?',
    hint: 'Check the pressure gauge needle is in the green zone, the pin and seal are intact, and there\'s no visible damage or corrosion. Most home extinguishers should also be professionally serviced annually.',
  },
  {
    id: 'know-exit',
    q: "Do you know your building's nearest fire exit or escape route right now, without checking?",
    hint: 'Walk your escape route once, physically — not just mentally. Note any point that could be blocked (locked gates, stored furniture) and raise it with your building management if so.',
  },
  {
    id: 'tested-alarm',
    q: 'Have you ever tested a smoke alarm in your home?',
    hint: 'Press and hold the test button until it beeps — that confirms the siren works, not the smoke sensor itself. Replace batteries at least once a year regardless of whether it has beeped low.',
  },
  {
    id: 'family-plan',
    q: 'Does your household have an agreed meeting point in case of a fire?',
    hint: 'Pick a fixed spot outside — a gate, a tree, a neighbor\'s porch — that everyone agrees on in advance. In smoke and panic, having one less decision to make saves time.',
  },
  {
    id: 'checked-wiring',
    q: "Have you ever gotten your home's electrical wiring professionally inspected?",
    hint: 'Warning signs worth an inspection: warm switchboards, frequently tripping breakers, flickering lights, or a burning smell near outlets. Wiring older than 20 years is worth a check regardless.',
  },
  {
    id: 'reported-hazard',
    q: 'Have you ever reported a fire hazard you noticed — to anyone, not just FireWatch?',
    hint: 'Hanging wires, blocked exits, and gas leaks rarely get fixed on their own. A report — even an informal one — is what actually starts the fix.',
  },
  {
    id: 'know-number',
    q: "Could you recall Bengaluru's fire emergency number without looking it up?",
    hint: 'It\'s 101 for Fire & Rescue directly, or 112 as India\'s universal emergency number, which also routes to fire services.',
  },
  {
    id: 'overloaded-socket',
    q: 'Do you currently have more than 2 high-power appliances plugged into a single extension board?',
    hint: 'High-draw appliances — heaters, irons, microwaves, ACs — should generally each have their own dedicated socket rather than sharing an extension board with other high-power devices.',
  },
];

function FunFactCard() {
  const [fact, setFact] = useState(() => FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)]);

  function shuffleFact() {
    setFact((current) => {
      let next = current;
      while (next === current) next = FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)];
      return next;
    });
  }

  return (
    <div className="flex items-start gap-3 border border-ink bg-paper-2 p-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-ember/30 bg-ember-soft text-ember">
        <Lightbulb size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="font-mono text-[10.5px] font-semibold uppercase tracking-wide text-ink/45">Fun Fact / Tip</div>
          <button onClick={shuffleFact} title="Show another fact" className="text-ink/40 hover:text-ember">
            <RefreshCw size={13} />
          </button>
        </div>
        <p className="mt-1 text-[13.5px] leading-relaxed text-ink">{fact}</p>
      </div>
    </div>
  );
}

function SelfAssessment() {
  const [answered, setAnswered] = useState<Record<string, 'yes' | 'no'>>({});
  const [results, setResults] = useState<PollResults>({});
  const [loading, setLoading] = useState(true);
  const [hintOpen, setHintOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchPollResults()
      .then(setResults)
      .catch(() => {})
      .finally(() => setLoading(false));

    const stored: Record<string, 'yes' | 'no'> = {};
    for (const { id } of SELF_ASSESSMENT) {
      const v = localStorage.getItem(`fw_poll_${id}`);
      if (v === 'yes' || v === 'no') stored[id] = v;
    }
    setAnswered(stored);
  }, []);

  async function answer(id: string, value: 'yes' | 'no') {
    if (answered[id]) return;
    setAnswered((prev) => ({ ...prev, [id]: value }));
    localStorage.setItem(`fw_poll_${id}`, value);
    setResults((prev) => {
      const cur = prev[id] ?? { yes: 0, no: 0 };
      return { ...prev, [id]: { ...cur, [value]: cur[value] + 1 } };
    });
    setHintOpen((prev) => ({ ...prev, [id]: true }));
    try {
      await submitPollAnswer(id, value);
    } catch {
      // Local state already reflects the answer — fine if the network call quietly fails.
    }
  }

  return (
    <div className="border border-ink">
      <div className="flex items-center gap-2.5 border-b border-ink bg-paper-2 px-5 py-3.5">
        <ClipboardCheck size={18} className="text-ember" />
        <div>
          <div className="font-mono text-[10.5px] font-semibold uppercase tracking-wide text-ink/45">Self-Check</div>
          <h3 className="font-display text-[16px] font-bold uppercase leading-none text-ink">How Ready Are You, Really?</h3>
        </div>
      </div>
      <div className="divide-y divide-ink/10">
        {SELF_ASSESSMENT.map(({ id, q, hint }) => {
          const mine = answered[id];
          const r = results[id];
          const total = r ? r.yes + r.no : 0;
          const yesPct = total ? Math.round((r!.yes / total) * 100) : 0;
          const showHint = hintOpen[id];
          return (
            <div key={id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[13.5px] leading-snug text-ink">{q}</p>
                <button
                  onClick={() => setHintOpen((prev) => ({ ...prev, [id]: !prev[id] }))}
                  title="Learn more"
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border ${showHint ? 'border-ember bg-ember-soft text-ember' : 'border-ink/20 text-ink/40 hover:text-ember'}`}
                >
                  <Info size={13} />
                </button>
              </div>

              {showHint && (
                <p className="mt-2 border-l-2 border-ember/40 bg-ember-soft/40 py-1.5 pl-3 text-[12px] leading-relaxed text-ink/70">
                  {hint}
                </p>
              )}

              {!mine ? (
                <div className="mt-2.5 flex gap-2">
                  <button
                    onClick={() => answer(id, 'yes')}
                    className="flex items-center gap-1.5 border border-safe px-3.5 py-1.5 font-mono text-[11.5px] font-semibold uppercase tracking-wide text-safe hover:bg-safe-soft"
                  >
                    <ThumbsUp size={12} /> Yes
                  </button>
                  <button
                    onClick={() => answer(id, 'no')}
                    className="flex items-center gap-1.5 border border-high-risk px-3.5 py-1.5 font-mono text-[11.5px] font-semibold uppercase tracking-wide text-high-risk hover:bg-high-risk-soft"
                  >
                    <ThumbsDown size={12} /> No
                  </button>
                </div>
              ) : (
                <div className="mt-2.5">
                  <div className="flex h-5 w-full overflow-hidden border border-ink/15">
                    <div className="flex items-center justify-center bg-safe font-mono text-[10px] font-bold text-paper" style={{ width: `${Math.max(yesPct, 6)}%` }}>
                      {yesPct >= 12 && `${yesPct}%`}
                    </div>
                    <div className="flex flex-1 items-center justify-center bg-high-risk/70 font-mono text-[10px] font-bold text-paper">
                      {100 - yesPct >= 12 && `${100 - yesPct}%`}
                    </div>
                  </div>
                  <div className="mt-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-wide text-ink/45">
                    <span>{yesPct}% Yes · {100 - yesPct}% No</span>
                    <span>{total} response{total === 1 ? '' : 's'} · you said {mine}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {loading && (
        <div className="flex items-center gap-1.5 border-t border-ink/10 px-5 py-2 font-mono text-[10.5px] text-ink/40">
          <LoaderCircle size={11} className="animate-spin" /> Loading community results…
        </div>
      )}
    </div>
  );
}

const CATEGORIES: { id: 'fire-safety' | 'firewatch-idea'; label: string; icon: typeof Flame; placeholder: string }[] = [
  {
    id: 'fire-safety',
    label: 'Fire Safety in India',
    icon: ShieldAlert,
    placeholder: 'A gap you\'ve noticed, a policy that should exist, something that should be common knowledge but isn\'t…',
  },
  {
    id: 'firewatch-idea',
    label: 'FireWatch Idea',
    icon: Flame,
    placeholder: 'A feature you wish this site had, something confusing, a bug — anything for FireWatch itself…',
  },
];

function SuggestionsModal({ onClose }: { onClose: () => void }) {
  const [category, setCategory] = useState<'fire-safety' | 'firewatch-idea'>('firewatch-idea');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const active = CATEGORIES.find((c) => c.id === category)!;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setStatus('sending');
    try {
      const label = category === 'fire-safety' ? 'Fire Safety in India' : 'FireWatch Idea';
      await submitSuggestion(`[${label}] ${message.trim()}`);
      setStatus('sent');
      setMessage('');
    } catch {
      setStatus('error');
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-ink/60 p-4 py-10" onClick={onClose}>
      <div className="w-full max-w-md border border-ink bg-paper shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-ink/15 px-5 py-4">
          <div>
            <div className="font-mono text-[10px] font-medium uppercase tracking-wide text-ink/45">Your Voice</div>
            <h2 className="font-display text-[18px] font-bold uppercase leading-none text-ink">Suggestions to Make India More Fire-Safe?</h2>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 shrink-0 items-center justify-center border border-ink/20 text-ink/50 hover:bg-paper-2 hover:text-ink">
            <X size={15} />
          </button>
        </div>

        <div className="p-5">
          {status === 'sent' ? (
            <div className="flex items-center gap-2 border border-safe/30 bg-safe-soft px-4 py-3 text-[13px] text-safe">
              <Check size={16} /> Thanks — your suggestion was recorded and will be reviewed.
            </div>
          ) : (
            <>
              <p className="mb-4 flex items-start gap-2 text-[12.5px] leading-relaxed text-ink/55">
                <Globe2 size={14} className="mt-0.5 shrink-0 text-ember" />
                FireWatch started right here in Bengaluru — the goal is to prove this accountability model works, then
                take it to more Indian cities, and eventually beyond.
              </p>
              <form onSubmit={submit}>
                <div className="mb-3 flex gap-2">
                  {CATEGORIES.map((c) => {
                    const Icon = c.icon;
                    const isActive = c.id === category;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCategory(c.id)}
                        className={`flex flex-1 items-center justify-center gap-1.5 border px-2 py-2 font-mono text-[11px] font-semibold uppercase tracking-wide ${
                          isActive ? 'border-ink bg-ink text-paper' : 'border-ink/20 text-ink/50 hover:border-ink/40'
                        }`}
                      >
                        <Icon size={12} /> {c.label}
                      </button>
                    );
                  })}
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={active.placeholder}
                  autoFocus
                  rows={3}
                  className="w-full border border-ink/25 bg-paper px-3.5 py-2.5 text-[13px] text-ink focus:border-ink focus:outline-none"
                />
                <div className="mt-2.5 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={status === 'sending' || !message.trim()}
                    className="flex items-center gap-1.5 bg-ink px-4 py-2 font-display text-[12.5px] font-semibold uppercase tracking-wide text-paper hover:bg-ink-2 disabled:opacity-40"
                  >
                    {status === 'sending' ? <LoaderCircle size={13} className="animate-spin" /> : 'Send'}
                  </button>
                  {status === 'error' && <span className="font-mono text-[11px] text-high-risk">Could not send — try again.</span>}
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function SuggestionsTrigger() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [scrolling, setScrolling] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    function handleScroll() {
      setScrolling(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setScrolling(false), 900);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeout);
    };
  }, []);

  if (dismissed) return null;

  return (
    <>
      <div className="fixed bottom-5 right-5 z-40 sm:bottom-6 sm:right-6">
        <button
          onClick={() => setOpen(true)}
          className={`flex items-center overflow-hidden border border-ink bg-paper text-left shadow-lg transition-all duration-700 ease-in-out hover:bg-paper-2 ${
            scrolling ? 'h-11 w-11 justify-center gap-0 p-0' : 'w-[220px] gap-2.5 py-3 pl-4 pr-6'
          }`}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-ember/40 bg-ember-soft text-ember transition-all duration-700 ease-in-out">
            <MessageSquarePlus size={16} />
          </span>
          <span
            className={`overflow-hidden font-display text-[13px] font-bold uppercase leading-snug text-ink transition-all duration-700 ease-in-out ${
              scrolling ? 'w-0 opacity-0' : 'w-[160px] opacity-100'
            }`}
          >
            Help Bengaluru get more fire-safe
          </span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDismissed(true);
          }}
          aria-label="Dismiss suggestions prompt"
          tabIndex={scrolling ? -1 : 0}
          className={`absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-ink/25 bg-paper text-ink/50 shadow transition-all duration-700 ease-in-out hover:text-ink ${
            scrolling ? 'pointer-events-none scale-75 opacity-0' : 'scale-100 opacity-100'
          }`}
        >
          <X size={11} />
        </button>
      </div>
      {open && <SuggestionsModal onClose={() => setOpen(false)} />}
    </>
  );
}

export default function QuizPage() {
  return (
    <div>
      <div className="border-b border-ink bg-paper px-6 py-4">
        <div className="mx-auto max-w-[1500px]">
          <Link to="/" className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-ink/50 hover:text-ember">
            ← Back to Home
          </Link>
          <span className="ml-3 font-mono text-[10.5px] uppercase tracking-wide text-ink/45">While You're At It</span>
          <h1 className="mt-1 font-display text-[38px] font-bold uppercase leading-none text-ink sm:text-[42px]">
            A Few More Things
          </h1>
          <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-ink/55">
            A quick self-check with tips as you go, a fire safety fact, and a place to tell us what to build next.
          </p>
        </div>
      </div>

      <section className="mx-auto max-w-[760px] space-y-6 px-6 py-10">
        <FunFactCard />
        <SelfAssessment />
      </section>

      <SuggestionsTrigger />
    </div>
  );
}
