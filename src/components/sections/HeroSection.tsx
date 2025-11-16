'use client';

import { motion } from 'framer-motion';
import { ArrowRight, TruckIcon } from 'lucide-react';

export default function HeroSection() {
	return (
		<section className="relative min-h-[600px] md:min-h-[700px] flex items-center overflow-hidden">
			{/* Background Image */}
			<div className="absolute inset-0">
				<div 
					className="w-full h-full bg-cover bg-center bg-no-repeat"
					style={{
						backgroundImage: `linear-gradient(to right, rgba(226, 232, 240, 0.95) 0%, rgba(226, 232, 240, 0.85) 40%, rgba(226, 232, 240, 0.3) 70%, transparent 100%), url('https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=2070&auto=format&fit=crop')`,
					}}
				/>
			</div>

			<div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20 md:py-28 w-full">
				<div className="max-w-2xl">
					{/* Headline */}
					<motion.h1
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-gray-900 mb-6"
					>
						Reliable Vehicle Shipping<br />
						From USA to the Middle East
					</motion.h1>

					{/* Subheadline */}
					<motion.p
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.4 }}
						className="text-lg sm:text-xl text-gray-700 mb-8 leading-relaxed"
					>
						Fast, secure, and fully managed logistics for cars,<br />
						SUVs, motorcycles, and heavy vehicles.
					</motion.p>

					{/* CTA Buttons */}
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.6 }}
						className="flex flex-col sm:flex-row gap-4"
					>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={() => window.location.href = '/auth/signin'}
							className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-md font-semibold transition-all inline-flex items-center justify-center text-base shadow-lg hover:shadow-xl group relative overflow-hidden"
						>
							<span className="relative z-10">Calculate Shipping</span>
							<ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
							<motion.div
								className="absolute inset-0 bg-blue-700"
								initial={{ x: "-100%" }}
								whileHover={{ x: 0 }}
								transition={{ duration: 0.3 }}
							/>
						</motion.button>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={() => window.location.href = '/tracking'}
							className="bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 text-gray-900 px-8 py-3.5 rounded-md font-semibold transition-all inline-flex items-center justify-center text-base shadow-md hover:shadow-lg group"
						>
							<TruckIcon className="mr-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
							Track Shipment
						</motion.button>
					</motion.div>
				</div>
			</div>
		</section>
	);
}

