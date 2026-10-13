import { Injectable, signal, WritableSignal } from '@angular/core';
import { defer, finalize, MonoTypeOperatorFunction } from 'rxjs';

/** +1 when someone subscribes, -1 when that subscription ends. Doesn't change the stream. */
export function trackSubs<T>(counter: WritableSignal<number>): MonoTypeOperatorFunction<T> {
  return (source) =>
    defer(() => {
      counter.update((n) => n + 1);
      return source.pipe(finalize(() => counter.update((n) => n - 1)));
    });
}

/** App-wide counter used by the leak demo. */
@Injectable({ providedIn: 'root' })
export class LeakMonitor {
  readonly active = signal(0);
}