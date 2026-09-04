import { useState } from "react";
import { useParams, Link } from "wouter";
import { Clock, FileText, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetMockTest, getGetMockTestQueryKey } from "@workspace/api-client-react";

interface MockTestInstructionsProps {
  onStart: () => void;
}

export function MockTestInstructions({ onStart }: MockTestInstructionsProps) {
  const { id } = useParams<{ id: string }>();
  const testId = parseInt(id ?? "0", 10);
  const { data: test, isLoading } = useGetMockTest(testId, {
    query: { enabled: !!testId, queryKey: getGetMockTestQueryKey(testId) },
  });
  const [agreed, setAgreed] = useState(false);

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
        <FileText className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
        <h2 className="font-serif text-2xl font-bold">Test not found</h2>
        <Link href="/mock-tests"><Button variant="outline" className="mt-4">Back to Tests</Button></Link>
      </div>
    );
  }

  const totalMarks = test.questions.length * (test.correctMarks ?? 4);
  const correctMarks = test.correctMarks ?? 4;
  const incorrectMarks = test.incorrectMarks ?? -1;
  const unattemptedMarks = test.unattemptedMarks ?? 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/mock-tests">
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Tests
        </button>
      </Link>

      <div className="bg-card border border-card-border rounded-xl p-8 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground mb-2">{test.title}</h1>
            <p className="text-muted-foreground">{test.description}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg">
            <Clock className="h-4 w-4" />
            <span>{test.duration} minutes</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{test.questions.length}</div>
            <div className="text-sm text-muted-foreground">Questions</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{test.duration}</div>
            <div className="text-sm text-muted-foreground">Minutes</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{totalMarks}</div>
            <div className="text-sm text-muted-foreground">Total Marks</div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Instructions
          </h2>
          <div className="bg-muted/30 rounded-lg p-6 space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-primary font-bold">1.</span>
              <p>The test contains {test.questions.length} questions to be completed in {test.duration} minutes.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-primary font-bold">2.</span>
              <p>Each correct answer carries +{correctMarks} marks. Each incorrect answer carries {incorrectMarks} mark{incorrectMarks !== 1 ? 's' : ''} (negative marking). Unattempted questions carry {unattemptedMarks} marks.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-primary font-bold">3.</span>
              <p>Questions marked for review will not be considered for evaluation unless answered.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-primary font-bold">4.</span>
              <p>You can navigate between questions using the question palette or navigation buttons.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-primary font-bold">5.</span>
              <p>The timer will start automatically when you click "Start Test". The test will auto-submit when time expires.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-primary font-bold">6.</span>
              <p>Do not close or refresh the browser window during the test, as your progress may be lost.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-primary font-bold">7.</span>
              <p>Ensure you have a stable internet connection throughout the test.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="rounded w-4 h-4"
            />
            <span className="text-sm">I have read and understood the instructions</span>
          </label>
        </div>

        <Button
          onClick={onStart}
          disabled={!agreed}
          className="w-full mt-4"
          size="lg"
        >
          Start Test
        </Button>
      </div>
    </div>
  );
}
