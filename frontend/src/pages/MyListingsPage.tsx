import React, { useState, useEffect } from 'react';
import apiClient from '../apiClient';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

// Use the same types as your other pages
interface IListing {
  _id: string;
  title: string;
  city?: string;
  rent?: number;
  pricing?: string;
  images: string[];
  type: 'Property' | 'Service';
}

const MyListingsPage: React.FC = () => {
  const [listings, setListings] = useState<IListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMyListings = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        let userProperties: IListing[] = [];
        let userServices: IListing[] = [];

        // Fetch properties if the user is a property-owner
        if (user.userType === 'property-owner') {
          const propRes = await apiClient.get('/properties/my-listings');
          userProperties = (propRes.data.properties || []).map((p: any) => ({ ...p, type: 'Property' }));
        }

        // Fetch services if the user is a vendor
        if (user.userType === 'vendor') {
          const serviceRes = await apiClient.get('/services/my-listings');
          // Use 'name' for services and map it to 'title' for consistent display
          userServices = (serviceRes.data.services || []).map((s: any) => ({ ...s, title: s.name, type: 'Service' }));
        }
        
        // Combine both lists and sort by date (optional)
        setListings([...userProperties, ...userServices]);

      } catch (error) {
        console.error("Failed to fetch listings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyListings();
  }, [user]);

  const handleDelete = async (listingId: string, type: 'Property' | 'Service') => {
    const endpoint = type === 'Property' ? `/properties/${listingId}` : `/services/${listingId}`;
    const confirmationMessage = `Are you sure you want to delete this ${type.toLowerCase()}?`;

    if (window.confirm(confirmationMessage)) {
      try {
        await apiClient.delete(endpoint);
        // Remove from UI
        setListings(prevListings => prevListings.filter(l => l._id !== listingId));
      } catch (error: any) {
        alert('Failed to delete: ' + error.response?.data?.message);
      }
    }
  };

  if (isLoading) {
    return <div className="text-center p-8">Loading your listings...</div>;
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Listings</h1>
      
      {listings.length === 0 ? (
        <p>You haven't posted any listings yet.</p>
      ) : (
        <div className="space-y-4">
          {listings.map(listing => (
            <div key={listing._id} className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
              <div className="flex items-center">
                <img 
                  src={`http://localhost:4000${listing.images[0]}`}
                  alt={listing.title}
                  className="w-24 h-24 object-cover rounded-md mr-4"
                />
                <div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${listing.type === 'Property' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                    {listing.type}
                  </span>
                  <h2 className="text-xl font-bold mt-1">{listing.title}</h2>
                  <p className="text-gray-600">{listing.city || (listing.pricing)}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">Edit</button>
                <button 
                  onClick={() => handleDelete(listing._id, listing.type)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListingsPage;