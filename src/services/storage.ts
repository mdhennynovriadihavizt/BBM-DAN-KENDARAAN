import {
  initialFuelRequests,
  initialMaintenanceRecords,
  initialNotifications,
  initialVehicleRequests,
  initialVehicles,
} from '../data/mockData';
import {
  AutoApprovalSettings,
  FuelRequest,
  MaintenanceRecord,
  ServiceNotification,
  Vehicle,
  VehicleRequest,
} from '../types';
import { defaultAutoApprovalSettings } from './autoApprovalEngine';

const STORAGE_KEYS = {
  VEHICLES: 'fleetops_vehicles_v1',
  VEHICLE_REQUESTS: 'fleetops_vehicle_requests_v1',
  FUEL_REQUESTS: 'fleetops_fuel_requests_v1',
  MAINTENANCE: 'fleetops_maintenance_v1',
  NOTIFICATIONS: 'fleetops_notifications_v1',
  SETTINGS: 'fleetops_settings_v1',
};

export function getStoredVehicles(): Vehicle[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VEHICLES);
    return raw ? JSON.parse(raw) : initialVehicles;
  } catch {
    return initialVehicles;
  }
}

export function saveVehicles(vehicles: Vehicle[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
  } catch (err) {
    console.error('Failed saving vehicles:', err);
  }
}

export function getStoredVehicleRequests(): VehicleRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VEHICLE_REQUESTS);
    return raw ? JSON.parse(raw) : initialVehicleRequests;
  } catch {
    return initialVehicleRequests;
  }
}

export function saveVehicleRequests(requests: VehicleRequest[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.VEHICLE_REQUESTS, JSON.stringify(requests));
  } catch (err) {
    console.error('Failed saving vehicle requests:', err);
  }
}

export function getStoredFuelRequests(): FuelRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FUEL_REQUESTS);
    return raw ? JSON.parse(raw) : initialFuelRequests;
  } catch {
    return initialFuelRequests;
  }
}

export function saveFuelRequests(fuelRequests: FuelRequest[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.FUEL_REQUESTS, JSON.stringify(fuelRequests));
  } catch (err) {
    console.error('Failed saving fuel requests:', err);
  }
}

export function getStoredMaintenance(): MaintenanceRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MAINTENANCE);
    return raw ? JSON.parse(raw) : initialMaintenanceRecords;
  } catch {
    return initialMaintenanceRecords;
  }
}

export function saveMaintenance(records: MaintenanceRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(records));
  } catch (err) {
    console.error('Failed saving maintenance:', err);
  }
}

export function getStoredNotifications(): ServiceNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return raw ? JSON.parse(raw) : initialNotifications;
  } catch {
    return initialNotifications;
  }
}

export function saveNotifications(notifs: ServiceNotification[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  } catch (err) {
    console.error('Failed saving notifications:', err);
  }
}

export function getStoredSettings(): AutoApprovalSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : defaultAutoApprovalSettings;
  } catch {
    return defaultAutoApprovalSettings;
  }
}

export function saveSettings(settings: AutoApprovalSettings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed saving settings:', err);
  }
}

export function resetAllDataToDefault() {
  localStorage.removeItem(STORAGE_KEYS.VEHICLES);
  localStorage.removeItem(STORAGE_KEYS.VEHICLE_REQUESTS);
  localStorage.removeItem(STORAGE_KEYS.FUEL_REQUESTS);
  localStorage.removeItem(STORAGE_KEYS.MAINTENANCE);
  localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  window.location.reload();
}
