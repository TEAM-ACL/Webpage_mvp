import type { ElementType } from "react";
import SummaryCard from "./SummaryCard";

export type SummaryItem = { title: string; value: string; note: string; icon: ElementType };

export default function SummaryGrid({ items }: { items: SummaryItem[] }) {
  return (
    <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <SummaryCard key={item.title} {...item} />
      ))}
    </section>
  );
}
