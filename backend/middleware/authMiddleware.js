import { verifyToken } from '@clerk/express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// In-memory cache for Clerk JWKS public keys as fallback
const jwksCache = {
    keys: {},
    fetchedAt: 0,
};

function getClerkFrontendDomain() {
    const key = process.env.CLERK_PUBLISHABLE_KEY || '';
    if (!key.startsWith('pk_')) return null;
    try {
        const parts = key.split('_');
        if (parts.length >= 3) {
            const rawDomain = Buffer.from(parts[2], 'base64').toString('ascii');
            return rawDomain.replace(/\$$/, '');
        }
    } catch {
        return null;
    }
    return null;
}

async function getClerkPublicKeyForKid(kid) {
    const now = Date.now();
    if (!jwksCache.keys[kid] || (now - jwksCache.fetchedAt > 3600000)) {
        const domain = getClerkFrontendDomain();
        if (!domain) return null;
        try {
            const res = await fetch(`https://${domain}/.well-known/jwks.json`);
            if (!res.ok) return null;
            const data = await res.json();
            if (Array.isArray(data.keys)) {
                jwksCache.keys = {};
                for (const k of data.keys) {
                    try {
                        const pubKey = crypto.createPublicKey({ key: k, format: 'jwk' });
                        jwksCache.keys[k.kid] = pubKey.export({ format: 'pem', type: 'spki' });
                    } catch {}
                }
                jwksCache.fetchedAt = now;
            }
        } catch {
            return null;
        }
    }
    return jwksCache.keys[kid] || null;
}

/**
 * Clerk Authentication Middleware
 * Validates Clerk session token using CLERK_SECRET_KEY and JWKS RS256.
 */
export const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.warn(`🔒 [Auth] No token provided for ${req.method} ${req.path}`);
        return res.status(401).json({ message: 'No token provided' });
    }

    const secretKey = process.env.CLERK_SECRET_KEY;
    const publishableKey = process.env.CLERK_PUBLISHABLE_KEY;

    // 1. Спроба верифікації через офіційний @clerk/express verifyToken
    if (secretKey) {
        try {
            const payload = await verifyToken(token, {
                secretKey,
                publishableKey,
            });

            if (payload && payload.sub) {
                req.user = {
                    ...payload,
                    sub: payload.sub,
                    userId: payload.sub,
                };
                return next();
            }
        } catch (err) {
            console.warn('⚠️ [Auth] @clerk/express verifyToken warning:', err.message);
        }
    }

    // 2. Верифікація через JWKS RS256
    try {
        const decoded = jwt.decode(token, { complete: true });
        const kid = decoded?.header?.kid;
        if (kid) {
            const pem = await getClerkPublicKeyForKid(kid);
            if (pem) {
                const verified = jwt.verify(token, pem, { algorithms: ['RS256'] });
                if (verified && verified.sub) {
                    req.user = {
                        ...verified,
                        sub: verified.sub,
                        userId: verified.sub,
                    };
                    return next();
                }
            }
        }
    } catch (jwksErr) {
        console.error('❌ [Auth] JWKS RS256 verification error:', jwksErr.message);
    }

    console.error(`❌ [Auth] Unauthorized access to ${req.method} ${req.path}`);
    return res.status(401).json({ message: 'Unauthorized: Invalid or expired Clerk token' });
};
