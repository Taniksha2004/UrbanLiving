import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Receipt, Building, ShoppingBasket, ArrowRight, Star,
  CheckCircle, Heart, Smartphone, Download, Shield, Zap,
  Globe, Award, MapPin, DollarSign, ChevronDown
} from 'lucide-react';
import SplineScene from '../components/SplineScene'; // Import your Spline component

// Sub-component for the FAQ section
const FaqItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div
      layout
      onClick={() => setIsOpen(!isOpen)}
      className="border-b border-gray-700 py-6 cursor-pointer"
    >
      <motion.div layout className="flex justify-between items-center">
        <h4 className="text-lg font-semibold text-white">{question}</h4>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="h-5 w-5 text-gray-400" />
        </motion.div>
      </motion.div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 text-gray-400"
          >
            {answer}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const HomePage = () => {
  const features = [
    { icon: Users, title: 'Find Roommates', description: 'Match with compatible roommates based on lifestyle, budget, and preferences.', href: '/homematch' },
    { icon: Receipt, title: 'Split Bills Easily', description: 'Track shared expenses and settle bills with your roommates effortlessly.', href: '/billsplit' },
    { icon: Building, title: 'Discover Properties', description: 'Browse verified hostels, PGs, and co-living spaces with detailed reviews.', href: '/properties' },
    { icon: ShoppingBasket, title: 'Local Services', description: 'Find nearby services like food delivery, laundry, and daily essentials.', href: '/quickbasket' }
  ];

  const testimonials = [
    { name: 'Priya Sharma', role: 'Student, Mumbai', content: 'Found my perfect roommate in just 2 days! The compatibility matching is incredible.', rating: 5, avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150' },
    { name: 'Arjun Patel', role: 'Software Engineer, Bangalore', content: 'BillSplit+ has made managing shared expenses so much easier. No more awkward conversations!', rating: 5, avatar: 'https://images.pexels.com/photos/3778603/pexels-photo-3778603.jpeg?auto=compress&cs=tinysrgb&w=150' },
    { name: 'Sneha Gupta', role: 'MBA Student, Delhi', content: 'Love the local services feature. Found amazing tiffin services near my hostel!', rating: 5, avatar: 'https://images.pexels.com/photos/3763152/pexels-photo-3763152.jpeg?auto=compress&cs=tinysrgb&w=150' }
  ];

  const steps = [
    { step: '01', title: 'Create Your Profile', description: 'Tell us about your lifestyle, budget, and preferences to get personalized matches.' },
    { step: '02', title: 'Discover & Connect', description: 'Browse roommates and properties tailored to your needs with smart filters.' },
    { step: '03', title: 'Move In & Thrive', description: 'Settle into your new space and enjoy seamless co-living.' }
  ];

  const featuredProperties = [
    {
      id: 1,
      name: 'Modern Co-Living Hub',
      location: 'Koramangala, Bangalore',
      price: 15000,
      image: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=400',
      type: 'Co-Living'
    },
    {
      id: 2,
      name: 'Student PG Near Campus',
      location: 'Viman Nagar, Pune',
      price: 9000,
      image: 'https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=400',
      type: 'PG'
    },
    {
      id: 3,
      name: 'City Center Hostel',
      location: 'Bandra, Mumbai',
      price: 12500,
      image: 'https://images.pexels.com/photos/262048/pexels-photo-262048.jpeg?auto=compress&cs=tinysrgb&w=400',
      type: 'Hostel'
    }
  ];

  const faqs = [
    { question: 'How does the roommate matching work?', answer: 'Our AI-powered algorithm analyzes your lifestyle, preferences, budget, and habits to suggest the most compatible roommate profiles for you, saving you time and effort.' },
    { question: 'Are the properties listed on UrbanLiving verified?', answer: 'Yes, all properties go through a verification process. We also have \'College Approved\' badges for places that meet specific standards for students.' },
    { question: 'Is it free to create a profile?', answer: 'Absolutely! Creating a profile, browsing other profiles, and viewing properties is completely free. We only charge a small fee when you successfully finalize a match or booking.' },
    { question: 'How does bill splitting work?', answer: 'You can add shared expenses, specify who paid, and select who to split it with. The app automatically calculates each person\'s share, tracks who has paid, and sends gentle reminders for pending payments.' }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden font-sans">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Spline Scene Background */}
        <div className="absolute inset-0 z-0 overflow-hidden scale-150">
          <SplineScene />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            >
              Smart Co-Living for the
              <motion.span 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }}
                className="block text-gray-400 mt-2"
              >
                Urban Generation
              </motion.span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg sm:text-xl mb-8 text-gray-400 max-w-3xl mx-auto"
            >
              Find roommates, split bills, discover properties, and connect with local services—all in one intelligent platform.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}
              className="flex justify-center items-center"
            >
              <Link to="/signup" className="group bg-white text-black px-8 py-4 font-semibold hover:bg-gray-300 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 rounded-md">
                <span>Get Started</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
              Explore Our Core Features
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Discover how our integrated platform solves all your urban living challenges.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link to={feature.href} className="block group">
                    <div className="bg-gray-800 p-8 h-full border border-gray-700 hover:border-white hover:-translate-y-2 transition-all duration-300 rounded-lg">
                      <Icon className="h-10 w-10 text-white mb-6" />
                      <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                      <p className="text-gray-400 mb-6">{feature.description}</p>
                      <div className="flex items-center text-white font-semibold group-hover:text-gray-300">
                        <span>Explore</span>
                        <ArrowRight className="h-5 w-5 ml-2 transform group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">Get started in three simple steps.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
              <div className="hidden md:block absolute top-8 left-0 w-full h-px bg-gray-700"></div>
            {steps.map((step, index) => (
              <motion.div 
                key={step.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.2 }} viewport={{ once: true }}
                className="text-center relative z-10"
              >
                <div className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold border-4 border-black">{step.step}</div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">What Our Community Says</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">Join thousands of happy users who've transformed their urban living experience.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={testimonial.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true }}
                className="bg-gray-900 p-8 border border-gray-800 rounded-lg"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <img className="h-12 w-12 rounded-full object-cover mr-4" src={testimonial.avatar} alt={testimonial.name} />
                  <div>
                    <h4 className="font-bold text-white">{testimonial.name}</h4>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="text-center mb-12">
                <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">Frequently Asked Questions</h2>
                <p className="text-lg text-gray-400">Have questions? We have answers. If you can't find it here, feel free to contact us.</p>
            </motion.div>
            <div className="space-y-4">
                {faqs.map((faq, index) => (
                    <FaqItem key={index} question={faq.question} answer={faq.answer} />
                ))}
            </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
            <h2 className="text-3xl lg:text-5xl font-bold mb-6 text-white">Ready to Transform Your Urban Living?</h2>
            <p className="text-xl mb-8 text-gray-400 max-w-3xl mx-auto">Join thousands of students and young professionals who've made co-living simple, smart, and social.</p>
            <Link to="/signup" className="group bg-white text-black px-8 py-4 font-semibold hover:bg-gray-300 transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center rounded-md">
              <span>Get Started Free</span>
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
