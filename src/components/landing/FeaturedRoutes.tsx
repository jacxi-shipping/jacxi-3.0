"use client";

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Section from '@/components/layout/Section';
import { defaultViewport, fadeInUp, makeSmooth, stagger } from '@/lib/motion';
import Link from 'next/link';

const ROUTES = [
	{ label: 'USA to UAE', href: '/services' },
	{ label: 'USA to Saudi Arabia', href: '/services' },
	{ label: 'USA to Qatar', href: '/services' },
];

export default function FeaturedRoutes() {
	return (
		<Section className="bg-theme-section py-16 sm:py-20 lg:py-24">
			<div className="max-w-4xl mx-auto">
				{/* Section Title */}
				<motion.div
					initial={{ opacity: 0, y: 18 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={defaultViewport}
					transition={makeSmooth({ duration: 0.7 })}
					className="mb-12 text-center"
				>
					<h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
						Featured Routes
					</h2>
				</motion.div>

				{/* Routes List */}
				<motion.div
					variants={stagger({ staggerChildren: 0.1, delayChildren: 0.1 })}
					initial="hidden"
					whileInView="show"
					viewport={defaultViewport}
					className="space-y-4"
				>
					{ROUTES.map((route, index) => (
						<motion.div
							key={route.label}
							variants={fadeInUp({ distance: 20, delay: index * 0.1 })}
						>
							<Link href={route.href}>
								<div className="bg-card rounded-lg p-4 border border-border hover:shadow-md transition-all duration-300 flex items-center justify-between group cursor-pointer">
									<span className="text-base font-medium text-foreground">
										{route.label}
									</span>
									<ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
								</div>
							</Link>
						</motion.div>
					))}
				</motion.div>
			</div>
		</Section>
	);
}

