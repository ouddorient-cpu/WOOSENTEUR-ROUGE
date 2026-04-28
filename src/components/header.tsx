'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';
import { useUser } from '@/firebase/auth/use-user';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getAuth, signOut } from 'firebase/auth';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, LayoutDashboard, Shield, Menu, Sparkles, Megaphone, Database, Zap, ShoppingBag } from 'lucide-react';
import { useDoc } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { useMemo, useState } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { CoinIndicator } from './ui/coin-indicator';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useLang } from '@/lib/i18n/LangContext';
import { useT } from '@/lib/i18n/useT';

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) return names[0][0] + names[names.length - 1][0];
    return name.substring(0, 2);
};

const AdminBadge = () => (
    <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-sm">
        <Shield className="h-4 w-4 text-violet-400" />
        <span className="font-bold text-violet-300">ADMIN</span>
        <span className="hidden lg:inline text-violet-400">∞ crédits</span>
    </div>
);

const LangSwitcher = () => {
    const { lang, setLang } = useLang();
    return (
        <div className="flex items-center gap-1 bg-white/5 rounded-full px-1 py-0.5">
            <button
                onClick={() => setLang('fr')}
                className={`text-lg px-1.5 py-0.5 rounded-full transition-all ${lang === 'fr' ? 'bg-white/15 scale-110' : 'opacity-50 hover:opacity-80'}`}
                title="Français"
                aria-label="Français"
            >
                🇫🇷
            </button>
            <button
                onClick={() => setLang('en')}
                className={`text-lg px-1.5 py-0.5 rounded-full transition-all ${lang === 'en' ? 'bg-white/15 scale-110' : 'opacity-50 hover:opacity-80'}`}
                title="English"
                aria-label="English"
            >
                🇬🇧
            </button>
        </div>
    );
};

