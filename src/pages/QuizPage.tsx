import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, RotateCcw, Camera, MapPin, Check, X as XIcon } from 'lucide-react';

interface Question {
  q: string;
  options: string[];
  answer: number;
  why: string;
}

const QUESTIONS: Question[] = [
  {
    q: 'A fire breaks out in your building. Which number do you call in Bengaluru?',
    options: ['100', '101', '108', '1912'],
    answer: 1,
    why: '101 is the fire & rescue emergency line. 100 is police, 108 is ambulance, and 1912 is the electricity helpline.',
  },
  {
    q: 'You smell LPG gas in your kitchen. What should you do FIRST?',
    options: [
      'Switch on the exhaust fan',
      'Light a match to check where the leak is',
      'Open windows and close the cylinder regulator — touch no switches',
      'Call 101 from inside the kitchen',
    ],
    answer: 2,
    why: 'Any electrical spark — even a fan or light switch — can ignite leaked gas. Ventilate, cut the supply at the regulator, and step outside before making calls.',
  },
  {
    q: 'A pan of cooking oil catches fire. What should you NEVER do?',
    options: ['Slide a lid over the pan', 'Turn off the stove', 'Pour water on it', 'Use a fire blanket'],
    answer: 2,
    why: 'Water sinks under burning oil, flashes to steam, and throws flaming oil everywhere. Smother it — lid, damp cloth, or fire blanket.',
  },
  {
    q: 'You spot wires hanging low over a footpath in your area. On FireWatch, which department does that report route to?',
    options: ['BBMP', 'Fire Dept', 'BESCOM', 'Traffic Police'],
    answer: 2,
    why: 'BESCOM owns Bengaluru\'s electricity distribution — hanging or exposed wires go straight to them. FireWatch routes it automatically when you report.',
  },
  {
    q: 'How long does a department have before a FireWatch report is publicly marked overdue?',
    options: ['24 hours', '48 hours', '7 days', '30 days'],
    answer: 1,
    why: 'Every verified report carries a 48-hour clock. Miss it, and the report shows up on the public Accountability page as overdue.',
  },
  {
    q: 'A shop has stacked cartons in front of the mall\'s fire exit. What\'s the most useful thing you can do?',
    options: [
      'Move the cartons yourself',
      'Photograph it and file a report — blocked exits are a routed hazard category',
      'Ignore it, someone else will handle it',
      'Post about it on social media only',
    ],
    answer: 1,
    why: 'A 60-second report with a photo creates a tracked, routed ticket with a deadline. Moving things yourself fixes today; a report fixes the habit.',
  },
  {
    q: 'Which of these makes a locality\'s FireWatch safety score go DOWN the most?',
    options: [
      'Being far from a fire station',
      'Unresolved hazard reports',
      'High population density',
      'Being an industrial area',
    ],
    answer: 1,
    why: 'Hazard-free rating is the biggest slice of the score at 40% — active, unresolved hazards drag an area down faster than any other factor.',
  },
  {
    q: 'Your family should agree on one thing before a fire ever happens. What is it?',
    options: [
      'Who calls the insurance company',
      'A meeting point outside and two ways out of every room',
      'Where the property documents are kept',
      'Which valuables to carry out',
    ],
    answer: 1,
    why: 'In smoke and panic, plans beat improvisation. Two exit routes and a fixed meeting point outside is the core of every fire escape plan — carry nothing, just get out.',
  },
];

const VERDICTS: { min: number; title: string; blurb: string }[] = [
  { min: 8, title: 'Honorary Fire Marshal', blurb: 'Perfect score. Your neighborhood is lucky to have you — now put it to work with a report or two.' },
  { min: 6, title: 'Safety Sentinel', blurb: 'Sharp. You know your way around a hazard — brush up on the ones you missed and you\'re marshal material.' },
  { min: 4, title: 'Getting There', blurb: 'A solid base, but a few gaps that matter in a real emergency. Worth a re-run.' },
  { min: 0, title: 'Needs a Fire Drill', blurb: 'No shame — most people never get taught this. Read the explanations, retake it, and you\'ll jump two ranks.' },
];

