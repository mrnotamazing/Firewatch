import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame, RotateCcw, Camera, MapPin, Check, X as XIcon, Lightbulb, RefreshCw,
  ClipboardCheck, MessageSquarePlus, LoaderCircle, ThumbsUp, ThumbsDown,
} from 'lucide-react';
import { submitSuggestion, submitPollAnswer, fetchPollResults, type PollResults } from '../lib/api';

interface Question {
  q: string;
  options: string[];
  answer: number;
  why: string;
}

// A large pool — each attempt draws 10 at random, so repeat visits see a different set.
const QUESTION_BANK: Question[] = [
  { q: 'A fire breaks out in your building. Which number do you call in Bengaluru?', options: ['100', '101', '108', '1912'], answer: 1, why: '101 is the fire & rescue emergency line. 100 is police, 108 is ambulance, and 1912 is the electricity helpline.' },
  { q: 'You smell LPG gas in your kitchen. What should you do FIRST?', options: ['Switch on the exhaust fan', 'Light a match to check where the leak is', 'Open windows and close the cylinder regulator — touch no switches', 'Call 101 from inside the kitchen'], answer: 2, why: 'Any electrical spark — even a fan or light switch — can ignite leaked gas. Ventilate, cut the supply at the regulator, and step outside before making calls.' },
  { q: 'A pan of cooking oil catches fire. What should you NEVER do?', options: ['Slide a lid over the pan', 'Turn off the stove', 'Pour water on it', 'Use a fire blanket'], answer: 2, why: 'Water sinks under burning oil, flashes to steam, and throws flaming oil everywhere. Smother it — lid, damp cloth, or fire blanket.' },
  { q: "You spot wires hanging low over a footpath in your area. On FireWatch, which department does that report route to?", options: ['BBMP', 'Fire Dept', 'BESCOM', 'Traffic Police'], answer: 2, why: "BESCOM owns Bengaluru's electricity distribution — hanging or exposed wires go straight to them. FireWatch routes it automatically when you report." },
  { q: 'How long does a department have before a FireWatch report is publicly marked overdue?', options: ['24 hours', '48 hours', '7 days', '30 days'], answer: 1, why: 'Every verified report carries a 48-hour clock. Miss it, and the report shows up on the public Accountability page as overdue.' },
  { q: "A shop has stacked cartons in front of the mall's fire exit. What's the most useful thing you can do?", options: ['Move the cartons yourself', 'Photograph it and file a report — blocked exits are a routed hazard category', 'Ignore it, someone else will handle it', 'Post about it on social media only'], answer: 1, why: 'A 60-second report with a photo creates a tracked, routed ticket with a deadline. Moving things yourself fixes today; a report fixes the habit.' },
  { q: "Which of these makes a locality's FireWatch safety score go DOWN the most?", options: ['Being far from a fire station', 'Unresolved hazard reports', 'High population density', 'Being an industrial area'], answer: 1, why: 'Hazard-free rating is the biggest slice of the score at 40% — active, unresolved hazards drag an area down faster than any other factor.' },
  { q: 'Your family should agree on one thing before a fire ever happens. What is it?', options: ['Who calls the insurance company', 'A meeting point outside and two ways out of every room', 'Where the property documents are kept', 'Which valuables to carry out'], answer: 1, why: 'In smoke and panic, plans beat improvisation. Two exit routes and a fixed meeting point outside is the core of every fire escape plan — carry nothing, just get out.' },
  { q: 'You wake up to a smoke-filled room at night. What should you do before opening the bedroom door?', options: ['Open it fast and run', 'Feel the door/handle for heat first', 'Open the window and shout for help', 'Hide under the bed'], answer: 1, why: 'A hot door means fire is right outside — opening it feeds oxygen to the fire and can cause a flashback. If it\'s cool, open slowly and check for smoke before proceeding.' },
  { q: 'If your clothes catch fire, what should you do?', options: ['Run to find water', 'Stop, Drop, and Roll', 'Wave your arms to put it out', 'Take the clothing off while running'], answer: 1, why: 'Running fans the flames. Stopping, dropping to the ground, and rolling smothers the fire by cutting off oxygen.' },
  { q: 'What class of fire extinguisher is safe to use on an electrical fire?', options: ['Class A (water-based)', 'Class B (foam)', 'Class C (CO2 or dry powder)', 'Any extinguisher works the same'], answer: 2, why: 'Water and foam conduct electricity and can electrocute you. CO2 or dry powder (Class C) extinguishers are rated safe for live electrical fires.' },
  { q: 'How often should you actually test a household smoke alarm?', options: ['Never, they self-test', 'Once a year', 'Once a month', 'Only after it beeps'], answer: 2, why: 'Manufacturers recommend a monthly test button press, with battery replacement at least yearly — dust and age silently disable alarms otherwise.' },
  { q: 'In a crowded building fire, what causes more deaths — flames or smoke?', options: ['Flames', 'Smoke and toxic gases', 'They cause equal deaths', 'Neither, mostly panic-related injuries'], answer: 1, why: 'The majority of fire deaths are from smoke inhalation and toxic gases, not burns — this is why staying low under smoke while evacuating matters so much.' },
  { q: 'Why should you crawl low when escaping a smoke-filled room?', options: ['It\'s faster', 'Smoke and heat rise, leaving cleaner air near the floor', 'It\'s a habit from movies', 'To avoid falling debris only'], answer: 1, why: 'Hot smoke and toxic gases rise and collect near the ceiling first — the breathable air is closer to the floor.' },
  { q: 'What is the single biggest cause of residential fires in Indian cities?', options: ['Lightning strikes', 'Electrical faults / short circuits', 'Arson', 'Wildfire spread'], answer: 1, why: 'Overloaded sockets, old wiring, and short circuits are consistently the leading cause of residential and commercial fires in Indian cities.' },
  { q: 'You\'re on the 8th floor during a fire alarm. What should you use to evacuate?', options: ['The elevator, it\'s faster', 'The stairs', 'Wait for the fire department to reach you', 'The balcony'], answer: 1, why: 'Elevators can fail, open onto a smoke-filled floor, or lose power mid-fire. Stairwells are built with fire-resistance for exactly this situation.' },
  { q: 'A gas cylinder near your stove develops a small leak but hasn\'t ignited. What\'s the safest way to move it?', options: ['Carry it out normally, upright', 'Wrap it in a wet blanket first', 'Roll it outside on its side, away from any flame source', 'Leave it — moving it is more dangerous than the leak'], answer: 2, why: 'Rolling it on its side keeps leaking gas flowing away from the valve area and reduces the chance of it pooling; keep it away from any ignition source throughout.' },
  { q: 'What does the "PASS" technique for fire extinguishers stand for?', options: ['Point, Aim, Spray, Stop', 'Pull, Aim, Squeeze, Sweep', 'Push, Activate, Spray, Step-back', 'Prepare, Assess, Signal, Suppress'], answer: 1, why: 'Pull the pin, Aim at the base of the fire, Squeeze the handle, Sweep side to side — the standard technique taught for portable extinguishers.' },
  { q: 'How far should a fire extinguisher be checked/serviced, generally?', options: ['Never, unless used', 'Every 5 years only', 'Annually', 'Every 10 years'], answer: 2, why: 'Most fire safety codes recommend an annual inspection of pressure, seals, and physical condition, even if the extinguisher was never used.' },
  { q: 'On FireWatch, what does the safety score formula weigh MOST heavily?', options: ['Fire station proximity', 'Hazard-free rating', 'Population density', 'Area type'], answer: 1, why: 'Hazard-free rating carries a 40% weight — the single largest factor — followed by proximity, density, and type at lower weights.' },
  { q: 'Which of these is a "silent" fire risk many people ignore in their kitchen?', options: ['A clean stove', 'Grease buildup on the exhaust hood/chimney', 'A working fridge', 'A properly sealed cylinder'], answer: 1, why: 'Accumulated grease in exhaust hoods and chimneys is highly flammable and a common cause of kitchen fires spreading fast once ignited.' },
  { q: 'Why shouldn\'t you overload a single electrical socket with multiple high-power appliances?', options: ['It voids appliance warranty', 'It can overheat wiring and start a fire', 'It only wastes electricity', 'It has no real risk if the appliances are new'], answer: 1, why: 'Multiple high-draw appliances on one socket/extension can push current beyond what the wiring is rated for, causing overheating and fire.' },
  { q: 'What\'s the correct first step if you discover a small electrical fire in a switchboard?', options: ['Throw water on it immediately', 'Cut the mains power if safely reachable, then use a Class C extinguisher', 'Unplug nearby devices one by one', 'Fan it to see how big it is'], answer: 1, why: 'Cutting power removes the electrical hazard first; only then is it safer to approach with an appropriate extinguisher.' },
  { q: 'On FireWatch\'s map, what does a red flame-shaped pin represent?', options: ['A high-risk locality', 'A fire station', 'An active hazard report', 'A hospital'], answer: 1, why: 'Fire stations are marked with red flame pins on the map, visible at every zoom level since they\'re core reference infrastructure.' },
  { q: 'Which of these Bengaluru-specific hazard categories routes to BBMP on FireWatch?', options: ['Gas Leak / LPG Hazard', 'Flammable Waste / Garbage', 'Overloaded Electrical Panel', 'Blocked Fire Exit'], answer: 1, why: 'Flammable waste and open burning both route to BBMP, since municipal waste management falls under their jurisdiction.' },
  { q: 'True or false: a fire can double in size roughly every minute in its early stage.', options: ['True', 'False'], answer: 0, why: 'Early-stage residential fires can double in size roughly every 30–60 seconds — this is exactly why escaping fast beats trying to fight a growing fire.' },
  { q: 'What should you do if you\'re trapped in a room during a fire and can\'t reach an exit?', options: ['Hide in a closet', 'Seal the door gaps with wet cloth and signal from a window', 'Break through a wall', 'Stay near the door and wait quietly'], answer: 1, why: 'Sealing gaps slows smoke entry, and signaling from a window (light, cloth, shouting) helps rescuers locate you quickly.' },
  { q: 'Why do many fire safety experts recommend against using elevators\' "fire lift" during a public evacuation?', options: ['They are reserved strictly for fire personnel/emergency use', 'They are too slow', 'They don\'t exist in most buildings', 'They automatically lock during a fire'], answer: 0, why: 'Fire lifts are typically reserved for firefighters and authorized emergency responders during an active fire, not general public evacuation.' },
  { q: 'What is a "fire load" in a building?', options: ['The maximum number of people allowed inside', 'The total combustible material that could fuel a fire', 'The weight limit of the fire escape', 'The electrical load capacity'], answer: 1, why: 'Fire load refers to the total amount of combustible material (furniture, paper, plastics, etc.) present, which determines how intense and long a fire could burn.' },
  { q: 'Which material is generally the SAFEST for curtains/furnishings in fire-prone spaces?', options: ['Regular cotton', 'Flame-retardant treated fabric', 'Synthetic polyester blends', 'Any fabric, it doesn\'t matter'], answer: 1, why: 'Flame-retardant treated fabrics resist ignition and slow flame spread significantly compared to untreated cotton or synthetic blends.' },
  { q: 'On FireWatch, who verifies a hazard report before a ticket email is sent to a department?', options: ['No one, it\'s automatic', 'An on-duty officer', 'The person who reported it', 'BBMP directly'], answer: 1, why: 'An on-duty officer reviews every report and assigns/escalates it before a ticket is actually sent — this keeps the system accountable, not automated blindly.' },
  { q: 'What\'s the recommended minimum width to keep clear in front of a fire exit door?', options: ['No requirement', 'Just enough for one person to squeeze through', 'The full width of the door, kept completely unobstructed', 'Half the door width is fine'], answer: 2, why: 'Fire exits must be kept fully unobstructed — even partial blocking with furniture, boxes, or displays can slow evacuation fatally during a real emergency.' },
  { q: 'Which of these is NOT one of Bengaluru\'s three main departments FireWatch routes reports to?', options: ['BESCOM', 'BBMP', 'Fire Dept', 'BWSSB'], answer: 3, why: 'FireWatch routes to BESCOM (electrical), BBMP (municipal/waste), and the Fire Department — BWSSB (water supply) isn\'t part of the routing.' },
  { q: 'A candle left burning unattended near curtains is an example of what kind of hazard?', options: ['Structural hazard', 'Open flame / ignition source hazard', 'Electrical hazard', 'Not really a hazard'], answer: 1, why: 'Unattended open flames near combustible material are one of the most preventable causes of household fires.' },
  { q: 'What\'s the correct action if your building\'s fire alarm goes off but you don\'t see or smell smoke?', options: ['Assume it\'s false and ignore it', 'Evacuate anyway, following the plan', 'Wait 10 minutes to confirm', 'Call a friend to check first'], answer: 1, why: 'Never assume an alarm is false — evacuate immediately and let it be confirmed as false only once you\'re safely outside.' },
  { q: 'What does a "moderate" FireWatch safety score band generally mean for a locality (65–79)?', options: ['No hazards ever reported', 'Reasonably safe but with some risk factors worth monitoring', 'Currently on fire', 'Same as "safe"'], answer: 1, why: 'Moderate means the area has real risk factors — density, hazard history, or proximity — worth resident attention, without being acutely dangerous.' },
  { q: 'Which of these actions helps a FIRE DEPARTMENT respond faster to your building?', options: ['Keeping your building number clearly visible from the street', 'Locking the gate at night always', 'Parking cars in front of the entrance', 'Nothing helps, response time is fixed'], answer: 0, why: 'Clearly visible building numbers/addresses save critical minutes for responders trying to locate the right building, especially at night.' },
  { q: 'Why is it dangerous to re-enter a burning building to retrieve belongings?', options: ['It isn\'t, if you\'re quick', 'Fire and smoke conditions can change catastrophically within seconds', 'Insurance won\'t cover items retrieved this way', 'It\'s only dangerous for pets'], answer: 1, why: 'Fire behavior is unpredictable — a survivable room can become fatal within moments due to flashover or smoke buildup. No possession is worth that risk.' },
  { q: 'What should a household fire escape plan include besides exit routes?', options: ['Nothing else is needed', 'A fixed outdoor meeting point', 'A list of valuables to save', 'The landlord\'s phone number'], answer: 1, why: 'A meeting point lets everyone confirm who\'s safely out, so rescuers know immediately whether anyone is still inside.' },
  { q: 'Which of these best describes what "reported hazard" means in FireWatch\'s scoring?', options: ['A rumor about an area', 'A resident-submitted, department-routed issue with a tracked status', 'A police FIR', 'A news article about a fire'], answer: 1, why: 'Every hazard report on FireWatch is a real submission from a resident, routed to a specific department, and tracked through resolution.' },
];

