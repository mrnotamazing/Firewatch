import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, Trash2, TriangleAlert, Ban, FlaskConical, Cpu, Flame, Flag,
  Phone, ImagePlus, X, ArrowLeft, ArrowRight, CheckCircle2, Clock, LocateFixed, LoaderCircle,
} from 'lucide-react';
import { hazardCategories, hazardCategoryMap } from '../lib/data/hazardCategories';
import { localities } from '../lib/data/localities';
import type { HazardCategory } from '../lib/types';
import { useHazardStore } from '../lib/store';
import StatusBadge from '../components/StatusBadge';
import { timeAgo } from '../lib/format';
import { nearestStation } from '../lib/geo';

type GeoState =
  | { status: 'idle' }
  | { status: 'locating' }
  | { status: 'found'; localityName: string; distanceKm: number }
  | { status: 'error'; message: string };

const CATEGORY_ICONS: Record<HazardCategory, typeof Zap> = {
  'hanging-wires': Zap,
  'flammable-waste': Trash2,
  'gas-leak': TriangleAlert,
  'blocked-exit': Ban,
  'chemical-storage': FlaskConical,
  'electrical-panel': Cpu,
  'open-burning': Flame,
  other: Flag,
};

const STEPS = ['Category', 'Details', 'Contact'] as const;

