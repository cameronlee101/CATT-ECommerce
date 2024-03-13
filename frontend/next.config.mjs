/** @type {import('next').NextConfig} */
const nextConfig = {
	env: {
		GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
		SECRET_KEY: process.env.SECRET_KEY,
		BACKEND_SERVER_BASE_URL: process.env.BACKEND_SERVER_BASE_URL,
		PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
		PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
	},
};

export default nextConfig;
