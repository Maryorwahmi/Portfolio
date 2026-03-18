import React, { useState } from 'react';
import { 
  Pill, 
  Calendar, 
  Clock, 
  User, 
  Download,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Plus,
  Eye,
  Phone,
  MapPin
} from 'lucide-react';

const Prescriptions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const prescriptions = [
    {
      id: 1,
      medication: 'Lisinopril 10mg',
      dosage: 'Take 1 tablet once daily',
      quantity: '30 tablets',
      prescribedBy: 'Dr. Sarah Abiex',
      prescribedDate: '2024-01-05',
      expiryDate: '2024-07-05',
      refillsRemaining: 2,
      status: 'active',
      instructions: 'Take with food. Avoid alcohol.',
      condition: 'High Blood Pressure'
    },
    {
      id: 2,
      medication: 'Metformin 500mg',
      dosage: 'Take 1 tablet twice daily with meals',
      quantity: '60 tablets',
      prescribedBy: 'Dr. Michael Chen',
      prescribedDate: '2024-01-08',
      expiryDate: '2024-08-08',
      refillsRemaining: 1,
      status: 'active',
      instructions: 'Take with breakfast and dinner. Monitor blood sugar.',
      condition: 'Type 2 Diabetes'
    },
    {
      id: 3,
      medication: 'Amoxicillin 250mg',
      dosage: 'Take 1 capsule three times daily',
      quantity: '21 capsules',
      prescribedBy: 'Dr. Emily Rodriguez',
      prescribedDate: '2023-12-20',
      expiryDate: '2024-01-20',
      refillsRemaining: 0,
      status: 'expired',
      instructions: 'Complete full course. Take with water.',
      condition: 'Bacterial Infection'
    },
    {
      id: 4,
      medication: 'Simvastatin 20mg',
      dosage: 'Take 1 tablet once daily at bedtime',
      quantity: '30 tablets',
      prescribedBy: 'Dr. James Wilson',
      prescribedDate: '2023-11-15',
      expiryDate: '2024-05-15',
      refillsRemaining: 0,
      status: 'needs-refill',
      instructions: 'Take at bedtime. Avoid grapefruit.',
      condition: 'High Cholesterol'
    }
  ];

  const pharmacies = [
    {
      name: 'Abiex\'s Hospital Pharmacy',
      address: '123 Healthcare Ave, Medical District',
      phone: '(555) 123-4567',
      hours: 'Mon-Fri: 8AM-8PM, Sat: 9AM-6PM',
      distance: '0.2 miles'
    },
    {
      name: 'MediCare Pharmacy',
      address: '456 Wellness Blvd, Health Plaza',
      phone: '(555) 987-6543',
      hours: 'Mon-Sun: 7AM-10PM',
      distance: '1.5 miles'
    }
  ];

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.medication.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.prescribedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || prescription.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'needs-refill': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'expired': return <AlertCircle className="w-4 h-4" />;
      case 'needs-refill': return <RefreshCw className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">My Prescriptions</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Manage your medications, track refills, and find nearby pharmacies
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search medications or doctors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex items-center">
                  <Filter className="w-5 h-5 text-gray-400 mr-2" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Prescriptions</option>
                    <option value="active">Active</option>
                    <option value="needs-refill">Needs Refill</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Prescriptions List */}
            <div className="space-y-6">
              {filteredPrescriptions.map((prescription) => (
                <div key={prescription.id} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-100 text-blue-600 rounded-full p-3">
                        <Pill className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{prescription.medication}</h3>
                        <p className="text-gray-600 mt-1">{prescription.dosage}</p>
                        <p className="text-sm text-blue-600 mt-1">For: {prescription.condition}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusColor(prescription.status)}`}>
                        {getStatusIcon(prescription.status)}
                        <span className="ml-1 capitalize">{prescription.status.replace('-', ' ')}</span>
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-4">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="w-4 h-4 mr-2" />
                        Prescribed by: {prescription.prescribedBy}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        Prescribed: {prescription.prescribedDate}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        Expires: {prescription.expiryDate}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <span className="text-gray-600">Quantity: </span>
                        <span className="font-medium">{prescription.quantity}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Refills remaining: </span>
                        <span className="font-medium">{prescription.refillsRemaining}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Instructions: </span>
                        <span className="font-medium">{prescription.instructions}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Request Refill
                    </button>
                    <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center text-sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </button>
                    <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center text-sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-green-100 text-green-600 rounded-full p-2 mr-3">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <span className="text-gray-700">Active Prescriptions</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {prescriptions.filter(p => p.status === 'active').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-yellow-100 text-yellow-600 rounded-full p-2 mr-3">
                      <RefreshCw className="w-4 h-4" />
                    </div>
                    <span className="text-gray-700">Need Refills</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {prescriptions.filter(p => p.status === 'needs-refill').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-red-100 text-red-600 rounded-full p-2 mr-3">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <span className="text-gray-700">Expired</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {prescriptions.filter(p => p.status === 'expired').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Nearby Pharmacies */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Nearby Pharmacies</h3>
              <div className="space-y-4">
                {pharmacies.map((pharmacy, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{pharmacy.name}</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{pharmacy.address}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        <span>{pharmacy.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{pharmacy.hours}</span>
                      </div>
                      <div className="text-blue-600 font-medium">
                        {pharmacy.distance} away
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Medication Reminders */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Medication Reminders</h3>
              <p className="text-blue-800 text-sm mb-4">
                Set up automatic reminders to never miss your medications.
              </p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                Set Up Reminders
              </button>
            </div>

            {/* Emergency Contact */}
            <div className="bg-red-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-3">Emergency</h3>
              <p className="text-red-800 text-sm mb-4">
                For medication-related emergencies, contact poison control or your healthcare provider immediately.
              </p>
              <div className="space-y-2">
                <button className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                  Call Poison Control
                </button>
                <button className="w-full border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium">
                  Contact Doctor
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prescriptions;