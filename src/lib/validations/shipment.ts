import { z } from 'zod';

// Shipment validation schema
export const shipmentSchema = z.object({
  userId: z.string().min(1, 'User assignment is required'),
  vehicleType: z.string().min(1, 'Vehicle type is required'),
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.string().optional().refine(
    (val) => !val || (parseInt(val) >= 1900 && parseInt(val) <= new Date().getFullYear() + 1),
    { message: 'Please enter a valid year between 1900 and ' + (new Date().getFullYear() + 1) }
  ),
  vehicleVIN: z.string().optional().refine(
    (val) => !val || val.length >= 17,
    { message: 'VIN must be at least 17 characters' }
  ),
  vehicleColor: z.string().optional(),
  lotNumber: z.string().optional(),
  auctionName: z.string().optional(),
  origin: z.string().optional(), // Made optional - will be validated conditionally
  destination: z.string().optional(), // Made optional - will be validated conditionally
  weight: z.string().optional().refine(
    (val) => !val || (parseFloat(val) > 0 && parseFloat(val) <= 50000),
    { message: 'Weight must be between 0 and 50,000 lbs' }
  ),
  dimensions: z.string().optional().refine(
    (val) => !val || val.length <= 100,
    { message: 'Dimensions cannot exceed 100 characters' }
  ),
  specialInstructions: z.string().optional().refine(
    (val) => !val || val.length <= 1000,
    { message: 'Special instructions cannot exceed 1000 characters' }
  ),
  insuranceValue: z.string().optional().refine(
    (val) => !val || (parseFloat(val) > 0),
    { message: 'Insurance value must be greater than 0' }
  ),
  price: z.string().optional().refine(
    (val) => !val || (parseFloat(val) > 0),
    { message: 'Price must be greater than 0' }
  ),
  containerPhotos: z.array(z.string()).default([]),
  trackingNumber: z.string().optional(),
  // New fields
  hasKey: z.boolean().optional(),
  hasTitle: z.boolean().optional(),
  titleStatus: z.enum(['PENDING', 'DELIVERED']).optional(),
});

export const shipmentUpdateSchema = z.object({
  vehicleType: z.string().min(1, 'Vehicle type is required').optional(),
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.string().optional().refine(
    (val) => !val || (parseInt(val) >= 1900 && parseInt(val) <= new Date().getFullYear() + 1),
    { message: 'Please enter a valid year between 1900 and ' + (new Date().getFullYear() + 1) }
  ),
  vehicleVIN: z.string().optional().refine(
    (val) => !val || val.length >= 17,
    { message: 'VIN must be at least 17 characters' }
  ),
  vehicleColor: z.string().optional(),
  lotNumber: z.string().optional(),
  auctionName: z.string().optional(),
  origin: z.string().min(3, 'Origin must be at least 3 characters').optional(),
  destination: z.string().min(3, 'Destination must be at least 3 characters').optional(),
  status: z.string().min(1, 'Status is required').optional(),
  currentLocation: z.string().optional(),
  estimatedDelivery: z.string().optional(),
  progress: z.string().optional().refine(
    (val) => !val || (parseInt(val) >= 0 && parseInt(val) <= 100),
    { message: 'Progress must be between 0 and 100' }
  ),
  weight: z.string().optional().refine(
    (val) => !val || (parseFloat(val) > 0 && parseFloat(val) <= 50000),
    { message: 'Weight must be between 0 and 50,000 lbs' }
  ),
  dimensions: z.string().optional().refine(
    (val) => !val || val.length <= 100,
    { message: 'Dimensions cannot exceed 100 characters' }
  ),
  specialInstructions: z.string().optional().refine(
    (val) => !val || val.length <= 1000,
    { message: 'Special instructions cannot exceed 1000 characters' }
  ),
  insuranceValue: z.string().optional().refine(
    (val) => !val || (parseFloat(val) > 0),
    { message: 'Insurance value must be greater than 0' }
  ),
  price: z.string().optional().refine(
    (val) => !val || (parseFloat(val) > 0),
    { message: 'Price must be greater than 0' }
  ),
});

export type ShipmentFormData = z.input<typeof shipmentSchema>;
export type ShipmentUpdateFormData = z.infer<typeof shipmentUpdateSchema>;

