import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { map, of, Subject, switchMap, takeUntil, tap, timer } from 'rxjs';
import { CodeBlock } from '../../shared/ui/code-block/code-block';
import { Conveyor } from '../../shared/ui/conveyor/conveyor';
import { Station, FlowLog, flowTap, flowObserver } from '../../core/low-log';

const SOURCE: Station = {
  name: 'Source',
  code: 'of(1, 2, 3)',
  hint: 'Sends the numbers.',
  say: 'emits {v}',
  doneSay: 'is finished: no more values.',
  errSay: 'failed: {v}',
};

const MAP: Station = {
  name: 'map',
  code: 'n => n * 10',
  hint: 'Changes every value.',
  say: 'turns it into {v}',
  doneSay: 'passes on the "finished" signal.',
  errSay: 'passes on the error: {v}',
};

const TAP: Station = {
  name: 'tap',
  code: 'n => console.log(…)',
  hint: 'Looks at each value but never changes it.',
  say: 'peeks at {v}, does its side job, and lets it through unchanged.',
  doneSay: 'sees the end of the stream and lets it through.',
  errSay: 'lets the error through: {v}',
  peek: true,
};

const SUBSCRIBER: Station = {
  name: 'Subscriber',
  code: '.subscribe(…)',
  hint: 'Receives the final values.',
  say: 'receives {v}',
  doneSay: 'is told the stream is complete.',
  errSay: 'is told about the error: {v}',
};

const OBSERVER_CODE = [
  'source$.pipe(',
  '  tap({',
  "    next: value => console.log('value:', value),",
  "    error: err => console.log('error:', err),",
  "    complete: () => console.log('done'),",
  '  }),',
  ').subscribe();',
].join('\n');

const SPINNER_CODE = [
  'loadClick$.pipe(',
  '  tap(() => this.loading.set(true)),          // before the request: show spinner',
  '  switchMap(() => this.api.getUsers()),',
  '  tap(() => this.loading.set(false)),         // after the response: hide spinner',
  ').subscribe(users => this.users.set(users));',
].join('\n');

@Component({
  selector: 'app-tap',
  imports: [RouterLink, Conveyor, CodeBlock],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'page' },
  templateUrl: './tap.html',
})
export class TapLesson {
  private readonly destroyRef = inject(DestroyRef);
  private readonly stop$ = new Subject<void>();

  protected readonly stations = [SOURCE, MAP, TAP, SUBSCRIBER];
  protected readonly observerCode = OBSERVER_CODE;
  protected readonly spinnerCode = SPINNER_CODE;

  // ---------- Demo 1: tap sits in the middle and only peeks ----------
  protected readonly log = new FlowLog(850);
  protected readonly tryToChange = signal(false);

  protected readonly pipeCode = computed(() =>
    [
      'of(1, 2, 3).pipe(',
      '  map(n => n * 10),',
      this.tryToChange()
        ? '  tap(n => n * 100),   // returns a value... which tap throws away'
        : "  tap(n => console.log('saw', n)),",
      ').subscribe(n => show(n));',
    ].join('\n'),
  );

  /** Highlight the line of code that matches the box that is lit up right now. */
  protected readonly activeLine = computed(() => this.log.current()?.station ?? -1);

  protected toggleTry(): void {
    this.tryToChange.update((on) => !on);
    this.stop$.next();
    this.log.reset();
  }

  protected run(): void {
    this.stop$.next();
    this.log.reset();
    const sideJob = (label: string) =>
      this.tryToChange() ? `returned ${Number(label) * 100}… ignored!` : `console.log('saw', ${label})`;

    of(1, 2, 3)
      .pipe(
        flowTap(this.log, 0, SOURCE),
        map((n) => n * 10),
        flowTap(this.log, 1, MAP),
        // The REAL tap. If the toggle is on, it returns a number, and you'll see that nothing changes.
        tap((n) => (this.tryToChange() ? n * 100 : undefined)),
        flowTap(this.log, 2, TAP, sideJob),
        takeUntil(this.stop$),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(flowObserver(this.log, 3, SUBSCRIBER));
  }

  // ---------- Demo 2: a real use, the loading spinner ----------
  protected readonly loading = signal(false);
  protected readonly users = signal<string[]>([]);
  protected readonly loadsDone = signal(0);
  private readonly loadClick$ = new Subject<void>();

  constructor() {
    this.loadClick$
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.users.set([]);
        }),
        // pretend this is an HTTP call that takes 1.4 seconds
        switchMap(() => timer(1400).pipe(map(() => ['Asha', 'Ravi', 'Meera']))),
        tap(() => {
          this.loading.set(false);
          this.loadsDone.update((n) => n + 1);
        }),
        takeUntilDestroyed(),
      )
      .subscribe((people) => this.users.set(people));
  }

  protected loadUsers(): void {
    this.loadClick$.next();
  }
}