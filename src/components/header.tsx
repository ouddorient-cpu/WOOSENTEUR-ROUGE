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
import { LogOut, LayoutDashboard, Shield, CreditCard, Menu, ChevronDown, Sparkles, Megaphone, Database, Zap, ShoppingBag } from 'lucide-react';
import { useDoc } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { ThemeToggle } from './theme-toggle';
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
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
        return names[0][0] + names[names.length - 1][0];
    }
    return name.substring(0, 2);
};

const AdminBadge = () => (
    <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-3 py-1 text-sm">
        <Shield className="h-4 w-4 text-amber-600" />
        <span className="font-bold text-amber-700">ADMIN</span>
        <span className="hidden lg:inline text-amber-600">∞ crédits</span>
    </div>
);

const UserNav = () => {
    const { user } = useUser();
    const router = useRouter();

    const userProfilePath = user ? `users/${user.uid}` : null;
    const { data: userProfile, isLoading: profileLoading } = useDoc<UserProfile>(userProfilePath);

    const CreditsBadge = useMemo(() => {
        if (profileLoading || !userProfile) return null;

        if (userProfile.isUnlimited || userProfile.role === 'superadmin') {
            return <AdminBadge />;
        }

        return (
            <CoinIndicator
                amount={userProfile.creditBalance ?? 0}
                className="hidden sm:inline-flex"
            />
        );
    }, [profileLoading, userProfile]);

    if (!user) {
        return null;
    }

    const handleSignOut = async () => {
        const auth = getAuth();
        await signOut(auth);
        router.push('/');
    };

    return (
        <div className='flex items-center gap-4'>
            {CreditsBadge}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full" aria-label="Menu utilisateur">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                            <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.displayName || user.email}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {user.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Tableau de bord</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Déconnexion</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

const Header = () => {
    const { user, loading } = useUser();
    const pathname = usePathname();

    // Hide header only on dashboard and auth pages (they have their own navigation)
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/thank-you')) {
        return null;
    }

    // Check if we're on the landing page for transparent style
    const isLandingPage = pathname === '/';

    const navLinks = [
        { href: "/", label: "Accueil" },
        { href: "/v2", label: "V2 (Nouveau)" },
        { href: "/dashboard", label: "Studio" },
        { href: "/pricing", label: "Tarifs" },
        { href: "/blog", label: "Blog" },
        { href: "/#faq", label: "FAQ" },
    ];

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isLandingPage
            ? 'bg-background/80 backdrop-blur-md border-b border-border'
            : 'bg-background/95 backdrop-blur-sm border-b'
            }`}>
            <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-4">
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-6 w-6" />
                                    <span className="sr-only">Ouvrir le menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left">
                                <div className="flex flex-col gap-6 pt-10">
                                    <SheetClose asChild>
                                        <Link href="/creation-boutique" className="text-lg font-bold text-primary transition-colors flex items-center gap-2">
                                            <ShoppingBag className="h-5 w-5" />
                                            Créer ma boutique
                                        </Link>
                                    </SheetClose>
                                    <SheetClose asChild>
                                        <Link href="/publicite-facebook" className="text-lg font-medium text-muted-foreground transition-colors hover:text-primary flex items-center gap-2">
                                            <Megaphone className="h-5 w-5" />
                                            Pub Facebook & Instagram
                                            <span className="text-[9px] font-bold bg-blue-500/15 text-blue-600 px-1.5 py-0.5 rounded-full uppercase tracking-wide">Bientôt</span>
                                        </Link>
                                    </SheetClose>
                                    {navLinks.map(link => (
                                        <SheetClose asChild key={link.href}>
                                            <Link href={link.href} className="text-lg font-medium text-muted-foreground transition-colors hover:text-primary">
                                                {link.label}
                                            </Link>
                                        </SheetClose>
                                    ))}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                    <Link href="/" className="transition-transform duration-300 hover:scale-110">
                        <Logo className="h-10 w-10 sm:h-16 sm:w-16" />
                    </Link>
                </div>

                <nav aria-label="Navigation principale" className="hidden lg:flex items-center justify-center gap-8 flex-1">
                    <Link href="/creation-boutique" className="text-sm font-bold text-primary transition-colors hover:text-primary/80 flex items-center gap-1">
                        <ShoppingBag className="h-4 w-4" />
                        Créer ma boutique
                    </Link>

                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary bg-transparent">
                                    Outils
                                </NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-card border border-border rounded-lg shadow-xl">
                                        <li>
                                            <NavigationMenuLink asChild>
                                                <Link
                                                    href="/dashboard/generate"
                                                    className="flex select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                                            <Sparkles className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold leading-none">Générateur SEO Pro</div>
                                                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground mt-1">
                                                                Créez des fiches produits optimisées en un clic.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </NavigationMenuLink>
                                        </li>
                                        <li>
                                            <NavigationMenuLink asChild>
                                                <Link
                                                    href="/publicite-facebook"
                                                    className="flex select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                                                            <Megaphone className="h-5 w-5 text-blue-500" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold leading-none flex items-center gap-1.5">
                                                                Pub Facebook & Instagram
                                                                <span className="text-[9px] font-bold bg-blue-500/15 text-blue-600 px-1.5 py-0.5 rounded-full uppercase tracking-wide">Bientôt</span>
                                                            </div>
                                                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground mt-1">
                                                                Fiche produit → pub prête à lancer sur Meta.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </NavigationMenuLink>
                                        </li>
                                        <li>
                                            <NavigationMenuLink asChild>
                                                <Link
                                                    href="/dashboard/import"
                                                    className="flex select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-amber-500/10 rounded-lg group-hover:bg-amber-500/20 transition-colors">
                                                            <Database className="h-5 w-5 text-amber-500" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold leading-none">Bulk SKU Updater</div>
                                                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground mt-1">
                                                                Mise à jour rapide via import CSV et SKUs.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </NavigationMenuLink>
                                        </li>
                                        <li>
                                            <NavigationMenuLink asChild>
                                                <Link
                                                    href="/dashboard"
                                                    className="flex select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground group bg-primary/5"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-indigo-500/10 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                                                            <Zap className="h-5 w-5 text-indigo-500" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold leading-none">Studio Dashboard</div>
                                                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground mt-1">
                                                                Gérez tous vos projets et produits au même endroit.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </NavigationMenuLink>
                                        </li>
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>

                    <Link href="/pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                        Tarifs
                    </Link>
                    <Link href="/blog" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                        Blog
                    </Link>
                    <Link href="/#faq" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                        FAQ
                    </Link>
                </nav>

                <div className="flex items-center justify-end gap-2">
                    {loading ? null : user ? <UserNav /> : (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" asChild className="hidden sm:inline-flex">
                                <Link href="/login">Connexion</Link>
                            </Button>
                            <Button asChild>
                                <Link href="/pricing">Essai gratuit</Link>
                            </Button>
                        </div>
                    )}
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
};

export default Header;
