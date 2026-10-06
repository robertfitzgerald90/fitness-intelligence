# Fitness Intelligence — Design System

**Status:** Visual direction v0.1  
**Design goal:** Premium fitness intelligence, not gym-bro software and not a clinical health portal.

## 1. Experience Personality

Fitness Intelligence should feel:

- Clean
- Modern
- Athletic
- Intelligent
- Calm
- Premium
- Data-rich without feeling dense
- Encouraging without being childish

Avoid:

- Neon overload
- Aggressive bodybuilding aesthetics
- Excessive gradients
- Gamification everywhere
- Medical/clinical visual language
- Giant walls of metrics
- AI sparkle icons on every card
- Shaming language

The interface should communicate: **your fitness data is organized, understandable, and working for you.**

## 2. Visual Philosophy

Use hierarchy before decoration.

The user should naturally see:

1. What matters most
2. What changed
3. What they can do now
4. Why it matters
5. Where to drill deeper

Cards should contain one clear idea. Dense analytics belong behind drill-downs rather than on Today.

## 3. Theme Strategy

Build semantic tokens so light/dark themes can evolve without rewriting components.

For the initial prototype, prioritize a polished **dark-first** experience while keeping tokens theme-safe.

Do not reference raw hex values throughout feature code. Components consume semantic tokens.

## 4. Color Tokens

Initial dark palette direction:

```ts
colors = {
  background: '#0B0D10',
  surface: '#12161B',
  surfaceElevated: '#181D24',
  surfaceSubtle: '#20262E',

  textPrimary: '#F7F9FC',
  textSecondary: '#AAB4C0',
  textMuted: '#727D8A',

  border: '#252C35',
  borderStrong: '#343D48',

  primary: '#5B8CFF',
  primaryPressed: '#4778EA',
  primarySubtle: '#17264A',

  positive: '#43C783',
  warning: '#F2B84B',
  negative: '#EF6A6A',
  info: '#66A3FF',

  strength: '#5B8CFF',
  run: '#43C783',
}
```

These values are a starting point, not sacred brand colors. Preserve semantic names even if visual tuning changes the values.

### Activity semantics

- **Blue = Strength**
- **Green = Running**

This mapping should remain consistent across Calendar, Progress, Today, and activity history.

Do not use positive green to imply that running is "better" than strength; context should make the semantic distinction clear.

## 5. Typography

Use the platform-appropriate modern sans-serif available through the chosen Expo setup. Avoid adding a custom font during the first prototype unless it materially improves the product.

Suggested type scale:

```text
Display       32 / 38  Bold
Title 1       26 / 32  Bold
Title 2       22 / 28  Semibold
Title 3       18 / 24  Semibold
Body          16 / 23  Regular
Body Strong   16 / 23  Semibold
Small         14 / 20  Regular
Caption       12 / 16  Medium
Metric Large  34 / 38  Bold / tabular numbers where available
Metric        24 / 28  Bold / tabular numbers where available
```

Rules:

- Large numbers should be easy to scan.
- Units are visually subordinate to values.
- Avoid excessive all-caps.
- Use bold selectively to establish hierarchy.
- Use tabular numerals for changing metrics where supported.

## 6. Spacing

Use a 4-point base system.

```ts
spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
}
```

Default screen horizontal padding: **20 px**.

Cards generally use **16–20 px** internal padding.

Use whitespace to separate concepts before adding borders/dividers.

## 7. Radius

```ts
radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
}
```

Primary dashboard cards should generally use `lg` or `xl`.

Buttons/chips may use pill shapes where appropriate, but the entire interface should not become pill-shaped.

## 8. Surfaces and Elevation

Dark mode should use subtle surface differences more than dramatic shadows.

Hierarchy:

```text
background
  → surface
    → surfaceElevated
```

Use borders sparingly. Avoid putting every item inside a bordered card.

## 9. Iconography

Use one consistent icon family supported cleanly by Expo.

Icons should be:

- Simple
- Rounded or neutral
- Recognizable at small sizes
- Consistent in stroke weight

Bottom navigation requires icons for:

- Today
- Train
- Calendar
- Progress
- You

Do not mix emoji with production iconography. Emoji may appear only in temporary mock content if explicitly desired.

## 10. Core Components

Build reusable primitives rather than styling every screen independently.

Initial component set:

