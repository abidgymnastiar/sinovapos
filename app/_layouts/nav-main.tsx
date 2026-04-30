"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Collapsible } from "radix-ui";
import { ChevronDownIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

type NavMainItem = {
  title: string;
  url: string;
  icon?: React.ReactNode;
  items?: {
    title: string;
    url: string;
    icon?: React.ReactNode;
  }[];
};

function isActivePath(pathname: string, url: string) {
  if (url === "#") {
    return false;
  }

  return pathname === url || pathname.startsWith(`${url}/`);
}

export function NavMain({
  items,
}: {
  items: NavMainItem[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            const hasSubItems = item.items && item.items.length > 0;
            const isActive =
              isActivePath(pathname, item.url) ||
              Boolean(
                item.items?.some((subItem) =>
                  isActivePath(pathname, subItem.url),
                ),
              );

            if (hasSubItems) {
              return (
                <Collapsible.Root
                  key={item.title}
                  asChild
                  defaultOpen={isActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <Collapsible.Trigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={isActive}
                      >
                        {item.icon}
                        <span>{item.title}</span>
                        <ChevronDownIcon className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                      </SidebarMenuButton>
                    </Collapsible.Trigger>
                    <Collapsible.Content>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isActivePath(pathname, subItem.url)}
                            >
                              <Link href={subItem.url}>
                                {subItem.icon}
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </Collapsible.Content>
                  </SidebarMenuItem>
                </Collapsible.Root>
              );
            }

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive}
                >
                  <Link href={item.url}>
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
