"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Eye, Edit, ArrowRight, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ShipmentRowProps {
	id: string;
	trackingNumber: string;
	vehicleType: string;
	vehicleMake: string | null;
	vehicleModel: string | null;
	origin: string;
	destination: string;
	status: string;
	progress: number;
	estimatedDelivery: string | null;
	createdAt: string;
	paymentStatus?: string;
	user?: {
		name: string | null;
		email: string;
	};
	showCustomer?: boolean;
	isAdmin?: boolean;
	onStatusUpdated?: () => void;
	delay?: number;
}

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
	PENDING: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30' },
	QUOTE_REQUESTED: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
	QUOTE_APPROVED: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
	PICKUP_SCHEDULED: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
	PICKUP_COMPLETED: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
	IN_TRANSIT: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
	AT_PORT: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
	LOADED_ON_VESSEL: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
	IN_TRANSIT_OCEAN: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30' },
	ARRIVED_AT_DESTINATION: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/30' },
	CUSTOMS_CLEARANCE: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
	OUT_FOR_DELIVERY: { bg: 'bg-lime-500/10', text: 'text-lime-400', border: 'border-lime-500/30' },
	DELIVERED: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
	CANCELLED: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
	ON_HOLD: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
};

const formatStatus = (status: string) => {
	return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
};

const paymentStatusColors: Record<string, { bg: string; text: string; border: string }> = {
	PENDING: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
	COMPLETED: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
	FAILED: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
	REFUNDED: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
	CANCELLED: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30' },
};

export default function ShipmentRow({
	id,
	trackingNumber,
	vehicleType,
	vehicleMake,
	vehicleModel,
	origin,
	destination,
	status,
	progress,
	estimatedDelivery,
	createdAt,
	paymentStatus,
	user,
	showCustomer = false,
	delay = 0,
}: ShipmentRowProps) {
	const statusConfig = statusColors[status] || statusColors.PENDING;
	const paymentConfig = paymentStatus ? (paymentStatusColors[paymentStatus] || paymentStatusColors.PENDING) : null;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay }}
			whileHover={{ y: -2 }}
			className="group relative rounded-xl bg-[#0a1628]/50 backdrop-blur-sm border border-cyan-500/30 p-6 sm:p-8 hover:border-cyan-500/60 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
		>
			{/* Glowing border effect on hover */}
			<div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

			<div className="relative z-10 space-y-4">
				{/* Header Row */}
				<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
					<div className="flex-1">
						<div className="flex items-center gap-3 mb-2 flex-wrap">
							<h3 className="text-lg sm:text-xl font-bold text-white">
								{trackingNumber}
							</h3>
							<span className={cn(
								'px-3 py-1 text-xs font-medium rounded-full border',
								statusConfig.bg,
								statusConfig.text,
								statusConfig.border
							)}>
								{formatStatus(status)}
							</span>
							{paymentStatus && paymentConfig && (
								<span className={cn(
									'px-3 py-1 text-xs font-medium rounded-full border flex items-center gap-1',
									paymentConfig.bg,
									paymentConfig.text,
									paymentConfig.border
								)}>
									<CreditCard className="w-3 h-3" />
									{formatStatus(paymentStatus)}
								</span>
							)}
						</div>
						<p className="text-sm text-white/60">
							Created: {new Date(createdAt).toLocaleDateString()}
						</p>
					</div>

					{/* Actions */}
					<div className="flex items-center gap-2">
						<Link href={`/dashboard/shipments/${id}`}>
							<Button
								variant="outline"
								size="sm"
								className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/50"
							>
								<Eye className="w-4 h-4 mr-2" />
								View
							</Button>
						</Link>
						<Link href={`/dashboard/shipments/${id}/edit`}>
							<Button
								variant="outline"
								size="sm"
								className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/50"
							>
								<Edit className="w-4 h-4 mr-2" />
								Edit
							</Button>
						</Link>
						{/* Status changes now handled automatically via tracking API and in edit page only */}
					</div>
				</div>

				{/* Vehicle Info */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					<div>
						<p className="text-xs text-white/60 mb-1">Vehicle Type</p>
						<p className="text-sm font-medium text-white">{vehicleType}</p>
						{vehicleMake && vehicleModel && (
							<p className="text-sm text-white/70">
								{vehicleMake} {vehicleModel}
							</p>
						)}
					</div>

					<div>
						<p className="text-xs text-white/60 mb-1">Route</p>
						<div className="flex items-center gap-2 text-sm text-white">
							<span className="font-medium">{origin}</span>
							<ArrowRight className="w-4 h-4 text-cyan-400" />
							<span className="font-medium">{destination}</span>
						</div>
					</div>

					<div>
						<p className="text-xs text-white/60 mb-1">Estimated Delivery</p>
						<p className="text-sm font-medium text-white">
							{estimatedDelivery
								? new Date(estimatedDelivery).toLocaleDateString()
								: 'TBD'}
						</p>
					</div>
				</div>

				{/* Customer Info (if admin) */}
				{showCustomer && user && (
					<div className="pt-4 border-t border-white/10">
						<p className="text-xs text-white/60 mb-1">Customer</p>
						<p className="text-sm font-medium text-white">{user.name || 'N/A'}</p>
						<p className="text-sm text-white/70">{user.email}</p>
					</div>
				)}

				{/* Progress Bar */}
				<div className="space-y-2 pt-2">
					<div className="flex items-center justify-between text-sm">
						<span className="text-white/80">Progress</span>
						<span className="text-cyan-400 font-semibold">{progress}%</span>
					</div>
					<div className="relative w-full h-2 bg-[#020817] rounded-full overflow-hidden">
						<motion.div
							initial={{ width: 0 }}
							animate={{ width: `${progress}%` }}
							transition={{ duration: 1, delay: delay + 0.2 }}
							className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full"
						/>
						{/* Glow effect */}
						<div className="absolute left-0 top-0 h-full w-full bg-cyan-500/20 blur-sm" />
					</div>
				</div>
			</div>
		</motion.div>
	);
}

