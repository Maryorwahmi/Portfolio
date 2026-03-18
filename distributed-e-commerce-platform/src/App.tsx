import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Server, Database, Activity, ShieldCheck, 
  ShoppingCart, Package, ArrowRight, CheckCircle2, 
  XCircle, Clock, RefreshCw, Key, CreditCard, Bell, Plus
} from 'lucide-react';

type EventLog = {
  id: string;
  time: string;
  service: string;
  event: string;
  status: 'info' | 'success' | 'error' | 'warning';
};

export default function App() {
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [orderState, setOrderState] = useState<'idle' | 'pending' | 'inventory_check' | 'payment_process' | 'paid' | 'shipped' | 'failed'>('idle');
  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [notificationState, setNotificationState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [inventoryCount, setInventoryCount] = useState(3);
  const [isSimulating, setIsSimulating] = useState(false);

  const addLog = (service: string, event: string, status: 'info' | 'success' | 'error' | 'warning') => {
    setLogs(prev => [{
      id: Math.random().toString(36).substring(7),
      time: new Date().toLocaleTimeString(),
      service,
      event,
      status
    }, ...prev].slice(0, 15));
  };

  const restockInventory = () => {
    setInventoryCount(prev => prev + 5);
    addLog('Admin', 'Restocked Inventory (+5 units)', 'success');
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const simulateOrderFlow = async (forceFail = false, failAtPayment = false) => {
    if (isSimulating) return;
    setIsSimulating(true);
    setLogs([]);
    setOrderState('idle');
    setPaymentState('idle');
    setNotificationState('idle');

    // 1. Client -> API Gateway
    addLog('Client', 'POST /orders (IdempotencyKey: req-123)', 'info');
    await new Promise(r => setTimeout(r, 600));

    // 2. API Gateway -> Auth Check
    addLog('API Gateway', 'Validating JWT Token', 'info');
    await new Promise(r => setTimeout(r, 400));
    addLog('API Gateway', 'Token Valid. Routing to Order Service', 'success');
    await new Promise(r => setTimeout(r, 600));

    // 3. Order Service -> Create Pending Order
    setOrderState('pending');
    addLog('Order Service', 'Created Order #ORD-999 (Status: Pending)', 'info');
    await new Promise(r => setTimeout(r, 600));

    // 4. Order Service -> Publish Event
    addLog('RabbitMQ', 'Published Event: OrderCreated', 'warning');
    await new Promise(r => setTimeout(r, 800));

    // 5. Product Service -> Consume Event
    setOrderState('inventory_check');
    addLog('Product Service', 'Consumed OrderCreated. Checking Inventory...', 'info');
    await new Promise(r => setTimeout(r, 800));

    if (forceFail || inventoryCount <= 0) {
      // Failure Path (Inventory)
      addLog('Product Service', 'Inventory Check Failed: Out of Stock', 'error');
      await new Promise(r => setTimeout(r, 600));
      addLog('RabbitMQ', 'Published Event: InventoryFailed', 'warning');
      await new Promise(r => setTimeout(r, 800));
      
      setOrderState('failed');
      addLog('Order Service', 'Consumed InventoryFailed. Saga Transition -> Failed', 'error');
      addLog('Order Service', 'Order #ORD-999 Status Updated: Failed', 'error');
      
      setNotificationState('sending');
      addLog('Notification Service', 'Sending Order Failed Email', 'info');
      await new Promise(r => setTimeout(r, 600));
      setNotificationState('sent');
      addLog('Notification Service', 'Email Sent Successfully', 'success');
    } else {
      // Success Path (Inventory)
      setInventoryCount(prev => prev - 1);
      addLog('Product Service', 'Inventory Reserved Successfully', 'success');
      await new Promise(r => setTimeout(r, 600));
      addLog('RabbitMQ', 'Published Event: InventoryReserved', 'warning');
      await new Promise(r => setTimeout(r, 800));

      // 6. Payment Service -> Consume Event
      setOrderState('payment_process');
      setPaymentState('processing');
      addLog('Payment Service', 'Consumed InventoryReserved. Processing Payment...', 'info');
      await new Promise(r => setTimeout(r, 1000));

      if (failAtPayment) {
        // Failure Path (Payment)
        setPaymentState('failed');
        addLog('Payment Service', 'Payment Declined: Insufficient Funds', 'error');
        await new Promise(r => setTimeout(r, 600));
        addLog('RabbitMQ', 'Published Event: PaymentFailed', 'warning');
        await new Promise(r => setTimeout(r, 800));

        setOrderState('failed');
        addLog('Order Service', 'Consumed PaymentFailed. Saga Transition -> Failed', 'error');
        addLog('Order Service', 'Order #ORD-999 Status Updated: Failed', 'error');
        addLog('RabbitMQ', 'Published Event: ReleaseInventory', 'warning');
        await new Promise(r => setTimeout(r, 600));
        
        setInventoryCount(prev => prev + 1);
        addLog('Product Service', 'Consumed ReleaseInventory. Stock Restored', 'success');

        setNotificationState('sending');
        addLog('Notification Service', 'Sending Payment Failed Email', 'info');
        await new Promise(r => setTimeout(r, 600));
        setNotificationState('sent');
        addLog('Notification Service', 'Email Sent Successfully', 'success');
      } else {
        // Success Path (Payment)
        setPaymentState('success');
        addLog('Payment Service', 'Payment Processed Successfully', 'success');
        await new Promise(r => setTimeout(r, 600));
        addLog('RabbitMQ', 'Published Event: OrderPaid', 'warning');
        await new Promise(r => setTimeout(r, 800));

        setOrderState('shipped');
        addLog('Order Service', 'Consumed OrderPaid. Saga Transition -> Shipped', 'success');
        addLog('Order Service', 'Order #ORD-999 Status Updated: Completed', 'success');

        setNotificationState('sending');
        addLog('Notification Service', 'Sending Order Confirmation Email', 'info');
        await new Promise(r => setTimeout(r, 600));
        setNotificationState('sent');
        addLog('Notification Service', 'Email Sent Successfully', 'success');
      }
    }

    setIsSimulating(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-6 md:p-12 selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-medium border border-indigo-500/20">
            <Server className="w-4 h-4" />
            <span>.NET Microservices Architecture</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            Distributed E-Commerce Platform
          </h1>
          <p className="text-zinc-400 max-w-3xl text-lg leading-relaxed">
            A production-grade microservices architecture demonstrating service isolation, event-driven communication via RabbitMQ, API Gateway routing, and distributed transactions (Saga pattern).
          </p>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl max-w-3xl">
            <p className="text-sm text-zinc-300">
              <strong className="text-white">Note:</strong> The full .NET Core, Docker Compose, and RabbitMQ source code has been generated in the <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-indigo-300">/dotnet-ecommerce</code> directory. You can export this project to run it locally. This UI provides an interactive simulation of the event-driven Saga workflow.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Architecture Diagram / Interactive Simulation */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold tracking-tight">Architecture & Event Flow</h2>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => simulateOrderFlow(false, false)}
                  disabled={isSimulating || inventoryCount <= 0}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
                >
                  {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
                  Simulate Order
                </button>
                <button 
                  onClick={() => simulateOrderFlow(false, true)}
                  disabled={isSimulating || inventoryCount <= 0}
                  className="px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors border border-amber-600/30 flex items-center gap-2 text-sm"
                >
                  <CreditCard className="w-4 h-4" />
                  Fail Payment
                </button>
                <button 
                  onClick={() => simulateOrderFlow(true, false)}
                  disabled={isSimulating}
                  className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors border border-rose-600/30 flex items-center gap-2 text-sm"
                >
                  <XCircle className="w-4 h-4" />
                  Fail Inventory
                </button>
                <button 
                  onClick={restockInventory}
                  disabled={isSimulating}
                  className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors border border-emerald-600/30 flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Restock
                </button>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 relative overflow-hidden">
              {/* Connection Lines (Decorative) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" preserveAspectRatio="none">
                <path d="M 150 100 L 400 100" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" fill="none" className="text-indigo-400" />
                <path d="M 400 100 L 400 300 L 150 300" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" fill="none" className="text-indigo-400" />
                <path d="M 400 100 L 650 100" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" fill="none" className="text-indigo-400" />
              </svg>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                
                {/* API Gateway */}
                <div className="col-span-1 md:col-span-3 flex justify-center mb-6">
                  <motion.div 
                    animate={{ 
                      boxShadow: isSimulating ? ['0px 0px 0px rgba(99,102,241,0)', '0px 0px 20px rgba(99,102,241,0.5)', '0px 0px 0px rgba(99,102,241,0)'] : 'none'
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="bg-zinc-950 border border-zinc-700 p-6 rounded-xl w-64 flex flex-col items-center text-center relative"
                  >
                    <div className="absolute -top-3 bg-zinc-800 px-3 py-1 rounded-full text-xs font-medium text-zinc-300 border border-zinc-700">
                      Ocelot / YARP
                    </div>
                    <Server className="w-10 h-10 text-indigo-400 mb-3" />
                    <h3 className="font-semibold text-lg">API Gateway</h3>
                    <p className="text-xs text-zinc-500 mt-2">Routing, Rate Limiting, Auth Middleware</p>
                  </motion.div>
                </div>

                {/* Auth Service */}
                <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-xl flex flex-col items-center text-center opacity-70">
                  <ShieldCheck className="w-8 h-8 text-emerald-400 mb-3" />
                  <h3 className="font-semibold">Auth Service</h3>
                  <div className="mt-4 w-full space-y-2">
                    <div className="flex items-center justify-between text-xs bg-zinc-900 p-2 rounded border border-zinc-800">
                      <span className="text-zinc-400">DB</span>
                      <span className="text-emerald-400 flex items-center gap-1"><Database className="w-3 h-3"/> PostgreSQL</span>
                    </div>
                    <div className="flex items-center justify-between text-xs bg-zinc-900 p-2 rounded border border-zinc-800">
                      <span className="text-zinc-400">Auth</span>
                      <span className="text-zinc-300 flex items-center gap-1"><Key className="w-3 h-3"/> JWT</span>
                    </div>
                  </div>
                </div>

                {/* Order Service */}
                <motion.div 
                  animate={{ 
                    borderColor: orderState !== 'idle' ? 'rgba(99,102,241,0.5)' : 'rgba(39,39,42,1)'
                  }}
                  className="bg-zinc-950 border-2 border-zinc-800 p-5 rounded-xl flex flex-col items-center text-center relative"
                >
                  <ShoppingCart className="w-8 h-8 text-indigo-400 mb-3" />
                  <h3 className="font-semibold">Order Service</h3>
                  
                  {/* Saga State Indicator */}
                  <div className="absolute -top-3 bg-zinc-900 px-3 py-1 rounded-full text-xs font-medium border border-zinc-700 flex items-center gap-1.5">
                    <Activity className="w-3 h-3 text-indigo-400" />
                    <span className="text-zinc-300">Saga Orchestrator</span>
                  </div>

                  <div className="mt-4 w-full space-y-2">
                    <div className="flex items-center justify-between text-xs bg-zinc-900 p-2 rounded border border-zinc-800">
                      <span className="text-zinc-400">DB</span>
                      <span className="text-indigo-400 flex items-center gap-1"><Database className="w-3 h-3"/> PostgreSQL</span>
                    </div>
                    <div className="flex items-center justify-between text-xs bg-zinc-900 p-2 rounded border border-zinc-800">
                      <span className="text-zinc-400">State</span>
                      <span className={`font-medium ${
                        orderState === 'idle' ? 'text-zinc-500' :
                        orderState === 'pending' || orderState === 'inventory_check' || orderState === 'payment_process' ? 'text-amber-400' :
                        orderState === 'failed' ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        {orderState.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Product Service */}
                <motion.div 
                  animate={{ 
                    borderColor: orderState === 'inventory_check' ? 'rgba(99,102,241,0.5)' : 'rgba(39,39,42,1)'
                  }}
                  className="bg-zinc-950 border-2 border-zinc-800 p-5 rounded-xl flex flex-col items-center text-center"
                >
                  <Package className="w-8 h-8 text-sky-400 mb-3" />
                  <h3 className="font-semibold">Product Service</h3>
                  <div className="mt-4 w-full space-y-2">
                    <div className="flex items-center justify-between text-xs bg-zinc-900 p-2 rounded border border-zinc-800">
                      <span className="text-zinc-400">DB</span>
                      <span className="text-sky-400 flex items-center gap-1"><Database className="w-3 h-3"/> PostgreSQL</span>
                    </div>
                    <div className="flex items-center justify-between text-xs bg-zinc-900 p-2 rounded border border-zinc-800">
                      <span className="text-zinc-400">Cache</span>
                      <span className="text-rose-400 flex items-center gap-1"><Database className="w-3 h-3"/> Redis</span>
                    </div>
                    <div className="flex items-center justify-between text-xs bg-zinc-900 p-2 rounded border border-zinc-800">
                      <span className="text-zinc-400">Stock</span>
                      <span className={`font-mono font-medium ${inventoryCount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {inventoryCount} units
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Payment Service */}
                <motion.div 
                  animate={{ 
                    borderColor: paymentState === 'processing' ? 'rgba(245,158,11,0.5)' : 'rgba(39,39,42,1)'
                  }}
                  className="bg-zinc-950 border-2 border-zinc-800 p-5 rounded-xl flex flex-col items-center text-center md:col-start-2"
                >
                  <CreditCard className="w-8 h-8 text-amber-400 mb-3" />
                  <h3 className="font-semibold">Payment Service</h3>
                  <div className="mt-4 w-full space-y-2">
                    <div className="flex items-center justify-between text-xs bg-zinc-900 p-2 rounded border border-zinc-800">
                      <span className="text-zinc-400">DB</span>
                      <span className="text-amber-400 flex items-center gap-1"><Database className="w-3 h-3"/> PostgreSQL</span>
                    </div>
                    <div className="flex items-center justify-between text-xs bg-zinc-900 p-2 rounded border border-zinc-800">
                      <span className="text-zinc-400">Status</span>
                      <span className={`font-medium ${
                        paymentState === 'idle' ? 'text-zinc-500' :
                        paymentState === 'processing' ? 'text-amber-400' :
                        paymentState === 'failed' ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        {paymentState.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Notification Service */}
                <motion.div 
                  animate={{ 
                    borderColor: notificationState === 'sending' ? 'rgba(168,85,247,0.5)' : 'rgba(39,39,42,1)'
                  }}
                  className="bg-zinc-950 border-2 border-zinc-800 p-5 rounded-xl flex flex-col items-center text-center"
                >
                  <Bell className="w-8 h-8 text-purple-400 mb-3" />
                  <h3 className="font-semibold">Notification Service</h3>
                  <div className="mt-4 w-full space-y-2">
                    <div className="flex items-center justify-between text-xs bg-zinc-900 p-2 rounded border border-zinc-800">
                      <span className="text-zinc-400">DB</span>
                      <span className="text-purple-400 flex items-center gap-1"><Database className="w-3 h-3"/> PostgreSQL</span>
                    </div>
                    <div className="flex items-center justify-between text-xs bg-zinc-900 p-2 rounded border border-zinc-800">
                      <span className="text-zinc-400">Status</span>
                      <span className={`font-medium ${
                        notificationState === 'idle' ? 'text-zinc-500' :
                        notificationState === 'sending' ? 'text-purple-400' : 'text-emerald-400'
                      }`}>
                        {notificationState.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Message Broker (RabbitMQ) */}
                <div className="col-span-1 md:col-span-3 mt-2">
                  <div className="bg-[#FF6600]/10 border border-[#FF6600]/30 p-4 rounded-xl flex items-center justify-center gap-4">
                    <Activity className="w-6 h-6 text-[#FF6600]" />
                    <div>
                      <h3 className="font-semibold text-[#FF6600]">RabbitMQ Event Bus</h3>
                      <p className="text-xs text-[#FF6600]/70">Asynchronous Pub/Sub & Dead Letter Queues</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Event Log */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold tracking-tight">Event Stream</h2>
              <button 
                onClick={clearLogs}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Clear Logs
              </button>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 h-[750px] flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                <AnimatePresence initial={false}>
                  {logs.length === 0 && (
                    <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4"
                    >
                      <Clock className="w-8 h-8 opacity-50" />
                      <p className="text-sm">Waiting for events...</p>
                    </motion.div>
                  )}
                  {logs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg text-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono text-zinc-500">{log.time}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          log.service === 'RabbitMQ' ? 'bg-[#FF6600]/20 text-[#FF6600]' :
                          log.service === 'API Gateway' ? 'bg-indigo-500/20 text-indigo-400' :
                          log.service === 'Payment Service' ? 'bg-amber-500/20 text-amber-400' :
                          log.service === 'Notification Service' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-zinc-800 text-zinc-300'
                        }`}>
                          {log.service}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        {log.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />}
                        {log.status === 'error' && <XCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />}
                        {log.status === 'warning' && <ArrowRight className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />}
                        {log.status === 'info' && <Activity className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />}
                        <span className={`font-mono text-xs leading-relaxed ${
                          log.status === 'error' ? 'text-rose-300' :
                          log.status === 'success' ? 'text-emerald-300' :
                          log.status === 'warning' ? 'text-amber-300' :
                          'text-zinc-300'
                        }`}>
                          {log.event}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

