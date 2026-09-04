import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { Clock, CheckCircle, XCircle, ArrowRight, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetMockTest, getGetMockTestQueryKey } from "@workspace/api-client-react";

export function QuizEngine() {
  const { id } = useParams<{ id: string }>();
  const testId = parseInt(id ?? "0", 10);
  const [, setLocation] = useLocation();

  const { data: test, isLoading } = useGetMockTest(testId, {
    query: { enabled: !!testId, queryKey: getGetMockTestQueryKey(testId) },
  });

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (test) setTimeLeft(test.duration * 60);
  }, [test]);

  const finish = useCallback(() => setFinished(true), []);

  useEffect(() => {
    if (!started || finished || timeLeft === null) return;
    if (timeLeft <= 0) { finish(); return; }
    const t = setInterval(() => setTimeLeft((s) => (s !== null ? s - 1 : null)), 1000);
    return () => clearInterval(t);
  }, [started, finished, timeLeft, finish]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-16 text-center"><div className="animate-pulse h-8 bg-muted rounded w-64 mx-auto" /></div>;
  }

  if (!test) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="font-serif text-2xl">Test not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => setLocation("/mock-tests")}>Back to Tests</Button>
      </div>
    );
  }

  const questions = test.questions ?? [];

  // Start screen
  if (!started) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg text-center">
        <div className="bg-card border border-card-border rounded-2xl p-8">
          <Trophy className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="font-serif text-3xl font-bold mb-2">{test.title}</h1>
          <p className="text-muted-foreground mb-6">{test.description}</p>
          <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
            <div className="bg-muted rounded-lg p-3">
              <div className="font-bold text-foreground text-xl">{test.questionCount}</div>
              <div className="text-muted-foreground">Questions</div>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <div className="font-bold text-foreground text-xl">{test.duration}</div>
              <div className="text-muted-foreground">Minutes</div>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <div className="font-bold text-foreground text-xl">{test.subject}</div>
              <div className="text-muted-foreground">Subject</div>
            </div>
          </div>
          <Button className="w-full" onClick={() => setStarted(true)} data-testid="button-start-quiz">
            Start Test
          </Button>
        </div>
      </div>
    );
  }

  // Score screen
  if (finished) {
    const correct = questions.filter((q) => answers[q.id] === q.correctAnswer).length;
    const total = questions.length;
    const pct = total ? Math.round((correct / total) * 100) : 0;

    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl" data-testid="score-summary">
        <div className="bg-card border border-card-border rounded-2xl p-8 text-center mb-6">
          <Trophy className="h-14 w-14 text-primary mx-auto mb-4" />
          <h1 className="font-serif text-4xl font-bold mb-1">{pct}%</h1>
          <p className="text-muted-foreground text-lg">{correct} / {total} correct</p>
          <div className="w-full bg-muted rounded-full h-3 mt-4">
            <div className="bg-primary h-3 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            {pct >= 80 ? "Excellent work!" : pct >= 60 ? "Good effort!" : "Keep practising!"}
          </p>
        </div>

        <div className="space-y-4">
          {questions.map((q, i) => {
            const userAnswer = answers[q.id];
            const isCorrect = userAnswer === q.correctAnswer;
            return (
              <div key={q.id} className={`bg-card border rounded-xl p-4 ${isCorrect ? "border-green-200" : "border-red-200"}`}>
                <div className="flex items-start gap-2 mb-2">
                  {isCorrect ? <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> : <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />}
                  <p className="text-sm font-medium">{i + 1}. {q.question}</p>
                </div>
                <p className="text-xs text-muted-foreground ml-7">Your answer: <span className={isCorrect ? "text-green-600" : "text-red-600"}>{userAnswer ?? "Not answered"}</span> &bull; Correct: <span className="text-green-600">{q.correctAnswer}</span></p>
                {q.solution && <p className="text-xs text-muted-foreground ml-7 mt-1">{q.solution}</p>}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => { setAnswers({}); setCurrent(0); setFinished(false); setStarted(false); setTimeLeft(test.duration * 60); }}>
            Retake Test
          </Button>
          <Button className="flex-1" onClick={() => setLocation("/mock-tests")}>Back to Tests</Button>
        </div>
      </div>
    );
  }

  const q = questions[current];
  if (!q) return null;

  const opts = [
    { key: "A", val: q.optionA },
    { key: "B", val: q.optionB },
    { key: "C", val: q.optionC },
    { key: "D", val: q.optionD },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-medium text-muted-foreground">Question {current + 1} of {questions.length}</span>
        <div className={`flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full ${timeLeft !== null && timeLeft < 60 ? "bg-red-100 text-red-600" : "bg-muted text-foreground"}`} data-testid="timer">
          <Clock className="h-4 w-4" />
          {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-1.5 mb-8">
        <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
      </div>

      {/* Question */}
      <div className="bg-card border border-card-border rounded-xl p-6 mb-6">
        <p className="font-medium text-foreground text-lg leading-relaxed" data-testid="question-text">{q.question}</p>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-8">
        {opts.map((opt) => {
          const selected = answers[q.id] === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.key }))}
              className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 ${
                selected
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-card-border bg-card hover:border-primary/40 hover:bg-muted/50"
              }`}
              data-testid={`option-${opt.key}`}
            >
              <span className={`shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold ${selected ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                {opt.key}
              </span>
              {opt.val}
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0}>
          Previous
        </Button>
        {current < questions.length - 1 ? (
          <Button onClick={() => setCurrent((c) => c + 1)} data-testid="button-next">
            Next <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={finish} data-testid="button-submit-quiz">
            Submit Test
          </Button>
        )}
      </div>
    </div>
  );
}
