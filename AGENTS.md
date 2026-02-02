# Web Interface Guidelines

A structured reference for creating and maintaining high-quality React/Next.js interfaces. These guidelines are optimized for AI agents and LLMs.

## Interactions

- **Keyboard works everywhere.** All flows are keyboard-operable & follow WAI-ARIA Authoring Patterns.
- **Clear focus.** Every focusable element shows a visible focus ring. Prefer `:focus-visible` over `:focus`. Set `:focus-within` for grouped controls.
- **Manage focus.** Use focus traps, move & return focus according to WAI-ARIA Patterns.
- **Match visual & hit targets.** If visual target is < 24px, expand hit target to >= 24px. On mobile, minimum size is 44px.
- **Mobile input size.** `<input>` font size >= 16px on mobile to prevent iOS Safari auto-zoom.
- **Respect zoom.** Never disable browser zoom.
- **Hydration-safe inputs.** Inputs must not lose focus or value after hydration.
- **Don't block paste.** Never disable paste in `<input>` or `<textarea>`.
- **Loading buttons.** Show loading indicator & keep original label.
- **Minimum loading-state duration.** Add show-delay (~150-300ms) & minimum visible time (~300-500ms) to avoid flicker.
- **URL as state.** Persist state in URL for share, refresh, Back/Forward navigation.
- **Optimistic updates.** Update UI immediately when success is likely; reconcile on server response.
- **Ellipsis for further input & loading states.** "Rename...", "Loading...", "Saving..."
- **Confirm destructive actions.** Require confirmation or provide Undo.
- **Prevent double-tap zoom.** Set `touch-action: manipulation`.
- **Deep-link everything.** Filters, tabs, pagination, expanded panels.
- **Links are links.** Use `<a>` or `<Link>` for navigation.
- **Announce async updates.** Use polite `aria-live` for toasts & inline validation.

## Animations

- **Honor prefers-reduced-motion.** Provide reduced-motion variant.
- **Implementation preference.** CSS > Web Animations API > JavaScript libraries.
- **Compositor-friendly.** Prioritize GPU-accelerated properties (`transform`, `opacity`).
- **Necessity check.** Only animate when it clarifies cause & effect or adds deliberate delight.
- **Easing fits the subject.** Choose easing based on what changes.
- **Interruptible.** Animations are cancelable by user input.
- **Input-driven.** Avoid autoplay; animate in response to actions.
- **Correct transform origin.** Anchor motion to where it "physically" starts.
- **Never `transition: all`.** Explicitly list only properties you intend to animate.

## Layout

- **Optical alignment.** Adjust +/-1px when perception beats geometry.
- **Deliberate alignment.** Every element aligns with something intentionally.
- **Balance contrast in lockups.** Adjust weight, size, spacing, or color for text & icons.
- **Responsive coverage.** Verify on mobile, laptop, & ultra-wide.
- **Respect safe areas.** Account for notches & insets with safe-area variables.
- **No excessive scrollbars.** Fix overflow issues to prevent unwanted scrollbars.
- **Let the browser size things.** Prefer flex/grid/intrinsic layout over measuring in JS.

## Content

- **Inline help first.** Prefer inline explanations; use tooltips as last resort.
- **Stable skeletons.** Skeletons mirror final content exactly to avoid layout shift.
- **Accurate page titles.** `<title>` reflects current context.
- **No dead ends.** Every screen offers a next step or recovery path.
- **All states designed.** Empty, sparse, dense, & error states.
- **Tabular numbers for comparisons.** Use `font-variant-numeric: tabular-nums`.
- **Redundant status cues.** Don't rely on color alone; include text labels.
- **Icons have labels.** Convey the same meaning with text for non-sighted users.
- **Use the ellipsis character.** `...` over three periods `...`.
- **Anchored headings.** Set `scroll-margin-top` for headers when linking to sections.
- **Resilient to user-generated content.** Handle short, average, & very long content.
- **Locale-aware formats.** Format dates, times, numbers, currencies for user's locale.

## Forms

- **Enter submits.** When text input is focused, Enter submits if it's the only control.
- **Textarea behavior.** Cmd/Ctrl+Enter submits; Enter inserts new line.
- **Labels everywhere.** Every control has a `<label>` or is associated with one.
- **Label activation.** Clicking a `<label>` focuses the associated control.
- **Submission rule.** Keep submit enabled until submission starts; then disable during request.
- **Don't block typing.** Allow any input & show validation feedback.
- **Don't pre-disable submit.** Allow submitting incomplete forms to surface validation.
- **No dead zones on controls.** Checkboxes & radios share generous hit target with label.
- **Error placement.** Show errors next to fields; on submit, focus first error.
- **Autocomplete & names.** Set `autocomplete` & meaningful `name` values.
- **Spellcheck selectively.** Disable for emails, codes, usernames.
- **Correct types & input modes.** Use right `type` & `inputmode` for better keyboards.
- **Placeholders signal emptiness.** End with ellipsis.
- **Unsaved changes.** Warn before navigation when data could be lost.

