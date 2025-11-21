import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type DashboardSurfaceProps = {
	children: ReactNode;
	className?: string;
	noPadding?: boolean;
};

export function DashboardSurface({ children, className, noPadding = false }: DashboardSurfaceProps) {
	return (
		<div
			className={cn(
				'relative mx-auto flex w-full max-w-[1380px] flex-col gap-3 px-3 py-4 sm:px-5 lg:px-8',
				'text-[#0f172a]',
				noPadding && 'px-0 sm:px-0',
				className,
			)}
		>
			{children}
		</div>
	);
}

type DashboardHeaderMeta = {
	label: string;
	value: string | number;
	helper?: string;
	intent?: 'default' | 'positive' | 'warning' | 'critical';
};

interface DashboardHeaderProps {
	title: string;
	description?: string;
	meta?: DashboardHeaderMeta[];
	actions?: ReactNode;
	className?: string;
}

export function DashboardHeader({ title, description, meta, actions, className }: DashboardHeaderProps) {
	return (
		<div
			className={cn(
				'flex flex-col gap-3 rounded-2xl border border-[#e4e9f2] bg-white px-4 py-4 text-[#0f172a] shadow-[0_12px_30px_rgba(15,23,42,0.08)]',
				'sm:flex-row sm:items-center sm:justify-between',
				className,
			)}
		>
			<div className="flex flex-col gap-1">
				<p className="text-[0.65rem] uppercase tracking-[0.28em] text-[#94a3b8]">Jacxi Mission Control</p>
				<h1 className="text-[1.05rem] font-semibold leading-tight text-[#0f172a] md:text-[1.25rem]">{title}</h1>
				{description && <p className="text-[0.9rem] text-[#4b5563]">{description}</p>}
			</div>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
				{meta && meta.length > 0 && (
					<div className="flex flex-wrap gap-2 text-sm text-[#475569]">
						{meta.map((item) => (
							<div
								key={`${item.label}-${item.value}`}
								className={cn(
									'min-w-[110px] rounded-xl border px-3 py-2 bg-white',
									item.intent === 'positive' && 'border-emerald-100 text-emerald-700 bg-emerald-50',
									item.intent === 'warning' && 'border-[#cbd5ff] text-[#1d4ed8] bg-[#eef2ff]',
									item.intent === 'critical' && 'border-rose-100 text-rose-700 bg-rose-50',
									(!item.intent || item.intent === 'default') && 'border-[#e2e8f0] text-[#0f172a]',
								)}
							>
								<p className="text-[0.65rem] uppercase tracking-[0.2em] text-[#94a3b8]">{item.label}</p>
								<p className="text-[1rem] font-semibold">{item.value}</p>
								{item.helper && <p className="text-[0.7rem] text-[#94a3b8]">{item.helper}</p>}
							</div>
						))}
					</div>
				)}
				{actions && <div className="flex flex-wrap items-center gap-2 sm:justify-end">{actions}</div>}
			</div>
		</div>
	);
}

interface DashboardPanelProps {
	title?: string;
	description?: string;
	children: ReactNode;
	actions?: ReactNode;
	className?: string;
	bodyClassName?: string;
	noHeaderBorder?: boolean;
	noBodyPadding?: boolean;
	fullHeight?: boolean;
	footer?: ReactNode;
}

export function DashboardPanel({
	title,
	description,
	children,
	actions,
	className,
	bodyClassName,
	noHeaderBorder = false,
	noBodyPadding = false,
	fullHeight = false,
	footer,
}: DashboardPanelProps) {
	return (
		<section
			className={cn(
				'relative flex flex-col rounded-2xl border border-[#e4e9f2] bg-white text-[#0f172a] shadow-[0_16px_40px_rgba(15,23,42,0.08)]',
				fullHeight && 'h-full',
				className,
			)}
		>
			{(title || description || actions) && (
				<header
					className={cn(
						'flex flex-col gap-1 px-4 pt-4 text-[#0f172a] sm:flex-row sm:items-center sm:justify-between',
						noHeaderBorder ? 'pb-1' : 'border-b border-[#edf1f7] pb-3',
					)}
				>
					<div className="flex flex-col gap-0.5">
						{title && <p className="text-[0.95rem] font-semibold tracking-tight text-[#0f172a]">{title}</p>}
						{description && <p className="text-[0.8rem] text-[#64748b]">{description}</p>}
					</div>
					{actions && <div className="flex flex-shrink-0 items-center gap-2 text-[0.8rem]">{actions}</div>}
				</header>
			)}
			<div className={cn('flex-1', noBodyPadding ? '' : 'px-4 pb-4 pt-3', bodyClassName)}>{children}</div>
			{footer && (
				<footer className="border-t border-[#edf1f7] px-4 py-3 text-[0.75rem] text-[#94a3b8]">
					{footer}
				</footer>
			)}
		</section>
	);
}

interface DashboardGridProps {
	children: ReactNode;
	className?: string;
}

export function DashboardGrid({ children, className }: DashboardGridProps) {
	return <div className={cn('grid gap-3', className)}>{children}</div>;
}
