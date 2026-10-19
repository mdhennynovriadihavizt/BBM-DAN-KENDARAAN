import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Car,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  Fuel,
  Navigation,
  Sparkles,
  Ticket,
  TrendingUp,
  UserCheck,
  Wrench,
  Zap,
} from 'lucide-react';
import { FuelRequest, MaintenanceRecord, ServiceNotification, UserRole, Vehicle, VehicleRequest } from '../types';

interface DashboardOverviewProps {
  vehicles: Vehicle[];
  vehicleRequests: VehicleRequest[];
  fuelRequests: FuelRequest[];
  maintenanceRecords: MaintenanceRecord[];
  notifications: ServiceNotification[];
  userRole: UserRole;
  onNavigateTab: (tab: string) => void;
  onOpenVehicleModal: () => void;
  onOpenFuelModal: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  vehicles,
  vehicleRequests,
  fuelRequests,
  maintenanceRecords,
  notifications,
  userRole,
  onNavigateTab,
  onOpenVehicleModal,
  onOpenFuelModal,
}) => {
  const activeVehicles = vehicles.filter((v) => v.status === 'Sedang Beroperasi');
  const readyVehicles = vehicles.filter((v) => v.status === 'Tersedia');
  const serviceVehicles = vehicles.filter((v) => v.status === 'Perlu Servis Segera' || v.status === 'Dalam Perawatan');

  const pendingVehicleRequests = vehicleRequests.filter((r) => r.status === 'Menunggu Review');
  const pendingFuelRequests = fuelRequests.filter((r) => r.status === 'Menunggu Review');

  const autoApprovedRequests = vehicleRequests.filter((r) => r.approvalType === 'Otomatis').length;
  const autoApprovedFuel = fuelRequests.filter((r) => r.approvalType === 'Otomatis').length;

  return (
    <div className="space-y-6">
      {/* Hero Welcome / Executive Summary Strip */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                SISTEM OPERASIONAL TERINTEGRASI
              </span>
              <span className="text-xs text-slate-400">· Jabodetabek Corporate Fleet</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Manajemen Armada, Efisiensi BBM & Persetujuan Otomatis
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Otomatisasi pengajuan kendaraan dinas dan voucher bahan bakar dengan pemantauan lokasi GPS real-time, audit rasio konsumsi KM/L, dan pengingat servis berkala.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenVehicleModal}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-900 bg-white rounded-lg hover:bg-slate-100 transition-colors shadow-xs"
              >
                <Car className="w-3.5 h-3.5" />
                Permintaan Kendaraan (User)
              </button>

              <button
                onClick={onOpenFuelModal}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors shadow-xs"
              >
                <Fuel className="w-3.5 h-3.5" />
                Pengajuan BBM (Driver)
              </button>

              <button
                onClick={() => onNavigateTab('tracking')}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
              >
                <Compass className="w-3.5 h-3.5" />
                Buka Peta GPS Live
              </button>
            </div>
          </div>

          {/* Quick Engine Auto-Approval Counter Widget */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 text-xs space-y-3 min-w-[240px]">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold border-b border-slate-700 pb-2">
              <Zap className="w-4 h-4" />
              <span>Efisiensi Auto-Approval</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Kendaraan Auto-Approved:</span>
              <span className="font-mono font-bold text-white text-sm">{autoApprovedRequests} unit</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>BBM Voucher Instant:</span>
              <span className="font-mono font-bold text-white text-sm">{autoApprovedFuel} klaim</span>
            </div>
            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-700/60">
              Waktu persetujuan rata-rata: <strong className="text-emerald-300">&lt; 3 detik</strong>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigateTab('tracking')}
          className="bg-white p-4 rounded-xl border border-slate-200 cursor-pointer hover:border-slate-300 transition-colors shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Armada Aktif di Jalan</span>
            <Navigation className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-blue-600">
              {activeVehicles.length}
            </span>
            <span className="text-xs text-slate-500">dari {vehicles.length} unit</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {readyVehicles.length} unit siap di pool
          </span>
        </div>

        <div
          onClick={() => onNavigateTab('requests')}
          className="bg-white p-4 rounded-xl border border-slate-200 cursor-pointer hover:border-slate-300 transition-colors shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Permintaan Kendaraan</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {vehicleRequests.length}
            </span>
            <span className="text-xs text-amber-600 font-medium">
              ({pendingVehicleRequests.length} review manual)
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {autoApprovedRequests} disetujui otomatis
          </span>
        </div>

        <div
          onClick={() => onNavigateTab('fuel')}
          className="bg-white p-4 rounded-xl border border-slate-200 cursor-pointer hover:border-slate-300 transition-colors shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Pengajuan BBM Driver</span>
            <Fuel className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {fuelRequests.length}
            </span>
            <span className="text-xs text-slate-500">transaksi</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {pendingFuelRequests.length > 0 ? `${pendingFuelRequests.length} anomali konsumsi perlu audit` : 'Semua kuota terkendali'}
          </span>
        </div>

        <div
          onClick={() => onNavigateTab('maintenance')}
          className="bg-white p-4 rounded-xl border border-slate-200 cursor-pointer hover:border-slate-300 transition-colors shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Pengingat Servis & KIR</span>
            <Wrench className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-600">
              {notifications.length}
            </span>
            <span className="text-xs text-slate-500">notifikasi aktif</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {serviceVehicles.length} unit perlu perawatan segera
          </span>
        </div>
      </div>

      {/* Middle Grid: Active GPS Fleet Snippet & Urgent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Movement Fleet Snippet */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Armada Bergerak Real-Time Terkini
              </h3>
              <p className="text-xs text-slate-500">
                Posisi GPS dan kecepatan unit yang sedang menjalankan surat tugas dinas
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('tracking')}
              className="flex items-center gap-1 text-xs font-semibold text-slate-900 hover:text-blue-600 transition-colors"
            >
              Lihat Peta Lengkap
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {activeVehicles.map((v) => (
              <div key={v.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs font-mono">
                    GPS
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {v.plateNumber}
                      </span>
                      <span className="text-xs font-medium text-slate-800">
                        {v.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate max-w-sm mt-0.5">
                      {v.location.address}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono text-xs font-bold text-slate-900 tabular-nums">
                    {v.location.speed} km/h
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Tangki: {v.currentFuelLevel}L ({Math.round((v.currentFuelLevel / v.tankCapacity) * 100)}%)
                  </div>
                </div>
              </div>
            ))}

            {activeVehicles.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                Semua armada saat ini sedang standby di pool operasional.
              </div>
            )}
          </div>
        </div>

        {/* Priority Action / Service Reminder Box */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Peringatan Servis Berkala
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Otomatis</span>
          </div>

          <div className="space-y-3">
            {notifications.slice(0, 3).map((notif) => (
              <div
                key={notif.id}
                className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {notif.vehiclePlate}
                  </span>
                  <span className="text-[10px] font-semibold text-rose-600">
                    Mendesak
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-slate-800">
                  {notif.title}
                </h4>
                <p className="text-[11px] text-slate-600 line-clamp-2">
                  {notif.description}
                </p>
              </div>
            ))}

            {notifications.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-400">
                Semua kendaraan telah memenuhi jadwal servis berkala.
              </div>
            )}

            <button
              onClick={() => onNavigateTab('maintenance')}
              className="w-full py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-center block"
            >
              Buka Jadwal Servis Lengkap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
