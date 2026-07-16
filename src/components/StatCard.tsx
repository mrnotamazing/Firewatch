export default function StatCard({
  value,
  label,
  tone = 'default',
}: {
  value: string;
  label: string;
  tone?: 'default' | 'ember';
}) {
  return (
    <div className="min-w-[92px] bg-paper px-3.5 py-2 text-right">
      <div className={`font-mono text-[19px] font-semibold leading-none ${tone === 'ember' ? 'text-ember' : 'text-ink'}`}>
        {value}
      </div>
      <div className="mt-1 font-mono text-[9.5px] uppercase leading-none tracking-wide text-ink/45">{label}</div>
    </div>
  );
}
