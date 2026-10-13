import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import {
  auditTime, debounceTime, interval, MonoTypeOperatorFunction, sampleTime,
  shareReplay, Subject, Subscription, tap, throttleTime,
} from 'rxjs';
import { MarbleLane } from '../../shared/ui/marble-lane/marble-lane';
import { MarbleRecorder, recordTo } from '../../core/marble-recorder';
import { LeakMonitor, trackSubs } from '../../core/pref/track-sub';
import { LeakyTicker, CleanTicker } from './ticker';

interface RateLane {
  name: string;
  hint: string;
  recorder: MarbleRecorder;
  emitted: ReturnType<typeof signal<number>>;
}

@Component({
  selector: 'app-performance',
  imports: [MarbleLane, RouterLink, LeakyTicker, CleanTicker],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'page' },
  styles: `
    .zone {
      display: grid; place-items: center; height: 9rem; border: 2px dashed #2a3042; border-radius: 1rem;
      color: #8b93a7; user-select: none; background: #11151f;
    }
    .zone:hover { border-color: #5eead4; }
  `,
  templateUrl: './performance.html',
})
export class Performance {
  // ---------- 1. subscription leaks ----------
  protected readonly monitor = inject(LeakMonitor);
  protected readonly showLeaky = signal(false);
  protected readonly showClean = signal(false);

  // ---------- 2. taming noisy events ----------
  private readonly move$ = new Subject<number>();
  protected readonly total = signal(0);

  protected readonly lanes: RateLane[] = [
    this.createRateLane('raw', 'Every single event.', (s) => s),
    this.createRateLane('throttle', 'throttleTime(500): first event, then silence. Scroll, resize.', throttleTime(500)),
    this.createRateLane('audit', 'auditTime(500): the last event of each window. Smooth updates.', auditTime(500)),
    this.createRateLane('debounce', 'debounceTime(500): only after you stop. Search boxes.', debounceTime(500)),
    this.createRateLane('sample', 'sampleTime(500): latest value on a fixed tick. Live readouts.', sampleTime(500)),
  ];

  protected onMove(): void {
    this.total.update((n) => n + 1);
    this.move$.next(this.total());
  }

  private createRateLane(name: string, hint: string, limit: MonoTypeOperatorFunction<number>): RateLane {
    const recorder = new MarbleRecorder();
    const emitted = signal(0);

    this.move$
      .pipe(limit, tap(() => emitted.update((n) => n + 1)), recordTo(recorder), takeUntilDestroyed())
      .subscribe();

    return { name, hint, recorder, emitted };
  }

  // ---------- 3. shareReplay and refCount ----------
  protected readonly plainActive = signal(0);
  protected readonly refCountActive = signal(0);
  protected readonly watching = signal(false);
  private watchSub?: Subscription;

  // takeUntilDestroyed sits BEFORE shareReplay so leaving this page always stops the sources.
  private readonly plain$ = interval(1000).pipe(
    trackSubs(this.plainActive),
    takeUntilDestroyed(),
    shareReplay(1),
  );

  private readonly refCounted$ = interval(1000).pipe(
    trackSubs(this.refCountActive),
    takeUntilDestroyed(),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  protected toggleWatch(): void {
    if (this.watchSub) {
      this.watchSub.unsubscribe();
      this.watchSub = undefined;
      this.watching.set(false);
      return;
    }
    this.watchSub = new Subscription();
    this.watchSub.add(this.plain$.subscribe());
    this.watchSub.add(this.refCounted$.subscribe());
    this.watching.set(true);
  }
}