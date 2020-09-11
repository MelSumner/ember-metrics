'use strict';

module.exports = function(environment) {
  let ENV = {
    modulePrefix: 'dummy',
    environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },

    'ember-metrics': {
      includeAdapters: [
        'segment',
        'google-tag-manager',
        'piwik',
        'facebook-pixel',
        'amplitude',
        'mParticle'
      ]
    },

    metricsAdapters: [
      {
        name: 'GoogleAnalytics',
        environments: ['all'],
        config: {
          id: 'UA-XXXX-Y'
        }
      },
      {
        // if `environments` is undefined, it defaults to all
        name: 'Mixpanel',
        // environments: ['all'],
        config: {
          token: '0f76c037-4d76-4fce-8a0f-a9a8f89d1453'
        }
      },
      {
        // if `environments` is undefined, it defaults to all
        name: 'Intercom',
        // environments: ['all'],
        config: {
          appId: 'def1abc2'
        }
      },
      {
        name: 'LocalDummyAdapter',
        environments: ['all'],
        config: {
          foo: 'bar'
        }
      }
    ]
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
  }

  return ENV;
};
