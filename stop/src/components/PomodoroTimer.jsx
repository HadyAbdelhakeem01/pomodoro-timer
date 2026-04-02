import { useEffect, useState } from "react";

const MODES = {
  all: { label: "All" },
  short: { label: "Short Break" },
  long: { label: "Long Break" },
};

export default function PomodoroTimer({
  label,
  secondsLeft,
  totalSeconds,
  isRunning,
  onToggle,
  onReset,
  selectedMode,
  onSelectMode,
  presetsDisabled,
  onRemoveLabel,
}) {
  const radius = 145;
  const strokeWidth = 8;
  const knobRadius = 9;
  const progress =
    totalSeconds > 0
      ? Math.min(Math.max(secondsLeft / totalSeconds, 0), 1)
      : 0;
  const [animatedProgress, setAnimatedProgress] = useState(progress);
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - animatedProgress);

  const centerX = 170;
  const centerY = 170;
  const angle = animatedProgress * 2 * Math.PI - Math.PI / 2;
  const knobX = centerX + radius * Math.cos(angle);
  const knobY = centerY + radius * Math.sin(angle);

  useEffect(() => {
    setAnimatedProgress(progress);
  }, [progress, totalSeconds]);

  useEffect(() => {
    if (!isRunning || totalSeconds <= 0 || secondsLeft <= 0) {
      setAnimatedProgress(progress);
      return;
    }

    const nextProgress = Math.max((secondsLeft - 1) / totalSeconds, 0);
    let frameId;
    let startTime;

    const animate = (timestamp) => {
      if (startTime === undefined) {
        startTime = timestamp;
      }

      const elapsed = timestamp - startTime;
      const animationProgress = Math.min(elapsed / 1000, 1);
      const currentProgress =
        progress - (progress - nextProgress) * animationProgress;

      setAnimatedProgress(currentProgress);

      if (animationProgress < 1) {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    frameId = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(frameId);
  }, [isRunning, progress, secondsLeft, totalSeconds]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;

  return (
    <div className="rounded-[28px] border border-[#dfe8f3] bg-white p-5 shadow-[0_18px_54px_rgba(27,60,120,0.08)] sm:p-6">
      <div className="mb-8 grid grid-cols-3 rounded-2xl bg-[#f3f4f6] p-1">
        {Object.entries(MODES).map(([key, value]) => {
          const active = !presetsDisabled && selectedMode === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectMode(key)}
              className={`rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                active
                  ? "bg-[#4b8df8] text-white shadow-[0_6px_14px_rgba(75,141,248,0.35)]"
                  : "bg-transparent text-[#4b5563]"
              }`}
            >
              {value.label}
            </button>
          );
        })}
      </div>

      <div className="mb-8 flex justify-center">
        <div className="relative h-[300px] w-[300px] sm:h-[340px] sm:w-[340px]">
          <svg
            viewBox="0 0 340 340"
            className="h-full w-full drop-shadow-[0_4px_10px_rgba(75,141,248,0.18)]"
          >
            <circle
              cx="170"
              cy="170"
              r={radius}
              fill="none"
              stroke="#eef2f7"
              strokeWidth="14"
            />

            <circle
              cx="170"
              cy="170"
              r={radius}
              fill="none"
              stroke="#4b8df8"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${centerX} ${centerY})`}
            />

            <circle
              cx={knobX}
              cy={knobY}
              r={knobRadius}
              fill="#4b8df8"
              className="drop-shadow-[0_2px_6px_rgba(75,141,248,0.45)]"
            />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[60px] font-semibold tracking-[-0.04em] text-[#0f172a] sm:text-[72px]">
              {formattedTime}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-8 flex justify-center">
        <div className="flex max-w-full items-center gap-2 rounded-xl border border-[#e8edf5] bg-[#fbfcfe] px-4 py-3 text-[15px] font-medium text-[#4b5563] shadow-sm">
          <span className="block min-w-0 flex-1 truncate text-center">{label}</span>

          {onRemoveLabel ? (
            <button
              type="button"
              onClick={onRemoveLabel}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#94a3b8] transition hover:bg-[#fee2e2] hover:text-[#dc2626]"
              aria-label={`Remove ${label}`}
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
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={onReset}
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#e8edf5] bg-white text-[#374151] shadow-sm transition hover:bg-[#f8fafc]"
          aria-label="Reset timer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
          >
            <path d="M3 12a9 9 0 1 0 3-6.708" />
            <path d="M3 3v6h6" />
          </svg>
        </button>

        <button
          type="button"
          onClick={onToggle}
          className="flex h-12 min-w-[112px] items-center justify-center gap-2 rounded-xl bg-[#4b8df8] px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(75,141,248,0.35)] transition hover:brightness-105"
        >
          {isRunning ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
              >
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
              <span>Pause</span>
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M8 5.5v13l10-6.5-10-6.5Z" />
              </svg>
              <span>Start</span>
            </>
          )}
        </button>

        <button
          type="button"
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#e8edf5] bg-white text-[#111827] shadow-sm"
          aria-label="Settings placeholder"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5"
          >
            <circle cx="12" cy="12" r="8" />
            <circle cx="12" cy="12" r="2.6" fill="white" />
          </svg>
        </button>
      </div>
    </div>
  );
}
