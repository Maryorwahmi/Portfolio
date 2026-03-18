/**
 * Dashboard Page - Main Overview
 * Created by CaptainCode - HelixOps Technologies
 */

import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Activity, AlertTriangle, Server, TrendingUp } from 'lucide-react'

interface MetricData {
  time: string
  cpu: number
  memory: number
  requests: number
}

const mockData: MetricData[] = [
  { time: '00:00', cpu: 45, memory: 62, requests: 1200 },
  { time: '01:00', cpu: 52, memory: 65, requests: 1450 },
  { time: '02:00', cpu: 48, memory: 61, requests: 1350 },
  { time: '03:00', cpu: 61, memory: 72, requests: 1800 },
  { time: '04:00', cpu: 55, memory: 68, requests: 1600 },
  { time: '05:00', cpu: 67, memory: 75, requests: 2100 },
]

export default function Dashboard() {
  const [metrics, setMetrics] = useState<MetricData[]>(mockData)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // In production, fetch from API
    setLoading(false)
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">System Status</h1>
        <p className="text-slate-400">Real-time infrastructure monitoring and observability</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard
          title="Active Services"
          value="12"
          change="+2"
          icon={Server}
          color="blue"
        />
        <KPICard
          title="Avg CPU Usage"
          value="56%"
          change="-3%"
          icon={Activity}
          color="green"
        />
        <KPICard
          title="Memory Usage"
          value="68%"
          change="+5%"
          icon={TrendingUp}
          color="purple"
        />
        <KPICard
          title="Active Alerts"
          value="3"
          change="2 critical"
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU Usage Chart */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">CPU Usage (24h)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="cpu"
                stroke="#3b82f6"
                fill="#3b82f620"
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Request Rate Chart */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Request Rate (24h)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="requests"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981' }}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Memory Usage Chart */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Memory Usage (24h)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="memory"
                stroke="#a855f7"
                fill="#a855f720"
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Service Health */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Service Health</h2>
          <div className="space-y-3">
            <ServiceHealthItem name="API Service" status="healthy" uptime={99.9} />
            <ServiceHealthItem name="Worker Service" status="healthy" uptime={99.8} />
            <ServiceHealthItem name="Database" status="warning" uptime={99.5} />
            <ServiceHealthItem name="Cache Service" status="healthy" uptime={99.95} />
          </div>
        </div>
      </div>

      <div className="text-center text-slate-400 text-sm mt-8">
        <p>Created with ❤️ by CaptainCode for HelixOps Technologies</p>
      </div>
    </div>
  )
}

interface KPICardProps {
  title: string
  value: string
  change: string
  icon: React.ComponentType<{ size: number; className: string }>
  color: 'blue' | 'green' | 'purple' | 'red'
}

function KPICard({ title, value, change, icon: Icon, color }: KPICardProps) {
  const colorMap = {
    blue: 'bg-blue-900 text-blue-400 border-blue-700',
    green: 'bg-green-900 text-green-400 border-green-700',
    purple: 'bg-purple-900 text-purple-400 border-purple-700',
    red: 'bg-red-900 text-red-400 border-red-700',
  }

  return (
    <div className={`rounded-lg p-6 border ${colorMap[color]} bg-slate-800`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm mb-2">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          <p className="text-xs mt-2 text-slate-400">{change}</p>
        </div>
        <Icon size={24} className={colorMap[color].split(' ')[1]} />
      </div>
    </div>
  )
}

interface ServiceHealthItemProps {
  name: string
  status: 'healthy' | 'warning' | 'critical' | 'offline'
  uptime: number
}

function ServiceHealthItem({ name, status, uptime }: ServiceHealthItemProps) {
  const statusColors = {
    healthy: 'bg-green-500',
    warning: 'bg-yellow-500',
    critical: 'bg-red-500',
    offline: 'bg-gray-500',
  }

  return (
    <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${statusColors[status]}`}></div>
        <span className="text-white">{name}</span>
      </div>
      <span className="text-slate-400 text-sm">{uptime}% uptime</span>
    </div>
  )
}
