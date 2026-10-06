# Fitness Intelligence — Architecture

**Status:** Architecture v0.1 for prototype development  
**Primary objective:** Move quickly without creating a throwaway codebase.

## 1. Architecture Goals

The architecture should support:

- iOS and Android from one codebase.
- Fast UI iteration.
- Local-first operation.
- Offline workout logging.
- Deterministic fitness calculations.
- Replaceable persistence implementations.
- A future AI intelligence layer without coupling UI to an LLM.
- Future GPS, health platform, notification, and cloud-sync integrations.
- Testable domain logic.

The prototype may use seeded/mock data, but boundaries should resemble the eventual product.

## 2. Technology Baseline

Use:

- **React Native**
- **Expo**
- **TypeScript** with strict typing
- **Expo Router** for application navigation
- React hooks/components for UI behavior
- A lightweight repository abstraction for data access
- Seed/in-memory repositories during the first prototype
- **SQLite** as the planned local persistence layer once persistence work begins

Do not add a backend, authentication provider, global state framework, ORM, AI SDK, or other major dependency merely because it may be useful later.

Every new dependency should solve a current requirement.

## 3. Architectural Shape

Use a layered, feature-aware structure:

**UI → Application → Domain → Repository Contract → Repository Implementation**

External systems live behind adapters.

Conceptually:

```text
Screens / Components
        ↓
Application Use Cases / Services
        ↓
Domain Models + Analytics
        ↓
Repository Interfaces
        ↓
Seed / SQLite / Future Sync Implementations
```

The UI must not know whether data came from seed data, SQLite, cloud sync, Health Connect, or another source.

## 4. Suggested Repository Structure

```text
/
├─ app/                         # Expo Router routes only
│  ├─ _layout.tsx
│  ├─ (tabs)/
│  │  ├─ _layout.tsx
│  │  ├─ index.tsx             # Today
│  │  ├─ train.tsx
│  │  ├─ calendar.tsx
│  │  ├─ progress.tsx
│  │  └─ you.tsx
│  ├─ workout/
│  └─ run/
│
├─ src/
│  ├─ components/              # Shared UI components
│  ├─ features/
│  │  ├─ today/
│  │  ├─ workouts/
│  │  ├─ running/
│  │  ├─ calendar/
│  │  ├─ progress/
│  │  ├─ profile/
│  │  └─ check-in/
│  │
│  ├─ domain/
│  │  ├─ models/
│  │  ├─ analytics/
│  │  └─ rules/
│  │
│  ├─ application/
│  │  ├─ services/
│  │  └─ use-cases/
│  │
│  ├─ data/
│  │  ├─ repositories/         # Contracts/interfaces
│  │  ├─ seed/                 # Prototype implementation/data
│  │  └─ sqlite/               # Added when persistence begins
│  │
│  ├─ integrations/            # Future GPS/health/AI/cloud adapters
│  ├─ design/                  # Tokens/theme primitives
│  ├─ hooks/
│  ├─ utils/
│  └─ types/
│
├─ docs/
│  ├─ PRODUCT.md
│  ├─ ARCHITECTURE.md
│  ├─ DESIGN_SYSTEM.md
│  └─ features/
│
└─ assets/
```

Routes should remain thin. Feature logic belongs under `src/`.

## 5. Domain Model Direction

Do not over-model the entire future product now. Introduce domain entities when required by a feature.

Likely core entities include:

```text
UserProfile
Goal
WorkoutSession
Exercise
ExerciseSet
RunSession
CurrentStateCheckIn
BodyMetric
NutritionDay
ActivitySummary
Insight
Recommendation
LearnedPattern
```

Use stable IDs and explicit timestamps/dates. Store raw user observations separately from derived metrics where practical.

### Example distinction

Raw:

```text
ExerciseSet
- exerciseId
- weight
- reps
- completedAt
```

Derived:

```text
ExercisePerformance
- totalVolume
- estimated1RM
- changeFromPrevious
- isPersonalRecord
```

Derived values should generally be reproducible from raw history rather than becoming the only source of truth.

## 6. Analytics Layer

Fitness calculations belong in deterministic TypeScript functions/services, not UI components and not AI prompts.

Examples:

```text
calculateSetVolume()
calculateWorkoutVolume()
calculateEstimated1RM()
calculateWeeklyFrequency()
calculatePace()
calculateMileageTrend()
detectPersonalRecord()
calculateConsistency()
calculatePercentageChange()
```

Analytics functions should:

- Have explicit typed inputs/outputs.
- Avoid UI dependencies.
- Be unit-testable.
- Be deterministic for the same input.
- Document assumptions/formulas when non-obvious.

Do not create a single enormous `fitnessAnalytics.ts`. Organize analytics by domain as the system grows.

## 7. Intelligence Architecture

AI is downstream of data and analytics.

Future flow:

```text
Raw History
    ↓
Deterministic Analytics
    ↓
Structured Fitness Context
    ↓
Intelligence Service
    ↓
Insight / Recommendation / Explanation
    ↓
UI
```

