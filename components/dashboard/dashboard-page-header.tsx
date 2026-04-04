import type { ReactNode } from "react";

export function DashboardPageHeader({
  eyebrow,
  title,
  description,
  meta,
  actions,
}: Readonly<{
  eyebrow?: string;
  title: string;
  description: string;
  meta?: string;
  actions?: ReactNode;
}>) {
  return (
    <header className="mb-6 flex flex-col gap-4 rounded-[28px] border border-white/70 bg-white/80 px-5 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur md:flex-row md:items-end md:justify-between md:px-6">
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#2E5FA3]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 md:text-[15px]">
          {description}
        </p>
      </div>

      {meta || actions ? (
        <div className="flex flex-col items-start gap-3 md:items-end">
          {meta ? (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              {meta}
            </span>
          ) : null}
          {actions}
        </div>
      ) : null}
    </header>
  );
}
