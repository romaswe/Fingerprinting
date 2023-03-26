export interface Fingerprint {
    fingerprintHash?: Promise<string> | string;
    hashedWebglFingerprint?: Promise<string> | string;
    hashedInfoFingerprint?: Promise<string> | string;
    usingWebGL?: boolean;
}