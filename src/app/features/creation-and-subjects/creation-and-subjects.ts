import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AsyncSubject, BehaviorSubject, ReplaySubject, Subject, takeUntil } from 'rxjs';
import { MarbleLane } from '../../shared/ui/marble-lane/marble-lane';
import { MarbleRecorder, recordTo } from '../../core/marble-recorder';

interface Row {
  name: string;
  hint: string;
  subject: Subject<number>;
  early: MarbleRecorder;
  late: MarbleRecorder;
}

@Component({
  selector: 'app-creation-and-subjects',
  imports: [MarbleLane, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './creation-and-subjects.html',
  styleUrl: './creation-and-subjects.scss',
})
export class CreationAndSubjects {
  private readonly destroyRef = inject(DestroyRef);
  private readonly reset$ = new Subject<void>();
  private counter = 0;

  protected readonly source = signal(new MarbleRecorder());
  protected readonly lateJoined = signal(false);
  protected readonly rows = signal<Row[]>(this.buildRows());

  protected emit(): void {
    const value = ++this.counter;
    this.source().record('next', String(value));
    this.rows().forEach((r) => r.subject.next(value));
  }

  protected complete(): void {
    this.source().record('complete');
    this.rows().forEach((r) => r.subject.complete());
  }

  protected joinLate(): void {
    if (this.lateJoined()) return;
    this.lateJoined.set(true);
    this.rows().forEach((r) => this.listen(r.subject, r.late));
  }

  protected reset(): void {
    this.reset$.next(); // tears down every subscription from the previous round
    this.counter = 0;
    this.lateJoined.set(false);
    this.source.set(new MarbleRecorder());
    this.rows.set(this.buildRows());
  }

  private buildRows(): Row[] {
    const make = (name: string, hint: string, subject: Subject<number>): Row => {
      const row: Row = { name, hint, subject, early: new MarbleRecorder(), late: new MarbleRecorder() };
      this.listen(subject, row.early); // the early subscriber joins immediately
      return row;
    };

    return [
      make('Subject', 'Forgets the past. Events and signals.', new Subject<number>()),
      make('BehaviorSubject(0)', 'Always holds a current value. UI state.', new BehaviorSubject<number>(0)),
      make('ReplaySubject(2)', 'Replays the last 2 values. Short history.', new ReplaySubject<number>(2)),
      make('AsyncSubject', 'Only the last value, and only on complete.', new AsyncSubject<number>()),
    ];
  }

  private listen(subject: Subject<number>, recorder: MarbleRecorder): void {
    subject
      .pipe(recordTo(recorder), takeUntil(this.reset$), takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}