# RxJS Field Guide

> Learn RxJS by watching streams in action.

**RxJS Field Guide** is an interactive learning app that explains RxJS concepts through real-world problems, runnable examples, and animated marble-style visualizations. Instead of memorizing operator definitions, you can see how values move through a stream and how different operators change the result.

> **Project status:** In development. Features listed below are planned until implemented.

## Why this project?

RxJS operators can feel abstract when you only read their definitions. This project aims to make them easier to understand by pairing each concept with:

- A practical problem to solve
- A naive approach and why it can fail
- A better RxJS solution
- Code you can read alongside the demo
- Animated values (“marbles”) moving through a stream
- Visible event logs and counters where useful

## Planned learning modules

### 1. Creation functions and Subjects
- `of()` vs `from()`
- `fromEvent()`, `timer()`, `interval()`, and `defer()`
- `Subject`, `BehaviorSubject`, `ReplaySubject`, and `AsyncSubject`
- Cold vs hot Observables
- Multicasting with `share()` and `shareReplay()`

### 2. Flattening operators
Compare the same sequence of triggers with:
- `switchMap` — switch to the latest inner Observable; useful for search
- `mergeMap` — run inner Observables concurrently; useful for independent work
- `concatMap` — queue inner Observables and process them in order
- `exhaustMap` — ignore new triggers while the current inner Observable is active

The visual demo will show active, completed, queued, ignored, and cancelled work where applicable.

### 3. Error handling
- `catchError()` inside vs outside a flattening operator
- `retry()` and delayed retries
- `finalize()`, `EMPTY`, and `throwError()`
- Representing loading, success, and error states as values

### 4. Performance and cleanup
- Subscription cleanup with `takeUntilDestroyed()`
- `async` pipe and `toSignal()`
- `debounceTime()`, `throttleTime()`, `auditTime()`, and `sampleTime()`
- `distinctUntilChanged()`
- `shareReplay({ bufferSize: 1, refCount: true })`
- Exploring Angular change detection, `OnPush`, and Signals

## What is a marble?

A marble is a visual marker for a value emitted by an Observable. For example, `of(10, 20, 30)` emits three values, so the visualization can show three marbles travelling through a source lane, an operator, and an output lane.

The app will use animation to make stream behaviour visible. RxJS determines when values are emitted; the UI records those events; CSS animates their visual representation.

## Tech stack

Planned stack:

- Angular with standalone components and built-in template control flow (`@if` / `@for`)
- TypeScript
- RxJS
- Angular Signals for local reactive UI state where appropriate
- HTML and CSS animations
- Angular Router for learning modules

The initial version is intended to run entirely in the browser. No AI service, backend, or database is required.

## Getting started

### Prerequisites

- Node.js compatible with the Angular version used by this project
- npm
- Angular CLI (optional globally; you can also use `npx`)

### Run locally

Once the Angular application has been created or cloned:

```bash
npm install
npm start
```

If the project does not define an `npm start` script, use:

```bash
npx ng serve
```

Then open the local URL printed by the Angular CLI, usually `http://localhost:4200`.

> These commands assume the Angular project files (`package.json`, `angular.json`, and `src/`) are present in the repository.

## Planned project structure

The exact structure may evolve as the app grows.

```text
src/
└── app/
    ├── core/
    │   └── marble/
    │       ├── marble.model.ts
    │       └── marble-recorder.ts
    ├── shared/
    │   └── ui/
    │       ├── marble-lane/
    │       ├── demo-panel/
    │       └── code-block/
    ├── features/
    │   ├── landing/
    │   ├── creation-and-subjects/
    │   ├── flattening/
    │   ├── error-handling/
    │   └── performance/
    ├── app.config.ts
    └── app.routes.ts
```

### Architecture at a glance

- **Feature pages** explain a concept and configure its demo.
- **Demo panel** brings together the problem, code, event log, and counters.
- **Marble lane** displays and animates recorded events.
- **Marble recorder** captures relevant event information for the visualizer.
- **Angular Router** loads feature pages as needed.

The visual layer should explain the stream, not replace the real RxJS implementation. Each demo should be driven by the actual Observable pipeline wherever practical.

## Development roadmap

- [ ] Create the Angular app and establish the visual theme
- [ ] Build the landing page and navigation
- [ ] Build a reusable animated marble lane
- [ ] Add Run and Reset controls
- [ ] Demonstrate a simple source and transformation (`of()` + `map()`)
- [ ] Build the four flattening-operator comparison lanes
- [ ] Add error-handling demos
- [ ] Add Subjects and cold-vs-hot demos
- [ ] Add performance and subscription-cleanup demos
- [ ] Add responsive styling, accessibility checks, and reduced-motion support
- [ ] Write tests and document lessons learned

## Learning goals

By building this project, I want to strengthen my understanding of:

- Observable creation and subscription behaviour
- RxJS operator selection and composition
- Cancellation, concurrency, and sequencing
- Error handling and stream recovery
- Subscription lifecycle and performance
- Angular standalone architecture, Signals, and change detection
- Reusable components and data-driven UI design

## Contributing

This is a personal learning and portfolio project. Suggestions and constructive feedback are welcome.

## License

A license has not been selected yet. Add a `LICENSE` file before presenting the project as open source.
