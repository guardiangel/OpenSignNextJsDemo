/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                source: '/',
                headers: [
                    { key: 'Access-Control-Allow-Credentials', value: 'true' },
                    { key: 'Access-Control-Allow-Origin', value: '*/*' },
                ],
            },
        ];
    },

    reactStrictMode: true,
    webpack: (config) => {
        // load worker files as a urls with `file-loader`
        config.module.rules.unshift({
            test: /pdf\.worker\.(min\.)?js/,
            use: [
                {
                    loader: 'file-loader',
                    options: {
                        name: '[contenthash].[ext]',
                        publicPath: '_next/static/worker',
                        outputPath: 'static/worker',
                    },
                },
            ],
        });

        // config.resolve.fallback = {
        //     child_process: false,
        // };

        return config;
    },
};

module.exports = nextConfig;
