'use client';

import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';

export default function AboutMiniSection() {
	return (
		<section id="about" className="py-24 bg-white">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid lg:grid-cols-2 gap-12 items-center">
					{/* Left - Image/Visual */}
					<motion.div
						initial={{ opacity: 0, x: -50 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						className="relative"
					>
						<div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
							{/* Car Shipping Photo */}
							<img
								src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=2070&auto=format&fit=crop"
								alt="JACXI Vehicle Shipping Services"
								className="w-full h-full object-cover"
							/>
							{/* Overlay Badge */}
							<div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
								<div className="flex items-center gap-3">
									<div className="w-12 h-12 rounded-xl bg-[rgb(var(--jacxi-blue))] flex items-center justify-center flex-shrink-0">
										<Building2 className="w-6 h-6 text-white" />
									</div>
									<div>
										<p className="font-bold text-gray-900">Modern Logistics</p>
										<p className="text-sm text-gray-600">USA to Afghanistan</p>
									</div>
								</div>
							</div>
						</div>
						{/* Decorative Elements */}
						<div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[rgb(var(--uae-gold))]/20 rounded-full blur-3xl" />
					</motion.div>

					{/* Right - Content */}
					<motion.div
						initial={{ opacity: 0, x: 50 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						className="space-y-6"
					>
						<div>
							<h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
								About <span className="text-[rgb(var(--jacxi-blue))]">Us</span>
							</h2>
							<p className="text-lg text-gray-600 leading-relaxed mb-6">
								Launched in 2025, JACXI Shipping was founded to solve the challenges that people 
								in Afghanistan faced when shipping vehicles from the USA. We identified every pain 
								point in the traditional process and built a modern solution from the ground up.
							</p>
						</div>

						{/* Dashboard Features */}
						<div className="bg-gradient-to-br from-[rgb(var(--jacxi-blue))]/5 to-[rgb(var(--uae-gold))]/5 rounded-2xl p-6 border border-[rgb(var(--jacxi-blue))]/10">
							<h3 className="text-lg font-bold text-gray-900 mb-4">Dashboard Features</h3>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								{[
									'Real-time vehicle tracking',
									'Digital document management',
									'Transparent cost breakdown',
									'Live shipment updates',
									'Invoice generation & payment',
									'Direct messaging with support',
								].map((feature, index) => (
									<div key={index} className="flex items-center gap-2">
										<div className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--jacxi-blue))]" />
										<span className="text-sm text-gray-700">{feature}</span>
									</div>
								))}
							</div>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}

