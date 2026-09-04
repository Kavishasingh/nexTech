import { useSearch } from "wouter";
import { FileText, ShoppingCart, FileQuestion, SearchIcon, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useGlobalSearch, getGlobalSearchQueryKey } from "@workspace/api-client-react";

export function SearchResults() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const q = params.get("q") ?? "";

  const { data, isLoading } = useGlobalSearch(
    { q },
    { query: { enabled: !!q, queryKey: getGlobalSearchQueryKey({ q }) } }
  );

  const total = (data?.documents?.length ?? 0) + (data?.amazonProducts?.length ?? 0) + (data?.mockTests?.length ?? 0);

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="mb-8">
        <Link href="/">
          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ChevronLeft className="h-4 w-4" /> Back to Home
          </button>
        </Link>
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
          <SearchIcon className="h-4 w-4" />
          <span>Search results for</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-foreground">"{q}"</h1>
        {!isLoading && <p className="text-muted-foreground text-sm mt-1">{total} result{total !== 1 ? "s" : ""} found</p>}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)}
        </div>
      ) : total === 0 ? (
        <div className="text-center py-20">
          <SearchIcon className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-serif text-xl">No results found</h3>
          <p className="text-muted-foreground text-sm mt-1">Try a different search term.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {(data?.documents?.length ?? 0) > 0 && (
            <section>
              <h2 className="font-serif text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Study Materials
              </h2>
              <div className="space-y-2">
                {data!.documents.map((doc) => (
                  <Link href={`/study-material/${doc.id}`} key={doc.id} data-testid={`search-doc-${doc.id}`}>
                    <div className="bg-card border border-card-border rounded-xl p-4 hover:shadow-sm transition-shadow cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs capitalize">{doc.category.replace(/-/g, " ")}</Badge>
                        <Badge className={`text-xs ${doc.isFree ? "bg-green-100 text-green-700 border-green-200" : "bg-primary text-primary-foreground"}`}>
                          {doc.isFree ? "FREE" : `₹${doc.price}`}
                        </Badge>
                      </div>
                      <h3 className="font-medium text-foreground hover:text-primary transition-colors">{doc.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{doc.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {(data?.amazonProducts?.length ?? 0) > 0 && (
            <section>
              <h2 className="font-serif text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" /> Amazon Products
              </h2>
              <div className="space-y-2">
                {data!.amazonProducts.map((p) => (
                  <a href={p.affiliateUrl} target="_blank" rel="noopener noreferrer" key={p.id} data-testid={`search-amazon-${p.id}`}>
                    <div className="bg-card border border-card-border rounded-xl p-4 hover:shadow-sm transition-shadow">
                      <h3 className="font-medium text-foreground hover:text-primary transition-colors">{p.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{p.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {(data?.mockTests?.length ?? 0) > 0 && (
            <section>
              <h2 className="font-serif text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <FileQuestion className="h-5 w-5 text-primary" /> Mock Tests
              </h2>
              <div className="space-y-2">
                {data!.mockTests.map((t) => (
                  <Link href={`/mock-tests/${t.id}`} key={t.id} data-testid={`search-test-${t.id}`}>
                    <div className="bg-card border border-card-border rounded-xl p-4 hover:shadow-sm transition-shadow cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">{t.subject}</Badge>
                      </div>
                      <h3 className="font-medium text-foreground hover:text-primary transition-colors">{t.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{t.duration} min &bull; {t.questionCount} questions</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
