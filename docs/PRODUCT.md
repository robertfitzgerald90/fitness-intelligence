# Fitness Intelligence — Product

**Status:** Working product definition  
**Working name:** Fitness Intelligence  
**Primary principle:** **Log less. Learn more.**

## 1. Product Vision

Fitness Intelligence is a mobile fitness platform that combines strength training, running, nutrition, recovery/current-state information, goals, body metrics, and historical performance into one visual intelligence system.

It is not primarily a workout logger and it is not a chatbot with fitness data attached. Logging creates the history; the product's value is turning that history into useful understanding and better next decisions.

Core loop:

**PLAN → TRAIN → RECORD → ANALYZE → ADAPT → PLAN**

The product should become more personalized and more useful as the user's history grows.

## 2. Product Promise

When a user opens Fitness Intelligence, they should be able to understand within seconds:

- What they have been doing.
- Whether they are progressing.
- What deserves attention.
- What is happening today.
- What the system recommends next.
- Why it is making that recommendation.

The experience follows:

**Summary → Trend → Detail → Explanation**

The user should not need to interpret large tables of raw data or repeatedly ask an AI assistant for basic insight.

## 3. Product Principles

### 3.1 Log less. Learn more.
Only collect information that can produce useful history, analysis, personalization, or recommendations.

### 3.2 Visual first. AI second.
The application must be useful without a conversation. Scores, trends, cards, calendars, progress views, and recommendations surface intelligence proactively.

### 3.3 Simple actions, deep intelligence.
Common actions should take very few taps even if sophisticated calculations happen underneath.

### 3.4 Personalization comes from history.
The system should learn the user's training habits, preferences, performance patterns, and responses over time.

### 3.5 Data should connect.
Strength, running, nutrition, recovery, body changes, current state, and goals are parts of the same fitness story rather than isolated modules.

### 3.6 Current state matters.
Today's energy, soreness, discomfort, available time, and preference should influence recommendations.

### 3.7 Recommendations must be explainable.
A user should be able to answer: **Why did Fitness Intelligence recommend this?**

### 3.8 AI interprets; deterministic systems calculate.
Metrics such as volume, pace, frequency, trends, estimated strength, adherence, and personal records should be calculated by application logic. AI receives structured information and focuses on interpretation, pattern recognition, recommendations, explanations, and personalization.

### 3.9 Fitness guidance is not medical advice.
The application must not diagnose injuries or medical conditions. It can conservatively adjust training around reported discomfort and encourage professional evaluation when appropriate.

## 4. Primary Navigation

Bottom navigation:

1. **Today**
2. **Train**
3. **Calendar**
4. **Progress**
5. **You**

AI is a capability across the product, not a primary navigation destination. A future **Ask Coach** interface may provide conversational access to the user's fitness history.

## 5. Core Experiences

### 5.1 Today

Today answers: **What matters to me right now?**

Initial hierarchy:

- Fitness / Progress Score
- Weekly Snapshot
- Today's Recommendation
- Quick actions: Start Workout / Start Run
- Fitness Intelligence insight
- Recent Progress
- Upcoming / next activity context

Every major card should eventually support drill-down into its evidence or detail.

### 5.2 Train

Train launches activity.

Initial actions:

- Strength Workout
- Run

Later it can include recent activities, templates, generated workouts, and recommendations.

### 5.3 Strength Training

Workout logging must be fast enough to use between sets.

When an exercise is selected, Fitness Intelligence should automatically show useful prior context such as the previous working weight/reps. The user should not re-enter information the application already knows.

The system will eventually calculate:

- Total workout volume
- Exercise volume
- Muscle-group volume
- Rep ranges
- Estimated 1RM
- Exercise progression
- Personal records
- Workout duration
- Training frequency
- Volume trends
- Progression velocity

### 5.4 Generated Workouts

Future generated workouts should use the individual's actual context rather than generic templates.

Inputs may include:

