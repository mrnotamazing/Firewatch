import { useState } from 'react';
import { Info, X } from 'lucide-react';

/** Site-wide "awareness tool, not a legal authority" notice. Dismissible, but returns on the next page load so the disclaimer is always seen. */
export default function PurposeBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative border-b border-ember/25 bg-ember/10 px-6 py-2.5">
      <div className="mx-auto flex max-w-[1100px] items-start justify-center gap-2 pr-8 text-center">
        <Info size={14} className="mt-0.5 shrink-0 text-ember-2" />
        <p className="font-mono text-[11.5px] font-medium leading-relaxed text-ember-2">
          FireWatch is a community awareness &amp; participation tool, not a legal or enforcement authority — built
          to help residents flag hazards and hold departments publicly accountable, in the interest of community
          betterment.
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        title="Dismiss"
        aria-label="Dismiss notice"
        className="absolute right-4 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-ember/60 hover:text-ember-2"
      >
        <X size={15} />
      </button>
    </div>
  );
}
