const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const resolve = context.resolveRequest;

  if (moduleName === "isows" || moduleName.startsWith("zustand")) {
    const nextContext = {
      ...context,
      unstable_enablePackageExports: false,
    };

    return resolve(nextContext, moduleName, platform);
  }

  if (moduleName === "jose") {
    const nextContext = {
      ...context,
      unstable_conditionNames: ["browser"],
    };

    return resolve(nextContext, moduleName, platform);
  }

  if (moduleName.startsWith("@privy-io/")) {
    const nextContext = {
      ...context,
      unstable_enablePackageExports: true,
    };

    return resolve(nextContext, moduleName, platform);
  }

  return resolve(context, moduleName, platform);
};

module.exports = config;
