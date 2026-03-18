import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Phone,
  Search,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react';

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('consultation');

  const doctors = [
    {
      id: 1,
      name: 'Dr. Sarah Abiex',
      specialty: 'Cardiology',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&q=80',
      location: 'Building A, Floor 3',
      availability: ['09:00', '10:30', '14:00', '15:30']
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialty: 'Neurology',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=150&q=80',
      location: 'Building B, Floor 2',
      availability: ['08:30', '11:00', '13:30', '16:00']
    },
    {
      id: 3,
      name: 'Dr. Emily Rodriguez',
      specialty: 'Pediatrics',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1594824716351-1da9a34dad6c?auto=format&fit=crop&w=150&q=80',
      location: 'Building C, Floor 1',
      availability: ['09:30', '11:30', '14:30', '16:30']
    }
  ];

  const upcomingAppointments = [
    {
      id: 1,
      doctor: 'Dr. Sarah Abiex',
      specialty: 'Cardiology',
      date: '2024-01-15',
      time: '10:00 AM',
      type: 'Follow-up',
      status: 'confirmed',
      location: 'Building A, Floor 3, Room 305'
    },
    {
      id: 2,
      doctor: 'Dr. Emily Rodriguez',
      specialty: 'Pediatrics',
      date: '2024-01-18',
      time: '2:30 PM',
      type: 'Consultation',
      status: 'pending',
      location: 'Building C, Floor 1, Room 110'
    },
    {
      id: 3,
      doctor: 'Dr. Michael Chen',
      specialty: 'Neurology',
      date: '2024-01-22',
      time: '11:00 AM',
      type: 'Check-up',
      status: 'confirmed',
      location: 'Building B, Floor 2, Room 220'
    }
  ];

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleBookAppointment = () => {
    if (selectedDoctor && selectedTime) {
      alert(`Appointment booked with ${doctors.find(d => d.id == selectedDoctor)?.name} at ${selectedTime} on ${formatDate(selectedDate)}`);
    } else {
      alert('Please select a doctor and time slot');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Book an Appointment</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Schedule your visit with our healthcare professionals at your convenience
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Schedule New Appointment</h2>
              
              {/* Appointment Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Appointment Type</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['consultation', 'follow-up', 'check-up', 'emergency'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setAppointmentType(type)}
                      className={`p-3 rounded-lg border text-sm font-medium capitalize transition-colors ${
                        appointmentType === type
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Doctor Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Doctor</label>
                <div className="space-y-3">
                  {doctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      onClick={() => setSelectedDoctor(doctor.id)}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedDoctor == doctor.id
                          ? 'bg-blue-50 border-blue-500'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={doctor.image}
                          alt={doctor.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                          <p className="text-blue-600 text-sm">{doctor.specialty}</p>
                          <div className="flex items-center mt-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">{doctor.rating}</span>
                            <MapPin className="w-4 h-4 text-gray-400 ml-3" />
                            <span className="text-sm text-gray-600 ml-1">{doctor.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Date</label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <button className="p-2 hover:bg-gray-200 rounded-lg">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h3 className="text-lg font-semibold">{formatDate(selectedDate)}</h3>
                    <button className="p-2 hover:bg-gray-200 rounded-lg">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {/* Calendar would go here - simplified for this example */}
                    <div className="text-center text-sm text-gray-600 py-2">Sun</div>
                    <div className="text-center text-sm text-gray-600 py-2">Mon</div>
                    <div className="text-center text-sm text-gray-600 py-2">Tue</div>
                    <div className="text-center text-sm text-gray-600 py-2">Wed</div>
                    <div className="text-center text-sm text-gray-600 py-2">Thu</div>
                    <div className="text-center text-sm text-gray-600 py-2">Fri</div>
                    <div className="text-center text-sm text-gray-600 py-2">Sat</div>
                  </div>
                </div>
              </div>

              {/* Time Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Available Time Slots</label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {timeSlots.map((time) => {
                    const isAvailable = selectedDoctor ? 
                      doctors.find(d => d.id == selectedDoctor)?.availability.includes(time) : true;
                    
                    return (
                      <button
                        key={time}
                        onClick={() => isAvailable && setSelectedTime(time)}
                        disabled={!isAvailable}
                        className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                          selectedTime === time
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : isAvailable
                            ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            : 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-100'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Book Button */}
              <button
                onClick={handleBookAppointment}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book Appointment
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Appointments */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h3>
                <Plus className="w-5 h-5 text-blue-600 cursor-pointer" />
              </div>
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{appointment.doctor}</h4>
                        <p className="text-sm text-blue-600">{appointment.specialty}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {appointment.date}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {appointment.time}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {appointment.location}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center">
                  <Phone className="w-5 h-5 text-green-600 mr-3" />
                  <span>Call Hospital</span>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center">
                  <MapPin className="w-5 h-5 text-blue-600 mr-3" />
                  <span>Get Directions</span>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center">
                  <AlertCircle className="w-5 h-5 text-orange-600 mr-3" />
                  <span>Emergency</span>
                </button>
              </div>
            </div>

            {/* Hospital Info */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Hospital Hours</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span>8:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span>9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span>10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Emergency</span>
                  <span>24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;