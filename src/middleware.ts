import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./lib/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const protectedPaths = ["/dashboard"];

function isProtectedPath(pathname: string): boolean {
    return protectedPaths.some(
        (p) => pathname.includes(p)
    );
}

export default async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (isProtectedPath(pathname)) {
        const token =
            req.cookies.get("authjs.session-token")?.value ||
            req.cookies.get("__Secure-authjs.session-token")?.value;

        if (!token) {
            const locale = pathname.startsWith("/en") ? "en" : "vi";
            const signInUrl = new URL(`/${locale}/auth/signin`, req.url);
            signInUrl.searchParams.set("callbackUrl", pathname);
            return NextResponse.redirect(signInUrl);
        }
    }

    return intlMiddleware(req);
}

export const config = {
    matcher: ["/", "/(vi|en)/:path*", "/((?!_next|api|favicon.ico|.*\\..*).*)"],
};
