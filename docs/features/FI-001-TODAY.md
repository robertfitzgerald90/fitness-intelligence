# FI-001 — Today Dashboard

**Product:** Fitness Intelligence  
**Feature ID:** FI-001  
**Status:** Approved for Prototype  
**Priority:** P0  
**Surface:** Mobile / Today  
**Dependencies:** `PRODUCT.md`, `ARCHITECTURE.md`, `DESIGN_SYSTEM.md`

---

## 1. Feature Objective

Build the first meaningful vertical slice of Fitness Intelligence: the **Today dashboard**.

Today should answer two questions within seconds:

1. **What did I do last time?**
2. **What should I do today?**

The screen should motivate action without judging the user. It should feel like a calm, knowledgeable training companion—not a scorecard, guilt engine, or wall of analytics.

This feature establishes the product's visual language, information hierarchy, dashboard component model, and early recommendation experience.

---

## 2. Product Principle

### Do not grade the person.

FI-001 must **not** display a universal fitness score.

A numerical score can imply that the application is judging the user's fitness, discipline, or worth. That is contrary to the desired product experience.

Fitness Intelligence should instead emphasize:

- Progress
- Direction
- Context
- Achievements
- Useful next actions
- Encouragement after inactivity
- Personal comparison against the user's own history

The product may eventually use internal metrics or specialized indicators, but Today should not open with a number implying:

> "You are 42/100 at fitness."

The application should help users feel capable of taking the next useful action regardless of their current state.

---

## 3. Primary User Story

> As a user opening Fitness Intelligence before training, I want to immediately see what I did last time and what I should do today so that I can begin training without figuring everything out myself.

Secondary user stories:

> As a user, I want to see evidence that I am progressing so that my history feels meaningful.

> As a user, I want my dashboard to reflect the fitness information that matters to me.

> As a returning user after inactivity, I want encouragement and a clear path back rather than guilt.

---

## 4. Experience Target

Today should feel:

- Premium
- Minimal
- Dark
- Calm
- Conversational
- Motivational
- Highly polished
- Data-informed
- Personal

Visual inspiration is closer to a premium SaaS product combined with minimal Apple-like mobile design and a dark gym aesthetic than a traditional dense workout tracker.

Avoid:

- Excessive gradients
- Neon "gamer" styling
- Dense dashboards
- Giant data tables
- Aggressive motivational language
- Shame-based streak mechanics
- Excessive badges
- Gamification clutter
- AI branding everywhere

The intelligence should feel embedded in the product.

---

## 5. Navigation Context

The primary application navigation is:

**Today | Train | Calendar | Progress | You**

FI-001 implements the Today surface and the navigation shell necessary to display it.

For this prototype, non-Today destinations may initially be lightweight placeholder screens if their dedicated feature has not yet been implemented.

Today is the default landing destination.

---

# 6. Today Information Hierarchy

Today should initially contain **four primary content areas**.

The order is intentional.

## 6.1 Greeting / Context Header

Purpose:

Establish a personal, relaxed entry into the application.

Example:

**Good evening, Robert**

*Ready to get after it?*

The greeting should adapt to time of day when practical:

- Good morning
- Good afternoon
- Good evening

Do not make this section visually dominant.

It is context, not the hero.

For prototype seed data, use a generic seeded first name or a centralized mock profile value. Do not hardcode a real person's name directly into the UI component.

---

## 6.2 Hero — Today's Training

This is the most visually prominent component.

Example:

### TODAY'S TRAINING

**Upper Body**

~45 min

*You trained lower body yesterday. Your last upper-body session was four days ago.*

**START WORKOUT**

Secondary action:

**Start Run**

The card should answer:

> What should I do tonight?

### Requirements

The card should contain:

- Recommended activity
- Recommended training area/type
- Estimated duration
- Short explanation
- Primary CTA
- Optional secondary CTA
- Optional "Why?" / "View reasoning" affordance

The recommendation is mocked in FI-001.

Do **not** integrate an LLM.

The UI should consume a typed recommendation object as though it came from an application service.

Example conceptual data:

