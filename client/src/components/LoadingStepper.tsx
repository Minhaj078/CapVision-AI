import { Loader2, CheckCircle2, Circle } from 'lucide-react';

export type StepStatus = 'pending' | 'running' | 'completed';

export interface StepInfo {
  id: string;
  title: string;
  desc: string;
  status: StepStatus;
}

interface LoadingStepperProps {
  steps: StepInfo[];
  visible: boolean;
}

export function LoadingStepper({ steps, visible }: LoadingStepperProps) {
  if (!visible) return null;

  return (
    <div className="w-full max-w-lg mx-auto mt-8 rounded-xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md shadow-2xl shadow-black/45 animate-fade-in">
      <h3 className="font-display text-base font-bold text-indigo-400 mb-5">
        Agent Diagnostics Pipeline
      </h3>
      
      <div className="flex flex-col gap-4">
        {steps.map((step) => {
          let icon = <Circle className="text-slate-600" size={18} />;
          let rowClass = "flex items-start gap-4 rounded-lg p-3 border border-transparent transition-all";
          
          if (step.status === 'running') {
            icon = <Loader2 className="animate-spin text-indigo-400" size={18} />;
            rowClass += " bg-indigo-500/5 border-indigo-500/10";
          } else if (step.status === 'completed') {
            icon = <CheckCircle2 className="text-emerald-400" size={18} />;
            rowClass += " bg-emerald-500/5";
          }

          return (
            <div key={step.id} className={rowClass}>
              <div className="mt-0.5 flex-shrink-0">
                {icon}
              </div>
              <div className="flex-1">
                <h4 className={`text-sm font-semibold transition-colors ${
                  step.status === 'completed' ? 'text-slate-200' : step.status === 'running' ? 'text-white' : 'text-slate-500'
                }`}>
                  {step.title}
                </h4>
                <p className={`text-xs mt-1 transition-colors ${
                  step.status === 'completed' ? 'text-slate-400' : step.status === 'running' ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LoadingStepper;
