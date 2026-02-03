import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Camera, Check, Clock, DollarSign, MapPin, Plus, 
  Star, Upload, X, Utensils, Coffee, ShoppingBag, Scissors, 
  Car, Wrench, Zap, Users, Truck, Store, CreditCard, Banknote, 
  GraduationCap, Boxes, Siren, BadgeCheck, MessageSquare
} from 'lucide-react';

// ✅ 1. Import our authenticated API client
import apiClient from '../apiClient'; 

// --- Type definitions ---
type ServiceFormState = {
  serviceName: string;
  description: string;
  category: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  serviceArea: string;
  priceRange: string;
  priceType: string;
  minimumOrder: string;
  deliveryCharges: string;
  specialties: string[];
  timing: {
    openTime: string;
    closeTime: string;
    workingDays: string[];
  };
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  whatsapp: string;
  features: string[];
  policies: string;
};

const AddServicePage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ServiceFormState>({
    serviceName: '',
    description: '',
    category: 'Food & Tiffin',
    address: '',
    city: 'Pimpri-Chinchwad',
    state: 'Maharashtra',
    pincode: '',
    serviceArea: '',
    priceRange: '',
    priceType: 'per-item',
    minimumOrder: '',
    deliveryCharges: '',
    specialties: [],
    timing: {
      openTime: '',
      closeTime: '',
      workingDays: []
    },
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    whatsapp: '',
    features: [],
    policies: ''
  });

  const [specialtyInput, setSpecialtyInput] = useState('');
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]); 

  const navigate = useNavigate();

  const steps = [
    { id: 1, title: 'Basic Info', description: 'Service details and category' },
    { id: 2, title: 'Location', description: 'Address and service area' },
    { id: 3, title: 'Pricing', description: 'Rates and charges' },
    { id: 4, title: 'Details', description: 'Specialties and timings' },
    { id: 5, title: 'Images', description: 'Service photos' },
    { id: 6, title: 'Contact', description: 'Contact information' },
    { id: 7, title: 'Features', description: 'Additional features and policies' },
    { id: 8, title: 'Review & Submit', description: 'Review and submit your service' },
  ];

  const categories = [
    { id: 'Food & Tiffin', name: 'Food & Tiffin', icon: Utensils },
    { id: 'Cafe & Tea', name: 'Café & Tea', icon: Coffee },
    { id: 'Laundry', name: 'Laundry', icon: Users },
    { id: 'Salon & Spa', name: 'Salon & Spa', icon: Scissors },
    { id: 'Transport', name: 'Transport', icon: Car },
    { id: 'Repair', name: 'Repair Services', icon: Wrench },
    { id: 'Utilities', name: 'Utilities', icon: Zap },
    { id: 'Other', name: 'Other Services', icon: ShoppingBag }
  ];

  const workingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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

  // --- Form handlers ---
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTimingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
        ...prev,
        timing: { ...prev.timing, [name]: value }
    }));
  };

  const handleWorkingDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      timing: {
        ...prev.timing,
        workingDays: prev.timing.workingDays.includes(day)
          ? prev.timing.workingDays.filter(d => d !== day)
          : [...prev.timing.workingDays, day]
      }
    }));
  };

  const handleFeatureToggle = (featureId: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(f => f !== featureId)
        : [...prev.features, featureId]
    }));
  };

  const handleSpecialtyInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpecialtyInput(e.target.value);
  };

  const addSpecialty = () => {
    if (specialtyInput.trim()) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, specialtyInput.trim()]
      }));
      setSpecialtyInput('');
    }
  };

  const removeSpecialty = (itemToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(item => item !== itemToRemove)
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length) {
        const previews = files.map(file => URL.createObjectURL(file));
        setImageFiles(prev => [...prev, ...files]);
        setImagePreviews(prev => [...prev, ...previews]);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImageFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleNext = () => {
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // ✅ 2. The handleSubmit function is completely updated
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSend = new FormData();

    // Append simple key-value pairs
    dataToSend.append('name', formData.serviceName); // Match 'name' field in Mongoose model
    dataToSend.append('description', formData.description);
    dataToSend.append('category', formData.category);
    dataToSend.append('address', formData.address);
    dataToSend.append('city', formData.city);
    dataToSend.append('state', formData.state);
    dataToSend.append('pincode', formData.pincode);
    dataToSend.append('serviceArea', formData.serviceArea);
    dataToSend.append('priceRange', formData.priceRange);
    dataToSend.append('priceType', formData.priceType);
    dataToSend.append('minimumOrder', formData.minimumOrder);
    dataToSend.append('deliveryCharges', formData.deliveryCharges);
    dataToSend.append('contactName', formData.contactName);
    dataToSend.append('contactPhone', formData.contactPhone);
    dataToSend.append('contactEmail', formData.contactEmail);
    dataToSend.append('whatsapp', formData.whatsapp);
    dataToSend.append('policies', formData.policies);

    // Stringify arrays and objects before appending
    dataToSend.append('specialties', JSON.stringify(formData.specialties));
    dataToSend.append('timing', JSON.stringify(formData.timing));
    dataToSend.append('features', JSON.stringify(formData.features));
    
    // Append each image file
    imageFiles.forEach(file => {
      dataToSend.append('images', file);
    });

    try {
      // Use apiClient to send the FormData with authentication
      await apiClient.post('/services', dataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Service Successfully Added!');
      navigate('/quickbasket');

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message;
      alert('Failed to add service: ' + errorMessage);
    }
  };


  const renderFormStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-6">Basic Information</h2>
            <div>
              <label className="block text-gray-300 font-medium mb-2">Service Name</label>
              <input type="text" name="serviceName" value={formData.serviceName} onChange={handleInputChange} placeholder="e.g., Ghar Jaisa Khana Tiffin Service" className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent" required />
            </div>
            <div>
              <label className="block text-gray-300 font-medium mb-2">Service Category</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isSelected = formData.category === category.id;
                  return (
                    <button type="button" key={category.id} onClick={() => setFormData(prev => ({ ...prev, category: category.id }))} className={`p-4 rounded-xl border-2 transition-all duration-200 ${isSelected ? 'border-gray-300 bg-gray-800 text-gray-100' : 'border-gray-700 hover:border-gray-600 text-gray-400'}`}>
                      <Icon className="h-6 w-6 mx-auto mb-2" />
                      <span className="text-sm font-medium">{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-gray-300 font-medium mb-2">Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Describe your service, what makes it special, and what you offer..." rows={4} className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent" required />
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-6">Location & Service Area</h2>
            <div>
              <label className="block text-gray-300 font-medium mb-2">Business Address</label>
              <textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="Enter your business address..." rows={3} className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent" required />
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
              <label className="block text-gray-300 font-medium mb-2">Service Area</label>
              <input type="text" name="serviceArea" value={formData.serviceArea} onChange={handleInputChange} placeholder="e.g., Within 5km radius, Specific localities" className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent" />
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-6">Pricing Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 font-medium mb-2">Price Range</label>
                <input type="text" name="priceRange" value={formData.priceRange} onChange={handleInputChange} placeholder="e.g., ₹100-500, ₹2500/month" className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-gray-300 font-medium mb-2">Price Type</label>
                <select name="priceType" value={formData.priceType} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent">
                  <option value="per-item">Per Item</option>
                  <option value="per-hour">Per Hour</option>
                  <option value="per-service">Per Service</option>
                  <option value="monthly">Monthly</option>
                  <option value="fixed">Fixed Price</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 font-medium mb-2">Minimum Order (₹)</label>
                <input type="number" name="minimumOrder" value={formData.minimumOrder} onChange={handleInputChange} placeholder="0" className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-gray-300 font-medium mb-2">Delivery Charges (₹)</label>
                <input type="number" name="deliveryCharges" value={formData.deliveryCharges} onChange={handleInputChange} placeholder="0" className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent" />
              </div>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-6">Service Details</h2>
            <div>
              <label className="block text-gray-300 font-medium mb-2">Specialties/Menu Items</label>
              <div className="flex space-x-2 mb-2">
                <input type="text" value={specialtyInput} onChange={handleSpecialtyInput} placeholder="Type and hit Enter or click Add" className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSpecialty(); } }} />
                <button type="button" onClick={addSpecialty} className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600"><Plus /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.specialties.map((item) => (
                  <span key={item} className="inline-flex items-center bg-gray-700 text-gray-100 px-2 py-1 rounded-lg">
                    {item}
                    <button type="button" className="ml-2 text-red-400" onClick={() => removeSpecialty(item)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 font-medium mb-2">Opening Time</label>
                <input type="time" name="openTime" value={formData.timing.openTime} onChange={handleTimingChange} className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-gray-300 font-medium mb-2">Closing Time</label>
                <input type="time" name="closeTime" value={formData.timing.closeTime} onChange={handleTimingChange} className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent" />
              </div>
            </div>
            <div>
              <label className="block text-gray-300 font-medium mb-2">Working Days</label>
              <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                {workingDays.map((day) => {
                  const isSelected = formData.timing.workingDays.includes(day);
                  return (
                    <button type="button" key={day} onClick={() => handleWorkingDayToggle(day)} className={`p-2 rounded-lg text-sm font-medium transition-all duration-200 ${isSelected ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                      {day.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-6">Service Images</h2>
            <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center">
              <Camera className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-100 mb-2">Upload Service Photos</h3>
              <p className="text-gray-400 mb-4">Add high-quality images of your service, food, or workspace</p>
              <input id="image-upload" type="file" multiple accept="image/*" onChange={handleImageSelect} className="hidden" />
              <label htmlFor="image-upload" className="cursor-pointer bg-gray-700 text-white px-5 py-2 rounded-lg hover:bg-gray-600">Choose Files</label>
              <div className="flex flex-wrap gap-3 mt-4 justify-center">
                {imagePreviews.map((img, i) => (
                  <div key={i} className="relative w-28 h-20 group">
                    <img src={img} alt={`Service preview ${i+1}`} className="w-full h-full object-cover rounded-lg" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-600/80 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">Maximum 8 images, up to 5MB each</p>
            </div>
          </motion.div>
        );
      case 6:
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
                <label className="block text-gray-300 font-medium mb-2">WhatsApp Number (Optional)</label>
                <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} placeholder="WhatsApp number" className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent" />
              </div>
            </div>
            <div>
              <label className="block text-gray-300 font-medium mb-2">Email Address</label>
              <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleInputChange} placeholder="Email address" className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent" required />
            </div>
          </motion.div>
        );
      case 7:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Additional Features & Policies</h2>
            <div>
              <label className="block text-gray-300 font-medium mb-4">Service Features</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {serviceFeatures.map((feature) => {
                  const Icon = feature.icon;
                  const isSelected = formData.features.includes(feature.id);
                  return (
                    <button type="button" key={feature.id} onClick={() => handleFeatureToggle(feature.id)} className={`p-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 flex items-center text-left gap-2 ${isSelected ? 'border-gray-300 bg-gray-800 text-gray-100' : 'border-gray-700 hover:border-gray-600 text-gray-400'}`}>
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span>{feature.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-gray-300 font-medium mb-2">Policies & Terms</label>
              <textarea name="policies" value={formData.policies} onChange={handleInputChange} placeholder="Mention your service policies, cancellation terms, refund policy, etc." rows={5} className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent" />
            </div>
          </motion.div>
        );
      case 8:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-xl font-semibold text-gray-100 mb-6">Review Your Service</h2>
            <div className="space-y-4 bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-bold border-b border-gray-700 pb-2 mb-3">{formData.serviceName}</h3>
              <p><strong className="text-gray-400">Category:</strong> {formData.category}</p>
              <p><strong className="text-gray-400">Description:</strong> {formData.description}</p>
              <p><strong className="text-gray-400">Address:</strong> {`${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`}</p>
              <p><strong className="text-gray-400">Price:</strong> {formData.priceRange}</p>
              <p><strong className="text-gray-400">Contact:</strong> {formData.contactName} ({formData.contactPhone})</p>
              <div className="flex flex-wrap gap-2 pt-2">
                  {imagePreviews.map((img, i) => (
                      <img key={i} src={img} alt="preview" className="w-24 h-16 object-cover rounded"/>
                  ))}
              </div>
            </div>
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
              <h1 className="text-2xl font-bold text-gray-100">Add New Service</h1>
              <p className="text-gray-400">List your service for students and professionals</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-gray-900 rounded-2xl p-6 shadow-lg mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-100">Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}</h3>
            <span className="text-sm text-gray-400">{Math.round((currentStep / steps.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
            <div
              className="bg-gradient-to-r from-gray-300 to-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            ></div>
          </div>
          <div className="hidden md:grid grid-cols-8 gap-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`text-center p-2 rounded-lg transition-all duration-200 ${
                  step.id === currentStep
                    ? 'bg-gradient-to-r from-gray-700 to-gray-900 text-white'
                    : step.id < currentStep
                    ? 'bg-gray-700 text-gray-100'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                <div className="text-xs font-medium">{step.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* The Main Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 rounded-2xl p-8 shadow-lg"
        >
          {renderFormStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8 mt-8 border-t border-gray-700">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-6 py-3 rounded-lg font-medium transition-all duration-200 bg-gray-800 text-gray-200 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {currentStep === steps.length ? (
              <button
                type="submit"
                className="bg-gray-200 text-gray-900 px-8 py-3 rounded-lg font-bold hover:bg-white transition-all duration-200 flex items-center gap-2"
              >
                <Check className="w-5 h-5"/>
                Submit Service
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-white transition-all duration-200"
              >
                Next
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddServicePage;