import * as React from "react";
import { type FC, useEffect, useState } from "react";
import { Button } from "@UI/button.tsx";
import { type ColumnDef } from "@tanstack/react-table";
import SimpleTable from "@UI/SimpleTable.tsx";
import { GetAllUrlsService } from "@/services/urls.ts";
import { toast } from "@/hooks/useToast.ts";
import { formatDateTime } from "@/lib/datetime.ts";
import { convertShortedURLsToDate } from "@/lib/utils.ts";
import type { GetAllUrlsResponse } from "@/models/generated.ts";

const columns: ColumnDef<GetAllUrlsResponse>[] = [
	{
		accessorKey: "slug",
		header: "Link",
		cell: (e) => {
			const formatted: string = convertShortedURLsToDate(e.getValue() as string)?.toString() || "-";
			return <a href={formatted}>{formatted}</a>;
		},
	},
	{
		accessorKey: "general_redirect_path",
		header: "Redirect Path",
		cell: (e) => {
			const url: string = e.getValue() as string;
			if (!url) return <p>-</p>;
			return <a href={url}>{url}</a>;
		},
	},
	{
		accessorKey: "ios_redirect_path",
		header: "IOS Redirect Path",
		cell: (e) => {
			const url: string = e.getValue() as string;
			if (!url) return <p>-</p>;
			return <a href={url}>{url}</a>;
		},
	},
	{
		accessorKey: "created_at",
		header: "Creation Date",
		cell: (e) => formatDateTime({ date: e.getValue(), fallback: "-" }),
	},
];

const ManageUrlsPage: FC = () => {
	const [urlsServiceData, setUrlsServiceData] = useState<{
		error?: string;
		isLoading?: boolean;
		data?: GetAllUrlsResponse;
	}>({
		error: "",
		isLoading: true,
		data: [],
	});
	useEffect(() => {
		setUrlsServiceData({ isLoading: true });
		GetAllUrlsService()
			.then((r) => {
				setUrlsServiceData({
					error: "",
					data: r.data || [],
				});
			})
			.catch((e) => {
				setUrlsServiceData({ error: e });
				toast({
					variant: "destructive",
					title: "Something went wrong while getting URLs list...",
					description: <Button onClick={(e) => window.location.reload()}>Try To Refresh Page.</Button>,
				});
			})
			.finally(() => {
				setUrlsServiceData((prevState) => ({ ...prevState, isLoading: false }));
			});
	}, []);

	return (
		<div className={"flex w-full flex-col p-6"}>
			<h3 className={"mt-5 w-full text-left text-3xl"}>Manage Your Shorted Links.</h3>
			<hr className={"my-4 w-full"} />
			<div className="mb-4 mt-4 flex w-full flex-row items-center justify-between">
				<p>All Links</p>
				<Button type={"button"} variant={"default"}>
					<a href="/panel/create">Create New Link</a>
				</Button>
			</div>
			<SimpleTable pagination data={urlsServiceData.data as GetAllUrlsResponse} columns={columns} />
		</div>
	);
};

export default ManageUrlsPage;
