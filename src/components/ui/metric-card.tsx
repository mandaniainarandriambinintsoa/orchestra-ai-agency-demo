import type { ComponentType } from "react";
import type { IconProps } from "@tabler/icons-react";

export function MetricCard({
  label,
  value,
  change,
  icon: Icon,
}: {
  label: string;
  value: string;
  change: string;
  icon: ComponentType<IconProps>;
}) {
  return (
    <article className="surface flex min-h-38 flex-col justify-between p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-muted">{label}</p>
        <span className="grid size-9 place-items-center rounded-full bg-sage-50 text-sage-700">
          <Icon aria-hidden="true" size={18} stroke={1.65} />
        </span>
      </div>
      <div className="mt-6 flex items-end justify-between gap-3">
        <p className="text-4xl font-medium tracking-[-0.04em] text-ink tabular-nums">
          {value}
        </p>
        <p className="text-[11px] text-sage-700">{change}</p>
      </div>
    </article>
  );
}
