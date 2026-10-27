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
      border: 'border-[#EAE2DE]',
      iconBg: 'bg-[#F3E6E4] text-[#783751]',
      valueColor: 'text-[#4A252B]',
    },
    crimson: {
      bg: 'bg-[#FBF7F5]',
      border: 'border-[#EAE2DE]',
      iconBg: 'bg-[#F3E6E4] text-[#783751]',
      valueColor: 'text-[#783751]',
    },
    bordeaux: {
      bg: 'bg-[#F3E6E4]/70',
      border: 'border-[#C08274]/50',
      iconBg: 'bg-[#783751] text-white',
      valueColor: 'text-[#4A252B]',
    },
    emerald: {
      bg: 'bg-[#FBF7F5]',
      border: 'border-[#EAE2DE]',
      iconBg: 'bg-[#F3E6E4] text-[#783751]',
      valueColor: 'text-[#783751]',
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
                  ? 'text-[#783751] bg-[#F3E6E4] border border-[#C08274]/40'
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
