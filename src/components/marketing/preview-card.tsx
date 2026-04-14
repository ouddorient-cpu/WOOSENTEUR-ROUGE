'use client';

import { useState } from 'react';
import {
  Share2,
  Download,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import type { MarketingContent } from '@/types/marketing';

interface PreviewCardProps {
  content: MarketingContent;
  onShare: (platform: string) => Promise<void>;
  isDownloading?: boolean;
}

export function PreviewCard({
  content,
  onShare,
  isDownloading,
}: PreviewCardProps) {
  const [copied, setCopied] = useState(false);
  const [shareLoading, setShareLoading] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(content.slogan);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async (platform: string) => {
    setShareLoading(platform);
    try {
      await onShare(platform);
    } finally {
      setShareLoading(null);
    }
  };

  const platforms = [
    { id: 'tiktok', label: 'TikTok', color: 'bg-black' },
    { id: 'instagram', label: 'Instagram', color: 'bg-gradient-to-br from-purple-500 to-pink-500' },
    { id: 'facebook', label: 'Facebook', color: 'bg-blue-600' },
    { id: 'linkedin', label: 'LinkedIn', color: 'bg-blue-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Image Preview */}
      <div className="relative bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200">
        <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 relative flex items-center justify-center">
          {content.imageUrl ? (
            <img
              src={content.imageUrl}
              alt="Aperçu"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center text-gray-400">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Image en cours de génération...</p>
            </div>
          )}
        </div>

        {/* Overlay - Slogan + Éléments olfactifs */}
        <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-between p-6 pointer-events-none">
          {/* Éléments olfactifs en haut */}
          <div className="flex gap-3 flex-wrap justify-center">
            {content.visualElements.slice(0, 5).map((elem, idx) => (
              <div
                key={idx}
                className="text-2xl opacity-80 hover:scale-110 transition-transform"
                style={{ left: `${elem.position.x}%`, top: `${elem.position.y}%` }}
                title={elem.label}
              >
                {elem.icon}
              </div>
            ))}
          </div>

          {/* Slogan en bas */}
          <div className="bg-white/95 backdrop-blur rounded-lg p-4 max-w-sm text-center">
            <p className="text-sm font-bold text-gray-900 whitespace-pre-line">
              {content.slogan}
            </p>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Original */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Original
          </p>
          <p className="font-bold text-gray-900 mt-1">
            {content.originalPerfume.name}
          </p>
          <p className="text-sm text-gray-600">{content.originalPerfume.brand}</p>
          <p className="text-lg font-bold text-gray-900 mt-2">
            ${content.originalPerfume.price}
          </p>
        </div>

        {/* Clone */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-300">
          <p className="text-xs font-semibold text-green-700 uppercase tracking-wider">
            💚 Notre équivalent
          </p>
          <p className="font-bold text-gray-900 mt-1">
            {content.clonePerfume.name}
          </p>
          <p className="text-sm text-gray-600">{content.clonePerfume.brand}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-lg font-bold text-green-700">
              ${content.clonePerfume.price}
            </p>
            <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">
              -{content.clonePerfume.priceReduction}%
            </span>
          </div>
        </div>
      </div>

      {/* Slogan Editor */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <label className="text-xs font-semibold text-blue-900 uppercase tracking-wider block mb-2">
          Slogan
        </label>
        <div className="flex gap-2">
          <textarea
            value={content.slogan}
            readOnly
            className="flex-1 text-sm font-medium text-gray-900 bg-white border border-blue-300 rounded p-3 whitespace-pre-wrap"
            rows={3}
          />
          <button
            onClick={handleCopy}
            className="self-start px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex gap-1 items-center whitespace-nowrap"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span className="text-xs">Copié!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span className="text-xs">Copier</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notes olfactives */}
      {content.visualElements.length > 0 && (
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <p className="text-xs font-semibold text-purple-900 uppercase tracking-wider mb-2">
            Notes olfactives
          </p>
          <div className="flex flex-wrap gap-2">
            {content.visualElements.map((elem, idx) => (
              <span
                key={idx}
                className="text-xs px-3 py-1 bg-white border border-purple-300 rounded-full font-medium text-gray-700 flex items-center gap-1"
              >
                <span>{elem.icon}</span>
                <span>{elem.label}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Share & Download */}
      <div className="space-y-3">
        {/* Download Button */}
        <button
          disabled={isDownloading || !content.imageUrl}
          className="w-full px-4 py-3 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          {isDownloading ? 'Téléchargement...' : 'Télécharger l\'image'}
        </button>

        {/* Share Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {platforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => handleShare(platform.id)}
              disabled={shareLoading !== null}
              className={`px-3 py-2 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${platform.color} hover:shadow-lg disabled:opacity-50`}
            >
              <Share2 className="w-4 h-4" />
              {shareLoading === platform.id ? '...' : platform.label}
            </button>
          ))}
        </div>
      </div>

      {!content.imageUrl && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-700">
            L\'image finale est en cours de génération. Patientez quelques secondes...
          </p>
        </div>
      )}
    </div>
  );
}
