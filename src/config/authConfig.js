export const AUTH_MODES = {
    CLERK: {
        id: 'clerk',
        name: 'Clerk Cloud Authentication',
        enabled: true,
        description: 'Безпечна автентифікація через Clerk (Email, Social, Passkeys)'
    }
};

export const ACTIVE_AUTH_MODE = AUTH_MODES.CLERK;
export const isClerkMode = () => true;
export const isLegacyMode = () => false;

export default ACTIVE_AUTH_MODE;
