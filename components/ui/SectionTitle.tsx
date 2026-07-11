import Link from "next/link";

type SectionTitleProps = {
  title: string;
  meta?: string;
  index?: string;
  action?: {
    label: string;
    href: string;
  };
  className?: string;
};

export function SectionTitle({
  title,
  meta,
  index,
  action,
  className = "",
}: SectionTitleProps) {
  return (
    <div
      className={`mb-[34px] flex items-baseline justify-between gap-4 ${className}`}
    >
      <div className="flex items-baseline gap-4">
        {index ? (
          <span className="font-mono text-[11px] tracking-[0.1em] text-ce-accent">
            {index}
          </span>
        ) : null}
        <h2 className="font-serif text-[28px] font-normal italic leading-none text-ce-text">
          {title}
        </h2>
        {meta ? (
          <span className="font-mono text-[11px] tracking-[0.1em] text-ce-muted">
            {meta}
          </span>
        ) : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="font-mono text-[11px] tracking-[0.14em] text-[#8a8a88] uppercase transition-colors hover:text-ce-accent"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
