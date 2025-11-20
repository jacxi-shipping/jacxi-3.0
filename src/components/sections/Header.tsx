'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Ship, Menu, X, Home, Wrench, Package, MapPin, Info, Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { 
	Slide, 
	Fade, 
	Drawer, 
	Box, 
	List, 
	ListItemButton,
	IconButton,
	Collapse
} from '@mui/material';

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
	const showHeader = true;

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 50);
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

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
		<Slide in={showHeader} direction="down" timeout={600}>
			<Box
				component="header"
				className={`fixed top-0 left-0 right-0 z-sticky transition-all duration-300 ${
					isScrolled
						? 'backdrop-blur-md bg-white/60 shadow-md border-b border-gray-200/50'
						: 'bg-transparent'
				}`}
			>
				<nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-20">
						{/* Logo */}
						<Fade in={showHeader} timeout={800} style={{ transitionDelay: '200ms' }}>
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
						</Fade>

						{/* Desktop Navigation */}
						<Fade in={showHeader} timeout={800} style={{ transitionDelay: '400ms' }}>
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
						</Fade>

						{/* CTA Button */}
						<Fade in={showHeader} timeout={800} style={{ transitionDelay: '600ms' }}>
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
						</Fade>

						{/* Mobile Menu Button */}
						<Fade in={showHeader} timeout={800} style={{ transitionDelay: '600ms' }}>
							<IconButton
								onClick={() => setIsOpen(!isOpen)}
								className="lg:hidden relative z-50"
								aria-label={isOpen ? "Close menu" : "Open menu"}
								aria-expanded={isOpen}
								aria-controls="mobile-menu"
								sx={{
									color: 'rgb(55 65 81)',
									'&:hover': {
										bgcolor: 'rgb(243 244 246)',
									},
								}}
							>
								<Collapse in={!isOpen} timeout={200}>
									<Menu className="w-6 h-6" aria-hidden="true" />
								</Collapse>
								<Collapse in={isOpen} timeout={200}>
									<X className="w-6 h-6" aria-hidden="true" />
								</Collapse>
							</IconButton>
						</Fade>
					</div>

					{/* Mobile Menu Drawer */}
					<Drawer
						anchor="right"
						open={isOpen}
						onClose={() => setIsOpen(false)}
						PaperProps={{
							sx: {
								width: '85vw',
								maxWidth: '24rem',
								bgcolor: 'white',
							},
						}}
					>
						{/* Menu Header */}
						<Box className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Ship className="w-6 h-6 text-[rgb(var(--jacxi-blue))]" aria-hidden="true" />
								<span className="text-xl font-bold text-[rgb(var(--jacxi-blue))]">JACXI</span>
							</div>
							<IconButton
								onClick={() => setIsOpen(false)}
								aria-label="Close menu"
								sx={{
									color: 'rgb(55 65 81)',
									'&:hover': {
										bgcolor: 'rgb(243 244 246)',
									},
								}}
							>
								<X className="w-6 h-6" aria-hidden="true" />
							</IconButton>
						</Box>

						{/* Navigation Links */}
						<List className="p-6" aria-label="Mobile navigation">
							<div className="flex flex-col gap-2">
								{navigation.map((item, index) => {
									const Icon = item.icon;
									return (
										<Slide
											key={item.name}
											in={isOpen}
											direction="left"
											timeout={300}
											style={{ transitionDelay: `${index * 50}ms` }}
										>
											<ListItemButton
												component={Link}
												href={item.href}
												onClick={() => setIsOpen(false)}
												sx={{
													display: 'flex',
													alignItems: 'center',
													gap: 1.5,
													px: 2,
													py: 2,
													fontSize: '1rem',
													fontWeight: 500,
													color: 'rgb(55 65 81)',
													borderRadius: 3,
													'&:hover': {
														color: 'rgb(var(--jacxi-blue))',
														bgcolor: 'rgb(239 246 255)',
													},
												}}
												aria-label={item.name}
											>
												<Box
													sx={{
														width: 40,
														height: 40,
														borderRadius: 2,
														bgcolor: 'rgb(243 244 246)',
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'center',
														flexShrink: 0,
													}}
												>
													<Icon className="w-5 h-5 text-gray-600" aria-hidden="true" />
												</Box>
												<span>{item.name}</span>
											</ListItemButton>
										</Slide>
									);
								})}
							</div>

							{/* Mobile CTA */}
							<Fade in={isOpen} timeout={600} style={{ transitionDelay: '300ms' }}>
								<Box className="mt-6 pt-6 border-t border-gray-200">
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
								</Box>
							</Fade>

							{/* Contact Info */}
							<Fade in={isOpen} timeout={600} style={{ transitionDelay: '400ms' }}>
								<Box className="mt-8 p-4 bg-gray-50 rounded-xl">
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
								</Box>
							</Fade>
						</List>
					</Drawer>
				</nav>
			</Box>
		</Slide>
	);
}
