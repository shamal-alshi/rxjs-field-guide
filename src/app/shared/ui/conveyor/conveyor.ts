import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Station, FlowLog } from '../../../core/low-log';


/**
 * A beginner-friendly picture of a stream:
 *   boxes (stations) in a row, one value lights up one box at a time,
 *   and a sentence underneath says what just happened in plain English.
 */
@Component({
  selector: 'app-conveyor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="belt" role="group" aria-label="Values moving through the stream, one step at a time">
      @for (s of stations(); track s.name; let i = $index) {
        @if (i > 0) {
          <span class="arrow" aria-hidden="true">→</span>
        }
        @let last = log().lastAtStation()[i];
        @let now = log().current();
        <div class="station" [class.lit]="now?.station === i && now?.kind !== 'info'" [class.bad]="now?.station === i && now?.kind === 'error'">
          <span class="step-no">{{ i + 1 }}</span>
          <strong class="name">{{ s.name }}</strong>
          <code class="code">{{ s.code }}</code>
          <div class="slot">
            @if (last) {
              @for (k of [last.id]; track k) {
                <span class="chip" [class.error]="last.kind === 'error'" [class.done]="last.kind === 'complete'">{{ last.label }}</span>
              }
            } @else {
              <span class="empty">waiting…</span>
            }
          </div>
          <small class="hint">{{ s.hint }}</small>
          @if (s.peek) {
            <div class="side-door" [class.on]="now?.station === i && now?.effect">
              <span class="side-title">side door</span>
              <span class="side-text">{{ now?.station === i && now?.effect ? now?.effect : 'values pass by, untouched' }}</span>
            </div>
          }
        </div>
      }
    </div>

    <div class="say" aria-live="polite">
      @if (log().current(); as c) {
        <span class="say-badge">Step {{ log().shown() }}</span>
        <span class="say-text">{{ c.text }}</span>
      } @else {
        <span class="say-text muted">Press the button above to watch it run, one step at a time.</span>
      }
    </div>

    @if (log().history().length > 1) {
      <ol class="trail" aria-label="Everything that happened so far">
        @for (e of log().history(); track e.id; let n = $index) {
          <li [class.error]="e.kind === 'error'" [class.done]="e.kind === 'complete'">
            <span class="n">{{ n + 1 }}</span> {{ e.text }}
          </li>
        }
      </ol>
    }
  `,
  styles: `
    :host { display: block; }
    .belt { display: flex; flex-wrap: wrap; align-items: stretch; gap: .5rem; }
    .arrow { align-self: center; color: var(--muted); font-size: 1.3rem; }
    .station {
      position: relative; flex: 1 1 9.5rem; min-width: 9rem; display: grid; align-content: start; gap: .35rem;
      padding: .9rem .85rem; border: 1px solid var(--line); border-radius: 1rem; background: #0f1527;
      transition: border-color .25s, box-shadow .25s, transform .25s;
    }
    .station.lit { border-color: var(--mint); box-shadow: 0 0 0 3px #5de0c433, 0 10px 30px #5de0c422; transform: translateY(-2px); }
    .station.bad { border-color: #ec6b83; box-shadow: 0 0 0 3px #ec6b8333; }
    .step-no {
      width: 1.45rem; height: 1.45rem; display: grid; place-items: center; border-radius: 50%;
      background: var(--soft-purple); color: var(--purple-dark); font: 700 .72rem ui-monospace, monospace;
    }
    .name { font-size: .92rem; }
    .code { color: var(--purple-dark); font: 600 .74rem/1.4 ui-monospace, monospace; overflow-wrap: anywhere; }
    .slot { min-height: 2.6rem; display: flex; align-items: center; }
    .empty { color: var(--muted); font-size: .8rem; font-style: italic; }
    .chip {
      max-width: 100%; padding: .4rem .75rem; border-radius: 999px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      background: #35c7a8; color: #06231d; font: 800 .9rem ui-monospace, monospace;
      box-shadow: 0 4px 14px #35c7a844; animation: pop .45s cubic-bezier(.2, 1.4, .4, 1);
    }
    .chip.error { background: #ec6b83; color: #2b0610; }
    .chip.done { background: #c0c5d4; color: #141b2d; }
    .hint { color: var(--muted); font-size: .78rem; line-height: 1.45; }
    .side-door {
      display: grid; gap: .15rem; margin-top: .25rem; padding: .5rem .6rem; border: 1px dashed var(--line); border-radius: .7rem;
      color: var(--muted); font-size: .76rem; transition: all .25s;
    }
    .side-door.on { border-color: #e0b84d; background: #2a2412; color: #f3d98a; }
    .side-title { font: 700 .65rem ui-monospace, monospace; letter-spacing: .1em; text-transform: uppercase; opacity: .8; }
    .side-text { font-family: ui-monospace, monospace; overflow-wrap: anywhere; }
    .say {
      display: flex; align-items: center; gap: .7rem; margin-top: 1rem; padding: .9rem 1rem; min-height: 3.4rem;
      border: 1px solid #20594f; border-radius: .9rem; background: var(--soft-mint);
    }
    .say-badge {
      flex: none; padding: .2rem .55rem; border-radius: 999px; background: #5de0c422; color: var(--mint);
      font: 700 .72rem ui-monospace, monospace;
    }
    .say-text { font-size: .98rem; line-height: 1.5; }
    .muted { color: var(--muted); }
    .trail { display: grid; gap: .3rem; margin: .9rem 0 0; padding: 0; list-style: none; color: var(--muted); font-size: .8rem; }
    .trail li { display: flex; gap: .55rem; }
    .trail li.error { color: #f59aab; }
    .trail li.done { color: #c0c5d4; }
    .n { flex: none; width: 1.3rem; text-align: right; font: 700 .72rem ui-monospace, monospace; opacity: .7; }
    @keyframes pop { 0% { transform: scale(.4); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
    @media (max-width: 640px) {
      .belt { flex-direction: column; }
      .arrow { transform: rotate(90deg); align-self: center; }
    }
    @media (prefers-reduced-motion: reduce) { .chip { animation: none; } .station { transition: none; } }
  `,
})
export class Conveyor {
  readonly stations = input.required<readonly Station[]>();
  readonly log = input.required<FlowLog>();
}