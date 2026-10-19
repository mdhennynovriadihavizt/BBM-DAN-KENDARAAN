import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Car,
  Compass,
  Fuel,
  Navigation,
  Pause,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  User,
  Wrench,
  Zap,
} from 'lucide-react';
import { Vehicle } from '../types';

interface LiveTrackingViewProps {
  vehicles: Vehicle[];
  onUpdateVehicles?: (vehicles: Vehicle[]) => void;
  onOpenVehicleRequest?: () => void;
}

export const LiveTrackingView: React.FC<LiveTrackingViewProps> = ({
  vehicles,
  onUpdateVehicles,
  onOpenVehicleRequest,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || '');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [telemetryTicks, setTelemetryTicks] = useState<number>(0);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Jakarta central coordinate
    const map = L.map(mapContainerRef.current, {
      center: [-6.2200, 106.8400],
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clean up old markers not in current list
    const currentIds = new Set(vehicles.map((v) => v.id));
    Object.keys(markersRef.current).forEach((id) => {
      if (!currentIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    vehicles.forEach((vehicle) => {
      const isSelected = vehicle.id === selectedVehicleId;
      const isMoving = vehicle.status === 'Sedang Beroperasi';
      const isUrgent = vehicle.status === 'Perlu Servis Segera';

      const pinBg = isMoving
        ? 'bg-blue-600 text-white shadow-blue-500/40 ring-4 ring-blue-100'
        : isUrgent
        ? 'bg-amber-600 text-white shadow-amber-500/40 ring-4 ring-amber-100'
        : 'bg-slate-700 text-white ring-2 ring-slate-200';

      const customHtml = `
        <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-300 ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}">
          <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold shadow-md ${pinBg}">
            <span class="w-1.5 h-1.5 rounded-full ${isMoving ? 'bg-emerald-300 animate-ping' : 'bg-slate-300'}"></span>
            <span class="tracking-tight">${vehicle.plateNumber}</span>
            ${isMoving ? `<span class="text-[10px] opacity-90 font-mono">${vehicle.location.speed}k</span>` : ''}
          </div>
          <div class="w-2 h-2 rotate-45 -mt-1 mx-auto ${isMoving ? 'bg-blue-600' : isUrgent ? 'bg-amber-600' : 'bg-slate-700'}"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-gps-pin',
        html: customHtml,
        iconSize: [110, 36],
        iconAnchor: [55, 36],
      });

      if (markersRef.current[vehicle.id]) {
        markersRef.current[vehicle.id]
          .setLatLng([vehicle.location.lat, vehicle.location.lng])
          .setIcon(customIcon);
      } else {
        const marker = L.marker([vehicle.location.lat, vehicle.location.lng], {
          icon: customIcon,
        }).addTo(map);

        marker.on('click', () => {
          setSelectedVehicleId(vehicle.id);
        });

        markersRef.current[vehicle.id] = marker;
      }
    });
  }, [vehicles, selectedVehicleId]);

  // Center on selected vehicle
  const centerOnVehicle = (vehicle: Vehicle) => {
    setSelectedVehicleId(vehicle.id);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([vehicle.location.lat, vehicle.location.lng], 14, {
        animate: true,
        duration: 1.2,
      });
    }
  };

  // Live GPS Simulation Interval (Simulates realistic Jakarta vehicle movements)
  useEffect(() => {
    if (!isSimulating || !onUpdateVehicles) return;

    const interval = setInterval(() => {
      setTelemetryTicks((t) => t + 1);

      const updated = vehicles.map((v) => {
        if (v.status !== 'Sedang Beroperasi') return v;

        // Minor delta for realistic GPS movement along roads
        const latDelta = (Math.random() - 0.48) * 0.0007;
        const lngDelta = (Math.random() - 0.47) * 0.0007;
        const newLat = v.location.lat + latDelta;
        const newLng = v.location.lng + lngDelta;

        // Dynamic speed variation between 32 - 68 km/h
        const speedVariance = Math.floor(35 + Math.random() * 32);

        // Slow fuel consumption burn
        const fuelBurned = 0.02;
        const updatedFuel = Math.max(2, Number((v.currentFuelLevel - fuelBurned).toFixed(2)));

        return {
          ...v,
          currentFuelLevel: updatedFuel,
          location: {
            ...v.location,
            lat: newLat,
            lng: newLng,
            speed: speedVariance,
            lastUpdated: 'Baru saja (Real-time)',
          },
        };
      });

      onUpdateVehicles(updated);
    }, 3500);

    return () => clearInterval(interval);
  }, [isSimulating, vehicles, onUpdateVehicles]);

  // Filter vehicles
  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.assignedDriver && v.assignedDriver.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return v.status === 'Sedang Beroperasi';
    if (filterStatus === 'ready') return v.status === 'Tersedia';
    if (filterStatus === 'service') return v.status === 'Perlu Servis Segera' || v.status === 'Dalam Perawatan';
    return true;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] min-h-[620px] bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Top Map Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3 border-b border-slate-200 bg-slate-50/70">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isSimulating ? 'bg-emerald-400' : 'bg-slate-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isSimulating ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
            </span>
            <span className="text-sm font-semibold text-slate-800">
              Pelacakan GPS Armada Real-Time
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono tabular-nums">
            Sync #{telemetryTicks} · {vehicles.filter((v) => v.status === 'Sedang Beroperasi').length} Unit Aktif Bergerak
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              isSimulating
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isSimulating ? 'Jeda Sinkronisasi GPS' : 'Mulai Pelacakan GPS'}
          </button>

          <button
            onClick={() => {
              if (selectedVehicle) centerOnVehicle(selectedVehicle);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            Fokus Kendaraan
          </button>
        </div>
      </div>

      {/* Main Map + Sidebar Split View */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* Left Side: Vehicle List & Telemetry Drawer */}
        <div className="w-96 flex flex-col border-r border-slate-200 bg-white z-10 shrink-0">
          {/* Search & Filter Header */}
          <div className="p-3 border-b border-slate-100 space-y-2 bg-slate-50/50">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari plat, model, driver..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>

            {/* Segmented Filter Control */}
            <div className="grid grid-cols-4 gap-1 p-0.5 bg-slate-100 rounded-lg text-[11px] font-medium text-slate-600">
              <button
                onClick={() => setFilterStatus('all')}
                className={`py-1 rounded-md transition-colors ${filterStatus === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
              >
                Semua ({vehicles.length})
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`py-1 rounded-md transition-colors ${filterStatus === 'active' ? 'bg-white text-blue-700 shadow-xs' : 'hover:text-slate-900'}`}
              >
                Aktif ({vehicles.filter((v) => v.status === 'Sedang Beroperasi').length})
              </button>
              <button
                onClick={() => setFilterStatus('ready')}
                className={`py-1 rounded-md transition-colors ${filterStatus === 'ready' ? 'bg-white text-emerald-700 shadow-xs' : 'hover:text-slate-900'}`}
              >
                Ready ({vehicles.filter((v) => v.status === 'Tersedia').length})
              </button>
              <button
                onClick={() => setFilterStatus('service')}
                className={`py-1 rounded-md transition-colors ${filterStatus === 'service' ? 'bg-white text-amber-700 shadow-xs' : 'hover:text-slate-900'}`}
              >
                Servis ({vehicles.filter((v) => v.status === 'Perlu Servis Segera' || v.status === 'Dalam Perawatan').length})
              </button>
            </div>
          </div>

          {/* Vehicle List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredVehicles.map((vehicle) => {
              const isSelected = vehicle.id === selectedVehicleId;
              const fuelPct = Math.round((vehicle.currentFuelLevel / vehicle.tankCapacity) * 100);

              return (
                <div
                  key={vehicle.id}
                  onClick={() => centerOnVehicle(vehicle)}
                  className={`p-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-slate-100/90 border-l-2 border-slate-900' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 px-1.5 py-0.5 bg-slate-200/80 rounded">
                          {vehicle.plateNumber}
                        </span>
                        <span className="text-xs font-semibold text-slate-800 truncate max-w-[150px]">
                          {vehicle.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 truncate">
                        {vehicle.location.address}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                        vehicle.status === 'Sedang Beroperasi'
                          ? 'bg-blue-50 text-blue-700'
                          : vehicle.status === 'Tersedia'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {vehicle.status}
                    </span>
                  </div>

                  {/* Telemetry snippet: speed, fuel, driver */}
                  <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1">
                      <Navigation className="w-3 h-3 text-slate-400" />
                      <span className="font-mono tabular-nums font-medium">
                        {vehicle.location.speed} km/h
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Fuel className="w-3 h-3 text-slate-400" />
                      <span className="font-mono tabular-nums font-medium">
                        {fuelPct}% ({vehicle.currentFuelLevel}L)
                      </span>
                    </div>

                    <div className="flex items-center gap-1 truncate">
                      <User className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{vehicle.assignedDriver || 'Pool'}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredVehicles.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">
                Tidak ada kendaraan yang sesuai filter.
              </div>
            )}
          </div>

          {/* Quick Action in Sidebar */}
          <div className="p-3 border-t border-slate-200 bg-slate-50">
            <button
              onClick={onOpenVehicleRequest}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Car className="w-3.5 h-3.5" />
              Ajukan Permintaan Kendaraan
            </button>
          </div>
        </div>

        {/* Center: Live Interactive Leaflet Map Container */}
        <div className="flex-1 h-full relative">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Floating Selected Vehicle Dossier Card */}
          {selectedVehicle && (
            <div className="absolute bottom-5 right-5 max-w-sm w-full bg-white/95 backdrop-blur-md rounded-xl border border-slate-200/90 shadow-lg p-4 z-20 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                      {selectedVehicle.plateNumber}
                    </span>
                    <span className="text-xs font-semibold text-slate-900">
                      {selectedVehicle.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tipe: {selectedVehicle.type} · BBM: {selectedVehicle.fuelType}
                  </p>
                </div>

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                    selectedVehicle.status === 'Sedang Beroperasi'
                      ? 'bg-blue-100 text-blue-800'
                      : selectedVehicle.status === 'Tersedia'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {selectedVehicle.status}
                </span>
              </div>

              {/* Status details */}
              <div className="bg-slate-50 rounded-lg p-2.5 space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="text-[11px]">Lokasi Terkini:</span>
                  <span className="font-medium text-slate-800 text-right truncate max-w-[200px]">
                    {selectedVehicle.location.address}
                  </span>
                </div>

                {selectedVehicle.location.destination && (
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-[11px]">Tujuan Tugas:</span>
                    <span className="font-medium text-blue-700 text-right truncate max-w-[200px]">
                      {selectedVehicle.location.destination}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-slate-600">
                  <span className="text-[11px]">Pengemudi (Driver):</span>
                  <span className="font-medium text-slate-800">
                    {selectedVehicle.assignedDriver} ({selectedVehicle.driverPhone || 'Standby'})
                  </span>
                </div>
              </div>

              {/* Metrics grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 rounded-lg p-2">
                  <span className="text-[10px] text-slate-500 block">Kecepatan</span>
                  <span className="text-xs font-bold font-mono text-slate-900">
                    {selectedVehicle.location.speed} km/h
                  </span>
                </div>

                <div className="bg-slate-50 rounded-lg p-2">
                  <span className="text-[10px] text-slate-500 block">Sisa BBM</span>
                  <span className="text-xs font-bold font-mono text-slate-900">
                    {selectedVehicle.currentFuelLevel} / {selectedVehicle.tankCapacity}L
                  </span>
                </div>

                <div className="bg-slate-50 rounded-lg p-2">
                  <span className="text-[10px] text-slate-500 block">Odometer</span>
                  <span className="text-xs font-bold font-mono text-slate-900">
                    {selectedVehicle.currentOdometer.toLocaleString('id-ID')} km
                  </span>
                </div>
              </div>

              {/* Fuel Level Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>Level Tangki BBM</span>
                  <span>{Math.round((selectedVehicle.currentFuelLevel / selectedVehicle.tankCapacity) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      (selectedVehicle.currentFuelLevel / selectedVehicle.tankCapacity) > 0.35
                        ? 'bg-blue-600'
                        : 'bg-amber-500'
                    }`}
                    style={{
                      width: `${(selectedVehicle.currentFuelLevel / selectedVehicle.tankCapacity) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
