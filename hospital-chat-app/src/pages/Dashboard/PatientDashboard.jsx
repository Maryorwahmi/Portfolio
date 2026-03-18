import React, { useState } from 'react';
import { 
  Calendar, 
  MessageCircle, 
  FileText, 
  User, 
  Clock, 
  Bell,
  Heart,
  Activity,
  Pill,
  Phone,
  MapPin,
  AlertCircle,
  Plus,
  ChevronRight
} from 'lucide-react';

const PatientDashboard = ({ user }) => {
  const [upcomingAppointments] = useState([
    {
      id: 1,
      doctor: 'Dr. Sarah Abiex',
      specialty: 'Cardiology',
      date: '2024-01-15',
      time: '10:00 AM',
      type: 'Consultation',
      status: 'confirmed'
    },
    {
      id: 2,
      doctor: 'Dr. Michael Chen',
      specialty: 'General Practice',
      date: '2024-01-20',
      time: '2:30 PM',
      type: 'Follow-up',
      status: 'pending'
    }
  ]);

  const [recentMessages] = useState([
    {
      id: 1,
      from: 'Dr. Sarah Abiex',
      message: 'Your test results are ready for review. Please schedule a follow-up...',
      time: '2 hours ago',
      unread: true
    },
    {
      id: 2,
      from: 'Hospital Admin',
      message: 'Reminder: Your appointment is scheduled for tomorrow at 10:00 AM.',
      time: '1 day ago',
      unread: false
    }
  ]);

  const [prescriptions] = useState([
    {
      id: 1,
      medication: 'Lisinopril 10mg',
      dosage: 'Once daily',
      prescribed: '2024-01-10',
      refills: 2,
      status: 'active'
    },
    {
      id: 2,
      medication: 'Metformin 500mg',
      dosage: 'Twice daily with meals',
      prescribed: '2024-01-05',
      refills: 1,
      status: 'active'
    }
  ]);

  const [vitalSigns] = useState({
    bloodPressure: '120/80',
    heartRate: '72 bpm',
    temperature: '98.6°F',
    weight: '165 lbs',
    lastUpdated: '2024-01-10'
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}</h1>
              <p className="text-gray-600 mt-1">Patient ID: #{user.id}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Book Appointment
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
                <MessageCircle className="w-4 h-4 mr-2" />
                New Consultation
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Important Alerts */}
        <div className="mb-6 space-y-3">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
            <div className="flex items-center">
              <Bell className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <p className="text-blue-800 font-medium">Appointment Reminder</p>
                <p className="text-blue-700 text-sm mt-1">Your consultation with Dr. Sarah Abiex is scheduled for tomorrow at 10:00 AM</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
            <div className="flex items-center">
              <Pill className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <p className="text-green-800 font-medium">Prescription Ready</p>
                <p className="text-green-700 text-sm mt-1">Your prescription for Lisinopril is ready for pickup at the pharmacy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</p>
                <p className="text-gray-600">Upcoming Appointments</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{recentMessages.filter(m => m.unread).length}</p>
                <p className="text-gray-600">Unread Messages</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Pill className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{prescriptions.filter(p => p.status === 'active').length}</p>
                <p className="text-gray-600">Active Prescriptions</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-lg">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{vitalSigns.bloodPressure}</p>
                <p className="text-gray-600">Blood Pressure</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Appointments */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
              </div>
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{appointment.doctor}</h3>
                          <p className="text-gray-600 text-sm">{appointment.specialty}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{appointment.date}</p>
                        <p className="text-gray-600 text-sm">{appointment.time}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-gray-600">{appointment.type}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        appointment.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Messages */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Messages</h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
              </div>
              <div className="space-y-4">
                {recentMessages.map((message) => (
                  <div key={message.id} className={`border rounded-lg p-4 hover:shadow-sm transition-shadow ${
                    message.unread ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">{message.from}</h3>
                          {message.unread && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{message.message}</p>
                        <p className="text-gray-500 text-xs mt-2">{message.time}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Vital Signs */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Latest Vital Signs</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Heart className="w-5 h-5 text-red-500" />
                    <span className="text-gray-700">Blood Pressure</span>
                  </div>
                  <span className="font-semibold">{vitalSigns.bloodPressure}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Activity className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700">Heart Rate</span>
                  </div>
                  <span className="font-semibold">{vitalSigns.heartRate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Temperature</span>
                  </div>
                  <span className="font-semibold">{vitalSigns.temperature}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-purple-500" />
                    <span className="text-gray-700">Weight</span>
                  </div>
                  <span className="font-semibold">{vitalSigns.weight}</span>
                </div>
              </div>
              <p className="text-gray-500 text-xs mt-4">Last updated: {vitalSigns.lastUpdated}</p>
            </div>

            {/* Active Prescriptions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Active Prescriptions</h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
              </div>
              <div className="space-y-4">
                {prescriptions.map((prescription) => (
                  <div key={prescription.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{prescription.medication}</h3>
                        <p className="text-gray-600 text-sm">{prescription.dosage}</p>
                        <p className="text-gray-500 text-xs mt-1">Prescribed: {prescription.prescribed}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-600">{prescription.refills} refills left</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center">
                  <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                  <span>Schedule Appointment</span>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center">
                  <MessageCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span>Start Consultation</span>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center">
                  <FileText className="w-5 h-5 text-purple-600 mr-3" />
                  <span>View Medical Records</span>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center">
                  <Pill className="w-5 h-5 text-orange-600 mr-3" />
                  <span>Request Prescription Refill</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;