"use client";

import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingStateProps {
	message?: string;
	fullScreen?: boolean;
}

export default function LoadingState({ message = 'Loading...', fullScreen = false }: LoadingStateProps) {
	return (
		<Box
			sx={{
				minHeight: fullScreen ? '100vh' : 240,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 2,
				bgcolor: fullScreen ? 'var(--background)' : 'transparent',
			}}
		>
			<CircularProgress size={fullScreen ? 48 : 32} sx={{ color: 'var(--accent-gold)' }} />
			{message && (
				<Typography
					sx={{
						fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.95rem' },
						color: 'var(--text-secondary)',
					}}
				>
					{message}
				</Typography>
			)}
		</Box>
	);
}
