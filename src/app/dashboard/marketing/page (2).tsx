'use client';

import { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { UploadZone } from '@/components/marketing/upload-zone';
import { PreviewCard } from '@/components/marketing/preview-card';
import type { MarketingContent, MarketingRequest } from '@/types/marketing';

export default function MarketingPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [marketingContent, setMarketingContent] = useState<MarketingContent | null>(null);
  const [detectedProduct, setDetectedProduct] = useState('');
  const [productInput, setProductInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('tiktok');
  const [error, setError] = useState('');

  const handleImageSelected = async (base64: string) => {
    setSelectedImage(base64);
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/marketing/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadedImageBase64: base64,
          targetPlatform: selectedPlatform,
          detectedProduct: productInput || detectedProduct,
        } as MarketingRequest),
      });

      if (!response.ok) {
        throw new Error('Erreur de génération');
      }

      const data = await response.json();
      if (data.success) {
        setMarketingContent(data.data);
        const originalName = data.data?.originalPerfume?.name ?? '';
        const originalBrand = data.data?.originalPerfume?.brand ?? '';
        const autoFill = originalName ? `${originalName} (${originalBrand})` : '';
        setDetectedProduct(autoFill);
        setProductInput(autoFill);
      } else {
        setError(data.error || 'Erreur inconnue');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur serveur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (platform: string) => {
    if (!marketingContent) return;

    // Ouvre une nouvelle fenêtre tout de suite pour éviter le blocage popup par le navigateur
    const popup = window.open('', '_blank');
    try {
      const response = await fetch('/api/marketing/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: marketingContent.id,
          platform,
          caption: marketingContent.slogan,
        }),
      });

      const data = await response.json();

      if (data.shareUrls && popup) {
        popup.location.href = data.shareUrls;
      } else if (popup) {
        popup.close();
      }
    } catch (err) {
      console.error('Erreur partage:', err);
      if (popup) popup.close();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/40 border-b border-purple-500/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Marketing Hub</h1>
          </div>
          <p className="text-gray-300 max-w-2xl">
            Upload un flacon parfum → IA détecte le original + trouve le clone moins cher → Génère un UGC viral avec slogan + visuels olfactifs
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Upload & Settings */}
          <div className="space-y-6">
            {/* Platform Selector */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
              <label className="block text-sm font-semibold text-white mb-3">
                Plateforme ciblée
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'tiktok', label: '🎵 TikTok' },
                  { value: 'instagram', label: '📸 Instagram' },
                  { value: 'facebook', label: '👥 Facebook' },
                  { value: 'linkedin', label: '💼 LinkedIn' },
                ].map((platform) => (
                  <button
                    key={platform.value}
                    onClick={() => setSelectedPlatform(platform.value)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedPlatform === platform.value
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/50'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {platform.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Upload Zone */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
              <label className="block text-sm font-semibold text-white mb-4">
                1. Votre image de flacon
              </label>
              <UploadZone
                onImageSelected={handleImageSelected}
                isLoading={isLoading}
              />
            </div>

            {/* Produit auto / manuel */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
              <label className="block text-sm font-semibold text-white mb-2">
                Produit détecté (modifiable)
              </label>
              <input
                type="text"
                value={productInput}
                onChange={(e) => setProductInput(e.target.value)}
                placeholder={
                  detectedProduct
                    ? `Détecté : ${detectedProduct}`
                    : 'Entrez le nom du produit manuellement'
                }
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <p className="text-xs text-gray-300 mt-2">
                Si l’IA ne trouve pas le parfum, entrez le produit à la main.
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-100 mb-2">💡 Comment ça marche</h3>
              <ul className="text-sm text-blue-100/80 space-y-1">
                <li>✓ Upload une image de flacon parfum (fond blanc)</li>
                <li>✓ L\'IA détecte le parfum original</li>
                <li>✓ L\'IA trouve un clone moins cher + équivalent</li>
                <li>✓ Génère un slogan viral + visuels olfactifs</li>
                <li>✓ Partage directement sur tes réseaux!</li>
              </ul>
            </div>
          </div>

          {/* Right: Preview */}
          <div>
            {marketingContent ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <ArrowRight className="w-5 h-5 text-purple-400" />
                  Votre contenu est prêt!
                </div>
                <PreviewCard
                  content={marketingContent}
                  onShare={handleShare}
                />
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-12 text-center">
                <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
                <p className="text-white font-medium">
                  {isLoading ? 'Génération en cours...' : 'Votre contenu aparaîtra ici'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-8 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
            <p className="font-semibold">❌ {error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
