'use client';

import { useT } from '@/lib/i18n/useT';

const SocialProofTicker = () => {
  const t = useT();
  const items = t.ticker.items;

  return (
    <div className="relative border-y border-white/[0.06] bg-white/[0.02] overflow-hidden py-3.5 ticker-mask z-10">
      <div className="flex ticker-scroll">
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="whitespace-nowrap text-sm font-medium text-white/55 px-8 flex-shrink-0"
          >
            <span className="text-violet-400 mr-1">{item.slice(0, 1)}</span>
            {item.slice(1)}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SocialProofTicker;
