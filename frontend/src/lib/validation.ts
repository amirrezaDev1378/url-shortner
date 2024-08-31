import { z } from "zod";

export const ZodUrl = z.string().trim().min(1).url();

export const zodEnumFromObject = <K extends string>(object: Record<K, any>): z.ZodEnum<[K, ...K[]]> => {
	const [firstKey, ...otherKeys] = Object.keys(object) as K[];
	return z.enum([firstKey, ...otherKeys]);
};
