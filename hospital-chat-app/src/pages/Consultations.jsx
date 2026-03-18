import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Video, 
  MessageCircle, 
  Phone, 
  Clock, 
  User, 
  Calendar,
  Search,
  Filter,
  Plus,
  ChevronRight,
  Star,
  Shield
} from 'lucide-react';

const Consultations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  const availableDoctors = [
    {
      id: 1,
      name: 'Dr. Sarah Abiex',
      specialty: 'Cardiology',
      rating: 4.9,
      experience: '15 years',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&q=80',
      availability: 'Available now',
      status: 'online',
      consultationFee: '$75',
      languages: ['English', 'Spanish']
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialty: 'Neurology',
      rating: 4.8,
      experience: '12 years',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=150&q=80',
      availability: 'Next available: 2:00 PM',
      status: 'busy',
      consultationFee: '$85',
      languages: ['English', 'Mandarin']
    },
    {
      id: 3,
      name: 'Dr. Emily Rodriguez',
      specialty: 'Pediatrics',
      rating: 4.9,
      experience: '10 years',
      image: 'https://images.unsplash.com/photo-1594824716351-1da9a34dad6c?auto=format&fit=crop&w=150&q=80',
      availability: 'Available now',
      status: 'online',
      consultationFee: '$65',
      languages: ['English', 'Spanish', 'French']
    },
    {
      id: 4,
      name: 'Dr. James Wilson',
      specialty: 'Orthopedics',
      rating: 4.7,
      experience: '18 years',
      image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=150&q=80',
      availability: 'Next available: Tomorrow 9:00 AM',
      status: 'offline',
      consultationFee: '$90',
      languages: ['English']
    }
  ];

  const consultationTypes = [
    {
      type: 'video',
      title: 'Video Consultation',
      description: 'Face-to-face consultation via secure video call',
      icon: <Video className="w-6 h-6" />,
      duration: '30-45 minutes',
      color: 'bg-blue-500'
    },
    {
      type: 'chat',
      title: 'Text Consultation',
      description: 'Secure messaging with healthcare professionals',
      icon: <MessageCircle className="w-6 h-6" />,
      duration: 'Ongoing',
      color: 'bg-green-500'
    },
    {
      type: 'phone',
      title: 'Phone Consultation',
      description: 'Audio consultation via phone call',
      icon: <Phone className="w-6 h-6" />,
      duration: '20-30 minutes',
      color: 'bg-purple-500'
    }
  ];

  const specialties = [
    'all', 'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 
    'Dermatology', 'Psychiatry', 'General Practice'
  ];

  const filteredDoctors = availableDoctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || doctor.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Medical Consultations</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect with qualified healthcare professionals for secure, convenient online consultations
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Consultation Types */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Consultation Type</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {consultationTypes.map((consultation, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className={`${consultation.color} text-white rounded-full w-12 h-12 flex items-center justify-center mb-4`}>
                  {consultation.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{consultation.title}</h3>
                <p className="text-gray-600 mb-3">{consultation.description}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {consultation.duration}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search doctors or specialties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Filter className="w-5 h-5 text-gray-400 mr-2" />
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {specialties.map(specialty => (
                    <option key={specialty} value={specialty}>
                      {specialty === 'all' ? 'All Specialties' : specialty}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Available Doctors */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Healthcare Professionals</h2>
          <div className="grid gap-6">
            {filteredDoctors.map((doctor) => (
              <div key={doctor.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 ${getStatusColor(doctor.status)} rounded-full border-2 border-white`}></div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{doctor.name}</h3>
                        <p className="text-blue-600 font-medium">{doctor.specialty}</p>
                        <div className="flex items-center mt-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">{doctor.rating} • {doctor.experience} experience</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{doctor.consultationFee}</p>
                        <p className="text-sm text-gray-600">per consultation</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          {doctor.availability}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <span>Languages: {doctor.languages.join(', ')}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                          <Video className="w-4 h-4 mr-2" />
                          Book Video Call
                        </button>
                        <button className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Start Chat
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Consultation */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="bg-red-500 text-white rounded-full p-3">
              <Shield className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-red-900 mb-2">Emergency Consultation</h3>
              <p className="text-red-700 mb-4">
                Need immediate medical attention? Connect with our emergency healthcare team available 24/7.
              </p>
              <button className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold">
                Start Emergency Consultation
              </button>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-12 bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How Online Consultation Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Doctor</h3>
              <p className="text-gray-600">Select a healthcare professional based on specialty and availability</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 text-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Book Session</h3>
              <p className="text-gray-600">Schedule your consultation and complete secure payment</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 text-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Consultation</h3>
              <p className="text-gray-600">Connect via video, chat, or phone for your medical consultation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Consultations;