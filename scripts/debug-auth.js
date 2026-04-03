const admin = require('firebase-admin');
const { initializeApp, cert } = require('firebase-admin/app');
require('dotenv').config();

async function test() {
    console.log('--- Firebase Admin SDK Initialization Test ---');
    const keyString = process.env.SERVICE_ACCOUNT_KEY;

    if (!keyString) {
        console.error('❌ SERVICE_ACCOUNT_KEY not found');
        return;
    }

    // Check for trailing/leading whitespace or control chars
    const trimmedKeyString = keyString.trim();
    if (trimmedKeyString !== keyString) {
        console.log('⚠️ Warning: Leading/trailing whitespace detected and trimmed.');
    }

    let sa;
    try {
        sa = JSON.parse(trimmedKeyString);
        sa.private_key = sa.private_key.replace(/\\n/g, '\n');
    } catch (e) {
        console.error('❌ JSON Parse Error:', e.message);
        return;
    }

    console.log('Project ID:', sa.project_id);
    console.log('Client Email:', sa.client_email);

    // Method 1: Using cert() from firebase-admin/app
    try {
        console.log('\nTesting Method 1: cert() from firebase-admin/app...');
        const app1 = initializeApp({
            credential: cert(sa),
            projectId: sa.project_id
        }, 'method1');
        const list = await admin.auth(app1).listUsers(1);
        console.log('✅ Method 1 Success! Users found:', list.users.length);
        await admin.app('method1').delete();
    } catch (e) {
        console.log('❌ Method 1 Failed:', e.code, e.message);
    }

    // Method 2: Using admin.credential.cert()
    try {
        console.log('\nTesting Method 2: admin.credential.cert()...');
        const app2 = admin.initializeApp({
            credential: admin.credential.cert(sa),
            projectId: sa.project_id
        }, 'method2');
        const list = await admin.auth(app2).listUsers(1);
        console.log('✅ Method 2 Success! Users found:', list.users.length);
        await admin.app('method2').delete();
    } catch (e) {
        console.log('❌ Method 2 Failed:', e.code, e.message);
    }
}

test();
