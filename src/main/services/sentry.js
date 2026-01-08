/**
 * Sentry Error Tracking Service
 * Centralized error monitoring for remote debugging
 */

const Sentry = require('@sentry/electron/main');
const { app } = require('electron');

// Sentry DSN - Error tracking configuration
const SENTRY_DSN = 'https://4270d5ace0d51d4db0f58d5282391d47@o4510673439162368.ingest.de.sentry.io/4510673452990544';

// Check if Sentry is configured
const isSentryConfigured = SENTRY_DSN !== 'YOUR_SENTRY_DSN_HERE' && SENTRY_DSN.startsWith('https://');

/**
 * Initialize Sentry in main process
 */
function initialize() {
    if (!isSentryConfigured) {
        console.log('[Sentry] Not configured - skipping initialization');
        console.log('[Sentry] Get your DSN from https://sentry.io');
        return false;
    }

    try {
        Sentry.init({
            dsn: SENTRY_DSN,

            // App info
            release: `guvenli-yukleyici@${app.getVersion()}`,
            environment: process.env.NODE_ENV || 'production',

            // Performance monitoring (optional)
            tracesSampleRate: 0.1, // 10% of transactions

            // Error filtering
            beforeSend(event, hint) {
                // Don't send in development
                if (process.env.NODE_ENV === 'development') {
                    console.log('[Sentry] Skipping error in dev mode:', event.message);
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

        console.log('[Sentry] Initialized successfully');
        return true;
    } catch (err) {
        console.error('[Sentry] Failed to initialize:', err);
        return false;
    }
}

/**
 * Capture an error manually
 */
function captureError(error, context = {}) {
    if (!isSentryConfigured) return;

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
    if (!isSentryConfigured) return;

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
    if (!isSentryConfigured) return;

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
    if (!isSentryConfigured) return;

    Sentry.setUser(user);
}

/**
 * Check if Sentry is enabled
 */
function isEnabled() {
    return isSentryConfigured;
}

module.exports = {
    initialize,
    captureError,
    captureMessage,
    addBreadcrumb,
    setUser,
    isEnabled,
    SENTRY_DSN
};
