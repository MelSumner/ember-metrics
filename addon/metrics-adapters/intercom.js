import { assign } from '@ember/polyfills';
import $ from 'jquery';
import { assert } from '@ember/debug';
import { get } from '@ember/object';
import canUseDOM from '../utils/can-use-dom';
import canUseMetrics from '../utils/can-use-metrics';
import objectTransforms from '../utils/object-transforms';
import BaseAdapter from './base';

const {
  compact,
  without,
} = objectTransforms;

export default BaseAdapter.extend({
  booted: false,

  toStringExtension() {
    return 'Intercom';
  },

  init() {
    const { appId } = get(this, 'config');

    assert(`[ember-metrics] You must pass a valid \`appId\` to the ${this.toString()} adapter`, appId);

    if (canUseDOM && canUseMetrics) {
      /* eslint-disable */
      (function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',{});}else{var d=document;var i=function(){i.c(arguments)};i.q=[];i.c=function(args){i.q.push(args)};w.Intercom=i;function l(){var s=d.createElement('script');s.type='text/javascript';s.async=true;
      s.src=`https://widget.intercom.io/widget/${appId}`;
      var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);} l(); }})()
      /* eslint-enable */
    }
  },

  identify(options = {}) {
    const { appId } = get(this, 'config');
    const compactedOptions = compact(options);
    const { distinctId } = compactedOptions;
    const props = without(compactedOptions, 'distinctId');

    props.app_id = appId;
    if (distinctId) {
      props.user_id = distinctId;
    }

    assert(`[ember-metrics] You must pass \`distinctId\` or \`email\` to \`identify()\` when using the ${this.toString()} adapter`, props.email || props.user_id);

    const method = this.booted ? 'update' : 'boot';
    if (canUseDOM && canUseMetrics) {
      window.Intercom(method, props);
      this.booted = true;
    }
  },

  trackEvent(options = {}) {
    const compactedOptions = compact(options);
    const { event } = compactedOptions;
    const props = without(compactedOptions, 'event');

    if (canUseDOM && canUseMetrics) {
      window.Intercom('trackEvent', event, props);
    }
  },

  trackPage(options = {}) {
    const event = { event: 'page viewed' };
    const mergedOptions = assign(event, options);

    this.trackEvent(mergedOptions);
  },

  willDestroy() {
    if (canUseDOM && canUseMetrics) {
      $('script[src*="intercom"]').remove();
      delete window.Intercom;
    }
  }
});
