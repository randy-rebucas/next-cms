/**
 * Default theme — inc/nav-menus.ts
 * Nav-menu helper utilities.
 * WordPress: wp_nav_menu() / get_nav_menu_items() equivalent.
 */

import connectDB from "@/lib/mongoose";
import { Menu } from "@/models/Menu";
import type { NavItem } from "../components/Navbar";

/**
 * Fetch sorted nav items for a registered menu location.
 * Returns an empty array if no menu is configured for that location.
 *
 * WordPress: wp_nav_menu([ 'theme_location' => $location ])
 */
export async function getMenuItems(location: string): Promise<NavItem[]> {
  try {
    await connectDB();
    const menu = await Menu.findOne({ location }).lean() as {
      items?: (NavItem & { order?: number })[];
    } | null;

    if (!menu?.items?.length) return [];

    return menu.items
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  } catch {
    return [];
  }
}

/**
 * Returns true if a menu has been assigned to the given location.
 *
 * WordPress: has_nav_menu( $location )
 */
export async function hasNavMenu(location: string): Promise<boolean> {
  try {
    await connectDB();
    const exists = await Menu.exists({ location });
    return !!exists;
  } catch {
    return false;
  }
}
