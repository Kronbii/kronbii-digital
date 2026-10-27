"use client";

/**
 * FocusCards — Aceternity UI `focus-cards`, installed via the shadcn CLI.
 *
 * Edits against the original:
 *   - The <img> was `absolute inset-0 object-cover` with no width or height,
 *     so it never filled its card and left the card background showing through.
 *   - Palette moved to repo tokens. The original leans on Tailwind's `dark:`
 *     variant; this site themes with CSS variables per section, so `dark:`
 *     never matches and the light values were rendering on a dark ground.
 *   - `card: any` replaced with the Card type.
 */

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export type FocusCard = {
  title: string;
  src: string;
};

export const Card = React.memo(
  ({
    card,
    index,
    hovered,
    setHovered,
  }: {
    card: FocusCard;
    index: number;
    hovered: number | null;
    setHovered: React.Dispatch<React.SetStateAction<number | null>>;
  }) => (
    <div
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "rounded-[2px] relative bg-surface border border-border overflow-hidden h-60 md:h-96 w-full transition-all duration-300 ease-out",
        hovered !== null && hovered !== index && "blur-sm scale-[0.98]"
      )}
    >
      <img
        src={card.src}
        alt={card.title}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent flex items-end py-8 px-4 transition-opacity duration-300",
          hovered === index ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="text-2xl md:text-3xl tracking-tight text-foreground">
          {card.title}
        </div>
      </div>
    </div>
  )
);

Card.displayName = "Card";

export function FocusCards({ cards }: { cards: FocusCard[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto md:px-8 w-full">
      {cards.map((card, index) => (
        <Card
          key={card.title}
          card={card}
          index={index}
          hovered={hovered}
          setHovered={setHovered}
        />
      ))}
    </div>
  );
}
