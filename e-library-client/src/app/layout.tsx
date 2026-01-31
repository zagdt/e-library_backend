import "@/styles/globals.css";
import { Providers } from "./providers";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Resource Hub",
    description: "Your digital library resource hub",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="min-h-screen bg-background font-sans antialiased">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
