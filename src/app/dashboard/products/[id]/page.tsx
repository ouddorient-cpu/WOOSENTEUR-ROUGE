

'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { useDoc } from '@/firebase';
import type { Product, UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UploadCloud, Loader2, Edit, Download, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { publishToWooCommerce } from '@/ai/flows/publish-to-woocommerce';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { uploadProductImage } from '@/lib/firebase-helpers';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { generateProductCsv, type CsvFormat } from '@/ai/flows/generate-csv-flow';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { validateProductImage } from '@/ai/tools/image-validator-tool';
import { Progress } from '@/components/ui/progress';

const defaultProductImage = PlaceHolderImages.find(p => p.id === 'product_default');

const ProductDetailsSkeleton = () => (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-6">
                 <div className="md:col-span-1">
                    <Skeleton className="w-full h-80 rounded-md" />
                </div>
                <div className="md:col-span-2 space-y-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-5/6" />
                    <Skeleton className="h-6 w-full" />
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </CardContent>
        </Card>
    </div>
);


export default function ProductPage() {
    const { user, loading: userLoading } = useUser();
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const { toast } = useToast();
    const [isPublishing, setIsPublishing] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [isImageValidated, setIsImageValidated] = useState(false);
    const [csvFormat, setCsvFormat] = useState<CsvFormat>('woocommerce-fr');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const productPath = user && id ? `users/${user.uid}/products/${id}` : null;
    const userProfilePath = user ? `users/${user.uid}` : null;

    const { data: product, loading: productLoading, error: productError } = useDoc<Product>(productPath);
    const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(userProfilePath);

    useEffect(() => {
        if (!userLoading && !user) {
            router.push('/login');
        }
    }, [user, userLoading, router]);

    useEffect(() => {
        // When the product data loads, if it has an image, consider it validated by default.
        if (product?.imageUrl) {
            setIsImageValidated(true);
        }
    }, [product]);

    const handlePublish = async () => {
        if (!product || !userProfile?.wooCommerce) return;
        
        if (!isImageValidated) {
            toast({
                variant: 'warning',
                title: 'Image non validée',
                description: 'Veuillez valider la nouvelle image avant de publier.',
            });
            return;
        }

        setIsPublishing(true);
        toast({
            title: 'Publication en cours...',
            description: `Votre produit "${product.name}" est en cours de publication sur WooCommerce.`,
        });

        try {
            // Convert Firestore Timestamp to plain object
            const plainProduct = {
                ...product,
                createdAt: product.createdAt?.toDate?.() ? product.createdAt.toDate().toISOString() : product.createdAt,
                updatedAt: product.updatedAt?.toDate?.() ? product.updatedAt.toDate().toISOString() : product.updatedAt,
            };

            const result = await publishToWooCommerce({
                product: plainProduct,
                credentials: userProfile.wooCommerce,
            });

            if (result.success) {
                toast({
                    variant: 'success',
                    title: 'Publication réussie !',
                    description: result.message,
                    action: (
                        <a href={result.productUrl} target="_blank" rel="noopener noreferrer" className="underline">
                            Voir le produit
                        </a>
                    ),
                });
            } else {
                 throw new Error(result.message || "Une erreur inconnue est survenue.");
            }
        } catch (error: any) {
            console.error("Erreur lors de la publication sur WooCommerce:", error);
            toast({
                variant: "destructive",
                title: "La publication a échoué",
                description: error.message || "Impossible de publier le produit. Vérifiez vos identifiants WooCommerce dans votre profil et réessayez.",
            });
        } finally {
            setIsPublishing(false);
        }
    };

    const handleDownloadCsv = async () => {
        if (!product) return;
        setIsDownloading(true);
        try {
            const { csvData } = await generateProductCsv({ product: product, format: csvFormat });
            const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            const formatSuffix = csvFormat === 'shopify' ? '-shopify' : csvFormat === 'woocommerce-en' ? '-woo-en' : '';
            const fileName = product.seo?.slug ? `${product.seo.slug}${formatSuffix}.csv` : `product${formatSuffix}.csv`;
            link.setAttribute('download', fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast({ title: 'Téléchargement réussi', description: `Fichier CSV (${csvFormat}) téléchargé.` });
        } catch (error: any) {
            console.error("CSV Generation error:", error);
            toast({ variant: 'destructive', title: 'Erreur CSV', description: "Impossible de générer le fichier CSV." });
        } finally {
            setIsDownloading(false);
        }
    };
    
    const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user || !id) return;

        setIsUploading(true);
        setIsImageValidated(false); // Reset validation status on new upload
        setUploadProgress(0);

        // We need to read the file to get a data URI for validation.
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onerror = () => {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de lire le fichier image.' });
            setIsUploading(false);
        };
        reader.onload = async () => {
            const imageDataUri = reader.result as string;

            try {
                toast({ title: "Analyse de l'image par l'IA..." });
                const validationResult = await validateProductImage({ imageDataUri });
                setUploadProgress(30);

                if (validationResult.confidenceScore < 60) {
                    toast({
                        variant: 'warning',
                        title: `Image à améliorer (Score: ${validationResult.confidenceScore})`,
                        description: validationResult.feedback,
                        duration: 8000,
                    });
                    setIsUploading(false);
                    return; // Stop the process if validation fails
                }
                
                toast({ variant: 'success', title: 'Image validée !', description: `Score: ${validationResult.confidenceScore}%. ${validationResult.feedback}` });

                // If validation is successful, proceed with the upload.
                await uploadProductImage(user.uid, id as string, file, {
                    onProgress: (p) => setUploadProgress(30 + p * 0.7),
                });
                
                setUploadProgress(100);
                toast({ variant: 'success', title: 'Téléversement terminé !', description: 'La nouvelle image a été sauvegardée.' });
                setIsImageValidated(true);

            } catch (error: any) {
                console.error('Error during image validation or upload:', error);
                const errorMessage = error.message || "Une erreur inconnue est survenue.";
                toast({ variant: 'destructive', title: "Échec de l'opération", description: errorMessage });
            } finally {
                 // This will run regardless of success or failure in the try-catch block.
                setIsUploading(false);
            }
        };

    }, [user, id, toast]);


    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };


    const isLoading = userLoading || productLoading || profileLoading;

    if (isLoading || !user) {
        return (
            <>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Skeleton className="h-8 w-64 mb-2" />
                        <Skeleton className="h-4 w-80" />
                    </div>
                    <Skeleton className="h-10 w-48" />
                </div>
                <ProductDetailsSkeleton />
            </>
        );
    }
    
    if (!product) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center">
                <h1 className="text-2xl font-bold">Produit non trouvé</h1>
                <p className="text-muted-foreground">{productError ? "Vous n'avez pas la permission de voir ce produit." : "Le produit que vous cherchez n'existe pas."}</p>
                    <Button asChild>
                    <Link href="/dashboard">Retour au tableau de bord</Link>
                </Button>
            </div>
        );
    }

    const { name, brand, seo, imageUrl, createdAt } = product;
    const canPublish = !!userProfile?.wooCommerce?.storeUrl;

    return (
        <>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="font-headline text-3xl font-bold">{name}</h1>
                    <p className="text-muted-foreground">par {brand} - Fiche générée le {createdAt.toDate().toLocaleDateString('fr-FR')}</p>
                </div>
                <div className='flex items-center gap-2'>
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/products">Retour aux produits</Link>
                    </Button>
                </div>
            </div>

            {!canPublish && (
                <Alert className="mb-6" variant="warning">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Connectez votre boutique pour publier</AlertTitle>
                    <AlertDescription>
                        Pour activer la publication en un clic, veuillez <Link href="/dashboard/profile" className="underline font-bold">configurer vos identifiants WooCommerce</Link> dans votre profil.
                    </AlertDescription>
                </Alert>
            )}
            
            <div className="grid gap-6 lg:grid-cols-5">
                <div className="lg:col-span-3 space-y-6">
                        <Card>
                        <CardHeader>
                            <CardTitle>Fiche Produit Générée</CardTitle>
                            <CardDescription>Contenu principal de la fiche produit, optimisé pour le SEO. Vous pouvez modifier ce texte.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Titre SEO</h3>
                                <p className="text-muted-foreground p-4 bg-muted rounded-md">{seo.productTitle}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Méta Description</h3>
                                <p className="text-muted-foreground p-4 bg-muted rounded-md">{seo.shortDescription}</p>

                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Description Longue</h3>
                                <div className="prose prose-sm max-w-none text-muted-foreground p-4 bg-muted rounded-md" dangerouslySetInnerHTML={{ __html: seo.longDescription }}>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2 space-y-6">
                        <Card>
                        <CardHeader>
                            <CardTitle>Image du Produit</CardTitle>
                             {isImageValidated && !isUploading && (
                                <CardDescription className="flex items-center gap-1 text-green-600">
                                    <ShieldCheck className="h-4 w-4" /> Image validée et prête à être publiée.
                                </CardDescription>
                            )}
                        </CardHeader>
                        <CardContent className="relative group">
                            {isUploading && (
                                <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center rounded-lg z-10 p-4 text-center">
                                     <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                                     <Progress value={uploadProgress} className="w-full" />
                                    <p className="text-sm text-muted-foreground mt-2">{uploadProgress < 30 ? "Analyse IA..." : "Téléversement..."}</p>
                                </div>
                            )}
                            <Image
                                alt={name}
                                className="rounded-lg object-cover w-full aspect-[4/5] group-hover:opacity-75 transition-opacity"
                                height={800}
                                src={imageUrl || defaultProductImage?.imageUrl || "https://picsum.photos/seed/default/400/500"}
                                width={600}
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-lg">
                                <Button onClick={triggerFileInput} variant="secondary" disabled={isUploading}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Changer l'image
                                </Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    accept="image/png, image/jpeg, image/webp"
                                />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Données & Export</CardTitle>
                            <CardDescription>Informations clés et options de publication.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                                <div>
                                <h3 className="font-semibold text-sm">Mot-clé Principal</h3>
                                <Badge variant="secondary">{seo.focusKeyword}</Badge>
                                </div>
                                <div>
                                <h3 className="font-semibold text-sm">Catégorie</h3>
                                <Badge variant="outline">{seo.category}</Badge>
                                </div>
                                <div>
                                <h3 className="font-semibold text-sm">Contenance</h3>
                                <Badge variant="outline">{seo.contenance || 'N/A'}</Badge>
                                </div>
                            <div>
                                <h3 className="font-semibold text-sm">Tags</h3>
                                <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md">{seo.tags || 'Non communiqué'}</p>
                            </div>
                            <div className="border-t pt-4 space-y-3">
                                <Button className="w-full" onClick={handlePublish} disabled={isPublishing || !canPublish || !isImageValidated}>
                                    {isPublishing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Publication...
                                        </>
                                    ) : (
                                        <>
                                            <UploadCloud className="mr-2 h-4 w-4" />
                                            Publier sur WooCommerce
                                        </>
                                    )}
                                </Button>
                                <div className="space-y-2">
                                    <Select value={csvFormat} onValueChange={(value) => setCsvFormat(value as CsvFormat)}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Format CSV..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="woocommerce-fr">WooCommerce Import (FR)</SelectItem>
                                            <SelectItem value="woocommerce-en">WooCommerce Export (EN)</SelectItem>
                                            <SelectItem value="shopify">Shopify CSV</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button variant="outline" className="w-full" onClick={handleDownloadCsv} disabled={isDownloading}>
                                        {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                                        Exporter en CSV
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
