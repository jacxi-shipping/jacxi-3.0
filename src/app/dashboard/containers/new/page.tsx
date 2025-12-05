'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AdminRoute } from '@/components/auth/AdminRoute';

export default function NewContainerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    containerNumber: '',
    trackingNumber: '',
    vesselName: '',
    voyageNumber: '',
    shippingLine: '',
    bookingNumber: '',
    loadingPort: '',
    destinationPort: '',
    transshipmentPorts: [''],
    loadingDate: '',
    departureDate: '',
    estimatedArrival: '',
    maxCapacity: 4,
    notes: '',
    autoTrackingEnabled: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        transshipmentPorts: formData.transshipmentPorts.filter(p => p.trim()),
      };

      const response = await fetch('/api/containers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Container created successfully!');
        router.push(`/dashboard/containers/${data.container.id}`);
      } else {
        alert(data.error || 'Failed to create container');
      }
    } catch (error) {
      console.error('Error creating container:', error);
      alert('Failed to create container');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: parseInt(e.target.value) || 0,
    }));
  };

  const addTransshipmentPort = () => {
    setFormData(prev => ({
      ...prev,
      transshipmentPorts: [...prev.transshipmentPorts, ''],
    }));
  };

  const removeTransshipmentPort = (index: number) => {
    setFormData(prev => ({
      ...prev,
      transshipmentPorts: prev.transshipmentPorts.filter((_, i) => i !== index),
    }));
  };

  const updateTransshipmentPort = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      transshipmentPorts: prev.transshipmentPorts.map((port, i) => i === index ? value : port),
    }));
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <Button onClick={() => router.push('/dashboard/containers')} className="mb-4">
            ← Back
          </Button>

          <Card>
            <h1 className="text-2xl font-bold mb-6">Create New Container</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Container Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="containerNumber"
                      value={formData.containerNumber}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                      placeholder="ABCU1234567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tracking Number
                    </label>
                    <input
                      type="text"
                      name="trackingNumber"
                      value={formData.trackingNumber}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Booking Number
                    </label>
                    <input
                      type="text"
                      name="bookingNumber"
                      value={formData.bookingNumber}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Max Capacity (vehicles)
                    </label>
                    <input
                      type="number"
                      name="maxCapacity"
                      value={formData.maxCapacity}
                      onChange={handleNumberChange}
                      min="1"
                      max="20"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Details */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Shipping Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Vessel Name
                    </label>
                    <input
                      type="text"
                      name="vesselName"
                      value={formData.vesselName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Voyage Number
                    </label>
                    <input
                      type="text"
                      name="voyageNumber"
                      value={formData.voyageNumber}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Shipping Line
                    </label>
                    <input
                      type="text"
                      name="shippingLine"
                      value={formData.shippingLine}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                      placeholder="e.g., Maersk, MSC, COSCO"
                    />
                  </div>
                </div>
              </div>

              {/* Ports */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Ports</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Loading Port
                    </label>
                    <input
                      type="text"
                      name="loadingPort"
                      value={formData.loadingPort}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Destination Port
                    </label>
                    <input
                      type="text"
                      name="destinationPort"
                      value={formData.destinationPort}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">
                    Transshipment Ports (Optional)
                  </label>
                  {formData.transshipmentPorts.map((port, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={port}
                        onChange={(e) => updateTransshipmentPort(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                        placeholder={`Transshipment port ${index + 1}`}
                      />
                      <Button
                        type="button"
                        onClick={() => removeTransshipmentPort(index)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={addTransshipmentPort}
                    className="mt-2"
                  >
                    + Add Transshipment Port
                  </Button>
                </div>
              </div>

              {/* Dates */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Dates</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Loading Date
                    </label>
                    <input
                      type="date"
                      name="loadingDate"
                      value={formData.loadingDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Departure Date
                    </label>
                    <input
                      type="date"
                      name="departureDate"
                      value={formData.departureDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Estimated Arrival
                    </label>
                    <input
                      type="date"
                      name="estimatedArrival"
                      value={formData.estimatedArrival}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  placeholder="Any additional notes..."
                />
              </div>

              {/* Auto-tracking */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoTrackingEnabled"
                  name="autoTrackingEnabled"
                  checked={formData.autoTrackingEnabled}
                  onChange={(e) => setFormData(prev => ({ ...prev, autoTrackingEnabled: e.target.checked }))}
                  className="h-4 w-4"
                />
                <label htmlFor="autoTrackingEnabled" className="text-sm font-medium">
                  Enable automatic tracking updates
                </label>
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="submit"
                  disabled={loading || !formData.containerNumber}
                  className="flex-1"
                >
                  {loading ? 'Creating...' : 'Create Container'}
                </Button>
                <Button
                  type="button"
                  onClick={() => router.push('/dashboard/containers')}
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </AdminRoute>
  );
}