## Performance

- **Device/browser matrix.** Test iOS Low Power Mode & macOS Safari.
- **Track re-renders.** Minimize & make re-renders fast.
- **Throttle when profiling.** Test with CPU & network throttling.
- **Minimize layout work.** Batch reads/writes; avoid unnecessary reflows.
- **Network latency budgets.** POST/PATCH/DELETE complete in <500ms.
- **Keystroke cost.** Prefer uncontrolled inputs; make controlled loops cheap.
- **Large lists.** Virtualize large lists.
- **Preload wisely.** Preload only above-the-fold images; lazy-load the rest.
- **No image-caused CLS.** Set explicit image dimensions & reserve space.
- **Preconnect to origins.** Use `<link rel="preconnect">` for asset/CDN domains.
- **Preload fonts.** For critical text to avoid flash & layout shift.
- **Subset fonts.** Ship only code points/scripts you use.

## Design

- **Layered shadows.** Mimic ambient + direct light with at least two layers.
- **Crisp borders.** Combine borders & shadows; semi-transparent borders improve clarity.
- **Nested radii.** Child radius <= parent radius & concentric so curves align.
- **Hue consistency.** On non-neutral backgrounds, tint borders/shadows/text toward same hue.
- **Accessible charts.** Use color-blind-friendly palettes.
- **Minimum contrast.** Prefer APCA over WCAG 2 for more accurate perceptual contrast.
- **Interactions increase contrast.** `:hover`, `:active`, `:focus` have more contrast.
- **Browser UI matches background.** Set `<meta name="theme-color">`.
- **Set appropriate color-scheme.** Style `<html>` with `color-scheme: dark` for dark themes.

---

## React Best Practices

### Eliminating Waterfalls
- Fetch data in parallel when possible
- Use `Promise.all` for independent requests
- Implement data prefetching

### Bundle Size Optimization
- Use dynamic imports for code splitting
- Tree-shake unused dependencies
- Analyze bundle with tools like `@next/bundle-analyzer`

### Server-Side Performance
- Use React Server Components where appropriate
- Implement streaming SSR
- Cache expensive computations

### Client-Side Data Fetching
- Use SWR or React Query for data fetching
- Implement optimistic updates
- Handle loading and error states

### Re-render Optimization
- Use `useMemo` for expensive computations
- Use `useCallback` for stable function references
- Avoid inline object/array literals in props
- Use refs for values that don't need re-renders

### Rendering Performance
- Virtualize long lists
- Use `content-visibility: auto` for off-screen content
- Avoid layout thrashing

### JavaScript Performance
- Prefer CSS over JS for animations
- Move expensive work to Web Workers
- Use `requestIdleCallback` for non-urgent work

---

## Project-Specific Notes

### This Calculator

**Implemented:**
- `prefers-reduced-motion` support
- Improved contrast ratios for labels
- `tabular-nums` for metric values
- `touch-action: manipulation` on buttons
- Dark `color-scheme` for proper scrollbar styling
- `theme-color` meta tag

**Color Palette:**
- Primary: `#00ff84` (green)
- Scaling: `#8b5cf6` / `#a78bfa` (purple)
- Background: `#050508`
- Surface: `rgba(255, 255, 255, 0.03-0.06)`

**Border Radii:**
- Cards: 16-20px
- Inputs: 12px
- Buttons: 100px (pill)

**Chart Colors (colorblind-friendly):**
- Current: `#9ca3af` (light gray)
- Improved: `#00ff84` (green)
- Scaled: `#a78bfa` (light purple)

---

## UI Audit Framework

Based on "Making UX Decisions" by Tommy Geoco. Use for evaluating interfaces.

### The 3 Pillars of Fast Decisioning

1. **Scaffolding** - Rules for automating recurring decisions
2. **Decisioning** - Process for new decisions
3. **Crafting** - Checklists for executing decisions

### Decision Workflow

```
1. WEIGH INFORMATION
   ├─ Institutional knowledge (existing patterns, brand, tech)
   ├─ User familiarity (conventions, competitor patterns)
   └─ Research (user testing, analytics, studies)

2. NARROW OPTIONS
   ├─ Eliminate conflicts with constraints
   ├─ Prioritize alignment with macro bets
   └─ Choose based on JTBD support

3. EXECUTE
   └─ Apply relevant checklist + patterns
```

### Macro Bet Categories

| Bet | Description | Design Implication |
|-----|-------------|-------------------|
| **Velocity** | Features to market faster | Reuse patterns, find metaphors |
| **Efficiency** | Manage waste better | Design systems, reduce WIP |
| **Accuracy** | Be right more often | Stronger research, instrumentation |
| **Innovation** | Discover untapped potential | Novel patterns, cross-domain |

### Audit Sections

