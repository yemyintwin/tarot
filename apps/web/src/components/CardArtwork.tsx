import type { Card } from '@tarot/shared';

export function CardArtwork({ card, className = '' }: { card: Card; className?: string }) {
  return (
    <img
      className={`card-artwork ${className}`}
      src={card.image}
      alt={card.name}
      loading="lazy"
      decoding="async"
      width="400"
      height="640"
    />
  );
}
