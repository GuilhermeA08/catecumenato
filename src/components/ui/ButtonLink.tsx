import { createLink, type LinkComponent } from "@tanstack/react-router";
import * as React from "react";
import { cn } from "../../utils/cn";
import { type ButtonVariantProps, buttonVariants } from "./Button";

interface BaseProps
	extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
		ButtonVariantProps {}

const BaseButtonLink = React.forwardRef<HTMLAnchorElement, BaseProps>(
	({ className, variant, size, ...props }, ref) => (
		<a
			ref={ref}
			className={cn(buttonVariants({ variant, size }), className)}
			{...props}
		/>
	),
);
BaseButtonLink.displayName = "BaseButtonLink";

const CreatedButtonLink = createLink(BaseButtonLink);

/** Link do router com aparência de botão (evita <button> dentro de <a>) */
export const ButtonLink: LinkComponent<typeof BaseButtonLink> = (props) => (
	<CreatedButtonLink preload="intent" {...props} />
);
