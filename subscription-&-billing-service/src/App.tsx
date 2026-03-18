import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, XCircle, FileText, Loader2, AlertCircle, LayoutDashboard, Settings, LogOut, Download, ArrowRight, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
}

interface Subscription {
  id: string;
  plan_name: string;
  plan_interval: string;
  status: string;
  current_period_end: number;
}

interface Invoice {
  id: string;
  amount_paid: number;
  status: string;
  created_at: number;
  invoice_pdf: string;
}

export default function App() {
  const [email, setEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetch('/api/plans')
      .then((res) => res.json())
      .then((data) => setPlans(data.plans))
      .catch((err) => console.error('Failed to fetch plans', err));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await fetchData();
    setIsLoggedIn(true);
    setLoading(false);
  };

  const fetchData = async () => {
    try {
      const subRes = await fetch(`/api/subscription?email=${encodeURIComponent(email)}`);
      if (subRes.ok) {
        const subData = await subRes.json();
        setSubscription(subData.subscription);
      } else {
        setSubscription(null);
      }

      const invRes = await fetch(`/api/invoices?email=${encodeURIComponent(email)}`);
      if (invRes.ok) {
        const invData = await invRes.json();
        setInvoices(invData.invoices);
      }
    } catch (err) {
      console.error('Error fetching data', err);
    }
  };

  const handleSubscribe = async (planId: string) => {
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, planId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to subscribe');
      
      setSuccessMsg('Subscription initiated! Awaiting payment confirmation.');
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const triggerMockPayment = async (success: boolean) => {
    if (!subscription) return;
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/mock-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: subscription.id, success }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to trigger mock payment');
      
      setSuccessMsg(data.message);
      setTimeout(fetchData, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 selection:bg-indigo-100 selection:text-indigo-900">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-xl shadow-zinc-200/50 border border-zinc-100 w-full max-w-md"
        >
          <div className="flex items-center justify-center w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl mb-8 mx-auto shadow-inner">
            <CreditCard className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold text-center text-zinc-900 mb-2 tracking-tight">Nexus Billing</h1>
          <p className="text-zinc-500 text-center mb-8">Enter your email to access your portal</p>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-zinc-700 mb-2">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                placeholder="you@example.com"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-zinc-900/10"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>Continue <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Activity className="w-5 h-5" /></div>
                  <h3 className="font-medium text-zinc-600">Current Plan</h3>
                </div>
                <p className="text-2xl font-bold text-zinc-900 mt-4">
                  {subscription ? subscription.plan_name : 'No Active Plan'}
                </p>
                <p className="text-sm text-zinc-500 mt-1">
                  {subscription ? `Billed ${subscription.plan_interval}ly` : 'Subscribe to get started'}
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle2 className="w-5 h-5" /></div>
                  <h3 className="font-medium text-zinc-600">Status</h3>
                </div>
                <div className="mt-4">
                  {subscription ? (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold capitalize
                      ${subscription.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 
                        subscription.status === 'past_due' ? 'bg-red-100 text-red-800' : 
                        'bg-amber-100 text-amber-800'}`}
                    >
                      {subscription.status}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-zinc-100 text-zinc-600">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-500 mt-2">
                  {subscription?.status === 'active' ? `Renews ${new Date(subscription.current_period_end * 1000).toLocaleDateString()}` : 'Action required'}
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText className="w-5 h-5" /></div>
                  <h3 className="font-medium text-zinc-600">Total Spent</h3>
                </div>
                <p className="text-2xl font-bold text-zinc-900 mt-4">
                  ${(invoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + curr.amount_paid, 0) / 100).toFixed(2)}
                </p>
                <p className="text-sm text-zinc-500 mt-1">Across {invoices.length} invoices</p>
              </div>
            </div>

            {/* Quick Actions for MVP */}
            {(subscription?.status === 'incomplete' || subscription?.status === 'past_due') && (
              <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl">
                <h3 className="text-base font-semibold text-indigo-900 mb-3">Developer Actions (MVP Testing)</h3>
                <div className="flex gap-4">
                  <button
                    onClick={() => triggerMockPayment(true)}
                    disabled={loading}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <CheckCircle2 className="w-5 h-5" /> Simulate Successful Payment
                  </button>
                  <button
                    onClick={() => triggerMockPayment(false)}
                    disabled={loading}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <XCircle className="w-5 h-5" /> Simulate Failed Payment
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        );
      case 'billing':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-xl font-bold text-zinc-900 mb-4">Available Plans</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plans.map((plan) => (
                  <div key={plan.id} className={`bg-white border-2 rounded-2xl p-6 transition-all relative ${subscription?.plan_name === plan.name ? 'border-indigo-500 shadow-md' : 'border-zinc-200 hover:border-zinc-300'}`}>
                    {subscription?.plan_name === plan.name && (
                      <div className="absolute -top-3 right-6 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        CURRENT PLAN
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-zinc-900">{plan.name}</h3>
                    <div className="mt-3 mb-6">
                      <span className="text-4xl font-extrabold text-zinc-900">${(plan.price / 100).toFixed(2)}</span>
                      <span className="text-zinc-500 font-medium">/{plan.interval}</span>
                    </div>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-center gap-2 text-sm text-zinc-600"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Full API Access</li>
                      <li className="flex items-center gap-2 text-sm text-zinc-600"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> PDF Invoices</li>
                      <li className="flex items-center gap-2 text-sm text-zinc-600"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 24/7 Support</li>
                    </ul>
                    <button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={loading || subscription?.plan_name === plan.name}
                      className={`w-full py-3 rounded-xl font-semibold transition-all
                        ${subscription?.plan_name === plan.name 
                          ? 'bg-indigo-50 text-indigo-700 cursor-not-allowed' 
                          : 'bg-zinc-900 hover:bg-zinc-800 text-white shadow-md shadow-zinc-900/10'}`}
                    >
                      {subscription?.plan_name === plan.name ? 'Active' : 'Subscribe Now'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-zinc-900">Invoice History</h2>
                <button onClick={fetchData} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Refresh</button>
              </div>
              <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                {invoices.length > 0 ? (
                  <div className="divide-y divide-zinc-100">
                    {invoices.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-5 hover:bg-zinc-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-500">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-semibold text-zinc-900">${(invoice.amount_paid / 100).toFixed(2)}</p>
                            <p className="text-sm text-zinc-500">{new Date(invoice.created_at * 1000).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                            {invoice.status}
                          </span>
                          <a 
                            href={`/api/invoices/${invoice.id}/download`} 
                            download
                            className="flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 text-zinc-700 text-sm font-medium rounded-lg transition-all shadow-sm"
                          >
                            <Download className="w-4 h-4" /> PDF
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-zinc-200 mx-auto mb-3" />
                    <p className="text-zinc-500 font-medium">No invoices available yet.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      case 'settings':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm"
          >
            <h2 className="text-xl font-bold text-zinc-900 mb-6">Profile Settings</h2>
            <div className="space-y-6 max-w-md">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">Email Address</label>
                <input type="email" value={email} disabled className="w-full px-4 py-3 bg-zinc-100 border border-zinc-200 rounded-xl text-zinc-500 cursor-not-allowed" />
                <p className="text-xs text-zinc-500 mt-2">Your email is used for billing and cannot be changed here.</p>
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 flex flex-col md:flex-row font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-zinc-200 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-zinc-100">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <CreditCard className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-zinc-900">Nexus</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'billing', icon: CreditCard, label: 'Billing & Plans' },
            { id: 'settings', icon: Settings, label: 'Settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${activeTab === item.id 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'}`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-indigo-600' : 'text-zinc-400'}`} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-100">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-600 font-bold text-xs">
              {email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-zinc-900 truncate">{email}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsLoggedIn(false)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-zinc-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          
          {/* Alerts */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="mb-6 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl flex items-center gap-3 shadow-sm"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="font-medium">{error}</p>
              </motion.div>
            )}
            {successMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-4 rounded-2xl flex items-center gap-3 shadow-sm"
              >
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <p className="font-medium">{successMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
          
        </div>
      </main>
    </div>
  );
}
