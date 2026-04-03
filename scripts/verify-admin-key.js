
const { initializeApp, cert, deleteApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config();

async function verifyCredentials() {
    console.log('--- Verifying Firebase Credentials ---');

    const key = process.env.SERVICE_ACCOUNT_KEY;
    if (!key) {
        console.error('❌ Error: SERVICE_ACCOUNT_KEY is undefined!');
        process.exit(1);
    }

    console.log(`✅ Key found. Length: ${key.length}`);

    let app;
    try {
        const serviceAccount = JSON.parse(key);
        console.log(`✅ JSON Parse success.`);
        console.log(`   Project ID: ${serviceAccount.project_id}`);
        console.log(`   Client Email: ${serviceAccount.client_email}`);
        console.log(`   Private Key Length: ${serviceAccount.private_key?.length}`);

        // Debug raw private key formatting
        const hasLiteralSlashN = serviceAccount.private_key?.includes('\\n');
        const hasActualNewline = serviceAccount.private_key?.includes('\n');
        console.log(`   Has literal \\n: ${hasLiteralSlashN}`);
        console.log(`   Has actual newline: ${hasActualNewline}`);

        // Apply fix
        if (serviceAccount.private_key) {
            if (hasLiteralSlashN) {
                console.log('⚠️ Literal \\n detected in private_key. Fixing...');
                serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
            } else if (!hasActualNewline) {
                console.log('ℹ️ No newlines (literal or actual) found in private_key. This might be invalid for RS256.');
            }
        }

        console.log('Initializing App...');
        app = initializeApp({
            credential: cert(serviceAccount),
            projectId: serviceAccount.project_id
        }, 'verify-script-app');

        console.log('Connecting to Firestore to list users (test op)...');
        const db = getFirestore(app);

        // Try a simple read - e.g. read a known collection limit 1
        const snapshot = await db.collection('users').limit(1).get();
        console.log(`✅ SUCCESS! Firestore read successful.`);
        console.log(`   Found ${snapshot.size} docs.`);

        if (!snapshot.empty) {
            console.log(`   First doc ID: ${snapshot.docs[0].id}`);
        }

    } catch (error) {
        console.error('\n❌ FAILURE: An error occurred during verification.');
        console.error('Error Name:', error.name);
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);
        if (error.stack) console.error('Stack Trace:', error.stack);
        if (error.details) console.error('Details:', error.details);

        // Check for specific UNAUTHENTICATED sub-reasons
        if (error.code === 16 || error.message.includes('UNAUTHENTICATED')) {
            console.log('\n--- Troubleshooting UNAUTHENTICATED ---');
            console.log('1. Verify the Service Account has NOT been deleted in GCP Console.');
            console.log('2. Verify the Project ID matches: studio-2957055289-b4c78');
            console.log('3. Ensure the Private Key is correctly formatted (no extra spaces, correct \\n characters).');
            console.log('4. Check if the system clock on your machine is correct.');
        }
        process.exit(1);
    } finally {
        if (app) {
            await deleteApp(app);
        }
    }
}

verifyCredentials();
