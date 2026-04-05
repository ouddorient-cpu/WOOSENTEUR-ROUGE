
'use client';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';
import { Home, Package, Sparkles, FileUp, User as UserIcon, LogOut, CreditCard, PanelLeft, Shield, Users, Megaphone, Flame, Share2 } from 'lucide-react';
import Logo from './logo';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase/auth/use-user';
import { useDoc } from '@/firebase';
import { UserProfile } from '@/lib/types';
import { Badge } from './ui/badge';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetClose,
} from "@/components/ui/sheet"
import { Separator } from './ui/separator';


const NavLink = ({ href, icon, label, isMobile = false }: { href: string; icon: React.ReactNode; label: string; isMobile?: boolean }) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [hrefPath, hrefQuery] = href.split('?');
    let isActive: boolean;
    if (hrefQuery) {
        const hrefParams = new URLSearchParams(hrefQuery);
        isActive = pathname === hrefPath &&
            Array.from(hrefParams.entries()).every(([k, v]) => searchParams.get(k) === v);
    } else {
        isActive = pathname === hrefPath;
    }

    if (isMobile) {
        return (
             <SheetClose asChild>
                <Link
                    href={href}
                    className={cn(
                        "flex items-center gap-4 rounded-lg px-4 py-3 text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary",
                        isActive && "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg"
                    )}
                >
                    {icon}
                    {label}
                </Link>
            </SheetClose>
        )
    }

    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground w-full",
                isActive && "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-md hover:text-primary-foreground"
            )}
        >
            <span className="shrink-0">{icon}</span>
            <span className="truncate">{label}</span>
        </Link>
    );
};

const navItems = [
    { href: "/dashboard", icon: <Home className="h-5 w-5" />, label: "Tableau de bord" },
    { href: "/dashboard/products", icon: <Package className="h-5 w-5" />, label: "Catalogue" },
    { href: "/dashboard/generate", icon: <Sparkles className="h-5 w-5" />, label: "Générateur IA" },
    { href: "/dashboard/import", icon: <FileUp className="h-5 w-5" />, label: "Import/Export" },
];

const marketingNavItems = [
    { href: "/dashboard/marketing?mode=campaign", icon: <Megaphone className="h-5 w-5" />, label: "Campagne Pub." },
    { href: "/dashboard/marketing?mode=dupe", icon: <Flame className="h-5 w-5 text-orange-500" />, label: "Dupe Viral" },
    { href: "/dashboard/marketing?mode=facebook", icon: <Share2 className="h-5 w-5 text-blue-500" />, label: "Posts Facebook" },
];

const adminNavItems = [
    { href: "/dashboard/admin", icon: <Users className="h-5 w-5" />, label: "Utilisateurs" },
]


