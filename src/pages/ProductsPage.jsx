import { useEffect, useState } from "react";
import {
  DataErrorBoundary,
  DataErrorState,
  DataLoadingState,
} from "../components/DataStates";
import {
  Pagination,
} from "../components/Pagination";
import {
  PAGE_SIZE,
  clampPage,
  getPageItems,
} from "../lib/pagination";
import { getCurrentPrice, getProducts } from "../lib/sales-product-api";

function getProdCode(product) {
  return product.prodcode || product.prodCode;
}

function getUnitPrice(price) {
  return price?.unitprice || price?.unitPrice || 0;
}

export function ProductsPage() {
  return (
    <DataErrorBoundary>
      <ProductCatalogueContent />
    </DataErrorBoundary>
  );
}

function ProductCatalogueContent() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      setLoading(true);
      setError(null);
      try {
        const productData = await getProducts();
        const pricedProducts = await Promise.all(
          productData.map(async (product) => ({
            ...product,
            currentPrice: await getCurrentPrice(getProdCode(product)),
          })),
        );

        if (isMounted) setProducts(pricedProducts);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <DataLoadingState label="Loading product catalogue..." />;
  if (error) return <DataErrorState message={error} />;

  const totalPages = Math.ceil(products.length / PAGE_SIZE);
  const currentPage = clampPage(page, totalPages);
  const pagedProducts = getPageItems(products, currentPage);

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">
          Product Catalogue
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Read-only catalogue with current prices from the latest price history.
        </p>
      </div>

      <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-emerald-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Prod Code</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Current Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 border-t border-slate-100">
              {pagedProducts.map((product) => (
                <tr key={getProdCode(product)} className="hover:bg-emerald-50/50">
                  <td className="px-4 py-4 font-medium text-slate-900">
                    {getProdCode(product)}
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    {product.description}
                  </td>
                  <td className="px-4 py-4 text-slate-600">{product.unit}</td>
                  <td className="px-4 py-4 font-semibold text-slate-900">
                    ${getUnitPrice(product.currentPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          page={currentPage}
          total={products.length}
          onPageChange={setPage}
        />
      </div>
    </section>
  );
}
