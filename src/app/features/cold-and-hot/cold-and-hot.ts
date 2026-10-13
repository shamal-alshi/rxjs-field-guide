import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { defer, map, Observable, share, shareReplay, Subject, takeUntil, timer } from 'rxjs';
import { MarbleLane } from '../../shared/ui/marble-lane/marble-lane';
import { MarbleRecorder, recordTo } from '../../core/marble-recorder';

interface Variant {
  name: string;
  hint: string;
  requests: WritableSignal<number>;
  a: MarbleRecorder;
  b: MarbleRecorder;
  source$: Observable<number>;
}

@Component({
  selector: 'app-cold-and-hot',
  imports: [MarbleLane, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'page' },
  templateUrl: './cold-and-hot.html',
})
export class ColdAndHot {
  private readonly destroyRef = inject(DestroyRef);
  private readonly reset$ = new Subject<void>();

  protected readonly variants = signal<Variant[]>(this.build());

  protected subscribe(who: 'a' | 'b'): void {
    this.variants().forEach((v) =>
      v.source$
        .pipe(recordTo(v[who]), takeUntil(this.reset$), takeUntilDestroyed(this.destroyRef))
        .subscribe(),
    );
  }

  protected reset(): void {
    this.reset$.next();
    this.variants.set(this.build());
  }

  private build(): Variant[] {
    return [
      this.makeVariant('plain (cold)', 'Every subscriber triggers its own request.', (s) => s),
      this.makeVariant('share()', 'Shares while running. Restarts after it completes.', (s) => s.pipe(share())),
      this.makeVariant(
        'shareReplay(1, refCount)',
        'Shares, and late subscribers get the cached value.',
        (s) => s.pipe(shareReplay({ bufferSize: 1, refCount: true })),
      ),
    ];
  }

  private makeVariant(name: string, hint: string, wrap: (s: Observable<number>) => Observable<number>): Variant {
    const requests = signal(0);

    // defer() runs once per subscription, so `requests` counts real "HTTP calls".
    const raw$ = defer(() => {
      requests.update((n) => n + 1);
      return timer(1500).pipe(map(() => Math.floor(10 + Math.random() * 90)));
    });

    return { name, hint, requests, a: new MarbleRecorder(), b: new MarbleRecorder(), source$: wrap(raw$) };
  }
}