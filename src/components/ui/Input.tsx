import * as React from "react";
import { cn } from "../../utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
	hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, label, error, hint, id, ...props }, ref) => {
		const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

		return (
			<div className="flex flex-col gap-1.5">
				{label && (
					<label
						htmlFor={inputId}
						className="text-sm font-medium text-gray-700"
					>
						{label}
					</label>
				)}
				<input
					id={inputId}
					ref={ref}
					className={cn(
						"w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400",
						"transition-colors duration-150",
						"focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
						"disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500",
						error &&
							"border-red-400 focus:border-red-500 focus:ring-red-500/20",
						className,
					)}
					{...props}
				/>
				{error && <p className="text-xs text-red-600">{error}</p>}
				{hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
			</div>
		);
	},
);

Input.displayName = "Input";
