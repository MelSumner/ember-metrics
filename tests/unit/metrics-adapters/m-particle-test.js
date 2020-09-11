import { module, test } from "ember-qunit";
import sinon from "sinon";
import { setupTest } from "ember-qunit";

let sandbox, config;

module("mParticle adapter", function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    sandbox = sinon.createSandbox();
    config = {
      apiKey: "mParticle_SDKKey",
    };
  });

  hooks.afterEach(function () {
    sandbox.restore();
  });

  test("#identify sets the distinct user ID, and uses any other ids for remaining identify call", function (assert) {
    const adapter = this.owner
      .factoryFor("ember-metrics@metrics-adapter:mParticle")
      .create({ config });
    const identify_stub = sandbox
      .stub(window.mParticle.Identity, "identify")
      .callsFake(() => {
        return true;
      });
    const identities = {
      distinctId: 123,
      email: "test@mparticle.com",
      other: "test123",
    };
    adapter.identify(identities);
    const mpIdentities = {
      userIdentities: {
        customerid: 123,
        email: "test@mparticle.com",
        other: "test123",
      },
    };
    assert.ok(identify_stub.firstCall.calledWith(mpIdentities));
  });

  test("#trackEvent is called with the right arguments", function (assert) {
    const adapter = this.owner
      .factoryFor("ember-metrics@metrics-adapter:mParticle")
      .create({ config });
    const stub = sandbox.stub(window.mParticle, "logEvent");
    adapter.trackEvent({
      event: "EventName",
      attr1: "button",
      attr2: "click",
      customFlags: { cf1: "value", cf2: "value2" },
    });
    const attributes = {
      attr1: "button",
      attr2: "click",
    };
    const customFlags = { cf1: "value", cf2: "value2" };

    assert.ok(
      stub.calledWith("EventName", 0, attributes, customFlags),
      "track called with proper arguments"
    );
  });

  test("#init calls with a valid config", function (assert) {
    config.options = {
      logLevel: "verbose",
    };
    const adapter = this.owner
      .factoryFor("ember-metrics@metrics-adapter:mParticle")
      .create({ config });
    const initializedWith = adapter.init();
    assert.equal(initializedWith.apiKey, "mParticle_SDKKey");
    const expectedConfig = {
      isDevelopmentMode: true,
      logLevel: "verbose",
      rq: [],
      snippetVersion: 2.2,
    };

    assert.deepEqual(initializedWith.config, expectedConfig);
  });

  test("#trackPage returns the correct response shape", function (assert) {
    const adapter = this.owner
      .factoryFor("ember-metrics@metrics-adapter:mParticle")
      .create({ config });
    const stub = sandbox.stub(window.mParticle, "logPageView");

    const attributes = {
      attr1: "button",
      attr2: "click",
    };
    adapter.trackPage(attributes);

    assert.ok(stub.calledWith("PageView", attributes));
  });
});
