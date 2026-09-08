const PARTNERS = [
  { name: "Iron Temple Gym", emoji: "🏋️" },
  { name: "PowerFit Studio", emoji: "🔥" },
  { name: "Vita Nutrición", emoji: "🥦" },
  { name: "CrossBox Reforma", emoji: "🏆" },
  { name: "Muscle Lab", emoji: "💪" },
  { name: "Urban Athletics Club", emoji: "🏃" },
  { name: "Recharge Sports Bar", emoji: "🥤" },
  { name: "Elite Performance Center", emoji: "⚡" },
];

// Tira de logos con auto-scroll infinito (se duplica el contenido para que
// el loop sea perfecto) — se pausa al pasar el mouse.
export function PartnerMarquee() {
  return (
    <div className="group relative overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-background to-transparent" />

      <div className="flex w-max animate-marquee gap-4 group-hover:[animation-play-state:paused]">
        {[...PARTNERS, ...PARTNERS].map((partner, i) => (
          <div
            key={`${partner.name}-${i}`}
            className="flex shrink-0 items-center gap-2 rounded-full border bg-card px-5 py-3 shadow-sm"
          >
            <span className="text-xl" aria-hidden>
              {partner.emoji}
            </span>
            <span className="font-semibold text-muted-foreground">{partner.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
