import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Upload, User, MapPin, DollarSign, Camera,
  Plus, X, Check, Coffee, Moon, Utensils, Music, Dumbbell,
  BookOpen, Users, Heart, Star, Wifi, Car, Shield
} from 'lucide-react';

// ✅ 1. Import our authenticated API client
import apiClient from '../apiClient'; 

// --- Type definitions (no change) ---
type Timing = { checkIn: string; checkOut: string; visitingHours: string; };
type FormDataShape = {
  title: string;
  description: string;
  propertyType: 'pg' | 'hostel' | 'co-living' | 'apartment';
  gender: 'co-ed' | 'male' | 'female';
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  rent: string;
  deposit: string;
  maintenance: string;
  electricityIncluded: boolean;
  totalRooms: string;
  availableRooms: string;
  roomType: 'shared' | 'double' | 'single' | 'mixed';
  bathrooms: string;
  amenities: string[];
  images: string[];
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  rules: string[];
  timing: Timing;
};

const AddPropertyPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormDataShape>({
    title: '', description: '', propertyType: 'pg', gender: 'co-ed',
    address: '', city: '', state: '', pincode: '', landmark: '',
    rent: '', deposit: '', maintenance: '', electricityIncluded: false,
    totalRooms: '', availableRooms: '', roomType: 'shared', bathrooms: '',
    amenities: [], images: [], contactName: '', contactPhone: '', contactEmail: '',
    rules: [], timing: { checkIn: '', checkOut: '', visitingHours: '' }
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [rulesInput, setRulesInput] = useState<string>('');
  const hiddenFileInputRef = useRef<HTMLInputElement | null>(null);

  // --- All other state and functions (steps, amenitiesList, handleInputChange, etc.) remain the same ---
  // --- For brevity, I'm skipping to the changed handleSubmit function ---
  const steps = [
    { id: 1, title: 'Basic Info', description: 'Property details and type' },
    { id: 2, title: 'Location', description: 'Address and location details' },
    { id: 3, title: 'Pricing', description: 'Rent and other charges' },
    { id: 4, title: 'Details', description: 'Rooms and facilities' },
    { id: 5, title: 'Amenities', description: 'Available facilities' },
    { id: 6, title: 'Images', description: 'Property photos' },
    { id: 7, title: 'Contact', description: 'Contact information' },
    { id: 8, title: 'Rules', description: 'Property rules and timings' },
    { id: 9, title: 'Review & Submit', description: 'Final review and submission' }
  ];

  const amenitiesList: { id: string; name: string; icon: React.ComponentType<any> }[] = [
    { id: 'wifi', name: 'WiFi', icon: Wifi },
    { id: 'parking', name: 'Parking', icon: Car },
    { id: 'food', name: 'Food/Mess', icon: Utensils },
    { id: 'gym', name: 'Gym', icon: Dumbbell },
    { id: 'security', name: '24/7 Security', icon: Shield },
    { id: 'laundry', name: 'Laundry', icon: Users },
    { id: 'ac', name: 'AC', icon: Users },
    { id: 'tv', name: 'TV/Common Area', icon: Users },
    { id: 'fridge', name: 'Refrigerator', icon: Users },
    { id: 'water', name: 'Water Purifier', icon: Users },
    { id: 'power', name: 'Power Backup', icon: Users },
    { id: 'cleaning', name: 'Housekeeping', icon: Users }
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAmenityToggle = (amenityId: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(s => s + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(s => s - 1);
    }
  };

  const handleRulesInputChange = (val: string) => {
    setRulesInput(val);
    const parts = val.split('\n').map(s => s.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, rules: parts }));
  };

  const handleChooseImages = () => {
    hiddenFileInputRef.current?.click();
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
  
    const maxImages = 10;
    const currentImageCount = imageFiles.length;
    const newAllowedFiles = files.slice(0, maxImages - currentImageCount);
  
    const newImageFiles = [...imageFiles, ...newAllowedFiles];
    const newPreviewUrls = newAllowedFiles.map(f => URL.createObjectURL(f));
  
    setImageFiles(newImageFiles);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newPreviewUrls]
    }));
  
    e.target.value = '';
  };
  
  const handleRemoveImage = (urlToRemove: string) => {
    const imageIndex = formData.images.findIndex(url => url === urlToRemove);
    if (imageIndex > -1) {
      const updatedImageFiles = imageFiles.filter((_, index) => index !== imageIndex);
      const updatedPreviewUrls = formData.images.filter(url => url !== urlToRemove);
      
      setImageFiles(updatedImageFiles);
      setFormData(prev => ({
        ...prev,
        images: updatedPreviewUrls
      }));
    }
  };

  const validateForm = (): string[] => {
    const errs: string[] = [];
    if (!formData.title.trim()) errs.push('Title is required');
    if (!formData.description.trim()) errs.push('Description is required');
    if (!formData.address.trim()) errs.push('Address is required');
    if (!formData.city.trim()) errs.push('City is required');
    if (!formData.state.trim()) errs.push('State is required');
    if (!formData.pincode.trim()) errs.push('PIN code is required');
    if (!formData.rent.trim()) errs.push('Rent is required');
    if (!formData.contactName.trim()) errs.push('Contact name is required');
    if (!formData.contactPhone.trim()) errs.push('Contact phone is required');
    if (!formData.contactEmail.trim()) errs.push('Contact email is required');
    return errs;
  };
  // ✅ 2. The handleSubmit function is updated to use apiClient
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateForm();
    if (errs.length) {
      alert(`Please fix the following:\n\n• ${errs.join('\n• ')}`);
      return;
    }

    const dataToSend = new FormData();

    // Append all form data fields except for the preview image URLs
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'images') {
        if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
          dataToSend.append(key, JSON.stringify(value));
        } else {
          dataToSend.append(key, String(value));
        }
      }
    });

    // Append the actual image files
    imageFiles.forEach(file => {
      dataToSend.append('images', file);
    });

    try {
      // Use apiClient.post instead of fetch. It will automatically add the auth token.
      const response = await apiClient.post('/properties', dataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Property created successfully!');
      navigate('/properties');

    } catch (err: any) {
      console.error("Submission Error:", err);
      // Axios provides better error details in err.response.data.message
      const errorMessage = err.response?.data?.message || err.message;
      alert('Something went wrong while saving: ' + errorMessage);
    }
  };
  
  // --- The entire render function (renderFormStep, JSX, etc.) remains unchanged ---
  const renderFormStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-6">Basic Information</h2>
            <div>
              <label className="block text-gray-300 font-medium mb-2">Property Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g., Modern PG near IT Park" className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent" required />
            </div>
            <div>
              <label className="block text-gray-300 font-medium mb-2">Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Describe your property, facilities, and what makes it special..." rows={4} className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 font-medium mb-2">Property Type</label>
                <select name="propertyType" value={formData.propertyType} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent">
                  <option value="pg">PG (Paying Guest)</option>
                  <option value="hostel">Hostel</option>
                  <option value="co-living">Co-Living</option>
                  <option value="apartment">Shared Apartment</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 font-medium mb-2">Gender Preference</label>
                <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent">
                  <option value="co-ed">Co-Ed</option>
                  <option value="male">Male Only</option>
                  <option value="female">Female Only</option>
                </select>
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-6">Location Details</h2>
            <div>
              <label className="block text-gray-300 font-medium mb-2">Full Address</label>
              <textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="Enter complete address..." rows={3} className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-gray-300 font-medium mb-2">City</label>
                <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="City" className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-gray-300 font-medium mb-2">State</label>
                <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="State" className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-gray-300 font-medium mb-2">PIN Code</label>
                <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="PIN Code" className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent" required />
              </div>
            </div>
            <div>
              <label className="block text-gray-300 font-medium mb-2">Nearby Landmark</label>
              <input type="text" name="landmark" value={formData.landmark} onChange={handleInputChange} placeholder="e.g., Near Metro Station, IT Park, University" className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent" />
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-6">Pricing Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-gray-300 font-medium mb-2">Monthly Rent (₹)</label>
                <input type="number" name="rent" value={formData.rent} onChange={handleInputChange} placeholder="0" className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-gray-300 font-medium mb-2">Security Deposit (₹)</label>
                <input type="number" name="deposit" value={formData.deposit} onChange={handleInputChange} placeholder="0" className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-gray-300 font-medium mb-2">Maintenance (₹)</label>
                <input type="number" name="maintenance" value={formData.maintenance} onChange={handleInputChange} placeholder="0" className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent" />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <input type="checkbox" name="electricityIncluded" checked={formData.electricityIncluded} onChange={handleInputChange} className="h-4 w-4 text-white bg-gray-800 focus:ring-white border-gray-700 rounded" />
              <label className="text-gray-300">Electricity charges included in rent</label>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-6">Property Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 font-medium mb-2">Total Rooms</label>
                <input type="number" name="totalRooms" value={formData.totalRooms} onChange={handleInputChange} placeholder="0" className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-gray-300 font-medium mb-2">Available Rooms</label>
                <input type="number" name="availableRooms" value={formData.availableRooms} onChange={handleInputChange} placeholder="0" className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-gray-300 font-medium mb-2">Room Type</label>
                <select name="roomType" value={formData.roomType} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent">
                  <option value="shared">Shared (2-3 people)</option>
                  <option value="double">Double Sharing</option>
                  <option value="single">Single Room</option>
                  <option value="mixed">Mixed Options</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 font-medium mb-2">Bathrooms</label>
                <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleInputChange} placeholder="0" className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent" required />
              </div>
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-6">Available Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {amenitiesList.map((amenity) => {
                const Icon = amenity.icon;
                const isSelected = formData.amenities.includes(amenity.id);
                return (
                  <button key={amenity.id} type="button" onClick={() => handleAmenityToggle(amenity.id)} className={`p-4 rounded-xl border-2 transition-all duration-200 ${isSelected ? 'border-gray-300 bg-gray-800 text-gray-100' : 'border-gray-700 hover:border-gray-600 text-gray-400'}`}>
                    <Icon className="h-6 w-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">{amenity.name}</span>
                    {isSelected && (<Check className="h-4 w-4 text-gray-200 mx-auto mt-1" />)}
                  </button>
                );
              })}
            </div>
          </motion.div>
        );
      case 6:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-6">Property Images</h2>
            <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center">
              <Camera className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-100 mb-2">Upload Property Photos</h3>
              <p className="text-gray-400 mb-4">Add high-quality images to attract more tenants</p>
              <button type="button" onClick={handleChooseImages} className="bg-gradient-to-r from-gray-700 to-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:from-gray-600 hover:to-black transition-all duration-200 flex items-center space-x-2 mx-auto">
                <Upload className="h-5 w-5" />
                <span>Choose Images</span>
              </button>
              <p className="text-sm text-gray-500 mt-2">Maximum 10 images, up to 5MB each</p>
              <input ref={hiddenFileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFilesSelected} />
            </div>
            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {formData.images.map((url) => (
                  <div key={url} className="relative group rounded-xl overflow-hidden border border-gray-700">
                    <img src={url} alt="Property" className="w-full h-36 object-cover" />
                    <button type="button" onClick={() => handleRemoveImage(url)} className="absolute top-2 right-2 bg-gray-900/90 px-2 py-1 rounded text-xs text-gray-200 opacity-0 group-hover:opacity-100 transition">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        );
      case 7:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-6">Contact Information</h2>
            <div>
              <label className="block text-gray-300 font-medium mb-2">Contact Person Name</label>
              <input type="text" name="contactName" value={formData.contactName} onChange={handleInputChange} placeholder="Full name" className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 font-medium mb-2">Phone Number</label>
                <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleInputChange} placeholder="Phone number" className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-gray-300 font-medium mb-2">Email Address</label>
                <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleInputChange} placeholder="Email address" className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent" required />
              </div>
            </div>
          </motion.div>
        );
      case 8:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-6">Property Rules & Timings</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-gray-300 font-medium mb-2">Check-in Time</label>
                <input type="time" name="checkIn" value={formData.timing.checkIn} onChange={(e) => setFormData(prev => ({...prev, timing: { ...prev.timing, checkIn: e.target.value }}))} className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-gray-300 font-medium mb-2">Check-out Time</label>
                <input type="time" name="checkOut" value={formData.timing.checkOut} onChange={(e) => setFormData(prev => ({...prev, timing: { ...prev.timing, checkOut: e.target.value }}))} className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-gray-300 font-medium mb-2">Visiting Hours</label>
                <input type="text" name="visitingHours" value={formData.timing.visitingHours} onChange={(e) => setFormData(prev => ({...prev, timing: { ...prev.timing, visitingHours: e.target.value }}))} placeholder="e.g., 9 AM - 8 PM" className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent" />
              </div>
            </div>
            <div>
              <label className="block text-gray-300 font-medium mb-2">Property Rules</label>
              <textarea value={rulesInput} onChange={(e) => handleRulesInputChange(e.target.value)} placeholder="List important rules and regulations (one per line)" rows={4} className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent" />
            </div>
          </motion.div>
        );
      case 9:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-6">Review & Submit</h2>
            <p className="text-gray-300">You are ready to complete your property listing!</p>
            {/* You can add a summary of the form data here for review */}
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="p-2 rounded-lg hover:bg-gray-800 hover:shadow-md transition-all duration-200">
              <ArrowLeft className="h-6 w-6 text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-100">Add New Property</h1>
              <p className="text-gray-400">List your property for students and professionals</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-gray-900 rounded-2xl p-6 shadow-lg mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-100">Step {currentStep} of {steps.length}</h3>
            <span className="text-sm text-gray-400">{Math.round((currentStep / steps.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
            <div 
              className="bg-gradient-to-r from-gray-300 to-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
          <div className="grid grid-cols-4 md:grid-cols-9 gap-2">
            {steps.map((step, i) => (
              <div key={step.id}
                className={`text-center p-2 rounded-lg transition-all duration-200 ${
                  i + 1 === currentStep
                    ? 'bg-gradient-to-r from-gray-700 to-gray-900 text-white'
                    : i + 1 < currentStep
                    ? 'bg-gray-700 text-gray-100'
                    : 'bg-gray-800 text-gray-400'
                }`}>
                <div className="text-xs font-medium">{step.title}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-2xl p-8 shadow-lg">
          {renderFormStep()}
          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8 border-t border-gray-700">
            <button type="button" onClick={handlePrevious} disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                currentStep === 1 ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
              }`}>
              Previous
            </button>
            {currentStep === steps.length ? (
              <button type="submit"
                className="bg-gray-200 text-gray-900 px-8 py-3 rounded-lg font-medium hover:bg-white transition-all duration-200"
              >Submit Property</button>
            ) : (
              <button type="button" onClick={handleNext}
                className="bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-white transition-all duration-200"
              >Next</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPropertyPage;