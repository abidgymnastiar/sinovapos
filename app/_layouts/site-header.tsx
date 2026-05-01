"use client";

import { usePathname } from "next/navigation";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

const routeTitles = [
  {
    title: "Beranda",
    url: "/",
  },
  {
    title: "Dashboard",
    url: "/dashboard",
  },
  {
    title: "Produk",
    url: "/produk",
  },
  {
    title: "Penjualan Hari Ini",
    url: "/penjualan/hari-ini",
  },
  {
    title: "Seluruh Penjualan",
    url: "/penjualan/seluruh",
  },
  {
    title: "Penjualan",
    url: "/penjualan",
  },
  {
    title: "Laporan",
    url: "/laporan",
  },
];

function formatSegmentTitle(segment: string) {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getPageTitle(pathname: string) {
  const normalizedPathname =
    pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;

  if (/^\/produk\/[^/]+$/.test(normalizedPathname)) {
    return "Detail Produk";
  }

  const matchedRoute = routeTitles.find(
    (route) =>
      normalizedPathname === route.url ||
      (route.url !== "/" && normalizedPathname.startsWith(`${route.url}/`)),
  );

  if (matchedRoute) {
    return matchedRoute.title;
  }

  const lastSegment = normalizedPathname.split("/").filter(Boolean).at(-1);

  return lastSegment ? formatSegmentTitle(lastSegment) : "Beranda";
}

export function SiteHeader() {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear ">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="font-heading text-base font-semibold tracking-tight">
          {pageTitle}
        </h1>
      </div>
    </header>
  );
}
