import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Upload, User, MapPin, DollarSign, Camera,
  Plus, X, Check, Coffee, Moon, Utensils, Music, Dumbbell,
  BookOpen, Users, Heart, Star
} from 'lucide-react';
import apiClient from '../apiClient';

const AddProfilePage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    age: '',
    gender: 'male',
    occupation: '',
    bio: '',
    // Location Preferences
    preferredCities: [] as string[],
    preferredAreas: '',
    maxCommute: '',
    // Budget
    budgetMin: '',
    budgetMax: '',
    // Lifestyle
    lifestyle: {
      cleanliness: 5, socialness: 5, nightOwl: 5, cooking: 5,
      smoking: false, drinking: false, pets: false
    },
    // Interests
    interests: [] as string[],
    // Preferences
    roomType: 'shared',
    genderPreference: 'any',
    ageRange: { min: 18, max: 35 },
    // Images
    profileImages: [] as string[], // Holds preview URLs
    // Additional
    languages: [] as string[],
    workSchedule: '',
    dealBreakers: [] as string[]
  });

  // State to hold the actual image files for upload
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const hiddenFileInputRef = useRef<HTMLInputElement | null>(null);

  const steps = [
    { id: 1, title: 'Personal' }, { id: 2, title: 'Location' }, { id: 3, title: 'Budget' },
    { id: 4, title: 'Lifestyle' }, { id: 5, title: 'Interests' }, { id: 6, title: 'Preferences' },
    { id: 7, title: 'Photos' }, { id: 8, title: 'Review & Submit' }
  ];
  const interestsList = [
    { id: 'cooking', name: 'Cooking', icon: Utensils }, { id: 'music', name: 'Music', icon: Music },
    { id: 'fitness', name: 'Fitness', icon: Dumbbell }, { id: 'reading', name: 'Reading', icon: BookOpen },
    { id: 'movies', name: 'Movies', icon: Users }, { id: 'travel', name: 'Travel', icon: MapPin },
    { id: 'gaming', name: 'Gaming', icon: Users }, { id: 'yoga', name: 'Yoga', icon: Heart },
    { id: 'photography', name: 'Photography', icon: Camera }, { id: 'dancing', name: 'Dancing', icon: Music },
    { id: 'sports', name: 'Sports', icon: Dumbbell }, { id: 'art', name: 'Art', icon: Star }
  ];

  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'];
  const languages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Gujarati', 'Kannada'];
  const dealBreakers = ['Smoking', 'Drinking', 'Loud Music', 'Pets', 'Overnight Guests', 'Messy Habits'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLifestyleChange = (key: string, value: number | boolean) => {
    setFormData(prev => ({ ...prev, lifestyle: { ...prev.lifestyle, [key]: value } }));
  };
  
  const handleMultiSelectToggle = (field: keyof typeof formData, value: string) => {
    setFormData(prev => {
      const currentValues = prev[field] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(item => item !== value)
        : [...currentValues, value];
      return { ...prev, [field]: newValues };
    });
  };
  
  const handleChooseImages = () => {
    hiddenFileInputRef.current?.click();
  };
    
  const handleNext = () => currentStep < steps.length && setCurrentStep(currentStep + 1);
  const handlePrevious = () => currentStep > 1 && setCurrentStep(currentStep - 1);
  
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const maxImages = 5;
    const newFiles = files.slice(0, maxImages - imageFiles.length);
    const newImageFiles = [...imageFiles, ...newFiles];
    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
    setImageFiles(newImageFiles);
    setFormData(prev => ({ ...prev, profileImages: [...prev.profileImages, ...newPreviewUrls] }));
    e.target.value = '';
  };

  const handleRemoveImage = (urlToRemove: string) => {
    const imageIndex = formData.profileImages.findIndex(url => url === urlToRemove);
    if (imageIndex > -1) {
      const updatedImageFiles = imageFiles.filter((_, index) => index !== imageIndex);
      const updatedPreviewUrls = formData.profileImages.filter(url => url !== urlToRemove);
      setImageFiles(updatedImageFiles);
      setFormData(prev => ({ ...prev, profileImages: updatedPreviewUrls }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSend = new FormData();

    // This loop reliably adds every field from your form's state.
    Object.entries(formData).forEach(([key, value]) => {
      // We skip profileImages because we handle the actual files separately.
      if (key !== 'profileImages') {
        // Convert objects/arrays to JSON strings, otherwise just use the value.
        const valueToAppend = typeof value === 'object' && value !== null 
          ? JSON.stringify(value) 
          : String(value);
        dataToSend.append(key, valueToAppend);
      }
    });

    // This loop adds the actual image files for upload.
    imageFiles.forEach(file => {
      dataToSend.append('profileImages', file);
    });

    // Use apiClient for the authenticated request.
    try {
      await apiClient.post('/profiles', dataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Profile created successfully!');
      navigate('/homematch');
    } catch (err: any) {
      console.error("Submission Error:", err);
      const errorMessage = err.response?.data?.message || err.message;
      alert('Something went wrong while saving: ' + errorMessage);
    }
  };
  return (
    <div className="min-h-screen bg-black text-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
                <Link to="/dashboard" className="p-2 rounded-lg hover:bg-gray-800 hover:shadow-md transition-all duration-200">
                    <ArrowLeft className="h-6 w-6 text-gray-400" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-100">Complete Your Profile</h1>
                    <p className="text-gray-400">Help us find your perfect roommate match</p>
                </div>
            </div>
        </div>
        <div className="bg-gray-900 rounded-2xl p-6 shadow-lg mb-8">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-100">Step {currentStep} of {steps.length}</h3>
                <span className="text-sm text-gray-400">{Math.round((currentStep / steps.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
                <div className="bg-gradient-to-r from-gray-300 to-white h-2 rounded-full transition-all duration-300" style={{ width: `${(currentStep / steps.length) * 100}%` }}></div>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-8 gap-2">
                {steps.map((step) => (
                    <div key={step.id} className={`text-center p-2 rounded-lg transition-all duration-200 ${step.id === currentStep ? 'bg-gradient-to-r from-gray-700 to-gray-900 text-white' : step.id < currentStep ? 'bg-gray-700 text-gray-100' : 'bg-gray-800 text-gray-400'}`}>
                        <div className="text-xs font-medium">{step.title}</div>
                    </div>
                ))}
            </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-2xl p-8 shadow-lg">
          {currentStep === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-100 mb-6">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div><label className="block text-gray-300 font-medium mb-2">First Name</label><input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="First name" className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600" required /></div>
                     <div><label className="block text-gray-300 font-medium mb-2">Last Name</label><input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Last name" className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600" required /></div>
                     <div><label className="block text-gray-300 font-medium mb-2">Age</label><input type="number" name="age" value={formData.age} onChange={handleInputChange} placeholder="Age" min="18" max="99" className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600" required /></div>
                     <div><label className="block text-gray-300 font-medium mb-2">Gender</label><select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600" required><option value="">Select gender</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
                  </div>
                  <div><label className="block text-gray-300 font-medium mb-2">Occupation</label><input type="text" name="occupation" value={formData.occupation} onChange={handleInputChange} placeholder="e.g., Software Engineer, Student" className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600" required /></div>
                  <div><label className="block text-gray-300 font-medium mb-2">Bio</label><textarea name="bio" value={formData.bio} onChange={handleInputChange} placeholder="Tell us about yourself..." rows={4} className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600" required /></div>
              </motion.div>
          )}
          {currentStep === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-100 mb-6">Location Preferences</h2>
                <div><label className="block text-gray-300 font-medium mb-4">Preferred Cities</label><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{cities.map(city => <button key={city} type="button" onClick={() => handleMultiSelectToggle('preferredCities', city)} className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${formData.preferredCities.includes(city) ? 'border-gray-300 bg-gray-800 text-gray-100' : 'border-gray-700 hover:border-gray-600 text-gray-400'}`}>{city}{formData.preferredCities.includes(city) && <Check className="h-4 w-4 inline ml-2" />}</button>)}</div></div>
                <div><label className="block text-gray-300 font-medium mb-2">Preferred Areas/Localities</label><textarea name="preferredAreas" value={formData.preferredAreas} onChange={handleInputChange} placeholder="List specific areas you prefer..." rows={3} className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600" /></div>
                <div><label className="block text-gray-300 font-medium mb-2">Maximum Commute Time</label><select name="maxCommute" value={formData.maxCommute} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600"><option value="">Select commute time</option><option value="15min">Up to 15 mins</option><option value="30min">Up to 30 mins</option><option value="45min">Up to 45 mins</option><option value="1hour">Up to 1 hour</option></select></div>
            </motion.div>
          )}
          {currentStep === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-100 mb-6">Budget Range</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className="block text-gray-300 font-medium mb-2">Minimum Budget (₹)</label><input type="number" name="budgetMin" value={formData.budgetMin} onChange={handleInputChange} placeholder="e.g., 10000" className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600" required /></div>
                  <div><label className="block text-gray-300 font-medium mb-2">Maximum Budget (₹)</label><input type="number" name="budgetMax" value={formData.budgetMax} onChange={handleInputChange} placeholder="e.g., 20000" className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600" required /></div>
              </div>
            </motion.div>
          )}
          {currentStep === 4 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-100 mb-6">Lifestyle Preferences</h2>
                  <div className="space-y-6">{[{ key: 'cleanliness', label: 'Cleanliness', icon: Utensils }, { key: 'socialness', label: 'Social Level', icon: Users }, { key: 'nightOwl', label: 'Night Owl', icon: Moon }, { key: 'cooking', label: 'Cooking', icon: Coffee }].map(({ key, label, icon: Icon }) => (<div key={key}><div className="flex items-center space-x-2 mb-3"><Icon className="h-5 w-5 text-gray-300" /><label className="text-gray-300 font-medium">{label}</label></div><div className="flex items-center space-x-4"><span className="text-sm text-gray-400">Low</span><input type="range" min="1" max="10" value={formData.lifestyle[key as keyof typeof formData.lifestyle] as number} onChange={(e) => handleLifestyleChange(key, parseInt(e.target.value))} className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" /><span className="text-sm text-gray-400">High</span><span className="text-sm font-medium text-gray-300 w-8">{formData.lifestyle[key as keyof typeof formData.lifestyle]}</span></div></div>))}</div>
                  <div className="space-y-4 pt-6 border-t border-gray-700"><h3 className="font-medium text-gray-100">Habits</h3>{[{ key: 'smoking', label: 'I smoke' }, { key: 'drinking', label: 'I drink alcohol' }, { key: 'pets', label: 'I have pets' }].map(({ key, label }) => (<div key={key} className="flex items-center space-x-3"><input type="checkbox" checked={formData.lifestyle[key as keyof typeof formData.lifestyle] as boolean} onChange={(e) => handleLifestyleChange(key, e.target.checked)} className="h-4 w-4 text-white bg-gray-800 focus:ring-white border-gray-700 rounded" /><label className="text-gray-300">{label}</label></div>))}</div>
              </motion.div>
          )}
          {currentStep === 5 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-100 mb-6">Interests & Hobbies</h2>
                  <div><label className="block text-gray-300 font-medium mb-4">Interests</label><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{interestsList.map(item => <button key={item.id} type="button" onClick={() => handleMultiSelectToggle('interests', item.id)} className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${formData.interests.includes(item.id) ? 'border-gray-300 bg-gray-800 text-gray-100' : 'border-gray-700 hover:border-gray-600 text-gray-400'}`}>{item.name}</button>)}</div></div>
                  <div><label className="block text-gray-300 font-medium mb-4">Languages Spoken</label><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{languages.map(lang => <button key={lang} type="button" onClick={() => handleMultiSelectToggle('languages', lang)} className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${formData.languages.includes(lang) ? 'border-gray-300 bg-gray-800 text-gray-100' : 'border-gray-700 hover:border-gray-600 text-gray-400'}`}>{lang}</button>)}</div></div>
              </motion.div>
          )}
          {currentStep === 6 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-100 mb-6">Roommate Preferences</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div><label className="block text-gray-300 font-medium mb-2">Preferred Room Type</label><select name="roomType" value={formData.roomType} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600"><option value="shared">Shared Room</option><option value="single">Single Room</option><option value="any">Any</option></select></div>
                     <div><label className="block text-gray-300 font-medium mb-2">Preferred Gender</label><select name="genderPreference" value={formData.genderPreference} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600"><option value="any">Any</option><option value="same">Same Gender</option></select></div>
                  </div>
                  <div><label className="block text-gray-300 font-medium mb-4">Preferred Age Range</label><div className="grid grid-cols-2 gap-6"><div><label className="block text-gray-400 text-sm mb-2">Min Age</label><input type="number" value={formData.ageRange.min} onChange={(e) => setFormData(p => ({...p, ageRange: { ...p.ageRange, min: parseInt(e.target.value) }}))} min="18" max="99" className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600" /></div><div><label className="block text-gray-400 text-sm mb-2">Max Age</label><input type="number" value={formData.ageRange.max} onChange={(e) => setFormData(p => ({...p, ageRange: { ...p.ageRange, max: parseInt(e.target.value) }}))} min="18" max="99" className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600" /></div></div></div>
                  <div><label className="block text-gray-300 font-medium mb-4">Deal Breakers</label><div className="grid grid-cols-2 md:grid-cols-3 gap-3">{dealBreakers.map(item => <button key={item} type="button" onClick={() => handleMultiSelectToggle('dealBreakers', item)} className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${formData.dealBreakers.includes(item) ? 'border-red-500 bg-red-900 text-red-400' : 'border-gray-700 hover:border-gray-600 text-gray-400'}`}>{item}</button>)}</div></div>
              </motion.div>
          )}
          {currentStep === 7 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-100 mb-6">Profile Photos</h2>
                <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center">
                  <Camera className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-100 mb-2">Upload Profile Pictures</h3>
                  <p className="text-gray-400 mb-4">Add photos to increase your chances of finding a match</p>
                  <button type="button" onClick={handleChooseImages} className="bg-gradient-to-r from-gray-700 to-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:from-gray-600 hover:to-black transition-all duration-200 flex items-center space-x-2 mx-auto">
                    <Upload className="h-5 w-5" />
                    <span>Choose Photos</span>
                  </button>
                  <input ref={hiddenFileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFilesSelected} />
                  <p className="text-sm text-gray-500 mt-2">Maximum 5 photos, up to 5MB each</p>
                </div>
                {formData.profileImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                    {formData.profileImages.map((url) => (
                      <div key={url} className="relative group rounded-xl overflow-hidden border border-gray-700">
                        <img src={url} alt="Profile preview" className="w-full h-36 object-cover" />
                        <button type="button" onClick={() => handleRemoveImage(url)} className="absolute top-1 right-1 bg-gray-900/80 text-gray-100 p-1 rounded-full opacity-0 group-hover:opacity-100 transition">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
          )}
           {currentStep === 8 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-100 mb-6">Review & Submit</h2>
              {/* Review content will go here */}
              <p className="text-gray-300">You are ready to complete your profile!</p>
            </motion.div>
          )}

          <div className="flex justify-between pt-8 border-t border-gray-700">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  currentStep === 1
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                }`}
              >
                Previous
              </button>
              {currentStep === steps.length ? (
                <button type="submit" className="px-8 py-3 rounded-lg font-medium bg-gray-200 text-gray-900 hover:bg-white">Complete Profile</button>
              ) : (
                <button type="button" onClick={handleNext} className="px-6 py-3 rounded-lg font-medium bg-gray-200 text-gray-900 hover:bg-white">Next</button>
              )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProfilePage;