Define AI-facing domain contracts before selecting an AI provider.

Example conceptual input:

```ts
interface FitnessContext {
  goals: Goal[];
  recentTraining: TrainingSummary;
  progression: ProgressionSummary;
  running: RunningSummary;
  currentState?: CurrentStateCheckIn;
  learnedPreferences: LearnedPreference[];
  relevantPatterns: LearnedPattern[];
}
```

The future intelligence service should return structured results rather than arbitrary prose blobs whenever possible.

```ts
interface Recommendation {
  id: string;
  type: string;
  title: string;
  summary: string;
  rationale: string[];
  confidence?: number;
  evidenceRefs?: string[];
}
```

The initial prototype can use seeded `Insight` and `Recommendation` objects through the same interfaces.

## 8. Data Access

Components should not directly query SQLite or import seed JSON.

Use repository contracts such as:

```ts
interface WorkoutRepository {
  getRecent(limit: number): Promise<WorkoutSession[]>;
  getById(id: string): Promise<WorkoutSession | null>;
  save(session: WorkoutSession): Promise<void>;
}
```

Prototype:

```text
WorkoutRepository → SeedWorkoutRepository
```

Later:

```text
WorkoutRepository → SQLiteWorkoutRepository
```

Future sync should not require redesigning feature components.

## 9. Local-First Strategy

Workout logging must eventually work without network connectivity.

When persistence is implemented:

- Local storage is the immediate source of truth for active fitness activity.
- Writes should complete locally first.
- Cloud sync, if introduced, is asynchronous and additive.
- The app should not require connectivity to start or finish a workout.

Do not design cloud synchronization until there is a real requirement, but avoid architecture that assumes constant connectivity.

## 10. State Management

Start simple.

Use:

- Component state for local UI state.
- Context only for genuinely app-wide lightweight concerns.
- Feature hooks/services for data loading and actions.

Do **not** introduce Redux/Zustand/another global store during the initial prototype unless state complexity demonstrates a concrete need.

Server-state libraries are unnecessary while there is no server.

## 11. Navigation

Use Expo Router.

Primary tabs:

```text
/(tabs)/
  Today
  Train
  Calendar
  Progress
  You
```

Detailed activities should be pushed routes rather than additional primary tabs.

Examples:

```text
/workout/start
/workout/[id]
/run/start
/run/[id]
/calendar/day/[date]
/progress/strength
/progress/running
/insight/[id]
```

## 12. Design System Boundary

No feature should invent arbitrary visual values when a design token exists.

Use shared primitives/tokens for:

- Color
- Spacing
- Typography
- Radius
- Elevation/borders
- Activity semantics
- Chart semantics

See `DESIGN_SYSTEM.md`.

## 13. Error and Empty States

Prototype screens should still handle:

- No history
- No activity on a calendar date
- Missing optional metrics
- Failed repository load

The product should degrade gracefully instead of displaying fake precision.

## 14. Testing Strategy

### Prototype
Prioritize tests for deterministic domain calculations and important transformations.

### As features become real
Add:

- Unit tests for analytics/rules.
- Repository tests.
- Feature-level behavior tests for critical logging flows.
- End-to-end coverage for Start Workout → Log Sets → Finish Workout.

Avoid spending the prototype phase chasing arbitrary coverage percentages.

## 15. Performance Rules

- Active workout interactions should feel immediate.
- Avoid unnecessary network dependencies.
- Keep large historical calculations out of render functions.
- Memoize/aggregate only when actual performance requires it.
- Prefer precomputed view models for complex dashboard cards.

## 16. Safety Boundary

Fitness Intelligence can recommend training changes. It must not diagnose injury or disease.

Any future intelligence layer should receive safety instructions and structured current-state data, but safety-critical decisions should not rely exclusively on an LLM.

## 17. Cursor / Implementation Rules

When implementing a feature:

1. Read `PRODUCT.md`, `ARCHITECTURE.md`, `DESIGN_SYSTEM.md`, and the relevant feature spec first.
2. Preserve architectural boundaries unless the feature spec explicitly changes them.
3. Do not add dependencies without explaining why the existing stack cannot satisfy the requirement.
4. Do not introduce authentication, cloud infrastructure, AI providers, GPS, or health integrations unless explicitly requested.
5. Keep route files thin.
6. Keep domain calculations out of components.
7. Use typed domain objects instead of loosely shaped objects.
8. Reuse design tokens and shared primitives.
9. Seed realistic data through repositories, not hard-coded directly inside screens.
10. Before finishing, run available type checking, linting, and tests and report failures honestly.
11. Do not rewrite unrelated files or perform broad refactors without a requirement.
12. Prefer the smallest coherent implementation that leaves a clean extension point.

## 18. Architectural Decision Rule

For early development, choose the solution that maximizes:

**Iteration speed + clarity + replaceability**

—not theoretical enterprise scale.

The architecture is successful if we can rapidly build the prototype today and still recognize the codebase when the product becomes real.
