import { useEffect, useMemo, useState } from "react";
import {
  DataErrorBoundary,
  DataErrorState,
  DataLoadingState,
} from "../components/DataStates";
import {
  Pagination,
} from "../components/Pagination";
import {
  clampPage,
  getPageItems,
} from "../lib/pagination";
import { getCurrentPrice, getProducts } from "../lib/sales-product-api";
import { useRights } from "../hooks/useRights";

function StatCard({ label, value, note }) {
  return (
    <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-emerald-700">{note}</p>
    </div>
  );
}

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
  const { hasRight } = useRights();
  const canViewPrice = hasRight("PRICE_VIEW");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

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

  const stats = useMemo(() => {
    const prices = products
      .map((p) => Number(getUnitPrice(p.currentPrice)))
      .filter((p) => p > 0);
    if (prices.length === 0) return { total: products.length, highest: 0, lowest: 0, average: 0 };
    const highest = Math.max(...prices);
    const lowest = Math.min(...prices);
    const average = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    return { total: products.length, highest, lowest, average };
  }, [products]);

  if (loading) return <DataLoadingState label="Loading product catalogue..." />;
  if (error) return <DataErrorState message={error} />;

  const totalPages = Math.ceil(products.length / pageSize);
  const currentPage = clampPage(page, totalPages);
  const pagedProducts = getPageItems(products, currentPage, pageSize);

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">
          Product Catalogue
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Read-only catalogue with current prices from the latest price history.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total products" value={stats.total} note="In catalogue" />
          {canViewPrice && <StatCard label="Highest price" value={`$${stats.highest.toFixed(2)}`} note="Most expensive" />}
          {canViewPrice && <StatCard label="Lowest price" value={`$${stats.lowest.toFixed(2)}`} note="Least expensive" />}
          {canViewPrice && <StatCard label="Average price" value={`$${stats.average.toFixed(2)}`} note="Across all products" />}
        </div>
      </div>

      <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-emerald-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Prod Code</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Unit</th>
                {canViewPrice && <th className="px-4 py-3">Current Price</th>}
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
                  {canViewPrice && (
                    <td className="px-4 py-4 font-semibold text-slate-900">
                      ${getUnitPrice(product.currentPrice)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          page={currentPage}
          pageSize={pageSize}
          total={products.length}
          onPageChange={setPage}
          onPageSizeChange={(n) => { setPageSize(n); setPage(1); }}
        />
      </div>
    </section>
  );
}
