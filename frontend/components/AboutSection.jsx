export default function AboutSection() {
  return (
    <div id="about" className="mt-20 px-4 sm:px-6 md:px-16 font-sans bg-white">
      {/* Section Header */}
      <div className="text-center mb-12 md:mb-16">
        <div className="inline-flex items-center justify-center gap-3 mb-4">
          <div className="h-1 w-8 sm:w-10 md:w-12 bg-green-500 rounded-full"></div>
          <span className="text-green-600 font-semibold text-xs sm:text-sm uppercase tracking-wider">
            Our Story
          </span>
          <div className="h-1 w-8 sm:w-10 md:w-12 bg-green-500 rounded-full"></div>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 mb-4">
          About <span className="text-green-700">Al Kissan Foods</span>
        </h2>

        <p className="text-gray-600 text-base sm:text-lg md:text-xl max-w-3xl mx-auto px-4">
          Where purity meets perfection in every product
        </p>
      </div>

      {/* Main Content with Clear Background Image - Text directly on image */}
      <div className="relative rounded-3xl shadow-xl p-6 sm:p-8 md:p-12 mb-12 md:mb-20 mx-4 sm:mx-0 overflow-hidden">
        {/* Clear Background Image - No Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/aboutback.jpeg" 
            className="w-full h-full object-cover"
            alt="About background"
          />
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-center">
            {/* Video from Cloudinary - YOUR SPECIFIC URL APPLIED */}
            <div className="w-full overflow-hidden rounded-2xl shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
              <video
                src="https://res.cloudinary.com/drq7cljyn/video/upload/v1769703498/allvideo_irzjh8.mp4"
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            </div>

            {/* Text directly on background image - No white background */}
            <div className="px-2 sm:px-4">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white mb-4 drop-shadow-lg">
                We Believe in Pure & Natural Food
              </h3>
              <p className="text-white/95 leading-relaxed text-base sm:text-lg md:text-lg drop-shadow-md">
                Al Kissan Foods delivers pure, natural, and high-quality flour
                products from Pakistan. Specializing in Multigrain, Gluten-Free,
                and Barley Flour, we ensure nutrition, safety, and quality from
                farm to table.
                 <strong className="block mt-2 text-green-600 text-lg sm:text-xl drop-shadow-lg">
                  Al Kissan Foods — Live Natural. Eat Healthy.
                </strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Vision Mission Goals - Animated Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 mt-12 mb-20">
        
        {/* Vision Card */}
        <div className="group relative bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden 
                       transition-all duration-300 ease-out hover:scale-105 hover:shadow-2xl hover:border-green-300
                       hover:z-10 min-h-[300px] flex flex-col transform hover:-translate-y-2">
          <div className="p-6 sm:p-8 flex-1 flex flex-col">
            {/* Top Row: Logos + Title in Perfect Center */}
            <div className="flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300">
                <img 
                  src="/leftweat.webp" 
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                  alt="Left wheat icon"
                  loading="lazy"
                />
              </div>
              
              <div className="mx-3 flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-2xl font-bold text-green-900 text-center leading-tight
                             group-hover:text-green-700 transition-colors duration-300">
                  Our Vision
                </h3>
              </div>
              
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center transform group-hover:-rotate-6 transition-transform duration-300">
                <img 
                  src="/rightweat.webp" 
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                  alt="Right wheat icon"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Text Content */}
            <div className="px-2 flex-1 flex items-center transform group-hover:scale-105 transition-transform duration-300">
              <p className="text-gray-800 leading-relaxed text-sm sm:text-base md:text-sm lg:text-base text-justify w-full">
                To become a leading and trusted food brand that delivers pure, high-quality
                products while supporting farmers and promoting sustainable agriculture.
              </p>
            </div>
          </div>
          
          {/* Animated Bottom Border */}
          <div className="h-2 bg-gradient-to-r from-green-300 via-green-500 to-green-300 
                        group-hover:from-green-400 group-hover:via-green-600 group-hover:to-green-400
                        transition-all duration-300"></div>
        </div>

        {/* Mission Card */}
        <div className="group relative bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden 
                       transition-all duration-300 ease-out hover:scale-105 hover:shadow-2xl hover:border-green-300
                       hover:z-10 min-h-[300px] flex flex-col transform hover:-translate-y-2">
          <div className="p-6 sm:p-8 flex-1 flex flex-col">
            {/* Top Row: Logos + Title in Perfect Center */}
            <div className="flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300">
                <img 
                  src="/leftweat.webp" 
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                  alt="Left wheat icon"
                  loading="lazy"
                />
              </div>
              
              <div className="mx-3 flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-2xl font-bold text-green-900 text-center leading-tight
                             group-hover:text-green-700 transition-colors duration-300">
                  Our Mission
                </h3>
              </div>
              
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center transform group-hover:-rotate-6 transition-transform duration-300">
                <img 
                  src="/rightweat.webp" 
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                  alt="Right wheat icon"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Text Content - Mission */}
            <div className="px-2 flex-1 flex items-center transform group-hover:scale-105 transition-transform duration-300">
              <p className="text-gray-800 leading-relaxed text-xs sm:text-sm md:text-xs lg:text-sm text-justify w-full">
                To provide safe, nutritious, and high-quality food made from responsibly sourced ingredients,
                maintaining strict quality standards and delivering products families can trust every day.
              </p>
            </div>
          </div>
          
          {/* Animated Bottom Border */}
          <div className="h-2 bg-gradient-to-r from-green-400 via-green-600 to-green-400
                        group-hover:from-green-500 group-hover:via-green-700 group-hover:to-green-500
                        transition-all duration-300"></div>
        </div>

        {/* Goals Card */}
        <div className="group relative bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden 
                       transition-all duration-300 ease-out hover:scale-105 hover:shadow-2xl hover:border-green-300
                       hover:z-10 min-h-[300px] flex flex-col transform hover:-translate-y-2">
          <div className="p-6 sm:p-8 flex-1 flex flex-col">
            {/* Top Row: Logos + Title in Perfect Center */}
            <div className="flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300">
                <img 
                  src="/leftweat.webp" 
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                  alt="Left wheat icon"
                  loading="lazy"
                />
              </div>
              
              <div className="mx-3 flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-2xl font-bold text-green-900 text-center leading-tight
                             group-hover:text-green-700 transition-colors duration-300">
                  Our Goals
                </h3>
              </div>
              
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center transform group-hover:-rotate-6 transition-transform duration-300">
                <img 
                  src="/rightweat.webp" 
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                  alt="Right wheat icon"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Text Content */}
            <div className="px-2 flex-1 flex items-center transform group-hover:scale-105 transition-transform duration-300">
              <p className="text-gray-800 leading-relaxed text-sm sm:text-base md:text-sm lg:text-base text-justify w-full">
                Expand product range with innovative flour variants, achieve
                nationwide distribution, and establish Al Kissan Foods as a symbol of
                trust in natural food products.
              </p>
            </div>
          </div>
          
          {/* Animated Bottom Border */}
          <div className="h-2 bg-gradient-to-r from-green-300 via-green-500 to-green-300 
                        group-hover:from-green-400 group-hover:via-green-600 group-hover:to-green-400
                        transition-all duration-300"></div>
        </div>
      </div>
    </div>
  );
}
