import React, { useState } from 'react';
import { 
  Calendar, 
  MessageCircle, 
  FileText, 
  User, 
  Clock, 
  Bell,
  Users,
  Activity,
  Stethoscope,
  Phone,
  Video,
  Plus,
  ChevronRight,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const DoctorDashboard = ({ user }) => {
  const [todayAppointments] = useState([
    {
      id: 1,
      patient: 'John Smith',
      time: '9:00 AM',
      type: 'Consultation',
      status: 'upcoming',
      urgent: false
    },
    {
      id: 2,
      patient: 'Mary Abiex',
      time: '10:30 AM',
      type: 'Follow-up',
      status: 'in-progress',
      urgent: false
    },
    {
      id: 3,
      patient: 'Robert Davis',
      time: '2:00 PM',
      type: 'Emergency',
      status: 'upcoming',
      urgent: true
    }
  ]);

  const [pendingConsultations] = useState([
    {
      id: 1,
      patient: 'Alice Brown',
      message: 'Experiencing chest pain for the past 2 hours...',
      time: '15 minutes ago',
      priority: 'high'
    },
    {
      id: 2,
      patient: 'David Wilson',
      message: 'Question about my prescription dosage...',
      time: '1 hour ago',
      priority: 'medium'
    }
  ]);

  const [recentActivity] = useState([
    {
      id: 1,
      type: 'prescription',
      description: 'Prescribed Amoxicillin to Sarah Connor',
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'consultation',
      description: 'Completed video consultation with Mike Ross',
      time: '4 hours ago'
    },
    {
      id: 3,
      type: 'appointment',
      description: 'Scheduled follow-up appointment for Emma Watson',
      time: '1 day ago'
    }
  ]);

  const [patientStats] = useState({
    totalPatients: 127,
    todayAppointments: 8,
    pendingConsultations: 5,
    completedToday: 3
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-300 bg-red-50';
      case 'medium': return 'border-yellow-300 bg-yellow-50';
      case 'low': return 'border-green-300 bg-green-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Good morning, Dr. {user.name}</h1>
              <p className="text-gray-600 mt-1">{user.specialization} • {new Date().toLocaleDateString()}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
                <Video className="w-4 h-4 mr-2" />
                Start Video Call
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                New Prescription
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{patientStats.totalPatients}</p>
                <p className="text-gray-600">Total Patients</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{patientStats.todayAppointments}</p>
                <p className="text-gray-600">Today's Appointments</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-lg">
                <MessageCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{patientStats.pendingConsultations}</p>
                <p className="text-gray-600">Pending Consultations</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{patientStats.completedToday}</p>
                <p className="text-gray-600">Completed Today</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Appointments */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Today's Appointments</h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View Schedule</button>
              </div>
              <div className="space-y-4">
                {todayAppointments.map((appointment) => (
                  <div key={appointment.id} className={`border rounded-lg p-4 hover:shadow-sm transition-shadow ${
                    appointment.urgent ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900">{appointment.patient}</h3>
                            {appointment.urgent && <AlertTriangle className="w-4 h-4 text-red-500" />}
                          </div>
                          <p className="text-gray-600 text-sm">{appointment.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{appointment.time}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        View Details
                      </button>
                      <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                        Start Consultation
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Consultations */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Pending Consultations</h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
              </div>
              <div className="space-y-4">
                {pendingConsultations.map((consultation) => (
                  <div key={consultation.id} className={`border rounded-lg p-4 hover:shadow-sm transition-shadow ${getPriorityColor(consultation.priority)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">{consultation.patient}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            consultation.priority === 'high' ? 'bg-red-100 text-red-800' :
                            consultation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {consultation.priority} priority
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{consultation.message}</p>
                        <p className="text-gray-500 text-xs mt-2">{consultation.time}</p>
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
            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      {activity.type === 'prescription' && <FileText className="w-4 h-4 text-blue-600" />}
                      {activity.type === 'consultation' && <MessageCircle className="w-4 h-4 text-blue-600" />}
                      {activity.type === 'appointment' && <Calendar className="w-4 h-4 text-blue-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
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
                  <Stethoscope className="w-5 h-5 text-blue-600 mr-3" />
                  <span>Start New Consultation</span>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center">
                  <FileText className="w-5 h-5 text-green-600 mr-3" />
                  <span>Write Prescription</span>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center">
                  <Calendar className="w-5 h-5 text-purple-600 mr-3" />
                  <span>Schedule Appointment</span>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center">
                  <User className="w-5 h-5 text-orange-600 mr-3" />
                  <span>View Patient Records</span>
                </button>
              </div>
            </div>

            {/* Schedule Overview */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Schedule Overview</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">9:00 AM - 12:00 PM</span>
                  <span className="text-green-600 font-medium">Morning Clinic</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">12:00 PM - 1:00 PM</span>
                  <span className="text-gray-600">Lunch Break</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">1:00 PM - 5:00 PM</span>
                  <span className="text-blue-600 font-medium">Afternoon Clinic</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">5:00 PM - 6:00 PM</span>
                  <span className="text-purple-600 font-medium">Emergency On-Call</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;