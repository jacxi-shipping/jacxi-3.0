"use client";

import { DarkMode, LightMode } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useState } from 'react';

export default function ThemeToggle({ className }: { className?: string }) {
	// For now, we'll keep the UI dark mode only as per the design
	// This is a placeholder for future theme toggle functionality
	const [theme] = useState('dark');

	return (
		<IconButton
			aria-label="Toggle theme"
			disabled
			sx={{
				width: 40,
				height: 40,
				color: 'var(--text-secondary)',
				'&:hover': {
					bgcolor: 'rgba(var(--text-secondary-rgb), 0.08)',
				},
			}}
			className={className}
		>
			{theme === 'dark' ? (
				<LightMode sx={{ fontSize: 20 }} />
			) : (
				<DarkMode sx={{ fontSize: 20 }} />
			)}
		</IconButton>
	);
}
