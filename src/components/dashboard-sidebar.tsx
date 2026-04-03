
'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';
import { Home, Package, Sparkles, FileUp, User as UserIcon, LogOut, CreditCard, PanelLeft, Shield, Users, Megaphone } from 'lucide-react';
import Logo from './logo';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase/auth/use-user';
import { useDoc } from '@/firebase';
import { UserProfile } from '@/lib/types';
import { Badge } from './ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetClose,
} from "@/components/ui/sheet"
import { Separator } from './ui/separator';


const NavLink = ({ href, icon, label, isMobile = false }: { href: string; icon: React.ReactNode; label: string; isMobile?: boolean }) => {
    const pathname = usePathname();
    const isActive = pathname === href;

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
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link
                        href={href}
                        className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                             isActive && "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg"
                        )}
                    >
                        {icon}
                        <span className="sr-only">{label}</span>
                    </Link>
                </TooltipTrigger>
                 <TooltipContent side="right" align="center">
                    <p>{label}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

const navItems = [
    { href: "/dashboard", icon: <Home className="h-5 w-5" />, label: "Tableau de bord" },
    { href: "/dashboard/products", icon: <Package className="h-5 w-5" />, label: "Catalogue" },
    { href: "/dashboard/generate", icon: <Sparkles className="h-5 w-5" />, label: "Générateur IA" },
    { href: "/dashboard/marketing", icon: <Megaphone className="h-5 w-5" />, label: "Marketing" },
    { href: "/dashboard/import", icon: <FileUp className="h-5 w-5" />, label: "Import/Export" },
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
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
             <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
                <Link href="/" className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-tr from-primary to-secondary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base">
                    <Logo className="h-5 w-5 transition-all group-hover:scale-110" />
                    <span className="sr-only">Woosenteur v2</span>
                </Link>
                {navItems.map(item => <NavLink key={item.href} {...item} />)}

                {isSuperAdmin && (
                    <>
                        <Separator className="my-2" />
                        {adminNavItems.map(item => <NavLink key={item.href} {...item} />)}
                    </>
                )}
            </nav>
            <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
                 <NavLink href="/dashboard/profile" icon={<UserIcon className="h-5 w-5" />} label="Profil" />
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-9 w-9 md:h-8 md:w-8" onClick={handleSignOut}>
                                <LogOut className="h-5 w-5" />
                                <span className="sr-only">Déconnexion</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">Déconnexion</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </nav>
        </aside>
    );
}
