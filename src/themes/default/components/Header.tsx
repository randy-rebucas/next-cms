/**
 * Default theme — components/Header.tsx
 * WordPress equivalent: header.php / get_header()
 *
 * Canonical name per theme structure. Re-exports the Navbar implementation so
 * both `./Header` and `./Navbar` resolve to the same component.
 *
 * Use this import path in new code:
 *   import Header from "@/themes/default/components/Header";
 */
export { default, type NavItem } from "./Navbar";
