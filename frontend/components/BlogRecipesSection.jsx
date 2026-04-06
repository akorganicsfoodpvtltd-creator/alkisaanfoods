"use client";

export default function BlogRecipesSection() {
  const recipes = [
    {
      id: 1,
      title: "Al Kissan Multigrain Flour",
     
      videoId: "Fc-TfW6UlLc"
    },
    {
      id: 2,
      title: "Al Kissan Gluten Free Flour",
      
      videoId: "2t-Zy4bw8Xw"
    }
  ];

  return (
    <section id="recipes" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-white to-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center justify-center gap-3 mb-6">
            <div className="h-1 w-20 bg-green-500 rounded-full"></div>
            <span className="text-green-600 font-semibold text-sm uppercase tracking-widest">
              FROM AL KISSAN KITCHEN
            </span>
            <div className="h-1 w-20 bg-green-500 rounded-full"></div>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Blog & <span className="text-green-700">Recipes</span>
          </h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
            Discover delicious recipes crafted with our premium quality flours
          </p>
        </div>

        {/* Recipes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {recipes.map((recipe) => (
            <div 
              key={recipe.id}
              className="rounded-3xl bg-white shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500"
            >
              {/* YouTube Video Embed */}
              <div className="relative w-full h-64 md:h-80">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${recipe.videoId}`}
                  title={recipe.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{recipe.title}</h3>
                <p className="text-gray-600">{recipe.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}