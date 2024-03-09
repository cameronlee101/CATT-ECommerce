"use client";

import { getSession } from "@/app/auth";
import { Button, Link } from "@nextui-org/react";
import React, { useState, useEffect } from "react";
import UserControls from "../UserControls/UserControls";

const SigninButton = () => {
	const [validSession, setValidSession] = useState(false);

	useEffect(() => {
		checkForSession();
	}, []);

	async function checkForSession() {
		const session = await getSession();
		if (session) {
			setValidSession(true);
		} else {
			setValidSession(false);
		}
	}

	return (
		<>
			{validSession ? (
				<UserControls />
			) : (
				<Button as={Link} color="primary" href="/signin" variant="flat">
					Sign In
				</Button>
			)}
		</>
	);
};

export default SigninButton;
