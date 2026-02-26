export default function HowItWorks() {
  const steps = [
    { num: 1, title: 'Browse Land', desc: 'Explore vetted land parcels with projected returns.' },
    { num: 2, title: 'Invest Together', desc: 'Pool capital with other investors. Minimum $700.' },
    { num: 3, title: 'Build Sustainably', desc: 'Eco-cabins, solar farms, or agroforestry added.' },
    { num: 4, title: 'Earn Monthly', desc: 'Receive passive income from rentals or operations.' },
  ];

  return (
    <section className="py-20 px-6 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            How FIBI Works
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Our streamlined process makes fractional land ownership simple, transparent, and profitable.
          </p>
        </div>

        {/* 1. Responsive Grid: 1 col on mobile, 2 on tablet (sm), 4 on desktop (lg) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div 
              key={step.num} 
              className="group relative text-center p-8 bg-gray-50 rounded-2xl transition-all duration-300 hover:bg-white hover:shadow-2xl hover:-translate-y-2 border border-transparent hover:border-emerald-100"
            >
              {/* 2. Animated Number Circle */}
              <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold transition-transform duration-300 group-hover:scale-110 shadow-lg shadow-emerald-900/20">
                {step.num}
              </div>
              
              <h3 className="font-bold text-xl mb-3 text-gray-900 group-hover:text-primary transition-colors">
                {step.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {step.desc}
              </p>

              {/* 3. Subtle background decoration for desktop */}
              <div className="absolute -z-10 top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-radial-gradient from-emerald-50/50 to-transparent rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}