# Project Walkthrough

## What We Built

We built a timer-focused React app that combines:

- a task list
- a Pomodoro-style timer area
- preset timer modes
- per-task countdowns
- animated circular progress
- task creation with validation
- task removal
- search
- finish alerts and a short finish sound

The result is a small productivity app where the timer can work in two ways:

1. As a preset timer like `All`, `Short Break`, or `Long Break`
2. As a task timer tied to a specific task's own remaining time

---

## Main Changes We Implemented

### 1. We moved timer state into the main `App` component

This was important because `App` is the shared parent of both:

- the task list
- the timer UI

By keeping the main state in `App`, both child components can stay in sync.

Examples of state stored there:

- `tasks`
- `activeTaskIndex`
- `selectedMode`
- `presetSecondsLeft`
- `isRunning`
- add-task form state
- finish notice state

Why we did it this way:

- The task list needs to know which task is active
- The timer needs to know what label and time to show
- When a task is removed or selected, both parts of the UI must update together

This is a good example of **lifting state up** in React.

---

### 2. We added task-based timing

Each task has:

- `name`
- `totalSeconds`
- `remainingSeconds`
- `completed`

Why this structure matters:

- `totalSeconds` never changes and acts like the original duration
- `remainingSeconds` changes every second
- `completed` gives us a clean way to style finished tasks and reason about UI state

This design makes reset behavior easy, because reset can restore `remainingSeconds` back to `totalSeconds`.

---

### 3. We supported preset modes and task mode in the same timer

The timer can show either:

- a selected preset mode
- the currently selected task

That is why the app calculates:

- `timerLabel`
- `timerSeconds`
- `timerTotalSeconds`

instead of directly hardcoding one source of truth for the timer display.

Why we did it this way:

- The timer UI component should stay reusable
- The timer only needs display-ready values
- `App` decides whether the current timing source is a preset or a task

This is a strong separation of concerns:

- `App` handles behavior and state decisions
- `PomodoroTimer` handles display and interaction

---

### 4. We added the countdown with `setInterval`

The countdown logic lives inside a `useEffect`.

When `isRunning` becomes `true`, the app starts an interval that runs every second. Inside that interval:

- if a task is active, only that task's `remainingSeconds` is updated
- otherwise, the preset timer value is updated

When the time reaches zero:

- the timer stops
- a finish notice is stored
- the task is marked complete if it was a task timer

Why we did it this way:

- `setInterval` is the browser tool for repeated work over time
- `useEffect` is the right place for starting and cleaning up outside effects
- cleanup with `clearInterval` prevents duplicate timers and memory leaks

---

### 5. We added finish handling separately from the countdown logic

There is another `useEffect` that watches `finishNotice` and `timerSeconds`.

That effect:

- plays a sound
- shows an alert
- clears the notice

Why separate this from the ticking logic:

- it keeps the interval effect focused only on counting down
- it makes the finish behavior easier to understand
- it reduces the chance of mixing unrelated responsibilities into one effect

This is a good lesson in keeping effects small and purposeful.

---

### 6. We created an animated progress circle

The timer circle is drawn with SVG. It contains:

- a background track circle
- a progress circle
- a moving knob
- centered text showing the formatted time

Instead of updating the circle in big one-second jumps, we animate the progress smoothly using:

- `requestAnimationFrame`
- local component state called `animatedProgress`

Why we did it this way:

- the real timer still changes once per second
- the UI can still feel smooth between seconds
- separating real countdown state from animation state produces cleaner motion

---

### 7. We added task creation with validation

The add-task form checks:

- task name is not empty
- minutes are a whole number from `0` to `60`
- seconds are a whole number from `0` to `59`
- total duration is greater than zero

Why we did it this way:

- it prevents bad data from entering the app
- it avoids broken timer behavior later
- it teaches an important frontend rule: validate before updating state

---

### 8. We added search and task removal

Search works by:

- storing the query in state
- normalizing it with `trim()` and `toLowerCase()`
- filtering visible tasks

Removal works by:

- filtering the task out of the array
- fixing `activeTaskIndex` if needed

Why the index fix matters:

- if the active task is deleted, the app should stop the timer and clear selection
- if a task above the active task is deleted, the active index must shift down by one

