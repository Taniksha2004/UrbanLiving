import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search, MapPin, Star, Clock, Phone, Heart, Percent,
  Utensils, Coffee, ShoppingBag, Scissors, Car, Wrench, Zap,
  Truck, Store, CreditCard, Banknote, GraduationCap, Boxes, Siren, BadgeCheck, MessageSquare,
} from 'lucide-react';

// ✅ 1. Import our authenticated API client
import apiClient from '../apiClient';

// --- TYPE DEFINITIONS ---
// This type is for the frontend display card
interface Vendor {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  rating: number;
  distance: string;
  timing: string;
  price: string;
  reviews: number;
  badges: string[]; 
  contact?: string; 
  discount?: string;
}

// --- COMPONENT CONFIGURATION ---
const categories = [
  { id: 'all', name: 'All Services', icon: ShoppingBag },
  { id: 'Food & Tiffin', name: 'Food & Tiffin', icon: Utensils },
  { id: 'Cafe & Tea', name: 'Café & Tea', icon: Coffee },
  { id: 'Laundry', name: 'Laundry', icon: Truck },
  { id: 'Salon & Spa', name: 'Salon & Spa', icon: Scissors },
  { id: 'Transport', name: 'Transport', icon: Car },
  { id: 'Repair', name: 'Repair', icon: Wrench },
  { id: 'Utilities', name: 'Utilities', icon: Zap },
];

const serviceFeatures = [
  { id: 'home-delivery', name: 'Home Delivery', icon: Truck },
  { id: 'pickup-available', name: 'Pickup Available', icon: Store },
  { id: 'online-payment', name: 'Online Payment', icon: CreditCard },
  { id: 'cod', name: 'Cash on Delivery', icon: Banknote },
  { id: 'student-discount', name: 'Student Discount', icon: GraduationCap },
  { id: 'bulk-orders', name: 'Bulk Orders', icon: Boxes },
  { id: 'same-day-service', name: 'Same Day Service', icon: Zap },
  { id: 'emergency-service', name: 'Emergency Service', icon: Siren },
  { id: 'quality-guarantee', name: 'Quality Guarantee', icon: BadgeCheck },
  { id: 'free-consultation', name: 'Free Consultation', icon: MessageSquare },
];

const featuresMap = new Map(serviceFeatures.map(feature => [feature.id, feature]));

