import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, LogOut, FileText } from 'lucide-react';
import AIChat from './components/AIChat';
import Auth from './components/Auth';

type Provider = {
  id: string;
  user_id: string;
  name: string;
  timezone: string;
};

type TimeSlot = {
  id: string;
  provider_id: string;
  start_time: string;
  end_time: string;
  is_booked: number;
};

type Appointment = {
  id: string;
  slot_id: string;
  client_id: string;
  status: string;
  reason: string | null;
  start_time: string;
  end_time: string;
  provider_name: string;
};

type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [bookingReason, setBookingReason] = useState<string>('');

  useEffect(() => {
    if (currentUser) {
      fetchProviders();
      fetchAppointments();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedProvider) {
      fetchSlots(selectedProvider);
    } else {
      setSlots([]);
    }
  }, [selectedProvider]);

  const fetchProviders = async () => {
    try {
      const res = await fetch('/api/providers');
      const data = await res.json();
      setProviders(data);
      if (data.length > 0) {
        setSelectedProvider(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch providers', err);
    }
  };

  const fetchSlots = async (providerId: string) => {
    try {
      const res = await fetch(`/api/providers/${providerId}/slots`);
      const data = await res.json();
      setSlots(data);
    } catch (err) {
      console.error('Failed to fetch slots', err);
    }
  };

  const fetchAppointments = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/users/${currentUser.id}/appointments`);
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      console.error('Failed to fetch appointments', err);
    }
  };

  const bookAppointment = async (slotId: string, reasonOverride?: string) => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slot_id: slotId,
          client_id: currentUser.id,
          reason: reasonOverride || bookingReason || 'No reason provided',
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to book appointment');
      }
      
      setSuccess('Appointment booked successfully!');
      setBookingReason('');
      fetchSlots(selectedProvider);
      fetchAppointments();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'cancelled',
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel appointment');
      }
      
      setSuccess('Appointment cancelled successfully!');
      if (selectedProvider) {
        fetchSlots(selectedProvider);
      }
      fetchAppointments();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Format date to local timezone
  const formatLocalTime = (utcString: string) => {
    const date = parseISO(utcString);
    return format(date, 'MMM d, yyyy h:mm a');
  };

  if (!currentUser) {
    return <Auth onLogin={setCurrentUser} />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-200 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Smart Booking Platform</h1>
            <p className="text-neutral-500 mt-1">Real-time appointment scheduling</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-neutral-200">
              <User className="w-4 h-4 text-neutral-500" />
              <span className="text-sm font-medium">Logged in as {currentUser.name}</span>
            </div>
            <button 
              onClick={() => setCurrentUser(null)}
              className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 border border-red-100">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-start gap-3 border border-emerald-100">
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{success}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Booking Section */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
            <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Book an Appointment
            </h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">Select Provider</label>
              <select 
                className="w-full border border-neutral-300 rounded-xl p-3 bg-neutral-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
              >
                <option value="" disabled>Select a provider</option>
                {providers.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">Reason for Appointment</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none text-neutral-400">
                  <FileText className="h-5 w-5" />
                </div>
                <textarea
                  rows={2}
                  value={bookingReason}
                  onChange={(e) => setBookingReason(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-neutral-300 rounded-xl bg-neutral-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                  placeholder="E.g., General checkup, consultation..."
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-neutral-700 mb-3">Available Time Slots (Your Local Time)</h3>
              {slots.length === 0 ? (
                <p className="text-neutral-500 text-sm italic bg-neutral-50 p-4 rounded-xl text-center border border-neutral-100">No available slots found for this provider.</p>
              ) : (
                <div className="space-y-3">
                  {slots.map(slot => (
                    <div key={slot.id} className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-lg text-indigo-700">
                          <Clock className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-sm">{formatLocalTime(slot.start_time)}</span>
                      </div>
                      <button 
                        onClick={() => bookAppointment(slot.id)}
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Book
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* My Appointments Section */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
            <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              My Appointments
            </h2>
            
            {appointments.length === 0 ? (
              <p className="text-neutral-500 text-sm italic bg-neutral-50 p-4 rounded-xl text-center border border-neutral-100">You have no appointments yet.</p>
            ) : (
              <div className="space-y-4">
                {appointments.map(apt => (
                  <div key={apt.id} className={`p-5 rounded-xl border ${apt.status === 'cancelled' ? 'border-neutral-200 bg-neutral-50 opacity-75' : 'border-emerald-200 bg-emerald-50/30'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-neutral-900">{apt.provider_name}</h3>
                        <p className="text-sm text-neutral-600 mt-1 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {formatLocalTime(apt.start_time)}
                        </p>
                        {apt.reason && (
                          <p className="text-sm text-neutral-500 mt-2 bg-white/50 p-2 rounded-lg border border-neutral-100">
                            <span className="font-medium">Reason:</span> {apt.reason}
                          </p>
                        )}
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full uppercase tracking-wider ${apt.status === 'cancelled' ? 'bg-neutral-200 text-neutral-700' : 'bg-emerald-100 text-emerald-800'}`}>
                        {apt.status}
                      </span>
                    </div>
                    
                    {apt.status === 'booked' && (
                      <div className="mt-4 pt-4 border-t border-emerald-200/50 flex justify-end">
                        <button 
                          onClick={() => cancelAppointment(apt.id)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          Cancel Appointment
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
      
      <AIChat 
        providers={providers}
        selectedProvider={selectedProvider}
        slots={slots}
        appointments={appointments}
        onBook={bookAppointment}
        onCancel={cancelAppointment}
        currentUser={currentUser}
      />
    </div>
  );
}