const UserNav = () => {
    const { user } = useUser();
    const router = useRouter();
    const t = useT();
    const userProfilePath = user ? `users/${user.uid}` : null;
    const { data: userProfile, isLoading: profileLoading } = useDoc<UserProfile>(userProfilePath);

    const CreditsBadge = useMemo(() => {
        if (profileLoading || !userProfile) return null;
        if (userProfile.isUnlimited || userProfile.role === 'superadmin') return <AdminBadge />;
        return (
            <CoinIndicator
                amount={userProfile.creditBalance ?? 0}
                className="hidden sm:inline-flex"
            />
        );
    }, [profileLoading, userProfile]);

    if (!user) return null;

    const handleSignOut = async () => {
        const auth = getAuth();
        await signOut(auth);
        router.push('/');
    };

    return (
        <div className="flex items-center gap-4">
            {CreditsBadge}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full ring-1 ring-violet-500/30 hover:ring-violet-500/60 transition-all" aria-label="Menu utilisateur">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                            <AvatarFallback className="bg-violet-500/20 text-violet-300 text-xs font-bold">{getInitials(user.displayName)}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-[#0d0d24] border border-white/10 text-white shadow-[0_10px_40px_-10px_rgba(139,92,246,0.3)]" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none text-white">{user.displayName || user.email}</p>
                            <p className="text-xs leading-none text-white/50">{user.email}</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem onClick={() => router.push('/dashboard')} className="text-white/70 hover:text-white hover:bg-violet-500/10 focus:bg-violet-500/10 cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4 text-violet-400" />
                        <span>{t.nav.dashboard}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem onClick={handleSignOut} className="text-white/70 hover:text-white hover:bg-red-500/10 focus:bg-red-500/10 cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>{t.nav.logout}</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

const Header = () => {
    const { user, loading } = useUser();
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const t = useT();

    if (pathname.startsWith('/dashboard') || pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/thank-you')) {
        return null;
    }

    const navLinks = [
        { href: "/pricing", label: t.nav.pricing },
        { href: "/blog", label: t.nav.blog },
        { href: "/#faq", label: t.nav.faq },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.05] bg-[#060612]/60 backdrop-blur-md transition-all duration-300">
            <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">

                {/* Left — logo + mobile menu */}
                <div className="flex items-center gap-4">
                    <div className="lg:hidden">
                        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/5">
                                    <Menu className="h-6 w-6" />
                                    <span className="sr-only">{t.nav.openMenu}</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="bg-[#0a0a1e] border-r border-white/10 text-white">
                                <div className="flex flex-col gap-6 pt-10">
                                    <SheetClose asChild>
                                        <Link href="/creation-boutique" className="text-lg font-bold text-violet-400 flex items-center gap-2 hover:text-violet-300 transition-colors">
                                            <ShoppingBag className="h-5 w-5" />
                                            {t.nav.createShop}
                                        </Link>
                                    </SheetClose>
                                    <SheetClose asChild>
                                        <Link href="/publicite-facebook" className="text-lg font-medium text-white/60 flex items-center gap-2 hover:text-white transition-colors">
                                            <Megaphone className="h-5 w-5" />
                                            {t.nav.fbAds}
                                            <span className="text-[9px] font-bold bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded-full uppercase tracking-wide">{t.nav.soon}</span>
                                        </Link>
                                    </SheetClose>
                                    {navLinks.map(link => (
                                        <SheetClose asChild key={link.href}>
                                            <Link href={link.href} className="text-lg font-medium text-white/60 hover:text-white transition-colors">
                                                {link.label}
                                            </Link>
                                        </SheetClose>
                                    ))}
                                    <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                                        {user ? null : (
                                            <>
                                                <Link href="/login" className="text-base font-medium text-white/70 hover:text-white transition-colors">{t.nav.login}</Link>
                                                <Link href="/pricing" className="px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 text-white font-semibold text-sm text-center shadow-[0_0_20px_-5px_rgba(139,92,246,0.5)]">
                                                    {t.nav.freeTrial}
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                    <div className="pt-2 border-t border-white/10">
                                        <LangSwitcher />
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                    <Link href="/" className="transition-transform duration-300 hover:scale-105">
                        <Logo className="h-10 w-10 sm:h-14 sm:w-14" />
                    </Link>
                </div>

                {/* Center nav */}
                <nav aria-label="Navigation principale" className="hidden lg:flex items-center justify-center gap-6 flex-1">
                    <Link href="/creation-boutique" className="text-sm font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1.5 transition-colors">
                        <ShoppingBag className="h-4 w-4" />
                        {t.nav.createShop}
                    </Link>

                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger className="text-sm font-medium text-white/60 hover:text-white bg-transparent hover:bg-white/5 data-[state=open]:bg-white/5 data-[state=open]:text-white transition-colors">
                                    {t.nav.tools}
                                </NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid w-[420px] gap-2 p-3 md:w-[520px] md:grid-cols-2 bg-[#0d0d24] border border-white/10 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]">
                                        {[
                                            {
                                                href: "/dashboard/generate",
                                                icon: <Sparkles className="h-5 w-5 text-violet-400" />,
                                                iconBg: "bg-violet-500/10 group-hover:bg-violet-500/20",
                                                label: t.nav.seoGenerator,
                                                desc: t.nav.seoGeneratorDesc,
                                            },
                                            {
                                                href: "/publicite-facebook",
                                                icon: <Megaphone className="h-5 w-5 text-blue-400" />,
                                                iconBg: "bg-blue-500/10 group-hover:bg-blue-500/20",
                                                label: t.nav.fbAds,
                                                desc: t.nav.fbAdsDesc,
                                                badge: t.nav.soon,
                                            },
                                            {
                                                href: "/dashboard/import",
                                                icon: <Database className="h-5 w-5 text-indigo-400" />,
                                                iconBg: "bg-indigo-500/10 group-hover:bg-indigo-500/20",
                                                label: t.nav.bulkSku,
                                                desc: t.nav.bulkSkuDesc,
                                            },
                                            {
                                                href: "/dashboard",
                                                icon: <Zap className="h-5 w-5 text-violet-300" />,
                                                iconBg: "bg-violet-500/10 group-hover:bg-violet-500/20",
                                                label: t.nav.studio,
                                                desc: t.nav.studioDesc,
                                            },
                                        ].map((item) => (
                                            <li key={item.href}>
                                                <NavigationMenuLink asChild>
                                                    <Link
                                                        href={item.href}
                                                        className="flex select-none rounded-xl p-3 no-underline outline-none transition-colors hover:bg-white/5 group"
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className={`p-2 rounded-lg transition-colors ${item.iconBg}`}>
                                                                {item.icon}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-bold text-white leading-none flex items-center gap-1.5">
                                                                    {item.label}
                                                                    {item.badge && (
                                                                        <span className="text-[9px] font-bold bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded-full uppercase tracking-wide">{item.badge}</span>
                                                                    )}
                                                                </div>
                                                                <p className="line-clamp-2 text-xs leading-snug text-white/45 mt-1">{item.desc}</p>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </NavigationMenuLink>
                                            </li>
                                        ))}
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>

                    {navLinks.map(link => (
                        <Link key={link.href} href={link.href} className="text-sm font-medium text-white/60 hover:text-white transition-colors">
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Right — lang switcher + auth */}
                <div className="flex items-center gap-3">
                    <LangSwitcher />
                    {loading ? null : user ? <UserNav /> : (
                        <div className="flex items-center gap-3">
                            <Button variant="outline" asChild className="border-white/20 text-white hover:text-white hover:bg-white/10 hover:border-white/40 bg-transparent">
                                <Link href="/login">{t.nav.login}</Link>
                            </Button>
                            <Link
                                href="/pricing"
                                className="hidden sm:inline-flex px-5 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-500 shadow-[0_0_20px_-5px_rgba(139,92,246,0.5)] hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.7)] hover:-translate-y-0.5 transition-all duration-200"
                            >
                                {t.nav.freeTrial}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