```ts
{
  activityType: "strength",
  title: "Upper Body",
  durationMinutes: 45,
  explanation:
    "You trained lower body yesterday. Your last upper-body session was four days ago.",
  reasoning: [
    "Your last upper-body workout was four days ago.",
    "You trained lower body yesterday.",
    "Your recent upper-body performance is trending upward."
  ]
}
```

### Why / View Reasoning

Tapping the explanation affordance should open a simple modal, sheet, or expandable detail showing why the recommendation was made.

Example:

**Why Upper Body?**

- Your last upper-body workout was four days ago.
- You trained lower body yesterday.
- Your recent upper-body performance is trending upward.

This establishes explainable intelligence from the beginning.

---

# 7. Last Workout Card

The second major card answers:

> What did I do last time?

Example:

### LAST WORKOUT

**Upper Body**

Thursday · 48 min

8 exercises · 24 sets

**Machine Bench Press**  
110 lb × 10

**Lat Pulldown**  
100 lb × 10

**Cable Row**  
70 lb × 10

**3 exercises progressed ↑**

**View workout →**

### Requirements

Show:

- Workout name/type
- Relative or formatted date
- Duration
- Exercise count
- Set count
- A maximum of approximately three representative exercises
- Best/relevant working performance for those exercises
- Number of exercises that progressed
- Drill-down affordance

The card should remain concise.

Do not display the entire workout on Today.

For FI-001, `View workout` may navigate to a prototype detail screen or clearly defined placeholder destination.

---

# 8. Progress Card

The third card demonstrates the central value proposition:

> My history means something.

For the initial seeded strength-training user, show a major strength trend.

Example:

### YOUR PROGRESS

**Machine Bench Press**

**+35 lb since you started**

[trend visualization]

*You're lifting substantially more than when you began tracking this exercise.*

**View strength progress →**

### Requirements

The progress card should:

- Feature one meaningful metric
- Show change since an appropriate baseline
- Include a compact visual trend
- Use positive, factual language
- Compare the user primarily against their own history
- Be clickable

The chart should be visually simple.

Do not overload the chart with axes, legends, filters, or advanced controls on Today.

### Important

Do not assume progress always means weight increased.

Future progress cards may represent:

- More repetitions at the same load
- Estimated strength improvement
- Faster pace
- Greater running distance
- Increased weekly mileage
- Improved consistency
- Body-weight movement toward a stated goal
- Improved workout frequency
- Other personally relevant changes

The card architecture should not be hardwired specifically to machine bench press.

---

# 9. Goals Card

The fourth default card introduces intentional goal tracking.

Example:

### GOALS

**Build Strength**

Machine Bench Press  
110 → 135 lb

[progress indicator]

**5K under 30:00**

Current best: 31:42

[progress indicator]

**View goals →**

### Requirements

Show no more than approximately two active goals on Today.

Each goal should contain enough information to understand:

- The desired outcome
- Current state
- Target state
- Direction of progress

Do not create false precision when a percentage is not meaningful.

For example, a strength target can have meaningful current/target context, while a behavioral goal may be better represented through another visual treatment.

---

# 10. Future Goal Recommendation

FI-001 does not implement AI-generated goals, but the component architecture should anticipate a future action:

**Recommend Goals**

Future behavior:

Fitness Intelligence evaluates the user's:

- History
- Progression
- Activity preferences
- Existing goals
- Personal bests
- Consistency
- Training patterns

It may then suggest achievable or interesting goals the user may not have considered.

Example:

> **You might enjoy working toward a 150 lb bench.**
>
> You've increased your machine bench by 35 lb since you started, and your progression has remained consistent.

Actions:

**Add Goal**

**Not Interested**

**Why this goal?**

Goal recommendations must be suggestions, not judgments or requirements.

---

# 11. Dashboard Customization Model

Today is intentionally small.

The application may eventually have many available dashboard cards, but a user's Today screen should contain only a limited selection.

### FI-001 Principle

**Many possible metrics. Few visible cards.**

The default Today configuration is:

1. Today's Training — pinned hero
2. Last Workout
3. Progress
4. Goals

The architecture should anticipate future configurable cards such as:

- Strength Progress
- Running Progress
- Weekly Activity
- Body Weight Trend
- Recent PRs
- Personal Bests
- Weekly Mileage
- Consistency
- Nutrition
- Recovery
- AI Insight
- Goal Progress

### Customization

Full drag-and-drop dashboard editing is **out of scope for FI-001**.

However:

- Dashboard cards should be independent reusable components.
- Card identity should be represented in data/configuration rather than through a giant monolithic Today component.
- Future users should be able to choose from approved card types.
- The product should retain a maximum or recommended visible-card count to protect simplicity.
- Today's Training remains the primary/pinned hero unless a later product decision changes it.

Future intelligence may suggest dashboard changes.

Example:

> You've started running more frequently. Want to add Running Progress to Today?

---

# 12. Intelligence Presentation

AI should be subtle.

Do not create a giant "AI Coach" panel on Today.

Use small labels such as:

- Insight
- Recommendation
- Why?
- Key takeaway
- Based on your recent training

Avoid:

- AI-generated
- Powered by AI
- Ask AI everywhere
- Chatbot-first interactions

The product should appear intelligent because it is useful, not because it repeatedly announces the technology behind it.

---

# 13. Voice and Copy

Voice should be:

**Calm + conversational + encouraging**

Good:

> Your last upper-body session was four days ago. This is a good day to train it again.

Good:

> You haven't trained in 8 days. A shorter full-body session is a great way to get moving again.

Good:

> Nice work. You progressed on four exercises tonight.

Good:

> Your bench has climbed steadily since you started.

Avoid:

> You failed to meet your weekly workout target.

Avoid:

> Your consistency score has fallen to 42.

Avoid:

> CRUSH YOUR LIMITS!!!

Avoid:

> No excuses. Get to work.

Avoid clinical language unless needed for safety.

The application can be confident without being aggressive.

---

# 14. Inactivity / Lapsed User State

The app must remain welcoming when someone has not trained recently.

Example hero:

### TODAY'S TRAINING

**Let's get moving again**

You haven't trained in 8 days.

**30-Minute Full Body**

*A shorter session is a good way to get back into your rhythm.*

**START WORKOUT**

The factual inactivity statement is acceptable.

The application should not attach shame, penalties, red status indicators, broken streak theatrics, or negative scoring to it.

The next action should feel achievable.

---

# 15. New User / Insufficient History State

A new user will not have enough history to support personalized recommendations or progress analysis.

Do not fake intelligence.

Example:

### TODAY'S TRAINING

**Ready for your first workout?**

Log a few sessions and Fitness Intelligence will begin learning how you train.

**START WORKOUT**

### YOUR PROGRESS

**Your progress starts here**

Once you've logged a few workouts, you'll begin seeing trends and improvements here.

The product should clearly distinguish:

- No data yet
- Not enough data yet
- Actual observed trend

Never manufacture an insight merely to fill space.

---

# 16. Post-Workout Today State

A completed workout should temporarily change the Today experience.

This is a preview of a later dedicated feature.

Example:

## WORKOUT COMPLETE ✓

**Upper Body · 52 min**

24 sets · 18,420 lb volume

### You progressed on 4 exercises.

**Machine Bench Press**  
110 × 10 → 110 × 12 ↑

**Cable Row**  
70 × 10 → 75 × 10 ↑

**Lat Pulldown**  
100 × 10 → 100 × 11 ↑

### Since You Started

Machine Bench **+35 lb**

Lat Pulldown **+25 lb**

Cable Row **+20 lb**

### KEY TAKEAWAY

*Your upper-body strength continues to trend upward. You added repetitions or weight to four movements tonight without increasing workout duration.*

FI-001 does **not** need to implement the full workout completion analytics engine.

However, Today should be designed so a post-activity summary state can replace or temporarily supersede the normal recommendation hero.

This behavior will be formally specified in a later feature.

---

# 17. Seed Data

FI-001 should ship with realistic development seed data.

Do not use lorem ipsum or generic `Workout 1` values.

Example strength history:

### Machine Bench Press

- 75 lb × 12
- 80 lb × 12
- 90 lb × 12
- 100 lb × 10
- 100 lb × 12
- 110 lb × 10

### Lat Pulldown

- 75 lb × 12
- 85 lb × 12
- 90 lb × 10
- 100 lb × 10

### Cable Row

- 55 lb × 12
- 60 lb × 12
- 70 lb × 10
- 75 lb × 10

Example recent workout:

**Upper Body**

- 48 minutes
- 8 exercises
- 24 sets
- Machine Bench Press — 110 × 10
- Lat Pulldown — 100 × 10
- Cable Row — 75 × 10
- 3 exercises progressed

Example goals:

- Machine Bench Press: current 110 lb / target 135 lb
- 5K: current best 31:42 / target under 30:00

Example recommendation:

- Upper Body
- 45 minutes
- Last upper-body session four days ago
- Lower body trained yesterday

Seed data should live outside presentation components.

---

# 18. Suggested Component Breakdown

Names may adapt to repository conventions, but responsibilities should remain separated.

```text
TodayScreen
├── TodayHeader
├── TodayTrainingCard
│   └── RecommendationReasoningSheet
├── LastWorkoutCard
├── ProgressCard
│   └── CompactTrendChart
└── GoalsCard
    └── GoalProgressItem
```

Possible supporting components:

```text
Card
SectionLabel
PrimaryButton
SecondaryButton
Metric
TrendIndicator
ProgressBar
EmptyState
```

Do not create hyper-specific primitive components when an existing design-system primitive can serve the purpose.

---

# 19. Application Data Contracts

UI components should receive typed view models.

They should not perform analytics calculations directly.

Suggested conceptual models:

```ts
type TodayRecommendation = {
  activityType: "strength" | "run" | "recovery";
  title: string;
  durationMinutes?: number;
  explanation: string;
  reasoning: string[];
};

type LastWorkoutSummary = {
  id: string;
  title: string;
  completedAt: string;
  durationMinutes: number;
  exerciseCount: number;
  setCount: number;
  highlights: ExerciseHighlight[];
  progressedExerciseCount: number;
};

type ProgressHighlight = {
  id: string;
  category: "strength" | "running" | "body" | "consistency";
  title: string;
  headline: string;
  supportingText: string;
  points: TrendPoint[];
};

type GoalSummary = {
  id: string;
  title: string;
  metricLabel: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  direction: "increase" | "decrease";
};
```

These are guidance, not mandatory exact interfaces.

Follow `ARCHITECTURE.md` for final placement and naming.

---

# 20. State Ownership

Today should not own business logic.

Expected flow:

```text
Repository / Seed Source
        ↓
Application Service / Use Case
        ↓
Today View Model
        ↓
Today Screen
        ↓
Reusable Dashboard Cards
```

For FI-001, a seeded repository or development data source is acceptable.

Do not embed giant mock objects directly inside `TodayScreen`.

---

# 21. Interactions

FI-001 should support these interactions:

### Start Workout

Tapping the primary CTA navigates to the current workout-start prototype or placeholder Train flow.

### Start Run

Navigates to the current run-start prototype or placeholder.

### Why?

Opens recommendation reasoning.

### View Workout

Navigates to workout detail or a clearly defined placeholder detail surface.

### View Strength Progress

Navigates to Progress or a placeholder strength detail surface.

### View Goals

Navigates to goals detail or an appropriate placeholder.

Interactions should feel real even if destination features are not fully implemented.

Avoid dead buttons.

---

# 22. Motion

Use motion sparingly.

Acceptable:

- Small press feedback
- Subtle card transitions
- Sheet/modal entrance
- Gentle chart reveal
- Small progress indicator animation

Avoid:

- Constant pulsing
- Excessive spring animations
- Confetti on routine interactions
- Large cinematic transitions
- Motion that slows down logging or navigation

Premium should come from polish, spacing, typography, and responsiveness—not spectacle.

---

# 23. Accessibility

FI-001 must:

- Respect readable text sizes
- Maintain adequate contrast
- Avoid encoding meaning only through color
- Provide accessible labels for important actions
- Maintain usable touch targets
- Ensure charts have textual context
- Support common mobile screen sizes without clipped primary actions

Blue and green activity colors may reinforce meaning but should not be the only indicator that an activity is strength or running.

---

# 24. Responsive Behavior

Primary target:

**Modern iPhone and Android phone portrait layouts**

Today should:

- Use safe areas correctly
- Avoid fixed heights for content-heavy cards
- Adapt to narrower devices
- Permit vertical scrolling
- Keep the primary recommendation CTA easy to reach
- Avoid horizontal scrolling for primary content

