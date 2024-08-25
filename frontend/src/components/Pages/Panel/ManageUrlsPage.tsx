import * as React from "react";
import { type FC } from "react";
import { Button } from "@UI/button.tsx";
import { type ColumnDef } from "@tanstack/react-table";
import SimpleTable from "@UI/SimpleTable.tsx";
import { ArrowUpDown } from "lucide-react";

interface ShortLink {
	name: string;
	created: Date;
	shortLink: string;
	totalClicks: number;
	lastClick: number;
}

const columns: ColumnDef<ShortLink>[] = [
	{
		accessorKey: "shortLink",
		header: "Link",
	},
	{
		accessorKey: "name",
		cell: ({ row }) => <div className="lowercase">{row.getValue("name")}</div>,

		header: ({ column }) => {
			return (
				<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
					Email
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
	},
];
const data = [
	{ name: "asd", created: "asd" as any, lastClick: 123, totalClicks: 123, shortLink: "asd" },
	{
		name: "Boobs",
		created: "asd" as any,
		lastClick: 123,
		totalClicks: 123,
		shortLink: "asd",
	},
];

const ManageUrlsPage: FC = () => {
	return (
		<div className={"flex flex-col w-full p-6"}>
			<h3 className={"text-left text-3xl mt-5 w-full"}>Manage Your Shorted Links.</h3>
			<hr className={"my-4 w-full"} />
			<div className="flex flex-row items-center justify-between w-full mb-4 mt-4">
				<p>All Links</p>
				<Button type={"button"} variant={"default"}>
					<a href="/panel/create">Create New Link</a>
				</Button>
			</div>
			<SimpleTable pagination data={data} columns={columns} />
		</div>
	);
};

export default ManageUrlsPage;
