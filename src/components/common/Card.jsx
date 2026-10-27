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
      className={`bg-white rounded-xl border border-[#EAE2DE] shadow-sm ${
        hoverEffect ? 'transition-all duration-200 hover:shadow-md hover:border-[#C08274]' : ''
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
    <div className={`flex items-start justify-between pb-4 border-b border-[#EAE2DE] ${className}`}>
      <div>
        <h3 className="font-semibold text-[#4A252B] text-base sm:text-lg">{title}</h3>
        {subtitle && <p className="text-xs sm:text-sm text-[#81777B] mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="ml-4 shrink-0">{action}</div>}
    </div>
  );
}
