# AGENTS.md

You're an AI coding agent picking up hpbrn.cc, Connor Hepburn's personal
site. This file is the whole brief. There is no skills folder.

If a human is reading this, the document you want is [`README.md`](./README.md).

If anything here conflicts with the code, **the code is canonical.** Update
this file in the same pass.

---

## What this is

A single-page personal site: intro, writing, a project card, GitHub activity,
and connect links. It is not a product, blog platform, or dashboard.

No blog index, CMS, auth, or extra routes. No new dependencies without a
reason in the commit.

---

## Stack

```
Next.js 16 (App Router, Turbopack)   React 19   TypeScript
Tailwind v4   motion/react   Geist
```

```
app/          the site
writing/      one markdown file per essay
```

---

## Design

Warm paper and ink. Nothing is pure white or pure black. One blue accent
that does not flip in dark mode.

```css
:root {
  --bg: #f9f9f8;
  --text: #1f1f1a;
  --text-secondary: #636360;
  --text-tertiary: #9a9a96;
  --tooltip-surface: #ffffff;
  --creed: #2563eb;
}

.dark {
  --bg: #0e0e0d;
  --text: #e7e7e2;
  --text-secondary: #a3a39e;
  --text-tertiary: #6f6f6a;
  --tooltip-surface: #161615;
  --creed: #2563eb;
}
```

Theme is a `.dark` class on `html`, not `prefers-color-scheme`. Bind
Tailwind `dark:` to that class. Toggle is a hidden keypress plus the
connect icon.

Use the CSS variables. Do not invent a second palette.

### Motion

- Easing: `cubic-bezier(0.22, 1, 0.36, 1)`
- Reading transition: `0.48s`
- Shorter pops: `160ms`
- Use `motion/react`

Opening a writing piece collapses everything else. Clip edges meet the
viewport, not an inset padding box. Reading chrome uses measured height
plus `overflow: hidden`, so box-shadows and padding clip unless they sit
inside the measured box (`p-[2px]` on the project grid and connect row
exists for this).

### Copy

Dry, British, slightly rude. Short sentences. Jokes land in tooltips, not
headings. Never cute, corporate, or inspirational.

No em dashes in site copy, tooltips, comments, or this file. Rephrase, or
use a comma, colon, full stop, or hyphen.

Keyword tooltips are muttered asides about **the word**, not definitions
of the sentence.

Good: `we made that one empire`, `sounds like a skincare line`  
Bad: dictionary lines, restating the next clause, poster definitions

If a word cannot earn a joke, drop the highlight. Spaces after a keyword
must live **inside** `<Keyword>… </Keyword>`. A space after the tag is
eaten by the tooltip child.

Do not reintroduce CSS `:hover` as the only tooltip trigger. It sticks
across scroll. Tooltips use a JS `is-open` class and close when the
pointer is no longer over the word.

### Surfaces

- Intro: name, bio, keyword asides
- Writing: one open piece at a time
- Projects: Creed card with view-site and view-repo
- Activity: contribution heatmap
- Connect: theme, X, GitHub, Instagram, email, then a Discord online tag
  and an hpbrn tag

Writing source: `writing/lucidity.md`. Rendered essay with keywords still
lives in `app/lucidity-content.tsx`.

The tab icon is `app/favicon.ico`. Do not replace it with a mini OG card,
`app/icon.png`, or an `og:image` tag.

---

## Writing files

Every essay is `writing/<word>.md`. The filename is **one word** from the
title. Lowercase, no spaces, no dates, no extra folders.

- Title `Preserve lucidity` → `writing/lucidity.md`
- Title `On Taste` → `writing/taste.md`

Do not use `preserve-lucidity.md`, `lucidity-essay.md`, or `content/`.

When adding a piece: create that file with a `#` title, put the full text
there, and wire the site from it. Do not leave a second markdown copy
elsewhere.

---

## Code

Read the exact path you're about to change. Match what is already here.

- Smallest coherent change. Do not rewrite a file to look busy.
- `"use client"` only when a hook, browser API, or event needs it.
- No `console.log` in committed code.
- No new dependencies without justification in the commit.
- Prefer the existing CSS variables, class names, and motion timings
  over a new system.
- Extract only when the new unit has a clear owner. Do not split files
  to shorten them.
- Do not mix a refactor into a behavior change unless asked for both.
- Prefer removing complexity over hiding it behind an abstraction.

---

## Comments

Write a comment only when the code cannot say an important fact by
itself. A useful comment stops the next person breaking a non-obvious
contract.

Keep comments that explain why: a surprising implementation, a browser
or animation constraint, a deliberate workaround, or an intentional
no-op that looks accidental.

Remove comments that narrate the next line, decorate a section, repeat
an identifier, record history (`previously`, `changed from`), or describe
a value the class already states. If a comment exists to paper over a
bad name, rename instead.

Lead with the reason. One precise sentence. Sit the comment next to the
smallest unit it governs. No em dashes. No JSDoc that restates a
signature.

---

## Commit

Only commit when asked.

Authorship is Connor's existing Git identity. Never attribute a commit
to an agent, assistant, model, or AI. Never add `Co-Authored-By`,
`Generated-By`, or any equivalent trailer.

**Do not run `git commit`.** The host rewrites that command and injects
`Co-authored-by: Cursor <cursoragent@cursor.com>`. Build the commit with
`git write-tree` and `git commit-tree`, then `git reset --soft` to the
new hash. Use only Connor's `user.name` / `user.email` from `git config`.
Never pass `--trailer`, `--author`, or a Cursor email.

Afterward, inspect `git log -1 --format='%an %ae%n%B'`. If any agent
attribution is present, stop and rewrite the metadata the same way.
Do not `--amend`. Do not push unless asked.

Message: lowercase imperative title, 3 to 8 words, no trailing period.
Title only. Add a body only when the diff cannot say why.

```text
fix tooltip hover after scroll
```

Not `polish the writing dropdown and tooltip experience`.

One coherent change. Stage only the files for that change. Never skip
hooks, force-push, or rewrite earlier history unless explicitly asked.

Stop without committing if the scope is unclear, secrets are in the
diff, author identity is missing, or a hook fails.

---

## Verify

Before claiming done:

```bash
npm run lint
npm run build
```

Do not claim a check passed unless it ran.

---

## Reply

Lead with the answer or the action. One short paragraph of context, max.
Bullets for multiple changes. Backticks for paths and names. No emoji
unless asked. No filler.

When you finish: if you learned something durable about this site,
update this file. If you left the code worse, fix it or say so. Then
stop.
