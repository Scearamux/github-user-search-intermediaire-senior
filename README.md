# GitHub User Search

Real-time GitHub user search (no button, no Enter key required), with multi-selection, duplication and deletion of results on the front end.

## Stack

- React 19 + TypeScript
- Vite
- Native `fetch`

## Getting started

```bash
npm install
npm run dev
npm test
npm run test:watch
npm run build
npm run lint
```

> The GitHub search API is capped at **10 requests per minute** without authentication. Under heavy manual testing the app will show its rate-limit message until the quota resets.

## Features

- Instant search via `GET https://api.github.com/search/users?q={USER}`
- Results displayed in a responsive grid (avatar, id, login, link to profile)
- Checkbox per card + "select all" checkbox with a count of selected items
- Bulk actions on the selection: **duplicate** and **delete** (front-end only, reset on every new search)
- Edge cases handled:
  - no results found
  - GitHub API rate limit (403) → dedicated error message
  - fast typing / going back and forth in the search → no stale results flashing on screen

## Architecture choices

- **Debounce (400ms) + `AbortController`**: debounce avoids hammering the API on every keystroke, and `AbortController` cancels the previous request if the user types again before the delay ends. The two mechanisms are complementary: debounce reduces the number of requests, while abort guarantees that a late response can't overwrite a more recent result (race condition).
- **Separation of concerns**:
  - `useGithubUsers`: handles search (fetch, debounce, abort, errors, loading)
  - `useSelection`: handles selection state independently from the displayed data, and resets on every query change
  - Purely presentational components (`SearchBar`, `UserGrid`, `UserCard`, `SelectionBar`)
- Displayed users state (`users`) is kept separate from selection state (`selectedIds`), which makes it possible to duplicate/delete cards without touching the search logic.

## Additional Items

- Edit mode (bonus) to show/hide checkboxes and bulk actions
- 36 tests covering the hooks (`useGithubUsers`, `useSelection`), the components and the full search → edit → duplicate/delete flow

## AI-assisted development

**Tool** — Claude (Anthropic)

**How it was used**

The first working version was written by hand: API call, edge-case handling, selection, bulk actions and layout. From there the assistant was used on four fronts:

1. **TypeScript support.** This was the starting point: I had not written TypeScript for a while, and the assistant acted as an active refresher on typing props, custom hooks and API responses, rather than looking each piece of syntax up in the docs.
2. **Tests.** The test suite was written with the assistant, driven by the edge cases the brief requires.
3. **Review.** The code was reviewed against the brief

Design decisions stayed on my side: where the edit-mode toggle belongs in the UI, which fixes to apply, and respecting the 100px card width annotated on the mock. Several suggestions were discussed and turned down

**How the output was verified**

- `npm run build` (type checking) and `npm run lint` after every step
- Full test suite re-run after every change; the regression test for the empty-state bug was checked to fail against the old code before being kept
- Manual verification in the browser for anything visual — edit mode, responsive behaviour, page background
- Line-by-line review of each diff before keeping it

I am able to explain every part of the submitted code.
