/**
 * Alerts Page - View and Manage Alerts
 * Created by CaptainCode - HelixOps Technologies
 */

import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle, Clock } from 'lucide-react'

interface Alert {
  id: string
  rule: string
  service: string
  severity: 'info' | 'warning' | 'critical'
  status: 'active' | 'acknowledged' | 'resolved'
  message: string
  triggeredAt: string
  value: number
}

const mockAlerts: Alert[] = [
  {
    id: '1',
    rule: 'High CPU Usage',
    service: 'API Service',
    severity: 'critical',
    status: 'active',
    message: 'CPU usage exceeded 85%',
    triggeredAt: '5 minutes ago',
    value: 87.5,
  },
  {
    id: '2',
    rule: 'High Memory Usage',
    service: 'Database',
    severity: 'warning',
    status: 'active',
    message: 'Memory usage at 78%',
    triggeredAt: '12 minutes ago',
    value: 78.0,
  },
  {
    id: '3',
    rule: 'High Disk Usage',
    service: 'API Service',
    severity: 'warning',
    status: 'acknowledged',
    message: 'Disk usage at 82%',
    triggeredAt: '1 hour ago',
    value: 82.0,
  },
]

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts)

  const handleAcknowledge = (alertId: string) => {
    setAlerts(alerts.map(a =>
      a.id === alertId ? { ...a, status: 'acknowledged' } : a
    ))
  }

  const handleResolve = (alertId: string) => {
    setAlerts(alerts.filter(a => a.id !== alertId))
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Alerts</h1>
        <p className="text-slate-400">Monitor and manage system alerts</p>
      </div>

      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center">
            <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
            <p className="text-lg text-white">All systems nominal</p>
            <p className="text-slate-400">No active alerts</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-lg p-6 border transition ${
                alert.severity === 'critical'
                  ? 'bg-red-900 border-red-700 bg-opacity-20'
                  : alert.severity === 'warning'
                  ? 'bg-yellow-900 border-yellow-700 bg-opacity-20'
                  : 'bg-blue-900 border-blue-700 bg-opacity-20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <AlertCircle
                    size={24}
                    className={
                      alert.severity === 'critical'
                        ? 'text-red-400'
                        : alert.severity === 'warning'
                        ? 'text-yellow-400'
                        : 'text-blue-400'
                    }
                  />
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {alert.rule}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        alert.severity === 'critical'
                          ? 'bg-red-900 text-red-200'
                          : alert.severity === 'warning'
                          ? 'bg-yellow-900 text-yellow-200'
                          : 'bg-blue-900 text-blue-200'
                      }`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        alert.status === 'active'
                          ? 'bg-orange-900 text-orange-200'
                          : alert.status === 'acknowledged'
                          ? 'bg-blue-900 text-blue-200'
                          : 'bg-green-900 text-green-200'
                      }`}>
                        {alert.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-300">{alert.message}</p>
                    <p className="text-sm text-slate-400 mt-2">
                      Service: <span className="font-medium">{alert.service}</span> • 
                      Value: <span className="font-medium">{alert.value.toFixed(2)}</span> • 
                      <span className="flex items-center gap-1 inline-flex">
                        <Clock size={14} />
                        {alert.triggeredAt}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {alert.status !== 'acknowledged' && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition"
                    >
                      Acknowledge
                    </button>
                  )}
                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
