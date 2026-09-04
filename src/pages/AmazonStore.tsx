import { ShoppingCart, ExternalLink, Package, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useListAmazonProducts } from "@workspace/api-client-react";

export function AmazonStore() {
  const { data: products, isLoading } = useListAmazonProducts();

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <Link href="/">
          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ChevronLeft className="h-4 w-4" /> Back to Home
          </button>
        </Link>
        <div className="flex items-center gap-2 mb-2">
          <ShoppingCart className="h-6 w-6 text-primary" />
          <Badge variant="outline" className="text-xs">Amazon Affiliate</Badge>
        </div>
        <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Recommended Books</h1>
        <p className="text-muted-foreground">Handpicked study resources available on Amazon. Clicking a link may earn us a small commission.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-72 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : !products || products.length === 0 ? (
        <div className="text-center py-24">
          <Package className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-serif text-xl font-medium">No products yet</h3>
          <p className="text-muted-foreground text-sm mt-1">Products will appear here once added by the admin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-card border border-card-border rounded-xl overflow-hidden hover:shadow-md transition-shadow group"
              data-testid={`card-amazon-${product.id}`}
            >
              <div className="bg-muted h-48 flex items-center justify-center">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Amazon image load error:', product.imageUrl, e);
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                    onLoad={() => console.log('Amazon image loaded successfully:', product.imageUrl)}
                  />
                ) : (
                  <div className="flex flex-col items-center text-muted-foreground/40">
                    <Package className="h-14 w-14" />
                    <span className="text-xs mt-2">No image</span>
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-serif text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {product.title}
                </h3>
                <p className="text-muted-foreground text-sm mt-2 line-clamp-3">{product.description}</p>
                <div className="flex items-center justify-between mt-4">
                  {product.price && (
                    <span className="font-bold text-foreground">{product.price}</span>
                  )}
                  <a
                    href={product.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto"
                    data-testid={`link-buy-amazon-${product.id}`}
                  >
                    <Button size="sm" className="gap-1.5">
                      Buy on Amazon <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
