import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Upload, Receipt, Users, Calendar, Camera,
  Plus, X, Check, Utensils, Zap, Wifi, Car, Home, ShoppingBag, User
} from 'lucide-react';
import apiClient from '../apiClient'; // ✅ Import apiClient
import { useAuth } from '../context/AuthContext'; // ✅ Import useAuth

interface Roommate {
  id: number;
  name: string;
  email: string;
}

// Updated Bill Interface
interface Bill {
  id: number;
  title: string;
  amount: number;
  paidBy: string;
  splitBetween: string[];
  category: string;
  date: string;
  status: 'pending' | 'settled';
  description?: string;
  splitType: 'equal' | 'custom';
  customSplits?: Record<string, number>;
}

const RupeeSign = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" width="1em" height="1em">
    <text x="3" y="19" fontSize="18" fontFamily="Arial" alignmentBaseline="middle" textAnchor="start">₹</text>
  </svg>
);

const AddBillPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth(); // ✅ Get current user
  const searchParams = new URLSearchParams(location.search);
  const billId = searchParams.get('id');

  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.firstName && user?.email) {
      setCurrentUser({ name: user.firstName, email: user.email });
    }
  }, []);

  const [roommates, setRoommates] = useState<Roommate[]>([]);

  useEffect(() => {
    if (currentUser) {
      setRoommates(prev => {
        const filtered = prev.filter(
          r => !(r.name === 'You' && r.email === 'you@example.com') &&
               !(r.name === currentUser.name && r.email === currentUser.email)
        );
        return [{ id: 1, name: currentUser.name, email: currentUser.email }, ...filtered];
      });
    }
  }, [currentUser]);

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '' });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    category: 'utilities',
    date: '',
    paidBy: '',
    splitBetween: [] as number[],
    splitType: 'equal',
    customSplits: {} as Record<number, number>,
    receipt: null as any,
    recurring: false,
    recurringPeriod: 'monthly'
  });

  const categories = [
    { id: 'utilities', name: 'Utilities', icon: Zap, color: 'from-gray-700 to-gray-900' },
    { id: 'food', name: 'Food & Groceries', icon: Utensils, color: 'from-gray-700 to-gray-900' },
    { id: 'internet', name: 'Internet', icon: Wifi, color: 'from-gray-700 to-gray-900' },
    { id: 'transport', name: 'Transport', icon: Car, color: 'from-gray-700 to-gray-900' },
    { id: 'rent', name: 'Rent', icon: Home, color: 'from-gray-700 to-gray-900' },
    { id: 'shopping', name: 'Shopping', icon: ShoppingBag, color: 'from-gray-700 to-gray-900' },
    { id: 'other', name: 'Other', icon: Receipt, color: 'from-gray-700 to-gray-900' }
  ];

  useEffect(() => {
    if (billId && roommates.length > 0 && currentUser) {
      const bills: Bill[] = JSON.parse(localStorage.getItem('bills') || '[]');
      const foundBill = bills.find(b => String(b.id) === billId);
      if (foundBill) {
        let nextId = Math.max(0, ...roommates.map(r => r.id)) + 1;
        const unionRoommates: Roommate[] = [...roommates];
        const seen = new Set(roommates.map(r => `${r.name.trim()}`));

        foundBill.splitBetween.forEach(name => {
          if (!seen.has(name.trim())) {
            unionRoommates.push({ id: nextId++, name, email: '' });
            seen.add(name.trim());
          }
        });
        
        const myName = currentUser.name;
        const splitIds = foundBill.splitBetween
          .map(name => unionRoommates.find(r => r.name === name)?.id)
          .filter((id): id is number => id !== undefined);

        setRoommates(unionRoommates);
        setFormData(f => ({
          ...f,
          title: foundBill.title,
          description: foundBill.description || '',
          amount: foundBill.amount.toString(),
          category: foundBill.category,
          date: foundBill.date,
          paidBy: foundBill.paidBy,
          splitBetween: splitIds,
          splitType: foundBill.splitType || 'equal',
          customSplits: foundBill.customSplits 
            ? Object.entries(foundBill.customSplits).reduce((acc, [name, amount]) => {
                const roommate = unionRoommates.find(r => r.name === name);
                if (roommate) acc[roommate.id] = amount;
                return acc;
              }, {} as Record<number, number>)
            : {},
        }));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billId, currentUser]);


  const formatINR = (value: number): string =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRoommateToggle = (roommateId: number) => {
    setFormData(prev => ({
      ...prev,
      splitBetween: prev.splitBetween.includes(roommateId)
        ? prev.splitBetween.filter(id => id !== roommateId)
        : [...prev.splitBetween, roommateId]
    }));
  };

  const handleCustomSplitChange = (roommateId: number, amount: string) => {
    setFormData(prev => ({
      ...prev,
      customSplits: {
        ...prev.customSplits,
        [roommateId]: parseFloat(amount) || 0
      }
    }));
  };

  const calculateSplit = () => {
    const totalAmount = parseFloat(formData.amount) || 0;
    const splitCount = formData.splitBetween.length;
    if (formData.splitType === 'equal' && splitCount > 0) {
      return totalAmount / splitCount;
    }
    return 0;
  };

  const handleAddUser = () => {
    const trimmedName = newUser.name.trim();
    const trimmedEmail = newUser.email.trim();
    if (!trimmedName || !trimmedEmail) return;
    const nextId = (roommates.length > 0 ? Math.max(...roommates.map(r => r.id)) : 0) + 1;
    setRoommates([...roommates, { id: nextId, name: trimmedName, email: trimmedEmail }]);
    setShowAddUserModal(false);
    setNewUser({ name: '', email: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.paidBy) {
      alert("Please select who paid the bill.");
      return;
    }
    if (formData.splitBetween.length === 0) {
      alert("Please select at least one person to split the bill with.");
      return;
    }
    
    // ✅ NEW: Prepare data for API call
    try {
      const splitNames = formData.splitBetween
        .map(id => roommates.find(r => r.id === id))
        .filter((r): r is Roommate => r !== undefined)
        .map(r => r.name);
      
      let customSplitsData: Record<string, number> | undefined = undefined;
      if (formData.splitType === 'custom') {
        customSplitsData = {};
        for (const id of formData.splitBetween) {
          const roommate = roommates.find(r => r.id === id);
          if (roommate) {
            customSplitsData[roommate.name] = formData.customSplits[id] || 0;
          }
        }
      }

      const billData = {
        title: formData.title,
        description: formData.description,
        amount: parseFloat(formData.amount) || 0,
        category: formData.category,
        date: formData.date || new Date(),
        splitType: formData.splitType as 'equal' | 'custom',
        splitBetween: splitNames,
        customSplits: customSplitsData,
      };

      // ✅ Make API call to create/update bill
      if (billId) {
        // Update existing bill
        apiClient.put(`/bills/${billId}`, billData).then(() => {
          alert("Bill updated successfully!");
          navigate('/dashboard?tab=bills');
        }).catch((error) => {
          console.error("Error updating bill:", error);
          const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
          alert("Failed to update bill: " + errorMsg);
        });
      } else {
        // Create new bill
        apiClient.post('/bills', billData).then(() => {
          alert("Bill created successfully!");
          navigate('/dashboard?tab=bills');
        }).catch((error) => {
          console.error("Error creating bill:", error);
          const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
          alert("Failed to create bill: " + errorMsg);
        });
      }
    } catch (error) {
      console.error("An error occurred while creating/updating the bill:", error);
      alert("Could not create/update the bill. Please check the console for errors.");
    }
  };
  
  return (
    <div className="min-h-screen bg-black text-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              to="/billsplit"
              className="p-2 rounded-lg hover:bg-gray-800 hover:shadow-md transition-all duration-200"
            >
              <ArrowLeft className="h-6 w-6 text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-100">{billId ? "Edit Bill" : "Add New Bill"}</h1>
              <p className="text-gray-400">Split expenses with your roommates</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-gray-900 rounded-2xl p-8 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-100 mb-6">Bill Information</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-gray-300 font-medium mb-2">Bill Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Electricity Bill - January 2024"
                  className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 font-medium mb-2">Description (Optional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Add any additional details about this expense..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <RupeeSign className="inline h-5 w-5" />
                    </span>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full pl-8 pr-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 font-medium mb-4">Category</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    const isSelected = formData.category === category.id;
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, category: category.id }))}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          isSelected
                            ? 'border-gray-300 bg-gray-800'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <div className={`w-8 h-8 bg-gradient-to-r from-gray-700 to-gray-900 rounded-lg flex items-center justify-center mx-auto mb-2`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <span className={`text-sm font-medium ${isSelected ? 'text-gray-100' : 'text-gray-400'}`}>
                          {category.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Who Paid */}
          <div className="bg-gray-900 rounded-2xl p-8 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-100 mb-6 flex items-center">
              Who Paid?
              <button
                type="button"
                onClick={() => setShowAddUserModal(true)}
                className="ml-2 rounded-full border border-gray-700 p-1 hover:bg-gray-800"
                aria-label="Add person"
              >
                <Plus className="h-5 w-5 text-gray-400" />
              </button>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roommates.map((roommate) => (
                <button
                  key={roommate.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, paidBy: roommate.name }))}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    formData.paidBy === roommate.name
                      ? 'border-gray-300 bg-gray-800'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      formData.paidBy === roommate.name
                        ? 'bg-gray-700 text-white'
                        : 'bg-gray-800 text-gray-400'
                    }`}>
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <div className={`font-medium ${
                        formData.paidBy === roommate.name ? 'text-gray-100' : 'text-gray-300'
                      }`}>
                        {roommate.name}
                      </div>
                      <div className="text-sm text-gray-500">{roommate.email}</div>
                    </div>
                    {formData.paidBy === roommate.name && (
                      <Check className="h-5 w-5 text-green-500 ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Split Between */}
          <div className="bg-gray-900 rounded-2xl p-8 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-100 mb-6 flex items-center">
              Split Between
              <button
                type="button"
                onClick={() => setShowAddUserModal(true)}
                className="ml-2 rounded-full border border-gray-700 p-1 hover:bg-gray-800"
                aria-label="Add person"
              >
                <Plus className="h-5 w-5 text-gray-400" />
              </button>
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roommates.map((roommate) => {
                  const isSelected = formData.splitBetween.includes(roommate.id);
                  return (
                    <button
                      key={roommate.id}
                      type="button"
                      onClick={() => handleRoommateToggle(roommate.id)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                        isSelected
                          ? 'border-gray-300 bg-gray-800'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isSelected
                            ? 'bg-gray-700 text-white'
                            : 'bg-gray-800 text-gray-400'
                        }`}>
                          <User className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className={`font-medium ${
                            isSelected ? 'text-gray-100' : 'text-gray-300'
                          }`}>
                            {roommate.name}
                          </div>
                          <div className="text-sm text-gray-500">{roommate.email}</div>
                        </div>
                        {isSelected && (
                          <Check className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              {/* Split Type... */}
              <div>
                <label className="block text-gray-300 font-medium mb-4">Split Type</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, splitType: 'equal' }))}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      formData.splitType === 'equal'
                        ? 'border-gray-300 bg-gray-800 text-gray-100'
                        : 'border-gray-700 hover:border-gray-600 text-gray-400'
                    }`}
                  >
                    <div className="text-center">
                      <Users className="h-6 w-6 mx-auto mb-2" />
                      <div className="font-medium">Equal Split</div>
                      <div className="text-sm opacity-75">Split equally among all</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, splitType: 'custom' }))}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      formData.splitType === 'custom'
                        ? 'border-gray-300 bg-gray-800 text-gray-100'
                        : 'border-gray-700 hover:border-gray-600 text-gray-400'
                    }`}
                  >
                    <div className="text-center">
                      <RupeeSign className="h-6 w-6 mx-auto mb-2" />
                      <div className="font-medium">Custom Split</div>
                      <div className="text-sm opacity-75">Set custom amounts</div>
                    </div>
                  </button>
                </div>
              </div>
              {formData.splitBetween.length > 0 && formData.amount && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="font-medium text-gray-100 mb-3">Split Preview</h3>
                  <div className="space-y-2">
                    {formData.splitBetween.map((roommateId) => {
                      const roommate = roommates.find(r => r.id === roommateId);
                      const splitAmount = formData.splitType === 'equal'
                        ? calculateSplit()
                        : formData.customSplits[roommateId] || 0;
                      return (
                        <div key={roommateId} className="flex items-center justify-between">
                          <span className="text-gray-300">{roommate?.name}</span>
                          {formData.splitType === 'custom' ? (
                            <div className="flex items-center">
                              <RupeeSign className="inline h-5 w-5 mr-1 text-gray-200" />
                              <input
                                type="number"
                                value={formData.customSplits[roommateId] || ''}
                                onChange={(e) => handleCustomSplitChange(roommateId, e.target.value)}
                                placeholder="0.00"
                                step="0.01"
                                className="w-24 px-2 py-1 border border-gray-700 rounded bg-gray-900 text-white text-right"
                              />
                            </div>
                          ) : (
                            <span className="font-medium text-gray-200 flex items-center">
                              <RupeeSign className="inline h-5 w-5 mr-1" />
                              {formatINR(splitAmount)}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Receipt Upload */}
          <div className="bg-gray-900 rounded-2xl p-8 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-100 mb-6">Receipt (Optional)</h2>
            <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center">
              <Camera className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-100 mb-2">Upload Receipt</h3>
              <p className="text-gray-400 mb-4">Add a photo of the bill or receipt for reference</p>
              <button
                type="button"
                className="bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-white transition-all duration-200 flex items-center space-x-2 mx-auto"
              >
                <Upload className="h-5 w-5" />
                <span>Choose File</span>
              </button>
              <p className="text-sm text-gray-500 mt-2">Maximum 5MB, JPG, PNG, or PDF</p>
            </div>
          </div>

          {/* Recurring Bill */}
          <div className="bg-gray-900 rounded-2xl p-8 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-100 mb-6">Recurring Bill</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="recurring"
                  checked={formData.recurring}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-white bg-gray-800 focus:ring-white border-gray-700 rounded"
                />
                <label className="text-gray-300 font-medium">This is a recurring bill</label>
              </div>
              {formData.recurring && (
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Recurring Period</label>
                  <select
                    name="recurringPeriod"
                    value={formData.recurringPeriod}
                    onChange={handleInputChange}
                    className="w-full md:w-auto px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-gray-200 text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {billId ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-gray-900 rounded-xl p-6 shadow-lg min-w-[300px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-100">Add Person</h3>
              <button onClick={() => setShowAddUserModal(false)}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Full Name"
              className="mb-2 w-full border border-gray-700 p-2 rounded bg-gray-800 text-white"
              value={newUser.name}
              onChange={e => setNewUser(prev => ({ ...prev, name: e.target.value }))}
            />
            <input
              type="email"
              placeholder="Email"
              className="mb-2 w-full border border-gray-700 p-2 rounded bg-gray-800 text-white"
              value={newUser.email}
              onChange={e => setNewUser(prev => ({ ...prev, email: e.target.value }))}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleAddUser}
                className="bg-gray-200 text-gray-900 px-4 py-2 rounded shadow">
                Add
              </button>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="px-3 py-2 border border-gray-700 rounded text-gray-200">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddBillPage;
