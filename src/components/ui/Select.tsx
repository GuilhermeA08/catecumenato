import * as React from "react";
import { cn } from "../../utils/cn";
import { controlClasses, Field } from "./Input";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
	label?: string;
	error?: string;
	hint?: string;
	options: { value: string; label: string }[];
	placeholder?: string;
	wrapperClassName?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
	(
		{
			className,
			wrapperClassName,
			label,
			error,
			hint,
			options,
			placeholder,
			id,
			...props
		},
		ref,
	) => {
		const autoId = React.useId();
		const selectId = id ?? autoId;
		return (
			<Field
				id={selectId}
				label={label}
				error={error}
				hint={hint}
				className={wrapperClassName}
			>
				<select
					id={selectId}
					ref={ref}
					aria-invalid={error ? true : undefined}
					className={cn(controlClasses, "h-10 pr-8", className)}
					{...props}
				>
					{placeholder !== undefined && <option value="">{placeholder}</option>}
					{options.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</select>
			</Field>
		);
	},
);
Select.displayName = "Select";
