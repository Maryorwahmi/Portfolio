import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Calendar, MessageCircle, Users, Phone, Shield, Clock, Award, AlertTriangle, Bot, Pill, Stethoscope, PhoneCall } from 'lucide-react';

const HomePage = () => {
  const features = [
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Patient Consultations",
      description: "Secure video calls and messaging with healthcare professionals",
      color: "bg-blue-500"
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Appointment Booking",  
      description: "Schedule appointments with doctors and specialists easily",
      color: "bg-green-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Staff Communication",
      description: "Internal messaging system for healthcare teams",
      color: "bg-purple-500"
    },
    {
      icon: <Phone className="w-8 h-8" />,
      title: "24/7 Support",
      description: "Get help anytime with our dedicated support team",
      color: "bg-orange-500"
    }
  ];

  const services = [
    {
      title: "Emergency Care",
      description: "Immediate medical attention for urgent health issues",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=400&q=80"
    },
    {
      title: "Telemedicine",
      description: "Remote consultations with our healthcare professionals",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?auto=format&fit=crop&w=400&q=80"
    },
    {
      title: "Prescription Management",
      description: "Digital prescriptions and medication tracking",
      image: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=400&q=80"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-6">
                <div className="bg-blue-600 text-white rounded-full p-3 mr-4">
                  <Heart className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
                    Johnson's Health Care
                  </h1>
                  <p className="text-xl text-blue-600 font-medium">Caring for Your Health, Every Step of the Way</p>
                </div>
              </div>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Experience modern healthcare with our comprehensive digital platform. 
                Connect with healthcare professionals, book appointments, and manage your health journey seamlessly.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/login" 
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center shadow-lg"
                >
                  Get Started Today
                </Link>
                <Link 
                  to="/chat-with-us" 
                  className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-center"
                >
                  Chat with Support
                </Link>
                <a 
                  href="tel:911" 
                  className="bg-red-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors text-center shadow-lg flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-5 h-5" />
                  Emergency: 911
                </a>
              </div>
              
              {/* Quick Links */}
              <div className="mt-12 p-6 bg-white rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Access</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link to="/consultations" className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    <Stethoscope className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Consultations</span>
                  </Link>
                  <Link to="/appointments" className="flex items-center gap-2 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Appointments</span>
                  </Link>
                  <Link to="/prescriptions" className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                    <Pill className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">Pharmacy</span>
                  </Link>
                  <Link to="/support" className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                    <Bot className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-medium text-orange-700">Chatbot</span>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=600&q=80" 
                alt="Healthcare professionals" 
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center">
                  <div className="bg-green-100 text-green-600 rounded-full p-2 mr-3">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">HIPAA Compliant</p>
                    <p className="text-sm text-gray-600">Your data is secure</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Comprehensive Healthcare Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform offers everything you need to manage your healthcare journey efficiently and securely.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className={`${feature.color} text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Our Medical Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Access quality healthcare services designed to meet your needs.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <img 
                  src={service.image} 
                  alt={service.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="bg-blue-100 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">24/7</h3>
              <p className="text-gray-600">Available Support</p>
            </div>
            <div className="p-6">
              <div className="bg-green-100 text-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">500+</h3>
              <p className="text-gray-600">Healthcare Professionals</p>
            </div>
            <div className="p-6">
              <div className="bg-purple-100 text-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">100%</h3>
              <p className="text-gray-600">Secure & Private</p>
            </div>
            <div className="p-6">
              <div className="bg-orange-100 text-orange-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">15+</h3>
              <p className="text-gray-600">Years of Excellence</p>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Contact Section */}
      <section className="py-16 bg-red-50 border-t-4 border-red-500">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600 mr-3" />
              <h2 className="text-2xl md:text-3xl font-bold text-red-800">Emergency Services</h2>
            </div>
            <p className="text-lg text-red-700 mb-6">For medical emergencies, call immediately</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:911" 
                className="bg-red-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <PhoneCall className="w-5 h-5" />
                Emergency: 911
              </a>
              <a 
                href="tel:+1-555-0199" 
                className="bg-white text-red-600 border-2 border-red-600 px-8 py-4 rounded-lg font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Hospital Hotline: (555) 0199
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Healthcare Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of patients who trust Johnson's Health Care for their medical needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/login" 
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Create Account
            </Link>
            <Link 
              to="/appointments" 
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Book Appointment
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;