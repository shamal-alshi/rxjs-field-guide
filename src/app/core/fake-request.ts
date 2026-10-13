import { map, Observable, of, switchMap, throwError, timer } from 'rxjs';

/** Succeeds after a random 0.8–2.5s. */
export function fakeRequest(id: number): Observable<number> {
  const delay = 800 + Math.random() * 1700;
  return timer(delay).pipe(map(() => id));
}

/** Takes 700ms, and every 3rd request (3, 6, 9...) fails. */
export function flakyRequest(id: number): Observable<number> {
  return timer(700).pipe(
    switchMap(() => (id % 3 === 0 ? throwError(() => new Error(`Request ${id} failed`)) : of(id))),
  );
}