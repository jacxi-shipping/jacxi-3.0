"use client";

import { motion } from 'framer-motion';
import { CheckCircle2, DollarSign, Globe, Radio } from 'lucide-react';
import Section from '@/components/layout/Section';
import { defaultViewport, fadeInUp, makeSmooth } from '@/lib/motion';

const FEATURES = [
	{
		icon: CheckCircle2,
		title: 'Guaranteed Delivery',
	},
	{
		icon: DollarSign,
		title: 'Transparent Pricing',
	},
	{
		icon: Globe,
		title: 'USA-UAE Expertise',
	},
	{
		icon: Radio,
		title: 'Live Tracking',
	},
];

const STEPS = [
	{ label: 'Book' },
	{ label: 'Pick-Up' },
	{ label: 'Loading' },
	{ label: 'Sailing' },
];

export default function WhyChooseUs() {
	return (
		<Section className="bg-theme-section-alt py-16 sm:py-20 lg:py-24">
			<div className="max-w-6xl mx-auto">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
					{/* Why Choose Us Column */}
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={defaultViewport}
						transition={makeSmooth({ duration: 0.7 })}
					>
						<h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">
							Why Choose Us
						</h2>
						<div className="grid grid-cols-2 gap-4">
							{FEATURES.map((feature, index) => {
								const Icon = feature.icon;
								return (
									<motion.div
										key={feature.title}
										initial={{ opacity: 0, y: 20 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={defaultViewport}
										transition={makeSmooth({ duration: 0.5, delay: index * 0.1 })}
										className="bg-card rounded-lg p-4 border border-border hover:shadow-md transition-shadow duration-300"
									>
										<div className="flex items-center gap-3">
											<Icon className="w-5 h-5 text-accent flex-shrink-0" />
											<span className="text-sm font-medium text-foreground">
												{feature.title}
											</span>
										</div>
									</motion.div>
								);
							})}
						</div>
					</motion.div>

					{/* How It Works Column */}
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={defaultViewport}
						transition={makeSmooth({ duration: 0.7 })}
					>
						<h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">
							How It Works
						</h2>
						<div className="space-y-4">
							{STEPS.map((step, index) => (
								<motion.div
									key={step.label}
									initial={{ opacity: 0, x: 20 }}
									whileInView={{ opacity: 1, x: 0 }}
									viewport={defaultViewport}
									transition={makeSmooth({ duration: 0.5, delay: index * 0.1 })}
									className="bg-card rounded-lg p-4 border border-border hover:shadow-md transition-all duration-300 flex items-center justify-between group cursor-pointer"
								>
									<span className="text-sm font-medium text-foreground">
										{step.label}
									</span>
									<svg
										className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 5l7 7-7 7"
										/>
									</svg>
								</motion.div>
							))}
						</div>
					</motion.div>
				</div>
			</div>
		</Section>
	);
}

