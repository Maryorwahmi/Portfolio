/**
 * Sidebar Component - Navigation Menu
 * Created by CaptainCode - HelixOps Technologies
 */

import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Server, 
  AlertCircle,
  Zap
} from 'lucide-react'

const menuItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/services', label: 'Services', icon: Server },
  { path: '/alerts', label: 'Alerts', icon: AlertCircle },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="w-64 bg-slate-800 border-r border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-blue-600 rounded-lg">
          <Zap size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">HelixMonitor</h1>
          <p className="text-xs text-slate-400">Observability Platform</p>
        </div>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-8 p-4 bg-slate-700 rounded-lg">
        <p className="text-xs text-slate-400 mb-2">System Status</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-green-400">All Systems Operational</span>
        </div>
      </div>
    </aside>
  )
}
