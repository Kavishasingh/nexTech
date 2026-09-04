import { useState, useEffect, useCallback } from "react";

interface UseExamTimerOptions {
  initialSeconds: number;
  onTimeUp?: () => void;
  autoSubmit?: boolean;
}

export function useExamTimer({ initialSeconds, onTimeUp, autoSubmit = true }: UseExamTimerOptions) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback((seconds?: number) => {
    setTimeLeft(seconds ?? initialSeconds);
    setIsRunning(false);
  }, [initialSeconds]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (autoSubmit && onTimeUp) {
            onTimeUp();
          }
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, autoSubmit, onTimeUp]);

  const isWarning = timeLeft <= 300 && timeLeft > 0; // Last 5 minutes

  return {
    timeLeft,
    formattedTime: formatTime(timeLeft),
    isRunning,
    isWarning,
    start,
    pause,
    reset,
  };
}
