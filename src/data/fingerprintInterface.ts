export interface Fingerprint {
    fingerprintHash?: Promise<string>;
    hashedWebglFingerprint?: Promise<string> | undefined
    hashedInfoFingerprint?: Promise<string> | undefined
    usingWebGL?: boolean;
}