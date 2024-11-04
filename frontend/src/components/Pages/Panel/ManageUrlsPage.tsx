import * as React from "react";
import { type FC, useEffect, useState } from "react";
import { Button } from "@UI/button.tsx";
import { type ColumnDef } from "@tanstack/react-table";
import SimpleTable from "@UI/SimpleTable.tsx";
import { DeleteUrlService, GetAllUrlsService } from "@/services/urls.ts";
import { toast } from "@/hooks/useToast.ts";
import { formatDateTime } from "@/lib/datetime.ts";
import { convertShortedURLsToDate } from "@/lib/utils.ts";
import type { GetAllUrlsResponse, UrlResponse } from "@/models/generated.ts";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@UI/alert-dialog.tsx";

const columns: ColumnDef<GetAllUrlsResponse>[] = [
	{
		accessorKey: "created_at",
		header: "Creation Date",
		cell: (e) => formatDateTime({ date: e.getValue(), fallback: "-" }),
	},
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

	const [deleteUrlModalInfo, setDeleteUrlModalInfo] = useState({ isOpen: false, id: "" });

	const handleDeleteUrl = (id: string) => () => {
		setDeleteUrlModalInfo({ isOpen: true, id });
	};

	const onDeleteUrlConfirm = (id: string) => {
		DeleteUrlService({ id })
			.then((r) => {
				if (r.data?.success) {
					toast({ variant: "default", title: "URL Deleted Successfully!" });
					setDeleteUrlModalInfo({ isOpen: false, id: "" });
					return fetchUrlsData();
				}
				throw r;
			})
			.catch((e) => {
				toast({ variant: "destructive", title: "Something went wrong while deleting the URL..." });
				console.error(e);
			});
	};
	const fetchUrlsData = () => {
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
					description: <Button onClick={() => window.location.reload()}>Try To Refresh Page.</Button>,
				});
			})
			.finally(() => {
				setUrlsServiceData((prevState) => ({ ...prevState, isLoading: false }));
			});
	};
	useEffect(() => {
		fetchUrlsData();
	}, []);

	const tableActions: ColumnDef<UrlResponse>[] = [
		{
			header: "#",
			cell: (e) => {
				return (
					<div>
						<Button onClick={handleDeleteUrl(e.row.original.id)} variant={"destructive"}>
							Delete
						</Button>
					</div>
				);
			},
		},
	];

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
			<SimpleTable pagination data={urlsServiceData.data as GetAllUrlsResponse} columns={[...columns, ...tableActions]} />

			<AlertDialog
				open={deleteUrlModalInfo.isOpen}
				defaultOpen={false}
				onOpenChange={(state) => setDeleteUrlModalInfo({ isOpen: state, id: "" })}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure to delete that this url? </AlertDialogTitle>
						<AlertDialogDescription>This action can not be undone!</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={() => onDeleteUrlConfirm(deleteUrlModalInfo.id)}>Continue</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};
export default ManageUrlsPage;
