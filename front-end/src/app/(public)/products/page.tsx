import { Input } from "@/components/ui/input";
import { getProducts } from "@/features/product/api/product.api";
import ProductCard from "@/features/product/components/ProductCard";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">
          Sản Phẩm Chăm Sóc Tại Nhà
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Mang trải nghiệm spa về nhà với các sản phẩm cao cấp được chuyên gia
          của chúng tôi tin dùng.
        </p>
      </header>

      <div className="mb-8 max-w-md mx-auto">
        <Input
          type="search"
          placeholder="Tìm kiếm sản phẩm..."
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
