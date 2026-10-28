import React from 'react';
import { Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  { number: 1, name: 'Roll Specs', path: 'new', subpath: '' },
  { number: 2, name: 'Garment Pieces', path: 'patterns', subpath: '/patterns' },
  { number: 3, name: 'Marker Nesting', path: 'optimize', subpath: '/optimize' },
  { number: 4, name: 'Cut Plan', path: 'result', subpath: '/result' },
];

export function StepIndicator({ currentStep = 1, projectId = null, onStepClick }) {
  const navigate = useNavigate();

  const handleStepNavigation = (step) => {
    if (onStepClick) {
      onStepClick(step.number);
      return;
    }

    if (!projectId) return;

    if (step.number === 1) {
      navigate(`/project/new`);
    } else if (step.number === 2) {
      navigate(`/project/${projectId}/patterns`);
    } else if (step.number === 3) {
      navigate(`/project/${projectId}/optimize`);
    } else if (step.number === 4) {
      navigate(`/project/${projectId}/result`);
    }
  };

  return (
    <nav aria-label="Progress" className="w-full max-w-3xl mx-auto my-6 px-4">
      <ol className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const isClickable = isCompleted || isCurrent || (projectId && step.number <= currentStep + 1);

          return (
            <li key={step.name} className="relative flex-1 flex items-center">
              <div
                onClick={() => isClickable && handleStepNavigation(step)}
                className={`group flex items-center gap-2.5 sm:gap-3 select-none ${
                  isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all duration-200 ${
                    isCompleted
                      ? 'bg-[#8E2B45] text-white ring-4 ring-[#8E2B45]/20'
                      : isCurrent
                      ? 'bg-[#8E2B45] text-white ring-4 ring-[#8E2B45]/20'
                      : 'bg-[#1E1B27] text-[#9E97A9] border border-[#272332] group-hover:border-[#8E2B45]'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : step.number}
                </div>
                <div className="hidden sm:block text-left">
                  <p
                    className={`text-xs font-mono font-medium ${
                      isCurrent ? 'text-[#E2A97E] font-bold' : isCompleted ? 'text-[#F5F3F8]' : 'text-[#9E97A9]'
                    }`}
                  >
                    Step 0{step.number}
                  </p>
                  <p
                    className={`text-xs font-semibold ${
                      isCurrent ? 'text-[#F5F3F8]' : isCompleted ? 'text-[#9E97A9]' : 'text-[#9E97A9]/60'
                    }`}
                  >
                    {step.name}
                  </p>
                </div>
              </div>

              {index < STEPS.length - 1 && (
                <div className="flex-1 mx-2 sm:mx-4 h-0.5 bg-[#272332]">
                  <div
                    className={`h-full transition-all duration-300 ${
                      step.number < currentStep ? 'bg-[#8E2B45]' : 'bg-transparent'
                    }`}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function StatusBadge({ status = 'Draft', className = '' }) {
  const styles = {
    Completed: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40',
    'In-Progress': 'bg-[#1E1B27] text-[#E2A97E] border-[#272332] animate-pulse',
    Optimizing: 'bg-amber-950/40 text-amber-400 border-amber-800/40',
    Draft: 'bg-[#1E1B27] text-[#9E97A9] border-[#272332]',
    Pending: 'bg-amber-950/40 text-amber-300 border-amber-800/40',
  };

  const currentStyle = styles[status] || styles.Draft;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-medium border ${currentStyle} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          status === 'Completed'
            ? 'bg-emerald-400'
            : status === 'Optimizing' || status === 'In-Progress'
            ? 'bg-[#E2A97E]'
            : status === 'Pending'
            ? 'bg-amber-400'
            : 'bg-stone-500'
        }`}
      />
      {status}
    </span>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div className={`text-center py-12 px-4 rounded-xl border border-dashed border-[#272332] bg-[#1E1B27]/40 ${className}`}>
      {Icon && (
        <div className="mx-auto w-12 h-12 rounded-lg bg-[#16141D] border border-[#272332] flex items-center justify-center text-[#E2A97E] mb-4">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-[#F5F3F8]">{title}</h3>
      {description && <p className="mt-1 text-xs text-[#9E97A9] max-w-sm mx-auto">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className={`relative w-full ${maxWidth} bg-[#16141D] rounded-2xl border border-[#272332] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95`}>
        <div className="flex items-start justify-between p-5 border-b border-[#272332] bg-[#1E1B27]/90">
          <div>
            <h3 className="text-lg font-bold text-[#F5F3F8] font-serif">{title}</h3>
            {subtitle && <p className="text-xs text-[#9E97A9] mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#9E97A9] hover:text-[#F5F3F8] hover:bg-[#272332] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 sm:p-6 bg-[#16141D] text-[#F5F3F8]">
          {children}
        </div>
      </div>
    </div>
  );
}
