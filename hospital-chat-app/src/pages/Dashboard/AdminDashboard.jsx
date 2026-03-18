import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  MessageCircle, 
  FileText, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Activity,
  Settings,
  UserPlus,
  Building,
  Bed,
  Shield
} from 'lucide-react';

const AdminDashboard = () => {
  const [systemStats] = useState({
    totalUsers: 1247,
    activeStaff: 89,
    todayAppointments: 156,
    systemUptime: '99.9%',
    revenue: '$45,670',
    beds: { occupied: 78, total: 120 }
  });

  const [recentAlerts] = useState([
    {
      id: 1,
      type: 'security',
      message: 'Failed login attempts detected from IP 192.168.1.100',
      time: '5 minutes ago',
      severity: 'high'
    },
    {
      id: 2,
      type: 'system',
      message: 'Database backup completed successfully',
      time: '2 hours ago',
      severity: 'low'
    },
    {
      id: 3,
      type: 'capacity',
      message: 'ICU capacity at 85% - consider resource allocation',
      time: '4 hours ago',
      severity: 'medium'
    }
  ]);

  const [pendingApprovals] = useState([
    {
      id: 1,
      type: 'staff',
      name: 'Dr. Emily Watson',
      role: 'Cardiologist',
      submitted: '2 days ago'
    },
    {
      id: 2,
      type: 'equipment',
      name: 'MRI Machine Maintenance',
      department: 'Radiology',
      submitted: '1 day ago'
    },
    {
      id: 3,
      type: 'budget',
      name: 'Q1 Equipment Purchase',
      amount: '$25,000',
      submitted: '3 hours ago'
    }
  ]);

  const [systemPerformance] = useState([
    { metric: 'Server Response Time', value: '45ms', status: 'good' },
    { metric: 'Database Performance', value: '0.2s', status: 'good' },
    { metric: 'Storage Usage', value: '67%', status: 'warning' },
    { metric: 'Memory Usage', value: '45%', status: 'good' }
  ]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'border-red-300 bg-red-50 text-red-800';
      case 'medium': return 'border-yellow-300 bg-yellow-50 text-yellow-800';
      case 'low': return 'border-green-300 bg-green-50 text-green-800';
      default: return 'border-gray-300 bg-gray-50 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hospital Administration</h1>
              <p className="text-gray-600 mt-1">System Overview • {new Date().toLocaleDateString()}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Staff Member
              </button>
              <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                System Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{systemStats.totalUsers}</p>
                <p className="text-gray-600">Total Users</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{systemStats.activeStaff}</p>
                <p className="text-gray-600">Active Staff</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{systemStats.todayAppointments}</p>
                <p className="text-gray-600">Today's Appointments</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{systemStats.revenue}</p>
                <p className="text-gray-600">Daily Revenue</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* System Alerts */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">System Alerts</h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
              </div>
              <div className="space-y-4">
                {recentAlerts.map((alert) => (
                  <div key={alert.id} className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)}`}>
                    <div className="flex items-start space-x-3">
                      <div className="pt-1">
                        {alert.type === 'security' && <Shield className="w-5 h-5" />}
                        {alert.type === 'system' && <Settings className="w-5 h-5" />}
                        {alert.type === 'capacity' && <TrendingUp className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{alert.message}</p>
                        <p className="text-sm opacity-75 mt-1">{alert.time}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                        alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Approvals */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Pending Approvals</h2>
                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm font-medium">
                  {pendingApprovals.length} pending
                </span>
              </div>
              <div className="space-y-4">
                {pendingApprovals.map((approval) => (
                  <div key={approval.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          {approval.type === 'staff' && <Users className="w-5 h-5 text-blue-600" />}
                          {approval.type === 'equipment' && <Settings className="w-5 h-5 text-blue-600" />}
                          {approval.type === 'budget' && <DollarSign className="w-5 h-5 text-blue-600" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{approval.name}</h3>
                          <p className="text-gray-600 text-sm">
                            {approval.role || approval.department || approval.amount}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-500 text-sm">{approval.submitted}</p>
                        <div className="flex space-x-2 mt-2">
                          <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                            Approve
                          </button>
                          <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Performance */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">System Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {systemPerformance.map((metric, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-sm">{metric.metric}</span>
                      <span className={`font-semibold ${getStatusColor(metric.status)}`}>
                        {metric.value}
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            metric.status === 'good' ? 'bg-green-500' :
                            metric.status === 'warning' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ 
                            width: metric.metric === 'Storage Usage' ? '67%' : 
                                   metric.metric === 'Memory Usage' ? '45%' : '90%' 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Hospital Capacity */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Hospital Capacity</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bed className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">Total Beds</span>
                  </div>
                  <span className="font-semibold">{systemStats.beds.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bed className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">Occupied</span>
                  </div>
                  <span className="font-semibold text-green-600">{systemStats.beds.occupied}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bed className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">Available</span>
                  </div>
                  <span className="font-semibold text-gray-600">
                    {systemStats.beds.total - systemStats.beds.occupied}
                  </span>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Occupancy Rate</span>
                    <span>{Math.round((systemStats.beds.occupied / systemStats.beds.total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(systemStats.beds.occupied / systemStats.beds.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center">
                  <UserPlus className="w-5 h-5 text-blue-600 mr-3" />
                  <span>Add New Staff</span>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center">
                  <Building className="w-5 h-5 text-green-600 mr-3" />
                  <span>Manage Departments</span>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center">
                  <FileText className="w-5 h-5 text-purple-600 mr-3" />
                  <span>Generate Reports</span>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center">
                  <Settings className="w-5 h-5 text-orange-600 mr-3" />
                  <span>System Configuration</span>
                </button>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">System Status</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">System Uptime</span>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="font-semibold text-green-600">{systemStats.systemUptime}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Database Status</span>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="font-semibold text-green-600">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Backup Status</span>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="font-semibold text-blue-600">2 hours ago</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Security Status</span>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span className="font-semibold text-yellow-600">Monitoring</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;