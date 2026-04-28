import { StandardPageShell } from "@/src/components/ui/standard-page-shell";

const FAQ_ITEMS = [
  {
    q: "How does sizing run?",
    a: "Our silhouettes run true to size. For a roomier layering fit, choose one size up.",
  },
  {
    q: "Can I return a jacket?",
    a: "Yes, unworn items can be returned within 30 days in original condition.",
  },
  {
    q: "How fast is shipping?",
    a: "Standard shipping takes 2-5 business days depending on destination.",
  },
];

export default function FaqPage() {
  return (
    <StandardPageShell
      title="FAQ"
      description="Answers to the most common questions about fit, delivery, and returns."
    >
      <div className="space-y-4">
        {FAQ_ITEMS.map((item) => (
          <article key={item.q} className="rounded-2xl border border-black/10 bg-white p-5">
            <h2 className="text-lg font-semibold">{item.q}</h2>
            <p className="mt-2 text-black/70">{item.a}</p>
          </article>
        ))}
      </div>
    </StandardPageShell>
  );
}
