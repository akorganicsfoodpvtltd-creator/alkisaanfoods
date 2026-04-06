import Image from "next/image";
//import { products } from "../../data/products";

export default async function ProductPage({ params }) {
  const { slug } = await params;   // 👈 Important line

  const product = products.find((p) => p.slug === slug);

  if (!product) return <h1>Product Not Found</h1>;

  return (
    <div className="px-16 py-10">
      <div className="flex gap-10">
        <div className="relative w-96 h-96">
          <Image
            src={product.img}
            alt={product.name}
            fill
            className="object-contain"
          />
        </div>

        <div>
          <h1 className="text-4xl font-bold text-green-700">{product.name}</h1>
          <p className="mt-3 text-gray-700 text-lg">{product.description}</p>

          <h2 className="mt-4 text-2xl font-semibold text-green-700">
            Starting Price: {product.weights[0].price} Rs
          </h2>

          <button className="mt-6 bg-green-600 text-white px-6 py-2 rounded">
            Order Now
          </button>
        </div>
      </div>
    </div>
  );
}
