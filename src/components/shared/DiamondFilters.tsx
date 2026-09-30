import React from 'react';

export const DIAMOND_COLORS = ['D', 'E', 'F', 'G'];
export const DIAMOND_CLARITIES = ['SI1', 'SI2', 'VS2'];

export function matchesDiamondGrades(value: unknown, selected: string[]) {
  if (!selected.length) return true;
  const tokens = String(value ?? '').toUpperCase().replace(/\b(SI|VS)\s+([12])\b/g, '$1$2').match(/[A-Z]+[0-9]*/g) ?? [];
  return selected.some(grade => tokens.includes(grade));
}

export function DiamondGradePicker({ label, options, value, onChange }: { label: string; options: string[]; value: string[]; onChange: (value: string[]) => void }) {
  return <fieldset className="border border-black/10 rounded p-2 min-w-0"><legend className="text-[10px] px-1">{label}</legend><div className="flex flex-wrap gap-1">{options.map(grade => <label key={grade} className={`flex items-center gap-1 px-2 min-h-9 rounded border text-xs cursor-pointer ${value.includes(grade) ? 'bg-[#0f203a] text-white' : 'bg-white'}`}><input type="checkbox" checked={value.includes(grade)} onChange={() => onChange(value.includes(grade) ? value.filter(item => item !== grade) : [...value, grade])}/>{grade}</label>)}</div></fieldset>;
}
