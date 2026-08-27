import { Regulator, ImpactTag } from '../types';

export interface BadgeStyle {
  bg: string;
  text: string;
  border: string;
  dot: string;
}

export function getRegulatorStyle(regulator: Regulator): BadgeStyle {
  switch (regulator) {
    case 'SEBI':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-600',
      };
    case 'RBI':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-600',
      };
    case 'MCA':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200',
        dot: 'bg-amber-600',
      };
    case 'CBDT':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-600',
      };
    case 'CBIC':
      return {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        dot: 'bg-purple-600',
      };
    default:
      return {
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-200',
        dot: 'bg-slate-500',
      };
  }
}

export function getImpactTagStyle(tag: string): BadgeStyle {
  const t = tag.toLowerCase();
  if (t.includes('ra') || t.includes('adviser') || t.includes('research')) {
    return {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      dot: 'bg-indigo-600',
    };
  }
  if (t.includes('tax') || t.includes('tds') || t.includes('gst')) {
    return {
      bg: 'bg-teal-50',
      text: 'text-teal-700',
      border: 'border-teal-200',
      dot: 'bg-teal-600',
    };
  }
  if (t.includes('aml') || t.includes('kyc')) {
    return {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      dot: 'bg-red-600',
    };
  }
  if (t.includes('audit')) {
    return {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      dot: 'bg-amber-600',
    };
  }
  if (t.includes('disclosure') || t.includes('norms')) {
    return {
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      border: 'border-sky-200',
      dot: 'bg-sky-600',
    };
  }
  if (t.includes('fintech') || t.includes('payment')) {
    return {
      bg: 'bg-cyan-50',
      text: 'text-cyan-700',
      border: 'border-cyan-200',
      dot: 'bg-cyan-600',
    };
  }
  if (t.includes('product') || t.includes('derivative') || t.includes('market')) {
    return {
      bg: 'bg-violet-50',
      text: 'text-violet-700',
      border: 'border-violet-200',
      dot: 'bg-violet-600',
    };
  }
  if (t.includes('governance') || t.includes('corporate') || t.includes('beneficial')) {
    return {
      bg: 'bg-orange-50',
      text: 'text-orange-800',
      border: 'border-orange-200',
      dot: 'bg-orange-600',
    };
  }
  return {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-500',
  };
}

export function getUrgencyBadge(urgency: 'HIGH' | 'MEDIUM' | 'LOW') {
  switch (urgency) {
    case 'HIGH':
      return {
        bg: 'bg-red-50 text-red-700 border border-red-200',
        label: 'HIGH IMPACT',
      };
    case 'MEDIUM':
      return {
        bg: 'bg-amber-50 text-amber-800 border border-amber-200',
        label: 'MEDIUM',
      };
    case 'LOW':
      return {
        bg: 'bg-slate-100 text-slate-600 border border-slate-200',
        label: 'ROUTINE',
      };
  }
}
