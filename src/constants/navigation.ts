export const NAV_ITEMS = [
    { nameKey: 'dashboard' as const, href: '/', icon: 'dashboard' },
    { nameKey: 'scanner' as const, href: '/intake', icon: 'receipt_long' },
    { nameKey: 'recipes' as const, href: '/generator', icon: 'restaurant_menu' },
] as const;

export type NavItem = typeof NAV_ITEMS[number];
