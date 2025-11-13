"use client";

import { createContext, useContext, useLayoutEffect, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

type ThemeContextType = {
	theme: Theme;
	toggleTheme: () => void;
	setTheme: (theme: Theme) => void;
	mounted: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): Theme {
	if (typeof window === 'undefined') return 'dark';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [state, setState] = useState<{ theme: Theme; mounted: boolean }>({
		theme: 'dark',
		mounted: false
	});

	// Handle client-side theme initialization
	useEffect(() => {
		let initialTheme: Theme = 'dark';

		// Check localStorage first
		const savedTheme = localStorage.getItem('theme') as Theme | null;
		if (savedTheme === 'light' || savedTheme === 'dark') {
			initialTheme = savedTheme;
		} else {
			// Fall back to system preference
			initialTheme = getSystemTheme();
		}

		setState({ theme: initialTheme, mounted: true });
	}, []);

	const updateDocumentClass = (newTheme: Theme) => {
		if (typeof window === 'undefined') return;
		const root = document.documentElement;
		// Tailwind dark mode only uses 'dark' class
		// When 'dark' is present = dark mode, when absent = light mode
		if (newTheme === 'dark') {
			root.classList.add('dark');
		} else {
			root.classList.remove('dark');
		}
	};

	// Use useLayoutEffect to update DOM synchronously before paint
	useLayoutEffect(() => {
		updateDocumentClass(state.theme);
	}, [state.theme]);

	const toggleTheme = () => {
		setState((prevState) => {
			const newTheme = prevState.theme === 'dark' ? 'light' : 'dark';
			// Update localStorage
			if (typeof window !== 'undefined') {
				localStorage.setItem('theme', newTheme);
			}
			// updateDocumentClass will be called by useLayoutEffect
			return { ...prevState, theme: newTheme };
		});
	};

	const setThemeValue = (newTheme: Theme) => {
		setState((prevState) => ({ ...prevState, theme: newTheme }));
		if (typeof window !== 'undefined') {
			localStorage.setItem('theme', newTheme);
		}
		// updateDocumentClass will be called by useLayoutEffect
	};

	// Always provide the context, even during SSR
	return (
		<ThemeContext.Provider value={{
			theme: state.theme,
			toggleTheme,
			setTheme: setThemeValue,
			mounted: state.mounted
		}}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}
	return context;
}

// Theme Toggle Component
import { Button } from '@/components/ui/Button';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
	const { theme, toggleTheme, mounted } = useTheme();

	// Prevent hydration mismatch by not rendering until mounted
	if (!mounted) {
		return (
			<Button
				variant="ghost"
				size="icon"
				className="relative h-9 w-9 rounded-md"
				aria-label="Toggle theme"
			>
				<Sun className="h-4 w-4" />
				<span className="sr-only">Toggle theme</span>
			</Button>
		);
	}

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={toggleTheme}
			className="relative h-9 w-9 rounded-md"
			aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
		>
			<Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
			<Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}