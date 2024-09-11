import { z } from "zod";

export const ZodUrl = z.string().trim().min(1).url();

export const zodEnumFromObjectKeys = <K extends string>(object: Record<K, any>): z.ZodEnum<[K, ...K[]]> => {
	const [firstKey, ...otherKeys] = Object.keys(object) as K[];
	return z.enum([firstKey, ...otherKeys]);
};
export const zodEnumFromObjectValues = <K extends string>(object: Record<K, any>): z.ZodEnum<[K, ...K[]]> => {
	const [firstKey, ...otherKeys] = Object.values(object) as K[];
	return z.enum([firstKey, ...otherKeys]);
};
