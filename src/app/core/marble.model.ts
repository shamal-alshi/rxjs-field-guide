export type MarbleKind = 'next' | 'error' | 'complete';

export interface MarbleEvent {
  id: number;
  kind: MarbleKind;
  label: string;
}