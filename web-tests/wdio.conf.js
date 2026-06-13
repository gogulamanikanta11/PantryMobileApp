exports.config = {
    runner: 'local',
    specs: [
        './tests/**/*.test.js'
    ],
    exclude: [],
    maxInstances: 10,
    capabilities: [{
        browserName: 'chrome',
        'goog:chromeOptions': {
            args: ['--disable-gpu', '--no-sandbox']
        }
    }],
    logLevel: 'info',
    bail: 0,
    baseUrl: 'http://localhost:8081',
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    services: [],
    framework: 'mocha',
    reporters: ['spec'],
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    },
}
