import type { ArgumentItem, BalanceResult } from './model';

const MAX_TILT_DEGREES = 18;

export function argumentContribution(item: ArgumentItem): number {
  if (item.side === 'staging' || item.weight === null) {
    return 0;
  }
  const sign = item.side === 'pro' ? 1 : -1;
  return sign * item.weight;
}

export function calculateBalance(argumentsList: ArgumentItem[]): BalanceResult {
  let proScore = 0;
  let contraScore = 0;

  for (const item of argumentsList) {
    if (item.side === 'pro' && item.weight !== null) {
      proScore += item.weight;
    }
    if (item.side === 'contra' && item.weight !== null) {
      contraScore += item.weight;
    }
  }

  const netScore = proScore - contraScore;
  const maxPossible = 9;
  const tiltDegrees = (netScore / maxPossible) * MAX_TILT_DEGREES;

  return {
    proScore,
    contraScore,
    netScore,
    tiltDegrees: clamp(tiltDegrees, -MAX_TILT_DEGREES, MAX_TILT_DEGREES),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
