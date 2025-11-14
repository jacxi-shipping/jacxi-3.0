"use client";

import { motion } from 'framer-motion';
import Section from '@/components/layout/Section';
import { defaultViewport, fadeInUp, makeSmooth, stagger } from '@/lib/motion';
import Image from 'next/image';

const BRANDS = [
	{ name: 'TOYOTA', logo: '/brands/toyota.svg' },
	{ name: 'LEXUS', logo: '/brands/lexus.svg' },
	{ name: 'BMW', logo: '/brands/bmw.svg' },
	{ name: 'Mercedes-Benz', logo: '/brands/mercedes.svg' },
];

export default function BrandsWeShip() {
	return (
		<Section className="bg-theme-section-alt py-16 sm:py-20 lg:py-24">
			<div className="max-w-6xl mx-auto">
				{/* Section Title */}
				<motion.div
					initial={{ opacity: 0, y: 18 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={defaultViewport}
					transition={makeSmooth({ duration: 0.7 })}
					className="mb-12 text-center"
				>
					<h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
						Brands We Ship
					</h2>
				</motion.div>

				{/* Brands Grid */}
				<motion.div
					variants={stagger({ staggerChildren: 0.1, delayChildren: 0.1 })}
					initial="hidden"
					whileInView="show"
					viewport={defaultViewport}
					className="grid grid-cols-2 md:grid-cols-4 gap-6"
				>
					{BRANDS.map((brand, index) => (
						<motion.div
							key={brand.name}
							variants={fadeInUp({ distance: 20, delay: index * 0.1 })}
							className="bg-card rounded-lg p-6 border border-border hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center aspect-square"
						>
							<div className="w-24 h-24 mb-4 relative">
								<Image
									src={brand.logo}
									alt={brand.name}
									fill
									className="object-contain"
									onError={(e) => {
										// Fallback to text if image doesn't exist
										const target = e.target as HTMLImageElement;
										target.style.display = 'none';
										const parent = target.parentElement;
										if (parent) {
											parent.innerHTML = `<div class="text-2xl font-bold text-foreground">${brand.name}</div>`;
										}
									}}
								/>
							</div>
							<span className="text-sm font-medium text-foreground text-center">
								{brand.name}
							</span>
						</motion.div>
					))}
				</motion.div>
			</div>
		</Section>
	);
}

