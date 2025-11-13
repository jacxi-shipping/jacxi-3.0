"use client";

import { createContext, useContext, useLayoutEffect, useState, useEffect, startTransition } from 'react';

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

function getInitialTheme(): Theme {
	if (typeof window === 'undefined') return 'dark';
	
	// Check localStorage first
	const savedTheme = localStorage.getItem('theme') as Theme | null;
	if (savedTheme === 'light' || savedTheme === 'dark') {
		return savedTheme;
	}
	
	// Fall back to system preference
	return getSystemTheme();
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	// Use lazy initialization to read from localStorage/system preference
	const [theme, setTheme] = useState<Theme>(getInitialTheme);
	const [mounted, setMounted] = useState(false);

	// Mark as mounted after first render to avoid hydration mismatch
	// Using startTransition to avoid cascading renders warning
	useEffect(() => {
		startTransition(() => {
			setMounted(true);
		});
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
		updateDocumentClass(theme);
	}, [theme]);

	const toggleTheme = () => {
		setTheme((prevTheme) => {
			const newTheme = prevTheme === 'dark' ? 'light' : 'dark';
			// Update localStorage
			if (typeof window !== 'undefined') {
				localStorage.setItem('theme', newTheme);
			}
			// updateDocumentClass will be called by useLayoutEffect
			return newTheme;
		});
	};

	const setThemeValue = (newTheme: Theme) => {
		setTheme(newTheme);
		if (typeof window !== 'undefined') {
			localStorage.setItem('theme', newTheme);
		}
		// updateDocumentClass will be called by useLayoutEffect
	};

	// Always provide the context, even during SSR
	return (
		<ThemeContext.Provider value={{
			theme,
			toggleTheme,
			setTheme: setThemeValue,
			mounted
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