import { randomBytes, pbkdf2Sync } from 'crypto';

export const hashPassword = async (password) => {
    const salt = randomBytes(16).toString('hex');
    const iterations = parseInt(process.env.ITERATIONS || '10000', 10);
    const keyLength = 64;
    const digest = 'sha512';

    const hash = pbkdf2Sync(password, salt, iterations, keyLength, digest).toString('hex');

    return `${salt}:${iterations}:${hash}`;
};

export const verifyPassword = async (password, storedHash) => {
    const [salt, iterations, originalHash] = storedHash.split(':');

    const keyLength = 64;
    const digest = 'sha512';

    const generatedHash = pbkdf2Sync(password, salt, parseInt(iterations, 10), keyLength, digest).toString('hex');
    console.log('Generated Hash:', generatedHash);

    return generatedHash === originalHash;
};