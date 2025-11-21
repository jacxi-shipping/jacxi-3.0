"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Visibility, VisibilityOff, Email, Lock, ArrowForward } from '@mui/icons-material';
import { 
	Button, 
	TextField, 
	InputAdornment, 
	IconButton, 
	Alert, 
	CircularProgress, 
	Box, 
	Typography,
	Paper
} from '@mui/material';

export default function SignInPage() {
	const { t } = useTranslation();
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError('');

		try {
			const result = await signIn('credentials', {
				email,
				password,
				redirect: false,
			});

			if (result?.error) {
				setError('Invalid email or password');
			} else {
				router.push('/dashboard');
			}
		} catch {
			setError('An error occurred. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};


	return (
		<Box
			sx={{
				minHeight: '100vh',
				bgcolor: '#f5f7fb',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				py: { xs: 6, sm: 10 },
				px: { xs: 2, sm: 3, lg: 4 },
			}}
		>
			{/* Main Content */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				style={{ maxWidth: 448, width: '100%', position: 'relative', zIndex: 10 }}
			>
				{/* Glass Card */}
				<Paper
					elevation={0}
					sx={{
						position: 'relative',
						borderRadius: 4,
						background: 'white',
						border: '1px solid rgba(226, 232, 240, 0.9)',
						boxShadow: '0 25px 60px rgba(15, 23, 42, 0.12)',
						p: { xs: 4, sm: 5 },
						overflow: 'hidden',
					}}
				>
					<Box sx={{ position: 'relative', zIndex: 1 }}>
						{/* Header */}
						<Box sx={{ textAlign: 'center', mb: 3 }}>
							<Typography
								variant="h3"
								sx={{
									fontSize: { xs: '1.875rem', sm: '2.25rem' },
									fontWeight: 700,
									color: '#0f172a',
									mb: 1,
								}}
							>
								{t('auth.signIn')}
							</Typography>
							<Typography
								variant="body1"
								sx={{
									color: '#475569',
								}}
							>
								{t('auth.signInSubtitle')}
							</Typography>
						</Box>

						{/* Error Message */}
						{error && (
							<Alert 
								severity="error"
								sx={{
									mb: 2,
									bgcolor: 'rgba(248, 113, 113, 0.15)',
									border: '1px solid rgba(248, 113, 113, 0.4)',
									color: '#b91c1c',
									'& .MuiAlert-icon': {
										color: '#b91c1c',
									},
								}}
							>
								{error}
							</Alert>
						)}

						{/* Form */}
						<Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
							{/* Email Field */}
							<Box>
								<Typography
									component="label"
									htmlFor="email"
									sx={{
										display: 'block',
										fontSize: '0.875rem',
										fontWeight: 500,
										color: '#0f172a',
										mb: 1,
									}}
								>
									{t('auth.email')}
								</Typography>
								<TextField
									id="email"
									type="email"
									fullWidth
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									placeholder="Enter your email"
									autoComplete="email"
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<Email sx={{ fontSize: 20, color: '#94a3b8' }} />
											</InputAdornment>
										),
									}}
									sx={{
										'& .MuiOutlinedInput-root': {
											bgcolor: '#f8fafc',
											borderRadius: 2,
											color: '#0f172a',
											'& fieldset': {
												borderColor: 'rgba(226, 232, 240, 0.9)',
											},
											'&:hover fieldset': {
												borderColor: '#cbd5f5',
											},
											'&.Mui-focused fieldset': {
												borderColor: '#0f62fe',
												borderWidth: 2,
											},
											'& input': {
												color: '#0f172a',
												'&::placeholder': {
													color: '#94a3b8',
													opacity: 1,
												},
												'&:-webkit-autofill': {
													WebkitBoxShadow: '0 0 0 100px #f8fafc inset',
													WebkitTextFillColor: '#0f172a',
												},
											},
										},
									}}
								/>
							</Box>

							{/* Password Field */}
							<Box>
								<Typography
									component="label"
									htmlFor="password"
									sx={{
										display: 'block',
										fontSize: '0.875rem',
										fontWeight: 500,
										color: '#0f172a',
										mb: 1,
									}}
								>
									{t('auth.password')}
								</Typography>
								<TextField
									id="password"
									type={showPassword ? 'text' : 'password'}
									fullWidth
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									placeholder="Enter your password"
									autoComplete="current-password"
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<Lock sx={{ fontSize: 20, color: '#94a3b8' }} />
											</InputAdornment>
										),
										endAdornment: (
											<InputAdornment position="end">
												<IconButton
													onClick={() => setShowPassword(!showPassword)}
													edge="end"
													sx={{
														color: '#0f62fe',
														'&:hover': {
															color: '#1d4ed8',
														},
													}}
												>
													{showPassword ? (
														<VisibilityOff sx={{ fontSize: 20 }} />
													) : (
														<Visibility sx={{ fontSize: 20 }} />
													)}
												</IconButton>
											</InputAdornment>
										),
									}}
									sx={{
										'& .MuiOutlinedInput-root': {
											bgcolor: '#f8fafc',
											borderRadius: 2,
											color: '#0f172a',
											'& fieldset': {
												borderColor: 'rgba(226, 232, 240, 0.9)',
											},
											'&:hover fieldset': {
												borderColor: '#cbd5f5',
											},
											'&.Mui-focused fieldset': {
												borderColor: '#0f62fe',
												borderWidth: 2,
											},
											'& input': {
												color: '#0f172a',
												'&::placeholder': {
													color: '#94a3b8',
													opacity: 1,
												},
												'&:-webkit-autofill': {
													WebkitBoxShadow: '0 0 0 100px #f8fafc inset',
													WebkitTextFillColor: '#0f172a',
												},
											},
										},
									}}
								/>
							</Box>

							{/* Submit Button */}
							<Button
								type="submit"
								disabled={isLoading}
								variant="contained"
								size="large"
								endIcon={!isLoading && <ArrowForward />}
								sx={{
									width: '100%',
								bgcolor: '#0f62fe',
								color: 'white',
									fontWeight: 600,
									py: 1.5,
									fontSize: '1rem',
									'&:hover': {
									bgcolor: '#0b4ed8',
									},
									'&:disabled': {
									bgcolor: 'rgba(15, 98, 254, 0.5)',
									color: 'rgba(255, 255, 255, 0.85)',
									},
								}}
							>
								{isLoading ? (
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										<CircularProgress size={20} sx={{ color: 'white' }} />
										<Typography component="span">{t('auth.signingIn')}</Typography>
									</Box>
								) : (
									<Typography component="span">{t('auth.signIn')}</Typography>
								)}
							</Button>
						</Box>

						{/* Sign Up Link */}
						<Box sx={{ textAlign: 'center', pt: 2 }}>
							<Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#475569' }}>
								{t('auth.dontHaveAccount')}{' '}
								<Typography
									component="button"
									onClick={() => router.push('/auth/signup')}
									sx={{
										background: 'none',
										border: 'none',
										color: '#0f62fe',
										fontWeight: 500,
										cursor: 'pointer',
										transition: 'color 0.2s ease',
										'&:hover': {
											color: '#1d4ed8',
										},
									}}
								>
									{t('auth.signUp')}
								</Typography>
							</Typography>
						</Box>
					</Box>
				</Paper>
			</motion.div>
		</Box>
	);
}


