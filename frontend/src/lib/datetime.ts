interface FormatDateTimeParams {
	date?: string | Date | any;
	fallback?: string;
	format?: Intl.LocalesArgument;
}

export const formatDateTime = (params: FormatDateTimeParams): string => {
	if (!params.date) return params.fallback || "";
	const date = new Date(params.date);
	const isValidDate = !isNaN(date.getDate());
	if (!isValidDate) return params.fallback || "";

	return date.toLocaleString(params.format || "en-gb");
};
