"use client";
import { useEffect, useState } from "react";

export default function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
   fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  }, []);

  if (products.length === 0) return <p>Loading products...</p>;

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Our Products</h1>
      <div className="grid grid-cols-3 gap-6">
        {products.map((p) => (
          <div key={p.id} className="border p-4 shadow rounded">
            <img src={p.image} alt={p.name} className="w-full h-48 object-cover" />
            <h2 className="font-bold mt-3">{p.name}</h2>
            <p>{p.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
