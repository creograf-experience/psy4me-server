module.exports = {
    mongodbMemoryServerOptions: {
        instance: {
            dbName: 'jest'
        },
        binary: {
            version: '3.4.24', // Version of MongoDB on the server
            skipMD5: true
        },
        autoStart: false
    }
};