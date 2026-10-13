# RxJS Field Guide

An interactive, dark-themed learning app for understanding RxJS through plain-language explanations and hands-on stream visualizations.

## What is this project about?

RxJS is a library for working with values that arrive over time: button clicks, keystrokes, network responses, timers, and many other events. Its operators let an app transform those values, combine them, handle failures, and manage asynchronous work.

Those ideas can be hard to picture from definitions alone. The RxJS Field Guide makes them visible: each lesson starts with a familiar problem, explains the idea in human-friendly language, and gives you an interactive experiment. Animated marble lanes show values moving through a stream, while counters and UI states make the result easier to compare.

The demos are educational and run in the browser. Requests shown in the labs are simulated; they do not call a real API.

## Learning topics

| Topic | What you can explore |
| --- | --- |
| Subjects and shared state | Compare `Subject`, `BehaviorSubject`, `ReplaySubject`, and `AsyncSubject`, including what late subscribers receive. |
| Cold vs. hot streams | Compare per-subscriber work with `share()` and `shareReplay()` using a simulated request. |
| Flattening operators | See how `switchMap`, `mergeMap`, `concatMap`, and `exhaustMap` handle overlapping work. |
| Errors and recovery | Compare `catchError` placement, retry a flaky request, and render loading/success/error states. |
| Performance and cleanup | Explore subscription lifetimes, event-rate operators, and `shareReplay` reference counting. |

## Run locally

### Requirements

- Node.js and npm

### Start the development server

```bash
npm install
npm start
```

Open the local URL printed by Angular CLI (usually [http://localhost:4200](http://localhost:4200)).

## Useful commands

```bash
npm start       # Run the development server
npm run build   # Build the app (including prerendered routes)
npm test        # Run the unit tests
npm run watch   # Rebuild when source files change
```

## Built with

- Angular standalone components, Signals, and Angular Router
- RxJS 7
- TypeScript
- SCSS and CSS animations

## Project structure

```text
src/
├── app/
│   ├── core/                 # Marble event recording and demo helpers
│   ├── features/             # Landing page and topic lessons
│   ├── shared/ui/            # Reusable marble-lane visualization
│   ├── app.routes.ts         # Lazy-loaded lesson routes
│   └── app.html              # Shared navigation and router outlet
└── styles.scss               # Global theme and shared lesson styles
```

## Learning approach

Try the experiment before reading the takeaway. Change the inputs, watch what happens, then connect the behavior to the operator. The goal is not to memorize every operator, but to recognize the behavior a real application needs and choose an operator that matches it.
