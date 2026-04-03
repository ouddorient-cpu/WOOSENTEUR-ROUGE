import * as dotenv from 'dotenv';
import { initializeApp, getApps, App, credential } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Load environment variables from .env file
dotenv.config();

function getFirebaseAdminSDKForTest(): App {
    console.log('Initializing Firebase Admin SDK for test...');
    const apps = getApps();
    if (apps.length > 0) {
        // Using an existing app can cause issues if it wasn't initialized with the right credentials.
        // For a test, we should probably create a new one.
        console.log(`Found existing app: ${apps[0].name}. Forcing re-initialization for test.`);
    }

    const serviceAccountString = process.env.SERVICE_ACCOUNT_KEY;

    if (!serviceAccountString) {
        throw new Error('SERVICE_ACCOUNT_KEY is not defined in your .env file.');
    }

    try {
        console.log('Parsing service account key...');
        const serviceAccount = JSON.parse(serviceAccountString);

        console.log('Original private_key starts with:', serviceAccount.private_key?.substring(0, 40));
        
        if (serviceAccount.private_key && serviceAccount.private_key.includes('\n')) {
            console.log('Found literal "\n" in private_key. Replacing with newlines...');
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
            console.log('Corrected private_key starts with:', serviceAccount.private_key?.substring(0, 40));
        } else {
            console.log('No literal "\n" found. Using private_key as is.');
        }

        const appName = `firestore-test-${Date.now()}`;
        console.log(`Initializing new app: ${appName}`);

        const app = initializeApp({
            credential: credential.cert(serviceAccount),
        }, appName);

        console.log('Firebase Admin SDK initialized successfully.');
        return app;

    } catch (e: any) {
        console.error("Error parsing or initializing from SERVICE_ACCOUNT_KEY:", e.message);
        throw new Error("The Firebase service account key is malformed. Please check your .env file.");
    }
}

async function testFirestoreConnection() {
    try {
        const app = getFirebaseAdminSDKForTest();
        const db = getFirestore(app);

        console.log('Attempting to list collections from Firestore...');
        const collections = await db.listCollections();
        
        if (collections.length > 0) {
            console.log('Successfully connected to Firestore and found collections:');
            collections.forEach(collection => console.log(`- ${collection.id}`));
        } else {
            console.log('Successfully connected to Firestore, but no collections were found.');
        }
    } catch (error) {
        console.error('Firestore connection test failed:', error);
    }
}

testFirestoreConnection();