export default function QuizPage() {
  const [current, setCurrent] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const question = QUESTIONS[current];
  const verdict = VERDICTS.find((v) => score >= v.min)!;

  function pick(i: number) {
    if (picked !== null) return;
    setPicked(i);
    if (i === question.answer) setScore((s) => s + 1);
  }

  function next() {
    if (current + 1 >= QUESTIONS.length) {
      setDone(true);
    } else {
      setCurrent((c) => c + 1);
      setPicked(null);
    }
  }

  function restart() {
    setCurrent(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  }

  return (
    <div>
      <div className="border-b border-ink bg-paper px-6 py-4">
        <div className="mx-auto max-w-[1500px]">
          <Link to="/" className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-ink/50 hover:text-ember">
            ← Back to Home
          </Link>
          <span className="ml-3 font-mono text-[10.5px] uppercase tracking-wide text-ink/45">Test Yourself</span>
          <h1 className="mt-1 font-display text-[38px] font-bold uppercase leading-none text-ink sm:text-[42px]">
            Fire Safety Quiz
          </h1>
          <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-ink/55">
            Eight questions, Bengaluru edition. Most fires are survivable when people know exactly what to do in the
            first sixty seconds — see how many you'd get right.
          </p>
        </div>
      </div>

      <section className="mx-auto max-w-[760px] px-6 py-10">
        {!done ? (
          <div className="border border-ink">
            {/* progress */}
            <div className="flex items-center justify-between border-b border-ink bg-paper-2 px-5 py-2.5">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-ink/60">
                Question {current + 1} of {QUESTIONS.length}
              </span>
              <span className="font-mono text-[11px] text-ink/45">Score: {score}</span>
            </div>
            <div className="h-1 w-full bg-ink/10">
              <div className="h-full bg-ember transition-all" style={{ width: `${((current + (picked !== null ? 1 : 0)) / QUESTIONS.length) * 100}%` }} />
            </div>

            <div className="p-5 sm:p-7">
              <h2 className="font-display text-[20px] font-bold leading-snug text-ink sm:text-[22px]">{question.q}</h2>

              <div className="mt-5 space-y-2.5">
                {question.options.map((opt, i) => {
                  const isAnswer = i === question.answer;
                  const isPicked = i === picked;
                  let style = 'border-ink/25 hover:border-ink text-ink';
                  if (picked !== null) {
                    if (isAnswer) style = 'border-safe bg-safe-soft text-ink';
                    else if (isPicked) style = 'border-high-risk bg-high-risk-soft text-ink';
                    else style = 'border-ink/15 text-ink/45';
                  }
                  return (
                    <button
                      key={opt}
                      onClick={() => pick(i)}
                      disabled={picked !== null}
                      className={`flex w-full items-center justify-between gap-3 border px-4 py-3 text-left text-[14px] font-medium transition-colors ${style}`}
                    >
                      {opt}
                      {picked !== null && isAnswer && <Check size={16} className="shrink-0 text-safe" />}
                      {picked !== null && isPicked && !isAnswer && <XIcon size={16} className="shrink-0 text-high-risk" />}
                    </button>
                  );
                })}
              </div>

              {picked !== null && (
                <div className="mt-5 border border-ink/15 bg-paper-2 px-4 py-3">
                  <div className="font-mono text-[10.5px] font-semibold uppercase tracking-wide text-ink/50">
                    {picked === question.answer ? 'Correct' : 'Not quite'}
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink/70">{question.why}</p>
                </div>
              )}

              {picked !== null && (
                <button
                  onClick={next}
                  className="mt-5 w-full bg-ink py-3 font-display text-[15px] font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-ember"
                >
                  {current + 1 >= QUESTIONS.length ? 'See my result' : 'Next question'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="border border-ink text-center">
            <div className="border-b border-ink bg-ink px-6 py-8">
              <Flame size={28} className="mx-auto text-ember" />
              <div className="mt-3 font-mono text-[46px] font-bold leading-none text-paper">
                {score}<span className="text-[22px] text-paper/50">/{QUESTIONS.length}</span>
              </div>
              <div className="mt-2 font-display text-[24px] font-bold uppercase text-paper">{verdict.title}</div>
            </div>
            <div className="px-6 py-6">
              <p className="mx-auto max-w-md text-[14px] leading-relaxed text-ink/65">{verdict.blurb}</p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  onClick={restart}
                  className="flex items-center justify-center gap-2 border border-ink px-5 py-2.5 font-display text-[14px] font-semibold uppercase tracking-wide text-ink hover:bg-paper-2"
                >
                  <RotateCcw size={14} /> Retake Quiz
                </button>
                <Link
                  to="/report"
                  className="flex items-center justify-center gap-2 bg-ember px-5 py-2.5 font-display text-[14px] font-semibold uppercase tracking-wide text-paper hover:bg-ember-2"
                >
                  <Camera size={14} /> Report a Real Hazard
                </Link>
                <Link
                  to="/heatmap"
                  className="flex items-center justify-center gap-2 border border-ink px-5 py-2.5 font-display text-[14px] font-semibold uppercase tracking-wide text-ink hover:bg-paper-2"
                >
                  <MapPin size={14} /> Check My Area
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
