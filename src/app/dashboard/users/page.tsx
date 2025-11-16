'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Search, User, Mail, Shield, Users, UserPlus, Calendar, Eye, EyeOff, Key, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Section from '@/components/layout/Section';

interface UserData {
	id: string;
	name: string | null;
	email: string;
	role: string;
	createdAt?: string;
}

export default function UsersPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [users, setUsers] = useState<UserData[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [filterRole, setFilterRole] = useState<string>('all');
	const [showEmailsFor, setShowEmailsFor] = useState<Set<string>>(new Set());
	const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

	useEffect(() => {
		if (status === 'loading') return;

		const role = session?.user?.role;
		if (!session || role !== 'admin') {
			router.replace('/dashboard');
			return;
		}

		fetchUsers();
	}, [session, status, router]);

	const fetchUsers = async () => {
		try {
			setLoading(true);
			const response = await fetch('/api/users');
			if (response.ok) {
				const data = await response.json();
				setUsers(data.users || []);
			} else {
				console.error('Failed to fetch users');
			}
		} catch (error) {
			console.error('Error fetching users:', error);
		} finally {
			setLoading(false);
		}
	};

	const filteredUsers = users.filter((user) => {
		const matchesSearch =
			user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.email.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesRole = filterRole === 'all' || user.role === filterRole;
		return matchesSearch && matchesRole;
	});

	const stats = {
		total: users.length,
		admins: users.filter((u) => u.role === 'admin').length,
		regularUsers: users.filter((u) => u.role === 'user').length,
	};

	const getRoleBadgeColor = (role: string) => {
		switch (role) {
			case 'admin':
				return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
			case 'user':
				return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
			default:
				return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
		}
	};

	const formatRole = (role: string) => {
		return role.charAt(0).toUpperCase() + role.slice(1);
	};

	const toggleEmailVisibility = (userId: string) => {
		setShowEmailsFor((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(userId)) {
				newSet.delete(userId);
			} else {
				newSet.add(userId);
			}
			return newSet;
		});
	};

	const copyToClipboard = async (text: string, userId: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopiedEmail(userId);
			setTimeout(() => setCopiedEmail(null), 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	};

	const maskEmail = (email: string) => {
		const [username, domain] = email.split('@');
		if (username.length <= 3) {
			return `${username[0]}***@${domain}`;
		}
		return `${username.substring(0, 3)}***@${domain}`;
	};

	if (status === 'loading' || loading) {
		return (
			<div className="min-h-screen bg-[#020817] flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500/30 border-t-cyan-400"></div>
			</div>
		);
	}

	const role = session?.user?.role;
	if (!session || role !== 'admin') {
		return null;
	}

	return (
		<>
			{/* Header */}
			<Section className="relative bg-[#020817] py-8 sm:py-12 lg:py-16 overflow-hidden">
				{/* Background gradient */}
				<div className="absolute inset-0 bg-gradient-to-br from-[#020817] via-[#0a1628] to-[#020817]" />

				{/* Subtle geometric grid pattern */}
				<div className="absolute inset-0 opacity-[0.03]">
					<svg className="w-full h-full" preserveAspectRatio="none">
						<defs>
							<pattern id="grid-users" width="40" height="40" patternUnits="userSpaceOnUse">
								<path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
							</pattern>
						</defs>
						<rect width="100%" height="100%" fill="url(#grid-users)" className="text-cyan-400" />
					</svg>
				</div>

				<div className="relative z-10">
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className="space-y-2"
						>
							<h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">Users</h1>
							<p className="text-lg sm:text-xl text-white/70">Manage all platform users</p>
						</motion.div>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
						>
							<Link href="/dashboard/users/new">
								<Button
									size="lg"
									className="group relative overflow-hidden bg-[#00bfff] text-white hover:bg-[#00a8e6] shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 px-6 py-3 text-base sm:text-lg font-semibold"
								>
									<UserPlus className="w-5 h-5 mr-2" />
									Create User
								</Button>
							</Link>
						</motion.div>
					</div>
				</div>
			</Section>

			{/* Main Content */}
			<Section className="bg-[#020817] py-8 sm:py-12 lg:py-16">
				{/* Stats Cards */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0 }}
						className="relative rounded-xl bg-[#0a1628]/50 backdrop-blur-sm border border-cyan-500/30 p-6 shadow-lg shadow-cyan-500/10"
					>
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-white/70 mb-1">Total Users</p>
								<p className="text-3xl font-bold text-white">{stats.total}</p>
							</div>
							<div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
								<Users className="w-6 h-6 text-cyan-400" />
							</div>
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.1 }}
						className="relative rounded-xl bg-[#0a1628]/50 backdrop-blur-sm border border-purple-500/30 p-6 shadow-lg shadow-purple-500/10"
					>
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-white/70 mb-1">Admins</p>
								<p className="text-3xl font-bold text-white">{stats.admins}</p>
							</div>
							<div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
								<Shield className="w-6 h-6 text-purple-400" />
							</div>
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className="relative rounded-xl bg-[#0a1628]/50 backdrop-blur-sm border border-green-500/30 p-6 shadow-lg shadow-green-500/10"
					>
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-white/70 mb-1">Regular Users</p>
								<p className="text-3xl font-bold text-white">{stats.regularUsers}</p>
							</div>
							<div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center">
								<User className="w-6 h-6 text-green-400" />
							</div>
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.3 }}
						className="relative rounded-xl bg-[#0a1628]/50 backdrop-blur-sm border border-cyan-500/30 p-6 shadow-lg shadow-cyan-500/10"
					>
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-white/70 mb-1">Filtered Results</p>
								<p className="text-3xl font-bold text-white">{filteredUsers.length}</p>
							</div>
							<div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
								<Search className="w-6 h-6 text-cyan-400" />
							</div>
						</div>
					</motion.div>
				</div>

				{/* Filters */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6, delay: 0.4 }}
					className="mb-8"
				>
					<div className="relative rounded-xl bg-[#0a1628]/50 backdrop-blur-sm border border-cyan-500/30 p-6 shadow-lg shadow-cyan-500/10">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-cyan-400/70" />
								<Input
									type="text"
									placeholder="Search by name or email..."
									className="w-full pl-10 pr-4 py-2 bg-[#020817] border border-cyan-500/30 rounded-lg text-white placeholder:text-white/50 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</div>
							<div className="relative">
								<Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-cyan-400/70" />
								<select
									className="w-full pl-10 pr-4 py-2 bg-[#020817] border border-cyan-500/30 rounded-lg text-white appearance-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
									value={filterRole}
									onChange={(e) => setFilterRole(e.target.value)}
								>
									<option value="all" className="bg-[#020817] text-white">All Roles</option>
									<option value="admin" className="bg-[#020817] text-white">Admin</option>
									<option value="user" className="bg-[#020817] text-white">User</option>
								</select>
							</div>
						</div>
					</div>
				</motion.div>

				{/* Users List */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6, delay: 0.5 }}
				>
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-2xl sm:text-3xl font-bold text-white">
							All Users ({filteredUsers.length})
						</h2>
					</div>

					{loading ? (
						<div className="relative rounded-xl bg-[#0a1628]/50 backdrop-blur-sm border border-cyan-500/30 p-12 text-center">
							<div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-500/30 border-t-cyan-400"></div>
							<p className="mt-4 text-white/70">Loading users...</p>
						</div>
					) : filteredUsers.length === 0 ? (
						<div className="relative rounded-xl bg-[#0a1628]/50 backdrop-blur-sm border border-cyan-500/30 p-12 text-center">
							<User className="w-16 h-16 text-white/30 mx-auto mb-4" />
							<p className="text-white/70 mb-6">No users found</p>
							<Link href="/dashboard/users/new">
								<Button className="bg-[#00bfff] text-white hover:bg-[#00a8e6]">
									<UserPlus className="w-5 h-5 mr-2" />
									Create Your First User
								</Button>
							</Link>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
							{filteredUsers.map((user, index) => (
								<motion.div
									key={user.id}
									initial={{ opacity: 0, y: 20 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ duration: 0.4, delay: index * 0.05 }}
									className="relative rounded-xl bg-[#0a1628]/50 backdrop-blur-sm border border-cyan-500/30 p-6 hover:border-cyan-500/50 transition-all duration-300 shadow-lg shadow-cyan-500/5 hover:shadow-cyan-500/10"
								>
									{/* Header with User Info */}
									<div className="flex items-start justify-between mb-4">
										<div className="flex items-center gap-3 flex-1">
											<div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-400/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
												<User className="w-6 h-6 text-cyan-400" />
											</div>
											<div className="flex-1 min-w-0">
												<h3 className="text-lg font-semibold text-white truncate">
													{user.name || 'No Name'}
												</h3>
												<span
													className={`inline-block px-2 py-0.5 mt-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(
														user.role
													)}`}
												>
													{formatRole(user.role)}
												</span>
											</div>
										</div>
									</div>

									{/* Email Section with Show/Hide */}
									<div className="space-y-2 mb-4">
										<div className="flex items-center justify-between">
											<span className="text-xs text-white/50 flex items-center gap-1">
												<Mail className="w-3 h-3" />
												Email Address
											</span>
											<button
												onClick={() => toggleEmailVisibility(user.id)}
												className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
											>
												{showEmailsFor.has(user.id) ? (
													<>
														<EyeOff className="w-3 h-3" />
														Hide
													</>
												) : (
													<>
														<Eye className="w-3 h-3" />
														Show
													</>
												)}
											</button>
										</div>
										<div className="flex items-center gap-2 bg-[#020817]/50 border border-cyan-500/20 rounded-lg p-2">
											<span className="text-sm text-white/80 font-mono flex-1 truncate">
												{showEmailsFor.has(user.id) ? user.email : maskEmail(user.email)}
											</span>
											{showEmailsFor.has(user.id) && (
												<button
													onClick={() => copyToClipboard(user.email, user.id)}
													className="p-1 hover:bg-cyan-500/10 rounded transition-colors flex-shrink-0"
													title="Copy email"
												>
													{copiedEmail === user.id ? (
														<Check className="w-4 h-4 text-green-400" />
													) : (
														<Copy className="w-4 h-4 text-cyan-400" />
													)}
												</button>
											)}
										</div>
									</div>

									{/* Password Info */}
									<div className="space-y-2 mb-4">
										<div className="flex items-center justify-between">
											<span className="text-xs text-white/50 flex items-center gap-1">
												<Key className="w-3 h-3" />
												Password
											</span>
										</div>
										<div className="flex items-center gap-2 bg-[#020817]/50 border border-cyan-500/20 rounded-lg p-2">
											<span className="text-sm text-white/60 flex-1">
												••••••••••
											</span>
											<span className="text-xs text-white/40 bg-yellow-500/10 border border-yellow-500/30 px-2 py-0.5 rounded">
												Encrypted
											</span>
										</div>
										<p className="text-xs text-white/40 italic">
											Passwords are securely hashed and cannot be viewed
										</p>
									</div>

									{/* Footer with Date */}
									<div className="flex items-center justify-between pt-4 border-t border-cyan-500/10">
										{user.createdAt && (
											<span className="text-xs text-white/50 flex items-center gap-1">
												<Calendar className="w-3 h-3" />
												Joined {new Date(user.createdAt).toLocaleDateString()}
											</span>
										)}
									</div>
								</motion.div>
							))}
						</div>
					)}
				</motion.div>
			</Section>
		</>
	);
}

