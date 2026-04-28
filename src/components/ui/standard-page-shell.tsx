import type { ReactNode } from "react";
import { SiteHeader } from "@/src/components/ui/site-header";

type StandardPageShellProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export function StandardPageShell({
  title,
  description,
  children,
}: StandardPageShellProps) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-100 via-white to-zinc-200 text-black">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-12">
        <SiteHeader darkText className="mb-12" />
        <section className="rounded-3xl border border-black/10 bg-white/65 p-8 shadow-xl backdrop-blur-sm sm:p-10">
          <p className="text-xs tracking-[0.2em] uppercase text-black/55">Jacket Masters</p>
          <h1 className="mt-4 text-4xl leading-tight font-semibold sm:text-5xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-black/70">{description}</p>
          {children ? <div className="mt-8">{children}</div> : null}
        </section>
      </div>
    </main>
  );
}
