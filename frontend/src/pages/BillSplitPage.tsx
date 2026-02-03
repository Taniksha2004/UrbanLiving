import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Plus,
  Receipt,
  Users,
  Trash2,
  Edit,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Utensils,
  Zap,
  Wifi,
  Car
} from 'lucide-react';

// Interface remains the same
interface Bill {
  id: number;
  title: string;
  amount: number;
  paidBy: string;
  splitBetween: string[];
  category: string;
  date: string;
  status: 'pending' | 'settled';
  splitType: 'equal' | 'custom';
  customSplits?: Record<string, number>;
}

const RupeeSign = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    width="1em"
    height="1em"
  >
    <text
      x="3"
      y="19"
      fontSize="18"
      fontFamily="Arial"
      alignmentBaseline="middle"
      textAnchor="start"
    >₹</text>
  </svg>
);

const formatINR = (value: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(value);

const BillSplitPage = () => {
  const [bills, setBills] = useState<Bill[]>(() => {
    try {
      const savedBills = localStorage.getItem('bills');
      return savedBills ? JSON.parse(savedBills) : [];
    } catch (error) {
      console.error("Error reading bills from localStorage. Starting with an empty list.", error);
      return [];
    }
  });

  const [currentUserName, setCurrentUserName] = useState<string>('You');
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.firstName) {
      setCurrentUserName(user.firstName);
    }
  }, []);

  const handleDeleteBill = (billId: number) => {
    if (window.confirm("Are you sure you want to delete this bill? This action cannot be undone.")) {
      const updatedBills = bills.filter(bill => bill.id !== billId);
      setBills(updatedBills);
      localStorage.setItem('bills', JSON.stringify(updatedBills));
    }
  };

  const handleMarkAsSettled = (billId: number) => {
    const updatedBills = bills.map(bill =>
      bill.id === billId ? { ...bill, status: 'settled' as const } : bill
    );
    setBills(updatedBills);
    localStorage.setItem('bills', JSON.stringify(updatedBills));
  };

  const getCategoryIcon = (category: string) => {
    const props = { className: "h-5 w-5 text-white" };
    switch (category) {
      case 'food': return <Utensils {...props} />;
      case 'utilities': return <Zap {...props} />;
      case 'internet': return <Wifi {...props} />;
      case 'transport': return <Car {...props} />;
      default: return <Receipt {...props} />;
    }
  };

  const getCategoryColor = (category: string) => {
    return 'from-black to-gray-800';
  };

  const youOweBills = bills.filter(
    bill =>
      bill.splitBetween.includes(currentUserName) &&
      bill.paidBy !== currentUserName &&
      bill.status === 'pending'
  );

  const owedToYouBills = bills.filter(
    bill =>
      bill.paidBy === currentUserName &&
      bill.splitBetween.some(name => name !== currentUserName) &&
      bill.status === 'pending'
  );

  const calculateUserShare = (bill: Bill, userName: string): number => {
    if (bill.splitType === 'custom' && bill.customSplits) {
      return bill.customSplits[userName] || 0;
    }
    return bill.amount / bill.splitBetween.length;
  };

  const totalOwed = youOweBills.reduce(
    (sum, bill) => sum + calculateUserShare(bill, currentUserName),
    0
  );

  const totalOwedToYou = owedToYouBills.reduce(
    (sum, bill) => {
      const othersShare = bill.splitBetween
        .filter(name => name !== currentUserName)
        .reduce((othersSum, name) => othersSum + calculateUserShare(bill, name), 0);
      return sum + othersShare;
    },
    0
  );

  return (
    <div className="min-h-screen bg-black text-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            BillSplit+
          </h1>
          <p className="text-gray-400">Manage shared expenses effortlessly</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-gray-900 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">You Owe</p>
                <p className="text-2xl font-bold text-red-500">{formatINR(totalOwed)}</p>
              </div>
              <div className="bg-gray-800 p-3 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-gray-900 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Owed to You</p>
                <p className="text-2xl font-bold text-green-400">{formatINR(totalOwedToYou)}</p>
              </div>
              <div className="bg-gray-800 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-gray-900 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Bills</p>
                <p className="text-2xl font-bold text-gray-200">{bills.length}</p>
              </div>
              <div className="bg-gray-800 p-3 rounded-full">
                <Receipt className="h-6 w-6 text-gray-200" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Add Bill Button */}
        <Link to="/dashboard/add-bill" className="flex justify-center mb-8">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-gray-200 text-gray-900 px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-white transition-all duration-300 flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add New Bill</span>
          </motion.button>
        </Link>

        {/* Bills List */}
        <div className="space-y-4">
          {bills.length === 0 ? (
            <div className="text-center bg-gray-900 rounded-2xl p-8 shadow-lg">
              <Receipt className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-200">No bills yet!</h3>
              <p className="text-gray-400 mt-2">Click "Add New Bill" above to get started.</p>
            </div>
          ) : (
            bills.map((bill, index) => (
              <motion.div
                key={bill.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`bg-gradient-to-r ${getCategoryColor(bill.category)} p-3 rounded-full`}>
                      {getCategoryIcon(bill.category)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-200">{bill.title}</h3>
                      <p className="text-gray-400 text-sm">Paid by {bill.paidBy} • {new Date(bill.date).toLocaleDateString()}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-400 text-sm">Split between {bill.splitBetween.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-200">{formatINR(bill.amount)}</p>
                    
                    {/* 👇 THIS IS THE CORRECTED SECTION 👇 */}
                    <div className="text-gray-400 text-sm mt-1">
                      {bill.splitType === 'custom' && bill.customSplits ? (
                        <div className="flex flex-col items-end">
                          {Object.entries(bill.customSplits).map(([name, amount]) => (
                            <span key={name} className="text-xs">
                              {name}: {formatINR(amount)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span>
                          {formatINR(bill.amount / bill.splitBetween.length)} per person
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-end items-center space-x-2 mt-2">
                      {bill.status === 'settled' ? (
                        <span className="bg-gray-700 text-green-400 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1"><CheckCircle className="h-4 w-4" /><span>Settled</span></span>
                      ) : (
                        <span className="bg-gray-700 text-yellow-400 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1"><AlertCircle className="h-4 w-4" /><span>Pending</span></span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-800">
                  <Link
                    to={`/dashboard/add-bill?id=${bill.id}`}
                    className="text-gray-400 hover:text-gray-200 p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
                    title="Edit Bill"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDeleteBill(bill.id)}
                   className="text-red-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"                      title="Delete Bill"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  {bill.status === 'pending' && (
                    <button
                      onClick={() => handleMarkAsSettled(bill.id)}
                      className="bg-green-400 text-gray-900 px-4 py-2 rounded-lg hover:bg-green-300 transition-colors duration-200 text-sm font-medium ml-auto"
                    >
                      Mark as Settled
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BillSplitPage;