import React, { useEffect, useState } from 'react';
import { AutoApprovalConfigModal } from './components/AutoApprovalConfigModal';
import { DashboardOverview } from './components/DashboardOverview';
import { FuelAnalyticsReport } from './components/FuelAnalyticsReport';
import { FuelRequestModal } from './components/FuelRequestModal';
import { FuelRequestsList } from './components/FuelRequestsList';
import { Header } from './components/Header';
import { LiveTrackingView } from './components/LiveTrackingView';
import { MaintenanceView } from './components/MaintenanceView';
import { NotificationModal } from './components/NotificationModal';
import { VehicleRequestModal } from './components/VehicleRequestModal';
import { VehicleRequestsList } from './components/VehicleRequestsList';
import {
  getStoredFuelRequests,
  getStoredMaintenance,
  getStoredNotifications,
  getStoredSettings,
  getStoredVehicleRequests,
  getStoredVehicles,
  resetAllDataToDefault,
  saveFuelRequests,
  saveMaintenance,
  saveNotifications,
  saveSettings,
  saveVehicleRequests,
  saveVehicles,
} from './services/storage';
import {
  AutoApprovalSettings,
  FuelRequest,
  MaintenanceRecord,
  ServiceNotification,
  UserRole,
  Vehicle,
  VehicleRequest,
} from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [userRole, setUserRole] = useState<UserRole>('manajer');

  // State data
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => getStoredVehicles());
  const [vehicleRequests, setVehicleRequests] = useState<VehicleRequest[]>(() =>
    getStoredVehicleRequests()
  );
  const [fuelRequests, setFuelRequests] = useState<FuelRequest[]>(() =>
    getStoredFuelRequests()
  );
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(
    () => getStoredMaintenance()
  );
  const [notifications, setNotifications] = useState<ServiceNotification[]>(() =>
    getStoredNotifications()
  );
  const [settings, setSettings] = useState<AutoApprovalSettings>(() =>
    getStoredSettings()
  );

  // Modals state
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Persist state to storage
  useEffect(() => {
    saveVehicles(vehicles);
  }, [vehicles]);

  useEffect(() => {
    saveVehicleRequests(vehicleRequests);
  }, [vehicleRequests]);

  useEffect(() => {
    saveFuelRequests(fuelRequests);
  }, [fuelRequests]);

  useEffect(() => {
    saveMaintenance(maintenanceRecords);
  }, [maintenanceRecords]);

  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Handle vehicle request submission
  const handleVehicleRequestSubmit = (
    newRequest: VehicleRequest,
    assignedVehicle?: Vehicle
  ) => {
    setVehicleRequests((prev) => [newRequest, ...prev]);

    if (assignedVehicle && newRequest.status === 'Disetujui Otomatis') {
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === assignedVehicle.id
            ? {
                ...v,
                status: 'Sedang Beroperasi',
                currentTripId: newRequest.requestCode,
                assignedDriver: newRequest.assignedDriver || v.assignedDriver,
                location: {
                  ...v.location,
                  destination: newRequest.destination,
                  lastUpdated: 'Baru saja ditugaskan',
                },
              }
            : v
        )
      );

      // Create service / task notification
      const newNotif: ServiceNotification = {
        id: 'notif-' + Date.now(),
        vehicleId: assignedVehicle.id,
        vehiclePlate: assignedVehicle.plateNumber,
        vehicleName: assignedVehicle.name,
        title: `Permintaan Disetujui Otomatis (${newRequest.requestCode})`,
        description: `Armada ${assignedVehicle.plateNumber} dialokasikan untuk ${newRequest.requesterName} (${newRequest.destination}).`,
        severity: 'info',
        createdAt: new Date().toLocaleDateString('id-ID'),
        isRead: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  // Handle driver fuel request submission
  const handleFuelRequestSubmit = (
    newFuelRequest: FuelRequest,
    updatedVehicle: Vehicle
  ) => {
    setFuelRequests((prev) => [newFuelRequest, ...prev]);

    // Update vehicle
    setVehicles((prev) =>
      prev.map((v) => (v.id === updatedVehicle.id ? updatedVehicle : v))
    );

    // If anomalous, create manager alert notification
    if (newFuelRequest.status === 'Menunggu Review') {
      const anomalyNotif: ServiceNotification = {
        id: 'notif-fuel-' + Date.now(),
        vehicleId: updatedVehicle.id,
        vehiclePlate: updatedVehicle.plateNumber,
        vehicleName: updatedVehicle.name,
        title: `Audit Konsumsi BBM (${newFuelRequest.fuelCode})`,
        description: `Pengajuan ${newFuelRequest.driverName} terdeteksi ${newFuelRequest.calculatedKmPerLiter} km/L (di bawah standar). Memerlukan review manager.`,
        severity: 'warning',
        createdAt: new Date().toLocaleDateString('id-ID'),
        isRead: false,
      };
      setNotifications((prev) => [anomalyNotif, ...prev]);
    }
  };

  // Manager Manual Approval for Vehicle
  const handleApproveManualVehicle = (
    requestId: string,
    vehicleId: string,
    driver: string
  ) => {
    const selectedVeh = vehicles.find((v) => v.id === vehicleId);

    setVehicleRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'Disetujui Manual',
              approvalType: 'Manual',
              approvalReason: `Disetujui manual oleh Fleet Manager. Armada ${selectedVeh?.name || ''} (${selectedVeh?.plateNumber || ''}) dialokasikan.`,
              vehicleId,
              vehiclePlate: selectedVeh?.plateNumber,
              vehicleName: selectedVeh?.name,
              assignedDriver: driver,
              approvedAt: new Date().toLocaleString('id-ID'),
            }
          : r
      )
    );

    if (selectedVeh) {
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === vehicleId
            ? {
                ...v,
                status: 'Sedang Beroperasi',
                assignedDriver: driver,
              }
            : v
        )
      );
    }
  };

  const handleRejectVehicle = (requestId: string, reason: string) => {
    setVehicleRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'Ditolak',
              approvalReason: `Ditolak oleh Fleet Manager: ${reason}`,
            }
          : r
      )
    );
  };

  const handleCompleteTrip = (requestId: string) => {
    const req = vehicleRequests.find((r) => r.id === requestId);
    setVehicleRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'Selesai' } : r))
    );

    if (req?.vehicleId) {
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === req.vehicleId
            ? {
                ...v,
                status: 'Tersedia',
                currentTripId: undefined,
                location: {
                  ...v.location,
                  speed: 0,
                  destination: 'Siaga di Pool',
                  lastUpdated: 'Tugas Selesai',
                },
              }
            : v
        )
      );
    }
  };

  // Manager Manual Approval for Fuel
  const handleApproveManualFuel = (requestId: string) => {
    const targetReq = fuelRequests.find((r) => r.id === requestId);
    const voucher = targetReq?.vehiclePlate
      ? `VCHR-${targetReq.vehiclePlate.replace(/\s+/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`
      : 'VCHR-MANUAL-7721';

    setFuelRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'Disetujui Manual',
              approvalType: 'Manual',
              approvalReason:
                'Disetujui manual oleh Fleet Manager setelah klarifikasi rute macet/idling operasional.',
              voucherCode: voucher,
            }
          : r
      )
    );
  };

  const handleRejectFuel = (requestId: string, reason: string) => {
    setFuelRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'Ditolak',
              approvalReason: `Ditolak oleh Fleet Manager: ${reason}`,
            }
          : r
      )
    );
  };

  // Add Maintenance Record
  const handleAddMaintenanceRecord = (
    record: MaintenanceRecord,
    updatedVehicle?: Vehicle
  ) => {
    setMaintenanceRecords((prev) => [record, ...prev]);

    if (updatedVehicle) {
      setVehicles((prev) =>
        prev.map((v) => (v.id === updatedVehicle.id ? updatedVehicle : v))
      );
    }

    // Remove overdue notification for this vehicle if exists
    setNotifications((prev) =>
      prev.filter((n) => n.vehicleId !== record.vehicleId || !n.title.includes('Melampaui Batas'))
    );
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* 1. Header Navigation Bar */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        userRole={userRole}
        onChangeRole={setUserRole}
        notifications={notifications}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenVehicleModal={() => setIsVehicleModalOpen(true)}
      />

      {/* Role Context Helper Banner */}
      <div className="bg-slate-100 border-b border-slate-200 px-6 py-2 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">
              Mode Peran Saat Ini:
            </span>
            <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
              {userRole === 'pegawai'
                ? 'User / Pegawai (Pengajuan Kendaraan Dinas)'
                : userRole === 'driver'
                ? 'Driver Operasional (Pengajuan BBM & Odometer)'
                : 'Fleet Manager (Persetujuan Otomatis, Live GPS & Servis)'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span>Ganti peran di pojok kanan atas untuk uji skenario alur kerja</span>
            <span>·</span>
            <button
              onClick={resetAllDataToDefault}
              className="text-slate-500 hover:text-slate-800 underline"
            >
              Reset Data Demo
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {currentTab === 'overview' && (
          <DashboardOverview
            vehicles={vehicles}
            vehicleRequests={vehicleRequests}
            fuelRequests={fuelRequests}
            maintenanceRecords={maintenanceRecords}
            notifications={notifications}
            userRole={userRole}
            onNavigateTab={setCurrentTab}
            onOpenVehicleModal={() => setIsVehicleModalOpen(true)}
            onOpenFuelModal={() => setIsFuelModalOpen(true)}
          />
        )}

        {currentTab === 'requests' && (
          <VehicleRequestsList
            requests={vehicleRequests}
            vehicles={vehicles}
            userRole={userRole}
            onOpenNewModal={() => setIsVehicleModalOpen(true)}
            onApproveManual={handleApproveManualVehicle}
            onRejectRequest={handleRejectVehicle}
            onCompleteTrip={handleCompleteTrip}
          />
        )}

        {currentTab === 'fuel' && (
          <FuelRequestsList
            fuelRequests={fuelRequests}
            vehicles={vehicles}
            userRole={userRole}
            onOpenNewModal={() => setIsFuelModalOpen(true)}
            onApproveManual={handleApproveManualFuel}
            onRejectRequest={handleRejectFuel}
          />
        )}

        {currentTab === 'tracking' && (
          <LiveTrackingView
            vehicles={vehicles}
            onUpdateVehicles={setVehicles}
            onOpenVehicleRequest={() => setIsVehicleModalOpen(true)}
          />
        )}

        {currentTab === 'maintenance' && (
          <MaintenanceView
            vehicles={vehicles}
            maintenanceRecords={maintenanceRecords}
            notifications={notifications}
            onAddMaintenanceRecord={handleAddMaintenanceRecord}
            onDismissNotification={(id) =>
              setNotifications((prev) => prev.filter((n) => n.id !== id))
            }
          />
        )}

        {currentTab === 'reports' && (
          <FuelAnalyticsReport
            fuelRequests={fuelRequests}
            vehicles={vehicles}
          />
        )}
      </main>

      {/* 3. Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">FleetOps</span>
            <span>· Sistem Informasi Manajemen Kendaraan & BBM Operasional</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Persetujuan Otomatis Cerdas</span>
            <span>·</span>
            <span>Pelacakan GPS Real-Time</span>
            <span>·</span>
            <span>Pengingat Servis Berkala</span>
            <span>·</span>
            <span>Efisiensi Biaya BBM</span>
          </div>
        </div>
      </footer>

      {/* 4. Modals */}
      <VehicleRequestModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        vehicles={vehicles}
        settings={settings}
        onSubmit={handleVehicleRequestSubmit}
      />

      <FuelRequestModal
        isOpen={isFuelModalOpen}
        onClose={() => setIsFuelModalOpen(false)}
        vehicles={vehicles}
        settings={settings}
        onSubmit={handleFuelRequestSubmit}
      />

      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
      />

      <AutoApprovalConfigModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
      />
    </div>
  );
}
