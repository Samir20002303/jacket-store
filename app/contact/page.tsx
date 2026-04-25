import { StandardPageShell } from "@/src/components/standard-page-shell";

export default function ContactPage() {
  return (
    <StandardPageShell
      title="Contact"
      description="Need sizing guidance, styling support, or order assistance? Our concierge team is available daily to help you choose the perfect jacket for your climate and look."
    >
      <div className="space-y-3 text-black/75">
        <p>Email: support@jacketmasters.com</p>
        <p>Phone: +33 1 80 00 00 00</p>
        <p>Hours: Mon - Sat, 9:00 to 19:00</p>
      </div>
    </StandardPageShell>
  );
}
