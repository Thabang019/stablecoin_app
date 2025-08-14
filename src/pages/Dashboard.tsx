import React from 'react';
import { FiSend, FiCamera, FiUser, FiClock, FiHome, FiArrowUpRight, FiCheck } from 'react-icons/fi';
import { FaQrcode } from 'react-icons/fa';
import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom'


// Types for better TypeScript support
interface Transaction {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  type: 'incoming' | 'outgoing' | 'pending';
  status: 'completed' | 'pending';
}

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const Dashboard: React.FC = ()  => {
  const [balance, setBalance] = useState(0);
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const navigate = useNavigate()
  const firstName = user.user.firstName;
  const userId = user.user.id;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  const API_AUTH_TOKEN = import.meta.env.VITE_API_AUTH_TOKEN

  // Mock data - in real app, this would come from state management
  const transactions: Transaction[] = [
    {
      id: '1',
      title: 'Payment for coffee',
      subtitle: 'From John Doe',
      amount: '+R 150.00',
      type: 'incoming',
      status: 'completed'
    },
    {
      id: '2',
      title: 'Lunch split',
      subtitle: 'To Sarah Wilson',
      amount: '-R 75.50',
      type: 'outgoing',
      status: 'completed'
    },
    {
      id: '3',
      title: 'Rent payment',
      subtitle: 'Payment Request',
      amount: 'R 200.00',
      type: 'pending',
      status: 'pending'
    }
  ];

// Fetch user balance
const fetchUserData = async () => {
    try {
      const getUserBalance = await fetch(`${API_BASE_URL}/${userId}/balance`, {
        headers: {
          Authorization: `Bearer ${API_AUTH_TOKEN}`,
        },
      });

      const data = await getUserBalance.json();

      if (!getUserBalance.ok) {
        alert(data.message || "Error fetching user balance");
        return;
      }

    // Access the tokens array
    const tokensArray = data.tokens; // <-- this is the array
    const zarToken = tokensArray.find((t: { name: string }) => t.name.includes("ZAR"));
    const zarBalance = zarToken.balance;

    console.log("ZAR Balance:", zarBalance);
    setBalance(zarBalance);

    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);


const fetchUserTransactions = async () => {
    try {
      const getTransactions = await fetch(`${API_BASE_URL}/${userId}/transactions`, {
        headers: {
          Authorization: `Bearer ${API_AUTH_TOKEN}`,
        },
      });

      const transactionData = await getTransactions.json();

      if (!getTransactions.ok) {
        alert(transactionData.message || "Error fetching user balance");
        return;
      }


    console.log("Transactions:", transactionData);

    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };
fetchUserTransactions();

  const quickActions: QuickAction[] = [
    {
      icon: <FiSend className="text-teal-400 text-2xl" />,
      label: 'Send',
      onClick: () => navigate('/send')
    },
    {
      icon: <FaQrcode className="text-teal-400 text-2xl" />,
      label: 'Request',
      onClick: () => navigate('/profile')
    },
    {
      icon: <FiCamera className="text-teal-400 text-2xl" />,
      label: 'Scan & Pay',
      onClick: () => console.log('Scan & Pay clicked')
    }
  ];

  const getTransactionColor = (transaction: Transaction): string => {
    if (transaction.type === 'incoming') return 'text-green-400';
    if (transaction.type === 'outgoing') return 'text-red-400';
    return 'text-yellow-400';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'completed') {
      return <FiCheck className="w-4 h-4 text-green-400" />;
    }
    return <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />;
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-4 py-4 bg-gray-800/50 backdrop-blur-sm">
        <div>
          <p className="text-sm text-gray-400">Welcome back,</p>
          <h1 className="text-xl font-semibold">{firstName}</h1>
        </div>
        <button 
          className="bg-teal-500 w-10 h-10 flex items-center justify-center rounded-full text-lg font-bold hover:bg-teal-400 transition-colors"
          aria-label="User profile"
        >
        {firstName.charAt(0).toUpperCase()}
        </button>
      </header>

      {/* Balance Card */}
      <section className="m-4 p-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50">
        <h2 className="text-gray-300 text-sm mb-2">ZAR Stablecoin Balance</h2>
        <p className="text-3xl font-bold mt-2 mb-4">Money :R {balance}</p>
        
        <div className="flex items-center mb-4 text-green-400">
          <FiArrowUpRight className="mr-1" /> 
          <span className="text-sm font-medium">+2.4% today</span>
        </div>

        {/* Enhanced Progress Bar */}
        <div className="w-full h-2 rounded-full bg-gray-700 overflow-hidden mb-3">
          <div className="h-full bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500 w-2/3 rounded-full shadow-lg"></div>
        </div>

        {/* Wallet Address */}
        <div className="flex items-center justify-between">
          <p className="text-gray-500 text-xs font-mono">0x17d0...c9ac</p>
          <button 
            className="text-teal-400 text-xs hover:text-teal-300"
            onClick={() => navigator.clipboard?.writeText('0x17d0c9ac')}
          >
            Copy
          </button>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="flex justify-around my-4 px-4 gap-3">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="flex flex-col items-center bg-gray-800/50 backdrop-blur-sm p-4 rounded-2xl flex-1 max-w-[100px] hover:bg-gray-700/50 transition-all duration-200 border border-gray-700/30"
          >
            {action.icon}
            <span className="mt-2 text-sm font-medium">{action.label}</span>
          </button>
        ))}
      </section>

      {/* Recent Activity */}
      <section className="flex-1 px-4 pb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <button className="text-teal-400 text-sm font-medium hover:text-teal-300 transition-colors">
            View All
          </button>
        </div>
        
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div 
              key={transaction.id}
              className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-2xl flex justify-between items-center border border-gray-700/30 hover:bg-gray-700/30 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(transaction.status)}
                <div>
                  <p className="font-medium text-white">{transaction.title}</p>
                  <p className="text-sm text-gray-400">{transaction.subtitle}</p>
                  <p className="text-xs text-gray-500 capitalize">{transaction.status}</p>
                </div>
              </div>
              <p className={`font-semibold ${getTransactionColor(transaction)}`}>
                {transaction.amount}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Navigation */}
      <nav className="bg-gray-800/80 backdrop-blur-sm py-3 px-4 flex justify-around border-t border-gray-700/50">
        {[
          { icon: FiHome, label: 'Home', active: true },
          { icon: FiSend, label: 'Send', active: false },
          { icon: FaQrcode, label: 'Request', active: false },
          { icon: FiClock, label: 'History', active: false },
          { icon: FiUser, label: 'Profile', active: false }
        ].map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              className={`flex flex-col items-center transition-colors duration-200 ${
                item.active ? 'text-teal-400' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Icon className="text-xl mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Dashboard;