Tablet optimization is not required for FI-001.

---

# 25. Loading / Error Philosophy

The seeded prototype should load immediately in normal development.

Still design components so future loading states can exist.

Future loading should prefer:

- Skeleton structures
- Existing content where possible
- Small local indicators

Avoid replacing the entire dashboard with a spinner.

Future partial data failures should not necessarily destroy the entire Today experience.

---

# 26. Explicitly Out of Scope

Do **not** add any of the following while implementing FI-001:

- Authentication
- Cloud backend
- Production database
- LLM integration
- OpenAI SDK
- Anthropic SDK
- GPS tracking
- Wearables
- Apple Health
- Health Connect
- Nutrition logging
- Payment systems
- Social features
- Full dashboard customization UI
- Drag-and-drop cards
- Full workout analytics engine
- Production recommendation engine
- Injury diagnosis
- Medical recommendations
- Universal fitness scoring
- Complex state-management frameworks without demonstrated need

If implementation appears to require one of these, stop and reassess rather than expanding scope.

---

# 27. Acceptance Criteria

FI-001 is complete when:

- [ ] The app launches into Today.
- [ ] Bottom navigation displays Today, Train, Calendar, Progress, and You.
- [ ] Today uses the established dark premium visual system.
- [ ] A time-aware greeting appears.
- [ ] Today's Training is visually dominant.
- [ ] The recommendation includes activity, duration, explanation, and primary action.
- [ ] Recommendation reasoning can be inspected.
- [ ] The Last Workout card displays realistic seeded workout information.
- [ ] Last Workout includes visible progression context.
- [ ] The Progress card displays a meaningful historical trend.
- [ ] The trend is represented visually and textually.
- [ ] The Goals card displays realistic active goals.
- [ ] Dashboard cards are implemented as reusable independent components.
- [ ] Seed data is separated from UI components.
- [ ] UI components do not calculate fitness analytics.
- [ ] Primary buttons navigate somewhere meaningful, even if the destination is a prototype.
- [ ] A new-user/insufficient-data state is represented in the component model.
- [ ] A lapsed-user recommendation state is represented in the component model.
- [ ] No universal fitness score appears.
- [ ] No real AI integration is introduced.
- [ ] No authentication/backend work is introduced.
- [ ] TypeScript passes.
- [ ] Linting passes.
- [ ] The app renders correctly on at least one iOS or Android phone-sized target.
- [ ] No obvious overflow, clipped text, or unreachable CTA exists on a narrow phone layout.

---

# 28. Definition of Success

FI-001 is **not** successful merely because all cards render.

It is successful if someone can open Today and immediately understand:

> **This is what I did last time.**

> **This is what I should do today.**

> **This is evidence that I'm progressing.**

> **This is what I'm working toward.**

And the overall reaction should be:

> **I want to use this when I train.**

---

# 29. Cursor Implementation Directive

Before implementing FI-001:

1. Read `PRODUCT.md`.
2. Read `ARCHITECTURE.md`.
3. Read `DESIGN_SYSTEM.md`.
4. Read this specification completely.
5. Inspect the existing repository before adding dependencies or creating parallel patterns.
6. Reuse established project primitives and conventions where appropriate.
7. Keep the implementation narrow to FI-001.
8. Do not silently expand scope.
9. Do not introduce infrastructure that this feature does not require.
10. Preserve separation between UI, application logic, domain concepts, and data sources.

When a design detail is unspecified, choose the simplest implementation consistent with the design system.

When a product behavior is ambiguous, prefer:

**simple actions, deep intelligence, calm encouragement, and personal progress over judgment.**

---

# 30. Follow-On Features

FI-001 intentionally creates foundations for:

- **FI-002 — Train / Activity Launcher**
- **FI-003 — Strength Workout Logging**
- **FI-004 — Workout Complete / Performance Analysis**
- **FI-005 — Calendar**
- **FI-006 — Progress**
- **FI-007 — Goals**
- **FI-008 — Run Prototype**
- **FI-009 — Dashboard Customization**
- **FI-010 — Current-State Check-In**

Feature numbering may be adjusted as planning evolves.

The next feature should be chosen based on what makes the prototype feel most usable during a real training session.
