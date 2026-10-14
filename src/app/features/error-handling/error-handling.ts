import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import {
  catchError, defer, EMPTY, finalize, map, Observable, of, retry,
  startWith, Subject, switchMap, throwError, timer,
} from 'rxjs';

import { MarbleLane } from '../../shared/ui/marble-lane/marble-lane';
import { flakyRequest } from '../../core/fake-request';
import { MarbleRecorder, recordTo } from '../../core/marble-recorder';
import { LaneLegend } from '../../shared/ui/lane-lagend/lane-lagend';

interface SearchLane {
  name: string;
  hint: string;
  recorder: MarbleRecorder;
  alive: WritableSignal<boolean>;
}

type LoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: number }
  | { status: 'error'; message: string };

@Component({
  selector: 'app-error-handling',
  imports: [MarbleLane, LaneLegend, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'page' },
  templateUrl: './error-handling.html',
})
export class ErrorHandling {
  // ---------- 1. catchError: outside vs inside ----------
  private readonly click$ = new Subject<number>();
  private clickCount = 0;

  protected readonly clicks = new MarbleRecorder();
  protected readonly lanes: SearchLane[] = [
    this.createLane('catchError OUTSIDE', 'After one error the whole stream is dead.', true),
    this.createLane('catchError INSIDE', 'Only that request dies. Stream keeps going.', false),
  ];

  protected search(): void {
    const id = ++this.clickCount;
    this.clicks.record('next', String(id));
    this.click$.next(id);
  }

  private createLane(name: string, hint: string, catchOutside: boolean): SearchLane {
    const recorder = new MarbleRecorder();
    const alive = signal(true);

    const fallback = (): Observable<never> => {
      recorder.record('error', '✕');
      return EMPTY;
    };

    const source$ = catchOutside
      ? this.click$.pipe(switchMap(flakyRequest), catchError(fallback))
      : this.click$.pipe(switchMap((id) => flakyRequest(id).pipe(catchError(fallback))));

    source$
      .pipe(recordTo(recorder), finalize(() => alive.set(false)), takeUntilDestroyed())
      .subscribe();

    return { name, hint, recorder, alive };
  }

  // ---------- 2. retry with exponential backoff ----------
  private readonly retryRun$ = new Subject<void>();
  protected readonly retryRec = new MarbleRecorder();
  protected readonly attempts = signal(0);

  constructor() {
    this.retryRun$
      .pipe(
        switchMap(() => {
          this.attempts.set(0);
          return defer(() => {
            this.attempts.update((n) => n + 1);
            return this.attempts() < 3 ? throwError(() => new Error('fail')) : of('ok');
          }).pipe(
            retry({
              count: 3,
              delay: (_error, retryCount) => {
                this.retryRec.record('error', '✕');
                return timer(500 * 2 ** (retryCount - 1)); // 500ms, 1000ms, 2000ms...
              },
            }),
          );
        }),
        recordTo(this.retryRec),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  protected runRetry(): void {
    this.retryRun$.next();
  }

  // ---------- 3. errors as values ----------
  private readonly load$ = new Subject<void>();
  private loadCount = 0;

  protected readonly state = toSignal(
    this.load$.pipe(
      switchMap(() => {
        const id = ++this.loadCount;
        const loading: LoadState = { status: 'loading' };
        return flakyRequest(id).pipe(
          map((data): LoadState => ({ status: 'success', data })),
          catchError((e: Error) => of<LoadState>({ status: 'error', message: e.message })),
          startWith(loading),
        );
      }),
    ),
    { initialValue: { status: 'idle' } as LoadState },
  );

  protected load(): void {
    this.load$.next();
  }
}