This is a good example of how changing a list can affect related state.

---

## Why The Code Is Split Across Components

### `App.jsx`

This is the control center. It owns the shared state and the main logic.

Responsibilities:

- task data
- timer behavior
- preset selection
- add-task form behavior
- finish alerts

### `PomodoroTimer.jsx`

This is the visual timer component.

Responsibilities:

- formatting the visible time
- rendering the circular progress UI
- animating the circle
- exposing timer control buttons

### `TaskList.jsx`

This is the task management component.

Responsibilities:

- rendering tasks
- search UI
- active/completed visual states
- task selection and removal buttons

Why this split is good:

- each file has a clear purpose
- the code is easier to read
- changes are easier to make later

---

## Understanding `useState`

`useState` lets a React component remember information between renders.

Example idea:

```jsx
const [isRunning, setIsRunning] = useState(false);
```

This means:

- `isRunning` is the current value
- `setIsRunning` updates that value
- `false` is the starting value

Important things to understand:

- Updating state causes React to render again
- State updates are asynchronous from your point of view, so you should not assume the value changes immediately in the same line
- When the next value depends on the old one, use the callback form

Example:

```jsx
setIsRunning((prev) => !prev);
```

This is safer than:

```jsx
setIsRunning(!isRunning);
```

for cases where React may batch updates.

How we used `useState` in this project:

- to track timer running state
- to track the selected task
- to store tasks
- to control form inputs
- to store animation progress
- to show or hide UI like the search field and add-task modal

Main lesson:

State is the app's memory.

---

## Understanding `useEffect`

`useEffect` lets a component run code after React renders, especially when that code involves something outside normal rendering.

Examples of side effects:

- starting a timer
- stopping a timer
- playing sound
- showing alerts
- subscribing to something

In this project, we used `useEffect` for:

1. Starting and cleaning up the interval
2. Handling timer completion alerts and sound
3. Syncing animated progress with actual progress
4. Running smooth animation frames

Basic mental model:

- React renders the UI
- then `useEffect` runs if its dependencies changed

Dependency arrays matter:

```jsx
useEffect(() => {
  ...
}, [activeTaskIndex, isRunning]);
```

That means the effect reruns when either dependency changes.

Important things to understand:

- effects are for side effects, not for ordinary calculations that can be done directly during render
- effects can return a cleanup function
- cleanup runs before the effect runs again and when the component unmounts

In our timer, cleanup is critical:

```jsx
return () => clearInterval(intervalId);
```

Without cleanup, multiple intervals could run at the same time and the timer would speed up or behave strangely.

Main lesson:

`useEffect` is where React connects to time, sound, the browser, and other outside behavior.

---

## Understanding `setInterval`

`setInterval` runs a function repeatedly after a fixed amount of time.

Example idea:

```js
const intervalId = setInterval(() => {
  console.log("tick");
}, 1000);
```

That runs every `1000` milliseconds, which is one second.

In this project, `setInterval` is the heartbeat of the countdown.

Every second it:

- checks whether we are timing a task or a preset
- subtracts one second
- stops at zero
- triggers finish behavior

Important things to understand:

- `setInterval` does not automatically stop on its own
- you must call `clearInterval(intervalId)`
- if you start a new interval without clearing the old one, bugs appear fast
- interval callbacks can capture old values, so using functional state updates is often safer

That is why code like this matters:

```jsx
setPresetSecondsLeft((prevSeconds) => {
  const nextSeconds = prevSeconds <= 1 ? 0 : prevSeconds - 1;
  return nextSeconds;
});
```

This callback uses the latest state value instead of relying on a possibly stale variable.

Main lesson:

`setInterval` is simple, but it becomes reliable only when paired with cleanup and careful state updates.

---

## The Circle: What Is Important To Understand

The circle is one of the most important parts of this task because it combines math, SVG, animation, and React state.

### 1. The circle is SVG, not a normal HTML shape

We use `<svg>` and `<circle>` elements, which give us precise control over geometry and strokes.

The key circle values are:

- `cx`: center x
- `cy`: center y
- `r`: radius

### 2. Progress is based on a percentage

We calculate:

```jsx
const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;
```

