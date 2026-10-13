import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { concatMap, defer, exhaustMap, mergeMap, Observable, Subject, switchMap, tap } from 'rxjs';
import { MarbleLane } from '../../shared/ui/marble-lane/marble-lane';
import { fakeRequest } from '../../core/fake-request';
import { MarbleRecorder, recordTo } from '../../core/marble-recorder';

type Flatten = (project: (id: number) => Observable<number>) => (source: Observable<number>) => Observable<number>;

interface Lane {
  name: string;
  hint: string;
  recorder: MarbleRecorder;
  started: ReturnType<typeof signal<number>>;
  completed: ReturnType<typeof signal<number>>;
}

@Component({
  selector: 'app-flattening',
  imports: [MarbleLane, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './flattening.html',
  styleUrl: './flattening.scss',
})
export class Flattening {
  private readonly click$ = new Subject<number>();
  private clickCount = 0;

  protected readonly clicks = new MarbleRecorder();

  protected readonly lanes: Lane[] = [
    this.createLane('switchMap', 'Cancels the previous request. Search-as-you-type.', (p) => switchMap(p)),
    this.createLane('mergeMap', 'Runs all in parallel. Order not guaranteed.', (p) => mergeMap(p)),
    this.createLane('concatMap', 'Queues requests. Order guaranteed, but slow.', (p) => concatMap(p)),
    this.createLane('exhaustMap', 'Ignores clicks while busy. Login / submit buttons.', (p) => exhaustMap(p)),
  ];

  protected send(): void {
    const id = ++this.clickCount;
    this.clicks.record('next', String(id));
    this.click$.next(id);
  }

  private createLane(name: string, hint: string, flatten: Flatten): Lane {
    const recorder = new MarbleRecorder();
    const started = signal(0);
    const completed = signal(0);

    // defer() runs the callback once per subscription, so `started` counts real requests
    const request = (id: number) =>
      defer(() => {
        started.update((n) => n + 1);
        return fakeRequest(id);
      }).pipe(tap(() => completed.update((n) => n + 1)));

    this.click$
      .pipe(flatten(request), recordTo(recorder), takeUntilDestroyed())
      .subscribe();

    return { name, hint, recorder, started, completed };
  }
}