export default function ReportHazardPage() {
  const reports = useHazardStore((s) => s.reports);
  const addReport = useHazardStore((s) => s.addReport);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<HazardCategory | null>(null);
  const [localityId, setLocalityId] = useState(localities[0].id);
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>();
  const [reporterName, setReporterName] = useState('');
  const [reporterContact, setReporterContact] = useState('');
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [geo, setGeo] = useState<GeoState>({ status: 'idle' });

  const recent = useMemo(() => [...reports].sort((a, b) => b.createdAt - a.createdAt).slice(0, 4), [reports]);

  const canContinueFromDetails = description.trim().length > 0;
  const canSubmit = reporterName.trim().length > 0;

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setGeo({ status: 'error', message: 'Geolocation is not supported by this browser.' });
      return;
    }
    setGeo({ status: 'locating' });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const point = { lat: position.coords.latitude, lng: position.coords.longitude };
        const { station: nearest, distanceKm } = nearestStation(point, localities);
        setLocalityId(nearest.id);
        setGeo({ status: 'found', localityName: nearest.name, distanceKm });
      },
      (err) => {
        setGeo({
          status: 'error',
          message: err.code === err.PERMISSION_DENIED ? 'Location permission denied — pick your locality below.' : 'Could not get your location — pick your locality below.',
        });
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  async function handleSubmit() {
    if (!category || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    const fullDescription = address.trim() ? `${address.trim()} — ${description.trim()}` : description.trim();
    try {
      const report = await addReport({
        category,
        localityId,
        description: fullDescription,
        photoDataUrl,
        reporterName: reporterName.trim(),
        reporterContact: reporterContact.trim() || undefined,
      });
      setSubmittedId(report.id);
    } catch {
      setSubmitError('Could not submit your report — please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submittedId) {
    const dept = category ? hazardCategoryMap[category].department : 'Fire Dept';
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center border-2 border-safe text-safe">
          <CheckCircle2 size={26} />
        </span>
        <h1 className="mt-6 font-display text-[34px] font-bold uppercase leading-none text-ink">Report submitted</h1>
        <p className="mx-auto mt-3 max-w-sm text-[14px] leading-relaxed text-ink/60">
          Report <span className="font-mono font-semibold text-ink">{submittedId}</span> has been routed to{' '}
          <span className="font-semibold text-ink">{dept}</span>. An officer will review it during their next shift.
        </p>
        <div className="mx-auto mt-6 flex max-w-xs items-center justify-center gap-2 border border-ink/15 bg-paper-2 px-4 py-2 font-mono text-[11.5px] uppercase tracking-wide text-ink/70">
          <Clock size={13} />
          Target resolution within 48 hours
        </div>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/heatmap" className="border border-ink px-4 py-2.5 font-display text-[14px] font-semibold uppercase tracking-wide text-ink hover:bg-paper-2">
            View Heatmap
          </Link>
          <button
            onClick={() => {
              setSubmittedId(null);
              setStep(0);
              setCategory(null);
              setAddress('');
              setDescription('');
              setPhotoDataUrl(undefined);
              setReporterName('');
              setReporterContact('');
            }}
            className="bg-ink px-4 py-2.5 font-display text-[14px] font-semibold uppercase tracking-wide text-paper hover:bg-ink-2"
          >
            Report Another Hazard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="border-b border-ink bg-paper px-6 py-4">
        <div className="mx-auto max-w-[1500px]">
          <Link to="/heatmap" className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-ink/50 hover:text-ember">
            <ArrowLeft size={12} /> Back to Heatmap
          </Link>
          <h1 className="mt-1.5 font-display text-[38px] font-bold uppercase leading-none text-ink sm:text-[42px]">
            Report a Fire Hazard
          </h1>
          <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-ink/55">
            Spotted something dangerous? Report it in under 60 seconds — goes directly to fire dept, BESCOM, or BBMP.
          </p>
        </div>
      </div>

      <section className="mx-auto max-w-[1500px] px-6 py-8">
        <div className="mb-8 flex items-center gap-1.5 sm:gap-3">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center gap-1.5 sm:flex-initial sm:gap-3">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center font-mono text-[11px] font-semibold ${
                    i <= step ? 'bg-ink text-paper' : 'bg-paper-2 text-ink/40'
                  }`}
                >
                  {i + 1}
                </span>
                <span className={`hidden font-mono text-[12.5px] font-medium uppercase tracking-wide sm:inline ${i <= step ? 'text-ink' : 'text-ink/40'}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className="h-px flex-1 bg-ink/15 sm:w-24 sm:flex-initial" />}
            </div>
          ))}
        </div>
        <div className="mb-6 -mt-4 font-mono text-[11px] uppercase tracking-wide text-ink/45 sm:hidden">{STEPS[step]}</div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            {step === 0 && (
              <div>
                <h2 className="mb-4 font-mono text-[13px] font-semibold uppercase tracking-wide text-ink/60">What type of hazard did you spot?</h2>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {hazardCategories.map((c) => {
                    const Icon = CATEGORY_ICONS[c.id];
                    const active = category === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setCategory(c.id)}
                        className={`flex items-center gap-3 border p-4 text-left transition-colors ${
                          active ? 'border-ink bg-paper-2' : 'border-ink/20 bg-white hover:border-ink/50'
                        }`}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-ember/30 bg-ember-soft text-ember">
                          <Icon size={18} />
                        </span>
                        <span>
                          <span className="block text-[13.5px] font-semibold text-ink">{c.label}</span>
                          <span className="block font-mono text-[10.5px] uppercase tracking-wide text-ink/45">→ {c.department}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <button
                  disabled={!category}
                  onClick={() => setStep(1)}
                  className="mt-6 flex items-center gap-1.5 bg-ink px-5 py-2.5 font-display text-[14px] font-semibold uppercase tracking-wide text-paper disabled:opacity-30"
                >
                  Continue <ArrowRight size={14} />
                </button>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="mb-1.5 block font-mono text-[11.5px] font-semibold uppercase tracking-wide text-ink/60">Photo</label>
                  {photoDataUrl ? (
                    <div className="relative inline-block">
                      <img src={photoDataUrl} alt="Hazard preview" className="h-40 w-56 border border-ink/20 object-cover" />
                      <button
                        onClick={() => setPhotoDataUrl(undefined)}
                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center bg-ink text-paper"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-40 w-56 flex-col items-center justify-center gap-2 border-2 border-dashed border-ink/25 text-ink/40 hover:border-ink/50"
                    >
                      <ImagePlus size={22} />
                      <span className="font-mono text-[11.5px] uppercase tracking-wide">Add a photo</span>
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="font-mono text-[11.5px] font-semibold uppercase tracking-wide text-ink/60">Locality</label>
                    <button
                      type="button"
                      onClick={handleUseLocation}
                      disabled={geo.status === 'locating'}
                      className="flex items-center gap-1 font-mono text-[11px] font-medium uppercase tracking-wide text-ember hover:text-ember-2 disabled:opacity-50"
                    >
                      {geo.status === 'locating' ? <LoaderCircle size={12} className="animate-spin" /> : <LocateFixed size={12} />}
                      Use my location
                    </button>
                  </div>
                  <select
                    value={localityId}
                    onChange={(e) => setLocalityId(e.target.value)}
                    className="w-full max-w-sm border border-ink/25 bg-white px-3.5 py-2.5 text-[13px] text-ink focus:border-ink focus:outline-none"
                  >
                    {localities.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                  {geo.status === 'found' && (
                    <p className="mt-1.5 font-mono text-[11px] text-safe">
                      Detected near {geo.localityName} (~{geo.distanceKm.toFixed(1)} km away)
                    </p>
                  )}
                  {geo.status === 'error' && (
                    <p className="mt-1.5 font-mono text-[11px] text-high-risk">{geo.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block font-mono text-[11.5px] font-semibold uppercase tracking-wide text-ink/60">Landmark / street (optional)</label>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 5th Cross, near SBI ATM"
                    className="w-full max-w-sm border border-ink/25 bg-white px-3.5 py-2.5 text-[13px] text-ink placeholder:text-ink/35 focus:border-ink focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block font-mono text-[11.5px] font-semibold uppercase tracking-wide text-ink/60">Describe the hazard</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="What did you see? How urgent does it look?"
                    className="w-full border border-ink/25 bg-white px-3.5 py-2.5 text-[13px] text-ink placeholder:text-ink/35 focus:border-ink focus:outline-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(0)} className="flex items-center gap-1.5 border border-ink px-5 py-2.5 font-display text-[14px] font-semibold uppercase tracking-wide text-ink hover:bg-paper-2">
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button
                    disabled={!canContinueFromDetails}
                    onClick={() => setStep(2)}
                    className="flex items-center gap-1.5 bg-ink px-5 py-2.5 font-display text-[14px] font-semibold uppercase tracking-wide text-paper disabled:opacity-30"
                  >
                    Continue <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="max-w-sm space-y-5">
                <div>
                  <label className="mb-1.5 block font-mono text-[11.5px] font-semibold uppercase tracking-wide text-ink/60">Your name</label>
                  <input
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="Full name"
                    className="w-full border border-ink/25 bg-white px-3.5 py-2.5 text-[13px] text-ink placeholder:text-ink/35 focus:border-ink focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-mono text-[11.5px] font-semibold uppercase tracking-wide text-ink/60">Phone or email (optional)</label>
                  <input
                    value={reporterContact}
                    onChange={(e) => setReporterContact(e.target.value)}
                    placeholder="So officers can follow up"
                    className="w-full border border-ink/25 bg-white px-3.5 py-2.5 text-[13px] text-ink placeholder:text-ink/35 focus:border-ink focus:outline-none"
                  />
                </div>
                <p className="text-[11.5px] leading-relaxed text-ink/50">
                  Your report will be shared with the routing department for coordination. Contact details are kept
                  confidential and used only for follow-up.
                </p>
                {submitError && <p className="font-mono text-[11px] font-medium text-high-risk">{submitError}</p>}
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex items-center gap-1.5 border border-ink px-5 py-2.5 font-display text-[14px] font-semibold uppercase tracking-wide text-ink hover:bg-paper-2">
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button
                    disabled={!canSubmit || submitting}
                    onClick={handleSubmit}
                    className="flex items-center gap-1.5 bg-ember px-5 py-2.5 font-display text-[14px] font-semibold uppercase tracking-wide text-paper disabled:opacity-30"
                  >
                    {submitting && <LoaderCircle size={14} className="animate-spin" />}
                    {submitting ? 'Submitting…' : 'Submit Report'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="border border-ink">
              <div className="border-b border-ink bg-paper-2 px-4 py-2.5 font-mono text-[10.5px] font-semibold uppercase tracking-wide text-ink/60">
                Recent Reports Near You
              </div>
              <div className="divide-y divide-ink/10">
                {recent.map((r) => {
                  const locality = localities.find((l) => l.id === r.localityId);
                  const Icon = CATEGORY_ICONS[r.category];
                  return (
                    <div key={r.id} className="flex items-start justify-between gap-2 px-4 py-3">
                      <div className="flex items-start gap-2.5">
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border border-ink/15 bg-paper-2 text-ink/60">
                          <Icon size={13} />
                        </span>
                        <div>
                          <div className="text-[12.5px] font-medium text-ink">{hazardCategoryMap[r.category].label}</div>
                          <div className="font-mono text-[10.5px] text-ink/45">
                            {locality?.name} · {timeAgo(r.createdAt)} → {hazardCategoryMap[r.category].department}
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border border-high-risk/30 bg-high-risk-soft p-4">
              <span className="flex h-9 w-9 items-center justify-center border border-high-risk/30 bg-white text-high-risk">
                <Phone size={16} />
              </span>
              <div className="mt-3 font-display text-[16px] font-bold uppercase text-ink">Emergency?</div>
              <p className="mt-1 text-[12px] text-ink/60">For immediate fire emergencies, call directly.</p>
              <a
                href="tel:101"
                className="mt-3 flex items-center justify-center gap-1.5 bg-ink py-2.5 font-display text-[14px] font-semibold uppercase tracking-wide text-paper hover:bg-ink-2"
              >
                <Phone size={14} /> Call 101 — Fire Emergency
              </a>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
