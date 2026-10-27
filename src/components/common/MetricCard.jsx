import React from 'react';

export function MetricCard({
  title,
  value,
  unit = '',
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  trendDirection = 'up', // 'up' | 'down' | 'neutral'
  variant = 'default', // 'default' | 'crimson' | 'bordeaux' | 'amber' | 'emerald'
  className = '',
}) {
  const variantStyles = {
    default: {
      bg: 'bg-white',
      border: 'border-[#EDE3DF]',
      iconBg: 'bg-[#FCEEED] text-[#5C2434]',
      valueColor: 'text-[#2E1822]',
    },
    crimson: {
      bg: 'bg-[#FDF8F7]',
      border: 'border-[#F0D0CB]',
      iconBg: 'bg-[#FCEEED] text-[#5C2434]',
      valueColor: 'text-[#5C2434]',
    },
    bordeaux: {
      bg: 'bg-[#FCEEED]/60',
      border: 'border-[#F0D0CB]',
      iconBg: 'bg-[#5C2434] text-white',
      valueColor: 'text-[#2E1822]',
    },
    emerald: {
      bg: 'bg-[#FDF8F7]',
      border: 'border-[#EDE3DF]',
      iconBg: 'bg-[#FCEEED] text-[#5C2434]',
      valueColor: 'text-[#5C2434]',
    },
    amber: {
      bg: 'bg-[#FFF9F5]',
      border: 'border-[#F4DEC6]',
      iconBg: 'bg-[#FEF0E4] text-[#B45309]',
      valueColor: 'text-[#78350F]',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.default;

  return (
    <div
      className={`rounded-xl border shadow-sm p-5 transition-all duration-200 hover:shadow-md ${currentVariant.bg} ${currentVariant.border} ${className}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 font-mono">
          {title}
        </p>
        {Icon && (
          <div className={`p-2 rounded-lg ${currentVariant.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className={`text-2xl sm:text-3xl font-bold tracking-tight font-mono ${currentVariant.valueColor}`}>
          {value}
        </span>
        {unit && <span className="text-sm font-medium text-stone-500">{unit}</span>}
      </div>

      {(trend || subtitle) && (
        <div className="mt-2.5 flex items-center justify-between text-xs">
          {trend && (
            <span
              className={`inline-flex items-center gap-1 font-mono font-medium px-1.5 py-0.5 rounded ${
                trendDirection === 'up'
                  ? 'text-[#5C2434] bg-[#FCEEED] border border-[#F0D0CB]'
                  : trendDirection === 'down'
                  ? 'text-amber-800 bg-amber-100/70'
                  : 'text-stone-600 bg-stone-100'
              }`}
            >
              {trend}
              {trendLabel && <span className="text-stone-500 font-normal">{trendLabel}</span>}
            </span>
          )}
          {subtitle && (
            <span className="text-stone-500 truncate max-w-full">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
