import { CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

interface MockTestResultsProps {
  test: any;
  questionStates: any[];
  timeTaken: number;
}

export function MockTestResults({ test, questionStates, timeTaken }: MockTestResultsProps) {
  const calculateScore = () => {
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    test.questions.forEach((question: any, index: number) => {
      const state = questionStates[index];
      if (!state.selectedOption) {
        unattempted++;
      } else if (state.selectedOption === question.correctAnswer) {
        correct++;
      } else {
        incorrect++;
      }
    });

    const correctMarks = test.correctMarks ?? 4;
    const incorrectMarks = test.incorrectMarks ?? -1;
    const unattemptedMarks = test.unattemptedMarks ?? 0;
    const totalScore = (correct * correctMarks) + (incorrect * incorrectMarks) + (unattempted * unattemptedMarks);
    const maxScore = test.questions.length * correctMarks;

    return { correct, incorrect, unattempted, totalScore, maxScore, correctMarks, incorrectMarks, unattemptedMarks };
  };

  const { correct, incorrect, unattempted, totalScore, maxScore, correctMarks, incorrectMarks, unattemptedMarks } = calculateScore();

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link href="/mock-tests">
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Tests
        </button>
      </Link>

      {/* Score Summary */}
      <div className="bg-card border border-card-border rounded-xl p-8 mb-6">
        <h1 className="font-serif text-3xl font-bold mb-6">Test Results</h1>
        
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-700">{totalScore}</div>
            <div className="text-sm text-green-600">Total Score</div>
            <div className="text-xs text-green-500 mt-1">/ {maxScore}</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-700">{correct}</div>
            <div className="text-sm text-blue-600">Correct</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-red-700">{incorrect}</div>
            <div className="text-sm text-red-600">Incorrect</div>
                  <div className="text-xs text-red-500 mt-1">({incorrectMarks >= 0 ? '+' : ''}{incorrectMarks} each)</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-gray-700">{unattempted}</div>
            <div className="text-sm text-gray-600">Unattempted</div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-muted-foreground bg-muted/50 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Time Taken: {formatTime(timeTaken)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Duration: {test.duration} minutes</span>
          </div>
        </div>
      </div>

      {/* Question Breakdown */}
      <div className="bg-card border border-card-border rounded-xl p-6">
        <h2 className="font-semibold text-lg mb-4">Question Breakdown</h2>
        
        <div className="space-y-4">
          {test.questions.map((question: any, index: number) => {
            const state = questionStates[index];
            const isCorrect = state.selectedOption === question.correctAnswer;
            const isAttempted = state.selectedOption !== null;

            return (
              <div
                key={index}
                className={`border rounded-lg p-4 ${isCorrect ? "border-green-200 bg-green-50/30" : isAttempted ? "border-red-200 bg-red-50/30" : "border-border"}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Q{index + 1}</Badge>
                    {isCorrect ? (
                      <Badge className="bg-green-100 text-green-700">Correct</Badge>
                    ) : isAttempted ? (
                      <Badge className="bg-red-100 text-red-700">Incorrect</Badge>
                    ) : (
                      <Badge variant="secondary">Not Attempted</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    +{correctMarks} / {incorrectMarks} / {unattemptedMarks}
                  </div>
                </div>

                <p className="font-medium mb-3">{question.question}</p>

                {question.questionImage && (
                  <img
                    src={question.questionImage}
                    alt="Question"
                    className="max-w-full h-auto rounded-lg mb-3"
                  />
                )}

                <div className="space-y-2 mb-3">
                  {["A", "B", "C", "D"].map((option) => {
                    const isSelected = state.selectedOption === option;
                    const isCorrectOption = question.correctAnswer === option;
                    
                    return (
                      <div
                        key={option}
                        className={`flex items-center gap-3 p-2 rounded ${
                          isCorrectOption
                            ? "bg-green-100 border border-green-300"
                            : isSelected && !isCorrect
                            ? "bg-red-100 border border-red-300"
                            : "bg-muted/30"
                        }`}
                      >
                        <span className="font-medium text-sm w-6">{option}.</span>
                        <span className="flex-1 text-sm">{question[`option${option}`] as string}</span>
                        {isCorrectOption && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {isSelected && !isCorrect && <XCircle className="h-4 w-4 text-red-600" />}
                      </div>
                    );
                  })}
                </div>

                {question.solution && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-800 mb-1">Solution:</p>
                    <p className="text-sm text-blue-700">{question.solution}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
