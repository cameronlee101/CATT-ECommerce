"use client";

import React, { useEffect, useState } from "react";
import { ShoppingCartModal } from "./shoppingCart";
import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Link,
} from "@nextui-org/react";
import { UserTypes } from "@/axios/user.types";
import { WishlistModal } from "./wishlist";
import { logout, validateRequest } from "@/lib/auth_utils";
import { User } from "lucia";

// This component displays when the user is logged, allows them to access their shopping cart, wishlist, logout, etc.
export function UserControls() {
  const [userInfo, setUserInfo] = useState<User>();
  const [wishlistOpen, setWishlistOpen] = useState<boolean>(false);

  // on page load, retrieves the user's google account info and user type
  useEffect(() => {
    retrieveSessionData();
  }, []);

  // sets the wishlist to closed state
  function onWishlistClose() {
    setWishlistOpen(false);
  }

  // retrieves the user's google account info and user type and sets the approriate states
  async function retrieveSessionData() {
    const { user } = await validateRequest();
    if (user) {
      setUserInfo(user);
    }
  }

  // Displays different options for the user depending on their type
  function getUserSpecificOptions(): React.JSX.Element {
    switch (userInfo?.user_type) {
      case UserTypes.Customer:
        return (
          <DropdownItem
            key="become vendor"
            as={Link}
            href="become-vendor"
            className="text-black"
          >
            Become a Vendor
          </DropdownItem>
        );
      case UserTypes.Vendor:
        return (
          <DropdownItem
            key="listings"
            as={Link}
            href="/product-listings"
            className="text-black"
          >
            My Product Listings
          </DropdownItem>
        );
      case UserTypes.Admin:
        return (
          <DropdownItem
            key="admin dashboard"
            as={Link}
            href="/admin-dashboard"
            className="text-black"
          >
            Admin Dashboard
          </DropdownItem>
        );
      default:
        return <></>;
    }
  }

  return (
    <>
      <WishlistModal open={wishlistOpen} onWishlistClose={onWishlistClose} />
      <div className="flex items-center gap-6">
        <ShoppingCartModal />
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              isBordered
              as="button"
              className="transition-transform"
              // TODO src={userInfo?.picture}
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem key="profile">
              <p className="font-semibold">Signed in as</p>
              <p className="font-semibold">
                {userInfo?.user_email || "Loading..."}
                <br />({userInfo?.user_type || "Loading..."})
              </p>
            </DropdownItem>
            <DropdownItem key="wishlist" onClick={() => setWishlistOpen(true)}>
              My Wishlist
            </DropdownItem>
            {getUserSpecificOptions()}
            <DropdownItem key="order-history" href="/order-history">
              My Order History
            </DropdownItem>
            <DropdownItem
              key="logout"
              as={Link}
              href="/"
              color="danger"
              onClick={async () => {
                await logout();
              }}
            >
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </>
  );
}
