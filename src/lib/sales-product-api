const ProductCatalog = () => {
  const [products, setProducts] = useState([]);

  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map(product => (
        <div key={product.prodCode} className="border p-4 shadow-sm">
          <h3>{product.name}</h3>
          <p>Code: {product.prodCode}</p>
          {/* Read-only price fetch */}
          <p className="font-bold">Price: ${product.currentPrice}</p>
          <button className="bg-blue-100 text-blue-800 cursor-not-allowed" disabled>
            View History (Read Only)
          </button>
        </div>
      ))}
    </div>
  );
};
