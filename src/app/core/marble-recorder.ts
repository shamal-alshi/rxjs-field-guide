import { signal } from '@angular/core';
import { MonoTypeOperatorFunction, tap } from 'rxjs';
import { MarbleEvent, MarbleKind } from './marble.model';

let nextId = 0;

export class MarbleRecorder {
  private readonly _events = signal<MarbleEvent[]>([]);
  readonly events = this._events.asReadonly();

  record(kind: MarbleKind, label = ''): void {
    // keep only the last 20 so the DOM never grows unbounded
    this._events.update((list) => [...list.slice(-19), { id: nextId++, kind, label }]);
  }
}

/** Drop this anywhere in a pipe() to "see" that point of the stream. */
export function recordTo<T>(rec: MarbleRecorder): MonoTypeOperatorFunction<T> {
  return tap({
    next: (v) => rec.record('next', String(v)),
    error: () => rec.record('error', '✕'),
    complete: () => rec.record('complete', '|'),
  });
}