import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Clock, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetMockTest } from "@workspace/api-client-react";
import { useExamTimer } from "@/hooks/useExamTimer";
import { MockTestInstructions } from "./MockTestInstructions";
import { MockTestResults } from "./MockTestResults";
import { supabase } from "@/lib/supabase";
import { API_BASE } from "@/lib/api";

type QuestionStatus = "not-visited" | "not-answered" | "answered" | "marked" | "marked-answered";

interface QuestionState {
  selectedOption: string | null;
  status: QuestionStatus;
}

export function MockTestExam() {
  const { id } = useParams<{ id: string }>();
  const testId = parseInt(id ?? "0", 10);
  const { data: test, isLoading } = useGetMockTest(testId, {
    query: { enabled: !!testId, queryKey: ["mock-test", testId] },
  });

  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionStates, setQuestionStates] = useState<QuestionState[]>([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { timeLeft, formattedTime, isWarning, start, pause, reset } = useExamTimer({
    initialSeconds: (test?.duration ?? 30) * 60,
    onTimeUp: () => handleSubmitTest(),
    autoSubmit: true,
  });

  useEffect(() => {
    if (test?.duration && !examStarted) {
      reset((test.duration ?? 30) * 60);
    }
  }, [test?.duration, examStarted, reset]);

  useEffect(() => {
    if (test && !examStarted) {
      setQuestionStates(
        test.questions.map(() => ({
          selectedOption: null,
          status: "not-visited" as QuestionStatus,
        }))
      );
    }
  }, [test, examStarted]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (examStarted && !examSubmitted) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [examStarted, examSubmitted]);

  const handleStartExam = () => {
    setExamStarted(true);
    start();
    // Mark first question as visited
    setQuestionStates((prev) => {
      const updated = [...prev];
      updated[0].status = "not-answered";
      return updated;
    });
  };

  const handleOptionSelect = (optionId: string) => {
    setQuestionStates((prev) => {
      const updated = [...prev];
      updated[currentQuestionIndex].selectedOption = optionId;
      return updated;
    });
  };

  const handleMarkForReview = () => {
    setQuestionStates((prev) => {
      const updated = [...prev];
      const current = updated[currentQuestionIndex];
      if (current.selectedOption) {
        current.status = "marked-answered";
      } else {
        current.status = "marked";
      }
      return updated;
    });
    if (currentQuestionIndex < (test?.questions.length ?? 0) - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      markQuestionAsVisited(currentQuestionIndex + 1);
    }
  };

  const handleClearResponse = () => {
    setQuestionStates((prev) => {
      const updated = [...prev];
      updated[currentQuestionIndex].selectedOption = null;
      updated[currentQuestionIndex].status = "not-answered";
      return updated;
    });
  };

  const handleSaveAndNext = () => {
    setQuestionStates((prev) => {
      const updated = [...prev];
      const current = updated[currentQuestionIndex];
      if (current.selectedOption) {
        current.status = "answered";
      } else {
        current.status = "not-answered";
      }
      return updated;
    });
    if (currentQuestionIndex < (test?.questions.length ?? 0) - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      markQuestionAsVisited(currentQuestionIndex + 1);
    }
  };

  const handleSubmitFromExam = () => {
    setQuestionStates((prev) => {
      const updated = [...prev];
      const current = updated[currentQuestionIndex];
      if (current.selectedOption) {
        current.status = "answered";
      } else {
        current.status = "not-answered";
      }
      return updated;
    });
    setShowSubmitModal(true);
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    markQuestionAsVisited(index);
  };

  const markQuestionAsVisited = (index: number) => {
    setQuestionStates((prev) => {
      const updated = [...prev];
      if (updated[index].status === "not-visited") {
        updated[index].status = "not-answered";
      }
      return updated;
    });
  };

  const handleSubmitTest = async () => {
    pause();
    if (!submitting && test) {
      setSubmitting(true);
      try {
        const userId = await getUserId();
        if (userId) {
          const correctMarks = test.correctMarks ?? 4;
          const incorrectMarks = test.incorrectMarks ?? -1;
          const unattemptedMarks = test.unattemptedMarks ?? 0;
          let correct = 0;
          let incorrect = 0;
          let unattempted = 0;
          questionStates.forEach((state, index) => {
            if (!state.selectedOption) {
              unattempted++;
            } else if (state.selectedOption === test.questions[index].correctAnswer) {
              correct++;
            } else {
              incorrect++;
            }
          });
          const score = (correct * correctMarks) + (incorrect * incorrectMarks) + (unattempted * unattemptedMarks);
          const maxScore = test.questions.length * correctMarks;
          const answers: Record<number, string | null> = {};
          questionStates.forEach((state, index) => {
            answers[index] = state.selectedOption;
          });
          const timeTaken = (test.duration ?? 30) * 60 - timeLeft;
          await fetch(`${API_BASE}/api/mock-test/results`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, mockTestId: test.id, score, maxScore, correct, incorrect, unattempted, timeTaken, answers }),
          });
        }
      } catch {
        // ignore
      }
    }
    setExamSubmitted(true);
    setShowSubmitModal(false);
  };

  const getUserId = async (): Promise<string | null> => {
    try {
      const { data } = await supabase.auth.getUser();
      return data.user?.id || null;
    } catch {
      return null;
    }
  };

  const getStatusCounts = () => {
    return questionStates.reduce(
      (acc, state) => {
        acc[state.status]++;
        return acc;
      },
      {
        "not-visited": 0,
        "not-answered": 0,
        "answered": 0,
        "marked": 0,
        "marked-answered": 0,
      } as Record<QuestionStatus, number>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4 max-w-3xl mx-auto">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
        <h2 className="font-serif text-2xl font-bold">Test not found</h2>
      </div>
    );
  }

  if (examSubmitted) {
    return <MockTestResults test={test} questionStates={questionStates} timeTaken={(test.duration * 60) - timeLeft} />;
  }

  if (!examStarted) {
    return <MockTestInstructions onStart={handleStartExam} />;
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-card-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="font-semibold text-lg">{test.title}</h1>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${isWarning ? "bg-red-100 text-red-700" : "bg-muted"}`}>
                <Clock className="h-4 w-4" />
                {formattedTime}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowSubmitModal(true)}
              className="text-sm"
            >
              Submit Test
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Question Panel */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-card-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline" className="text-sm">
                  Question {currentQuestionIndex + 1} of {test.questions.length}
                </Badge>
                <Badge variant="outline" className="text-sm">
                  +{test.correctMarks ?? 4} / {test.incorrectMarks ?? -1}
                </Badge>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-medium mb-4">{currentQuestion.question}</h2>
                {currentQuestion.questionImage && (
                  <img
                    src={currentQuestion.questionImage}
                    alt="Question"
                    className="max-w-full h-auto rounded-lg mb-4"
                  />
                )}
              </div>

              <div className="space-y-3">
                {["A", "B", "C", "D"].map((option) => (
                  <label
                    key={option}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      questionStates[currentQuestionIndex].selectedOption === option
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestionIndex}`}
                      value={option}
                      checked={questionStates[currentQuestionIndex].selectedOption === option}
                      onChange={() => handleOptionSelect(option)}
                      className="w-4 h-4"
                    />
                    <span className="font-medium text-primary">{option}.</span>
                    <span className="flex-1">
                      {(currentQuestion[`option${option}` as keyof typeof currentQuestion] as string) || "No option text"}
                    </span>
                  </label>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleMarkForReview}
                    className="text-sm"
                  >
                    Mark for Review & Next
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClearResponse}
                    className="text-sm"
                  >
                    Clear Response
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={goToPreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="text-sm"
                  >
                    Previous
                  </Button>
                  {currentQuestionIndex < (test?.questions.length ?? 0) - 1 ? (
                    <Button onClick={handleSaveAndNext} className="text-sm">
                      Save & Next
                    </Button>
                  ) : (
                    <Button onClick={handleSubmitFromExam} className="text-sm">
                      Submit Test
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Question Palette */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-card-border rounded-xl p-4 sticky top-20">
              <h3 className="font-semibold mb-4">Question Palette</h3>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-200" />
                  <span>Not Visited</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-500" />
                  <span>Not Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-purple-500" />
                  <span>Marked for Review</span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <div className="w-4 h-4 rounded bg-purple-500 relative">
                    <div className="absolute inset-1 bg-green-500 rounded-full" />
                  </div>
                  <span>Answered & Marked</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 mb-4 text-xs bg-muted/50 rounded-lg p-3">
                <div>Answered: <span className="font-bold">{statusCounts.answered + statusCounts["marked-answered"]}</span></div>
                <div>Not Answered: <span className="font-bold">{statusCounts["not-answered"]}</span></div>
                <div>Marked: <span className="font-bold">{statusCounts.marked + statusCounts["marked-answered"]}</span></div>
                <div>Not Visited: <span className="font-bold">{statusCounts["not-visited"]}</span></div>
              </div>

              {/* Palette Grid */}
              <div className="grid grid-cols-6 gap-2">
                {test.questions.map((_, index) => {
                  const state = questionStates[index];
                  const getStatusColor = () => {
                    switch (state.status) {
                      case "not-visited":
                        return "bg-gray-200 hover:bg-gray-300";
                      case "not-answered":
                        return "bg-red-500 hover:bg-red-600 text-white";
                      case "answered":
                        return "bg-green-500 hover:bg-green-600 text-white";
                      case "marked":
                        return "bg-purple-500 hover:bg-purple-600 text-white";
                      case "marked-answered":
                        return "bg-purple-500 hover:bg-purple-600 text-white relative";
                      default:
                        return "bg-gray-200";
                    }
                  };

                  return (
                    <button
                      key={index}
                      onClick={() => goToQuestion(index)}
                      className={`w-10 h-10 rounded font-medium text-sm transition-colors ${getStatusColor()} ${
                        index === currentQuestionIndex ? "ring-2 ring-primary ring-offset-2" : ""
                      }`}
                    >
                      {index + 1}
                      {state.status === "marked-answered" && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 bg-green-400 rounded-full" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowSubmitModal(false)}>
          <div className="bg-card border border-card-border rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif text-xl font-bold mb-4">Submit Test?</h3>
            
            <div className="bg-muted/50 rounded-lg p-4 mb-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span>Answered:</span>
                <span className="font-bold">{statusCounts.answered + statusCounts["marked-answered"]}</span>
              </div>
              <div className="flex justify-between">
                <span>Not Answered:</span>
                <span className="font-bold">{statusCounts["not-answered"]}</span>
              </div>
              <div className="flex justify-between">
                <span>Marked for Review:</span>
                <span className="font-bold">{statusCounts.marked + statusCounts["marked-answered"]}</span>
              </div>
              <div className="flex justify-between">
                <span>Not Visited:</span>
                <span className="font-bold">{statusCounts["not-visited"]}</span>
              </div>
            </div>

            {/* Mini Palette */}
            <div className="grid grid-cols-6 gap-1 mb-4">
              {test.questions.map((_, index) => {
                const state = questionStates[index];
                const getStatusColor = () => {
                  switch (state.status) {
                    case "not-visited": return "bg-gray-200";
                    case "not-answered": return "bg-red-500 text-white";
                    case "answered": return "bg-green-500 text-white";
                    case "marked": return "bg-purple-500 text-white";
                    case "marked-answered": return "bg-purple-500 text-white";
                    default: return "bg-gray-200";
                  }
                };
                return (
                  <button
                    key={index}
                    onClick={() => {
                      goToQuestion(index);
                      setShowSubmitModal(false);
                    }}
                    className={`w-8 h-8 rounded text-xs font-medium ${getStatusColor()}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1"
              >
                Back to Test
              </Button>
              <Button
                onClick={handleSubmitTest}
                className="flex-1"
              >
                Submit Test
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
