/**
 * Navbar Component
 * Created by CaptainCode - HelixOps Technologies
 */

import { Bell, Settings, User } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="bg-slate-800 border-b border-slate-700 px-8 py-4">
      <div className="flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-400">
          HelixMonitor v1.0
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center bg-slate-700 rounded-lg px-4 py-2">
            <span className="text-xs text-slate-400 mr-2">Created by</span>
            <span className="font-semibold text-amber-400">CaptainCode</span>
          </div>

          <button className="p-2 hover:bg-slate-700 rounded-lg transition">
            <Bell size={20} className="text-slate-400" />
          </button>

          <button className="p-2 hover:bg-slate-700 rounded-lg transition">
            <Settings size={20} className="text-slate-400" />
          </button>

          <button className="p-2 hover:bg-slate-700 rounded-lg transition">
            <User size={20} className="text-slate-400" />
          </button>
        </div>
      </div>
    </nav>
  )
}