- Goals
- Training history
- Recent workouts
- Exercise progression
- Available equipment
- Exercise preferences
- Current state
- Recovery
- Previous feedback
- Available time
- Desired training area or "Decide For Me"

Generated prescriptions should include an explanation where useful.

### 5.5 Current-State Check-In

Before recommendations or generated workouts, the user may provide a lightweight check-in:

- Energy: Low / Normal / High
- Soreness: None / Mild / Significant
- Areas bothering them
- Time available
- Training preference

The check-in should feel like a few taps, not a medical intake form.

### 5.6 Running

Running should optimize for simplicity:

**Start → Run → Stop → Understand**

Active run view eventually includes essential information such as:

- Distance
- Duration
- Average/current pace
- Cadence

Post-run detail may include route, splits, elevation, personal records, and comparison to prior runs.

### 5.7 Calendar

Calendar is a primary view of fitness history, not a buried activity log.

Month view uses compact activity indicators:

- **Blue dot:** strength workout
- **Green dot:** run
- Both dots when both occurred

Selecting a date opens activity detail. Period summaries can show workouts, runs, mileage, active days, and consistency.

### 5.8 Progress

Progress is the analytics center.

Initial/future domains:

- Strength
- Running
- Nutrition
- Body
- Consistency

Information should be highly visual and drillable.

### 5.9 You

You is the living Fitness Profile: what the system knows or believes about the individual.

Examples:

- Preferred session duration
- Typical frequency
- Current goals
- Preferred equipment
- Typical rep ranges
- Areas progressing fastest
- Areas plateauing
- Learned patterns

Learned conclusions must be inspectable and correctable.

### 5.10 Nutrition

Nutrition is part of the long-term intelligence system rather than an isolated calorie logger. Initial concepts include calories, protein, carbohydrates, fat, meals, adherence, and body weight.

The value is connecting nutrition patterns to fitness outcomes while avoiding clinical nutrition claims.

## 6. Cross-Domain Intelligence

A major differentiator is understanding relationships across:

**Strength ↔ Running ↔ Nutrition ↔ Recovery ↔ Body ↔ Goals**

Examples of future insights:

- Running pace changes after high-volume leg sessions.
- Strongest lifting sessions tend to follow rest days.
- Protein adherence differs on weekends.
- Weight trend changes alongside calorie intake.
- Performance changes when training frequency increases.

Insights should be evidence-backed and presented as observations, not unjustified causal claims.

## 7. Explainability

Recommendations and meaningful AI insights should support **Why?** or **View Analysis**.

The explanation may reference:

- Recent training
- Recovery/current state
- Goal priorities
- Time available
- Progression history
- Relevant patterns

The system should clearly distinguish observed correlation from known fact.

## 8. Initial MVP / Prototype

The first milestone is to make Fitness Intelligence feel real on a phone.

Build first:

1. Today dashboard
2. Five-tab navigation shell
3. Basic Start Workout experience
4. Mock Start Run experience
5. Calendar month view and activity drill-down
6. Realistic seed data
7. Mock intelligence insights/recommendations

The prototype should answer:

> **Would I genuinely want this application on my phone?**

## 9. Explicitly Deferred

Do not build during the initial prototype unless a later feature specification explicitly changes scope:

- Authentication
- Cloud backend
- Payments
- Real LLM integration
- Production GPS tracking
- Wearable integrations
- Apple Health / Health Connect
- Social features
- Complex nutrition databases
- Large settings systems

## 10. Early Validation

### Strength test
Use the app during real workouts and evaluate:

- Is logging fast?
- Is prior performance visible at the right moment?
- Are progress indicators meaningful?
- Does Today make the user want to return?
- Do recommendations feel useful and understandable?

### Running test
The standard is:

- Start easily.
- See essential information.
- Stop easily.
- Immediately understand the run.

## 11. Product Success for the Prototype

The prototype succeeds when the application feels coherent and useful enough that the missing functionality is exciting rather than confusing.

The near-term objective is not production readiness. It is to build enough of Fitness Intelligence that the product feels worth finishing.
