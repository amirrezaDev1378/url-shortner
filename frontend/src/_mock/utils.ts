export const CreateMockData = async (data: any) => {
	await new Promise((r) => setTimeout(r, Math.random() * 1000));

	return data;
};
