/**
 * GlitchTip Error Tracking Service
 * Centralized error monitoring for remote debugging
 * GlitchTip is an open-source, self-hosted alternative to Sentry
 */

const Sentry = require('@sentry/electron/main');
const { app } = require('electron');

// GlitchTip DSN - Error tracking configuration
// IMPORTANT: Replace this with your own GlitchTip DSN after installation
// Format: https://[key]@your-domain.com/[project-id]
// See GLITCHTIP-SETUP-GUIDE.md for setup instructions
const GLITCHTIP_DSN = 'https://566f1a1ad6de4cb2918b713fad968e8e@glitchtip.mytepeapi.com.tr/1';

// Check if GlitchTip is configured
const isGlitchTipConfigured = GLITCHTIP_DSN !== 'YOUR_GLITCHTIP_DSN_HERE' &&
                               (GLITCHTIP_DSN.startsWith('http://') || GLITCHTIP_DSN.startsWith('https://'));

/**
 * Initialize GlitchTip in main process
 * Uses Sentry SDK (100% compatible)
 */
function initialize() {
    if (!isGlitchTipConfigured) {
        console.log('[GlitchTip] Not configured - skipping initialization');
        console.log('[GlitchTip] See GLITCHTIP-SETUP-GUIDE.md for setup instructions');
        return false;
    }

    try {
        Sentry.init({
            dsn: GLITCHTIP_DSN,

            // App info
            release: `guvenli-yukleyici@${app.getVersion()}`,
            environment: process.env.NODE_ENV || 'production',

            // Performance monitoring (optional)
            tracesSampleRate: 0.1, // 10% of transactions

            // Error filtering
            beforeSend(event, hint) {
                // Don't send in development
                if (process.env.NODE_ENV === 'development') {
                    console.log('[GlitchTip] Skipping error in dev mode:', event.message);
                    return null;
                }

                // Add extra context
                event.tags = {
                    ...event.tags,
                    platform: process.platform,
                    arch: process.arch,
                    electron_version: process.versions.electron,
                    node_version: process.versions.node
                };

                return event;
            },

            // Integrations
            integrations: [
                // Automatically capture unhandled rejections
                Sentry.captureConsoleIntegration({ levels: ['error', 'warn'] })
            ]
        });

        console.log('[GlitchTip] Initialized successfully');
        return true;
    } catch (err) {
        console.error('[GlitchTip] Failed to initialize:', err);
        return false;
    }
}

/**
 * Capture an error manually
 */
function captureError(error, context = {}) {
    if (!isGlitchTipConfigured) return;

    Sentry.withScope((scope) => {
        // Add extra context
        if (context.user) {
            scope.setUser(context.user);
        }
        if (context.tags) {
            Object.entries(context.tags).forEach(([key, value]) => {
                scope.setTag(key, value);
            });
        }
        if (context.extra) {
            Object.entries(context.extra).forEach(([key, value]) => {
                scope.setExtra(key, value);
            });
        }

        Sentry.captureException(error);
    });
}

/**
 * Capture a message
 */
function captureMessage(message, level = 'info', context = {}) {
    if (!isGlitchTipConfigured) return;

    Sentry.withScope((scope) => {
        scope.setLevel(level);
        if (context.tags) {
            Object.entries(context.tags).forEach(([key, value]) => {
                scope.setTag(key, value);
            });
        }
        Sentry.captureMessage(message);
    });
}

/**
 * Add breadcrumb for debugging
 */
function addBreadcrumb(message, category = 'app', data = {}) {
    if (!isGlitchTipConfigured) return;

    Sentry.addBreadcrumb({
        message,
        category,
        data,
        level: 'info'
    });
}

/**
 * Set user context
 */
function setUser(user) {
    if (!isGlitchTipConfigured) return;

    Sentry.setUser(user);
}

/**
 * Check if GlitchTip is enabled
 */
function isEnabled() {
    return isGlitchTipConfigured;
}

module.exports = {
    initialize,
    captureError,
    captureMessage,
    addBreadcrumb,
    setUser,
    isEnabled,
    GLITCHTIP_DSN
};
