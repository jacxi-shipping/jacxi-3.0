'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import Section from '@/components/layout/Section';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Clock, MapPin, Search } from 'lucide-react';

interface TrackingEventEntry {
	id: string;
	status: string;
	statusCode?: string;
	location?: string;
	terminal?: string;
	timestamp?: string;
	actual: boolean;
	description?: string;
}

interface TrackingDetails {
	containerNumber: string;
	containerType?: string;
	shipmentStatus?: string;
	origin?: string;
	destination?: string;
	currentLocation?: string;
	estimatedArrival?: string;
	estimatedDeparture?: string;
	progress?: number | null;
	company?: {
		name?: string;
		url?: string | null;
		scacs?: string[];
	};
	events: TrackingEventEntry[];
}

const normalizeProgress = (value: TrackingDetails['progress']) => {
	if (typeof value !== 'number' || Number.isNaN(value)) return null;
	return Math.min(100, Math.max(0, Math.round(value)));
};

const formatDisplayDate = (value?: string) => {
	if (!value) return null;
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return null;
	return date.toLocaleString(undefined, {
		dateStyle: 'medium',
		timeStyle: 'short',
	});
};

export default function DashboardTrackingPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [trackingNumber, setTrackingNumber] = useState('');
	const [trackingDetails, setTrackingDetails] = useState<TrackingDetails | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	useEffect(() => {
		if (status === 'unauthenticated') {
			router.replace('/auth/signin?callbackUrl=/dashboard/tracking');
		}
	}, [status, router]);

	const handleTrack = async () => {
		const value = trackingNumber.trim();
		if (!value) {
			setErrorMessage('Enter a container or tracking number to continue.');
			setTrackingDetails(null);
			return;
		}

		setIsLoading(true);
		setErrorMessage(null);
		setTrackingDetails(null);

		try {
			const response = await fetch('/api/tracking', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ trackNumber: value, needRoute: true }),
			});

			const payload = (await response.json()) as {
				tracking?: TrackingDetails;
				message?: string;
			};

			if (!response.ok) {
				setErrorMessage(payload?.message || 'Unable to fetch tracking information.');
				return;
			}

			const details: TrackingDetails | undefined = payload?.tracking;
			if (!details) {
				setErrorMessage('No tracking data returned for that number.');
				return;
			}

			setTrackingDetails(details);
		} catch (error: unknown) {
			console.error('Dashboard tracking error:', error);
			setErrorMessage(error instanceof Error ? error.message : 'Failed to fetch tracking information.');
		} finally {
			setIsLoading(false);
		}
	};

	if (status === 'loading') {
		return (
			<div className="light-surface min-h-screen bg-[var(--background)] flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--border)] border-t-[var(--accent-gold)]" />
			</div>
		);
	}

	if (!session) {
		return null;
	}

	const progressValue = normalizeProgress(trackingDetails?.progress);
	const timelineEvents = (trackingDetails?.events || []).map((event) => ({
		...event,
		displayTimestamp: formatDisplayDate(event.timestamp) || event.timestamp || 'Pending update',
		icon: event.actual ? CheckCircle2 : Clock,
	}));

	return (
		<div className="light-surface">
		<Section className="bg-[var(--text-primary)] py-8 sm:py-12 lg:py-16">
			<div className="max-w-5xl mx-auto space-y-10">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className={cn(
						'relative overflow-hidden rounded-xl border border-cyan-500/30 bg-[var(--text-primary)]/60 backdrop-blur-sm',
						'p-6 sm:p-8'
					)}
				>
					<div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 opacity-40" />
					<div className="relative z-10 space-y-6">
						<div className="space-y-1">
							<h1 className="text-2xl sm:text-3xl font-bold text-white">Shipment Tracking</h1>
							<p className="text-sm sm:text-base text-white/70">
								Monitor containers directly within the dashboard. Enter a tracking or container number to pull the latest milestone data from the carrier.
							</p>
						</div>

						<div className="flex flex-col sm:flex-row gap-3">
							<input
								type="text"
								value={trackingNumber}
								onChange={(event) => setTrackingNumber(event.target.value)}
								placeholder="Container or tracking number (e.g., UETU6059142)"
								className="flex-1 px-4 py-3 rounded-lg bg-[var(--text-primary)]/70 border border-cyan-500/30 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
							/>
							<Button
								type="button"
								onClick={handleTrack}
								disabled={isLoading}
								className="sm:w-auto w-full bg-[var(--accent-gold)] text-white hover:bg-[var(--accent-gold)] shadow-cyan-500/30"
							>
								{isLoading ? (
									<>
										<Clock className="w-4 h-4 mr-2 animate-spin" />
										Fetching...
									</>
								) : (
									<>
										<Search className="w-4 h-4 mr-2" />
										Track
									</>
								)}
							</Button>
						</div>

						{errorMessage && (
							<div className="flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
								<AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
								<span>{errorMessage}</span>
							</div>
						)}
					</div>
				</motion.div>

				{trackingDetails && (
					<div className="space-y-8">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: 0.1 }}
							className="relative overflow-hidden rounded-xl border border-cyan-500/30 bg-[var(--text-primary)]/60 backdrop-blur-sm p-6 sm:p-8"
						>
							<div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 opacity-30" />
							<div className="relative z-10 space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
									<div>
										<h3 className="text-sm font-semibold uppercase tracking-wide text-white/60">Container</h3>
										<p className="text-lg font-bold text-white break-all">{trackingDetails.containerNumber}</p>
										{trackingDetails.company?.name && (
											<p className="text-xs text-white/50 mt-1">Carrier: {trackingDetails.company.name}</p>
										)}
									</div>
									<div>
										<h3 className="text-sm font-semibold uppercase tracking-wide text-white/60">Status</h3>
										<p className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-sm font-medium text-cyan-300">
											{trackingDetails.shipmentStatus || 'Unknown'}
										</p>
									</div>
									<div>
										<h3 className="text-sm font-semibold uppercase tracking-wide text-white/60">Current Location</h3>
										<p className="text-white text-sm">
											{trackingDetails.currentLocation || 'Not available'}
										</p>
									</div>
									<div>
										<h3 className="text-sm font-semibold uppercase tracking-wide text-white/60">Estimated Arrival</h3>
										<p className="text-white text-sm">
											{formatDisplayDate(trackingDetails.estimatedArrival) || 'Not available'}
										</p>
									</div>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-white/70">
									<div>
										<h4 className="text-xs uppercase tracking-wide text-white/50">Origin</h4>
										<p className="text-white">{trackingDetails.origin || 'Not available'}</p>
									</div>
									<div>
										<h4 className="text-xs uppercase tracking-wide text-white/50">Destination</h4>
										<p className="text-white">{trackingDetails.destination || 'Not available'}</p>
									</div>
									<div>
										<h4 className="text-xs uppercase tracking-wide text-white/50">Container Type</h4>
										<p className="text-white">{trackingDetails.containerType || 'Not available'}</p>
									</div>
								</div>

								{progressValue !== null && (
									<div className="space-y-2">
										<div className="flex items-center justify-between text-xs text-white/60">
											<span>Progress</span>
											<span>{progressValue}%</span>
										</div>
										<div className="h-2 overflow-hidden rounded-full border border-cyan-500/20 bg-[var(--text-primary)]">
											<div
												className="h-full bg-gradient-to-r from-cyan-500 to-[var(--accent-gold)]"
												style={{ width: `${progressValue}%` }}
											/>
										</div>
									</div>
								)}
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: 0.2 }}
							className="space-y-4"
						>
							<h2 className="text-xl font-semibold text-white">Carrier Milestones</h2>
							<div className="space-y-3">
								{timelineEvents.length === 0 && (
									<div className="rounded-lg border border-cyan-500/20 bg-[var(--text-primary)]/40 px-4 py-3 text-sm text-white/60">
										No milestone history available for this container yet.
									</div>
								)}
								{timelineEvents.map((event) => {
									const Icon = event.icon;
									return (
										<div key={event.id} className="relative overflow-hidden rounded-lg border border-cyan-500/20 bg-[var(--text-primary)]/50 px-4 py-3">
											<div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 opacity-10" />
											<div className="relative z-10 flex flex-col gap-1">
												<div className="flex items-center gap-2 text-sm font-medium text-white">
													<Icon className={cn('w-4 h-4', event.actual ? 'text-cyan-300' : 'text-white/40')} />
													<span>{event.status}</span>
												</div>
												<div className="flex flex-wrap items-center gap-2 text-xs text-white/50">
													{event.location && (
														<span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location}</span>
													)}
													<span>{event.displayTimestamp}</span>
												</div>
												{event.description && (
													<p className="text-xs text-white/60">{event.description}</p>
												)}
											</div>
										</div>
									);
								})}
							</div>
						</motion.div>
					</div>
				)}
			</div>
		</Section>
		</div>
	);
}
