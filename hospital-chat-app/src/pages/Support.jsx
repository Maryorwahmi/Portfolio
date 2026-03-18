import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Phone, 
  Mail, 
  Clock, 
  User, 
  Bot,
  Paperclip,
  Smile,
  MoreVertical,
  Wifi,
  WifiOff
} from 'lucide-react';

const Support = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! Welcome to Abiex's Health Care support. I'm Sarah, your AI assistant. How can I help you today?",
      sender: 'support',
      senderName: 'Sarah (AI Assistant)',
      timestamp: new Date(Date.now() - 300000),
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=50&q=80',
      status: 'delivered',
      isBot: true
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [supportAgent] = useState({
    name: 'Sarah Abiex',
    role: 'Support Specialist',
    status: 'online',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=50&q=80'
  });

  const messagesEndRef = useRef(null);

  const quickReplies = [
    'I need help with my appointment',
    'Questions about my prescription',
    'Billing inquiry',
    'Technical support',
    'Emergency assistance'
  ];

  const faqs = [
    {
      question: "How do I book an appointment?",
      answer: "You can book an appointment through our online portal, by calling us, or visiting in person."
    },
    {
      question: "What are your visiting hours?",
      answer: "Our visiting hours are Monday-Friday 8AM-8PM, Saturday 9AM-6PM, and Sunday 10AM-4PM."
    },
    {
      question: "How do I access my medical records?",
      answer: "You can access your medical records through the patient portal or by requesting them at the front desk."
    },
    {
      question: "Do you accept insurance?",
      answer: "We accept most major insurance plans. Please contact us to verify coverage for your specific plan."
    }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (text = message) => {
    if (!text.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      text: text.trim(),
      sender: 'user',
      senderName: 'You',
      timestamp: new Date(),
      avatar: null,
      status: 'sent'
    };

    // Simulate message delivery status updates
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
      ));
    }, 500);
    
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
      ));
    }, 1500);

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // Simulate typing indicator
    setIsTyping(true);
    
    // Simulate intelligent response after 2-3 seconds
    setTimeout(() => {
      setIsTyping(false);
      
      // Intelligent response based on message content
      let botResponse = "Thank you for your message. How can I assist you today?";
      const lowerText = text.toLowerCase();
      
      if (lowerText.includes('appointment') || lowerText.includes('book') || lowerText.includes('schedule')) {
        botResponse = "I can help you with appointments! You can book an appointment through our online portal or I can connect you with our scheduling team. What type of appointment would you like to schedule?";
      } else if (lowerText.includes('prescription') || lowerText.includes('medication') || lowerText.includes('refill')) {
        botResponse = "For prescription-related questions, I can help you access your prescriptions online or connect you with our pharmacy team. Do you need to refill a prescription or have questions about your medications?";
      } else if (lowerText.includes('emergency') || lowerText.includes('urgent') || lowerText.includes('pain')) {
        botResponse = "For medical emergencies, please call 911 immediately. If this is urgent but not life-threatening, I can connect you with our nurse triage line. Is this an emergency situation?";
      } else if (lowerText.includes('insurance') || lowerText.includes('billing') || lowerText.includes('payment')) {
        botResponse = "I can help with billing and insurance questions! Our billing department can assist with payment plans, insurance coverage, and account questions. Would you like me to connect you with them?";
      } else if (lowerText.includes('test results') || lowerText.includes('lab') || lowerText.includes('results')) {
        botResponse = "Test results are typically available through your patient portal within 24-48 hours. If you haven't received them or need help accessing the portal, I can assist you with that.";
      } else if (lowerText.includes('doctor') || lowerText.includes('physician') || lowerText.includes('specialist')) {
        botResponse = "I can help you find the right doctor or specialist for your needs. What type of medical care are you looking for? We have specialists in cardiology, orthopedics, pediatrics, and many other areas.";
      }
      
      const supportResponse = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'support',
        senderName: 'Sarah (AI Assistant)',
        timestamp: new Date(),
        avatar: supportAgent.avatar,
        status: 'delivered',
        isBot: true
      };

      setMessages(prev => [...prev, supportResponse]);
    }, 2000 + Math.random() * 1000);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleQuickReply = (reply) => {
    handleSendMessage(reply);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Get Support</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're here to help! Chat with our support team or find answers to common questions.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        <div className="grid lg:grid-cols-3 gap-4 lg:gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden h-[calc(100vh-200px)] lg:h-auto flex flex-col">
              {/* Chat Header */}
              <div className="bg-blue-600 text-white p-3 lg:p-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={supportAgent.avatar}
                      alt={supportAgent.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">{supportAgent.name}</h3>
                      <div className="flex items-center text-sm opacity-90">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          supportAgent.status === 'online' ? 'bg-green-400' : 'bg-gray-400'
                        }`}></div>
                        {supportAgent.status === 'online' ? 'Online' : 'Offline'} • {supportAgent.role}
                      </div>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-blue-700 rounded-lg">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-4 min-h-0">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
                      msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      {msg.avatar && (
                        <img
                          src={msg.avatar}
                          alt={msg.senderName}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                      )}
                      {!msg.avatar && msg.sender === 'user' && (
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <div className={`rounded-2xl px-4 py-2 ${
                          msg.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm">{msg.text}</p>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-1 px-2">
                          <span>{formatTime(msg.timestamp)}</span>
                          {msg.sender === 'user' && msg.status && (
                            <span className={`ml-2 ${
                              msg.status === 'sent' ? 'text-gray-400' :
                              msg.status === 'delivered' ? 'text-blue-500' :
                              msg.status === 'read' ? 'text-green-500' : ''
                            }`}>
                              {msg.status === 'sent' && '✓'}
                              {msg.status === 'delivered' && '✓✓'}
                              {msg.status === 'read' && '✓✓'}
                            </span>
                          )}
                          {msg.isBot && (
                            <span className="ml-2 text-purple-500 font-medium">AI</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2">
                      <img
                        src={supportAgent.avatar}
                        alt={supportAgent.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="bg-gray-100 rounded-2xl px-4 py-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              {messages.length <= 1 && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-gray-600 mb-3">Quick replies:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickReplies.map((reply, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickReply(reply)}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600">
                      <Smile className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleSendMessage()}
                    className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 order-1 lg:order-2">
            {/* Contact Options */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Other Ways to Reach Us</h3>
              <div className="space-y-4">
                <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <Phone className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Call Us</p>
                    <p className="text-sm text-gray-600">(555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <Mail className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Email Support</p>
                    <p className="text-sm text-gray-600">support@abiexhealthcare.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Hours */}
            <div className="bg-blue-50 rounded-xl p-6">
              <div className="flex items-center mb-3">
                <Clock className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-blue-900">Support Hours</h3>
              </div>
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
                <div className="flex justify-between font-semibold pt-2 border-t border-blue-200">
                  <span>Emergency Line</span>
                  <span>24/7</span>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <details key={index} className="group">
                    <summary className="flex justify-between items-center cursor-pointer text-sm font-medium text-gray-900 p-2 bg-gray-50 rounded-lg hover:bg-gray-100">
                      {faq.question}
                      <svg
                        className="w-4 h-4 text-gray-600 group-open:rotate-180 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <p className="mt-2 text-sm text-gray-600 px-2">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>

            {/* Emergency Notice */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Medical Emergency?</h3>
              <p className="text-red-800 text-sm mb-4">
                If you have a medical emergency, please call 911 immediately or go to the nearest emergency room.
              </p>
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium w-full">
                Call Emergency Services
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;