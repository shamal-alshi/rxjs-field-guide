import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { from, interval, Observable, of, Subject, take, takeUntil, throwError } from 'rxjs';
import { CodeBlock } from '../../shared/ui/code-block/code-block';
import { Conveyor } from '../../shared/ui/conveyor/conveyor';
import { Station, FlowLog, flowTap, flowObserver } from '../../core/low-log';
import { LaneLegend } from '../../shared/ui/lane-lagend/lane-lagend';

/** The two boxes in every demo on this page. */
const OBSERVABLE: Station = {
  name: 'Observable',
  code: 'the creator',
  hint: 'Produces values over time.',
  say: 'emits {v}',
  doneSay: 'is finished: no more values will come.',
  errSay: 'failed: {v}',
};

const SUBSCRIBER: Station = {
  name: 'Subscriber',
  code: '.subscribe(…)',
  hint: 'Your code, which receives them.',
  say: 'receives {v}',
  doneSay: 'is told the stream is complete.',
  errSay: 'is told about the error: {v}',
};

interface Creator {
  /** Text on the tab. */
  tab: string;
  /** Code shown to the learner. */
  code: string;
  /** What actually runs when they press Subscribe. */
  make: () => Observable<unknown>;
  /** One friendly paragraph. */
  plain: string;
  /** What they should expect to see. */
  result: string;
}

const CREATORS: Creator[] = [
  {
    tab: 'of(1, 2, 3)',
    code: ["import { of } from 'rxjs';", '', 'of(1, 2, 3).subscribe(value => console.log(value));'].join('\n'),
    make: () => of(1, 2, 3),
    plain: 'of takes the values you list and emits them one by one, in order. When the list runs out, it completes.',
    result: '3 separate values (1, 2, 3), then complete.',
  },
  {
    tab: 'of([1, 2, 3])',
    code: ["import { of } from 'rxjs';", '', 'of([1, 2, 3]).subscribe(value => console.log(value));'].join('\n'),
    make: () => of([1, 2, 3]),
    plain:
      'Watch out: you gave of ONE thing, an array. of never looks inside what you give it, so it emits that one array exactly as it is.',
    result: '1 value (the whole array [1,2,3]), then complete.',
  },
  {
    tab: 'from([1, 2, 3])',
    code: ["import { from } from 'rxjs';", '', 'from([1, 2, 3]).subscribe(value => console.log(value));'].join('\n'),
    make: () => from([1, 2, 3]),
    plain: 'from unpacks something that holds many things (like an array) and emits each item on its own.',
    result: '3 separate values (1, 2, 3), then complete.',
  },
  {
    tab: "from('Hey')",
    code: ["import { from } from 'rxjs';", '', "from('Hey').subscribe(letter => console.log(letter));"].join('\n'),
    make: () => from('Hey'),
    plain: 'A string is a list of letters, so from emits one letter at a time. Anything you can loop over with for…of works.',
    result: '3 values ("H", "e", "y"), then complete.',
  },
  {
    tab: 'from(promise)',
    code: [
      "import { from } from 'rxjs';",
      '',
      '// fetchUser() returns a Promise that resolves in ~1 second',
      'from(fetchUser()).subscribe(user => console.log(user));',
    ].join('\n'),
    make: () => from(new Promise<string>((resolve) => setTimeout(() => resolve('Loaded!'), 1200))),
    plain:
      'A Promise gives you one answer, later. from turns it into an Observable that waits, emits that single answer, then completes.',
    result: 'Nothing for a moment, then 1 value ("Loaded!"), then complete.',
  },
  {
    tab: 'interval + take',
    code: [
      "import { interval, take } from 'rxjs';",
      '',
      '// a tick every 0.8 seconds, but stop after 3',
      'interval(800).pipe(take(3)).subscribe(tick => console.log(tick));',
    ].join('\n'),
    make: () => interval(800).pipe(take(3)),
    plain:
      'interval is a clock: 0, 1, 2, 3… forever. It never finishes on its own, so we add take(3) to say "stop after three".',
    result: '3 values (0, 1, 2) spaced 0.8s apart, then complete.',
  },
  {
    tab: 'throwError',
    code: [
      "import { throwError } from 'rxjs';",
      '',
      'throwError(() => new Error("Something broke"))',
      '  .subscribe({ error: err => console.log(err.message) });',
    ].join('\n'),
    make: () => throwError(() => new Error('Something broke')),
    plain:
      'An Observable can also end with an error instead of completing. After an error nothing else can happen: the stream is over.',
    result: 'No values at all, just an error. There is no "complete".',
  },
];

const LAZY_CODE = [
  'const numbers$ = of(10, 20, 30);          // 1. create it: nothing runs yet',
  '',
  'numbers$.subscribe(n => console.log(n));  // 2. subscribe: NOW it runs',
  'numbers$.subscribe(n => console.log(n));  // 3. subscribe again: it runs again',
].join('\n');

@Component({
  selector: 'app-creating-observables',
  imports: [RouterLink, Conveyor, CodeBlock, LaneLegend],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'page' },
  templateUrl: './creating-observables.html',
})
export class CreatingObservables {
  private readonly destroyRef = inject(DestroyRef);
  private readonly stop$ = new Subject<void>();

  protected readonly stations = [OBSERVABLE, SUBSCRIBER];
  protected readonly creators = CREATORS;
  protected readonly lazyCode = LAZY_CODE;

  // ---------- Demo 1: pick a creator ----------
  protected readonly selected = signal(0);
  protected readonly current = computed(() => this.creators[this.selected()]);
  protected readonly log = new FlowLog();

  protected select(index: number): void {
    this.stop$.next(); // cancel a run that may still be going (e.g. interval)
    this.log.reset();
    this.selected.set(index);
  }

  protected run(): void {
    this.stop$.next();
    this.log.reset();
    this.current()
      .make()
      .pipe(flowTap(this.log, 0, OBSERVABLE), takeUntil(this.stop$), takeUntilDestroyed(this.destroyRef))
      .subscribe(flowObserver(this.log, 1, SUBSCRIBER));
  }

  // ---------- Demo 2: nothing happens until you subscribe ----------
  protected readonly lazyLog = new FlowLog(650);
  protected readonly created = signal(false);
  protected readonly runs = signal(0);
  private readonly numbers$ = of(10, 20, 30);

  /** Which line of LAZY_CODE to highlight. */
  protected readonly lazyLine = computed(() => {
    if (!this.created()) return -1;
    const n = this.runs();
    return n === 0 ? 0 : n === 1 ? 2 : 3;
  });

  protected createIt(): void {
    this.lazyLog.reset();
    this.runs.set(0);
    this.created.set(true);
    this.lazyLog.push(0, 'info', '', 'Created! But nothing has run yet. Nobody is listening, so the Observable just sits there, asleep. 💤');
  }

  protected subscribeToIt(): void {
    this.runs.update((n) => n + 1);
    this.lazyLog.push(1, 'info', '', `Subscribe #${this.runs()}: the Observable wakes up and starts a brand-new run.`);
    this.numbers$
      .pipe(flowTap(this.lazyLog, 0, OBSERVABLE))
      .subscribe(flowObserver(this.lazyLog, 1, SUBSCRIBER));
  }

  protected resetLazy(): void {
    this.lazyLog.reset();
    this.created.set(false);
    this.runs.set(0);
  }
}