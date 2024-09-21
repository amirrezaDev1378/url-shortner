import { FormProvider as Form, type UseFormReturn } from "react-hook-form";
import React from "react";

type Props = {
	children: React.ReactNode;
	methods: UseFormReturn<any>;
	onSubmit?: VoidFunction;
	/**
	 * This only works if onSubmit is not defined
	 */
	preventDefault?: boolean;
} & React.HTMLAttributes<HTMLFormElement>;

export default function AppFormProvider({ children, onSubmit, methods, preventDefault = true, ...formProps }: Props) {
	const shouldPreventDefault = !onSubmit && preventDefault;
	console.log({ shouldPreventDefault });
	const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		if (shouldPreventDefault) return e.preventDefault();
		if (typeof onSubmit === "function") return onSubmit();
	};

	return (
		<Form {...methods}>
			<form action={shouldPreventDefault ? "#" : undefined} onSubmit={onFormSubmit} {...formProps}>
				{children}
			</form>
		</Form>
	);
}