This gives us a value between `0` and `1`.

That percentage is easier to use than raw seconds when drawing the circle.

### 3. Circumference turns progress into visible stroke length

We calculate:

```jsx
const circumference = 2 * Math.PI * radius;
```

Then:

```jsx
const dashOffset = circumference * (1 - animatedProgress);
```

Why this works:

- `strokeDasharray` sets the total drawable stroke length
- `strokeDashoffset` hides part of that stroke
- changing the offset makes the circle appear to fill or empty

This is the core trick behind circular progress indicators.

### 4. Rotation changes where the circle starts

By default, the stroke begins at the right side of the circle, around the 3 o'clock position.

We rotate it by `-90` degrees so the progress starts at the top, which feels more natural for a timer.

### 5. The knob position uses trigonometry

The moving dot is placed with:

- cosine for x
- sine for y

Conceptually:

```jsx
x = centerX + radius * cos(angle)
y = centerY + radius * sin(angle)
```

This places the knob exactly on the edge of the circle.

The angle is based on progress, so as progress changes, the knob moves around the path.

### 6. We separate real progress from animated progress

This is a very important design choice.

- `progress` is the true countdown state
- `animatedProgress` is a visual state for smoother motion

Why that matters:

- the real timer only changes once per second
- the UI can animate smoothly between those changes
- the timer stays accurate while the visuals stay polished

### 7. The circle depends on math being consistent

If any of these values do not match, the visual can break:

- radius
- circumference
- center coordinates
- rotation
- knob angle

Main lesson:

The circle is a great example of turning data into visuals through math.

---

## Main Programming Concepts Learned From This Task

### 1. Lifting state up

When multiple components need the same data, keep that state in their closest shared parent.

### 2. Single source of truth

Try to avoid duplicated state that can drift out of sync. We store the real timer values in one place and derive display values from them.

### 3. Derived values

Values like `timerLabel`, `timerSeconds`, `formattedTime`, and `progress` are calculated from state instead of stored separately.

This keeps the app simpler and more reliable.

### 4. Functional state updates

When the next state depends on the previous state, use:

```jsx
setSomething((prev) => ...)
```

This avoids stale state bugs.

### 5. Effect cleanup

Any effect that starts an ongoing process should usually clean it up.

Examples:

- intervals
- animation frames

### 6. Separation of concerns

The app works better because:

- state and behavior mostly live in `App`
- timer visuals live in `PomodoroTimer`
- task UI lives in `TaskList`

### 7. Data modeling

A good object shape makes logic easier. The task objects are simple, but they support selection, progress, completion, reset, and display.

### 8. Validation before state updates

Never trust user input automatically. Clean, validate, then update state.

### 9. Rendering lists safely

When rendering tasks, we keep track of the original index so selection and removal still work even after filtering.

### 10. UI state vs business state

Some state affects app behavior:

- `tasks`
- `activeTaskIndex`
- `isRunning`

Some state affects presentation only:

- `showAddTaskForm`
- `isSearchVisible`
- `animatedProgress`

Learning the difference helps you organize components more clearly.

---

## Why These Choices Were Good For This App

We made these choices because they balance:

- clarity
- correctness
- maintainability
- user experience

In particular:

- centralizing timer state keeps the task list and timer synchronized
- functional state updates make time-based logic safer
- splitting effects keeps timer logic easier to reason about
- SVG plus animation gives the timer a polished feel
- keeping task data structured makes reset, completion, and removal much easier

---

## Files To Look At

- `src/App.jsx`: main state, timer logic, form logic, finish behavior
- `src/components/PomodoroTimer.jsx`: circular SVG timer, animation, controls
- `src/components/TaskList.jsx`: task UI, search, selection, removal
- `src/index.css`: Tailwind import

---

## Final Takeaway

This task was more than building a timer. It was practice in thinking like a frontend developer:

- model the data clearly
- keep state where it belongs
- derive values instead of duplicating them
- use effects carefully
- clean up timers and animations
- separate logic from presentation
- use math to drive visuals

If you understand why the timer state lives in `App`, why `useEffect` owns the interval, why `setInterval` must be cleaned up, and how the SVG circle turns progress into a visual stroke, then you understand the most important lessons from this project.
