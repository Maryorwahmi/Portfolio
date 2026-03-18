import React, { useState } from 'react';
import { 
  MessageCircle, 
  Star, 
  Send, 
  ThumbsUp, 
  ThumbsDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  Phone,
  Mail
} from 'lucide-react';

const Feedback = () => {
  const [feedbackType, setFeedbackType] = useState('general');
  const [rating, setRating] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    subject: '',
    message: '',
    anonymous: false
  });

  const existingFeedback = [
    {
      id: 1,
      type: 'compliment',
      subject: 'Excellent Care from Dr. Abiex',
      message: 'Dr. Abiex provided exceptional care during my visit. Very professional and caring.',
      rating: 5,
      date: '2024-01-10',
      status: 'reviewed',
      response: 'Thank you for your positive feedback! We\'ll share this with Dr. Abiex.'
    },
    {
      id: 2,
      type: 'suggestion',
      subject: 'Improve Waiting Room WiFi',
      message: 'The WiFi in the waiting room is quite slow. Would be great to have better connectivity.',
      rating: 3,
      date: '2024-01-08',
      status: 'in-progress',
      response: 'We\'re working on upgrading our WiFi infrastructure. Thank you for the suggestion!'
    },
    {
      id: 3,
      type: 'complaint',
      subject: 'Long Wait Times',
      message: 'Had to wait over 2 hours for my appointment despite being on time.',
      rating: 2,
      date: '2024-01-05',
      status: 'resolved',
      response: 'We apologize for the delay. We\'ve implemented new scheduling procedures to reduce wait times.'
    }
  ];

  const departments = [
    'Emergency Department',
    'Cardiology',
    'Neurology',
    'Pediatrics',
    'Orthopedics',
    'General Medicine',
    'Radiology',
    'Laboratory',
    'Pharmacy',
    'Administration'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    alert('Thank you for your feedback! We will review it and get back to you soon.');
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      department: '',
      subject: '',
      message: '',
      anonymous: false
    });
    setRating(0);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'compliment': return 'bg-green-100 text-green-800';
      case 'complaint': return 'bg-red-100 text-red-800';
      case 'suggestion': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Feedback & Complaints</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your feedback helps us improve our services. Share your experience, suggestions, or concerns with us.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Feedback Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit Feedback</h2>
              
              {/* Feedback Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Type of Feedback</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { type: 'compliment', label: 'Compliment', icon: <ThumbsUp className="w-5 h-5" />, color: 'text-green-600' },
                    { type: 'complaint', label: 'Complaint', icon: <ThumbsDown className="w-5 h-5" />, color: 'text-red-600' },
                    { type: 'suggestion', label: 'Suggestion', icon: <MessageCircle className="w-5 h-5" />, color: 'text-blue-600' }
                  ].map((item) => (
                    <button
                      key={item.type}
                      onClick={() => setFeedbackType(item.type)}
                      className={`p-4 rounded-lg border text-left transition-colors ${
                        feedbackType === item.type
                          ? 'bg-blue-50 border-blue-500'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`${item.color} mb-2`}>
                        {item.icon}
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Overall Rating</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`p-1 transition-colors ${
                        star <= rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      <Star className="w-8 h-8 fill-current" />
                    </button>
                  ))}
                  <span className="ml-2 text-gray-600">
                    {rating > 0 && `${rating} out of 5 stars`}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name {!formData.anonymous && '*'}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required={!formData.anonymous}
                      disabled={formData.anonymous}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address {!formData.anonymous && '*'}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required={!formData.anonymous}
                      disabled={formData.anonymous}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={formData.anonymous}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Anonymous Option */}
                <div className="flex items-center">
                  <input
                    id="anonymous"
                    name="anonymous"
                    type="checkbox"
                    checked={formData.anonymous}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-700">
                    Submit feedback anonymously
                  </label>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief summary of your feedback"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows="6"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Please provide detailed feedback..."
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Submit Feedback
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Phone</p>
                    <p className="text-gray-600">(555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-gray-600">feedback@abiexhealthcare.com</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Office Hours</p>
                    <p className="text-gray-600">Mon-Fri: 8AM-6PM</p>
                    <p className="text-gray-600">Sat: 9AM-4PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Notice */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-start">
                <AlertTriangle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Medical Emergency?</h3>
                  <p className="text-red-800 text-sm mb-4">
                    If you have a medical emergency, please call 911 or go to the nearest emergency room immediately.
                  </p>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                    Call Emergency
                  </button>
                </div>
              </div>
            </div>

            {/* FAQ Link */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Frequently Asked Questions</h3>
              <p className="text-blue-800 text-sm mb-4">
                Find answers to common questions about our services and policies.
              </p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                View FAQ
              </button>
            </div>
          </div>
        </div>

        {/* Previous Feedback */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Previous Feedback</h2>
          <div className="space-y-6">
            {existingFeedback.map((feedback) => (
              <div key={feedback.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(feedback.type)}`}>
                        {feedback.type}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(feedback.status)}`}>
                        {feedback.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{feedback.subject}</h3>
                  </div>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{feedback.message}</p>
                {feedback.response && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                    <p className="text-blue-800 text-sm">
                      <strong>Hospital Response:</strong> {feedback.response}
                    </p>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  Submitted on {feedback.date}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;