# pi-double-exit

Pressing pi's exit key once by accident ends a session. This makes it take two
presses inside a short window, with a hint in between.

## Install

```sh
pi install git:github.com/db112358/pi-double-exit
```

Pinned to the release:

```sh
pi install git:github.com/db112358/pi-double-exit@v1.0.0
```

For one run instead of settings:

```sh
pi -e git:github.com/db112358/pi-double-exit
```

Or clone the repo and link `extensions/double-exit.ts` into
`~/.pi/agent/extensions/`. pi supplies `@earendil-works/*` to extensions, so
there is nothing to install.

## What it does

The extension replaces the editor with a subclass that watches for the key bound
to `app.exit` — `Ctrl+D` by default — while the prompt is empty:

- **First press** arms a 1.5-second window and shows `Press ctrl+d again to quit`
  above the editor. Nothing else happens.
- **Second press** inside the window quits.
- **Any other keystroke**, or the window expiring, cancels the pending exit and
  clears the hint.

The key follows the binding rather than the physical `Ctrl+D`, so a rebind is
picked up; the hint names whatever keys are bound, joined with `/`.

It guards only the empty-prompt exit. With text in the editor the exit key is
left to pi's own handling, because that path is deliberate editing rather than a
stray keypress.

## Requirements

pi 1.5.2 or newer. TUI only: RPC and print modes provide a no-op for the editor
hook, so the extension loads and does nothing there — headless sessions are
unaffected.

## Licence

MIT.
