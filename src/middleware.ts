import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isAuthDisabled = process.env.NEXT_PUBLIC_AUTH_DISABLED === "true";

const isPublicRoute = createRouteMatcher([
	"/login(.*)",
	"/sign-in(.*)",
	"/sign-up(.*)",
	"/sso-callback(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
	if (!isAuthDisabled && !isPublicRoute(request)) {
		await auth.protect();
	}
});

export const config = {
	matcher: [
		"/((?!_next|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot|map)).*)",
	],
};
