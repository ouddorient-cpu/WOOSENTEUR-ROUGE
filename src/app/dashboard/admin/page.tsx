
'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, collectionGroup, orderBy } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Users, Package, BarChart, Mail, Copy, Check, MessageSquare, Star } from 'lucide-react';
import { useDoc } from '@/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// ── Types locaux ──────────────────────────────────────────────────
type EmailCapture = {
  email: string;
  source?: string;
  productName?: string;
  visitCount?: number;
  converted?: boolean;
  createdAt?: any;
  lastSeen?: any;
};

type FeedbackEntry = {
  id?: string;
  userId?: string;
  userEmail?: string;
  rating?: number;
  message?: string;
  page?: string;
  createdAt?: any;
};

const StatCard = ({ title, value, icon, description, loading }: {
  title: string; value: string; icon: React.ReactNode; description?: string; loading?: boolean;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{value}</div>}
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </CardContent>
  </Card>
);

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`h-3.5 w-3.5 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
      ))}
    </div>
  );
}

export default function AdminPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const userProfilePath = user ? `users/${user.uid}` : null;
  const { data: currentUserProfile, loading: profileLoading } = useDoc<UserProfile>(userProfilePath);

  const isAdmin = currentUserProfile?.role === 'superadmin';

  const { data: allUsers, loading: allUsersLoading } = useCollection<UserProfile>(
    firestore && isAdmin ? collection(firestore, 'users') : null
  );

  const productsCollectionGroup = useMemo(() => {
    if (firestore && isAdmin) return collectionGroup(firestore, 'products');
    return null;
  }, [firestore, isAdmin]);

  const { data: allProducts, loading: allProductsLoading } = useCollection(productsCollectionGroup);

  const emailsQuery = useMemo(() => {
    if (firestore && isAdmin) {
      return query(collection(firestore, 'emailCaptures'), orderBy('createdAt', 'desc'));
    }
    return null;
  }, [firestore, isAdmin]);
  const { data: emailCaptures, loading: emailsLoading } = useCollection<EmailCapture>(emailsQuery);

  const feedbackQuery = useMemo(() => {
    if (firestore && isAdmin) {
      return query(collection(firestore, 'feedback'), orderBy('createdAt', 'desc'));
    }
    return null;
  }, [firestore, isAdmin]);
  const { data: feedbackEntries, loading: feedbackLoading } = useCollection<FeedbackEntry>(feedbackQuery);

  // Stats
  const totalUsers    = allUsers?.length ?? 0;
  const totalProducts = allProducts?.length ?? 0;
  const totalCredits  = allUsers?.reduce((s, u) => u.isUnlimited ? s : s + (u.creditBalance ?? 0), 0) ?? 0;
  const totalEmails   = emailCaptures?.length ?? 0;
  const avgRating     = feedbackEntries?.length
    ? (feedbackEntries.reduce((s, f) => s + (f.rating ?? 0), 0) / feedbackEntries.length).toFixed(1)
    : '—';

  useEffect(() => {
    if (!userLoading && !profileLoading) {
      if (!user) router.push('/login');
      else if (currentUserProfile?.role !== 'superadmin') router.push('/dashboard');
    }
  }, [user, userLoading, profileLoading, currentUserProfile, router]);

  // Copy all emails to clipboard
  const handleCopyEmails = useCallback(() => {
    if (!emailCaptures?.length) return;
    const list = emailCaptures.map(e => e.email).join('\n');
    navigator.clipboard.writeText(list);
    setCopied(true);
    toast({ title: `${emailCaptures.length} email(s) copiés !`, description: 'Collez dans Gmail > BCC' });
    setTimeout(() => setCopied(false), 2500);
  }, [emailCaptures, toast]);

  const isLoading = userLoading || profileLoading;
  if (isLoading || currentUserProfile?.role !== 'superadmin') {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold text-white">Tableau de bord Administrateur</h1>
        <p className="text-muted-foreground">Vue d&apos;ensemble de la plateforme.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Utilisateurs" value={totalUsers.toString()}
          icon={<Users className="h-4 w-4 text-muted-foreground" />} loading={allUsersLoading} />
        <StatCard title="Produits Générés" value={totalProducts.toString()}
          icon={<Package className="h-4 w-4 text-muted-foreground" />} loading={allProductsLoading} />
        <StatCard title="Crédits en circulation" value={totalCredits.toLocaleString('fr-FR')}
          icon={<BarChart className="h-4 w-4 text-muted-foreground" />} loading={allUsersLoading}
          description="Admins exclus" />
        <StatCard title="Emails capturés" value={totalEmails.toString()}
          icon={<Mail className="h-4 w-4 text-muted-foreground" />} loading={emailsLoading}
          description="Prospects non inscrits" />
        <StatCard title="Note moyenne" value={`${avgRating}/5`}
          icon={<Star className="h-4 w-4 text-muted-foreground" />} loading={feedbackLoading}
          description={`${feedbackEntries?.length ?? 0} avis`} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">
            <Users className="h-3.5 w-3.5 mr-1.5" /> Utilisateurs ({totalUsers})
          </TabsTrigger>
          <TabsTrigger value="emails">
            <Mail className="h-3.5 w-3.5 mr-1.5" /> Emails ({totalEmails})
          </TabsTrigger>
          <TabsTrigger value="feedback">
            <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Feedbacks ({feedbackEntries?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        {/* ── USERS ── */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Utilisateurs inscrits</CardTitle>
              <CardDescription>Tous les comptes créés sur la plateforme.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Crédits</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Beta</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsersLoading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(4)].map((_, j) => (
                          <TableCell key={j}><Skeleton className="h-5 w-24" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : allUsers?.length ? (
                    allUsers.map((u) => (
                      <TableRow key={u.email}>
                        <TableCell className="font-medium">{u.email}</TableCell>
                        <TableCell>{u.isUnlimited ? '∞' : u.creditBalance ?? 0}</TableCell>
                        <TableCell>
                          <Badge variant={u.role === 'superadmin' ? 'default' : 'secondary'} className="capitalize">
                            {u.role === 'superadmin' ? 'Admin' : u.subscriptionPlan ?? 'free'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {u.isBetaTester && (
                            <Badge variant="outline" className="text-purple-600 border-purple-300 bg-purple-50 text-xs">
                              Beta
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                        Aucun utilisateur trouvé.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── EMAILS ── */}
        <TabsContent value="emails">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>Emails capturés</CardTitle>
                <CardDescription>
                  Visiteurs qui ont laissé leur email après la génération gratuite.
                  <br />
                  <span className="text-xs text-muted-foreground">
                    Copiez la liste → collez dans Gmail en BCC pour les relancer.
                  </span>
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyEmails}
                disabled={!emailCaptures?.length}
                className="shrink-0"
              >
                {copied
                  ? <><Check className="h-3.5 w-3.5 mr-1.5 text-green-500" /> Copié !</>
                  : <><Copy className="h-3.5 w-3.5 mr-1.5" /> Copier tous les emails</>}
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Produit testé</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Visites</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emailsLoading ? (
                    [...Array(4)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(5)].map((_, j) => (
                          <TableCell key={j}><Skeleton className="h-5 w-24" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : emailCaptures?.length ? (
                    emailCaptures.map((e, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{e.email}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {e.productName ?? '—'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs capitalize">
                            {e.source ?? 'landing'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">{e.visitCount ?? 1}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {e.createdAt?.seconds
                            ? new Date(e.createdAt.seconds * 1000).toLocaleDateString('fr-FR')
                            : '—'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                        Aucun email capturé pour le moment.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── FEEDBACKS ── */}
        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>Avis &amp; Feedbacks</CardTitle>
              <CardDescription>Retours laissés par les utilisateurs depuis le bouton flottant du dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Page</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedbackLoading ? (
                    [...Array(3)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(5)].map((_, j) => (
                          <TableCell key={j}><Skeleton className="h-5 w-24" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : feedbackEntries?.length ? (
                    feedbackEntries.map((f, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-sm">{f.userEmail ?? '—'}</TableCell>
                        <TableCell><StarRating rating={f.rating ?? 0} /></TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate">{f.message}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{f.page ?? '—'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {f.createdAt?.seconds
                            ? new Date(f.createdAt.seconds * 1000).toLocaleDateString('fr-FR')
                            : '—'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                        Aucun feedback reçu pour le moment.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
