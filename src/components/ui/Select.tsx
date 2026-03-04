import * as React from "react";
import { cn } from "../../utils/cn";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
	label?: string;
	error?: string;
	options: { value: string; label: string }[];
	placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
	({ className, label, error, options, placeholder, id, ...props }, ref) => {
		const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

		return (
			<div className="flex flex-col gap-1.5">
				{label && (
					<label
						htmlFor={selectId}
						className="text-sm font-medium text-gray-700"
					>
						{label}
					</label>
				)}
				<select
					id={selectId}
					ref={ref}
					className={cn(
						"w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900",
						"transition-colors duration-150",
						"focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
						"disabled:cursor-not-allowed disabled:bg-gray-50",
						error && "border-red-400",
						className,
					)}
					{...props}
				>
					{placeholder && (
						<option value="" disabled>
							{placeholder}
						</option>
					)}
					{options.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</select>
				{error && <p className="text-xs text-red-600">{error}</p>}
			</div>
		);
	},
);

Select.displayName = "Select";