**Always Include:**
1. Visual Hierarchy - Headings, CTAs, grouping, reading flow
2. Visual Style - Spacing, color, elevation, typography, motion
3. Accessibility - Keyboard nav, focus, contrast, touch targets

**Include When Relevant:**
4. Navigation - Wayfinding, breadcrumbs, menus
5. Usability - Discoverability, feedback, error handling
6. Onboarding - First-run, tutorials, progressive disclosure
7. Social Proof - Testimonials, trust signals
8. Forms - Labels, validation, error messages

### Check Statuses
- `pass` - Meets standards
- `warn` - Needs improvement but functional
- `fail` - Critical issue
- `na` - Not applicable

### Key Principle

> A design decision is "good" when it supports the product's JTBD, aligns with macro bets, respects constraints, and balances familiarity with differentiation.

---

## React Best Practices (Vercel)

40+ rules across 8 categories for React/Next.js performance optimization.

### 1. Eliminating Waterfalls (CRITICAL)

Waterfalls are the #1 performance killer. Each sequential `await` adds full network latency.

**Patterns:**
- Defer `await` operations until actually needed
- Use `Promise.all()` for independent operations
- Strategic Suspense boundaries to avoid blocking entire layouts
- Use dependency-based parallelization with libraries like `better-all`

```typescript
// BAD: Sequential (waterfall)
const user = await getUser();
const posts = await getPosts(user.id);

// GOOD: Parallel when possible
const [user, config] = await Promise.all([getUser(), getConfig()]);
const posts = await getPosts(user.id); // Only this needs user
```

### 2. Bundle Size Optimization (CRITICAL)

Avoid barrel file imports - they can load thousands of unused modules.

**Patterns:**
- Direct imports over barrel files
- Use Next.js 13.5+ `optimizePackageImports`
- Conditional module loading
- Dynamic imports for heavy components

```typescript
// BAD: Barrel import (loads everything)
import { Button } from '@/components';

// GOOD: Direct import
import { Button } from '@/components/ui/Button';
```

### 3. Server-Side Performance (HIGH)

- Always authenticate Server Actions internally (not just middleware)
- Minimize serialization at RSC boundaries
- Use `React.cache()` for per-request deduplication
- Implement `after()` for non-blocking operations (logging, analytics)

### 4. Client-Side Data Fetching (MEDIUM-HIGH)

- Use SWR for automatic deduplication across component instances
- Use passive event listeners for scroll performance
- Version and minimize localStorage data

```typescript
// SWR deduplication
const { data } = useSWR('/api/user', fetcher);
// Multiple components calling this share the same request
```

### 5. Re-render Optimization (MEDIUM)

- Calculate derived state during rendering (not in effects)
- Use functional `setState` updates to prevent stale closures
- Extract expensive work into memoized components
- Use `useTransition` for non-urgent updates

```typescript
// BAD: Derived state in effect
const [items, setItems] = useState([]);
const [total, setTotal] = useState(0);
useEffect(() => setTotal(items.reduce(...)), [items]);

// GOOD: Derived during render
const [items, setItems] = useState([]);
const total = items.reduce((sum, item) => sum + item.price, 0);
```

### 6. Rendering Performance (MEDIUM)

- CSS `content-visibility: auto` for long lists (10x faster)
- Hoist static JSX to avoid recreation
- Use explicit conditional rendering

```css
.offscreen-section {
  content-visibility: auto;
  contain-intrinsic-size: 0 500px;
}
```

### 7. JavaScript Performance (LOW-MEDIUM)

- Avoid layout thrashing (batch DOM reads/writes)
- Build index maps for repeated lookups: O(n) → O(1)
- Use `Set`/`Map` instead of array `.includes()`
- Prefer loops over `.sort()` for finding min/max
- Use `.toSorted()` instead of `.sort()` for immutability

```typescript
// BAD: O(n) lookup on every check
items.filter(item => selectedIds.includes(item.id));

// GOOD: O(1) lookup with Set
const selectedSet = new Set(selectedIds);
items.filter(item => selectedSet.has(item.id));
```

### 8. Advanced Patterns (LOW)

- Initialize app once using module-level guards
- Store event handlers in refs for stable subscriptions
- Use `useEffectEvent` for accessing latest values without re-runs

### React Compiler Note

Many of these optimizations become unnecessary with **React Compiler** enabled, which automatically handles memoization and re-render optimization.

### Quick Reference Table

| Category | Impact | Key Action |
|----------|--------|------------|
| Waterfalls | CRITICAL | Use `Promise.all()` for parallel fetches |
| Bundle Size | CRITICAL | Direct imports, no barrel files |
| Server-Side | HIGH | Authenticate in Server Actions |
| Client Fetch | MEDIUM-HIGH | Use SWR for deduplication |
| Re-renders | MEDIUM | Derive state during render |
| Rendering | MEDIUM | Use `content-visibility: auto` |
| JS Perf | LOW-MEDIUM | Use Set/Map for lookups |
| Advanced | LOW | Module-level initialization |
