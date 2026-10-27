import * as React from "react";
import { cn } from "../../utils/cn";

export const controlClasses = cn(
	"w-full rounded-[10px] border border-line-strong bg-surface px-3 text-sm text-ink",
	"placeholder:text-subtle transition-colors duration-150",
	"focus:border-accent focus:outline-none focus:ring-3 focus:ring-accent/15",
	"disabled:cursor-not-allowed disabled:bg-sidebar disabled:text-muted",
	"aria-invalid:border-danger aria-invalid:focus:ring-danger/15",
);

interface FieldProps {
	label?: string;
	error?: string;
	hint?: string;
	required?: boolean;
	id: string;
	className?: string;
	children: React.ReactNode;
}

/** Rótulo + controle + mensagem de erro/ajuda */
export function Field({
	label,
	error,
	hint,
	required,
	id,
	className,
	children,
}: FieldProps) {
	return (
		<div className={cn("flex flex-col gap-1.5", className)}>
			{label && (
				<label htmlFor={id} className="text-[13px] font-medium text-ink-2">
					{label}
					{required && (
						<span className="text-accent" aria-hidden="true">
							{" "}
							*
						</span>
					)}
				</label>
			)}
			{children}
			{error ? (
				<p id={`${id}-erro`} className="text-xs text-danger-ink">
					{error}
				</p>
			) : (
				hint && (
					<p id={`${id}-ajuda`} className="text-xs text-muted">
						{hint}
					</p>
				)
			)}
		</div>
	);
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
	hint?: string;
	wrapperClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
	(
		{ className, wrapperClassName, label, error, hint, id, required, ...props },
		ref,
	) => {
		const autoId = React.useId();
		const inputId = id ?? autoId;
		return (
			<Field
				id={inputId}
				label={label}
				error={error}
				hint={hint}
				required={required}
				className={wrapperClassName}
			>
				<input
					id={inputId}
					ref={ref}
					required={required}
					aria-invalid={error ? true : undefined}
					aria-describedby={
						error ? `${inputId}-erro` : hint ? `${inputId}-ajuda` : undefined
					}
					className={cn(controlClasses, "h-10", className)}
					{...props}
				/>
			</Field>
		);
	},
);
Input.displayName = "Input";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	label?: string;
	error?: string;
	hint?: string;
	wrapperClassName?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, wrapperClassName, label, error, hint, id, ...props }, ref) => {
		const autoId = React.useId();
		const inputId = id ?? autoId;
		return (
			<Field
				id={inputId}
				label={label}
				error={error}
				hint={hint}
				className={wrapperClassName}
			>
				<textarea
					id={inputId}
					ref={ref}
					aria-invalid={error ? true : undefined}
					className={cn(controlClasses, "min-h-20 py-2", className)}
					{...props}
				/>
			</Field>
		);
	},
);
Textarea.displayName = "Textarea";