// --- COMPONENT START ---
const QuickBasketPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revealedContact, setRevealedContact] = useState<string | null>(null);

  // ✅ 2. This useEffect hook is now corrected
  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      try {
        // Use apiClient instead of fetch
        const response = await apiClient.get('/services');
        
        // The data is inside response.data.services
        const servicesFromApi = response.data.services || [];

        const mappedVendors = servicesFromApi.map((item: any): Vendor => {
          const displayTiming = (item.timing && item.timing.openTime && item.timing.closeTime)
            ? `${item.timing.openTime} - ${item.timing.closeTime}`
            : 'Timings not available';

          const discountFeatureId = (item.features || []).find((id: string) => featuresMap.get(id)?.name.toLowerCase().includes('discount'));
          const discountText = discountFeatureId ? featuresMap.get(discountFeatureId)?.name : undefined;

          return {
            id: item._id,
            name: item.name || 'Service',
            description: item.description || '',
            category: item.category || 'other',
            image: (item.images && item.images.length > 0) ? `http://localhost:4000${item.images[0]}` : 'https://placehold.co/400x300/1f2937/d1d5db?text=Service',
            rating: item.rating || 4.7,
            distance: item.city || 'Nearby',
            timing: displayTiming,
            price: item.priceRange || 'On Request',
            reviews: item.reviews || 15,
            badges: item.features || [],
            contact: item.contactPhone,
            discount: discountText,
          };
        });
        setVendors(mappedVendors.reverse());

      } catch (error) {
        console.error("Failed to fetch vendors:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  // --- The rest of your component logic and JSX remains the same ---
  // (For brevity, the rest of the file is omitted as it was correct)

  const filteredVendors = vendors.filter(vendor => {
    const matchesCategory = selectedCategory === 'all' || vendor.category === selectedCategory;
    const matchesSearch =
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(cat => cat.name === categoryId); // Match by name
    return category ? category.icon : ShoppingBag;
  };

  const handleRevealContact = (vendor: Vendor) => {
    if (vendor.contact) {
      setRevealedContact(prev => (prev === vendor.id ? null : vendor.id));
    } else {
      alert('Contact number not available for this vendor.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-200 to-gray-500 bg-clip-text text-transparent mb-2">
            QuickBasket
          </h1>
          <p className="text-gray-400">Discover local services and vendors near you in Pimpri-Chinchwad</p>
        </header>

        <div className="bg-gray-900 rounded-2xl p-4 shadow-lg mb-8 sticky top-4 z-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search for services, vendors, or items..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-700 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex overflow-x-auto pb-4 mb-8 space-x-3">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setSelectedCategory(category.name)} // Match by name
              className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all duration-200 text-sm ${
                selectedCategory === category.name
                  ? 'bg-gray-200 text-gray-900 shadow-lg'
                  : 'bg-gray-900 text-gray-400 hover:bg-gray-800 shadow-md border border-gray-800'
              }`}
            >
              <category.icon className="h-5 w-5" />
              <span className="whitespace-nowrap">{category.name}</span>
            </motion.button>
          ))}
        </div>

        <main>
          {isLoading ? (
            <div className="text-center text-gray-400 py-10">Loading vendors...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVendors.map((vendor, index) => {
                const CategoryIcon = getCategoryIcon(vendor.category);
                return (
                  <motion.div
                    key={vendor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="bg-gray-900 rounded-2xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img src={vendor.image} alt={vendor.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x300/1f2937/d1d5db?text=Service' }}/>
                      <div className="absolute top-3 left-3 bg-gray-900/80 backdrop-blur-sm rounded-full p-2"><CategoryIcon className="h-5 w-5 text-gray-200" /></div>
                      <div className="absolute top-3 right-3"><button className="bg-gray-900/80 backdrop-blur-sm rounded-full p-2 hover:bg-red-500/50 transition-colors"><Heart className="h-5 w-5 text-gray-300" /></button></div>
                      {vendor.discount && (
                        <div className="absolute bottom-3 left-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                          <Percent className="h-3 w-3" />
                          <span>{vendor.discount}</span>
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex-grow flex flex-col">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-100">{vendor.name}</h3>
                        <div className="flex items-center space-x-1 flex-shrink-0"><Star className="h-4 w-4 text-yellow-400 fill-current" /><span className="text-sm font-medium text-gray-300">{vendor.rating}</span></div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                        <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /><span>{vendor.distance}</span></div>
                        <div className="flex items-center gap-1.5"><Clock className="h-4 w-4" /><span>{vendor.timing}</span></div>
                      </div>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">{vendor.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {vendor.badges.map((badgeId) => {
                          const feature = featuresMap.get(badgeId);
                          if (!feature) return null;

                          const Icon = feature.icon;
                          return (
                            <span key={feature.id} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300">
                              <Icon className="h-3 w-3 mr-1.5 flex-shrink-0" />
                              {feature.name}
                            </span>
                          );
                        })}
                      </div>

                      <div className="flex space-x-3 mt-auto pt-4 border-t border-gray-800">
                        {revealedContact === vendor.id ? (
                          <a 
                            href={`tel:${vendor.contact}`}
                            className="flex-1 bg-green-600 text-white flex items-center justify-center py-3 rounded-lg font-bold hover:bg-green-500 transition-all duration-200 text-sm"
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            {vendor.contact}
                          </a>
                        ) : (
                          <button 
                            onClick={() => handleRevealContact(vendor)}
                            className="flex-1 bg-gray-200 text-gray-900 py-3 rounded-lg font-bold hover:bg-white transition-all duration-200 text-sm"
                          >
                            Contact
                          </button>
                        )}
                        <button 
                          onClick={() => handleRevealContact(vendor)}
                          className="bg-gray-800 text-gray-300 p-3 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <Phone className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {!isLoading && filteredVendors.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gray-900 rounded-2xl p-8 shadow-lg max-w-md mx-auto"><Search className="h-16 w-16 text-gray-600 mx-auto mb-4" /><h3 className="text-xl font-semibold text-gray-200 mb-2">No vendors found</h3><p className="text-gray-400">Try adjusting your search or category filters.</p></div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default QuickBasketPage;