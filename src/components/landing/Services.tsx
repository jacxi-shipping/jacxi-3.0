"use client";

import { motion } from 'framer-motion';
import { Car, Package, ShieldCheck } from 'lucide-react';
import Section from '@/components/layout/Section';
import { defaultViewport, fadeInUp, makeSmooth, stagger } from '@/lib/motion';

const SERVICES = [
	{
		icon: Car,
		title: 'Car Shipping',
		description: 'Professional vehicle transportation services',
	},
	{
		icon: Package,
		title: 'Container Loading',
		description: 'Secure containerized shipping solutions',
	},
	{
		icon: ShieldCheck,
		title: 'Customs Clearance',
		description: 'Expert customs handling and documentation',
	},
];

export default function Services() {
	return (
		<Section className="bg-theme-section py-16 sm:py-20 lg:py-24">
			{/* Section Title */}
			<motion.div
				initial={{ opacity: 0, y: 18 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={defaultViewport}
				transition={makeSmooth({ duration: 0.7 })}
				className="mb-12 sm:mb-16 text-center"
			>
				<h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
					Services
				</h2>
			</motion.div>

			{/* Services Grid */}
			<motion.div
				variants={stagger({ staggerChildren: 0.15, delayChildren: 0.1 })}
				initial="hidden"
				whileInView="show"
				viewport={defaultViewport}
				className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto"
			>
				{SERVICES.map((service, index) => {
					const Icon = service.icon;
					return (
						<motion.div
							key={service.title}
							variants={fadeInUp({ distance: 24, delay: index * 0.1 })}
							className="bg-card rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow duration-300"
						>
							<div className="flex flex-col items-center text-center">
								<div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
									<Icon className="w-8 h-8 text-accent" />
								</div>
								<h3 className="text-xl font-semibold text-foreground mb-2">
									{service.title}
								</h3>
								<p className="text-muted-foreground text-sm">
									{service.description}
								</p>
							</div>
						</motion.div>
					);
				})}
			</motion.div>
		</Section>
	);
}

