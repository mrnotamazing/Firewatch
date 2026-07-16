import { Phone } from 'lucide-react';

export default function TopBar() {
  return (
    <div className="border-b-2 border-ember bg-paper font-mono text-[10.5px] tracking-wide text-ink/60">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-1.5 sm:px-6">
        <span className="hidden uppercase sm:inline">Bengaluru Fire &amp; Emergency Services · Karnataka</span>
        <span className="uppercase sm:hidden">Bengaluru Fire &amp; Emergency</span>
        <a href="tel:101" className="flex shrink-0 items-center gap-1.5 font-semibold text-ember">
          <Phone size={11} strokeWidth={2.5} />
          Emergency: 101
        </a>
      </div>
    </div>
  );
}
