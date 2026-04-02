import { useState } from "react";

function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds} sec`;
  }

  if (seconds === 0) {
    return `${minutes} min`;
  }

  return `${minutes} min ${String(seconds).padStart(2, "0")} sec`;
}

function formatProgress(remainingSeconds, totalSeconds) {
  return `${formatDuration(remainingSeconds)} left of ${formatDuration(
    totalSeconds
  )}`;
}

export default function TaskList({
  tasks,
  activeTaskIndex,
  onSelectTask,
  onRemoveTask,
  onOpenAddTask,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visibleTasks = tasks
    .map((task, index) => ({
      task,
      originalIndex: index,
    }))
    .filter(({ task }) =>
      normalizedQuery
        ? task.name.toLowerCase().includes(normalizedQuery)
        : true
    );

  return (
    <div className="rounded-[28px] border border-[#dfe8f3] bg-white p-5 shadow-[0_18px_54px_rgba(27,60,120,0.08)] sm:p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-[#0f172a]">{`Task List (${tasks.length} Task)`}</h1>

        <button
          type="button"
          onClick={() => setIsSearchVisible((prev) => !prev)}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#dbe4f0] bg-white text-[#334155] shadow-sm transition hover:bg-[#f8fbff]"
          aria-label="Search tasks"
          aria-pressed={isSearchVisible}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
        </button>
      </div>

      {isSearchVisible ? (
        <div className="mb-4">
          <label className="sr-only" htmlFor="task-search">
            Search tasks
          </label>
          <input
            id="task-search"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search tasks"
            className="w-full rounded-2xl border border-[#dbe4f0] bg-[#f8fbff] px-4 py-3 text-sm text-[#0f172a] outline-none transition focus:border-[#4b8df8] focus:bg-white"
          />
        </div>
      ) : null}

      <div className="space-y-3">
        {visibleTasks.map(({ task, originalIndex }) => {
          const isActive = originalIndex === activeTaskIndex;
          const isCompleted = task.remainingSeconds === 0 || task.completed;

          return (
            <div
              key={`${task.name}-${originalIndex}`}
              className={`flex w-full items-center gap-4 rounded-3xl border px-4 py-4 text-left transition ${
                isActive
                  ? "border-[#4b8df8] bg-[#f8fbff] shadow-[0_10px_24px_rgba(75,141,248,0.12)]"
                  : "border-[#e6edf6] bg-white hover:border-[#cddcf0] hover:bg-[#fbfdff]"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectTask(originalIndex)}
                className="flex min-w-0 flex-1 items-center gap-4 text-left"
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    isCompleted
                      ? "border-[#4b8df8] bg-[#4b8df8] text-white"
                      : isActive
                        ? "border-[#4b8df8] bg-white"
                        : "border-[#d7e2f0] bg-white"
                  }`}
                >
                  {isCompleted ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="h-3.5 w-3.5"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  ) : null}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-medium text-[#0f172a]">
                    {task.name}
                  </span>
                  <span className="mt-1 block text-sm text-[#64748b]">
                    {formatProgress(task.remainingSeconds, task.totalSeconds)} |{" "}
                    {formatDuration(task.totalSeconds)}
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => onRemoveTask(originalIndex)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[#94a3b8] transition hover:bg-[#fee2e2] hover:text-[#dc2626]"
                aria-label={`Remove ${task.name}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4"
                >
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}

        {visibleTasks.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#dbe4f0] bg-[#f8fbff] px-4 py-6 text-center text-sm text-[#64748b]">
            No tasks match your search.
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onOpenAddTask}
        className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f0] bg-white px-4 py-3 text-sm font-semibold text-[#334155] shadow-sm transition hover:bg-[#f8fbff]"
      >
        <span className="text-lg leading-none">+</span>
        <span>Add task</span>
      </button>
    </div>
  );
}
