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
    .lane { display: grid; grid-template-columns: minmax(6.5rem, 8rem) minmax(0, 1fr); align-items: center; gap: .85rem; }
    .name { color: #a1a8bd; font: 600 .76rem/1.35 ui-monospace, monospace; overflow-wrap: anywhere; }
    .track {
      position: relative; height: 3rem; min-width: 0;
      container-type: inline-size;
      border-bottom: 2px solid #293149;
    }
    .marble {
      position: absolute; top: 50%; left: 0; translate: 0 -50%;
      width: 2.25rem; height: 2.25rem; border-radius: 50%;
      display: grid; place-items: center;
      font: 700 .8rem ui-monospace, monospace; color: #fff;
      background: #35c7a8; box-shadow: 0 4px 14px #35c7a844;
      animation: travel linear forwards;
    }
    .marble.error { background: #ec6b83; box-shadow: 0 4px 14px #ec6b8344; }
    .marble.complete { width: 4px; border-radius: 2px; background: #c0c5d4; box-shadow: none; }
    @keyframes travel {
      0%   { transform: translateX(0); opacity: 0; }
      8%   { opacity: 1; }
      92%  { opacity: 1; }
      100% { transform: translateX(calc(100cqw - 2.25rem)); opacity: 0; }
    }
    @media (prefers-reduced-motion: reduce) { .marble { animation-duration: 1ms !important; } }
    @media (max-width: 520px) {
      .lane { grid-template-columns: 1fr; gap: .2rem; }
      .name { font-size: .7rem; }
      .track { height: 2.5rem; }
    }
  `,
})
export class MarbleLane {
  readonly name = input.required<string>();
  readonly events = input.required<readonly MarbleEvent[]>();
  readonly durationMs = input(4000);
}