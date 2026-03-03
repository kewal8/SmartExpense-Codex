# SmartExpense — UI Redesign Brief
# Migrating from Codex to Claude Code
# Last updated: March 2026

---

## CONTEXT
This project was previously built using Codex. We are now doing a full UI
redesign using Claude Code. The business logic, API routes, database schema,
and auth are all finalized and must not be touched. This is a visual-only
transformation.

---

## ABSOLUTE RULES — READ BEFORE EVERY TASK

### NEVER touch these:
- /src/app/api/** — all API routes
- /src/lib/** — all utilities and helpers
- /prisma/** — schema and migrations
- /src/hooks/** — all custom hooks
- Any file containing: useSession, getServerSession, NextAuth config
- Any zod schema or validation logic
- Any react-query (useQuery, useMutation) logic
- Any form submission handlers (onSubmit, handleSubmit)
- Any data fetching logic whatsoever

### ONLY change these:
- Tailwind classNames on JSX elements
- /src/app/globals.css — CSS variables and base styles
- /tailwind.config.ts — color tokens, font, spacing scale
- Animation/transition classes using Framer Motion props
- Layout structure (divs, sections) — only if purely cosmetic
- Icon swaps using Lucide React (same meaning, better visual fit)

### WHEN IN DOUBT:
Do not change it. Ask first.

---

## FRONTEND AESTHETICS — CORE PRINCIPLES
# Adapted from Anthropic's DISTILLED_AESTHETICS_PROMPT
# Applied specifically to SmartExpense's design direction

### WHAT MAKES UI LOOK AI-GENERATED (NEVER DO THESE)
- Default font stacks: Inter, Roboto, Arial, system-ui as the primary font
- Purple gradient on white/light backgrounds as the hero element
- Generic card grid with identical padding and equal visual weight everywhere
- Evenly distributed pastel color palette with no dominant hue
- Rounded pill buttons as the default for every action
- Decorative gradients that serve no structural purpose
- Emoji used in place of proper icons
- Every section having the same visual treatment — no hierarchy
- Animations scattered randomly rather than orchestrated on load
- Shadows that are either completely flat or absurdly heavy

### TYPOGRAPHY — NON-NEGOTIABLE
- Primary font: Bricolage Grotesque — load from Google Fonts, always
- Mono font: Geist Mono — for ALL numbers, amounts, dates, codes
- Never mix more than 2 typefaces in the same view
- Size contrast must be strong: display sizes (28–40px) vs body (13–14px)
  — the gap creates hierarchy, not heading tags alone
- Letter-spacing on large amounts: tight (-1px to -2px)
- Letter-spacing on labels/caps: open (0.06em to 0.1em)
- Font weight must span the full range available (300–800)
  — don't stay in the 400–600 comfort zone

### COLOR — NON-NEGOTIABLE
- One dominant accent (#5b4ff5 light / #7c6af7 dark) — used sparingly
- Semantic colors are STRICT: red = bad, green = good, amber = warning
  — never use these decoratively
- Backgrounds have subtle tinting — never pure #fff or pure #000
- Dark mode is not "invert light mode" — it has its own depth layers
- The sidebar is always dark (#17161e) regardless of app theme
- Color used in <10% of the UI surface area — everything else is greyscale

### SPATIAL COMPOSITION
- Sections feel like zones, not lists — use background fills to group
- Cards float — they have shadow AND subtle border, not just one
- Generous padding inside cards (16–20px) — cramped = untrustworthy for finance
- Section labels are small, uppercase, muted — they orient without competing
- The most important number on each screen should be visually dominant
  — everything else supports it, nothing competes with it
- Asymmetry is allowed — the hero stat card being larger than others is intentional

### MOTION — QUALITY OVER QUANTITY
- One well-orchestrated entrance animation beats 10 random micro-interactions
- Page load: staggered fadeUp (y: 14px → 0, opacity 0 → 1)
  delays: 0.04s, 0.08s, 0.12s, 0.16s... per section
- Hover: cards lift by 1–2px with shadow increase (0.2s ease)
- Tap (mobile): scale(0.95–0.96) for 0.1s — feels physical
- Theme toggle: all color transitions at 0.25–0.3s ease — never instant
- No bounce, no spring on functional UI — only on celebratory moments
- Framer Motion for all animations — no CSS keyframes on interactive elements

### DEPTH SYSTEM (light mode)
Layer 1 — page background:  #f0eff5  (faint warm violet tint)
Layer 2 — section fill:     #e8e7ef  (slightly darker, groups content)
Layer 3 — card surface:     #ffffff  (pure white, elevated by shadow)
Layer 4 — sidebar:          #17161e  (always dark, anchors the layout)
Shadow ties layers 2→3 together — without it cards feel pasted on

### DEPTH SYSTEM (dark mode)
Layer 1 — page background:  #0f0e13  (deep near-black)
Layer 2 — section fill:     #1e1b28  (slightly lighter, groups content)
Layer 3 — card surface:     #252230  (elevated, visible border)
Layer 4 — card hover:       #2c2938  (feedback state)
Border ties layers 2→3 in dark mode — shadows are less visible on dark

### WHAT GOOD LOOKS LIKE FOR SMARTEXPENSE
- Open the app: you immediately see one dominant number (total spent)
- The layout has clear zones — you know what each section is for
- Numbers feel trustworthy: monospace, right-aligned, tabular
- Color means something: you see red and know something needs attention
- Light and dark mode both feel intentional — not one being an afterthought
- On mobile it feels like a real installed app, not a website in a browser
- On desktop it feels like a professional SaaS tool, not a CRUD dashboard

---

## TECH STACK (already installed — do not add packages)

- Next.js 15 + React 19 (App Router)
- Tailwind CSS v3 — classes only, zero inline styles
- Framer Motion v12 — for all animations
- Lucide React — for all icons
- next-themes — dark/light mode already wired
- Radix UI — headless, restyle only, never restructure
- Recharts — for all charts, restyle colors and containers only
- react-hook-form — logic only, never touch
- @tanstack/react-query — logic only, never touch

---

## THEME SYSTEM

The app has ONE design direction with TWO layout contexts.
Both contexts support a user-controlled light/dark mode toggle.
next-themes is already installed and wired — use it for all theme switching.

### THE ONE DESIGN DIRECTION
- Modern SaaS on web (sectioned layout, floating cards, visual grouping)
- Native app feel on mobile (hero balance, pill actions, bottom nav)
- Same color palette, same fonts, same components — just different layouts

### LIGHT/DARK TOGGLE
Available on BOTH web and mobile. User can switch anytime.
The toggle must be visible and accessible on all screen sizes.
- Web: place toggle in the topbar (top right)
- Mobile: place toggle in the app header (top right, next to notification bell)
- Use next-themes useTheme() hook — already installed, do not re-implement

---

## COLOR TOKENS

Implement as CSS variables in globals.css using [data-theme] or .dark class.
next-themes applies 'dark' class to <html> — use Tailwind dark: variants.

### LIGHT MODE
```css
--bg:             #f0eff5
--bg-deep:        #e8e7ef
--card:           #ffffff
--card-2:         #faf9f7
--sidebar:        #17161e
--sidebar-border: rgba(255,255,255,0.06)
--border:         rgba(0,0,0,0.07)
--border-light:   rgba(0,0,0,0.04)
--ink:            #111018
--ink-2:          #2d2c38
--ink-3:          #6b6a7a
--ink-4:          #9998a8
--ink-5:          #c5c4d0
--accent:         #5b4ff5
--accent-2:       #7c6af7
--accent-soft:    #f0eefe
--accent-border:  #c5befc
--accent-glow:    rgba(91,79,245,0.15)
--red:            #e03131
--red-soft:       #fff0f0
--red-border:     #ffd0d0
--green:          #2f9e44
--green-soft:     #f0fff4
--green-border:   #b2f2bb
--amber:          #e67700
--amber-soft:     #fff8e1
--amber-border:   #ffe08a
--shadow-card:    0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)
--shadow-float:   0 2px 8px rgba(0,0,0,0.05), 0 8px 28px rgba(0,0,0,0.09)
--shadow-hover:   0 4px 12px rgba(0,0,0,0.07), 0 16px 40px rgba(0,0,0,0.12)
```

### DARK MODE (.dark class on <html>)
```css
--bg:             #0f0e13
--bg-deep:        #17151f
--card:           #252230
--card-2:         #2c2938
--sidebar:        #0d0c11
--sidebar-border: rgba(255,255,255,0.05)
--border:         rgba(255,255,255,0.07)
--border-light:   rgba(255,255,255,0.04)
--ink:            #f2f0f8
--ink-2:          #b8b5cc
--ink-3:          #6e6b84
--ink-4:          #3f3c52
--ink-5:          #2a2838
--accent:         #7c6af7
--accent-2:       #9d8ff9
--accent-soft:    rgba(124,106,247,0.12)
--accent-border:  rgba(124,106,247,0.25)
--accent-glow:    rgba(124,106,247,0.2)
--red:            #f87171
--red-soft:       rgba(248,113,113,0.12)
--red-border:     rgba(248,113,113,0.2)
--green:          #34d399
--green-soft:     rgba(52,211,153,0.12)
--green-border:   rgba(52,211,153,0.2)
--amber:          #fbbf24
--amber-soft:     rgba(251,191,36,0.12)
--amber-border:   rgba(251,191,36,0.2)
--shadow-card:    0 1px 3px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.25)
--shadow-float:   0 2px 8px rgba(0,0,0,0.3), 0 8px 28px rgba(0,0,0,0.35)
--shadow-hover:   0 4px 12px rgba(0,0,0,0.4), 0 16px 40px rgba(0,0,0,0.45)
```

---

## LAYOUT CONTEXTS

Two layouts, same theme system. Breakpoint: 768px.

### WEB LAYOUT (> 768px)
Feel: Modern SaaS — Linear, Vercel, Stripe
- Dark sidebar (always dark regardless of light/dark mode)
- Topbar with breadcrumb + period selector + theme toggle
- Page content: sectioned layout with section wrappers
- Section wrappers: soft bg (--bg-deep), border-radius 20px, padding 16px
- Floating white/dark cards inside sections
- Stats: 4-column grid
- Actions: 3-column row
- Content: two-column (main + right sidebar)
- No flat list-based layouts anywhere

### MOBILE LAYOUT (≤ 768px)
Feel: Native fintech app — Revolut, CRED, Groww
- No sidebar
- App header: logo left, search + notification + theme toggle right
- Hero balance card: full-width, top of screen, dominant number
- Quick actions: icon pill row, horizontal scroll
- Stats: horizontal scrollable cards (150px fixed width each)
- Transactions: full-width list, grouped by date
- Bottom nav: 5 items, raised floating center + button
- Touch targets: minimum 44px on all interactive elements
- Active states: scale(0.96) on tap

### SHARED LAYOUT RULES
- Sidebar is always dark (#17161e) on web — does not change with theme
- All other surfaces respond to light/dark toggle
- Font: Bricolage Grotesque for all UI text
- Numbers/amounts: Geist Mono, tabular-nums, tight letter-spacing
- ₹ symbol always slightly smaller and lighter than the number itself
- Icons: SVG line icons, 1.5–1.8px stroke, Lucide React only
- No emoji in UI
- No Inter, Roboto, Arial, or system fonts anywhere

---

## ANTI AI-SLOP RULES

These apply to every single component:

- No full-width rounded pill buttons (use contained, purposeful shapes)
- No purple gradient on white backgrounds
- No generic card grid with equal padding everywhere
- No evenly distributed pastel color scheme
- No decorative gradients that serve no purpose
- No emoji icons in place of proper SVG icons
- Typography must have strong contrast between display and body sizes
- One well-orchestrated page load animation beats 10 random micro-interactions
- Animations: staggered fadeUp (translateY 12–16px), 0.4s ease, delays 0.04–0.3s
- Every section must feel intentional — not like a list that grew

---

## COLOR TOKENS — implement in globals.css and tailwind.config.ts

### Light Mode (web)
```
--bg:           #f0eff5
--bg-deep:      #e8e7ef
--surface:      #faf9f7
--surface-2:    #f0ede9
--card:         #ffffff
--sidebar:      #17161e
--border:       rgba(0,0,0,0.07)
--border-light: rgba(0,0,0,0.04)
--ink:          #111018
--ink-2:        #2d2c38
--ink-3:        #6b6a7a
--ink-4:        #9998a8
--ink-5:        #c5c4d0
--accent:       #5b4ff5
--accent-soft:  #f0eefe
--accent-border:#c5befc
--red:          #e03131
--red-soft:     #fff0f0
--green:        #2f9e44
--green-soft:   #f0fff4
--amber:        #e67700
--amber-soft:   #fff8e1
```

### Dark Mode (mobile PWA)
```
--bg:           #0f0e13
--bg-2:         #17151f
--section:      #1e1b28
--card:         #252230
--card-2:       #2c2938
--border:       rgba(255,255,255,0.07)
--border-2:     rgba(255,255,255,0.04)
--ink:          #f2f0f8
--ink-2:        #b8b5cc
--ink-3:        #6e6b84
--ink-4:        #3f3c52
--accent:       #7c6af7
--accent-2:     #9d8ff9
--accent-glow:  rgba(124,106,247,0.2)
--accent-soft:  rgba(124,106,247,0.12)
--red:          #f87171
--red-soft:     rgba(248,113,113,0.12)
--green:        #34d399
--green-soft:   rgba(52,211,153,0.12)
--amber:        #fbbf24
--amber-soft:   rgba(251,191,36,0.12)
```

---

## TYPOGRAPHY

Load from Google Fonts in layout.tsx (already done or add if missing):
```
Bricolage Grotesque: 300, 400, 500, 600, 700, 800
Geist Mono: 400, 500, 600
```

### Scale
- Page title (web):     26–28px, weight 700, tracking -0.6px
- Section label:        10–11px, weight 700, uppercase, tracking 0.08em
- Card title:           13.5–14px, weight 700, tracking -0.2px
- Body text:            13–14px, weight 400–500
- Metadata/labels:      11–12px, Geist Mono
- Hero amount (mobile): 36–40px, Geist Mono, weight 600, tracking -2px
- Stat values:          20–26px, Geist Mono, weight 600, tracking -1px
- Small amounts:        13–14px, Geist Mono, weight 500–600

---

## COMPONENT PATTERNS

### Stat Card (web)
- White card, 1px border, border-radius 14px
- Subtle box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)
- 2px colored top bar (red/amber/green/accent) for semantic meaning
- Hover: translateY(-1px), shadow increase
- Hero stat card: filled with accent color

### Stat Card (mobile)
- Dark card bg #252230, 1px border rgba(255,255,255,0.07)
- Border radius 18px
- 2px colored top bar same as web
- Width: 150px fixed, horizontal scroll container

### Transaction Row
- Min height: 44px (touch target)
- Icon: 32–40px, rounded 8–10px, colored bg matching category
- Amount: Geist Mono, right-aligned
- Meta: Geist Mono, 11px, muted color
- Separator: 1px border-bottom, very low opacity
- Hover/active: subtle background shift

### Action Buttons (web)
- Primary: accent bg, white text, radius 8–10px, accent shadow
- Ghost: white bg, 1px border, ink-3 text
- Never full-width pill shape

### Action Pills (mobile)
- Icon container: 56–60px square, radius 14px
- Label below: 11px, centered, two lines ok
- Horizontal scroll row, no scrollbar visible
- Primary action: accent bg with glow shadow

### Bottom Nav (mobile)
- Height: 72px
- 5 items max
- Center item: raised floating + button, 52px, accent bg, glow shadow
- Active indicator: small dot below label
- Background: dark surface + backdrop-filter blur

### Section Wrapper (web)
- Background: --bg-deep or --section
- Border-radius: 20px
- Padding: 16px
- 1px border very low opacity
- Section label above content: uppercase, muted

### Charts (Recharts)
- Background: match card bg
- Bars: accent color for active, accent-soft for inactive
- Axis labels: Geist Mono, ink-4 color
- Tooltip: card bg, border, shadow
- No default Recharts styling — override everything

---

## PAGE-BY-PAGE REDESIGN ORDER

Work through these in sequence. Complete and verify each before moving on.

1. globals.css + tailwind.config.ts
   → Establish all CSS variables, font imports, base resets
   → This is the foundation — get it right before touching components

2. layout.tsx (root)
   → Import fonts, apply bg color, set up next-themes wrapper
   → Desktop: sidebar + main layout shell
   → Mobile: no sidebar, bottom nav placeholder

3. Sidebar component (desktop only)
   → Dark bg #17161e, nav items, user pill at bottom
   → Active state: accent-dim bg + accent border

4. Bottom nav component (mobile only)
   → 5 items, raised center + button
   → next-themes aware

5. Dashboard page
   → Web: hero stats grid → action row → two-col content
   → Mobile: hero balance → action pills → horizontal stat cards → transactions

6. Transactions / Expenses page
   → Table on web (sectioned, floating)
   → List on mobile (full-width rows, grouped by date)

7. Analytics / Reports page
   → Recharts reskin (colors, containers, labels)
   → Category breakdown bars

8. EMIs page
   → Card-based layout, due date prominence

9. Khata (Lending/Borrowing) page
   → Clear lend vs borrow visual distinction

10. Auth pages (login, register)
    → Centered card, clean, minimal

11. Forms and Modals
    → Input styling, select styling, dialog container

12. PWA-specific
    → Install prompt, offline state, splash screen

---

## ANIMATION SYSTEM

Use Framer Motion for all animations.

### Page load stagger (apply to sections/cards):
```jsx
initial={{ opacity: 0, y: 14 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.4, ease: 'easeOut', delay: 0.04 * index }}
```

### Card hover (web):
```jsx
whileHover={{ y: -2, boxShadow: '0 8px 28px rgba(0,0,0,0.12)' }}
transition={{ duration: 0.2 }}
```

### Button tap (mobile):
```jsx
whileTap={{ scale: 0.95 }}
transition={{ duration: 0.1 }}
```

### List items stagger:
```jsx
// Wrap list in motion.div with staggerChildren: 0.05
// Each item: initial opacity 0, y 8 → animate opacity 1, y 0
```

---

## STARTING PROMPT FOR CLAUDE CODE

When you open Claude Code in VS Code, paste this as your first message:

```
Read CLAUDE.md fully before doing anything.

Then read these files without changing them:
- src/app/globals.css
- tailwind.config.ts
- src/app/layout.tsx
- src/components/ (all files — just read)
- src/app/(protected)/dashboard/page.tsx

Confirm you understand:
1. The current structure
2. The dual theme system (light web / dark mobile)
3. What must never be touched

Then wait for my instruction to begin.
First task will be: globals.css + tailwind.config.ts only.
```

---

## REFERENCE DESIGNS

Web dashboard feel: linear.app, vercel.com, clerk.com
Mobile app feel: Revolut app, CRED app, Groww app

Currency: always ₹ (Indian Rupee)
Number format: Indian — ₹1,00,000 not ₹100,000
```
