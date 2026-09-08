import { Badge } from "@/components/ui/badge";
import { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StockBadge({ product, className }: { product: Product; className?: string }) {
  if (product.stock === 0) {
    return (
      <Badge variant="destructive" className={className}>
        Agotado
      </Badge>
    );
  }
  if (product.stock <= product.minStock) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "border-amber-400 bg-amber-100 text-amber-800",
          className
        )}
      >
        Últimas {product.stock}
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className={className}>
      En stock
    </Badge>
  );
}