```text
Screen
SectionHeader
Card
MetricCard
MetricRow
PrimaryButton
SecondaryButton
IconButton
Chip
ActivityBadge
TrendIndicator
ProgressBar / ScoreRing
InsightCard
RecommendationCard
QuickActionCard
EmptyState
```

Components should accept semantic variants rather than arbitrary styling props whenever practical.

## 11. Today Dashboard Pattern

Today should feel curated, not like a grid of every available metric.

Recommended hierarchy:

```text
Greeting / Today context
Fitness Score / trajectory
Weekly Snapshot
Today's Recommendation
Start Workout / Start Run
Fitness Intelligence insight
Recent Progress
Upcoming context
```

The most important action or recommendation gets the strongest visual emphasis.

### Fitness Score

The score is a summary, not a judgment.

Avoid language such as:

- Bad
- Failing
- Lazy
- Poor performance

Prefer:

- Improving
- Holding steady
- Recovery needs attention
- Training consistency is down this week

Any score should eventually be explainable.

## 12. Recommendation Card

A recommendation card should contain:

- Short recommendation title
- Key prescription/context
- One-sentence rationale
- Primary action
- `Why?` / `View Analysis` affordance when applicable

Example structure:

```text
TODAY'S RECOMMENDATION
Upper Body · 45 min

Your legs are still recovering and you haven't trained upper body in four days.

[ Start Workout ]       Why?
```

## 13. Insight Card

Insights should be concise enough to read at a glance.

Structure:

```text
FITNESS INTELLIGENCE
<observation>

View Analysis →
```

Insights should distinguish:

- Observation
- Trend
- Recommendation

Do not visually present uncertain AI inference as objective fact.

## 14. Metrics and Trends

Trend display should combine direction with context.

Good:

```text
Weekly Volume
17,420 lb
↑ 7% vs last week
```

Weak:

```text
17,420
+7
```

Never rely on color alone to communicate direction. Include arrows, labels, or text.

## 15. Calendar

Calendar should remain visually quiet.

Activity markers:

- Blue dot: strength
- Green dot: run
- Both dots: both activities

Dots should be small and aligned consistently beneath the date.

Selected dates receive a clear selection treatment without obscuring activity dots.

Do not fill every active date with a large colored block; the goal is seeing patterns across a month.

## 16. Workout Logging UX

Workout logging prioritizes speed over decoration.

For an exercise, immediately surface:

- Exercise name
- Previous relevant performance
- Current weight
- Current reps
- Log Set action
- Completed sets

Touch targets must be generous enough to operate during a workout.

Numeric input should minimize keyboard friction. Default values should intelligently reuse relevant prior values when appropriate.

## 17. Running UX

The active run screen should be extremely restrained.

Primary visual priority:

1. Distance
2. Time
3. Pace
4. Secondary metrics such as cadence

Controls for pausing/finishing should be unmistakable and easy to hit while moving.

Do not clutter the active run screen with analytics that are more useful after the run.

## 18. Charts

Charts exist to answer a question, not decorate a screen.

Rules:

- One primary story per chart.
- Clear time range.
- Clear units.
- Minimal grid lines.
- Avoid 3D effects.
- Avoid unnecessary legends.
- Highlight the current/relevant series.
- Support touch inspection later where valuable.

Strength and running retain their activity semantic colors when those meanings apply.

## 19. Motion

Motion should reinforce state changes rather than show off.

Potential uses:

- Card expansion
- Score/progress reveal
- Tab transitions
- Successful set logging
- Calendar date selection
- Chart range transitions

Animations should be quick and interruptible. Respect reduced-motion accessibility settings when implementation reaches that stage.

## 20. Content Voice

Fitness Intelligence speaks like a capable coach who respects the user.

Voice should be:

- Concise
- Specific
- Calm
- Evidence-aware
- Encouraging without cheerleading

Prefer:

> Your bench volume has increased for three weeks. Hold the current weight and target one additional rep before increasing load.

Avoid:

> AMAZING JOB!!! You're absolutely CRUSHING IT! 🔥💪

Also avoid shame-based language when adherence declines.

## 21. Accessibility

Even during prototype work:

- Maintain reasonable contrast.
- Use readable text sizes.
- Use generous touch targets.
- Do not encode meaning using color alone.
- Support dynamic content without layouts immediately breaking.
- Add accessible labels to icon-only controls as they become functional.

## 22. Prototype Design Rule

The first prototype should look polished, but polish must serve information hierarchy.

When deciding whether to add another visual element, ask:

> **Does this help the user understand their fitness or decide what to do next?**

If not, remove it.
