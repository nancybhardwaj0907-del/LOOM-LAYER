import React from 'react';

export function Card({
  children,
  className = '',
  hoverEffect = false,
  padding = 'p-6',
  ...props
}) {
  return (
    <div
      className={`bg-white rounded-xl border border-[#EDE3DF] shadow-sm ${
        hoverEffect ? 'transition-all duration-200 hover:shadow-md hover:border-[#F0D0CB]' : ''
      } ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className = '',
}) {
  return (
    <div className={`flex items-start justify-between pb-4 border-b border-[#EDE3DF] ${className}`}>
      <div>
        <h3 className="font-semibold text-[#2E1822] text-base sm:text-lg">{title}</h3>
        {subtitle && <p className="text-xs sm:text-sm text-[#7A626C] mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="ml-4 shrink-0">{action}</div>}
    </div>
  );
}
