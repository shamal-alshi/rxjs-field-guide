import { ChangeDetectionStrategy, Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { interval, map } from 'rxjs';
import { MarbleLane } from '../../shared/ui/marble-lane/marble-lane';
import { MarbleRecorder, recordTo } from '../../core/marble-recorder';

const TOPICS = [
  {
    path: 'creation-and-subjects',
    number: '01',
    title: 'Subjects & shared state',
    question: 'How can late listeners receive the right values?',
    example: 'Live dashboards, form state, and event buses.',
    tag: 'SUBJECTS',
  },
  {
    path: 'cold-and-hot',
    number: '02',
    title: 'Cold vs. hot streams',
    question: 'Why did one HTTP call run twice?',
    example: 'Sharing a single API request with several views.',
    tag: 'MULTICASTING',
  },
  {
    path: 'flattening',
    number: '03',
    title: 'Flattening operators',
    question: 'What should happen when requests overlap?',
    example: 'Typeahead search, uploads, and form submits.',
    tag: 'ASYNC FLOWS',
  },
  {
    path: 'error-handling',
    number: '04',
    title: 'Errors & recovery',
    question: 'Why did one failed request stop everything?',
    example: 'Resilient screens and retrying flaky services.',
    tag: 'RECOVERY',
  },
  {
    path: 'performance',
    number: '05',
    title: 'Performance & cleanup',
    question: 'How do you keep streams fast and tidy?',
    example: 'Subscriptions, mouse events, and cached data.',
    tag: 'BEST PRACTICES',
  },
];

@Component({
  selector: 'app-landing',
  imports: [RouterLink, MarbleLane],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'page landing-page' },
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