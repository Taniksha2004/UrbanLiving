import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  Building,
  ShoppingBasket,
  Receipt,
  Edit,
  Trash2,
  Settings,
  Home,
  Bell,
  User as UserIcon, // Use an alias to avoid naming conflicts
  Plus, // ✅ Import Plus icon for adding bills
} from 'lucide-react';

// Import useAuth to get the logged-in user's data
import { useAuth } from '../context/AuthContext'; 
import { useMatches } from '../context/MatchesContext'; // ✅ Import the MatchesContext with removeMatch
import apiClient from '../apiClient';

// A combined type for displaying properties or services
interface IListing {
  _id: string;
  title: string;
  images: string[];
  type: 'Property' | 'Service';
  city?: string;
  pricing?: string; 
}


const DashboardPage: React.FC = () => {
  const { user } = useAuth(); // Get the current user from context
  const { totalMatches, removeMatch } = useMatches(); // ✅ Get totalMatches and removeMatch from MatchesContext
  const navigate = useNavigate(); // ✅ Add navigate hook for chat navigation

  const [activeTab, setActiveTab] = useState('overview');
  const [listings, setListings] = useState<IListing[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [likedProfilesList, setLikedProfilesList] = useState<any[]>([]); // ✅ State for liked profiles
  const [isLoadingMatches, setIsLoadingMatches] = useState(false); // ✅ State for loading matches
  const [billsList, setBillsList] = useState<any[]>([]); // ✅ State for bills
  const [isLoadingBills, setIsLoadingBills] = useState(false); // ✅ State for loading bills

  // This effect fetches the user's listings when they click the "My Listings" tab
  useEffect(() => {
    const fetchMyListings = async () => {
      if (!user) return;
      setIsLoadingListings(true);
      try {
        let userProperties: IListing[] = [];
        let userServices: IListing[] = [];

        if (user.userType === 'property-owner') {
          const propRes = await apiClient.get('/properties/my-listings');
          userProperties = (propRes.data.properties || []).map((p: any) => ({ ...p, type: 'Property' }));
        }
        if (user.userType === 'vendor') {
          const serviceRes = await apiClient.get('/services/my-listings');
          userServices = (serviceRes.data.services || []).map((s: any) => ({ ...s, title: s.name, type: 'Service' }));
        }
        
        setListings([...userProperties, ...userServices]);
      } catch (error) {
        console.error("Failed to fetch listings:", error);
      } finally {
        setIsLoadingListings(false);
      }
    };

    if (activeTab === 'my-listings') {
      fetchMyListings();
    }
  }, [user, activeTab]);

  // ✅ Fetch liked profiles when "matches" tab is clicked
  useEffect(() => {
    const fetchLikedProfiles = async () => {
      if (!user || user.userType !== 'student') return;
      setIsLoadingMatches(true);
      try {
        const response = await apiClient.get('/profiles/my-likes');
        const likedIds = response.data.likedProfiles || [];
        
        // Fetch details of each liked profile
        const profileDetails = await Promise.all(
          likedIds.map((id: string) => 
            apiClient.get(`/profiles/${id}`).catch(() => null)
          )
        );
        
        const validProfiles = profileDetails
          .filter((p): p is any => p !== null)
          .map((p) => p.data.profile);
        
        setLikedProfilesList(validProfiles);
      } catch (error) {
        console.error("Failed to fetch liked profiles:", error);
        setLikedProfilesList([]);
      } finally {
        setIsLoadingMatches(false);
      }
    };

    if (activeTab === 'matches') {
      fetchLikedProfiles();
    }
  }, [user, activeTab]);

  // ✅ NEW: Fetch bills when user opens the Bills tab
  useEffect(() => {
    const fetchBills = async () => {
      if (!user) return;
      setIsLoadingBills(true);
      try {
        const response = await apiClient.get('/bills');
        setBillsList(response.data.bills || []);
      } catch (error) {
        console.error("Failed to fetch bills:", error);
        setBillsList([]);
      } finally {
        setIsLoadingBills(false);
      }
    };

    if (activeTab === 'bills') {
      fetchBills();
    }
  }, [user, activeTab]);

  // ✅ NEW: Also fetch bills on component mount for the STATS
  useEffect(() => {
    const fetchBillsForStats = async () => {
      if (!user) return;
      try {
        const response = await apiClient.get('/bills');
        setBillsList(response.data.bills || []);
      } catch (error) {
        console.error("Failed to fetch bills:", error);
      }
    };

    fetchBillsForStats();
  }, [user]);

  const [myProfile, setMyProfile] = useState<any>(null); // State for the user's profile

useEffect(() => {
  const fetchMyData = async () => {
    // ... your existing fetchMyListings logic
    
    // Also fetch the user's profile if they are a student
    if (user?.userType === 'student' && activeTab === 'my-profile') {
      try {
        const profileRes = await apiClient.get('/profiles/me');
        setMyProfile(profileRes.data.profile);
      } catch (e) {
        setMyProfile(null); // No profile found
      }
    }
  };
  
  fetchMyData();
}, [user, activeTab]);

const handleDeleteProfile = async () => {
  if (window.confirm('Are you sure you want to delete your profile? This cannot be undone.')) {
    try {
      await apiClient.delete('/profiles/me');
      setMyProfile(null); // Clear the profile from the UI
      alert('Profile deleted successfully.');
    } catch (e: any) {
      alert('Failed to delete profile: ' + e.response?.data?.message);
    }
  }
};

  // Reusable delete handler for the "My Listings" tab
  const handleDelete = async (listingId: string, type: 'Property' | 'Service') => {
    const endpoint = type === 'Property' ? `/properties/${listingId}` : `/services/${listingId}`;
    const confirmationMessage = `Are you sure you want to delete this ${type.toLowerCase()}?`;

    if (window.confirm(confirmationMessage)) {
      try {
        await apiClient.delete(endpoint);
        setListings(prevListings => prevListings.filter(l => l._id !== listingId));
      } catch (error: any) {
        alert('Failed to delete: ' + error.response?.data?.message);
      }
    }
  };

  // ✅ Handle removing a match/like
  const handleRemoveMatch = async (profileId: string) => {
    try {
      await removeMatch(profileId);
      setLikedProfilesList(prevList => prevList.filter(p => p._id !== profileId));
    } catch (error: any) {
      alert('Failed to unlike profile: ' + error.message);
    }
  };

  // ✅ Handle starting chat
  const handleStartChat = (recipientId: string) => {
    navigate(`/chat/${recipientId}`);
  };

  // ✅ NEW: Handle deleting a bill
  const handleDeleteBill = async (billId: string) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        await apiClient.delete(`/bills/${billId}`);
        setBillsList(prevList => prevList.filter(b => b._id !== billId));
        alert('Bill deleted successfully.');
      } catch (error: any) {
        alert('Failed to delete bill: ' + error.response?.data?.message);
      }
    }
  };

  // ✅ NEW: Handle settling a bill
  const handleSettleBill = async (billId: string) => {
    try {
      await apiClient.patch(`/bills/${billId}/settle`);
      setBillsList(prevList =>
        prevList.map(b => b._id === billId ? { ...b, status: 'settled' } : b)
      );
      alert('Bill marked as settled.');
    } catch (error: any) {
      alert('Failed to settle bill: ' + error.response?.data?.message);
    }
  };

  // Define UI elements based on the user's role
  const TABS = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    ...(user?.userType === 'property-owner' || user?.userType === 'vendor' ? [{ id: 'my-listings', name: 'My Listings', icon: Building }] : []),
    ...(user?.userType === 'student' ? [{ id: 'my-profile', name: 'My Profile', icon: UserIcon }] : []),
    { id: 'matches', name: 'My Matches', icon: Users },
    { id: 'bills', name: 'My Bills', icon: Receipt },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const QUICK_ACTIONS = [
    ...(user?.userType === 'property-owner' ? [{ title: 'Add Property', icon: Building, href: '/dashboard/add-property' }] : []),
    ...(user?.userType === 'vendor' ? [{ title: 'Add Service', icon: ShoppingBasket, href: '/dashboard/add-service' }] : []),
    { title: 'Create Profile', icon: Users, href: '/dashboard/add-profile' },
    { title: 'Split a Bill', icon: Receipt, href: '/dashboard/add-bill' },
  ];
  
  const STATS = [
    { title: 'Total Matches', value: totalMatches.toString(), icon: Users }, // ✅ Use dynamic totalMatches from context
    ...(user?.userType === 'property-owner' ? [{ title: 'Properties Listed', value: '23', icon: Building }] : []),
    ...(user?.userType === 'vendor' ? [{ title: 'Services Active', value: '12', icon: ShoppingBasket }] : []),
    { title: 'Bills Managed', value: billsList.length.toString(), icon: Receipt } // ✅ Use dynamic bills count
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="bg-gray-900 shadow-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-gray-700 to-gray-900 p-2 rounded-xl">
                <Home className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-100">Dashboard</h1>
                <p className="text-sm text-gray-400">Welcome back, {user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-400 hover:text-gray-200"><Bell className="h-6 w-6" /></button>
              <button className="text-gray-400 hover:text-gray-200"><UserIcon className="h-6 w-6" /></button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-900 rounded-2xl shadow-lg mb-8 overflow-hidden">
          <div className="flex overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon as any;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-gray-700 to-gray-900 text-white'
                      : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {STATS.map((stat, index) => {
                const SIcon = stat.icon as any;
                return (
                  <div key={index} className="bg-gray-900 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-100">{stat.value}</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-gray-700 to-gray-900 rounded-xl flex items-center justify-center">
                        <SIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="bg-gray-900 rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-100 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {QUICK_ACTIONS.map((action) => {
                  const AIcon = action.icon as any;
                  return (
                    <Link key={action.title} to={action.href} className="group bg-gray-800 rounded-xl p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <div className="w-10 h-10 bg-gradient-to-r from-gray-700 to-gray-900 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                      <AIcon className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="font-medium text-gray-100">{action.title}</h4>
                  </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'my-listings' && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
             <h2 className="text-2xl font-bold text-gray-100 mb-6">My Listings</h2>
              {isLoadingListings ? (
                <p className="text-gray-400">Loading your listings...</p>
              ) : listings.length === 0 ? (
                <div className="text-center bg-gray-900 p-8 rounded-lg">
                    <p className="text-gray-400">You haven't posted any listings yet.</p>
                    {user?.userType === 'property-owner' && <Link to="/dashboard/add-property" className="mt-4 inline-block bg-white text-black px-6 py-2 rounded-lg font-semibold">Add a Property</Link>}
                    {user?.userType === 'vendor' && <Link to="/dashboard/add-service" className="mt-4 inline-block bg-white text-black px-6 py-2 rounded-lg font-semibold">Add a Service</Link>}
                </div>
              ) : (
                <div className="space-y-4">
                  {listings.map(listing => (
                    <div key={listing._id} className="bg-gray-900 p-4 rounded-lg shadow-md flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center">
                        <img 
                            src={`http://localhost:4000${listing.images?.[0]}`}
                            alt={listing.title}
                            className="w-20 h-20 object-cover rounded-md mr-4"
                            onError={(e) => { e.currentTarget.src = 'https://placehold.co/100x100/111827/4b5563?text=No+Img' }}
                        />
                        <div>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${listing.type === 'Property' ? 'bg-blue-900 text-blue-200' : 'bg-green-900 text-green-200'}`}>
                            {listing.type}
                          </span>
                          <h3 className="text-lg font-bold mt-1 text-white">{listing.title}</h3>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1 hover:bg-gray-600"><Edit size={16}/> Edit</button>
                        <button onClick={() => handleDelete(listing._id, listing.type)} className="bg-red-800 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1 hover:bg-red-700"><Trash2 size={16}/> Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
           </motion.div>
        )}

        {(activeTab === 'settings') && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-900 rounded-2xl p-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Settings</h2>
                <p className="text-gray-400">This section is under construction.</p>
            </motion.div>
        )}

        {activeTab === 'bills' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-100">My Bills</h2>
              <Link 
                to="/dashboard/add-bill" 
                className="bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <Plus size={18} /> Add Bill
              </Link>
            </div>
            {isLoadingBills ? (
              <p className="text-gray-400">Loading your bills...</p>
            ) : billsList.length === 0 ? (
              <div className="text-center bg-gray-900 p-8 rounded-lg">
                <p className="text-gray-400">You haven't created any bills yet.</p>
                <Link to="/dashboard/add-bill" className="mt-4 inline-block bg-white text-black px-6 py-2 rounded-lg font-semibold">
                  Create a Bill
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {billsList.map((bill) => (
                  <div key={bill._id} className="bg-gray-900 p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Receipt className="h-5 w-5 text-gray-400" />
                          <h3 className="text-lg font-bold text-white">{bill.title}</h3>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            bill.status === 'settled' ? 'bg-green-900 text-green-200' : 'bg-yellow-900 text-yellow-200'
                          }`}>
                            {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                          </span>
                        </div>
                        {bill.description && <p className="text-gray-400 text-sm mb-2">{bill.description}</p>}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Amount</p>
                            <p className="text-white font-semibold">₹{bill.amount}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Category</p>
                            <p className="text-white font-semibold">{bill.category}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Split Type</p>
                            <p className="text-white font-semibold">{bill.splitType === 'equal' ? 'Equal' : 'Custom'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Date</p>
                            <p className="text-white font-semibold">{new Date(bill.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {bill.status !== 'settled' && (
                          <button
                            onClick={() => handleSettleBill(bill._id)}
                            className="bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                          >
                            Mark Settled
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteBill(bill._id)}
                          className="bg-red-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors flex items-center gap-1"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'matches' && user?.userType === 'student' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-bold text-gray-100 mb-6">My Matches</h2>
            {isLoadingMatches ? (
              <p className="text-gray-400">Loading your matches...</p>
            ) : likedProfilesList.length === 0 ? (
              <div className="text-center bg-gray-900 p-8 rounded-lg">
                <p className="text-gray-400">You haven't liked any profiles yet.</p>
                <Link to="/homematch" className="mt-4 inline-block bg-white text-black px-6 py-2 rounded-lg font-semibold">
                  Explore Profiles
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {likedProfilesList.map((profile) => (
                  <div key={profile._id} className="bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <img
                      src={`http://localhost:4000${profile.profileImages?.[0]}`}
                      alt={profile.firstName}
                      className="w-full h-64 object-cover"
                      onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x300/111827/4b5563?text=No+Photo' }}
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-white">{profile.firstName}, {profile.age}</h3>
                      <p className="text-gray-400 text-sm">{profile.preferredCities?.[0] || 'Any Location'}</p>
                      <p className="text-gray-300 mt-2 line-clamp-3">{profile.bio}</p>
                      <div className="flex space-x-2 mt-4">
                        <button
                          onClick={() => handleStartChat(profile.userId)}
                          className="flex-1 bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                        >
                          Message
                        </button>
                        <button
                          onClick={() => handleRemoveMatch(profile._id)}
                          className="flex-1 bg-red-800 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                        >
                          Unlike
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'my-profile' && user?.userType === 'student' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-100">My HomeMatch Profile</h2>

            {myProfile ? (
              <div className="bg-gray-900 rounded-2xl p-6 shadow-md flex flex-col md:flex-row gap-6 items-start">
                <div className="w-full md:w-48 h-48 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={myProfile.profileImages?.[0] ? `http://localhost:4000${myProfile.profileImages[0]}` : 'https://placehold.co/300x300/111827/4b5563?text=No+Photo'}
                    alt={myProfile.fullName || 'Profile'}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/300x300/111827/4b5563?text=No+Photo' }}
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white">{myProfile.fullName}{myProfile.age ? `, ${myProfile.age}` : ''}</h3>
                      <p className="text-gray-400 mt-1">{myProfile.occupation || '—'}</p>
                      <div className="mt-3 text-sm text-gray-300 space-y-2">
                        <p className="line-clamp-4">{myProfile.bio || 'No bio provided.'}</p>
                        <p><span className="text-gray-500">Preferred Cities:</span> <span className="text-white">{(myProfile.preferredCities || []).join(', ') || 'Any'}</span></p>
                        <p><span className="text-gray-500">Budget:</span> <span className="text-white">{myProfile.budget || 'Not set'}</span></p>
                      </div>
                    </div>

                    <div className="flex-shrink-0 flex flex-col items-end space-y-2">
                      <Link to="/dashboard/add-profile" className="bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2">
                        <Edit size={16} /> Edit
                      </Link>
                      <button onClick={handleDeleteProfile} className="bg-red-800 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2">
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center bg-gray-900 p-8 rounded-2xl">
                <p className="text-gray-400">You haven't created your HomeMatch profile yet.</p>
                <Link to="/dashboard/add-profile" className="mt-4 inline-block bg-white text-black px-6 py-2 rounded-lg font-semibold">
                  Create Profile
                </Link>
              </div>
            )}
          </motion.div>
        )}

      </div>
    </div>  
  );
  
};

export default DashboardPage;