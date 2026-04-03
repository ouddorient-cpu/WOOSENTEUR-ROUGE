

'use client';
import { getFirestore, collection, addDoc, serverTimestamp, Timestamp, doc, setDoc, getDoc, updateDoc, increment, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, UploadTaskSnapshot } from 'firebase/storage';
import { Product, SeoData, UserProfile, MarketingCampaign, MarketingBrief, MarketingGeneration, ImportRecord } from './types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { PlaceHolderImages } from './placeholder-images';


type ProductInput = Omit<Product, 'id' | 'createdAt' | 'seo'> & {
    seo: SeoData;
};

// Note: This function should be called from a client component
// after ensuring the user is authenticated.
export function saveProduct(userId: string, productData: Omit<ProductInput, 'userId'>): Promise<string> {
    const db = getFirestore();
    const productsCollectionRef = collection(db, 'users', userId, 'products');
    
    // 1. Create a new document reference with a generated ID
    const newProductRef = doc(productsCollectionRef);
    const newProductId = newProductRef.id;

    // 2. Prepare the full document data, including the generated ID
    const docData = {
        ...productData,
        id: newProductId, // Include the ID in the document data
        userId: userId,
        createdAt: serverTimestamp(),
        // No default imageUrl
    };
    
    return new Promise((resolve, reject) => {
        // 3. Use setDoc with the new reference
        setDoc(newProductRef, docData)
            .then(() => {
                resolve(newProductId); // Resolve with the new ID on success
            })
            .catch(addError => {
                const permissionError = new FirestorePermissionError({
                    path: newProductRef.path, // Use the path of the specific document ref
                    operation: 'create',
                    requestResourceData: docData,
                });
                errorEmitter.emit('permission-error', permissionError);
                reject(addError); // Reject the promise on creation failure
            });
    });
}


export interface UploadCallbacks {
  onProgress: (progress: number) => void;
}

/**
 * Uploads an image, updates Firestore, and returns the download URL.
 * This function is now async and returns a Promise.
 */
export async function uploadProductImage(
    userId: string, 
    productId: string, 
    file: File, 
    callbacks: UploadCallbacks
): Promise<string> { // Returns a Promise with the downloadURL
    const storage = getStorage();
    const db = getFirestore();
    const { onProgress } = callbacks;

    const storageRef = ref(storage, `users/${userId}/products/${productId}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
            (snapshot: UploadTaskSnapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                onProgress(progress);
            },
            (error) => {
                console.error('Upload failed:', error);
                reject(error); // Reject the promise on upload error
            },
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    const productRef = doc(db, 'users', userId, 'products', productId);
                    
                    // Now we AWAIT the Firestore update
                    await updateDoc(productRef, { imageUrl: downloadURL });

                    resolve(downloadURL); // Resolve the promise with the URL when everything is complete
                } catch (error) {
                    console.error("Failed to get download URL or update Firestore:", error);
                     if (error instanceof Error && 'code' in error && (error as any).code.includes('permission-denied')) {
                        const permissionError = new FirestorePermissionError({
                            path: `users/${userId}/products/${productId}`,
                            operation: 'update',
                            requestResourceData: { imageUrl: '...' },
                        });
                        errorEmitter.emit('permission-error', permissionError);
                    }
                    reject(error as Error); // Reject the promise on Firestore error
                }
            }
        );
    });
}


export type WooCommerceCredentials = {
    storeUrl: string;
    consumerKey: string;
    consumerSecret: string;
};

export function saveWooCommerceCredentials(userId: string, credentials: WooCommerceCredentials): void {
    const db = getFirestore();
    const userRef = doc(db, 'users', userId);

    const dataToUpdate = {
        wooCommerce: credentials
    };

    setDoc(userRef, dataToUpdate, { merge: true })
        .catch(error => {
            const permissionError = new FirestorePermissionError({
                path: userRef.path,
                operation: 'update',
                requestResourceData: dataToUpdate,
            });
            errorEmitter.emit('permission-error', permissionError);
             // We don't reject here because the error is handled globally.
             // Rejecting would require a try/catch in the calling component.
        });
}


export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    const db = getFirestore();
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        return userSnap.data() as UserProfile;
    } else {
        return null;
    }
}


export async function decrementCredits(userId: string): Promise<void> {
    const db = getFirestore();
    const userRef = doc(db, 'users', userId);

    const profile = await getUserProfile(userId);

    // Bypass for admin/unlimited users
    if(profile?.isUnlimited || profile?.role === 'superadmin') {
        console.log("✅ Admin user detected, credit decrement skipped.");
        return; // Return directly
    }

    if ((profile?.creditBalance ?? 0) <= 0) {
        throw new Error("Crédits insuffisants pour effectuer cette action.");
    }

    // This is now a fully awaited operation
    try {
        await updateDoc(userRef, {
            creditBalance: increment(-1),
        });
    } catch (error) {
        // Catch potential permission errors and emit them globally.
        const permissionError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'update',
            requestResourceData: { creditBalance: 'increment(-1)' },
        });
        errorEmitter.emit('permission-error', permissionError);
        // Re-throw the original error to stop the generation process
        throw error;
    }
}

// ============================================
// Marketing Campaign Helper Functions
// ============================================

type CampaignInput = Omit<MarketingCampaign, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Creates a new marketing campaign in Firestore
 */
export async function saveCampaign(userId: string, campaignData: Omit<CampaignInput, 'status'> & { status?: MarketingCampaign['status'] }): Promise<string> {
    const db = getFirestore();
    const campaignsCollectionRef = collection(db, 'users', userId, 'campaigns');

    const newCampaignRef = doc(campaignsCollectionRef);
    const newCampaignId = newCampaignRef.id;

    const docData = {
        ...campaignData,
        id: newCampaignId,
        status: campaignData.status || 'draft',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    return new Promise((resolve, reject) => {
        setDoc(newCampaignRef, docData)
            .then(() => {
                resolve(newCampaignId);
            })
            .catch(error => {
                const permissionError = new FirestorePermissionError({
                    path: newCampaignRef.path,
                    operation: 'create',
                    requestResourceData: docData,
                });
                errorEmitter.emit('permission-error', permissionError);
                reject(error);
            });
    });
}

/**
 * Get all campaigns for a user
 */
export async function getCampaigns(userId: string, maxResults: number = 50): Promise<MarketingCampaign[]> {
    const db = getFirestore();
    const campaignsRef = collection(db, 'users', userId, 'campaigns');
    const q = query(campaignsRef, orderBy('createdAt', 'desc'), limit(maxResults));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as MarketingCampaign);
}

/**
 * Get a single campaign by ID
 */
export async function getCampaignById(userId: string, campaignId: string): Promise<MarketingCampaign | null> {
    const db = getFirestore();
    const campaignRef = doc(db, 'users', userId, 'campaigns', campaignId);
    const campaignSnap = await getDoc(campaignRef);

    if (campaignSnap.exists()) {
        return campaignSnap.data() as MarketingCampaign;
    }
    return null;
}

/**
 * Update a campaign (e.g., add generations, update status)
 */
export async function updateCampaign(
    userId: string,
    campaignId: string,
    updates: Partial<Omit<MarketingCampaign, 'id' | 'createdAt'>>
): Promise<void> {
    const db = getFirestore();
    const campaignRef = doc(db, 'users', userId, 'campaigns', campaignId);

    try {
        await updateDoc(campaignRef, {
            ...updates,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        const permissionError = new FirestorePermissionError({
            path: campaignRef.path,
            operation: 'update',
            requestResourceData: updates,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw error;
    }
}

/**
 * Get all products for a user (for the product selector)
 */
export async function getProducts(userId: string, maxResults: number = 100): Promise<Product[]> {
    const db = getFirestore();
    const productsRef = collection(db, 'users', userId, 'products');
    const q = query(productsRef, orderBy('createdAt', 'desc'), limit(maxResults));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Product);
}

// ============================================
// Daily Import Quota (max 100 produits/jour, max 50 par import)
// ============================================

export const DAILY_IMPORT_MAX = 100;
export const IMPORT_BATCH_MAX = 50;
export const QUICK_ENTRY_MAX = 100;

/**
 * Vérifie si l'utilisateur peut importer `count` produits aujourd'hui.
 * - Superadmin/isUnlimited : toujours autorisé
 * - Sinon : max 50 par import, max 100 par jour
 * Lance une erreur si la limite est dépassée.
 * Retourne le nombre de produits déjà importés aujourd'hui (après réinitialisation si nouveau jour).
 */
export async function checkDailyImportQuota(userId: string, count: number, batchMax: number = IMPORT_BATCH_MAX): Promise<number> {
    const db = getFirestore();
    const userRef = doc(db, 'users', userId);
    const profile = await getUserProfile(userId);

    if (profile?.isUnlimited || profile?.role === 'superadmin') {
        return 0; // pas de limite pour les admins
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const savedDate = profile?.dailyImportDate ?? '';
    const savedCount = savedDate === today ? (profile?.dailyImportCount ?? 0) : 0;

    if (count > batchMax) {
        throw new Error(`MAX_BATCH:Vous ne pouvez pas importer plus de ${batchMax} produits à la fois.`);
    }
    if (savedCount + count > DAILY_IMPORT_MAX) {
        const remaining = DAILY_IMPORT_MAX - savedCount;
        throw new Error(`MAX_DAILY:Quota journalier atteint. Vous avez déjà importé ${savedCount} produits aujourd'hui. Il vous reste ${remaining < 0 ? 0 : remaining} produit(s) disponible(s) aujourd'hui.`);
    }

    return savedCount;
}

/**
 * Incrémente le compteur journalier après un import réussi.
 */
export async function incrementDailyImportCount(userId: string, count: number): Promise<void> {
    const db = getFirestore();
    const userRef = doc(db, 'users', userId);
    const profile = await getUserProfile(userId);

    if (profile?.isUnlimited || profile?.role === 'superadmin') return;

    const today = new Date().toISOString().split('T')[0];
    const savedDate = profile?.dailyImportDate ?? '';
    const currentCount = savedDate === today ? (profile?.dailyImportCount ?? 0) : 0;

    await updateDoc(userRef, {
        dailyImportCount: currentCount + count,
        dailyImportDate: today,
    });
}

// ============================================
// Import History
// ============================================

export async function saveImportHistory(userId: string, record: Omit<ImportRecord, 'id' | 'createdAt'>): Promise<void> {
    const db = getFirestore();
    const histRef = doc(collection(db, 'users', userId, 'importHistory'));
    await setDoc(histRef, { ...record, id: histRef.id, createdAt: serverTimestamp() });
}

export async function getImportHistory(userId: string): Promise<ImportRecord[]> {
    const db = getFirestore();
    const q = query(collection(db, 'users', userId, 'importHistory'), orderBy('createdAt', 'desc'), limit(20));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data() as ImportRecord);
}

/**
 * Decrement credits by a specific amount (for marketing campaigns that cost 2 credits)
 */
export async function decrementCreditsBy(userId: string, amount: number): Promise<void> {
    const db = getFirestore();
    const userRef = doc(db, 'users', userId);

    const profile = await getUserProfile(userId);

    if(profile?.isUnlimited || profile?.role === 'superadmin') {
        console.log("✅ Admin user detected, credit decrement skipped.");
        return;
    }

    if ((profile?.creditBalance ?? 0) < amount) {
        throw new Error(`Crédits insuffisants. Vous avez besoin de ${amount} crédits pour cette action.`);
    }

    try {
        await updateDoc(userRef, {
            creditBalance: increment(-amount),
        });
    } catch (error) {
        const permissionError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'update',
            requestResourceData: { creditBalance: `increment(-${amount})` },
        });
        errorEmitter.emit('permission-error', permissionError);
        throw error;
    }
}

    