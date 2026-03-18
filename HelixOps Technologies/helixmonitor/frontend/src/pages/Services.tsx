/**
 * Services Page - Monitor Services
 * Created by CaptainCode - HelixOps Technologies
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Server, Plus } from 'lucide-react'

interface Service {
  id: string
  name: string
  type: string
  status: 'healthy' | 'warning' | 'critical' | 'offline'
  uptime: number
  lastHeartbeat: string
}

const mockServices: Service[] = [
  {
    id: 'api-1',
    name: 'Main API Service',
    type: 'api',
    status: 'healthy',
    uptime: 99.9,
    lastHeartbeat: '2 seconds ago',
  },
  {
    id: 'worker-1',
    name: 'Background Worker',
    type: 'worker',
    status: 'healthy',
    uptime: 99.8,
    lastHeartbeat: '5 seconds ago',
  },
  {
    id: 'db-1',
    name: 'PostgreSQL Database',
    type: 'database',
    status: 'warning',
    uptime: 99.5,
    lastHeartbeat: '1 second ago',
  },
  {
    id: 'cache-1',
    name: 'Redis Cache',
    type: 'cache',
    status: 'healthy',
    uptime: 99.95,
    lastHeartbeat: '3 seconds ago',
  },
]

export default function Services() {
  const [services, setServices] = useState<Service[]>(mockServices)

  useEffect(() => {
    // In production, fetch from API
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Services</h1>
          <p className="text-slate-400">Manage and monitor all registered services</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
          <Plus size={20} />
          Register Service
        </button>
      </div>

      <div className="grid gap-6">
        {services.map((service) => (
          <Link
            key={service.id}
            to={`/services/${service.id}`}
            className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-600 transition cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-700 rounded-lg">
                  <Server size={24} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{service.name}</h3>
                  <p className="text-slate-400 text-sm">
                    Type: {service.type} • Last seen: {service.lastHeartbeat}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  service.status === 'healthy'
                    ? 'bg-green-900 text-green-200'
                    : service.status === 'warning'
                    ? 'bg-yellow-900 text-yellow-200'
                    : 'bg-red-900 text-red-200'
                }`}>
                  {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                </div>
                <p className="text-slate-400 text-sm mt-2">{service.uptime}% uptime</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
