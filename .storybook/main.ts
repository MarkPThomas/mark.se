import type { StorybookConfig } from "@storybook/react-webpack5";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/preset-create-react-app",
    "@storybook/addon-onboarding",
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    "@storybook/addon-interactions",
    '@storybook/addon-designs',
    {
      name: '@storybook/addon-styling-webpack',
      options: {
        // plugins: [
        //   new MiniCssExtractPlugin(),
        // ]
        rules: [
          // Replaces existing CSS rules to support CSS Modules
          {
            test: /\.css$/,
            use: [
              'style-loader',
              {
                loader: 'css-loader',
                options: {
                  modules: {
                    auto: true,
                    localIdentName: '[name]__[local]--[hash:base64:5]',
                  },
                },
              }
            ],
          }
        ]
      },
    },
  ],
  framework: {
    name: "@storybook/react-webpack5",
    options: {},
  },
  staticDirs: ["../public"],
};
export default config;
