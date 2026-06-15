export type ArgumentSide = 'pro' | 'contra' | 'staging';

export type ArgumentWeight = 1 | 2 | 3;

export type ArgumentColorId =
  | 'default'
  | 'accent'
  | 'accent2'
  | 'danger'
  | 'mint'
  | 'violet'
  | 'amber';

export interface ArgumentItem {
  id: string;
  text: string;
  side: ArgumentSide;
  weight: ArgumentWeight | null;
  colorId: ArgumentColorId;
}

export interface LegendEntry {
  colorId: ArgumentColorId;
  label: string;
}

export interface ProjectState {
  version: 1;
  proTitle: string;
  contraTitle: string;
  arguments: ArgumentItem[];
  legend: LegendEntry[];
}

export interface BalanceResult {
  proScore: number;
  contraScore: number;
  netScore: number;
  tiltDegrees: number;
}

export type DropZoneId =
  | 'staging'
  | `pro-${ArgumentWeight}`
  | `contra-${ArgumentWeight}`
  | 'trash';

export const WEIGHTS: readonly ArgumentWeight[] = [1, 2, 3];

export const ARGUMENT_COLORS: readonly ArgumentColorId[] = [
  'default',
  'accent',
  'accent2',
  'danger',
  'mint',
  'violet',
  'amber',
];

export function createEmptyProject(): ProjectState {
  return {
    version: 1,
    proTitle: 'Pro',
    contraTitle: 'Contra',
    arguments: [],
    legend: [],
  };
}

export function createArgument(text = ''): ArgumentItem {
  return {
    id: crypto.randomUUID(),
    text,
    side: 'staging',
    weight: null,
    colorId: 'default',
  };
}

export function dropZoneId(side: ArgumentSide, weight: ArgumentWeight | null): DropZoneId {
  if (side === 'staging' || weight === null) {
    return 'staging';
  }
  return `${side}-${weight}`;
}

export function parseDropZoneId(zoneId: DropZoneId): {
  side: ArgumentSide;
  weight: ArgumentWeight | null;
} {
  if (zoneId === 'staging' || zoneId === 'trash') {
    return { side: 'staging', weight: null };
  }
  const [side, weightRaw] = zoneId.split('-') as [ArgumentSide, string];
  return {
    side,
    weight: Number(weightRaw) as ArgumentWeight,
  };
}
