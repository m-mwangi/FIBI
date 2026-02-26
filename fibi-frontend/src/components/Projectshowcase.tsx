// src/components/ProjectShowcase.tsx
export default function ProjectShowcase() {
  const projects = [
    {
      id: 1,
      name: "Mt. Kenya Avocado Farm",
      location: "Nyeri County, Kenya",
      roi: "14.2%",
      raised: "KSh 8.2M",
      goal: "KSh 12M",
      image: "https://placehold.co/600x400/2E8B57/white?text=Mt+Kenya+Avocado"
    },
    {
      id: 2,
      name: "Eco-Lodge & Tree Nursery",
      location: "Kirinyaga, Kenya",
      roi: "11.5%",
      raised: "KSh 6.5M",
      goal: "KSh 10M",
      image: "https://placehold.co/600x400/2E8B57/white?text=Kirinyaga+Eco+Lodge"
    }
  ];

  return (
    <section className="py-16 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">Invest in Mt. Kenya</h2>
        <p className="text-gray-600 text-center mb-12">
          Sustainable land investments near Africa’s second-highest peak — fertile soil, clean water, and growing global demand.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project) => (
            <div 
              key={project.id} 
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
            >
              <img 
                src={project.image} 
                alt={project.name} 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold">{project.name}</h3>
                <p className="text-gray-600 mb-2">📍 {project.location}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="bg-green-100 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                    {project.roi} ROI
                  </span>
                  <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
                    Invest Now
                  </button>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ 
                        width: `${(
                          parseInt(project.raised.replace(/\D/g, '')) / 
                          parseInt(project.goal.replace(/\D/g, ''))
                        ) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {project.raised} raised of {project.goal}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>All projects comply with Kenyan land use regulations and prioritize water conservation + reforestation.</p>
        </div>
      </div>
    </section>
  );
}