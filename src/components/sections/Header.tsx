'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, AnimatePresence } from 'framer-motion';
import { Ship, Menu, X, Home, Wrench, Package, MapPin, Info, Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const navigation = [
	{ name: 'Home', href: '/', icon: Home },
	{ name: 'Services', href: '#services', icon: Wrench },
	{ name: 'Ship a Vehicle', href: '#quote', icon: Package },
	{ name: 'Tracking', href: '/tracking', icon: MapPin },
	{ name: 'About', href: '#about', icon: Info },
	{ name: 'Contact', href: '#contact', icon: Phone },
];

export default function Header() {
	const [isOpen, setIsOpen] = useState(false);
	const [isScrolled, setIsScrolled] = useState(false);
	const { scrollY } = useScroll();

	useEffect(() => {
		return scrollY.on('change', (latest) => {
			setIsScrolled(latest > 50);
		});
	}, [scrollY]);

	// Lock body scroll when mobile menu is open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}
		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isOpen]);

	// Close menu on escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				setIsOpen(false);
			}
		};
		window.addEventListener('keydown', handleEscape);
		return () => window.removeEventListener('keydown', handleEscape);
	}, [isOpen]);

	return (
		<motion.header
			className={`fixed top-0 left-0 right-0 z-sticky transition-all duration-300 ${
				isScrolled
					? 'backdrop-blur-md bg-white/60 shadow-md border-b border-gray-200/50'
					: 'bg-transparent'
			}`}
			initial={{ y: -100 }}
			animate={{ y: 0 }}
			transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
		>
			<nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-20">
					{/* Logo */}
					<Link 
						href="/" 
						className="flex items-center gap-2 group relative z-50"
						aria-label="JACXI Shipping Home"
					>
						<div className="relative">
							<Ship className="w-8 h-8 text-[rgb(var(--jacxi-blue))] group-hover:scale-110 transition-transform duration-300" aria-hidden="true" />
							<div className="absolute inset-0 bg-[rgb(var(--jacxi-blue))] opacity-20 blur-xl group-hover:opacity-30 transition-opacity" />
						</div>
						<span className="text-2xl font-bold text-[rgb(var(--jacxi-blue))] tracking-tight">
							JACXI
						</span>
					</Link>

					{/* Desktop Navigation */}
					<nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
						{navigation.map((item) => (
							<Link
								key={item.name}
								href={item.href}
								className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[rgb(var(--jacxi-blue))] hover:bg-gray-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--jacxi-blue))]/50 focus:ring-offset-2"
								aria-label={item.name}
							>
								{item.name}
							</Link>
						))}
					</nav>

					{/* CTA Button */}
					<div className="hidden lg:flex items-center gap-4">
						<Button
							variant="default"
							onClick={() => window.location.href = '/auth/signin'}
							className="bg-[rgb(var(--jacxi-blue))] hover:bg-[rgb(var(--jacxi-blue))]/90 text-white px-6 py-2.5 rounded-lg font-medium shadow-lg shadow-[rgb(var(--jacxi-blue))]/25 hover:shadow-xl hover:shadow-[rgb(var(--jacxi-blue))]/35 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--jacxi-blue))]/50 focus:ring-offset-2"
							aria-label="Sign in to your account"
						>
							Sign In
						</Button>
					</div>

					{/* Mobile Menu Button */}
					<button
						onClick={() => setIsOpen(!isOpen)}
						className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors relative z-50 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--jacxi-blue))]/50"
						aria-label={isOpen ? "Close menu" : "Open menu"}
						aria-expanded={isOpen}
						aria-controls="mobile-menu"
					>
						<AnimatePresence mode="wait">
							{isOpen ? (
								<motion.div
									key="close"
									initial={{ rotate: -90, opacity: 0 }}
									animate={{ rotate: 0, opacity: 1 }}
									exit={{ rotate: 90, opacity: 0 }}
									transition={{ duration: 0.2 }}
								>
									<X className="w-6 h-6" aria-hidden="true" />
								</motion.div>
							) : (
								<motion.div
									key="menu"
									initial={{ rotate: 90, opacity: 0 }}
									animate={{ rotate: 0, opacity: 1 }}
									exit={{ rotate: -90, opacity: 0 }}
									transition={{ duration: 0.2 }}
								>
									<Menu className="w-6 h-6" aria-hidden="true" />
								</motion.div>
							)}
						</AnimatePresence>
					</button>
				</div>

			{/* Mobile Menu Overlay */}
			<AnimatePresence>
				{isOpen && (
					<>
						{/* Backdrop */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-40"
							onClick={() => setIsOpen(false)}
							aria-hidden="true"
						/>
						
						{/* Mobile Menu Panel */}
						<motion.div
							id="mobile-menu"
							initial={{ x: '100%' }}
							animate={{ x: 0 }}
							exit={{ x: '100%' }}
							transition={{ type: "spring", damping: 25, stiffness: 200 }}
							className="fixed top-0 right-0 bottom-0 w-[85vw] max-w-sm bg-white shadow-2xl lg:hidden z-50 overflow-y-auto"
							role="dialog"
							aria-modal="true"
							aria-label="Mobile navigation menu"
						>
							{/* Menu Header */}
							<div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Ship className="w-6 h-6 text-[rgb(var(--jacxi-blue))]" aria-hidden="true" />
									<span className="text-xl font-bold text-[rgb(var(--jacxi-blue))]">JACXI</span>
								</div>
								<button
									onClick={() => setIsOpen(false)}
									className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[rgb(var(--jacxi-blue))]/50"
									aria-label="Close menu"
								>
									<X className="w-6 h-6" aria-hidden="true" />
								</button>
							</div>

							{/* Navigation Links */}
							<nav className="p-6" aria-label="Mobile navigation">
								<div className="flex flex-col gap-2">
									{navigation.map((item, index) => {
										const Icon = item.icon;
										return (
											<motion.div
												key={item.name}
												initial={{ opacity: 0, x: 20 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{ delay: index * 0.05 }}
											>
												<Link
													href={item.href}
													onClick={() => setIsOpen(false)}
													className="flex items-center gap-3 px-4 py-4 text-base font-medium text-gray-700 hover:text-[rgb(var(--jacxi-blue))] hover:bg-blue-50 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--jacxi-blue))]/50 group"
													aria-label={item.name}
												>
													<div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
														<Icon className="w-5 h-5 text-gray-600 group-hover:text-[rgb(var(--jacxi-blue))] transition-colors" aria-hidden="true" />
													</div>
													<span>{item.name}</span>
												</Link>
											</motion.div>
										);
									})}
								</div>

								{/* Mobile CTA */}
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.3 }}
									className="mt-6 pt-6 border-t border-gray-200"
								>
									<Button
										variant="default"
										onClick={() => {
											setIsOpen(false);
											window.location.href = '/auth/signin';
										}}
										className="w-full bg-[rgb(var(--jacxi-blue))] hover:bg-[rgb(var(--jacxi-blue))]/90 text-white py-4 rounded-xl font-medium shadow-lg shadow-[rgb(var(--jacxi-blue))]/25 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--jacxi-blue))]/50 focus:ring-offset-2"
										aria-label="Sign in to your account"
									>
										Sign In
									</Button>
								</motion.div>

								{/* Contact Info */}
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: 0.4 }}
									className="mt-8 p-4 bg-gray-50 rounded-xl"
								>
									<p className="text-sm font-medium text-gray-900 mb-2">Need Help?</p>
									<p className="text-sm text-gray-600">Contact us at:</p>
									<div className="space-y-1 mt-2">
										<a 
											href="tel:+93770000085" 
											className="block text-sm font-medium text-[rgb(var(--jacxi-blue))] hover:underline focus:outline-none focus:ring-2 focus:ring-[rgb(var(--jacxi-blue))]/50 rounded"
											aria-label="Call us at +93 77 000 0085"
										>
											📞 +93 77 000 0085
										</a>
										<a 
											href="mailto:info@jacxi.com" 
											className="block text-sm font-medium text-[rgb(var(--jacxi-blue))] hover:underline focus:outline-none focus:ring-2 focus:ring-[rgb(var(--jacxi-blue))]/50 rounded"
											aria-label="Email us at info@jacxi.com"
										>
											✉️ info@jacxi.com
										</a>
									</div>
								</motion.div>
							</nav>
						</motion.div>
					</>
				)}
			</AnimatePresence>
			</nav>
		</motion.header>
	);
}

