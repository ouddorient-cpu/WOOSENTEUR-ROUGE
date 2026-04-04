'use client';

import { useState, useEffect } from 'react';
import { generateDemoDescription, DemoOutput } from '@/ai/flows/generate-demo-description';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Lock, ArrowRight, Check, Star } from 'lucide-react';
import Link from 'next/link';
import Logo from '@/components/logo';
import Header from '@/components/header';
import Footer from '@/components/footer';

const DEMO_USED_KEY = 'woosenteur_demo_used';

export default function EssaiPage() {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState<'Parfum' | 'Soin' | 'Cosmétique' | 'Maison' | 'Autres'>('Parfum');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DemoOutput | null>(null);
  const [alreadyUsed, setAlreadyUsed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setAlreadyUsed(localStorage.getItem(DEMO_USED_KEY) === '1');
  }, []);

  const handleGenerate = async () => {
    if (!productName.trim()) {
      setError('Entrez le nom de votre produit.');
      return;
    }
    if (alreadyUsed) return;

    setError('');
    setIsLoading(true);
    try {
      const output = await generateDemoDescription({ productName: productName.trim(), category });
      setResult(output);
      localStorage.setItem(DEMO_USED_KEY, '1');
      setAlreadyUsed(true);
    } catch (e) {
      setError("Une erreur s'est produite. Réessayez.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <Badge className="mb-4 bg-amber-100 text-amber-800 border-amber-300">
            <Star className="h-3 w-3 mr-1" /> 1 fiche gratuite · Sans inscription
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold font-headline mb-3">
            Testez le générateur <span className="text-primary">en direct</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Entrez le nom de votre produit — l'IA génère une fiche SEO professionnelle en quelques secondes.
          </p>
        </div>

        {/* Form */}
        {!result && (
          <Card className="shadow-lg">
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Nom de votre produit *</label>
                <Input
                  placeholder="Ex : Lattafa Asad, Crème Visage Rose, Bougie Vanille..."
                  value={productName}
                  onChange={e => setProductName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                  disabled={alreadyUsed || isLoading}
                  className="text-base"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Catégorie</label>
                <Select value={category} onValueChange={(v: any) => setCategory(v)} disabled={alreadyUsed || isLoading}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Parfum">Parfum</SelectItem>
                    <SelectItem value="Soin">Soin</SelectItem>
                    <SelectItem value="Cosmétique">Cosmétique</SelectItem>
                    <SelectItem value="Maison">Maison</SelectItem>
                    <SelectItem value="Autres">Autres</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              {alreadyUsed && !result ? (
                <div className="text-center py-4 space-y-3">
                  <p className="text-muted-foreground text-sm">Vous avez déjà utilisé votre essai gratuit.</p>
                  <Link href="/signup">
                    <Button className="w-full" size="lg">
                      Créer mon compte — 5 fiches gratuites <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <Button
                  onClick={handleGenerate}
                  disabled={isLoading || !productName.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Génération en cours...</>
                  ) : (
                    <><Sparkles className="mr-2 h-4 w-4" /> Générer ma fiche gratuite</>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-6">
            <Card className="shadow-lg border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-lg text-green-700">Fiche générée avec succès !</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Titre SEO</span>
                  <p className="font-semibold text-foreground mt-1">{result.productTitle}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Mot-clé principal</span>
                  <Badge variant="secondary" className="ml-2">{result.focusKeyword}</Badge>
                </div>
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Description courte</span>
                  <p className="text-sm text-foreground mt-1">{result.shortDescription}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Description longue (extrait)</span>
                  <div
                    className="text-sm text-foreground mt-1 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: result.longDescriptionExcerpt }}
                  />
                </div>
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Slug URL</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded ml-2">{result.slug}</code>
                </div>
              </CardContent>
            </Card>

            {/* Blur teaser for the rest */}
            <div className="relative rounded-xl border bg-card overflow-hidden">
              <div className="blur-sm pointer-events-none select-none p-6 space-y-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-5/6" />
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-2/3" />
                <div className="h-4 bg-muted rounded w-1/2 mt-4" />
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-4/5" />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm gap-2 p-4 text-center">
                <Lock className="h-6 w-6 text-primary" />
                <p className="font-semibold text-sm">Slug URL · Tags · FAQ Schema · JSON-LD · Méta-description complète</p>
                <p className="text-xs text-muted-foreground">Disponibles dans la version complète</p>
              </div>
            </div>

            {/* CTA inscription */}
            <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30 shadow-lg">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="text-4xl">🎉</div>
                <h2 className="text-xl font-bold font-headline">Continuez avec 5 fiches gratuites</h2>
                <p className="text-muted-foreground text-sm">
                  Créez votre compte gratuitement et obtenez <strong>5 fiches produits complètes</strong> —
                  avec slug, tags, FAQ Schema, JSON-LD, et publication directe WooCommerce.
                </p>
                <ul className="text-sm text-left max-w-xs mx-auto space-y-1">
                  {['Fiche complète (500-700 mots)', 'Tags + FAQ Schema + JSON-LD', 'Slug SEO optimisé', 'Publication WooCommerce 1 clic', '5 crédits offerts dès l\'inscription'].map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button size="lg" className="w-full text-base font-semibold">
                    Créer mon compte gratuit <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground">Sans carte bancaire · Annulable à tout moment</p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