const FUN_FACTS = [
  'A residential fire can turn from a small flame to a fully engulfed room in under 3 minutes.',
  'Cooking is the leading cause of home fires worldwide — and most start when the cook briefly leaves the kitchen.',
  'Modern synthetic furniture burns faster and produces more toxic smoke than furniture made decades ago.',
  'The "stop, drop, and roll" technique was popularized in the 1970s and is still the correct response if your clothing catches fire.',
  'Smoke alarms cut the risk of dying in a reported home fire by roughly half.',
  'A fire needs three things to burn — heat, fuel, and oxygen — remove any one, and it goes out. This is called the "fire triangle."',
  'Most fire deaths are caused by smoke inhalation, not burns.',
  'Firefighting foam works by smothering a fire, cutting off its oxygen supply, rather than cooling it like water does.',
  'Bengaluru\'s Fire & Emergency Services responds to thousands of calls every year — many for entirely preventable electrical fires.',
  'A single overloaded extension board is one of the most common fire hazards found in Indian homes and small offices.',
  'Fire doors are specifically engineered to hold back flames for a set duration (often 30–120 minutes) to allow safe evacuation.',
  'The color of smoke can hint at what\'s burning — but relying on it to decide your response is far riskier than just evacuating immediately.',
  'India loses thousands of lives annually to fire-related incidents, a large share of which fire-safety awareness could help prevent.',
  'A greasy kitchen exhaust hood is dramatically more flammable than a regularly cleaned one — grease itself burns readily.',
  'Battery-related fires (from damaged lithium-ion batteries) are a fast-growing hazard category worldwide, including in India.',
];

