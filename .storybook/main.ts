import type { StorybookConfig } from "@storybook/react-webpack5";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  staticDirs: ["../public"],
  addons: [
    "@storybook/preset-create-react-app",
    "@storybook/addon-onboarding",
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    "@storybook/addon-interactions",  // Run 'play' for components
    '@storybook/addon-a11y',      // WCAG checks
    '@storybook/addon-designs',   // Figma
    {
      name: '@storybook/addon-styling-webpack',
      options: {
        // plugins: [
        //   new MiniCssExtractPlugin(),
        // ]
        // // CSS Modules
        //  // currently crashing Storybook - looks like due to demo components?
        // rules: [
        //   // Replaces existing CSS rules to support CSS Modules
        //   {
        //     test: /\.css$/,
        //     use: [
        //       'style-loader',
        //       {
        //         loader: 'css-loader',
        //         options: {
        //           modules: {
        //             auto: true,
        //             localIdentName: '[name]__[local]--[hash:base64:5]',
        //           },
        //         },
        //       }
        //     ],
        //   }
        // ]
      },
    },
  ],
  framework: {
    name: "@storybook/react-webpack5",
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
};
export default config;
