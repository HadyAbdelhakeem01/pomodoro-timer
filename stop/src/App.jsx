import { useEffect, useState } from "react";
import PomodoroTimer from "./components/PomodoroTimer";
import TaskList from "./components/TaskList";

const MODE_SECONDS = {
  all: 60 * 60,
  short: 10,
  long: 30 * 60,
};

const MODE_LABELS = {
  all: "All",
  short: "Short Break",
  long: "Long Break",
};

const INITIAL_TASKS = [
  {
    name: "Meditation",
    totalSeconds: 5 * 60,
    remainingSeconds: 5 * 60,
    completed: false,
  },
  {
    name: "Read an article on Design Trends",
    totalSeconds: 10 * 60,
    remainingSeconds: 10 * 60,
    completed: false,
  },
  {
    name: "Practice Motion Design (After Effects)",
    totalSeconds: 22 * 60 + 45,
    remainingSeconds: 22 * 60 + 45,
    completed: false,
  },
  {
    name: "Sketch wireframe for Mingle Landing Page",
    totalSeconds: 25 * 60,
    remainingSeconds: 25 * 60,
    completed: false,
  },
];

function playFinishSound() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) return;

  const audioContext = new AudioContextClass();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime);

  gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + 0.6
  );

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.6);
}

export default function App() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [activeTaskIndex, setActiveTaskIndex] = useState(null);
  const [selectedMode, setSelectedMode] = useState("all");
  const [presetSecondsLeft, setPresetSecondsLeft] = useState(MODE_SECONDS.all);
  const [isRunning, setIsRunning] = useState(false);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskMinutes, setNewTaskMinutes] = useState("25");
  const [newTaskSeconds, setNewTaskSeconds] = useState("00");
  const [formError, setFormError] = useState("");
  const [finishNotice, setFinishNotice] = useState(null);

  const activeTask =
    activeTaskIndex !== null ? tasks[activeTaskIndex] ?? null : null;
  const timerLabel = activeTask ? activeTask.name : MODE_LABELS[selectedMode];
  const timerSeconds = activeTask ? activeTask.remainingSeconds : presetSecondsLeft;
  const timerTotalSeconds = activeTask
    ? activeTask.totalSeconds
    : MODE_SECONDS[selectedMode];

  useEffect(() => {
    if (!isRunning) return;

    const intervalId = setInterval(() => {
      if (activeTaskIndex !== null) {
        setTasks((prevTasks) =>
          prevTasks.map((task, index) => {
            if (index !== activeTaskIndex) return task;

            const nextSeconds =
              task.remainingSeconds <= 1 ? 0 : task.remainingSeconds - 1;

            if (nextSeconds === 0 && task.remainingSeconds > 0) {
              setIsRunning(false);
              setFinishNotice({
                type: "task",
                name: task.name,
              });
            }

            return {
              ...task,
              remainingSeconds: nextSeconds,
              completed: nextSeconds === 0,
            };
          })
        );

        return;
      }

      setPresetSecondsLeft((prevSeconds) => {
        const nextSeconds = prevSeconds <= 1 ? 0 : prevSeconds - 1;

        if (nextSeconds === 0 && prevSeconds > 0) {
          setIsRunning(false);
          setFinishNotice({
            type: "preset",
          });
        }

        return nextSeconds;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [activeTaskIndex, isRunning]);

  useEffect(() => {
    if (!finishNotice || timerSeconds !== 0) return;

    playFinishSound();

    if (finishNotice.type === "task") {
      window.alert(`The task ${finishNotice.name} is finished!`);
    } else {
      window.alert("The timer is finished!");
    }

    setFinishNotice(null);
  }, [finishNotice, timerSeconds]);

  const closeAddTaskForm = () => {
    setShowAddTaskForm(false);
    setFormError("");
    setNewTaskName("");
    setNewTaskMinutes("25");
    setNewTaskSeconds("00");
  };

  const handleOpenAddTaskForm = () => {
    setFormError("");
    setShowAddTaskForm(true);
  };

  const handleSelectTask = (index) => {
    setActiveTaskIndex(index);
    setIsRunning(false);
  };

  const handleRemoveTask = (indexToRemove) => {
    setTasks((prevTasks) =>
      prevTasks.filter((_, index) => index !== indexToRemove)
    );

    setActiveTaskIndex((prevIndex) => {
      if (prevIndex === null) return null;
      if (prevIndex === indexToRemove) {
        setIsRunning(false);
        return null;
      }
      if (prevIndex > indexToRemove) return prevIndex - 1;
      return prevIndex;
    });
  };

  const handleSelectMode = (modeKey) => {
    setSelectedMode(modeKey);
    setActiveTaskIndex(null);
    setPresetSecondsLeft(MODE_SECONDS[modeKey]);
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);

    if (activeTaskIndex !== null) {
      setTasks((prevTasks) =>
        prevTasks.map((task, index) =>
          index === activeTaskIndex
            ? {
                ...task,
                remainingSeconds: task.totalSeconds,
                completed: false,
              }
            : task
        )
      );

      return;
    }

    setPresetSecondsLeft(MODE_SECONDS[selectedMode]);
  };

  const handleToggle = () => {
    if (activeTaskIndex !== null) {
      const currentTask = tasks[activeTaskIndex];

      if (!currentTask) return;

      if (currentTask.remainingSeconds === 0) {
        setTasks((prevTasks) =>
          prevTasks.map((task, index) =>
            index === activeTaskIndex
              ? {
                  ...task,
                  remainingSeconds: task.totalSeconds,
                  completed: false,
                }
              : task
          )
        );
        setIsRunning(true);
        return;
      }

      setIsRunning((prev) => !prev);
      return;
    }

    if (presetSecondsLeft === 0) {
      setPresetSecondsLeft(MODE_SECONDS[selectedMode]);
      setIsRunning(true);
      return;
    }

    setIsRunning((prev) => !prev);
  };

  const handleAddTask = (event) => {
    event.preventDefault();

    const trimmedName = newTaskName.trim();
    const minutesValue = Number(newTaskMinutes);
    const secondsValue = Number(newTaskSeconds);

    if (!trimmedName) {
      setFormError("Task name is required.");
      return;
    }

    if (
      Number.isNaN(minutesValue) ||
      !Number.isInteger(minutesValue) ||
      minutesValue < 0 ||
      minutesValue > 60
    ) {
      setFormError("Minutes must be a whole number between 0 and 60.");
      return;
    }

    if (
      Number.isNaN(secondsValue) ||
      !Number.isInteger(secondsValue) ||
      secondsValue < 0 ||
      secondsValue > 59
    ) {
      setFormError("Seconds must be a whole number between 0 and 59.");
      return;
    }

    const totalSeconds = minutesValue * 60 + secondsValue;

    if (totalSeconds <= 0) {
      setFormError("Task duration must be greater than zero.");
      return;
    }

    setTasks((prevTasks) => [
      ...prevTasks,
      {
        name: trimmedName,
        totalSeconds,
        remainingSeconds: totalSeconds,
        completed: false,
      },
    ]);
    closeAddTaskForm();
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f5f8fe_0%,#eef3fb_100%)] px-4 py-8 text-[#0f172a] sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 lg:flex-row lg:items-start">
        <div className="lg:w-[42%]">
          <TaskList
            tasks={tasks}
            activeTaskIndex={activeTaskIndex}
            onSelectTask={handleSelectTask}
            onRemoveTask={handleRemoveTask}
            onOpenAddTask={handleOpenAddTaskForm}
          />
        </div>

        <div className="lg:flex-1">
          <PomodoroTimer
            label={timerLabel}
            secondsLeft={timerSeconds}
            totalSeconds={timerTotalSeconds}
            isRunning={isRunning}
            onToggle={handleToggle}
            onReset={handleReset}
            selectedMode={selectedMode}
            onSelectMode={handleSelectMode}
            presetsDisabled={activeTaskIndex !== null}
            onRemoveLabel={
              activeTaskIndex !== null
                ? () => handleRemoveTask(activeTaskIndex)
                : undefined
            }
          />
        </div>
      </div>

      {showAddTaskForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/30 px-4 py-6">
          <div className="w-full max-w-md rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-[#0f172a]">Add Task</h2>
                <p className="mt-1 text-sm text-[#64748b]">
                  Create a task and connect it to the timer.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAddTaskForm}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#dbe4f0] text-[#475569] transition hover:bg-[#f8fbff]"
                aria-label="Close add task form"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                >
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </svg>
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleAddTask}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#334155]">
                  Name
                </span>
                <input
                  type="text"
                  value={newTaskName}
                  onChange={(event) => setNewTaskName(event.target.value)}
                  placeholder="Task name"
                  className="w-full rounded-2xl border border-[#dbe4f0] bg-[#f8fbff] px-4 py-3 text-sm text-[#0f172a] outline-none transition focus:border-[#4b8df8] focus:bg-white"
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#334155]">
                    Minutes
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={newTaskMinutes}
                    onChange={(event) => setNewTaskMinutes(event.target.value)}
                    className="w-full rounded-2xl border border-[#dbe4f0] bg-[#f8fbff] px-4 py-3 text-sm text-[#0f172a] outline-none transition focus:border-[#4b8df8] focus:bg-white"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#334155]">
                    Seconds
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={newTaskSeconds}
                    onChange={(event) => setNewTaskSeconds(event.target.value)}
                    className="w-full rounded-2xl border border-[#dbe4f0] bg-[#f8fbff] px-4 py-3 text-sm text-[#0f172a] outline-none transition focus:border-[#4b8df8] focus:bg-white"
                  />
                </label>
              </div>

              {formError ? (
                <p className="rounded-2xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm text-[#b91c1c]">
                  {formError}
                </p>
              ) : null}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeAddTaskForm}
                  className="rounded-2xl border border-[#dbe4f0] bg-white px-5 py-3 text-sm font-semibold text-[#475569] transition hover:bg-[#f8fbff]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-[#4b8df8] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(75,141,248,0.3)] transition hover:brightness-105"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
