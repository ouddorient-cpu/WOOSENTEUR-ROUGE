
'use client';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import type { UserProfile } from '@/lib/types';

// The email for the superadmin user
const SUPERADMIN_EMAIL = 'ouddorient@gmail.com';

/**
 * Creates or updates a user profile in Firestore.
 * If the user is the designated superadmin, they get unlimited credits and admin privileges.
 * Otherwise, they are created as a standard user with an initial credit balance.
 *
 * @param {User} user - The Firebase Auth user object.
 * @returns {Promise<UserProfile>} A promise that resolves with the user's profile.
 */
export async function createUser(user: User): Promise<UserProfile> {
    const db = getFirestore();
    const userRef = doc(db, 'users', user.uid);

    console.log(`Checking or creating profile for: ${user.email}`);

    // For regular users, only create the profile if it doesn't exist
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        console.log(`Profile for ${user.email} already exists.`);
        return userSnap.data() as UserProfile;
    }

    let newUserProfile: UserProfile;

    // For the superadmin, ensure their profile is always correct on creation
    if (user.email === SUPERADMIN_EMAIL) {
        console.log(`Superadmin detected: ${user.email}. Setting admin privileges.`);
        newUserProfile = {
            email: user.email,
            displayName: user.displayName || 'Super Admin',
            photoURL: user.photoURL,
            role: 'superadmin',
            isUnlimited: true,
            creditBalance: 999999, // A large number to represent infinity
            subscriptionStatus: 'active',
            subscriptionPlan: 'premium',
            createdAt: serverTimestamp() as Timestamp,
        };
    } else {
        console.log(`Creating new standard user profile for: ${user.email}`);
        newUserProfile = {
            email: user.email!,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: 'user',
            isUnlimited: false,
            creditBalance: 5, // Standard starting credits
            subscriptionStatus: 'trialing',
            subscriptionPlan: 'free',
            createdAt: serverTimestamp() as Timestamp,
        };
    }
    
    await setDoc(userRef, newUserProfile);
    return newUserProfile;
}
