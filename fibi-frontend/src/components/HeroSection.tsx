
// export default function HeroSection() {
//   return (
//     /* 1. Make the container relative and set a minimum height */
//     <div className="relative min-h-[600px] flex items-center px-6 py-20 overflow-hidden">
      
//       {/* 2. The Background Image */}
//       <div className="absolute inset-0 z-0">
//         <img 
//           src="/kenya-image.jpg" 
//           alt="Background" 
//           className="h-full w-full object-cover"
//         />
//         {/* 3. An overlay to ensure text remains readable */}
//         <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/95 via-emerald-50/80 to-blue-50/30" />
//       </div>

//       {/* 4. The Content (placed above the background with z-10) */}
//       <div className="relative z-10 max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
        
//         <div className="text-center md:text-left">
//           <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 text-balance">
//             Invest Together · Profit Together
//           </h1>

//           <p className="text-xl text-gray-700 mb-8 max-w-xl">
//             We buy land together and add value with eco-friendly structures that generate 
//             <span className="font-semibold text-primary"> residual income from day one</span> — 
//             with transparent, fair profit sharing.
//           </p>

//           <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
//             <a 
//               href="/projects" 
//               className="bg-primary text-white px-8 py-3 rounded-lg font-semibold text-lg hover:brightness-110 transition shadow-md"
//             >
//               View Available Land
//             </a>
//             <a 
//               href="/how-it-works" 
//               className="border-2 border-primary text-primary px-8 py-3 rounded-lg font-semibold text-lg hover:bg-primary hover:text-white transition"
//             >
//               How It Works
//             </a>
//           </div>
//         </div>

//         {/* Empty col for layout balance or additional content */}
//         <div className="hidden md:block"></div>
//       </div>
//     </div>
//   );
// }

export default function HeroSection() {
  return (
    <div className="relative min-h-[600px] flex items-center justify-center px-6 py-20 overflow-hidden">
      
      {/* 1. Background Image - Clear and Sharp */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/kenya-image.jpg" 
          alt="Background" 
          className="h-full w-full object-cover"
        />
        {/* Subtle dark overlay for text contrast */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* 2. Centered Content Container */}
      <div className="relative z-10 max-w-4xl w-full flex flex-col items-center text-center">
        
        {/* 'text-balance' makes the multi-line heading symmetrical */}
        <h1 className="text-4xl md:text-7xl font-bold text-white mb-6 text-balance drop-shadow-xl">
          Invest Together · Profit Together
        </h1>

        <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl text-balance drop-shadow-md">
          We buy land together and add value with eco-friendly structures that generate 
          <span className="font-semibold text-emerald-400"> residual income from day one</span> — 
          with transparent, fair profit sharing.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6">
          <a 
            href="/projects" 
            className="bg-primary text-white px-10 py-4 rounded-lg font-bold text-lg hover:brightness-110 transition-all shadow-xl active:scale-95"
          >
            View Available Land
          </a>
          <a 
            href="/how-it-works" 
            className="border-2 border-white text-white px-10 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-gray-900 transition-all shadow-xl active:scale-95"
          >
            How It Works
          </a>
        </div>
        
      </div>
    </div>
  );
}