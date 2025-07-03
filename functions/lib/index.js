"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAdminClaims = exports.listUsers = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
// Initialize Firebase Admin SDK
admin.initializeApp();
const auth = admin.auth();
/**
 * Verify admin access from ID token
 */
async function verifyAdminAccess(idToken) {
    const decodedToken = await auth.verifyIdToken(idToken);
    if (!decodedToken.admin) {
        throw new functions.https.HttpsError('permission-denied', 'Admin access required');
    }
    return decodedToken;
}
/**
 * List all @kyanhealth.com users
 */
exports.listUsers = functions.https.onRequest(async (req, res) => {
    // Set CORS headers
    res.set('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.set('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    try {
        // Get and verify admin access
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const idToken = authHeader.split('Bearer ')[1];
        await verifyAdminAccess(idToken);
        // List all users
        const listUsersResult = await auth.listUsers(1000);
        // Filter and format @kyanhealth.com users
        const kyanUsers = listUsersResult.users
            .filter(user => { var _a; return (_a = user.email) === null || _a === void 0 ? void 0 : _a.endsWith('@kyanhealth.com'); })
            .map(user => {
            var _a;
            return ({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                isAdmin: ((_a = user.customClaims) === null || _a === void 0 ? void 0 : _a.admin) === true,
                lastSignIn: user.metadata.lastSignInTime,
                createdAt: user.metadata.creationTime,
                disabled: user.disabled,
                emailVerified: user.emailVerified
            });
        });
        res.json({ users: kyanUsers });
    }
    catch (error) {
        console.error('Error listing users:', error);
        if (error instanceof functions.https.HttpsError) {
            res.status(403).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});
/**
 * Set admin claims for a user
 */
exports.setAdminClaims = functions.https.onRequest(async (req, res) => {
    var _a;
    // Set CORS headers
    res.set('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.set('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    try {
        // Get and verify admin access
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const idToken = authHeader.split('Bearer ')[1];
        const adminUser = await verifyAdminAccess(idToken);
        // Get request data
        const { targetUid, isAdmin } = req.body;
        if (!targetUid || typeof isAdmin !== 'boolean') {
            res.status(400).json({ error: 'Missing or invalid parameters' });
            return;
        }
        // Prevent admins from removing their own admin status
        if (targetUid === adminUser.uid && !isAdmin) {
            res.status(400).json({ error: 'Cannot remove your own admin access' });
            return;
        }
        // Verify target user exists and is @kyanhealth.com
        const targetUser = await auth.getUser(targetUid);
        if (!((_a = targetUser.email) === null || _a === void 0 ? void 0 : _a.endsWith('@kyanhealth.com'))) {
            res.status(400).json({ error: 'Can only manage @kyanhealth.com users' });
            return;
        }
        // Set custom claims
        const customClaims = isAdmin ? { admin: true } : {};
        await auth.setCustomUserClaims(targetUid, customClaims);
        res.json({
            success: true,
            message: `${isAdmin ? 'Granted' : 'Revoked'} admin access for ${targetUser.email}`
        });
    }
    catch (error) {
        console.error('Error setting admin claims:', error);
        if (error instanceof functions.https.HttpsError) {
            res.status(403).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});
//# sourceMappingURL=index.js.map