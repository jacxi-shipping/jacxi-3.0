"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/providers/ThemeProvider';

const NAV_LINKS = [
	{ href: '/', label: 'Home' },
	{ href: '/services', label: 'Services' },
	{ href: '/about', label: 'About' },
	{ href: '/testimonials', label: 'Testimonials' },
	{ href: '/tracking', label: 'Tracking' },
	{ href: '/auth/signin', label: 'Login' },
];

export default function Header() {
	const [open, setOpen] = useState(false);

	return (
		<header className="sticky top-0 z-50 border-b border-border" style={{ backgroundColor: '#0A1F44' }}>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 sm:h-18 items-center justify-between">
					{/* Logo - Left */}
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5 }}
					>
						<Link href="/" className="flex items-center gap-2.5 group">
							{/* Stylized checkmark/J icon */}
							<div className="relative">
								<Check className="w-5 h-5 sm:w-6 sm:h-6 text-white rotate-[-35deg] translate-x-[-2px]" strokeWidth={3} />
								<div className="absolute inset-0 bg-cyan-400/20 blur-sm" />
							</div>
							<span className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">Jacxi</span>
						</Link>
					</motion.div>

					{/* Desktop Navigation - Center */}
					<nav className="hidden lg:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
						{NAV_LINKS.map((item, index) => (
							<motion.div
								key={item.href}
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 0.1 * index }}
							>
								<Link
									href={item.href}
									className="text-sm font-medium text-foreground hover:text-accent transition-colors duration-200 relative group"
								>
									{item.label}
									<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 transition-all duration-200 group-hover:w-full" />
								</Link>
							</motion.div>
						))}
					</nav>

					{/* Theme Toggle and CTA Button - Right */}
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className="hidden lg:flex items-center gap-3"
					>
						<ThemeToggle />
						<Button
							size="sm"
							className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg px-6 py-2.5 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
						>
							Request a Quote
						</Button>
					</motion.div>

					{/* Mobile Menu Button */}
					<motion.button
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.3 }}
						aria-label="Toggle menu"
						onClick={() => setOpen((v) => !v)}
						className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground hover:bg-accent/10 transition-colors"
					>
						{open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
					</motion.button>
				</div>
			</div>

			{/* Mobile Drawer */}
			<AnimatePresence>
				{open && (
					<>
						{/* Backdrop */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
							onClick={() => setOpen(false)}
						/>

						{/* Mobile Menu */}
						<motion.div
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
							className="lg:hidden fixed top-16 left-0 right-0 border-b border-border z-50"
							style={{ backgroundColor: '#0A1F44' }}
						>
							<div className="mx-auto max-w-7xl px-4 sm:px-6">
								<div className="py-6 flex flex-col gap-6">
									{NAV_LINKS.map((item, index) => (
										<motion.div
											key={item.href}
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ duration: 0.3, delay: 0.1 * index }}
										>
											<Link
												href={item.href}
												onClick={() => setOpen(false)}
												className="text-base font-medium text-foreground hover:text-accent transition-colors block"
											>
												{item.label}
											</Link>
										</motion.div>
									))}
									<motion.div
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.3, delay: 0.3 }}
										className="pt-2"
									>
										<Button
											size="sm"
											className="w-full bg-[#00bfff] text-white hover:bg-[#00a8e6] rounded-lg px-6 py-3 text-sm font-semibold shadow-lg shadow-cyan-500/20"
											onClick={() => setOpen(false)}
										>
											Request a Quote
										</Button>
									</motion.div>
								</div>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</header>
	);
}


