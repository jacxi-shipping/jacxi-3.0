'use client';

import Link from 'next/link';
import { Ship, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const footerLinks = {
	services: [
		{ name: 'Car Shipping', href: '#services' },
		{ name: 'Container Loading', href: '#services' },
		{ name: 'Customs Clearance', href: '#services' },
		{ name: 'Door-to-Port', href: '#services' },
	],
	company: [
		{ name: 'About Us', href: '#about' },
		{ name: 'Our Process', href: '#process' },
		{ name: 'Routes', href: '#routes' },
		{ name: 'Testimonials', href: '#testimonials' },
	],
	support: [
		{ name: 'Get Quote', href: '#quote' },
		{ name: 'Track Shipment', href: '#tracking' },
		{ name: 'FAQ', href: '#faq' },
		{ name: 'Contact Us', href: '#contact' },
	],
};

export default function Footer() {
	return (
		<footer id="contact" className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-12">
					{/* Brand Section - Spans 4 columns */}
					<div className="lg:col-span-4">
						<Link href="/" className="flex items-center gap-2 mb-6">
							<Ship className="w-8 h-8 text-[rgb(var(--jacxi-blue))]" />
							<span className="text-2xl font-bold">JACXI Shipping</span>
						</Link>
						<p className="text-gray-400 mb-6 leading-relaxed">
							Reliable vehicle shipping from USA to Afghanistan. Fast, secure, and fully managed logistics for all your transportation needs.
						</p>
						<div className="space-y-3">
							<div className="flex items-start gap-3 text-sm">
								<MapPin className="w-5 h-5 text-[rgb(var(--uae-gold))] flex-shrink-0 mt-0.5" />
								<span className="text-gray-300">Across to the Customs Office, Herat, Afghanistan 🇦🇫</span>
							</div>
							<div className="flex items-center gap-3 text-sm">
								<Phone className="w-5 h-5 text-[rgb(var(--uae-gold))]" />
								<a href="tel:+93770000085" className="text-gray-300 hover:text-[rgb(var(--jacxi-blue))] transition-colors">
									+93 77 000 0085
								</a>
							</div>
							<div className="flex items-center gap-3 text-sm">
								<Mail className="w-5 h-5 text-[rgb(var(--uae-gold))]" />
								<a href="mailto:info@jacxi.com" className="text-gray-300 hover:text-[rgb(var(--jacxi-blue))] transition-colors">
									info@jacxi.com
								</a>
							</div>
						</div>
					</div>

					{/* Services */}
					<div className="lg:col-span-2">
						<h3 className="text-lg font-bold mb-4">Services</h3>
						<ul className="space-y-3">
							{footerLinks.services.map((link) => (
								<li key={link.name}>
									<Link
										href={link.href}
										className="text-gray-400 hover:text-[rgb(var(--jacxi-blue))] transition-colors text-sm"
									>
										{link.name}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Company */}
					<div className="lg:col-span-2">
						<h3 className="text-lg font-bold mb-4">Company</h3>
						<ul className="space-y-3">
							{footerLinks.company.map((link) => (
								<li key={link.name}>
									<Link
										href={link.href}
										className="text-gray-400 hover:text-[rgb(var(--jacxi-blue))] transition-colors text-sm"
									>
										{link.name}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Support */}
					<div className="lg:col-span-2">
						<h3 className="text-lg font-bold mb-4">Support</h3>
						<ul className="space-y-3">
							{footerLinks.support.map((link) => (
								<li key={link.name}>
									<Link
										href={link.href}
										className="text-gray-400 hover:text-[rgb(var(--jacxi-blue))] transition-colors text-sm"
									>
										{link.name}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Route Highlight Section */}
					<div className="lg:col-span-2">
						<h3 className="text-lg font-bold mb-4">Our Route</h3>
						<div className="space-y-3 text-sm">
							<div className="flex items-center gap-2 text-gray-300">
								<span className="text-xl">🇺🇸</span>
								<span>USA (Origin)</span>
							</div>
							<div className="flex items-center gap-2 text-gray-300">
								<span className="text-xl">🇦🇪</span>
								<span>Dubai, UAE (Transit)</span>
							</div>
							<div className="flex items-center gap-2 text-gray-300">
								<span className="text-xl">🇦🇫</span>
								<span>Herat (Entry Point)</span>
							</div>
							<div className="flex items-center gap-2 text-gray-300">
								<span className="text-xl">🇦🇫</span>
								<span>All Afghan Provinces</span>
							</div>
						</div>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="pt-8 border-t border-gray-700">
					<div className="flex flex-col md:flex-row justify-between items-center gap-4">
						<p className="text-gray-400 text-sm">
							© 2025 Jacxi Shipping. All rights reserved.
						</p>

						{/* Social Links */}
						<div className="flex items-center gap-4">
							<a
								href="#"
								className="w-10 h-10 rounded-full bg-gray-800 hover:bg-[rgb(var(--jacxi-blue))] flex items-center justify-center transition-all duration-300 hover:scale-110"
								aria-label="Facebook"
							>
								<Facebook className="w-5 h-5" />
							</a>
							<a
								href="#"
								className="w-10 h-10 rounded-full bg-gray-800 hover:bg-[rgb(var(--jacxi-blue))] flex items-center justify-center transition-all duration-300 hover:scale-110"
								aria-label="Twitter"
							>
								<Twitter className="w-5 h-5" />
							</a>
							<a
								href="#"
								className="w-10 h-10 rounded-full bg-gray-800 hover:bg-[rgb(var(--jacxi-blue))] flex items-center justify-center transition-all duration-300 hover:scale-110"
								aria-label="Instagram"
							>
								<Instagram className="w-5 h-5" />
							</a>
							<a
								href="#"
								className="w-10 h-10 rounded-full bg-gray-800 hover:bg-[rgb(var(--jacxi-blue))] flex items-center justify-center transition-all duration-300 hover:scale-110"
								aria-label="LinkedIn"
							>
								<Linkedin className="w-5 h-5" />
							</a>
						</div>

						{/* Legal Links */}
						<div className="flex items-center gap-6 text-sm">
							<Link href="#" className="text-gray-400 hover:text-white transition-colors">
								Privacy Policy
							</Link>
							<Link href="#" className="text-gray-400 hover:text-white transition-colors">
								Terms of Service
							</Link>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}

