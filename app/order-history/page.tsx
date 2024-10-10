import { TopNavbar } from "@/components/navbar";
import { PastOrders } from "@/components/order-history-page";
import React from "react";

// This page displays all of a user's order history
function page() {
  return (
    <>
      <TopNavbar />
      <main className="mb-16">
        <PastOrders />
      </main>
    </>
  );
}

export default page;
