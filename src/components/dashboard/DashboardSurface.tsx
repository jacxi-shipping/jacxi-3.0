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
				'relative mx-auto flex w-full max-w-[1380px] flex-col gap-3 px-3 py-3 sm:px-4 lg:px-6',
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
				'flex flex-col gap-3 rounded-2xl border border-white/5 bg-[#050f1f]/85 px-4 py-3 text-white shadow-[0_18px_40px_rgba(3,8,20,0.55)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between',
				className,
			)}
		>
			<div className="flex flex-col gap-1">
				<p className="text-[0.65rem] uppercase tracking-[0.3em] text-white/45">Jacxi Mission Control</p>
				<h1 className="text-[1rem] font-semibold leading-tight text-white md:text-[1.15rem]">{title}</h1>
				{description && <p className="text-[0.8rem] text-white/60">{description}</p>}
			</div>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
				{meta && meta.length > 0 && (
					<div className="flex flex-wrap gap-2 text-sm text-white/70">
						{meta.map((item) => (
							<div
								key={`${item.label}-${item.value}`}
								className={cn(
									'min-w-[110px] rounded-xl border px-3 py-2',
									item.intent === 'positive' && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
									item.intent === 'warning' && 'border-amber-500/30 bg-amber-500/10 text-amber-100',
									item.intent === 'critical' && 'border-rose-500/30 bg-rose-500/10 text-rose-200',
									(!item.intent || item.intent === 'default') && 'border-white/10 bg-white/5 text-white/80',
								)}
							>
								<p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/60">{item.label}</p>
								<p className="text-[0.95rem] font-semibold">{item.value}</p>
								{item.helper && <p className="text-[0.65rem] text-white/60">{item.helper}</p>}
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
				'relative flex flex-col rounded-2xl border border-white/5 bg-[#040b18]/92 text-white shadow-[0_20px_50px_rgba(2,8,30,0.55)] backdrop-blur-2xl',
				fullHeight && 'h-full',
				className,
			)}
		>
			{(title || description || actions) && (
				<header
					className={cn(
						'flex flex-col gap-1 px-3 pt-3 text-white sm:flex-row sm:items-center sm:justify-between',
						noHeaderBorder ? 'pb-1' : 'border-b border-white/5 pb-2',
					)}
				>
					<div className="flex flex-col gap-0.5">
						{title && <p className="text-[0.92rem] font-semibold tracking-tight text-white">{title}</p>}
						{description && <p className="text-[0.75rem] text-white/65">{description}</p>}
					</div>
					{actions && <div className="flex flex-shrink-0 items-center gap-2 text-[0.8rem]">{actions}</div>}
				</header>
			)}
			<div className={cn('flex-1', noBodyPadding ? '' : 'px-3 pb-3 pt-2', bodyClassName)}>{children}</div>
			{footer && (
				<footer className="border-t border-white/5 px-3 py-2 text-[0.75rem] text-white/60">
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
