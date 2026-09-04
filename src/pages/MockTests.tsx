import { Clock, FileQuestion, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useListMockTests } from "@workspace/api-client-react";

export function MockTests() {
  const { data: tests, isLoading } = useListMockTests();

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Mock Tests</h1>
        <p className="text-muted-foreground">Practise with timed mock exams and get instant score reports.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : !tests || tests.length === 0 ? (
        <div className="text-center py-24">
          <FileQuestion className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-serif text-xl font-medium">No mock tests yet</h3>
          <p className="text-muted-foreground text-sm mt-1">Tests will appear here once added by the admin.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tests.map((test) => (
            <div
              key={test.id}
              className="bg-card border border-card-border rounded-xl p-5 flex items-center justify-between hover:shadow-md transition-shadow"
              data-testid={`card-mocktest-${test.id}`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">{test.subject}</Badge>
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground">{test.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{test.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{test.duration} minutes</span>
                  <span className="flex items-center gap-1"><FileQuestion className="h-3 w-3" />{test.questionCount} questions</span>
                </div>
              </div>
              <Link href={`/mock-tests/${test.id}`} data-testid={`button-start-test-${test.id}`}>
                <Button className="ml-4 shrink-0">
                  Start Test <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
