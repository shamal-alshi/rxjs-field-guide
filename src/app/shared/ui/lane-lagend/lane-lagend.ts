import { ChangeDetectionStrategy, Component } from '@angular/core';

/** A small "how to read this" key for the marble lanes. */
@Component({
    selector: 'app-lane-legend',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <details class="legend" open>
      <summary>How to read these lanes</summary>
      <ul>
        <li><span class="key time" aria-hidden="true">→</span> Each line is a <b>stream</b>. Time flows from left to right.</li>
        <li><span class="key dot" aria-hidden="true"></span> A <b>green dot</b> is one value arriving.</li>
        <li><span class="key err" aria-hidden="true"></span> A <b>red dot</b> is an error. The stream stops there.</li>
        <li><span class="key bar" aria-hidden="true"></span> A <b>white bar</b> means complete: no more values will come.</li>
      </ul>
    </details>
  `,
    styles: `
    :host { display: block; }
    .legend { margin-bottom: 1rem; border: 1px solid var(--line); border-radius: .85rem; background: #0f1527; }
    summary { padding: .65rem .9rem; color: var(--purple-dark); font-size: .82rem; font-weight: 700; cursor: pointer; }
    ul { display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: .5rem .9rem; margin: 0; padding: 0 .9rem .85rem; list-style: none; }
    li { display: flex; align-items: center; gap: .55rem; color: var(--muted); font-size: .84rem; line-height: 1.45; }
    b { color: var(--ink); }
    .key { flex: none; display: inline-block; }
    .time { width: 1.5rem; text-align: center; color: var(--muted); }
    .dot, .err { width: 1.1rem; height: 1.1rem; border-radius: 50%; background: #35c7a8; box-shadow: 0 2px 8px #35c7a855; }
    .err { background: #ec6b83; box-shadow: 0 2px 8px #ec6b8355; }
    .bar { width: 4px; height: 1.2rem; margin-inline: .45rem; border-radius: 2px; background: #c0c5d4; }
  `,
})
export class LaneLegend { }
