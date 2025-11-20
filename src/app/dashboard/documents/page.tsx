'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, ShieldCheck, Download, Upload, Search, AlertCircle } from 'lucide-react';
import { Box, Typography, Button as MuiButton } from '@mui/material';

import Section from '@/components/layout/Section';
import { Button } from '@/components/ui/Button';

type DocumentCategory = {
	id: string;
	title: string;
	description: string;
	icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	accent: string;
	documents: Array<{
		id: string;
		name: string;
		type: 'template' | 'upload';
		size?: string;
		updatedAt: string;
		status?: 'required' | 'optional' | 'archived';
	}>;
};

export default function DocumentsPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [search, setSearch] = useState('');

	const categories = useMemo<DocumentCategory[]>(
		() => [
			{
				id: 'templates',
				title: 'Company Templates',
				description: 'Download ready-to-use templates for invoices, statements, customs, and compliance documents.',
				icon: FileText,
				accent: 'from-cyan-500/30 via-cyan-500/20 to-transparent border-cyan-500/40 shadow-cyan-500/20',
				documents: [
					{
						id: 'template-invoice',
						name: 'Invoice Template (PDF)',
						type: 'template',
						size: '2.4 MB',
						updatedAt: '2025-11-01',
						status: 'required',
					},
					{
						id: 'template-bol',
						name: 'Bill of Lading (Editable)',
						type: 'template',
						size: '1.1 MB',
						updatedAt: '2025-10-24',
						status: 'required',
					},
					{
						id: 'template-compliance',
						name: 'Customs Compliance Checklist',
						type: 'template',
						size: '650 KB',
						updatedAt: '2025-10-18',
						status: 'optional',
					},
				],
			},
			{
				id: 'uploads',
				title: 'Uploaded Documents',
				description: 'Track documents uploaded for containers, shipments, and customer records.',
				icon: Upload,
				accent: 'from-blue-500/30 via-blue-500/20 to-transparent border-blue-500/40 shadow-blue-500/20',
				documents: [
					{
						id: 'upload-manifest',
						name: 'Manifest - Container CNT-839AZ',
						type: 'upload',
						size: '4.8 MB',
						updatedAt: '2025-11-06',
						status: 'required',
					},
					{
						id: 'upload-customs',
						name: 'Customs Clearance Proof - REF# 02383',
						type: 'upload',
						size: '3.2 MB',
						updatedAt: '2025-11-05',
						status: 'required',
					},
					{
						id: 'upload-insurance',
						name: 'Insurance Certificate - VIN 5YJ3E1EA7MF123456',
						type: 'upload',
						size: '1.6 MB',
						updatedAt: '2025-11-02',
						status: 'optional',
					},
				],
			},
			{
				id: 'compliance',
				title: 'Compliance & Security',
				description: 'Policies, certifications, and legal references for Jacxi operations.',
				icon: ShieldCheck,
				accent: 'from-purple-500/30 via-purple-500/20 to-transparent border-purple-500/40 shadow-purple-500/20',
				documents: [
					{
						id: 'policy-gdpr',
						name: 'GDPR Compliance Pack',
						type: 'template',
						size: '5.4 MB',
						updatedAt: '2025-10-10',
						status: 'optional',
					},
					{
						id: 'policy-iso',
						name: 'ISO 9001 Certification Overview',
						type: 'template',
						size: '3.6 MB',
						updatedAt: '2025-09-28',
						status: 'optional',
					},
					{
						id: 'policy-sop',
						name: 'Jacxi Security SOP (Internal)',
						type: 'template',
						size: '2.1 MB',
						updatedAt: '2025-09-12',
						status: 'required',
					},
				],
			},
		],
		[]
	);

	const filteredCategories = useMemo(() => {
		const value = search.trim().toLowerCase();
		if (!value) return categories;

		return categories
			.map((category) => ({
				...category,
				documents: category.documents.filter((doc) => doc.name.toLowerCase().includes(value)),
			}))
			.filter((category) => category.documents.length > 0);
	}, [categories, search]);

	const pendingDocumentsCount = useMemo(
		() =>
			categories
				.flatMap((category) => category.documents)
				.filter((doc) => doc.status === 'required').length,
		[categories]
	);

	useEffect(() => {
		if (status === 'loading') return;

		const role = session?.user?.role;
		if (!session || role !== 'admin') {
			router.replace('/dashboard');
		}
	}, [session, status, router]);

	const role = session?.user?.role;
	if (status === 'loading' || !session || role !== 'admin') {
		return (
			<div className="min-h-screen bg-[#020817] flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500/30 border-t-cyan-400" />
			</div>
		);
	}

	return (
		<>
			<Section className="bg-[#020817] py-2 sm:py-3">
				<Box sx={{ px: { xs: 2, sm: 3 } }}>

					<motion.div
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.15 }}
						className="grid grid-cols-1 md:grid-cols-3 gap-4"
					>
						<div className="rounded-xl border border-cyan-500/30 bg-[#0a1628]/70 backdrop-blur-md p-5 shadow-lg shadow-cyan-500/10">
							<p className="text-sm text-white/60">Active Categories</p>
							<p className="text-3xl font-semibold text-white mt-1">{categories.length}</p>
							<p className="text-xs text-white/40 mt-2">Templates, uploads, compliance.</p>
						</div>
						<div className="rounded-xl border border-blue-500/30 bg-[#0a1628]/70 backdrop-blur-md p-5 shadow-lg shadow-blue-500/10">
							<p className="text-sm text-white/60">Required Documents</p>
							<p className="text-3xl font-semibold text-white mt-1">{pendingDocumentsCount}</p>
							<p className="text-xs text-white/40 mt-2">Ensure these remain up to date.</p>
						</div>
						<div className="rounded-xl border border-purple-500/30 bg-[#0a1628]/70 backdrop-blur-md p-5 shadow-lg shadow-purple-500/10">
							<p className="text-sm text-white/60">Storage Usage</p>
							<p className="text-3xl font-semibold text-white mt-1">3.1 GB</p>
							<p className="text-xs text-white/40 mt-2">Includes uploaded manifests and certificates.</p>
						</div>
					</motion.div>
				</Box>
			</Section>

			<Section className="bg-[#020817] py-4 sm:py-6">
				<div className="max-w-6xl mx-auto space-y-10">
					<motion.div
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className="relative rounded-xl border border-cyan-500/30 bg-[#0a1628]/70 backdrop-blur-md p-6 shadow-lg shadow-cyan-500/10"
					>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-cyan-400/70" />
								<input
									value={search}
									onChange={(event) => setSearch(event.target.value)}
									placeholder="Search documents by name..."
									className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#020817] border border-cyan-500/30 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
								/>
							</div>
							<div className="flex flex-wrap gap-3 md:justify-end">
								<Button className="bg-[#00bfff] hover:bg-[#00a8e6] text-white">
									<Download className="w-4 h-4 mr-2" />
									Download All Templates
								</Button>
								<Button variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
									<Upload className="w-4 h-4 mr-2" />
									Upload Document
								</Button>
							</div>
						</div>
					</motion.div>

					{filteredCategories.length === 0 ? (
						<motion.div
							initial={{ opacity: 0, y: 16 }}
							animate={{ opacity: 1, y: 0 }}
							className="rounded-xl border border-cyan-500/30 bg-[#0a1628]/50 backdrop-blur-sm p-16 text-center"
						>
							<AlertCircle className="w-14 h-14 text-white/30 mx-auto mb-4" />
							<p className="text-white/70 text-lg">No documents match “{search}”. Try a different search term.</p>
						</motion.div>
					) : (
						filteredCategories.map((category, idx) => {
							const Icon = category.icon;
							return (
								<motion.div
									key={category.id}
									initial={{ opacity: 0, y: 24 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ duration: 0.5, delay: idx * 0.1 }}
									className="space-y-6"
								>
									<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
										<div className="flex items-center gap-4">
											<div
												className={`w-12 h-12 rounded-xl border flex items-center justify-center bg-gradient-to-br ${category.accent}`}
											>
												<Icon className="w-6 h-6 text-white" strokeWidth={1.5} />
											</div>
											<div>
												<h2 className="text-2xl font-semibold text-white">{category.title}</h2>
												<p className="text-sm text-white/60">{category.description}</p>
											</div>
										</div>
										<Button variant="ghost" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10">
											View All
										</Button>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
										{category.documents.map((document, docIdx) => (
											<motion.div
												key={document.id}
												initial={{ opacity: 0, y: 16 }}
												whileInView={{ opacity: 1, y: 0 }}
												viewport={{ once: true }}
												transition={{ duration: 0.4, delay: docIdx * 0.05 }}
												className="relative rounded-xl border border-cyan-500/20 bg-[#0a1628]/60 backdrop-blur-md p-5 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/10 transition-all"
											>
												<div className="flex items-start justify-between gap-3">
													<div className="space-y-2">
														<p className="text-sm font-semibold text-white">{document.name}</p>
														<div className="flex items-center gap-3 text-xs text-white/50">
															<span className="px-2 py-1 rounded-full border border-white/10 bg-white/5 capitalize">
																{document.type}
															</span>
															{document.size && <span>{document.size}</span>}
															<span>Updated {new Date(document.updatedAt).toLocaleDateString()}</span>
														</div>
													</div>

													{document.status && (
														<span
															className={`px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
																document.status === 'required'
																	? 'bg-red-500/20 border border-red-500/40 text-red-300'
																	: document.status === 'optional'
																	? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-200'
																	: 'bg-white/10 border border-white/20 text-white/60'
															}`}
														>
															{document.status}
														</span>
													)}
												</div>

												<div className="mt-4 flex flex-wrap gap-3 text-xs text-white/50">
													<Button variant="outline" size="sm" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
														<Download className="w-4 h-4 mr-2" />
														Download
													</Button>
													<Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10">
														View Details
													</Button>
												</div>
											</motion.div>
										))}
									</div>
								</motion.div>
							);
						})
					)}
				</div>
			</Section>
		</>
	);
}


