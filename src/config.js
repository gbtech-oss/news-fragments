import fs from "fs";
import Joi from "joi";
import path from "path";

const fragmentsTypesSchema = Joi.object({
  title: Joi.string().required(),
  extension: Joi.string().required(),
}).required();

const schema = Joi.object({
  changelogFile: Joi.string().required(),
  changelogDateFormat: Joi.string().required(),
  changelogTemplate: Joi.string().required(),
  fragmentsFolder: Joi.string().required(),
  fragmentsTypes: Joi.array().items(fragmentsTypesSchema).required(),
});

const changelogTemplate = `# [{{newVersion}}] - ({{bumpDate}})
{{#fragments}}

## {{title}}
{{#each fragmentEntries}}
* {{this}}
{{/each}}
{{/fragments}}
`;

const baseConfig = {
  changelogFile: "CHANGELOG.md",
  changelogDateFormat: "YYYY-MM-DD",
  changelogTemplate: changelogTemplate,
  fragmentsFolder: "fragments",
  fragmentsTypes: [
    { title: "Features", extension: "feature" },
    { title: "Bugfixes", extension: "bugfix" },
    { title: "Documentation", extension: "doc" },
    { title: "Deprecations and Removals", extension: "removal" },
    { title: "Misc", extension: "misc" },
  ],
};

export const buildConfig = function (config) {
  const newsFragmentConfiguration = Object.assign({}, baseConfig, config);

  const { error } = schema.validate(newsFragmentConfiguration);

  if (error) {
    throw new Error(error.message);
  }

  return newsFragmentConfiguration;
};

export const retrieveUserConfig = async function (config, name) {
  return config.getContext(`plugins.${name}`) || null;
};

const readJsonFile = function (file) {
  try {
    const content = fs.readFileSync(path.resolve(process.cwd(), file), "utf8");

    // Editors on Windows often write a BOM, which JSON.parse rejects.
    // release-it accepts it, so stripping it here keeps the same behaviour.
    return JSON.parse(content.replace(/^﻿/, ""));
  } catch {
    return null;
  }
};

const readPluginConfigFromFiles = function (name) {
  const sources = [
    () => readJsonFile(".release-it.json"),
    () => readJsonFile("package.json")?.["release-it"],
  ];

  for (const source of sources) {
    const pluginConfig = source()?.plugins?.[name];

    if (pluginConfig) {
      return pluginConfig;
    }
  }

  return null;
};

// release-it resolves formats this module does not read, such as .release-it.js,
// .yaml and .toml. It is only loaded when the JSON files carry no config, and its
// absence does not break the CLI.
const readPluginConfigFromReleaseIt = async function (name) {
  try {
    const { Config } = await import("release-it");
    const config = new Config();

    await config.init();

    return await retrieveUserConfig(config, name);
  } catch {
    return null;
  }
};

export const resolveUserConfig = async function (name) {
  return readPluginConfigFromFiles(name) ?? (await readPluginConfigFromReleaseIt(name));
};

export const newsFragmentsUserConfig = buildConfig(
  await resolveUserConfig("news-fragments"),
);
