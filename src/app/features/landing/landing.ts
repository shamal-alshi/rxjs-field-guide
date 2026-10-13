import { ChangeDetectionStrategy, Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { interval, map } from 'rxjs';
import { MarbleLane } from '../../shared/ui/marble-lane/marble-lane';
import { MarbleRecorder, recordTo } from '../../core/marble-recorder';

const TOPICS = [
  { path: 'creation-and-subjects', title: 'Subjects', question: 'Subject, BehaviorSubject or ReplaySubject?' },
  { path: 'cold-and-hot', title: 'Cold vs hot', question: 'Why did my HTTP call fire twice?' },
  { path: 'flattening', title: 'Flattening operators', question: 'switchMap, mergeMap, concatMap or exhaustMap?' },
  { path: 'error-handling', title: 'Error handling', question: 'Why did my stream die after one error?' },
  { path: 'performance', title: 'Performance', question: 'Leaks, noisy events and shareReplay.' },
];

@Component({
  selector: 'app-landing',
  imports: [RouterLink, MarbleLane],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing {
  protected readonly source = new MarbleRecorder();
  protected readonly output = new MarbleRecorder();
  protected readonly topics = TOPICS;

  constructor() {
    interval(1200)
      .pipe(
        recordTo(this.source),
        map((n) => n * 10),
        recordTo(this.output),
        takeUntilDestroyed(), // unsubscribes when the component is destroyed
      )
      .subscribe();
  }
}