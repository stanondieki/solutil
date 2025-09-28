import React from "react";
import Link from "next/link";

const providerGroups = [
  {
    category: "Electrician",
    icon: "⚡",
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    accent: "border-yellow-200",
    providers: [
      { name: "Jackson", profession: "Electrician", rating: 3.9, bg: "#E6D1F2", image: "/images/services/electrical.jpg" },
      { name: "Emily jani", profession: "Electrician", rating: 4.8, bg: "#EAD9C2", image: "/images/services/electrical.jpg" },
      { name: "Logan", profession: "Electrician", rating: 5.0, bg: "#CDE7D8", image: "/images/services/electrical.jpg" },
    ],
  },
  {
    category: "Plumber",
    icon: "🔧", 
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    accent: "border-blue-200",
    providers: [
      { name: "Ethan lita", profession: "Plumber", rating: 4.7, bg: "#CDE7D8", image: "/images/services/plumbing.jpg" },
      { name: "Isabella una", profession: "Plumber", rating: 3.9, bg: "#FFE7B2", image: "/images/services/plumbing.jpg" },
      { name: "Maskot Kota", profession: "Plumber", rating: 4.8, bg: "#EAD9C2", image: "/images/services/plumbing.jpg" },
    ],
  },
  {
    category: "Cleaner",
    icon: "🧹",
    iconBg: "bg-green-100", 
    iconColor: "text-green-600",
    accent: "border-green-200",
    providers: [
      { name: "Harper", profession: "Cleaner", rating: 3.9, bg: "#CDE7D8", image: "/images/services/cleaning.jpg" },
      { name: "Caleb", profession: "Cleaner", rating: 4.8, bg: "#EAD9C2", image: "/images/services/cleaning.jpg" },
    ],
  },
];

export default function GroupedProvidersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Service Providers</h1>
              <p className="text-gray-600 mt-1">Find the perfect professional for your needs</p>
            </div>
            <Link 
              href="/dashboard" 
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              ← Back
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {providerGroups.map((group, idx) => (
          <div key={group.category} className="mb-12">
            {/* Category Header */}
            <div className={`bg-white rounded-2xl shadow-lg ${group.accent} border-2 mb-6 overflow-hidden`}>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`${group.iconBg} w-16 h-16 rounded-2xl flex items-center justify-center text-2xl`}>
                      {group.icon}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{group.category} Providers</h2>
                      <p className="text-gray-600">{group.providers.length} professionals available</p>
                    </div>
                  </div>
                  <Link 
                    href={`/services/${group.category.toLowerCase()}/all`}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    View All ({group.providers.length + 2})
                  </Link>
                </div>
              </div>
            </div>

            {/* Provider Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {group.providers.map((provider, i) => (
                <div 
                  key={i} 
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
                  </div>
                  
                  {/* Provider Info */}
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-900 mb-1">{provider.name}</h3>
                    <p className="text-gray-600 mb-4">{provider.profession}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`${group.iconBg} ${group.iconColor} w-8 h-8 rounded-lg flex items-center justify-center text-sm`}>
                          {group.icon}
                        </div>
                        <span className="text-sm text-gray-500">Verified Pro</span>
                      </div>
                      <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-semibold shadow-md transform hover:scale-105 transition-all duration-200">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl shadow-xl p-8 text-center text-white mt-12">
          <h2 className="text-3xl font-bold mb-4">Need Help Finding the Right Professional?</h2>
          <p className="text-blue-100 mb-6 text-lg">Our customer support team is here to help you connect with the perfect service provider.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg">
              Chat with Support
            </button>
            <button className="bg-blue-500 hover:bg-blue-400 text-white px-8 py-3 rounded-xl font-semibold transition-colors border-2 border-blue-400">
              Call Us Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
