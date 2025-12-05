'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Section from '@/components/layout/Section';

type FormValues = {
	containerNumber: string;
	status: 'ACTIVE' | 'INACTIVE';
};

export default function NewContainerPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState('');

	const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
		defaultValues: {
			status: 'ACTIVE',
		},
	});

	useEffect(() => {
		if (status === 'loading') return;
		const role = session?.user?.role;
		if (!session || role !== 'admin') {
			router.replace('/dashboard');
		}
	}, [session, status, router]);

	const onSubmit = async (data: FormValues) => {
		setIsSubmitting(true);
		setError('');

		try {
			const response = await fetch('/api/containers', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});

			const result = await response.json();

			if (response.ok) {
				router.push(`/dashboard/containers/${result.container.id}`);
			} else {
				setError(result.message || 'Failed to create container');
			}
		} catch (error) {
			console.error('Error creating container:', error);
			setError('An error occurred while creating the container');
		} finally {
			setIsSubmitting(false);
		}
	};

	if (status === 'loading') {
		return (
			<div className="min-h-screen bg-[var(--text-primary)] flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500/30 border-t-cyan-400"></div>
			</div>
		);
	}

	const role = session?.user?.role;
	if (!session || role !== 'admin') {
		return null;
	}

	return (
		<>
			<Section className="relative bg-[var(--text-primary)] py-8 sm:py-12 lg:py-16 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-[var(--text-primary)] via-[var(--text-primary)] to-[var(--text-primary)]" />
				<div className="absolute inset-0 opacity-[0.03]">
					<svg className="w-full h-full" preserveAspectRatio="none">
						<defs>
							<pattern id="grid-new-container" width="40" height="40" patternUnits="userSpaceOnUse">
								<path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
							</pattern>
						</defs>
						<rect width="100%" height="100%" fill="url(#grid-new-container)" className="text-cyan-400" />
					</svg>
				</div>

				<div className="relative z-10">
					<div className="flex items-center gap-6">
						<Link href="/dashboard/containers">
							<Button variant="outline" size="sm" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
								<ArrowLeft className="w-4 h-4 mr-2" />
								Back
							</Button>
						</Link>
						<div>
							<h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">Create Container</h1>
							<p className="text-lg sm:text-xl text-white/70 mt-2">Create a new container</p>
						</div>
					</div>
				</div>
			</Section>

			<Section className="bg-[var(--text-primary)] py-8 sm:py-12">
				<div className="max-w-2xl mx-auto">
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className="relative rounded-xl bg-[var(--text-primary)]/50 backdrop-blur-sm border border-cyan-500/30 p-6 sm:p-8"
						>
							<div className="flex items-center gap-3 mb-6">
								<div className="w-10 h-10 rounded-xl bg-[var(--text-primary)] border border-cyan-500/40 flex items-center justify-center">
									<Package className="w-5 h-5 text-cyan-400" />
								</div>
								<div>
									<h2 className="text-xl sm:text-2xl font-bold text-white">Container Information</h2>
								</div>
							</div>

							<div className="space-y-4">
								<div>
									<label htmlFor="containerNumber" className="block text-sm font-medium text-white/90 mb-2">
										Container Number <span className="text-red-400">*</span>
									</label>
									<input
										type="text"
										id="containerNumber"
										{...register('containerNumber', { required: 'Container number is required' })}
										placeholder="e.g., CONT-123456"
										className={`w-full px-4 py-3 bg-[var(--text-primary)] border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 ${
											errors.containerNumber ? 'border-red-500/50' : 'border-cyan-500/30'
										}`}
									/>
									{errors.containerNumber?.message && (
										<p className="mt-2 text-sm text-red-400">{errors.containerNumber.message}</p>
									)}
								</div>

								<div>
									<label htmlFor="status" className="block text-sm font-medium text-white/90 mb-2">
										Status
									</label>
									<select
										id="status"
										{...register('status')}
										className="w-full px-4 py-3 bg-[var(--text-primary)] border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
									>
										<option value="ACTIVE" className="bg-[var(--text-primary)]">Active</option>
										<option value="INACTIVE" className="bg-[var(--text-primary)]">Inactive</option>
									</select>
								</div>
							</div>
						</motion.div>

						{error && (
							<motion.div
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								className="relative rounded-xl bg-red-500/10 backdrop-blur-sm border border-red-500/30 p-6"
							>
								<p className="text-sm text-red-400">{error}</p>
							</motion.div>
						)}

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							className="flex flex-col sm:flex-row justify-end gap-4 pt-4"
						>
							<Link href="/dashboard/containers" className="sm:w-auto w-full">
								<Button type="button" variant="outline" disabled={isSubmitting} className="w-full sm:w-auto border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
									Cancel
								</Button>
							</Link>
							<Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-[var(--accent-gold)] text-white hover:bg-[var(--accent-gold)] shadow-lg shadow-cyan-500/30">
								{isSubmitting ? 'Creating...' : 'Create Container'}
							</Button>
						</motion.div>
					</form>
				</div>
			</Section>
		</>
	);
}

