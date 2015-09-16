import Ember from 'ember';

const {
  Service,
  getWithDefault,
  assert,
  isNone,
  warn,
  get,
  set,
  A: emberArray,
  String: { dasherize }
} = Ember;

export default Service.extend({
  _adapters: {},

  init() {
    const adapters = getWithDefault(this, 'metricsAdapters', emberArray([]));
    this._super(...arguments);
    this.activateAdapters(adapters);
  },

  identify(...args) {
    this.invoke('identify', ...args);
  },

  alias(...args) {
    this.invoke('alias', ...args);
  },

  trackEvent(...args) {
    this.invoke('trackEvent', ...args);
  },

  trackPage(...args) {
    this.invoke('trackPage', ...args);
  },

  activateAdapters(adapterOptions = []) {
    const cachedAdapters = get(this, '_adapters');
    let activatedAdapters = {};

    adapterOptions.forEach((adapterOption) => {
      const { name } = adapterOption;
      let adapter;

      if (cachedAdapters[name]) {
        warn(`[ember-metrics] Metrics adapter ${name} has already been activated.`);
        adapter = cachedAdapters[name];
      } else {
        adapter = this._activateAdapter(adapterOption);
      }

      set(activatedAdapters, name, adapter);
    });

    return set(this, '_adapters', activatedAdapters);
  },

  invoke(methodName, ...args) {
    const adaptersObj = get(this, '_adapters');
    const adapterNames = Object.keys(adaptersObj);
    const environment = get(this, 'environment')

    const adapters = adapterNames.map((adapterName) => {
      return get(adaptersObj, adapterName);
    });

    if (args.length > 1) {
      let [ adapterName, options ] = args;
      const adapter = get(adaptersObj, adapterName);

      if (environment in adapter.environments)
        adapter[methodName](options);
      else
        Ember.Logger.info(`[ember-metrics] ${adapter.name} ${options}`)
    } else {
      adapters.forEach((adapter) => {
        if (environment in adapter.environments)
          adapter[methodName](...args);
        else
          Ember.Logger.info(`[ember-metrics] ${adapter.name} ${args}`)
      });
    }
  },

  _activateAdapter(adapterOption = {}) {
    const metrics = this;
    const { name, config, environments } = adapterOption;
    const Adapter = this._lookupAdapter(name);
    assert(`[ember-metrics] Could not find metrics adapter ${name}.`, Adapter);

    return Adapter.create({ metrics, config, environments });
  },

  _lookupAdapter(adapterName = '') {
    const container = get(this, 'container');

    if (isNone(container)) {
      return;
    }

    const dasherizedAdapterName = dasherize(adapterName);
    const availableAdapter = container.lookupFactory(`ember-metrics@metrics-adapter:${dasherizedAdapterName}`);
    const localAdapter = container.lookupFactory(`metrics-adapter:${dasherizedAdapterName}`);
    const adapter = localAdapter ? localAdapter : availableAdapter;

    return adapter;
  },

  willDestroy() {
    const adapters = get(this, '_adapters');

    for (let adapterName in adapters) {
      get(adapters, adapterName).destroy();
    }
  }
});
