import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  FileCheck,
  Plus,
  ShieldAlert,
  Wrench,
  X,
} from 'lucide-react';
import { MaintenanceRecord, ServiceNotification, Vehicle } from '../types';

interface MaintenanceViewProps {
  vehicles: Vehicle[];
  maintenanceRecords: MaintenanceRecord[];
  notifications: ServiceNotification[];
  onAddMaintenanceRecord: (record: MaintenanceRecord, updatedVehicle?: Vehicle) => void;
  onDismissNotification?: (notifId: string) => void;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  vehicles,
  maintenanceRecords,
  notifications,
  onAddMaintenanceRecord,
  onDismissNotification,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicles[0]?.id || '');
  const [serviceType, setServiceType] = useState<MaintenanceRecord['serviceType']>('Ganti Oli & Filter');
  const [serviceDate, setServiceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [workshopName, setWorkshopName] = useState('Auto2000 Tebet Supomo');
  const [cost, setCost] = useState<number>(1250000);
  const [notes, setNotes] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'urgent' | 'warning' | 'normal'>('all');

  // Compute maintenance status for each vehicle
  const vehicleServiceStatus = vehicles.map((v) => {
    const kmSinceLastService = v.currentOdometer - v.lastServiceKm;
    const kmUntilNextService = v.serviceIntervalKm - kmSinceLastService;
    const isOverdue = kmUntilNextService <= 0;
    const isApproaching = kmUntilNextService > 0 && kmUntilNextService <= 1000;

    // Check KIR expiration
    const today = new Date();
    const kirDate = v.kirExpiryDate ? new Date(v.kirExpiryDate) : null;
    const daysUntilKir = kirDate ? Math.ceil((kirDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 999;
    const isKirUrgent = daysUntilKir <= 14;

    let statusSeverity: 'urgent' | 'warning' | 'normal' = 'normal';
    if (isOverdue || isKirUrgent) {
      statusSeverity = 'urgent';
    } else if (isApproaching) {
      statusSeverity = 'warning';
    }

    return {
      vehicle: v,
      kmSinceLastService,
      kmUntilNextService,
      isOverdue,
      isApproaching,
      daysUntilKir,
      isKirUrgent,
      statusSeverity,
    };
  });

  const filteredList = vehicleServiceStatus.filter((item) => {
    if (filterType === 'all') return true;
    return item.statusSeverity === filterType;
  });

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const v = vehicles.find((item) => item.id === selectedVehicleId);
    if (!v) return;

    const currentOdo = v.currentOdometer;
    const newRecord: MaintenanceRecord = {
      id: 'maint-' + Date.now(),
      vehicleId: v.id,
      vehiclePlate: v.plateNumber,
      vehicleName: v.name,
      serviceType,
      odometerAtService: currentOdo,
      serviceDate,
      nextServiceKm: currentOdo + v.serviceIntervalKm,
      nextServiceDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      workshopName,
      cost,
      notes: notes || `Servis rutin ${serviceType} di ${workshopName}`,
      status: 'Selesai',
    };

    // Update vehicle's last service km and status back to normal
    const updatedVehicle: Vehicle = {
      ...v,
      lastServiceKm: currentOdo,
      lastServiceDate: serviceDate,
      status: v.status === 'Perlu Servis Segera' ? 'Tersedia' : v.status,
    };

    onAddMaintenanceRecord(newRecord, updatedVehicle);
    setIsAddModalOpen(false);
    setNotes('');
  };

  const urgentCount = vehicleServiceStatus.filter((i) => i.statusSeverity === 'urgent').length;
  const warningCount = vehicleServiceStatus.filter((i) => i.statusSeverity === 'warning').length;
  const totalCostMaintenance = maintenanceRecords.reduce((acc, r) => acc + r.cost, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Overdue / Servis Mendesak</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-600">
              {urgentCount}
            </span>
            <span className="text-xs text-slate-500">Unit kendaraan</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Melebihi batas toleransi KM / KIR</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Mendekati Jadwal Servis</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-600">
              {warningCount}
            </span>
            <span className="text-xs text-slate-500">Unit kendaraan</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Dalam rentang &lt; 1.000 KM</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Armada Terpantau</span>
            <FileCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {vehicles.length}
            </span>
            <span className="text-xs text-slate-500">Unit operasional</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Kondisi siap & terinspeksi</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Biaya Servis Terbukukan</span>
            <DollarSign className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold font-mono text-slate-900">
              Rp {totalCostMaintenance.toLocaleString('id-ID')}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{maintenanceRecords.length} kali perawatan berkala</p>
        </div>
      </div>

      {/* Active Service Notification Alerts */}
      {notifications.length > 0 && (
        <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <h3 className="text-xs font-bold text-rose-900">
                Peringatan Aktif Pengingat Servis & Dokumen Berkala
              </h3>
            </div>
            <span className="text-[11px] font-mono text-rose-700">
              {notifications.length} Perhatian Mendesak
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className="bg-white p-3 rounded-lg border border-rose-100 flex items-start justify-between gap-3 shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">
                      {notif.vehiclePlate}
                    </span>
                    <span className="text-xs font-semibold text-slate-900">
                      {notif.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                    {notif.description}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedVehicleId(notif.vehicleId);
                    setIsAddModalOpen(true);
                  }}
                  className="shrink-0 px-2.5 py-1 text-[11px] font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors"
                >
                  Jadwalkan
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fleet Maintenance Status Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-slate-200 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Status Servis & Odometer Armada
            </h3>
            <p className="text-xs text-slate-500">
              Pantauan batas kilometer ganti oli, servis rem, pajak STNK, dan buku KIR
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter segments */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-md transition-colors ${filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterType('urgent')}
                className={`px-3 py-1 rounded-md transition-colors ${filterType === 'urgent' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Mendesak ({urgentCount})
              </button>
              <button
                onClick={() => setFilterType('warning')}
                className={`px-3 py-1 rounded-md transition-colors ${filterType === 'warning' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Mendekati ({warningCount})
              </button>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Catat Servis Selesai
            </button>
          </div>
        </div>

        {/* Vehicle Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Kendaraan</th>
                <th className="py-3 px-4">Odometer Terkini</th>
                <th className="py-3 px-4">Servis Terakhir</th>
                <th className="py-3 px-4">Target Servis Berikutnya</th>
                <th className="py-3 px-4">Sisa Jarak / Waktu</th>
                <th className="py-3 px-4">Status Kondisi</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map((item) => {
                const v = item.vehicle;
                const progressPct = Math.min(100, Math.round((item.kmSinceLastService / v.serviceIntervalKm) * 100));

                return (
                  <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                          {v.plateNumber}
                        </span>
                        <div>
                          <span className="font-semibold text-slate-900 block truncate max-w-[160px]">
                            {v.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {v.type} · Driver: {v.assignedDriver || '-'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-900 tabular-nums">
                      {v.currentOdometer.toLocaleString('id-ID')} km
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <div className="font-mono tabular-nums">{v.lastServiceKm.toLocaleString('id-ID')} km</div>
                      <div className="text-[10px] text-slate-400">{v.lastServiceDate}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono tabular-nums font-semibold text-slate-800">
                        {(v.lastServiceKm + v.serviceIntervalKm).toLocaleString('id-ID')} km
                      </div>
                      <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            progressPct >= 100 ? 'bg-rose-500' : progressPct > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {item.isOverdue ? (
                        <span className="font-mono font-bold text-rose-600">
                          Lewat {Math.abs(item.kmUntilNextService).toLocaleString('id-ID')} km!
                        </span>
                      ) : (
                        <span className="font-mono text-slate-700">
                          Sisa {item.kmUntilNextService.toLocaleString('id-ID')} km
                        </span>
                      )}
                      {item.daysUntilKir <= 30 && (
                        <div className="text-[10px] text-amber-600 font-medium">
                          KIR: {item.daysUntilKir} hari lagi
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          item.statusSeverity === 'urgent'
                            ? 'bg-rose-50 text-rose-700'
                            : item.statusSeverity === 'warning'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {item.statusSeverity === 'urgent'
                          ? 'Perlu Servis Segera'
                          : item.statusSeverity === 'warning'
                          ? 'Mendekati Jadwal'
                          : 'Kondisi Prima'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedVehicleId(v.id);
                          setIsAddModalOpen(true);
                        }}
                        className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors"
                      >
                        Input Servis
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical Service Logs */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-900">
            Riwayat Perawatan & Pemeliharaan Kendaraan
          </h3>
          <p className="text-xs text-slate-500">
            Catatan historis penggantian suku cadang, oli, dan servis berkala resmi
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {maintenanceRecords.map((record) => (
            <div key={record.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                    {record.vehiclePlate}
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {record.serviceType}
                  </span>
                  <span className="text-xs text-slate-500">· {record.workshopName}</span>
                </div>
                <p className="text-xs text-slate-600">
                  {record.notes}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                  <span>Tgl Servis: {record.serviceDate}</span>
                  <span>·</span>
                  <span>Odo: {record.odometerAtService.toLocaleString('id-ID')} km</span>
                  <span>·</span>
                  <span>Next: {record.nextServiceKm.toLocaleString('id-ID')} km</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs text-slate-400 block">Biaya Servis</span>
                <span className="text-sm font-mono font-bold text-slate-900">
                  Rp {record.cost.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Maintenance Record Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                Pencatatan Servis Berkala
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Kendaraan Operasional
                </label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plateNumber} - {v.name} ({v.currentOdometer.toLocaleString('id-ID')} km)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Jenis Servis
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="Ganti Oli & Filter">Ganti Oli & Filter</option>
                    <option value="Tune Up Berkala">Tune Up Berkala</option>
                    <option value="Servis Rem & Kaki">Servis Rem & Kaki</option>
                    <option value="Ganti Ban">Ganti Ban</option>
                    <option value="Uji KIR">Uji KIR</option>
                    <option value="Pajak STNK Tahunan">Pajak STNK Tahunan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Tanggal Pengerjaan
                  </label>
                  <input
                    type="date"
                    required
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Bengkel Resmi / Tempat Servis
                </label>
                <input
                  type="text"
                  required
                  value={workshopName}
                  onChange={(e) => setWorkshopName(e.target.value)}
                  placeholder="Misal: Plaza Toyota / Auto2000 / Dishub"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Total Biaya Servis (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  required
                  value={cost}
                  onChange={(e) => setCost(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Catatan Pekerjaan
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ganti oli mesin TMO 0W-20, kuras minyak rem..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
                >
                  Simpan Catatan Servis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