const SELF_ASSESSMENT: { id: string; q: string }[] = [
  { id: 'checked-extinguisher', q: 'Have you checked your fire extinguisher (or confirmed you have one) in the last 6 months?' },
  { id: 'know-exit', q: 'Do you know your building\'s nearest fire exit or escape route right now, without checking?' },
  { id: 'tested-alarm', q: 'Have you ever tested a smoke alarm in your home?' },
  { id: 'family-plan', q: 'Does your household have an agreed meeting point in case of a fire?' },
  { id: 'checked-wiring', q: 'Have you ever gotten your home\'s electrical wiring professionally inspected?' },
  { id: 'reported-hazard', q: 'Have you ever reported a fire hazard you noticed — to anyone, not just FireWatch?' },
  { id: 'know-number', q: 'Could you recall Bengaluru\'s fire emergency number without looking it up?' },
  { id: 'overloaded-socket', q: 'Do you currently have more than 2 high-power appliances plugged into a single extension board?' },
];

const VERDICTS: { min: number; title: string; blurb: string }[] = [
  { min: 8, title: 'Honorary Fire Marshal', blurb: 'Perfect score. Your neighborhood is lucky to have you — now put it to work with a report or two.' },
  { min: 6, title: 'Safety Sentinel', blurb: "Sharp. You know your way around a hazard — brush up on the ones you missed and you're marshal material." },
  { min: 4, title: 'Getting There', blurb: 'A solid base, but a few gaps that matter in a real emergency. Worth a re-run.' },
  { min: 0, title: 'Needs a Fire Drill', blurb: "No shame — most people never get taught this. Read the explanations, retake it, and you'll jump two ranks." },
];

