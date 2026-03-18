/**
 * Service Detail Page
 * Created by CaptainCode - HelixOps Technologies
 */

import { useParams } from 'react-router-dom'
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

const mockMetrics = [
  { time: '00:00', cpu: 45, memory: 62, latency: 120 },
  { time: '02:00', cpu: 52, memory: 65, latency: 145 },
  { time: '04:00', cpu: 48, memory: 61, latency: 135 },
  { time: '06:00', cpu: 61, memory: 72, latency: 180 },
  { time: '08:00', cpu: 55, memory: 68, latency: 160 },
  { time: '10:00', cpu: 67, memory: 75, latency: 210 },
]

export default function ServiceDetail() {
  const { id } = useParams()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Service: {id}
        </h1>
        <p className="text-slate-400">Detailed metrics and performance data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Status" value="Healthy" color="green" />
        <MetricCard title="Uptime" value="99.9%" color="blue" />
        <MetricCard title="Avg Latency" value="156ms" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">CPU Usage</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={mockMetrics}>
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
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Memory Usage</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={mockMetrics}>
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
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">API Latency</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={mockMetrics}>
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
                dataKey="latency"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: '#f59e0b' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Events</h2>
          <div className="space-y-3">
            <EventItem type="restart" time="2 hours ago" />
            <EventItem type="deployment" time="5 hours ago" />
            <EventItem type="alert" time="1 day ago" />
          </div>
        </div>
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  color: 'green' | 'blue' | 'purple'
}

function MetricCard({ title, value, color }: MetricCardProps) {
  const colorMap = {
    green: 'text-green-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <p className="text-slate-400 mb-2">{title}</p>
      <p className={`text-3xl font-bold ${colorMap[color]}`}>{value}</p>
    </div>
  )
}

interface EventItemProps {
  type: string
  time: string
}

function EventItem({ type, time }: EventItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-700 rounded">
      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
      <span className="text-white">{type}</span>
      <span className="text-slate-400 text-sm ml-auto">{time}</span>
    </div>
  )
}
