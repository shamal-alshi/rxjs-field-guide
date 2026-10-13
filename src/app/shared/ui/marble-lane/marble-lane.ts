import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MarbleEvent } from '../../../core/marble.model';


@Component({
  selector: 'app-marble-lane',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="lane">
      <span class="name">{{ name() }}</span>
      <div class="track">
        @for (e of events(); track e.id) {
          <span
            class="marble"
            [class.error]="e.kind === 'error'"
            [class.complete]="e.kind === 'complete'"
            [style.animation-duration.ms]="durationMs()"
            >{{ e.label }}</span
          >
        }
      </div>
    </div>
  `,
  styles: `
    .lane { display: grid; grid-template-columns: 5.5rem 1fr; align-items: center; gap: 1rem; }
    .name { font: 500 .8rem ui-monospace, monospace; color: #8b93a7; }
    .track {
      position: relative; height: 3rem;
      container-type: inline-size;              /* lets us use 100cqw below */
      border-bottom: 2px solid #2a3042;
    }
    .marble {
      position: absolute; top: 50%; left: 0; translate: 0 -50%;
      width: 2.25rem; height: 2.25rem; border-radius: 50%;
      display: grid; place-items: center;
      font: 600 .8rem ui-monospace, monospace; color: #0b0e17;
      background: #5eead4; box-shadow: 0 0 16px #5eead499;
      animation: travel linear forwards;
    }
    .marble.error { background: #fb7185; box-shadow: 0 0 16px #fb718599; }
    .marble.complete { width: 4px; border-radius: 2px; background: #e2e8f0; box-shadow: none; }
    @keyframes travel {
      0%   { transform: translateX(0); opacity: 0; }
      8%   { opacity: 1; }
      92%  { opacity: 1; }
      100% { transform: translateX(calc(100cqw - 2.25rem)); opacity: 0; }
    }
    @media (prefers-reduced-motion: reduce) { .marble { animation-duration: 1ms !important; } }
  `,
})
export class MarbleLane {
  readonly name = input.required<string>();
  readonly events = input.required<readonly MarbleEvent[]>();
  readonly durationMs = input(4000);
}