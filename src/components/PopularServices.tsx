import React from 'react';
import Link from 'next/link';

const services = [
  {
    name: 'Plumbing',
    icon: '/images/services/plumbing.jpg',
    category: 'Maintenance',
  },
  {
    name: 'Cleaning',
    icon: '/images/services/cleaning.jpg',
    category: 'Cleaning',
  },
  {
    name: 'Electrical',
    icon: '/images/services/electrical.jpg',
    category: 'Maintenance',
  },
];

export default function PopularServices() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Popular Services</h2>
        <Link href="/services/all" className="text-yellow-700 font-semibold hover:underline">View all</Link>
      </div>
      <div className="flex gap-6">
        {services.map((service) => (
          <div key={service.name} className="flex flex-col items-center bg-gray-50 rounded-lg shadow hover:shadow-lg p-4 w-32 cursor-pointer transition">
            <img src={service.icon} alt={service.name} className="h-12 w-12 mb-2 object-contain" />
            <span className="text-sm font-medium text-gray-700">{service.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
