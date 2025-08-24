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
  createdAt: string;
}

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const Dashboard: React.FC = ()  => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1280); // Increased breakpoint
  
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const navigate = useNavigate()
  const firstName = user.user.firstName;
  const userId = user.user.id;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  const API_AUTH_TOKEN = import.meta.env.VITE_API_AUTH_TOKEN

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1280); // Updated breakpoint
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Function to transform API transaction to UI transaction
  const transformTransaction = (apiTransaction: any): Transaction => {
    const isIncoming = apiTransaction.txType.toLowerCase().includes('from');
    const isOutgoing = apiTransaction.txType.toLowerCase().includes('to');
    
    return {
      id: apiTransaction.id,
      title: apiTransaction.txType,
      subtitle: `${apiTransaction.method} â€¢ ${new Date(apiTransaction.createdAt).toLocaleDateString()}`,
      amount: `${isIncoming ? '+' : isOutgoing ? '-' : ''}R ${apiTransaction.value.toFixed(2)}`,
      type: isIncoming ? 'incoming' : isOutgoing ? 'outgoing' : 'pending',
      status: apiTransaction.status.toLowerCase() === 'complete' ? 'completed' : 'pending',
      createdAt: apiTransaction.createdAt
    };
  };

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
      const tokensArray = data.tokens;
      const zarToken = tokensArray.find((t: { name: string }) => t.name.includes("ZAR"));
      const zarBalance = zarToken.balance;

      console.log("ZAR Balance:", zarBalance);
      setBalance(zarBalance);

    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  // Fetch user transactions
  const fetchUserTransactions = async () => {
    try {
      const getTransactions = await fetch(`${API_BASE_URL}/${userId}/transactions`, {
        headers: {
          Authorization: `Bearer ${API_AUTH_TOKEN}`,
        },
      });

      const transactionData = await getTransactions.json();

      if (!getTransactions.ok) {
        alert(transactionData.message || "Error fetching transactions");
        return;
      }

      console.log("Transactions:", transactionData);
      
      // Transform and set transactions
      const transformedTransactions = transactionData.transactions
        .map(transformTransaction)
        .sort((a: Transaction, b: Transaction) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ); // Sort by newest first
      
      setTransactions(transformedTransactions);

    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchUserData(),
        fetchUserTransactions()
      ]);
    };
    
    loadData();
  }, []);

  const quickActions: QuickAction[] = [
    {
      icon: <FiSend style={{ color: 'var(--accent-color)', fontSize: '2rem' }} />,
      label: 'Send',
      onClick: () => navigate('/send')
    },
    {
      icon: <FaQrcode style={{ color: 'var(--accent-color)', fontSize: '2rem' }} />,
      label: 'Request',
      onClick: () => navigate('/profile')
    },
    {
      icon: <FiCamera style={{ color: 'var(--accent-color)', fontSize: '2rem' }} />,
      label: 'Scan & Pay',
      onClick: () => navigate('/scan')
    }
  ];

  const getTransactionColor = (transaction: Transaction): React.CSSProperties => {
    if (transaction.type === 'incoming') return { color: '#4ade80' };
    if (transaction.type === 'outgoing') return { color: '#f87171' };
    return { color: '#facc15' };
  };

  const getStatusIcon = (status: string) => {
    if (status === 'completed') {
      return <FiCheck style={{ color: '#4ade80', width: '16px', height: '16px' }} />;
    }
    return <div style={{ 
      width: '8px', 
      height: '8px', 
      backgroundColor: '#facc15', 
      borderRadius: '50%',
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
    }} />;
  };

  if (isDesktop) {
    // Desktop Layout
    return (
      <div style={{ 
        backgroundColor: 'var(--bg-color)', 
        minHeight: '100vh', 
        color: 'rgba(255, 255, 255, 0.87)', 
        display: 'flex' 
      }}>
        {/* Desktop Sidebar */}
        <div style={{ 
          width: '280px', // Reduced from 320px
          minWidth: '280px', // Added for consistency
          background: 'rgba(255, 255, 255, 0.05)', // More consistent glass effect
          backdropFilter: 'blur(10px)', 
          borderRight: '1px solid rgba(255, 255, 255, 0.1)', 
          display: 'flex', 
          flexDirection: 'column', 
          height: '95vh', 
          overflowY: 'auto' 
        }}>
          {/* Desktop Header */}
          <header style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '20px', // Reduced padding
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)' 
          }}>
            <div>
              <label style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Welcome back</label>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0' }}>{firstName}</h2>
            </div>
            <button 
              style={{
                background: 'var(--accent-color)',
                width: '44px', // Slightly smaller
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                fontSize: '1rem',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                color: 'white',
                transition: 'all 0.3s ease'
              }}
              aria-label="User profile"
            >
              {firstName.charAt(0).toUpperCase()}
            </button>
          </header>

          {/* Desktop Balance Card */}
          <section style={{ 
            margin: '20px', // Reduced margin
            padding: '20px', // Reduced padding
            background: 'rgba(255, 255, 255, 0.05)', 
            backdropFilter: 'blur(10px)', 
            borderRadius: '16px', 
            border: '1px solid rgba(255, 255, 255, 0.1)' 
          }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.75rem' }}>ZAR Stablecoin Balance</label>
            <h1 style={{ margin: '8px 0 16px 0', fontSize: '1.75rem' }}>R {balance}</h1> {/* Smaller font */}
            
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', color: '#4ade80' }}>
              <FiArrowUpRight style={{ marginRight: '4px' }} /> 
              <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>+2.4% today</span>
            </div>

            <div className="decor-line" />

            {/* Wallet Address */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.75rem', fontFamily: 'ui-monospace, SFMono-Regular, Monaco, Consolas, Liberation Mono, Courier New, monospace' }}>{userId}</p>
              <button 
                style={{
                  color: 'var(--accent-color)',
                  fontSize: '0.75rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.3s ease'
                }}
                onClick={() => navigator.clipboard?.writeText('0x17d0c9ac')}
              >
                Copy
              </button>
            </div>
          </section>

          {/* Desktop Quick Actions */}
          <section style={{ padding: '0 20px 20px', flex: 1 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px', // Reduced gap
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    padding: '12px', // Reduced padding
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    color: 'rgba(255, 255, 255, 0.87)'
                  }}
                >
                  <div style={{ fontSize: '1.5rem' }}>{action.icon}</div> {/* Smaller icons */}
                  <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{action.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Desktop Bottom Navigation */}
          <nav style={{ padding: '30px 20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                { icon: FiHome, label: 'Home', active: true },
                { icon: FiSend, label: 'Send', active: false },
                { icon: FaQrcode, label: 'Request', active: false },
                { icon: FiUser, label: 'Profile', active: false }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      transition: 'all 0.3s ease',
                      backgroundColor: item.active ? 'rgba(100, 108, 255, 0.1)' : 'transparent',
                      color: item.active ? 'var(--accent-color)' : 'rgba(255, 255, 255, 0.6)',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <Icon style={{ fontSize: '1rem' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Desktop Main Content */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden',
          maxWidth: 'calc(100vw - 280px)' // Constrain width
        }}>
          {/* Desktop Main Header */}
          <header style={{ 
            padding: '24px 32px', // Reduced padding
            background: 'rgba(255, 255, 255, 0.03)', 
            backdropFilter: 'blur(10px)', 
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0' }}>Recent Activity</h2>
              <button style={{
                color: 'var(--accent-color)',
                fontSize: '0.875rem',
                fontWeight: '500',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.3s ease'
              }}>
                View All
              </button>
            </div>
          </header>

          {/* Desktop Recent Activity */}
          <section style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px', 
              maxWidth: '800px', // Constrain max width
              width: '100%'
            }}>
              {isLoading ? (
                // Loading skeleton
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      padding: '20px', // Reduced padding
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <div style={{ opacity: 0.5 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '16px', height: '16px', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '50%' }}></div>
                          <div style={{ flex: 1 }}>
                            <div style={{ height: '16px', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '4px', marginBottom: '8px' }}></div>
                            <div style={{ height: '12px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', width: '75%' }}></div>
                          </div>
                          <div style={{ height: '16px', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '4px', width: '80px' }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : transactions.length === 0 ? (
                // No transactions state
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  padding: '48px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  textAlign: 'center'
                }}>
                  <div style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px' }}>
                    <FiClock style={{ width: '48px', height: '48px', margin: '0 auto 16px' }} />
                    <p style={{ fontSize: '1.125rem', marginBottom: '8px' }}>No transactions yet</p>
                    <p style={{ fontSize: '1rem' }}>Your recent activity will appear here</p>
                  </div>
                </div>
              ) : (
                // Real transactions
                transactions.map((transaction) => (
                  <div 
                    key={transaction.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      padding: '20px', // Reduced padding
                      borderRadius: '16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      {getStatusIcon(transaction.status)}
                      <div>
                        <p style={{ fontWeight: '500', color: 'rgba(255, 255, 255, 0.87)', fontSize: '0.875rem', margin: '0 0 4px 0' }}>{transaction.title}</p>
                        <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', margin: '0 0 2px 0' }}>{transaction.subtitle}</p>
                        <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'capitalize', margin: '0' }}>{transaction.status}</p>
                      </div>
                    </div>
                    <p style={{ fontWeight: '600', fontSize: '0.875rem', margin: '0', ...getTransactionColor(transaction) }}>
                      {transaction.amount}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    );
  }

  // Mobile Layout
  return (
    <div style={{ 
      backgroundColor: 'var(--bg-color)', 
      minHeight: '100vh', 
      color: 'rgba(255, 255, 255, 0.87)', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      {/* Header */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '20px 24px', 
        background: 'var(--glass-bg)', 
        backdropFilter: 'blur(10px)' 
      }}>
        <div>
          <label style={{ fontSize: '0.875rem' }}>Welcome back</label>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0' }}>{firstName}</h2>
        </div>
        <button 
          style={{
            background: 'var(--accent-color)',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            fontSize: '1.125rem',
            fontWeight: 'bold',
            border: 'none',
            cursor: 'pointer',
            color: 'white',
            transition: 'all 0.3s ease'
          }}
          aria-label="User profile"
        >
        {firstName.charAt(0).toUpperCase()}
        </button>
      </header>

      {/* Balance Card */}
      <section style={{ 
        margin: '24px 24px 16px', 
        padding: '32px', 
        background: 'var(--glass-bg)', 
        backdropFilter: 'blur(10px)', 
        borderRadius: '24px', 
        border: '1px solid rgba(255, 255, 255, 0.1)' 
      }}>
        <label style={{ display: 'block', marginBottom: '12px' }}>ZAR Stablecoin Balance</label>
        <h1 style={{ margin: '8px 0 24px 0', fontSize: '2.5rem' }}>R {balance}</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', color: '#4ade80' }}>
          <FiArrowUpRight style={{ marginRight: '8px' }} /> 
          <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>+2.4% today</span>
        </div>

        <div className="decor-line" />

        {/* Wallet Address */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.75rem', fontFamily: 'ui-monospace, SFMono-Regular, Monaco, Consolas, Liberation Mono, Courier New, monospace' }}>{ userId}</p>
          <button 
            style={{
              color: 'var(--accent-color)',
              fontSize: '0.75rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.3s ease'
            }}
            onClick={() => navigator.clipboard?.writeText('0x17d0c9ac')}
          >
            Copy
          </button>
        </div>
      </section>

      {/* Quick Actions */}
      <section style={{ display: 'flex', justifyContent: 'center', gap: '16px', margin: '0 24px 24px', padding: '0' }}>
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(10px)',
              padding: '24px',
              borderRadius: '24px',
              flex: 1,
              maxWidth: '110px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              color: 'rgba(255, 255, 255, 0.87)'
            }}
          >
            {action.icon}
            <span style={{ marginTop: '12px', fontSize: '0.875rem', fontWeight: '500' }}>{action.label}</span>
          </button>
        ))}
      </section>

      {/* Recent Activity */}
      <section style={{ flex: 1, padding: '0 24px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0' }}>Recent Activity</h3>
          <button style={{
            color: 'var(--accent-color)',
            fontSize: '0.875rem',
            fontWeight: '500',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'color 0.3s ease'
          }}>
            View All
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isLoading ? (
            // Loading skeleton
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(10px)',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div style={{ opacity: 0.5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '16px', height: '16px', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '50%' }}></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ height: '16px', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '4px', marginBottom: '8px' }}></div>
                        <div style={{ height: '12px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', width: '75%' }}></div>
                      </div>
                      <div style={{ height: '16px', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '4px', width: '80px' }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            // No transactions state
            <div style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(10px)',
              padding: '40px',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center'
            }}>
              <div style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px' }}>
                <FiClock style={{ width: '40px', height: '40px', margin: '0 auto 12px' }} />
                <p style={{ fontSize: '1rem', marginBottom: '8px' }}>No transactions yet</p>
                <p style={{ fontSize: '0.875rem' }}>Your recent activity will appear here</p>
              </div>
            </div>
          ) : (
            // Real transactions
            transactions.map((transaction) => (
              <div 
                key={transaction.id}
                style={{
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(10px)',
                  padding: '20px',
                  borderRadius: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {getStatusIcon(transaction.status)}
                  <div>
                    <p style={{ fontWeight: '500', color: 'rgba(255, 255, 255, 0.87)', fontSize: '1rem', margin: '0 0 4px 0' }}>{transaction.title}</p>
                    <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)', margin: '0 0 2px 0' }}>{transaction.subtitle}</p>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'capitalize', margin: '0' }}>{transaction.status}</p>
                  </div>
                </div>
                <p style={{ fontWeight: '600', margin: '0', ...getTransactionColor(transaction) }}>
                  {transaction.amount}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Bottom Navigation */}
      <nav style={{ 
        background: 'var(--glass-bg)', 
        backdropFilter: 'blur(10px)', 
        padding: '16px 24px', 
        display: 'flex', 
        justifyContent: 'space-around', 
        borderTop: '1px solid rgba(255, 255, 255, 0.1)' 
      }}>
        {[
          { icon: FiHome, label: 'Home', active: true },
          { icon: FiSend, label: 'Send', active: false },
          { icon: FaQrcode, label: 'Request', active: false },
          { icon: FiUser, label: 'Profile', active: false }
        ].map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transition: 'all 0.3s ease',
                padding: '4px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: item.active ? 'var(--accent-color)' : 'rgba(255, 255, 255, 0.6)'
              }}
            >
              <Icon style={{ fontSize: '1.25rem', marginBottom: '8px' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Dashboard;