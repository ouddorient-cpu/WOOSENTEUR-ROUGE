require('dotenv').config();
const key = process.env.SERVICE_ACCOUNT_KEY;
if (!key) {
    console.error('Key not found');
    process.exit(1);
}

try {
    const sa = JSON.parse(key);
    const pk = sa.private_key;
    console.log('--- Private Key Inspection ---');
    console.log('Length:', pk.length);
    console.log('Starts with:', JSON.stringify(pk.substring(0, 30)));
    console.log('Ends with:', JSON.stringify(pk.substring(pk.length - 30)));

    const newlines = (pk.match(/\n/g) || []).length;
    const literalSlashN = (pk.match(/\\n/g) || []).length;

    console.log('Actual newlines (\\n character):', newlines);
    console.log('Literal \\n (two characters):', literalSlashN);

    if (newlines === 0 && literalSlashN > 0) {
        console.log('Suggestion: Need to replace literal \\\\n with actual newlines.');
    } else if (newlines === 0 && literalSlashN === 0) {
        console.log('Warning: No newlines found at all. PEM might be invalid.');
    }
} catch (e) {
    console.error('JSON Parse failed:', e.message);
}
