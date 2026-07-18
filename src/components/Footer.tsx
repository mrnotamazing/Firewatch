import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t-2 border-ember bg-paper-2 text-ink/60">
      <div className="border-b border-ember/15 bg-ember/5 px-6 py-2.5 text-center font-mono text-[10.5px] leading-relaxed text-ember-2/80">
        FireWatch is a community awareness &amp; participation tool, not a legal or enforcement authority — reports and
        scores are community-submitted and meant to inform residents and support local transparency, not to replace
        official inspections.
      </div>
      <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-6 py-6 font-mono text-[11px] md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 uppercase tracking-wide">
          <span className="font-semibold text-ink">FireWatch Bengaluru</span>
          <span>· Community fire-safety transparency project</span>
        </div>
        <nav className="flex flex-wrap items-center gap-4 uppercase tracking-wide">
          <Link to="/" className="hover:text-ink">Home</Link>
          <Link to="/heatmap" className="hover:text-ink">Heatmap</Link>
          <Link to="/report" className="hover:text-ink">Report Hazard</Link>
          <Link to="/accountability" className="hover:text-ink">Transparency</Link>
          <Link to="/gallery" className="hover:text-ink">Gallery</Link>
          <Link to="/quiz" className="hover:text-ink">While You're At It</Link>
          <Link to="/dashboard" className="flex items-center gap-1 hover:text-ink">
            <Lock size={10} /> Officer Login
          </Link>
          <a
            href="https://data.opencity.in/dataset/bengaluru-and-karnataka-fire-stations"
            target="_blank"
            rel="noreferrer"
            className="hover:text-ink"
          >
            OpenCity Data
          </a>
        </nav>
        <a href="tel:101" className="font-semibold text-ember">Emergency: 101</a>
      </div>
    </footer>
  );
}
