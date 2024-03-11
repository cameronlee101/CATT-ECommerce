import TopNavbar from "@/components/TopNavbar/TopNavbar";
import Link from "next/link";
import React from "react";

function page() {
	return (
		<>
			<TopNavbar />
			<main className="flex flex-col items-center mb-16">
				<h3 className="mt-8 mx-4 text-2xl">My Product Listings</h3>
				<div className="flex flex-col flex-1 text-center w-full mb-10 mt-8">
					<p>TODO: create components to fetch product listing for this user</p>
					<Link
						href={"/product-listings/create-listing"}
						className="text-blue-500"
					>
						CREATE NEW LISTING
					</Link>
				</div>
			</main>
		</>
	);
}

export default page;
