const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
    transpileDependencies: true,
    devServer: {
        //https: true,  // Enables HTTPS for the dev server
        hot: false,
        liveReload: false,
        allowedHosts: 'all',
        // Bind to 0.0.0.0 to allow LAN/mobile access
        host: '0.0.0.0',
        port: 8080,
        proxy: {
            '^/api': {
                target: 'http://localhost:5001',
                changeOrigin: true,
                logLevel: 'debug',
                pathRewrite: { '^/api': '/api' },
            },
        },
    },
    chainWebpack: config => {
        config.module
            .rule('txt')
            .test(/\.txt$/)
            .use('raw-loader')
            .loader('raw-loader')
            .end();
    }
});
