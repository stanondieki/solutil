import React from "react";
import Link from "next/link";

const allProviders = {
  Electrician: [
    { name: "Jackson", profession: "Electrician", rating: 4.9, bg: "#E6D1F2", image: "/images/services/electrical.jpg", experience: "5+ years", price: "KES 2,500/hr" },
    { name: "Logan", profession: "Electrician", rating: 5.0, bg: "#EAD9C2", image: "/images/services/electrical.jpg", experience: "8+ years", price: "KES 3,000/hr" },
    { name: "Ethan lita", profession: "Electrician", rating: 4.4, bg: "#CDE7D8", image: "/images/services/electrical.jpg", experience: "3+ years", price: "KES 2,200/hr" },
    { name: "Isabella una", profession: "Electrician", rating: 4.3, bg: "#FFE7B2", image: "/images/services/electrical.jpg", experience: "4+ years", price: "KES 2,400/hr" },
    { name: "Emily jani", profession: "Electrician", rating: 4.8, bg: "#E6D1F2", image: "/images/services/electrical.jpg", experience: "6+ years", price: "KES 2,800/hr" },
    { name: "Marcus Lee", profession: "Electrician", rating: 4.6, bg: "#CDE7D8", image: "/images/services/electrical.jpg", experience: "7+ years", price: "KES 2,900/hr" },
  ],
  Plumber: [
    { name: "Ethan lita", profession: "Plumber", rating: 4.7, bg: "#CDE7D8", image: "/images/services/plumbing.jpg", experience: "6+ years", price: "KES 2,000/hr" },
    { name: "Isabella una", profession: "Plumber", rating: 3.9, bg: "#FFE7B2", image: "/images/services/plumbing.jpg", experience: "4+ years", price: "KES 1,800/hr" },
    { name: "Maskot Kota", profession: "Plumber", rating: 4.8, bg: "#EAD9C2", image: "/images/services/plumbing.jpg", experience: "8+ years", price: "KES 2,500/hr" },
  ],
  Cleaner: [
    { name: "Harper", profession: "Cleaner", rating: 3.9, bg: "#CDE7D8", image: "/images/services/cleaning.jpg", experience: "3+ years", price: "KES 1,500/hr" },
    { name: "Caleb", profession: "Cleaner", rating: 4.8, bg: "#EAD9C2", image: "/images/services/cleaning.jpg", experience: "5+ years", price: "KES 1,800/hr" },
  ],
};

const categoryInfo = {
  Electrician: { icon: "⚡", color: "from-yellow-500 to-orange-500", bg: "bg-yellow-100", textColor: "text-yellow-700" },
  Plumber: { icon: "🔧", color: "from-blue-500 to-blue-600", bg: "bg-blue-100", textColor: "text-blue-700" },
  Cleaner: { icon: "🧹", color: "from-green-500 to-green-600", bg: "bg-green-100", textColor: "text-green-700" },
};

export default function CategoryProvidersPage({ category }: { category: keyof typeof allProviders }) {
  const providers = allProviders[category] || [];
  const info = categoryInfo[category];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`${info.bg} w-16 h-16 rounded-2xl flex items-center justify-center text-2xl`}>
                {info.icon}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{category} Providers</h1>
                <p className="text-gray-600 mt-1">{providers.length} professionals ready to help</p>
              </div>
            </div>
            <Link 
              href="/services/all" 
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              ← Back to Categories
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h3 className="font-semibold text-gray-900">Filter by:</h3>
              <select className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>All Ratings</option>
                <option>5 Stars</option>
                <option>4+ Stars</option>
                <option>3+ Stars</option>
              </select>
              <select className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Price Range</option>
                <option>KES 1,000 - 2,000</option>
                <option>KES 2,000 - 3,000</option>
                <option>KES 3,000+</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Sort by:</span>
              <select className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Rating (High to Low)</option>
                <option>Price (Low to High)</option>
                <option>Experience</option>
              </select>
            </div>
          </div>
        </div>

        {/* Providers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {providers.map((provider, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden group"
            >
              {/* Provider Image */}
              <div className="relative h-48 overflow-hidden" style={{background: provider.bg}}>
                <img 
                  src={provider.image} 
                  alt={provider.profession} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                  <span className="text-yellow-500 text-sm">★</span>
                  <span className="font-semibold text-gray-900 text-sm">{provider.rating}</span>
                </div>
                <div className="absolute top-4 left-4 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  Available Now
                </div>
              </div>
              
              {/* Provider Info */}
              <div className="p-6">
                <h3 className="font-bold text-xl text-gray-900 mb-1">{provider.name}</h3>
                <p className="text-gray-600 mb-2">{provider.profession}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    <div className={`${info.bg} w-6 h-6 rounded-lg flex items-center justify-center text-sm`}>
                      {info.icon}
                    </div>
                    <span className="text-sm text-gray-500">{provider.experience}</span>
                  </div>
                  <span className={`${info.textColor} font-semibold text-sm`}>{provider.price}</span>
                </div>
                
                <div className="flex gap-2">
                  <Link 
                    href={`/booking/${provider.profession.toLowerCase()}`}
                    className={`flex-1 bg-gradient-to-r ${info.color} text-white py-2 px-4 rounded-xl font-semibold shadow-md transform hover:scale-105 transition-all duration-200 text-center`}
                  >
                    Book Now
                  </Link>
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-xl font-semibold transition-colors">
                    Chat
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="bg-white hover:bg-gray-50 text-gray-700 px-8 py-3 rounded-xl font-semibold shadow-lg border border-gray-200 transition-colors">
            Load More Providers
          </button>
        </div>
      </div>
    </div>
  );
}
