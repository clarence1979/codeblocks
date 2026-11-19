import { useSyncExternalStore } from 'react';
import { aiAccess } from '../services/aiAccess';

export function useAiAccess() {
  return useSyncExternalStore(aiAccess.subscribe, aiAccess.getState);
}

/** Green when AI is ready, amber while checking, grey when off. Never shows a key. */
export function AiStatusDot({ showLabel = true, className = '' }: { showLabel?: boolean; className?: string }) {
  const ai = useAiAccess();
  const ready = ai.mode === 'school' || ai.mode === 'own';
  const color = ready ? 'bg-green-500' : ai.mode === 'checking' ? 'bg-amber-400' : 'bg-gray-400';
  const label = ready ? 'AI ready' : ai.mode === 'checking' ? 'Checking AI…' : 'AI off';
  const text = aiAccess.statusText();
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`} title={text} role="status" aria-label={text}>
      <span className={`w-2.5 h-2.5 rounded-full ${color} ring-2 ring-white/70 ${ai.mode === 'checking' ? 'animate-pulse' : ''}`} />
      {showLabel && <span className="text-xs">{label}</span>}
    </span>
  );
}
