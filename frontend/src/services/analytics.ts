import { useEffect, useState } from "react";
import {
	TopBrowserAnalytics,
	TopDeviceAnalytics,
	TopLinks,
	TopLocationsByCity,
	TopLocationsByCountry,
	TopOSAnalytics,
	TotalClicks,
} from "@/_mock/data.ts";
import { CreateMockData } from "@/_mock/utils.ts";

export const useAnalyticsByDevice = (device: "device" | "browser" | "OS") => {
	const mockDataByDevice = {
		device: TopDeviceAnalytics,
		browser: TopBrowserAnalytics,
		OS: TopOSAnalytics,
	};
	const [data, setData] = useState({
		data: null,
		loading: true,
		error: null,
	});

	useEffect(() => {
		setData((p) => ({ ...p, loading: true }));
		if (!(device in mockDataByDevice))
			return setData({
				loading: false,
				data: null,
				error: "Invalid Device",
			});
		CreateMockData(mockDataByDevice[device]).then((r) =>
			setData({
				data: r,
				error: null,
				loading: false,
			})
		);
	}, [device]);

	return data;
};
export const useAnalyticsByLocation = (type: "country" | "city") => {
	const [data, setData] = useState({
		data: null,
		loading: true,
		error: null,
	});
	const mockDataByLocation = {
		country: TopLocationsByCountry,
		city: TopLocationsByCity,
	};
	useEffect(() => {
		setData((p) => ({ ...p, loading: true }));
		if (!(type in mockDataByLocation))
			return setData({
				loading: false,
				data: null,
				error: "Invalid Device",
			});
		CreateMockData(mockDataByLocation[type]).then((r) =>
			setData({
				data: r,
				error: null,
				loading: false,
			})
		);
	}, [type]);

	return data;
};

export const useTopLinkAnalytics = () => {
	const [data, setData] = useState({
		data: null,
		loading: true,
		error: null,
	});
	useEffect(() => {
		setData((p) => ({ ...p, loading: true }));
		CreateMockData(TopLinks).then((r) =>
			setData({
				data: r,
				error: null,
				loading: false,
			})
		);
	}, []);

	return data;
};

export const useTotalClicksAnalytics = () => {
	const [data, setData] = useState({
		data: null,
		loading: true,
		error: null,
	});
	useEffect(() => {
		setData((p) => ({ ...p, loading: true }));
		CreateMockData(TotalClicks).then((r) =>
			setData({
				data: r,
				error: null,
				loading: false,
			})
		);
	}, []);

	return data;
};
