import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { LeakMonitor, trackSubs } from '../../core/pref/track-sub';

@Component({
  selector: 'app-leaky-ticker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p class="stats">🔴 leaky ticker · tick {{ ticks() }}</p>`,
})
export class LeakyTicker {
  protected readonly ticks = signal(0);

  constructor() {
    const monitor = inject(LeakMonitor);
    // BUG ON PURPOSE: never unsubscribed, keeps running after the component is destroyed.
    interval(1000)
      .pipe(trackSubs(monitor.active))
      .subscribe(() => this.ticks.update((n) => n + 1));
  }
}

@Component({
  selector: 'app-clean-ticker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p class="stats">🟢 clean ticker · tick {{ ticks() }}</p>`,
})
export class CleanTicker {
  protected readonly ticks = signal(0);

  constructor() {
    const monitor = inject(LeakMonitor);
    interval(1000)
      .pipe(trackSubs(monitor.active), takeUntilDestroyed()) // auto-unsubscribes on destroy
      .subscribe(() => this.ticks.update((n) => n + 1));
  }
}