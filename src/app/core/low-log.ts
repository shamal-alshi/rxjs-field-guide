import { DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { concat, concatMap, EMPTY, ignoreElements, MonoTypeOperatorFunction, of, Subject, takeUntil, tap, timer } from 'rxjs';

/**
 * FlowLog = "a slow-motion replay of a stream".
 *
 * A real RxJS pipeline runs in a few microseconds, so nobody can follow it by eye.
 * Every station in a pipeline writes what it saw into a FlowLog, and the FlowLog
 * shows those events ONE AT A TIME, with a pause between them. The stream is real;
 * only the replay is slowed down so a human can watch it.
 */

export type FlowKind = 'next' | 'error' | 'complete' | 'info';

export interface FlowEntry {
  id: number;
  /** Which station (box) this happened at. */
  station: number;
  kind: FlowKind;
  /** Short text shown inside the chip, like 10 or "H". */
  label: string;
  /** Plain-English sentence shown in the narration box. */
  text: string;
  /** Optional side effect (what tap did on the side), e.g. console.log("saw 10"). */
  effect?: string;
}

/** Describes one box on the conveyor. */
export interface Station {
  name: string;
  /** The code this box stands for, shown under the name. */
  code: string;
  /** One short line explaining the box's job. */
  hint: string;
  /** Narration for a value, "{v}" is replaced by the value. */
  say: string;
  /** Narration when the stream completes. */
  doneSay: string;
  /** Narration when the stream errors, "{v}" is replaced by the message. */
  errSay: string;
  /** A "peek" station (tap) draws a side door to show its side effects. */
  peek?: boolean;
}

type Queued = FlowEntry & { gen: number };

export class FlowLog {
  private readonly incoming = new Subject<Queued>();
  private readonly resets = new Subject<void>();
  private generation = 0; // bumps on reset, so stale queued events can be thrown away
  private nextId = 0;

  /** Everything shown so far (newest last). */
  readonly history = signal<FlowEntry[]>([]);
  /** The event being shown right now. */
  readonly current = signal<FlowEntry | null>(null);
  /** The most recent event at each station, used to fill the boxes. */
  readonly lastAtStation = signal<Record<number, FlowEntry>>({});
  /** How many events are waiting for their turn to be shown. */
  readonly pending = signal(0);
  /** How many steps have been shown since the last reset. */
  readonly shown = signal(0);

  constructor(private readonly stepMs: number = 750) {
    this.incoming
      .pipe(
        // concatMap = "one at a time, in order". Show the event, then hold the stage for stepMs.
        concatMap((e) =>
          e.gen !== this.generation
            ? EMPTY
            : concat(of(e), timer(this.stepMs).pipe(takeUntil(this.resets), ignoreElements())),
        ),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe((e) => this.show(e));
  }

  push(station: number, kind: FlowKind, label: string, text: string, effect?: string): void {
    this.pending.update((n) => n + 1);
    this.incoming.next({ id: this.nextId++, station, kind, label, text, effect, gen: this.generation });
  }

  reset(): void {
    this.generation++;
    this.resets.next();
    this.pending.set(0);
    this.shown.set(0);
    this.history.set([]);
    this.current.set(null);
    this.lastAtStation.set({});
  }

  private show(queued: Queued): void {
    if (queued.gen !== this.generation) return;
    const { gen: _gen, ...entry } = queued;
    this.current.set(entry);
    this.shown.update((n) => n + 1);
    this.history.update((list) => [...list.slice(-29), entry]);
    if (entry.kind !== 'info') {
      this.lastAtStation.update((map) => ({ ...map, [entry.station]: entry }));
    }
    this.pending.update((n) => Math.max(0, n - 1));
  }
}

/** Turn any value into short, readable text: 5, "H", [1,2,3]. */
export function fmt(value: unknown): string {
  if (typeof value === 'string') return `"${value}"`;
  if (value instanceof Error) return value.message;
  if (typeof value === 'object' && value !== null) return JSON.stringify(value);
  return String(value);
}

/**
 * An observer (next / error / complete) that reports to a FlowLog.
 * Use it in .subscribe(...) for the last station, or inside tap(...) for a middle station.
 */
export function flowObserver<T>(
  log: FlowLog,
  index: number,
  station: Station,
  effect?: (label: string) => string,
) {
  return {
    next: (v: T) => {
      const label = fmt(v);
      log.push(index, 'next', label, `${station.name} ${station.say.replace('{v}', label)}`, effect?.(label));
    },
    error: (e: unknown) => {
      log.push(index, 'error', '✕', `${station.name} ${station.errSay.replace('{v}', fmt(e))}`);
    },
    complete: () => {
      log.push(index, 'complete', '✓', `${station.name} ${station.doneSay}`);
    },
  };
}

/** Drop this into a pipe() to make that point of the stream visible. It never changes the values. */
export function flowTap<T>(
  log: FlowLog,
  index: number,
  station: Station,
  effect?: (label: string) => string,
): MonoTypeOperatorFunction<T> {
  return tap(flowObserver<T>(log, index, station, effect));
}