'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertTriangle, CheckCircle, UserPlus, Mail, Lock, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import Section from '@/components/layout/Section';

export default function CreateUserPage() {
	const router = useRouter();
	const { data: session, status } = useSession();
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
	});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState(false);

	if (status === 'loading') {
		return (
			<div className="min-h-screen bg-[var(--text-primary)] flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500/30 border-t-cyan-400"></div>
			</div>
		);
	}

	const role = session?.user?.role;
	if (!session || role !== 'admin') {
		return (
			<>
				<Section className="relative bg-[var(--text-primary)] py-8 sm:py-12 lg:py-16 overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-br from-[var(--text-primary)] via-[var(--text-primary)] to-[var(--text-primary)]" />
					<div className="relative z-10 max-w-2xl mx-auto text-center">
						<AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
						<h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Access Restricted</h1>
						<p className="text-white/70 mb-6">
							Only administrators can create user accounts.
						</p>
						<Link href="/dashboard">
							<Button className="bg-[var(--accent-gold)] text-white hover:bg-[var(--accent-gold)]">
								Go to Dashboard
							</Button>
						</Link>
					</div>
				</Section>
			</>
		);
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
		setError('');
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError('');

		if (formData.password !== formData.confirmPassword) {
			setError('Passwords do not match');
			setIsLoading(false);
			return;
		}

		if (formData.password.length < 6) {
			setError('Password must be at least 6 characters');
			setIsLoading(false);
			return;
		}

		try {
			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: formData.name,
					email: formData.email,
					password: formData.password,
				}),
			});

			if (response.ok) {
				setSuccess(true);
				setTimeout(() => {
					router.push('/dashboard');
				}, 2000);
			} else {
				const data = await response.json();
				setError(data.message || 'Registration failed');
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : 'An error occurred. Please try again.';
			setError(message);
		} finally {
			setIsLoading(false);
		}
	};

	if (success) {
		return (
			<>
				<Section className="relative bg-[var(--text-primary)] py-8 sm:py-12 lg:py-16 overflow-hidden min-h-screen flex items-center">
					<div className="absolute inset-0 bg-gradient-to-br from-[var(--text-primary)] via-[var(--text-primary)] to-[var(--text-primary)]" />
					<div className="absolute inset-0 opacity-[0.03]">
						<svg className="w-full h-full" preserveAspectRatio="none">
							<defs>
								<pattern id="grid-success-user" width="40" height="40" patternUnits="userSpaceOnUse">
									<path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
								</pattern>
							</defs>
							<rect width="100%" height="100%" fill="url(#grid-success-user)" className="text-cyan-400" />
						</svg>
					</div>

					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.5 }}
						className="relative z-10 max-w-md w-full mx-auto"
					>
						<div className="relative rounded-xl bg-[var(--text-primary)]/50 backdrop-blur-sm border border-green-500/30 p-8 sm:p-10 text-center">
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ duration: 0.5, delay: 0.2 }}
							>
								<CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
							</motion.div>
							<h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
								User Created Successfully
							</h2>
							<p className="text-white/70">
								The user account has been created successfully!
							</p>
						</div>
					</motion.div>
				</Section>
			</>
		);
	}

	return (
		<>
			{/* Header */}
			<Section className="relative bg-[var(--text-primary)] py-8 sm:py-12 lg:py-16 overflow-hidden">
				{/* Background gradient */}
				<div className="absolute inset-0 bg-gradient-to-br from-[var(--text-primary)] via-[var(--text-primary)] to-[var(--text-primary)]" />

				{/* Subtle geometric grid pattern */}
				<div className="absolute inset-0 opacity-[0.03]">
					<svg className="w-full h-full" preserveAspectRatio="none">
						<defs>
							<pattern id="grid-create-user" width="40" height="40" patternUnits="userSpaceOnUse">
								<path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
							</pattern>
						</defs>
						<rect width="100%" height="100%" fill="url(#grid-create-user)" className="text-cyan-400" />
					</svg>
				</div>

				<div className="relative z-10">
					<div className="flex items-center gap-6">
						<Link href="/dashboard">
							<Button
								variant="outline"
								size="sm"
								className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
							>
								<ArrowLeft className="w-4 h-4 mr-2" />
								Back
							</Button>
						</Link>
						<div>
							<h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
								Create User Account
							</h1>
							<p className="text-lg sm:text-xl text-white/70 mt-2">
								Create a new user account for the platform
							</p>
						</div>
					</div>
				</div>
			</Section>

			{/* Form */}
			<Section className="bg-[var(--text-primary)] py-8 sm:py-12">
				<div className="max-w-2xl mx-auto">
					{/* Main Card */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className="relative rounded-2xl bg-[var(--text-primary)]/50 backdrop-blur-sm border border-cyan-500/30 p-8 sm:p-10 shadow-lg shadow-cyan-500/10"
					>
						{/* Glowing border effect */}
						<div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 opacity-50" />

						<div className="relative z-10 space-y-6 sm:space-y-8">
							{/* Header Icon */}
							<div className="text-center">
								<motion.div
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ duration: 0.5, delay: 0.2 }}
									className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-[var(--text-primary)] border border-cyan-500/40 mb-4"
								>
									<div className="absolute inset-0 rounded-xl bg-cyan-500/10 blur-md" />
									<UserPlus className="relative w-8 h-8 text-cyan-400" />
								</motion.div>
							</div>

							{/* Error Message */}
							{error && (
								<motion.div
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									className="relative rounded-lg bg-red-500/10 border border-red-500/30 p-4 flex items-start gap-3"
								>
									<AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
									<span className="text-red-400 text-sm">{error}</span>
								</motion.div>
							)}

							{/* Form */}
							<form onSubmit={handleSubmit} className="space-y-5">
								{/* Name Field */}
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: 0.3 }}
								>
									<label htmlFor="name" className="block text-sm font-medium text-white/90 mb-2">
										Full Name <span className="text-red-400">*</span>
									</label>
									<div className="relative">
										<UserPlus className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
										<input
											id="name"
											name="name"
											type="text"
											value={formData.name}
											onChange={handleChange}
											required
											className="w-full pl-12 pr-4 py-3 bg-[var(--text-primary)] border border-cyan-500/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
											placeholder="Enter full name"
										/>
									</div>
								</motion.div>

								{/* Email Field */}
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: 0.4 }}
								>
									<label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
										Email <span className="text-red-400">*</span>
									</label>
									<div className="relative">
										<Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
										<input
											id="email"
											name="email"
											type="email"
											value={formData.email}
											onChange={handleChange}
											required
											className="w-full pl-12 pr-4 py-3 bg-[var(--text-primary)] border border-cyan-500/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
											placeholder="Enter email address"
										/>
									</div>
								</motion.div>

								{/* Password Field */}
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: 0.5 }}
								>
									<label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
										Password <span className="text-red-400">*</span>
									</label>
									<div className="relative">
										<Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
										<input
											id="password"
											name="password"
											type={showPassword ? 'text' : 'password'}
											value={formData.password}
											onChange={handleChange}
											required
											className="w-full pl-12 pr-12 py-3 bg-[var(--text-primary)] border border-cyan-500/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
											placeholder="Enter password (min. 6 characters)"
										/>
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
										>
											{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
										</button>
									</div>
								</motion.div>

								{/* Confirm Password Field */}
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: 0.6 }}
								>
									<label htmlFor="confirmPassword" className="block text-sm font-medium text-white/90 mb-2">
										Confirm Password <span className="text-red-400">*</span>
									</label>
									<div className="relative">
										<Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
										<input
											id="confirmPassword"
											name="confirmPassword"
											type={showConfirmPassword ? 'text' : 'password'}
											value={formData.confirmPassword}
											onChange={handleChange}
											required
											className="w-full pl-12 pr-12 py-3 bg-[var(--text-primary)] border border-cyan-500/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
											placeholder="Confirm password"
										/>
										<button
											type="button"
											onClick={() => setShowConfirmPassword(!showConfirmPassword)}
											className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
										>
											{showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
										</button>
									</div>
								</motion.div>

								{/* Submit Button */}
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: 0.7 }}
									className="flex flex-col sm:flex-row gap-4 pt-4"
								>
									<Link href="/dashboard" className="sm:w-auto w-full">
										<Button
											type="button"
											variant="outline"
											disabled={isLoading}
											className="w-full sm:w-auto border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
										>
											Cancel
										</Button>
									</Link>
									<Button
										type="submit"
										disabled={isLoading}
										className="w-full sm:w-auto group relative overflow-hidden bg-[var(--accent-gold)] text-white hover:bg-[var(--accent-gold)] shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 py-3 text-base font-semibold"
									>
										<span className="relative z-10 flex items-center justify-center gap-2">
											{isLoading ? (
												<>
													<div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
													Creating Account...
												</>
											) : (
												<>
													Create Account
													<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
												</>
											)}
										</span>
										{/* Shimmer effect */}
										<div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
									</Button>
								</motion.div>
							</form>
						</div>
					</motion.div>
				</div>
			</Section>
		</>
	);
}

