import React from 'react';
import {
  Bell,
  Car,
  ChevronDown,
  Compass,
  FileText,
  Fuel,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  User,
  Wrench,
  Zap,
} from 'lucide-react';
import { ServiceNotification, UserRole } from '../types';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  userRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  notifications: ServiceNotification[];
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  onOpenVehicleModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  onChangeRole,
  notifications,
  onOpenNotifications,
  onOpenSettings,
  onOpenVehicleModal,
}) => {
  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-3.5">
        {/* Zone 1: Single text element wordmark */}
        <div
          onClick={() => onSelectTab('overview')}
          className="flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            FO
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            FleetOps
          </span>
        </div>

        {/* Zone 2: 4–6 concise single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <button
            onClick={() => onSelectTab('overview')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              currentTab === 'overview' ? 'text-slate-900 font-bold border-b-2 border-slate-900 pb-0.5' : ''
            }`}
          >
            Ringkasan
          </button>
          <button
            onClick={() => onSelectTab('requests')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              currentTab === 'requests' ? 'text-slate-900 font-bold border-b-2 border-slate-900 pb-0.5' : ''
            }`}
          >
            Permintaan Kendaraan
          </button>
          <button
            onClick={() => onSelectTab('fuel')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              currentTab === 'fuel' ? 'text-slate-900 font-bold border-b-2 border-slate-900 pb-0.5' : ''
            }`}
          >
            Pengajuan BBM
          </button>
          <button
            onClick={() => onSelectTab('tracking')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              currentTab === 'tracking' ? 'text-slate-900 font-bold border-b-2 border-slate-900 pb-0.5' : ''
            }`}
          >
            Peta GPS Live
          </button>
          <button
            onClick={() => onSelectTab('maintenance')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              currentTab === 'maintenance' ? 'text-slate-900 font-bold border-b-2 border-slate-900 pb-0.5' : ''
            }`}
          >
            Pengingat Servis
          </button>
          <button
            onClick={() => onSelectTab('reports')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              currentTab === 'reports' ? 'text-slate-900 font-bold border-b-2 border-slate-900 pb-0.5' : ''
            }`}
          >
            Laporan Biaya BBM
          </button>
        </nav>

        {/* Zone 3: 1 primary action + role perspective selector */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Role selector dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-xs">
            <span className="text-[10px] text-slate-500 font-medium">Peran:</span>
            <select
              value={userRole}
              onChange={(e) => onChangeRole(e.target.value as UserRole)}
              className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="pegawai">User / Pegawai</option>
              <option value="driver">Driver Operasional</option>
              <option value="manajer">Manajer Fleet (Admin)</option>
            </select>
          </div>

          {/* Service Alerts Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            title="Pengingat Servis & Notifikasi"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-600"></span>
            )}
          </button>

          {/* Settings button */}
          {userRole === 'manajer' && (
            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              title="Atur Konfigurasi Auto-Approval"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          {/* Primary Action Button */}
          <button
            onClick={onOpenVehicleModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 shadow-xs"
          >
            <Car className="w-3.5 h-3.5" />
            Minta Kendaraan
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden flex items-center justify-between overflow-x-auto gap-3 px-4 py-2 border-t border-slate-100 bg-slate-50 text-xs font-medium">
        <button
          onClick={() => onSelectTab('overview')}
          className={`whitespace-nowrap px-2 py-1 rounded ${currentTab === 'overview' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-600'}`}
        >
          Ringkasan
        </button>
        <button
          onClick={() => onSelectTab('requests')}
          className={`whitespace-nowrap px-2 py-1 rounded ${currentTab === 'requests' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-600'}`}
        >
          Kendaraan
        </button>
        <button
          onClick={() => onSelectTab('fuel')}
          className={`whitespace-nowrap px-2 py-1 rounded ${currentTab === 'fuel' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-600'}`}
        >
          BBM Driver
        </button>
        <button
          onClick={() => onSelectTab('tracking')}
          className={`whitespace-nowrap px-2 py-1 rounded ${currentTab === 'tracking' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-600'}`}
        >
          GPS Live
        </button>
        <button
          onClick={() => onSelectTab('maintenance')}
          className={`whitespace-nowrap px-2 py-1 rounded ${currentTab === 'maintenance' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-600'}`}
        >
          Servis
        </button>
        <button
          onClick={() => onSelectTab('reports')}
          className={`whitespace-nowrap px-2 py-1 rounded ${currentTab === 'reports' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-600'}`}
        >
          Laporan
        </button>
      </div>
    </header>
  );
};
