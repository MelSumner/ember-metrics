import objectTransforms from "../utils/object-transforms";
import BaseAdapter from "ember-metrics/metrics-adapters/base";
const { compact } = objectTransforms;
import { assert } from "@ember/debug";
import { assign } from "@ember/polyfills";
import removeFromDOM from "ember-metrics/utils/remove-from-dom";

export default BaseAdapter.extend({
  toStringExtension() {
    return "mParticle";
  },

  init() {
    const config = assign({}, this.config);
    const { apiKey, options } = config;
    assert(
      `[ember-metrics] You must pass a valid \`apiKey\` to the ${this.toString()} adapter`,
      apiKey
    );

    window.mParticle = {
      config: {
        isDevelopmentMode: true, //switch to false (or remove) for production
      },
    };

    for (var key in options) {
      window.mParticle.config[key] = options[key];
    }

    (function (t) {
      window.mParticle = window.mParticle || {};
      window.mParticle.EventType = {
        Unknown: 0,
        Navigation: 1,
        Location: 2,
        Search: 3,
        Transaction: 4,
        UserContent: 5,
        UserPreference: 6,
        Social: 7,
        Other: 8,
      };
      window.mParticle.eCommerce = { Cart: {} };
      window.mParticle.Identity = {};
      window.mParticle.config = window.mParticle.config || {};
      window.mParticle.config.rq = [];
      window.mParticle.config.snippetVersion = 2.2;
      window.mParticle.ready = function (t) {
        window.mParticle.config.rq.push(t);
      };
      var e = [
        "endSession",
        "logError",
        "logBaseEvent",
        "logEvent",
        "logForm",
        "logLink",
        "logPageView",
        "setSessionAttribute",
        "setAppName",
        "setAppVersion",
        "setOptOut",
        "setPosition",
        "startNewSession",
        "startTrackingLocation",
        "stopTrackingLocation",
      ];
      var o = ["setCurrencyCode", "logCheckout"];
      var i = ["identify", "login", "logout", "modify"];
      e.forEach(function (t) {
        window.mParticle[t] = n(t);
      });
      o.forEach(function (t) {
        window.mParticle.eCommerce[t] = n(t, "eCommerce");
      });
      i.forEach(function (t) {
        window.mParticle.Identity[t] = n(t, "Identity");
      });
      function n(e, o) {
        return function () {
          if (o) {
            e = o + "." + e;
          }
          var t = Array.prototype.slice.call(arguments);
          t.unshift(e);
          window.mParticle.config.rq.push(t);
        };
      }
      var mp = document.createElement("script");
      mp.type = "text/javascript";
      mp.async = true;
      mp.src =
        ("https:" == document.location.protocol
          ? "https://jssdkcdns"
          : "http://jssdkcdn") +
        ".mparticle.com/js/v2/" +
        t +
        "/mparticle.js";
      var c = document.getElementsByTagName("script")[0];
      c.parentNode.insertBefore(mp, c);
    })(apiKey);

    return { apiKey, config: window.mParticle.config };
  },

  identify(options = {}) {
    const compactedOptions = compact(options);
    const { distinctId } = compactedOptions;
    delete compactedOptions.distinctId;
    const identities = assign({ customerid: distinctId }, compactedOptions);

    // create a function that removes any ids that don't work with mparticle Identity calls
    window.mParticle.Identity.identify({ userIdentities: identities });
  },

  trackEvent(options = {}) {
    const compactedOptions = compact(options);
    const { event, customFlags } = compactedOptions;
    const args = [];

    args.push(event);

    if (compactedOptions.eventType) {
      args.push(compactedOptions.eventType);
    } else {
      args.push(window.mParticle.EventType.Unknown);
    }

    delete compactedOptions.customFlags;
    delete compactedOptions.event;

    args.push(compactedOptions);
    args.push(customFlags);

    window.mParticle.logEvent.apply(null, args);
  },

  trackPage(options = {}) {
    const compactedOptions = compact(options);
    window.mParticle.logPageView("PageView", compactedOptions);
  },

  willDestroy() {
    removeFromDOM('script[src*="mparticle"]');
    delete window.mParticle;
  },
});