export const MobileNav = () => {
    const { user } = useUser();
    const router = useRouter();

    const userProfilePath = user ? `users/${user.uid}` : null;
    const { data: userProfile } = useDoc<UserProfile>(userProfilePath);

    const handleSignOut = async () => {
        const auth = getAuth();
        await signOut(auth);
        router.push('/');
    };

    const isSuperAdmin = userProfile?.isUnlimited || userProfile?.role === 'superadmin';

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button size="icon" variant="outline" className="sm:hidden">
                        <PanelLeft className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="sm:max-w-xs flex flex-col">
                    <nav className="grid gap-6 text-lg font-medium">
                        <Link href="/" className="flex items-center gap-2 font-semibold">
                            <Logo className="h-8 w-8" />
                            <span className="font-headline text-xl">Woosenteur v2</span>
                        </Link>
                        {navItems.map(item => <NavLink key={item.href} {...item} isMobile />)}

                        <Separator className="my-2" />
                        <div className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Marketing</div>
                        {marketingNavItems.map(item => <NavLink key={item.href} {...item} isMobile />)}

                        {isSuperAdmin && (
                            <>
                                <Separator className="my-2" />
                                 <div className="px-4 text-sm font-semibold text-muted-foreground">Admin</div>
                                {adminNavItems.map(item => <NavLink key={item.href} {...item} isMobile />)}
                            </>
                        )}
                        <NavLink href="/dashboard/profile" icon={<UserIcon className="h-5 w-5" />} label="Profil" isMobile />
                    </nav>

                    <div className="mt-auto border-t p-4 -mx-6">
                        <div className="mb-4">
                             {isSuperAdmin ? (
                                <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-3 py-1 text-sm">
                                    <Shield className="h-4 w-4 text-amber-600" />
                                    <span className="font-bold text-amber-700">ADMIN</span>
                                </div>
                             ) : (
                                <>
                                    <div className="text-xs font-medium text-muted-foreground">Votre Plan</div>
                                    <div className="flex items-center justify-between">
                                        <Badge variant="secondary" className="capitalize">{userProfile?.subscriptionPlan || 'N/A'}</Badge>
                                        <SheetClose asChild>
                                            <Link href="/pricing" className="text-xs text-primary hover:underline">Changer</Link>
                                        </SheetClose>
                                    </div>
                                </>
                             )}
                        </div>
                        <div className="mb-4">
                            <div className="text-xs font-medium text-muted-foreground">Crédits restants</div>
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <CreditCard className="h-4 w-4" />
                                <span>{isSuperAdmin ? '∞' : userProfile?.creditBalance ?? 0}</span>
                            </div>
                        </div>

                        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleSignOut}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Déconnexion
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
             <Link href="/dashboard" className="sm:hidden">
                <Logo className="h-8 w-8" />
            </Link>
        </header>
    );
};


export default function DashboardSidebar() {
    const { user } = useUser();
    const router = useRouter();

     const userProfilePath = user ? `users/${user.uid}` : null;
    const { data: userProfile } = useDoc<UserProfile>(userProfilePath);
    const isSuperAdmin = userProfile?.isUnlimited || userProfile?.role === 'superadmin';

    const handleSignOut = async () => {
        const auth = getAuth();
        await signOut(auth);
        router.push('/');
    };

    return (
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-52 flex-col border-r bg-background sm:flex">
            {/* Logo */}
            <div className="flex h-14 items-center border-b px-4">
                <Link href="/" className="flex items-center gap-2">
                    <Logo className="h-7 w-7" />
                    <span className="font-headline text-base font-bold text-foreground">Woosenteur</span>
                </Link>
            </div>

            {/* Main nav */}
            <nav className="flex flex-col gap-1 px-3 py-4 flex-1 overflow-y-auto">
                {navItems.map(item => <NavLink key={item.href} {...item} />)}

                <div className="mt-3 mb-1 px-3">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Marketing</p>
                </div>
                {marketingNavItems.map(item => <NavLink key={item.href} {...item} />)}

                {isSuperAdmin && (
                    <>
                        <Separator className="my-2" />
                        <div className="px-3 mb-1">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Admin</p>
                        </div>
                        {adminNavItems.map(item => <NavLink key={item.href} {...item} />)}
                    </>
                )}
            </nav>

            {/* Bottom nav */}
            <div className="border-t px-3 py-4 space-y-1">
                <NavLink href="/dashboard/profile" icon={<UserIcon className="h-5 w-5" />} label="Profil" />
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground w-full"
                >
                    <LogOut className="h-5 w-5 shrink-0" />
                    <span>Déconnexion</span>
                </button>

                {/* Credits */}
                <div className="mt-3 pt-3 border-t">
                    {isSuperAdmin ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200">
                            <Shield className="h-4 w-4 text-amber-600 shrink-0" />
                            <span className="text-xs font-bold text-amber-700">ADMIN</span>
                        </div>
                    ) : (
                        <div className="px-3 py-2 rounded-lg bg-muted/50">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Crédits</span>
                                <span className="text-xs font-bold text-foreground flex items-center gap-1">
                                    <CreditCard className="h-3 w-3" />
                                    {userProfile?.creditBalance ?? 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                                <Badge variant="secondary" className="text-[10px] capitalize px-1.5">{userProfile?.subscriptionPlan || 'Gratuit'}</Badge>
                                <Link href="/pricing" className="text-[10px] text-primary hover:underline">Changer</Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
