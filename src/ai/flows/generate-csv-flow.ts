
'use server';
/**
 * @fileOverview Flow to generate a CSV string from product data for multiple platforms.
 * Supports: WooCommerce (FR), WooCommerce (EN/Export), Shopify
 * Now with automatic image upload to ImgBB for base64/blob images.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { processImageUrl, needsUpload } from '@/lib/image-upload';

// CSV Format types
export type CsvFormat = 'woocommerce-fr' | 'woocommerce-en' | 'shopify';

// Define the input schema, accepting a partial product object.
// We make most fields optional as they might not all be present.
const CsvProductInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  brand: z.string().optional(),
  productType: z.string().optional(),
  weight: z.string().optional(), // Shipping weight
  price: z.number().optional(),
  imageUrl: z.string().optional(), // Can be URL or base64 data URI
  seo: z.object({
    productTitle: z.string().optional(),
    shortDescription: z.string().optional(),
    longDescription: z.string().optional(),
    focusKeyword: z.string().optional(),
    category: z.string().optional(), // Target Audience (Homme, Femme, Unisexe)
    mainNotes: z.string().optional(),
    contenance: z.string().optional(), // Product volume (e.g., 100ml)
    slug: z.string().optional(),
    imageAltText: z.string().optional(),
  }).optional(),
});


// Define the output schema
const GenerateCsvOutputSchema = z.object({
  csvData: z.string(),
  imageUploaded: z.boolean().optional(),
  imageUrl: z.string().optional(),
  imageUploadError: z.string().optional(),
});

export type GenerateCsvOutput = z.infer<typeof GenerateCsvOutputSchema>;

// Helper function to escape CSV fields
const escapeCsvField = (field: any): string => {
  if (field === null || field === undefined) {
    return '';
  }
  const stringField = String(field);
  // If the field contains a comma, a quote, or a newline, wrap it in double quotes.
  if (/[",\r\n]/.test(stringField)) {
    // Also, double any existing double quotes.
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
};

// Helper function to validate and clean image URL
// WooCommerce needs a valid HTTP(S) URL, not a base64 data URI
const cleanImageUrl = (url: any): string => {
  if (!url || typeof url !== 'string') {
    return '';
  }
  // Filter out base64 data URIs - they are not valid for WooCommerce import
  if (url.startsWith('data:')) {
    return '';
  }
  // Filter out blob URLs
  if (url.startsWith('blob:')) {
    return '';
  }
  // Only return valid HTTP/HTTPS URLs
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return '';
};

// Define the main function that components will call
export async function generateProductCsv(input: { product: any; format?: CsvFormat }): Promise<GenerateCsvOutput> {
  return generateCsvFlow({ product: input.product, format: input.format || 'woocommerce-fr' });
}


// ============================================
// FORMAT DEFINITIONS
// ============================================

// WooCommerce French Import Format (current default)
const generateWooCommerceFrCsv = (product: any): { headers: string[]; row: string[] } => {
  const headers = [
    'ID',                                           // 0
    'Type',                                         // 1
    'UGS',                                          // 2
    'GTIN, UPC, EAN ou ISBN',                       // 3
    'Nom',                                          // 4
    'Publié',                                       // 5
    'Mis en avant ?',                               // 6
    'Visibilité dans le catalogue',                 // 7
    'Description courte',                           // 8
    'Description',                                  // 9
    'Date de début de promo',                       // 10
    'Date de fin de promo',                         // 11
    'État de la TVA',                               // 12
    'Classe de TVA',                                // 13
    'En stock ?',                                   // 14
    'Stock',                                        // 15
    'Montant de stock faible',                      // 16
    'Autoriser les commandes de produits en rupture ?', // 17
    'Vendre individuellement ?',                    // 18
    'Poids (kg)',                                   // 19
    'Longueur (cm)',                                // 20
    'Largeur (cm)',                                 // 21
    'Hauteur (cm)',                                 // 22
    'Autoriser les avis clients ?',                 // 23
    'Note de commande',                             // 24
    'Tarif promo',                                  // 25
    'Tarif régulier',                               // 26
    'Catégories',                                   // 27
    'Étiquettes',                                   // 28
    'Classe de livraison',                          // 29
    'Images',                                       // 30
    'Téléchargements autorisés',                    // 31
    'Téléchargements - Loss',                       // 32
    'Parent',                                       // 33
    'Produits groupés',                             // 34
    'Montée en gamme',                              // 35
    'Ventes croisées',                              // 36
    'URL externe',                                  // 37
    'Libellé du bouton',                            // 38
    'Position',                                     // 39
    'Marques',                                      // 40
    'Meta: rank_math_analytic_object_id',           // 41
    'Meta: rank_math_internal_links_processed',     // 42
    'Meta: rank_math_description',                  // 43
    'Meta: rank_math_focus_keyword',                // 44
    'Nom de l\'attribut 1',                         // 45
    'Valeur(s) de l\'attribut 1',                   // 46
    'Attribut 1 visible',                           // 47
    'Attribut 1 global',                            // 48
    'Nom de l\'attribut 2',                         // 49
    'Valeur(s) de l\'attribut 2',                   // 50
    'Attribut 2 visible',                           // 51
    'Attribut 2 global',                            // 52
    'Nom de l\'attribut 3',                         // 53
    'Valeur(s) de l\'attribut 3',                   // 54
    'Attribut 3 visible',                           // 55
    'Attribut 3 global',                            // 56
    'Nom de l\'attribut 4',                         // 57
    'Valeur(s) de l\'attribut 4',                   // 58
    'Attribut 4 visible',                           // 59
    'Attribut 4 global',                            // 60
    'Meta: rank_math_title',                        // 61
    'Meta: rank_math_breadcrumb_title',             // 62
    'Meta: rank_math_seo_score',                    // 63
    'Meta: rank_math_robots',                       // 64
    'Meta: rank_math_primary_product_cat',          // 65
    'Meta: rank_math_schema_Article',               // 66
    'Meta: _woosenteur_seo_title',                  // 67
    'Meta: _woosenteur_main_keyword',               // 68
    'Meta: _woosenteur_confidence_score',           // 69
    'Meta: _woosenteur_generated_by',               // 70
    'Meta: _woosenteur_generation_date'             // 71
  ];

  const row = [
    product.id ?? '',                               // 0: ID
    'simple',                                       // 1: Type
    product.seo?.slug ?? product.id ?? '',          // 2: UGS (SKU)
    '',                                             // 3: GTIN
    product.seo?.productTitle ?? product.name ?? '', // 4: Nom
    '1',                                            // 5: Publié
    '0',                                            // 6: Mis en avant ?
    'visible',                                      // 7: Visibilité
    product.seo?.shortDescription ?? '',            // 8: Description courte
    product.seo?.longDescription ?? '',             // 9: Description
    '',                                             // 10: Date début promo
    '',                                             // 11: Date fin promo
    'taxable',                                      // 12: État TVA
    '',                                             // 13: Classe TVA
    '1',                                            // 14: En stock ?
    '',                                             // 15: Stock
    '',                                             // 16: Montant stock faible
    '0',                                            // 17: Autoriser rupture
    '0',                                            // 18: Vendre individuellement
    product.weight ?? '',                           // 19: Poids (kg)
    '',                                             // 20: Longueur
    '',                                             // 21: Largeur
    '',                                             // 22: Hauteur
    '1',                                            // 23: Autoriser avis
    '',                                             // 24: Note commande
    '',                                             // 25: Tarif promo
    product.price ?? '',                            // 26: Tarif régulier
    product.seo?.category ?? '',                    // 27: Catégories
    '',                                             // 28: Étiquettes
    '',                                             // 29: Classe livraison
    // 30: Images with alt text (format: URL ! alt : ALT_TEXT)
    (() => {
      const url = cleanImageUrl(product.imageUrl);
      if (!url) return '';
      const altText = product.seo?.imageAltText || product.seo?.focusKeyword || product.name || '';
      return `${url} ! alt : ${altText}`;
    })(),
    '',                                             // 31: Téléchargements autorisés
    '',                                             // 32: Téléchargements Loss
    '',                                             // 33: Parent
    '',                                             // 34: Produits groupés
    '',                                             // 35: Montée en gamme
    '',                                             // 36: Ventes croisées
    '',                                             // 37: URL externe
    '',                                             // 38: Libellé bouton
    '0',                                            // 39: Position
    product.brand ?? '',                            // 40: Marques
    '',                                             // 41: rank_math_analytic_object_id
    '1',                                            // 42: rank_math_internal_links_processed
    product.seo?.shortDescription ?? '',            // 43: rank_math_description
    product.seo?.focusKeyword ?? '',                // 44: rank_math_focus_keyword ← ICI
    'Notes Olfactives',                             // 45: Nom attribut 1
    product.seo?.mainNotes ?? '',                   // 46: Valeur attribut 1
    '1',                                            // 47: Attribut 1 visible
    '1',                                            // 48: Attribut 1 global
    'Contenance',                                   // 49: Nom attribut 2
    product.seo?.contenance ?? '',                  // 50: Valeur attribut 2
    '1',                                            // 51: Attribut 2 visible
    '1',                                            // 52: Attribut 2 global
    '',                                             // 53: Nom attribut 3
    '',                                             // 54: Valeur attribut 3
    '',                                             // 55: Attribut 3 visible
    '',                                             // 56: Attribut 3 global
    '',                                             // 57: Nom attribut 4
    '',                                             // 58: Valeur attribut 4
    '',                                             // 59: Attribut 4 visible
    '',                                             // 60: Attribut 4 global
    product.seo?.productTitle ?? '',                // 61: rank_math_title
    '',                                             // 62: rank_math_breadcrumb_title
    '',                                             // 63: rank_math_seo_score
    '',                                             // 64: rank_math_robots
    '',                                             // 65: rank_math_primary_product_cat
    '',                                             // 66: rank_math_schema_Article
    product.seo?.productTitle ?? '',                // 67: _woosenteur_seo_title
    product.seo?.focusKeyword ?? '',                // 68: _woosenteur_main_keyword
    '',                                             // 69: _woosenteur_confidence_score
    'WooSenteur Agent',                             // 70: _woosenteur_generated_by
    new Date().toISOString(),                       // 71: _woosenteur_generation_date
  ];

  return { headers, row };
};

// WooCommerce English Export Format (matches user's export file structure)
const generateWooCommerceEnCsv = (product: any): { headers: string[]; row: string[] } => {
  const headers = [
    'post_title','post_name','post_parent','ID','post_content','post_excerpt','post_status',
    'post_password','menu_order','post_date','post_author','comment_status','sku','parent_sku',
    'children','downloadable','virtual','stock','regular_price','sale_price','weight','length',
    'width','height','tax_class','visibility','stock_status','backorders','sold_individually',
    'low_stock_amount','manage_stock','tax_status','upsell_ids','crosssell_ids','purchase_note',
    'sale_price_dates_from','sale_price_dates_to','download_limit','download_expiry','product_url',
    'button_text','images','downloadable_files','product_page_url','meta:total_sales',
    'meta:_global_unique_id','tax:product_brand','tax:product_type','tax:product_visibility',
    'tax:product_cat','tax:product_tag','tax:product_shipping_class',
    'attribute:Notes Olfactives','attribute_data:Notes Olfactives',
    'attribute:Contenance','attribute_data:Contenance'
  ];

  const cleanedImageUrl = cleanImageUrl(product.imageUrl);
  const imageWithAlt = cleanedImageUrl
    ? `${cleanedImageUrl} ! alt : ${product.seo?.imageAltText || product.name || ''} ! title : ${product.name || ''} ! desc :  ! caption : `
    : '';

  const row = [
    product.seo?.productTitle ?? product.name ?? '', // post_title
    product.seo?.slug ?? '', // post_name
    '', // post_parent
    product.id ?? '', // ID
    product.seo?.longDescription ?? '', // post_content
    product.seo?.shortDescription ?? '', // post_excerpt
    'publish', // post_status
    '', // post_password
    '0', // menu_order
    new Date().toISOString().replace('T', ' ').substring(0, 19), // post_date
    '1', // post_author
    'open', // comment_status
    product.seo?.slug ?? product.id ?? '', // sku
    '', // parent_sku
    '', // children
    'no', // downloadable
    'no', // virtual
    '', // stock
    product.price ?? '', // regular_price
    '', // sale_price
    product.weight ?? '', // weight
    '', // length
    '', // width
    '', // height
    '', // tax_class
    '', // visibility
    'instock', // stock_status
    'no', // backorders
    'no', // sold_individually
    '', // low_stock_amount
    'no', // manage_stock
    'taxable', // tax_status
    '', // upsell_ids
    '', // crosssell_ids
    '', // purchase_note
    '', // sale_price_dates_from
    '', // sale_price_dates_to
    '-1', // download_limit
    '-1', // download_expiry
    '', // product_url
    '', // button_text
    imageWithAlt, // images
    '', // downloadable_files
    '', // product_page_url
    '0', // meta:total_sales
    '', // meta:_global_unique_id
    product.brand ?? '', // tax:product_brand
    'simple', // tax:product_type
    '', // tax:product_visibility
    product.seo?.category ?? '', // tax:product_cat
    '', // tax:product_tag
    '', // tax:product_shipping_class
    product.seo?.mainNotes ?? '', // attribute:Notes Olfactives
    '', // attribute_data:Notes Olfactives
    product.seo?.contenance ?? '', // attribute:Contenance
    '', // attribute_data:Contenance
  ];

  return { headers, row };
};

// Shopify CSV Format
const generateShopifyCsv = (product: any): { headers: string[]; row: string[] } => {
  const headers = [
    'Handle','Title','Body (HTML)','Vendor','Product Category','Type','Tags','Published',
    'Option1 Name','Option1 Value','Option2 Name','Option2 Value','Option3 Name','Option3 Value',
    'Variant SKU','Variant Grams','Variant Inventory Tracker','Variant Inventory Qty',
    'Variant Inventory Policy','Variant Fulfillment Service','Variant Price','Variant Compare At Price',
    'Variant Requires Shipping','Variant Taxable','Variant Barcode','Image Src','Image Position',
    'Image Alt Text','Gift Card','SEO Title','SEO Description','Google Shopping / Google Product Category',
    'Google Shopping / Gender','Google Shopping / Age Group','Google Shopping / MPN',
    'Google Shopping / AdWords Grouping','Google Shopping / AdWords Labels','Google Shopping / Condition',
    'Google Shopping / Custom Product','Google Shopping / Custom Label 0','Google Shopping / Custom Label 1',
    'Google Shopping / Custom Label 2','Google Shopping / Custom Label 3','Google Shopping / Custom Label 4',
    'Variant Image','Variant Weight Unit','Variant Tax Code','Cost per item','Status'
  ];

  // Convert weight from grams to grams (Shopify uses grams)
  const weightInGrams = product.weight ?? '';

  const row = [
    product.seo?.slug ?? '', // Handle
    product.seo?.productTitle ?? product.name ?? '', // Title
    product.seo?.longDescription ?? '', // Body (HTML)
    product.brand ?? '', // Vendor
    '', // Product Category
    product.productType ?? '', // Type
    product.seo?.mainNotes ?? '', // Tags (using notes as tags)
    'TRUE', // Published
    'Title', // Option1 Name
    'Default Title', // Option1 Value
    '', // Option2 Name
    '', // Option2 Value
    '', // Option3 Name
    '', // Option3 Value
    product.seo?.slug ?? product.id ?? '', // Variant SKU
    weightInGrams, // Variant Grams
    'shopify', // Variant Inventory Tracker
    '', // Variant Inventory Qty
    'deny', // Variant Inventory Policy
    'manual', // Variant Fulfillment Service
    product.price ?? '', // Variant Price
    '', // Variant Compare At Price
    'TRUE', // Variant Requires Shipping
    'TRUE', // Variant Taxable
    '', // Variant Barcode
    cleanImageUrl(product.imageUrl), // Image Src (HTTP URL only, no base64)
    '1', // Image Position
    product.seo?.imageAltText ?? product.name ?? '', // Image Alt Text
    'FALSE', // Gift Card
    product.seo?.productTitle ?? '', // SEO Title
    product.seo?.shortDescription ?? '', // SEO Description
    '', // Google Shopping / Google Product Category
    '', // Google Shopping / Gender
    '', // Google Shopping / Age Group
    '', // Google Shopping / MPN
    '', // Google Shopping / AdWords Grouping
    '', // Google Shopping / AdWords Labels
    'new', // Google Shopping / Condition
    '', // Google Shopping / Custom Product
    '', // Google Shopping / Custom Label 0
    '', // Google Shopping / Custom Label 1
    '', // Google Shopping / Custom Label 2
    '', // Google Shopping / Custom Label 3
    '', // Google Shopping / Custom Label 4
    '', // Variant Image
    'g', // Variant Weight Unit
    '', // Variant Tax Code
    '', // Cost per item
    'active', // Status
  ];

  return { headers, row };
};

// ============================================
// MAIN FLOW
// ============================================

// Define the Genkit Flow
const generateCsvFlow = ai.defineFlow(
  {
    name: 'generateCsvFlow',
    inputSchema: z.object({
      product: CsvProductInputSchema,
      format: z.enum(['woocommerce-fr', 'woocommerce-en', 'shopify']).default('woocommerce-fr')
    }),
    outputSchema: GenerateCsvOutputSchema,
  },
  async ({ product, format }: { product: z.infer<typeof CsvProductInputSchema>; format: CsvFormat }) => {
    let headers: string[];
    let row: string[];
    let imageUploaded = false;
    let finalImageUrl = product.imageUrl || '';
    let imageUploadError: string | undefined;

    // Auto-upload image if it's base64 or blob
    if (await needsUpload(product.imageUrl)) {
      const productName = product.seo?.slug || product.name || 'product';
      const uploadedUrl = await processImageUrl(product.imageUrl, productName);

      if (uploadedUrl) {
        imageUploaded = true;
        finalImageUrl = uploadedUrl;
        // Update the product with the new URL for CSV generation
        product = { ...product, imageUrl: finalImageUrl };
      } else {
        // Keep original image URL even if upload fails
        imageUploadError = 'Image upload failed. Utilisez le champ URL externe pour ajouter votre image Cloudinary.';
        // finalImageUrl already contains the original base64/blob URL
      }
    }

    switch (format) {
      case 'woocommerce-en':
        ({ headers, row } = generateWooCommerceEnCsv(product));
        break;
      case 'shopify':
        ({ headers, row } = generateShopifyCsv(product));
        break;
      case 'woocommerce-fr':
      default:
        ({ headers, row } = generateWooCommerceFrCsv(product));
        break;
    }

    // Escape headers and values
    const headerLine = headers.map(escapeCsvField).join(',');
    const dataLine = row.map(escapeCsvField).join(',');

    // Add UTF-8 BOM for Excel compatibility with French characters
    const BOM = '\uFEFF';
    const csvContent = BOM + [headerLine, dataLine].join('\n');

    return {
      csvData: csvContent,
      imageUploaded,
      imageUrl: finalImageUrl || undefined,
      imageUploadError,
    };
  }
);
