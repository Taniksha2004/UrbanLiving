import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Filter, MapPin, Star, Heart, Share, Calendar, Phone, MessageCircle,
  Verified, Users, Car, Wifi, Utensils, Dumbbell, Shield, Camera, X
} from 'lucide-react';
import apiClient from '../apiClient';

// This interface should match the data sent from your backend
interface PropertyCard {
  _id: string;
  title: string;
  city: string;
  rent: number;
  rating?: number;
  reviews?: number;
  images: string[];
  amenities: string[];
  badges?: string[];
  gender: 'male' | 'female' | 'co-ed';
  propertyType: string;
  availability?: string;
}

const PropertiesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [properties, setProperties] = useState<PropertyCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [priceRange, setPriceRange] = useState('');
  const [genderPreference, setGenderPreference] = useState('');
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);

  // Fetch data from the backend API using our configured apiClient
  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get('/properties');
        setProperties(response.data.properties || []);
      } catch (error) {
        console.error("Failed to fetch properties:", error);
        setProperties([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi': return <Wifi className="h-4 w-4" />;
      case 'gym': return <Dumbbell className="h-4 w-4" />;
      case 'parking': return <Car className="h-4 w-4" />;
      case 'food': return <Utensils className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getBadgeColor = (badge: string) => {
    return 'bg-gray-800 text-gray-300';
  };

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return properties.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(term) || (p.city && p.city.toLowerCase().includes(term));
      const matchesPrice = !priceRange || (p.rent && p.rent <= parseInt(priceRange));
      const matchesGender = !genderPreference || p.gender === genderPreference;
      return matchesSearch && matchesPrice && matchesGender;
    });
  }, [properties, searchTerm, priceRange, genderPreference]);

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Properties
          </h1>
          <p className="text-gray-400">Discover verified hostels, PGs, and co-living spaces</p>
        </div>

        {/* Search */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by title or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
              />
            </div>
            <select
              className="px-4 py-3 bg-gray-800 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
            >
              <option value="">Price Range</option>
              <option value="5000">Up to ₹5000</option>
              <option value="10000">Up to ₹10000</option>
              <option value="15000">Up to ₹15000</option>
              <option value="20000">Up to ₹20000</option>
            </select>
            <select
              className="px-4 py-3 bg-gray-800 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
              value={genderPreference}
              onChange={(e) => setGenderPreference(e.target.value)}
            >
              <option value="">Gender Preference</option>
              <option value="co-ed">Co-ed</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            {/*
            <button
              onClick={() => setIsMoreFiltersOpen(true)}
              className="bg-white text-black px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2"
            >
              <Filter className="h-5 w-5" /><span>More Filters</span>
            </button>
            */}
          </div>
        </div>

        {/* Loading and Empty States */}
        {isLoading && (
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-10 shadow-lg text-center">
            <p className="text-gray-300 font-semibold">Loading properties...</p>
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-10 shadow-lg text-center">
            <p className="text-gray-300">
              No properties found. Try adjusting your search or add a new property!
            </p>
          </div>
        )}

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {!isLoading && filtered.map((property, index) => (
            <motion.div
              key={property._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:border-gray-500 transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Images */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={`http://localhost:4000${property.images?.[0]}`}
                  alt={property.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = "https://placehold.co/400x300/1f2937/d1d5db?text=No+Image" }}
                />
                <div className="absolute top-4 left-4 bg-black/70 rounded-full px-3 py-1">
                  <span className="text-sm font-medium text-gray-200">{property.propertyType}</span>
                </div>
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button className="bg-black/70 rounded-full p-2">
                    <Heart className="h-4 w-4 text-gray-300" />
                  </button>
                  <button className="bg-black/70 rounded-full p-2">
                    <Share className="h-4 w-4 text-gray-300" />
                  </button>
                </div>
                <div className="absolute bottom-4 right-4 bg-black/70 rounded-full px-3 py-1">
                  <div className="flex items-center space-x-1">
                    <Camera className="h-4 w-4 text-gray-300" />
                    <span className="text-sm font-medium text-gray-200">{property.images?.length || 0}</span>
                  </div>
                </div>
              </div>
              {/* Details */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white line-clamp-2">{property.title}</h3>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-2xl font-bold text-white">₹{property.rent}</p>
                    <p className="text-gray-400 text-sm">per month</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 mb-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-400 text-sm">{property.city}</span>
                </div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-300">{property.rating || 'New'}</span>
                  </div>
                  <span className="text-gray-600">•</span>
                  <span className="text-sm text-gray-400">{property.reviews || 0} reviews</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-sm text-gray-400">{property.gender}</span>
                </div>
                {/* Badges */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {property.badges?.map((badge) => (
                    <span
                      key={badge}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(badge)}`}
                    >
                      {badge === 'Verified' && <Verified className="h-3 w-3 inline mr-1" />}
                      {badge}
                    </span>
                  ))}
                </div>
                {/* Amenities */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {(property.amenities || []).slice(0, 4).map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-1 bg-gray-800 px-2 py-1 rounded-lg">
                      {getAmenityIcon(amenity)}
                      <span className="text-xs text-gray-300 capitalize">{amenity}</span>
                    </div>
                  ))}
                </div>
                {/* Availability */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-green-400 font-medium">{property.availability || 'Available Now'}</span>
                </div>
                {/* Actions */}
                <div className="flex space-x-2">
                  <button className="flex-1 bg-white text-black py-3 rounded-lg font-semibold flex items-center justify-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>View Details</span>
                  </button>
                  <button className="bg-gray-800 text-gray-300 p-3 rounded-lg">
                    <Phone className="h-4 w-4" />
                  </button>
                  <button className="bg-gray-800 text-gray-300 p-3 rounded-lg">
                    <MessageCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-black px-8 py-3 rounded-full font-semibold shadow-lg"
            // disabled // You can enable this based on pagination logic
          >
            Load More Properties
          </motion.button>
        </div>
      </div>

      {/* More Filters Modal */}
      {isMoreFiltersOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-lg w-full"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">More Filters</h3>
              <button onClick={() => setIsMoreFiltersOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-6">
              {/* Additional filters can go here */}
              <p className="text-gray-400">Additional filtering options will be available here.</p>
            </div>
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setIsMoreFiltersOpen(false)}
                className="bg-white text-black px-6 py-3 rounded-lg font-semibold"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;