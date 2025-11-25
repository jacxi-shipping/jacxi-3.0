'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Section from '@/components/layout/Section';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Download,
  Image as ImageIcon,
  MapPin,
  PackageCheck,
  PenLine,
  Trash2,
  Upload,
  Wallet,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

interface ShipmentEvent {
  id: string;
  status: string;
  location: string;
  timestamp: string;
  description: string | null;
  completed: boolean;
}

interface Shipment {
  id: string;
  trackingNumber: string;
  userId: string;
  vehicleType: string;
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehicleYear: number | null;
  vehicleVIN: string | null;
  origin: string;
  destination: string;
  status: string;
  currentLocation: string | null;
  estimatedDelivery: string | null;
  actualDelivery: string | null;
  progress: number;
  price: number | null;
  weight: number | null;
  dimensions: string | null;
  specialInstructions: string | null;
  insuranceValue: number | null;
  containerPhotos: string[];
  arrivalPhotos: string[];
  hasKey: boolean | null;
  hasTitle: boolean | null;
  titleStatus: string | null;
  vehicleAge: number | null;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string | null;
    email: string;
    phone: string | null;
  };
  events: ShipmentEvent[];
}

const statusColors: Record<string, { text: string; bg: string; ring: string }> = {
  PENDING: { text: 'text-sky-300', bg: 'bg-sky-500/10', ring: 'ring-sky-500/30' },
  QUOTE_REQUESTED: { text: 'text-sky-300', bg: 'bg-sky-500/10', ring: 'ring-sky-500/30' },
  QUOTE_APPROVED: { text: 'text-green-300', bg: 'bg-green-500/10', ring: 'ring-green-500/30' },
  PICKUP_SCHEDULED: { text: 'text-blue-300', bg: 'bg-blue-500/10', ring: 'ring-blue-500/30' },
  PICKUP_COMPLETED: { text: 'text-emerald-300', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/30' },
  IN_TRANSIT: { text: 'text-cyan-300', bg: 'bg-cyan-500/10', ring: 'ring-cyan-500/30' },
  AT_PORT: { text: 'text-purple-300', bg: 'bg-purple-500/10', ring: 'ring-purple-500/30' },
  LOADED_ON_VESSEL: { text: 'text-indigo-300', bg: 'bg-indigo-500/10', ring: 'ring-indigo-500/30' },
  IN_TRANSIT_OCEAN: { text: 'text-blue-200', bg: 'bg-blue-500/10', ring: 'ring-blue-500/30' },
  ARRIVED_AT_DESTINATION: { text: 'text-teal-300', bg: 'bg-teal-500/10', ring: 'ring-teal-500/30' },
  CUSTOMS_CLEARANCE: { text: 'text-amber-300', bg: 'bg-amber-500/10', ring: 'ring-amber-500/30' },
  OUT_FOR_DELIVERY: { text: 'text-lime-300', bg: 'bg-lime-500/10', ring: 'ring-lime-500/30' },
  DELIVERED: { text: 'text-emerald-300', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/30' },
  CANCELLED: { text: 'text-red-300', bg: 'bg-red-500/10', ring: 'ring-red-500/30' },
  ON_HOLD: { text: 'text-orange-300', bg: 'bg-orange-500/10', ring: 'ring-orange-500/30' },
};

export default function ShipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [arrivalPhotos, setArrivalPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showArrivalUpload, setShowArrivalUpload] = useState(false);
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number; title: string } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [downloading, setDownloading] = useState(false);

  const fetchShipment = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/shipments/${params.id}`);
      const data = await response.json();

      if (response.ok) {
        setShipment(data.shipment);
        setArrivalPhotos(data.shipment.arrivalPhotos || []);
      } else {
        setError(data.message || 'Failed to load shipment');
      }
    } catch (error) {
      console.error('Error fetching shipment:', error);
      setError('An error occurred while loading the shipment');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    void fetchShipment();
  }, [fetchShipment]);

  useEffect(() => {
    if (lightbox) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!lightbox) return;
      if (event.key === 'Escape') {
        setLightbox(null);
      }
      if (event.key === 'ArrowLeft') {
        setLightbox((prev) => {
          if (!prev) return prev;
          const nextIndex = (prev.index - 1 + prev.images.length) % prev.images.length;
          return { ...prev, index: nextIndex };
        });
      }
      if (event.key === 'ArrowRight') {
        setLightbox((prev) => {
          if (!prev) return prev;
          const nextIndex = (prev.index + 1) % prev.images.length;
          return { ...prev, index: nextIndex };
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightbox]);

  const openLightbox = (images: string[], index: number, title: string) => {
    if (!images.length) return;
    setLightbox({ images, index, title });
    setZoomLevel(1); // Reset zoom when opening
  };

  const downloadPhoto = async (url: string, filename: string) => {
    try {
      setDownloading(true);
      const response = await fetch(`/api/photos/download?url=${encodeURIComponent(url)}`);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading photo:', error);
      alert('Failed to download photo');
    } finally {
      setDownloading(false);
    }
  };

  const downloadAllPhotos = async (images: string[], title: string) => {
    try {
      setDownloading(true);
      const response = await fetch('/api/photos/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          photos: images,
          filename: `${title.replace(/\s+/g, '-')}-${shipment?.trackingNumber || 'photos'}`
        }),
      });
      
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${title.replace(/\s+/g, '-')}-${shipment?.trackingNumber || 'photos'}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading photos:', error);
      alert('Failed to download photos');
    } finally {
      setDownloading(false);
    }
  };

  const goPrevious = () => {
    setLightbox((prev) => {
      if (!prev || prev.images.length <= 1) return prev;
      const nextIndex = (prev.index - 1 + prev.images.length) % prev.images.length;
      setZoomLevel(1); // Reset zoom on navigation
      return { ...prev, index: nextIndex };
    });
  };

  const goNext = () => {
    setLightbox((prev) => {
      if (!prev || prev.images.length <= 1) return prev;
      const nextIndex = (prev.index + 1) % prev.images.length;
      setZoomLevel(1); // Reset zoom on navigation
      return { ...prev, index: nextIndex };
    });
  };

  const zoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const zoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));

  // Keyboard navigation for photo viewer
  useEffect(() => {
    if (!lightbox) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setLightbox(null);
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        zoomIn();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        zoomOut();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this shipment?')) {
      return;
    }

    try {
      const response = await fetch(`/api/shipments/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/dashboard/shipments');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete shipment');
      }
    } catch (error) {
      console.error('Error deleting shipment:', error);
      alert('An error occurred while deleting the shipment');
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleArrivalPhotoUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        const newPhotos = [...arrivalPhotos, result.url];
        setArrivalPhotos(newPhotos);
        return result.url;
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      const message = error instanceof Error ? error.message : 'Failed to upload image';
      alert(message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const uploadedUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const url = await handleArrivalPhotoUpload(files[i]);
      if (url) uploadedUrls.push(url);
    }

    // Save to shipment
    if (uploadedUrls.length > 0) {
      try {
        const response = await fetch(`/api/shipments/${params.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            arrivalPhotos: uploadedUrls,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setShipment(data.shipment);
          setArrivalPhotos(data.shipment.arrivalPhotos || []);
          setShowArrivalUpload(false);
        } else {
          const error = await response.json();
          alert(error.message || 'Failed to save arrival photos');
        }
      } catch (error) {
        console.error('Error saving arrival photos:', error);
        alert('An error occurred while saving arrival photos');
      }
    }

    // Reset input
    e.target.value = '';
  };

  const removeArrivalPhoto = async (index: number) => {
    const newPhotos = arrivalPhotos.filter((_, i) => i !== index);
    setArrivalPhotos(newPhotos);

    try {
      const response = await fetch(`/api/shipments/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          arrivalPhotos: newPhotos,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setShipment(data.shipment);
      } else {
        // Revert on error
        setArrivalPhotos(arrivalPhotos);
        const error = await response.json();
        alert(error.message || 'Failed to remove photo');
      }
    } catch (error) {
      // Revert on error
      setArrivalPhotos(arrivalPhotos);
      console.error('Error removing photo:', error);
      alert('An error occurred while removing photo');
    }
  };

  const canUploadArrivalPhotos = session?.user?.role === 'admin' && 
    (shipment?.status === 'ARRIVED_AT_DESTINATION' || 
     shipment?.status === 'AT_PORT' || 
     shipment?.status === 'CUSTOMS_CLEARANCE' ||
     shipment?.status === 'OUT_FOR_DELIVERY');

  const statusStyles = useMemo(() => statusColors, []);
  const isAdmin = session?.user?.role === 'admin';

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
          <div className="text-center space-y-4 text-[var(--text-secondary)]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--border)] border-t-[var(--accent-gold)]" />
            <p>Loading shipment details...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !shipment) {
    return (
      <ProtectedRoute>
        <Section className="bg-[var(--background)] min-h-screen flex items-center justify-center">
          <div className="max-w-md text-center space-y-4">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Shipment unavailable</h2>
            <p className="text-[var(--text-secondary)]">{error || 'We could not find this shipment. It may have been removed or does not exist.'}</p>
            <Link href="/dashboard/shipments">
              <Button className="bg-[var(--accent-gold)] text-[var(--background)] hover:bg-[var(--accent-gold)]">Back to Shipments</Button>
            </Link>
          </div>
        </Section>
      </ProtectedRoute>
    );
  }

  const statusStyle = statusStyles[shipment.status] || {
    text: 'text-[var(--text-primary)]',
    bg: 'bg-[rgba(var(--panel-rgb),0.55)]',
    ring: 'ring-white/20',
  };

  return (
    <ProtectedRoute>
      <div className="light-surface min-h-screen bg-[var(--background)]">
        <div className="relative">
          <Section className="pb-4 pt-4 sm:pt-6">
            <div className="flex flex-col gap-4 sm:gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                  <Link href="/dashboard/shipments">
                    <Button variant="outline" size="sm" className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 flex-shrink-0 text-xs sm:text-sm">
                      <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Back
                    </Button>
                  </Link>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-lg sm:text-2xl md:text-3xl font-semibold text-[var(--text-primary)] truncate">Shipment {shipment.trackingNumber}</h1>
                    <p className="text-[var(--text-secondary)] text-xs sm:text-sm line-clamp-1">
                      Detailed view of the shipment lifecycle, financials, and media.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
                  {isAdmin && (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleDelete}
                        className="border-red-500/40 text-red-300 hover:bg-red-500/10 flex-1 sm:flex-initial text-xs sm:text-sm"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Delete
                      </Button>
                      <Link href={`/dashboard/shipments/${shipment.id}/edit`} className="flex-1 sm:flex-initial">
                        <Button className="bg-[var(--accent-gold)] text-[var(--background)] hover:bg-[var(--accent-gold)] w-full text-xs sm:text-sm">
                          <PenLine className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          Edit Shipment
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="lg:col-span-2 space-y-4 sm:space-y-6"
                >
                  <Card className="relative border-cyan-500/10 bg-[rgba(var(--panel-rgb),0.45)] backdrop-blur-sm">
                    <CardHeader className="space-y-2 sm:space-y-3 p-4 sm:p-6">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wide ring-1 flex-shrink-0',
                            statusStyle.text,
                            statusStyle.bg,
                            statusStyle.ring,
                          )}
                        >
                          {formatStatus(shipment.status)}
                        </span>
                        {shipment.progress > 0 && (
                          <span className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
                            Progress <span className="text-[var(--text-primary)] font-semibold">{shipment.progress}%</span>
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-[var(--text-primary)] text-base sm:text-lg md:text-xl">Current Status</CardTitle>
                      <p className="text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-2">
                        Monitor the latest milestone and location updates for this shipment.
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-5 p-4 sm:p-6">
                      <div className="h-1.5 sm:h-2 w-full overflow-hidden rounded-full bg-[rgba(var(--panel-rgb),0.55)]">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-[var(--accent-gold)] transition-all duration-500"
                          style={{ width: `${Math.max(Math.min(shipment.progress || 0, 100), 0)}%` }}
                        />
                      </div>
                      {shipment.currentLocation && (
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--text-secondary)]">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-300 flex-shrink-0" />
                          <span className="min-w-0">Currently located at <span className="text-[var(--text-primary)] truncate inline-block max-w-[150px] sm:max-w-none align-bottom">{shipment.currentLocation}</span></span>
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-[var(--text-secondary)]">
                        <div className="min-w-0">
                          <p className="uppercase text-[10px] sm:text-xs tracking-wide text-[var(--text-secondary)]">Origin</p>
                          <p className="text-[var(--text-primary)] truncate">{shipment.origin}</p>
                        </div>
                        <div className="min-w-0">
                          <p className="uppercase text-[10px] sm:text-xs tracking-wide text-[var(--text-secondary)]">Destination</p>
                          <p className="text-[var(--text-primary)] truncate">{shipment.destination}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Vehicle Details */}
                  <Card className="border-[var(--border)] bg-[rgba(var(--panel-rgb),0.45)] backdrop-blur-sm">
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="text-[var(--text-primary)] text-base sm:text-lg">Vehicle Details</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="min-w-0">
                          <dt className="text-[10px] sm:text-xs uppercase tracking-wide text-[var(--text-secondary)]">Vehicle Type</dt>
                          <dd className="mt-1 text-xs sm:text-sm text-[var(--text-primary)] capitalize truncate">{shipment.vehicleType}</dd>
                        </div>
                        {shipment.vehicleMake && (
                          <div className="min-w-0">
                            <dt className="text-[10px] sm:text-xs uppercase tracking-wide text-[var(--text-secondary)]">Make</dt>
                            <dd className="mt-1 text-xs sm:text-sm text-[var(--text-primary)] truncate">{shipment.vehicleMake}</dd>
                          </div>
                        )}
                        {shipment.vehicleModel && (
                          <div className="min-w-0">
                            <dt className="text-[10px] sm:text-xs uppercase tracking-wide text-[var(--text-secondary)]">Model</dt>
                            <dd className="mt-1 text-xs sm:text-sm text-[var(--text-primary)] truncate">{shipment.vehicleModel}</dd>
                          </div>
                        )}
                        {shipment.vehicleYear && (
                          <div className="min-w-0">
                            <dt className="text-[10px] sm:text-xs uppercase tracking-wide text-[var(--text-secondary)]">Year</dt>
                            <dd className="mt-1 text-xs sm:text-sm text-[var(--text-primary)]">{shipment.vehicleYear}</dd>
                          </div>
                        )}
                        {shipment.vehicleVIN && (
                          <div className="sm:col-span-2 min-w-0">
                            <dt className="text-[10px] sm:text-xs uppercase tracking-wide text-[var(--text-secondary)]">VIN Number</dt>
                            <dd className="mt-1 text-xs sm:text-sm text-[var(--text-primary)] font-mono break-all">{shipment.vehicleVIN}</dd>
                          </div>
                        )}
                      </dl>
                    </CardContent>
                  </Card>

                  {/* Vehicle Details */}
                  <Card className="border-[var(--border)] bg-[rgba(var(--panel-rgb),0.45)] backdrop-blur-sm">
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="text-[var(--text-primary)] text-base sm:text-lg">Vehicle Details</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm text-[var(--text-secondary)]">
                        <div className="min-w-0">
                          <dt className="text-[10px] sm:text-xs uppercase tracking-wide text-[var(--text-secondary)]">Has Key</dt>
                          <dd className="mt-1 text-[var(--text-primary)]">
                            {shipment.hasKey === true ? (
                              <span className="inline-flex items-center gap-1 text-green-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Yes
                              </span>
                            ) : shipment.hasKey === false ? (
                              <span className="inline-flex items-center gap-1 text-red-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                No
                              </span>
                            ) : (
                              <span className="text-[var(--text-secondary)]">Not specified</span>
                            )}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Has Title</dt>
                          <dd className="mt-1 text-[var(--text-primary)]">
                            {shipment.hasTitle === true ? (
                              <span className="inline-flex items-center gap-1 text-green-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Yes
                              </span>
                            ) : shipment.hasTitle === false ? (
                              <span className="inline-flex items-center gap-1 text-red-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                No
                              </span>
                            ) : (
                              <span className="text-[var(--text-secondary)]">Not specified</span>
                            )}
                          </dd>
                        </div>
                        {shipment.hasTitle && shipment.titleStatus && (
                          <div>
                            <dt className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Title Status</dt>
                            <dd className="mt-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  shipment.titleStatus === 'DELIVERED' 
                                    ? 'bg-green-500/20 text-green-400' 
                                    : 'bg-sky-500/20 text-sky-300'
                                }`}>
                                {shipment.titleStatus === 'DELIVERED' ? 'Delivered' : 'Pending'}
                              </span>
                            </dd>
                          </div>
                        )}
                        {shipment.vehicleAge !== null && shipment.vehicleAge !== undefined && (
                          <div>
                            <dt className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Vehicle Age</dt>
                            <dd className="mt-1 text-[var(--text-primary)]">
                              <span className="text-cyan-400 font-semibold">{shipment.vehicleAge}</span> {shipment.vehicleAge === 1 ? 'year' : 'years'}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </CardContent>
                  </Card>

                  {/* Shipping Route */}
                  <Card className="border-[var(--border)] bg-[rgba(var(--panel-rgb),0.45)] backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-[var(--text-primary)] text-lg">Shipping Route</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[var(--text-secondary)]">
                        <div>
                          <dt className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Origin</dt>
                          <dd className="mt-1 text-[var(--text-primary)]">{shipment.origin}</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Destination</dt>
                          <dd className="mt-1 text-[var(--text-primary)]">{shipment.destination}</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Weight</dt>
                          <dd className="mt-1 text-[var(--text-primary)]">{shipment.weight ? `${shipment.weight} lbs` : '-'}</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Dimensions</dt>
                          <dd className="mt-1 text-[var(--text-primary)]">{shipment.dimensions || '-'}</dd>
                        </div>
                      </dl>
                      {shipment.specialInstructions && (
                        <div className="mt-4 rounded-lg border border-[var(--border)] bg-[rgba(var(--panel-rgb),0.4)] p-4 text-sm text-[var(--text-primary)]">
                          <p className="text-xs uppercase tracking-wide text-[var(--text-secondary)] mb-2">Special Instructions</p>
                          <p>{shipment.specialInstructions}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-[var(--border)] bg-[rgba(var(--panel-rgb),0.45)] backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-[var(--text-primary)] text-lg">Tracking Timeline</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {shipment.events.length === 0 ? (
                        <p className="rounded-lg border border-[var(--border)] bg-[rgba(var(--panel-rgb),0.4)] py-8 text-center text-sm text-[var(--text-secondary)]">
                          No tracking events yet.
                        </p>
                      ) : (
                        <div className="relative pl-6">
                          <span className="absolute left-2 top-0 h-full w-0.5 bg-gradient-to-b from-cyan-400/40 via-cyan-400/20 to-transparent" />
                          <ul className="space-y-6">
                            {shipment.events.map((event, index) => (
                              <motion.li
                                key={event.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                className="relative"
                              >
                                <div className="absolute -left-6 top-1 flex h-8 w-8 items-center justify-center">
                                  <span
                                    className={cn(
                                      'flex h-3 w-3 items-center justify-center rounded-full border-2 text-xs font-bold text-[var(--text-primary)]',
                                      event.completed ? 'border-cyan-400 bg-cyan-400' : 'border-[var(--border)] bg-[rgba(var(--panel-rgb),0.55)]',
                                    )}
                                  >
                                    {shipment.events.length - index}
                                  </span>
                                </div>
                                <div className="rounded-lg border border-[var(--border)] bg-[rgba(var(--panel-rgb),0.4)] p-4">
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                                    <p className={cn('text-sm font-semibold text-[var(--text-primary)]', event.completed ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]')}>
                                      {formatStatus(event.status)}
                                    </p>
                                    <p className="text-xs text-[var(--text-secondary)]">
                                      {new Date(event.timestamp).toLocaleString()}
                                    </p>
                                  </div>
                                  <p className="text-sm text-[var(--text-secondary)]">{event.location}</p>
                                  {event.description && (
                                    <p className="mt-2 text-sm text-[var(--text-secondary)]">{event.description}</p>
                                  )}
                                </div>
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {shipment.containerPhotos?.length > 0 && (
                    <Card className="border-[var(--border)] bg-[rgba(var(--panel-rgb),0.45)] backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-[var(--text-primary)] text-lg">
                          <PackageCheck className="h-5 w-5 text-cyan-300" />
                          Container Photos
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {shipment.containerPhotos.map((photo, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => openLightbox(shipment.containerPhotos, index, 'Container Photos')}
                              className="relative aspect-square overflow-hidden rounded-lg border border-[var(--border)] bg-black/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                            >
                              <Image
                                src={photo}
                                alt={`Container photo ${index + 1}`}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="border-[var(--border)] bg-[rgba(var(--panel-rgb),0.45)] backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center justify-between gap-3">
                        <CardTitle className="flex items-center gap-2 text-[var(--text-primary)] text-lg">
                          <ImageIcon className="h-5 w-5 text-cyan-300" />
                          Arrival Photos
                        </CardTitle>
                        {canUploadArrivalPhotos && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowArrivalUpload((prev) => !prev)}
                            className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {showArrivalUpload ? 'Cancel' : 'Upload Photos'}
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {showArrivalUpload && canUploadArrivalPhotos && (
                        <label
                          htmlFor="arrival-photos"
                          className="relative flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-cyan-500/40 bg-[rgba(var(--panel-rgb),0.4)] hover:border-cyan-500/60 hover:bg-[rgba(var(--panel-rgb),0.55)] transition-all"
                        >
                          <input
                            id="arrival-photos"
                            type="file"
                            multiple
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handleFileSelect}
                            className="hidden"
                            disabled={uploading}
                          />
                          <div className="flex flex-col items-center justify-center gap-2">
                            {uploading ? (
                              <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-400 border-t-transparent" />
                            ) : (
                              <Upload className="h-8 w-8 text-cyan-300" />
                            )}
                            <p className="text-sm text-[var(--text-secondary)]">
                              <span className="text-cyan-300 font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-[var(--text-secondary)]">PNG, JPG, JPEG, WEBP (MAX. 5MB per file)</p>
                          </div>
                        </label>
                      )}

                      {arrivalPhotos.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {arrivalPhotos.map((photo, index) => (
                            <motion.button
                              key={index}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2, delay: index * 0.05 }}
                              type="button"
                              className="relative group aspect-square overflow-hidden rounded-lg border border-[var(--border)] bg-black/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                              onClick={() => openLightbox(arrivalPhotos, index, 'Arrival Photos')}
                            >
                              <Image
                                src={photo}
                                alt={`Arrival photo ${index + 1}`}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                              {canUploadArrivalPhotos && (
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    removeArrivalPhoto(index);
                                  }}
                                  className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500/80 text-[var(--text-primary)] opacity-0 transition-opacity group-hover:opacity-100"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              )}
                            </motion.button>
                          ))}
                        </div>
                      ) : (
                        <p className="rounded-lg border border-[var(--border)] bg-[rgba(var(--panel-rgb),0.4)] py-8 text-center text-sm text-[var(--text-secondary)]">
                          {canUploadArrivalPhotos
                            ? 'No arrival photos uploaded yet. Upload photos when the container arrives.'
                            : 'No arrival photos available.'}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="space-y-6"
                >
                  <Card className="border-[var(--border)] bg-[rgba(var(--panel-rgb),0.45)] backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-[var(--text-primary)] text-lg">
                        <Wallet className="h-5 w-5 text-cyan-300" />
                        Financial Snapshot
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-[var(--text-secondary)]">
                      {shipment.price && (
                        <div className="rounded-lg border border-[var(--border)] bg-[rgba(var(--panel-rgb),0.4)] p-4">
                          <p className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Total Price</p>
                          <p className="text-2xl font-semibold text-[var(--text-primary)]">${shipment.price.toFixed(2)}</p>
                        </div>
                      )}
                      {shipment.insuranceValue && (
                        <div className="rounded-lg border border-[var(--border)] bg-[rgba(var(--panel-rgb),0.4)] p-4">
                          <p className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Insurance Value</p>
                          <p className="text-lg font-semibold text-[var(--text-primary)]">${shipment.insuranceValue.toFixed(2)}</p>
                        </div>
                      )}
                      <div className="rounded-lg border border-[var(--border)] bg-[rgba(var(--panel-rgb),0.4)] p-4">
                        <p className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Created On</p>
                        <p className="text-sm text-[var(--text-primary)]">{new Date(shipment.createdAt).toLocaleDateString()}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-[var(--border)] bg-[rgba(var(--panel-rgb),0.45)] backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-[var(--text-primary)] text-lg">
                        <CalendarCheck className="h-5 w-5 text-cyan-300" />
                        Delivery Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-[var(--text-secondary)]">
                      {shipment.estimatedDelivery && (
                        <div className="rounded-lg border border-[var(--border)] bg-[rgba(var(--panel-rgb),0.4)] p-4">
                          <p className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Estimated Delivery</p>
                          <p className="text-sm text-[var(--text-primary)]">{new Date(shipment.estimatedDelivery).toLocaleDateString()}</p>
                        </div>
                      )}
                      {shipment.actualDelivery && (
                        <div className="rounded-lg border border-[var(--border)] bg-[rgba(var(--panel-rgb),0.4)] p-4">
                          <p className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Actual Delivery</p>
                          <p className="text-sm text-[var(--text-primary)]">{new Date(shipment.actualDelivery).toLocaleDateString()}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {isAdmin && (
                    <Card className="border-[var(--border)] bg-[rgba(var(--panel-rgb),0.45)] backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-[var(--text-primary)] text-lg">Customer Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm text-[var(--text-secondary)]">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Name</p>
                          <p className="text-sm text-[var(--text-primary)]">{shipment.user.name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Email</p>
                          <p className="text-sm text-[var(--text-primary)]">{shipment.user.email}</p>
                        </div>
                        {shipment.user.phone && (
                          <div>
                            <p className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Phone</p>
                            <p className="text-sm text-[var(--text-primary)]">{shipment.user.phone}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              </div>
            </div>
          </Section>
        </div>
      </div>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl"
            onClick={(event) => {
              if (event.currentTarget === event.target) {
                setLightbox(null);
              }
            }}
          >
            {/* Header Bar */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center justify-between p-4 sm:p-6">
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">{lightbox.title}</p>
                  <p className="text-lg font-bold text-[var(--text-primary)] mt-1">
                    Photo {lightbox.index + 1} <span className="text-[var(--text-secondary)]">of {lightbox.images.length}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setLightbox(null)}
                  className="rounded-full bg-[rgba(var(--panel-rgb),0.55)] hover:bg-[rgba(var(--panel-rgb),0.65)] backdrop-blur-sm text-[var(--text-primary)] p-2.5 transition-all duration-200 hover:scale-110"
                  aria-label="Close gallery"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Bottom Control Bar */}
            <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center justify-between gap-4 p-4 sm:p-6">
                {/* Zoom Controls */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={zoomOut}
                    disabled={zoomLevel <= 0.5}
                    className="rounded-lg bg-[rgba(var(--panel-rgb),0.55)] hover:bg-[rgba(var(--panel-rgb),0.65)] disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm text-[var(--text-primary)] p-2 transition-all duration-200"
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-medium text-[var(--text-primary)] min-w-[60px] text-center">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={zoomIn}
                    disabled={zoomLevel >= 3}
                    className="rounded-lg bg-[rgba(var(--panel-rgb),0.55)] hover:bg-[rgba(var(--panel-rgb),0.65)] disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm text-[var(--text-primary)] p-2 transition-all duration-200"
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                </div>

                {/* Download Buttons */}
                <div className="flex items-center gap-2">
                  {lightbox.images.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadAllPhotos(lightbox.images, lightbox.title)}
                      disabled={downloading}
                      className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 backdrop-blur-sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {downloading ? 'Downloading...' : `All (${lightbox.images.length})`}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadPhoto(
                      lightbox.images[lightbox.index],
                      `${lightbox.title.replace(/\s+/g, '-')}-${lightbox.index + 1}.jpg`
                    )}
                    disabled={downloading}
                    className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 backdrop-blur-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {downloading ? 'Downloading...' : 'Current'}
                  </Button>
                </div>
              </div>

              {/* Thumbnail Strip */}
              {lightbox.images.length > 1 && (
                <div className="px-4 sm:px-6 pb-4">
                  <div className="flex gap-2 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                    {lightbox.images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setLightbox({ ...lightbox, index: idx });
                          setZoomLevel(1);
                        }}
                        className={cn(
                          'relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200',
                          idx === lightbox.index
                            ? 'border-cyan-500 ring-2 ring-cyan-500/50 scale-110'
                            : 'border-[var(--border)] hover:border-[var(--border)] opacity-60 hover:opacity-100'
                        )}
                      >
                        <Image
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Main Image Container */}
            <div className="absolute inset-0 flex items-center justify-center px-4 py-24 sm:px-20">
              <div className="relative w-full h-full max-w-7xl flex items-center justify-center group">
                {/* Navigation Arrows - Positioned at photo edges */}
                {lightbox.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={goPrevious}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-6 z-20 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md border-2 border-[var(--border)] hover:border-cyan-400/70 text-[var(--text-primary)] p-2.5 sm:p-4 transition-all duration-300 hover:scale-110 shadow-2xl sm:opacity-0 sm:group-hover:opacity-100"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="w-5 h-5 sm:w-8 sm:h-8" />
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-6 z-20 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md border-2 border-[var(--border)] hover:border-cyan-400/70 text-[var(--text-primary)] p-2.5 sm:p-4 transition-all duration-300 hover:scale-110 shadow-2xl sm:opacity-0 sm:group-hover:opacity-100"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="w-5 h-5 sm:w-8 sm:h-8" />
                    </button>
                  </>
                )}

                {/* Image with proper aspect ratio */}
                <motion.div
                  animate={{ scale: zoomLevel }}
                  transition={{ duration: 0.2 }}
                  className="relative w-full h-full flex items-center justify-center"
                  style={{ 
                    cursor: zoomLevel > 1 ? 'grab' : 'default'
                  }}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={lightbox.images[lightbox.index]}
                      alt={`${lightbox.title} ${lightbox.index + 1}`}
                      fill
                      className="object-contain"
                      unoptimized
                      priority
                    />
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </ProtectedRoute>
    );
  }

