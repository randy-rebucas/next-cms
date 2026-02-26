/**
 * Default theme — template-parts/section-header.tsx
 * WordPress: get_template_part('template-parts/section-header') equivalent.
 *
 * Consistent section heading used across home page sections.
 */

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
  /** Use dark text variant (for light backgrounds). Default: true */
  dark?: boolean;
}

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  className = "",
  dark = true,
}: SectionHeaderProps) {
  return (
    <div className={`text-center mb-16 ${className}`}>
      {eyebrow && (
        <p className="text-amber-600 font-semibold text-sm uppercase tracking-widest mb-2">
          {eyebrow}
        </p>
      )}
      <h2
        className={`text-3xl sm:text-4xl font-bold gold-underline ${
          dark ? "text-slate-900" : "text-white"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-6 max-w-xl mx-auto ${
            dark ? "text-slate-500" : "text-slate-400"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