const QUIZ_LENGTH = 10;

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

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
        {SELF_ASSESSMENT.map(({ id, q }) => {
          const mine = answered[id];
          const r = results[id];
          const total = r ? r.yes + r.no : 0;
          const yesPct = total ? Math.round((r!.yes / total) * 100) : 0;
          return (
            <div key={id} className="px-5 py-4">
              <p className="text-[13.5px] leading-snug text-ink">{q}</p>
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

function SuggestionsBox() {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setStatus('sending');
    try {
      await submitSuggestion(message.trim());
      setStatus('sent');
      setMessage('');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="border border-ink">
      <div className="flex items-center gap-2.5 border-b border-ink bg-paper-2 px-5 py-3.5">
        <MessageSquarePlus size={18} className="text-ember" />
        <div>
          <div className="font-mono text-[10.5px] font-semibold uppercase tracking-wide text-ink/45">Your Voice</div>
          <h3 className="font-display text-[16px] font-bold uppercase leading-none text-ink">Suggestions &amp; Ideas</h3>
        </div>
      </div>
      <div className="p-5">
        {status === 'sent' ? (
          <div className="flex items-center gap-2 border border-safe/30 bg-safe-soft px-4 py-3 text-[13px] text-safe">
            <Check size={16} /> Thanks — your suggestion was recorded and will be reviewed.
          </div>
        ) : (
          <form onSubmit={submit}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Missing a feature? Spotted something confusing? Have an idea for FireWatch? Drop it here…"
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
        )}
      </div>
    </div>
  );
}

export default function QuizPage() {
  const [questions, setQuestions] = useState<Question[]>(() => shuffle(QUESTION_BANK).slice(0, QUIZ_LENGTH));
  const [current, setCurrent] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const question = questions[current];
  const verdict = useMemo(() => VERDICTS.find((v) => score >= v.min)!, [score]);

  function pick(i: number) {
    if (picked !== null) return;
    setPicked(i);
    if (i === question.answer) setScore((s) => s + 1);
  }

  function next() {
    if (current + 1 >= questions.length) {
      setDone(true);
    } else {
      setCurrent((c) => c + 1);
      setPicked(null);
    }
  }

  function restart() {
    setQuestions(shuffle(QUESTION_BANK).slice(0, QUIZ_LENGTH));
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
          <span className="ml-3 font-mono text-[10.5px] uppercase tracking-wide text-ink/45">While You're At It</span>
          <h1 className="mt-1 font-display text-[38px] font-bold uppercase leading-none text-ink sm:text-[42px]">
            A Few More Things
          </h1>
          <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-ink/55">
            A quick self-check, a fire safety fact, a place to tell us what to build next, and a quiz — drawn fresh
            from a growing question bank every time.
          </p>
        </div>
      </div>

      <section className="mx-auto max-w-[760px] space-y-6 px-6 py-10">
        <FunFactCard />
        <SelfAssessment />
        <SuggestionsBox />

        <div className="border border-ink">
          <div className="flex items-center gap-2.5 border-b border-ink bg-paper-2 px-5 py-3.5">
            <Flame size={18} className="text-ember" />
            <div>
              <div className="font-mono text-[10.5px] font-semibold uppercase tracking-wide text-ink/45">Test Yourself</div>
              <h3 className="font-display text-[16px] font-bold uppercase leading-none text-ink">Fire Safety Quiz</h3>
            </div>
          </div>

          {!done ? (
            <div>
              <div className="flex items-center justify-between border-b border-ink/15 bg-paper-2 px-5 py-2.5">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-ink/60">
                  Question {current + 1} of {questions.length}
                </span>
                <span className="font-mono text-[11px] text-ink/45">Score: {score}</span>
              </div>
              <div className="h-1 w-full bg-ink/10">
                <div className="h-full bg-ember transition-all" style={{ width: `${((current + (picked !== null ? 1 : 0)) / questions.length) * 100}%` }} />
              </div>

              <div className="p-5 sm:p-7">
                <h2 className="font-display text-[19px] font-bold leading-snug text-ink sm:text-[21px]">{question.q}</h2>

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
                    {current + 1 >= questions.length ? 'See my result' : 'Next question'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="border-b border-ink bg-ink px-6 py-8">
                <Flame size={28} className="mx-auto text-ember" />
                <div className="mt-3 font-mono text-[46px] font-bold leading-none text-paper">
                  {score}<span className="text-[22px] text-paper/50">/{questions.length}</span>
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
                    <RotateCcw size={14} /> New Set of 10
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
        </div>
      </section>
    </div>
  );
}
