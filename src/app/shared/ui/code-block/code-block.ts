import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Shows code as text. Code lives in a TypeScript string (not in the HTML template),
 * because a template treats "{" and "}" as special characters.
 * `active` highlights one line, handy for "this is the line that is running now".
 */
@Component({
  selector: 'app-code',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <pre class="code" [attr.aria-label]="label()"><code>@for (line of lines(); track $index; let i = $index) {<span class="ln" [class.on]="i === active()">{{ line || ' ' }}</span>}</code></pre>
  `,
  styles: `
    :host { display: block; }
    .code {
      margin: 0; padding: .9rem 0; overflow-x: auto; border: 1px solid var(--line); border-radius: .85rem;
      background: #0a0f1d; font: 500 .84rem/1.75 ui-monospace, SFMono-Regular, Menlo, monospace; color: #d6dbee;
    }
    code { display: block; min-width: max-content; }
    .ln { display: block; padding: 0 1rem; border-left: 3px solid transparent; transition: background .2s, border-color .2s; }
    .ln.on { border-left-color: var(--mint); background: #5de0c418; color: #fff; }
  `,
})
export class CodeBlock {
  readonly code = input.required<string>();
  /** Zero-based index of the line to highlight, or -1 for none. */
  readonly active = input(-1);
  readonly label = input('Code example');
  protected readonly lines = computed(() => this.code().split('\n'));
}