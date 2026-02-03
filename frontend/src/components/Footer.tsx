import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Mail, Phone, MapPin, Instagram, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-1">
                  <h3 className="text-2xl font-bold text-white">UrbanLiving</h3>
                  <p className="text-gray-400 mt-2">Smart co-living for the urban generation.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-white tracking-wider uppercase">Features</h4>
                  <ul className="mt-4 space-y-2 text-gray-400">
                      <li><Link to="/homematch" className="hover:text-white">HomeMatch</Link></li>
                      <li><Link to="/billsplit" className="hover:text-white">BillSplit+</Link></li>
                      <li><Link to="/properties" className="hover:text-white">Properties</Link></li>
                      <li><Link to="/quickbasket" className="hover:text-white">QuickBasket</Link></li>
                  </ul>
              </div>
              <div>
                  <h4 className="font-semibold text-white tracking-wider uppercase">Company</h4>
                  <ul className="mt-4 space-y-2 text-gray-400">
                      <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                      <li><Link to="/careers" className="hover:text-white">Careers</Link></li>
                      <li><Link to="/press" className="hover:text-white">Press</Link></li>
                      <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
                  </ul>
              </div>
              <div>
                  <h4 className="font-semibold text-white tracking-wider uppercase">Legal</h4>
                  <ul className="mt-4 space-y-2 text-gray-400">
                      <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                      <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
                  </ul>
              </div>
          </div>
          <div className="mt-12 border-t border-gray-800 pt-8 text-center text-gray-500">
              <p>&copy; {new Date().getFullYear()} UrbanLiving. All rights reserved.</p>
          </div>
      </div>
    </footer>
  );
};

export default Footer;