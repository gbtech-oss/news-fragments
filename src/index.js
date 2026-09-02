import { Plugin } from "release-it";

import {
  generateTemplateData,
  renderTemplate,
  saveChangelogToFile,
} from "./build-template.js";
import { buildConfig } from "./config.js";
import { deleteFragmentsFiles, getFragments } from "./file.js";
import { checkChangelogFile, checkFragmentsFolder } from "./helpers.js";

const PREVIEW_VERSION = "NEXT_RELEASE";

export default class NewsFragments extends Plugin {
  constructor(params) {
    super(params);
    if (this.config?.setContext) {
      this.config.setContext({
        git: { ...this.config.getContext("git"), changelog: false },
      });
    }
  }
  getUserConfig() {
    return buildConfig(this.options ?? {});
  }
  start() {
    const userConfig = this.getUserConfig();
    checkChangelogFile(userConfig.changelogFile);
    checkFragmentsFolder(userConfig.fragmentsFolder);
  }
  init() {
    this.start();

    const newsFragments = getFragments(this.getUserConfig());

    this.fragmentsToBurn = newsFragments.fragmentsToBurn;
    this.fragmentsToDelete = newsFragments.fragmentsToDelete;
  }
  renderReleaseEntry(version) {
    const userConfig = this.getUserConfig();
    const templateData = generateTemplateData(
      version,
      userConfig.changelogDateFormat,
      this.fragmentsToBurn,
    );
    return renderTemplate(
      userConfig.changelogTemplate,
      templateData,
      version,
    );
  }
  bump(version) {
    const userConfig = this.getUserConfig();
    const renderedTemplate = this.renderReleaseEntry(version);
    if (this.config?.isDryRun) {
      this.log?.exec(
        `news-fragments: prepend release to ${userConfig.changelogFile} and delete ${this.fragmentsToDelete.length} fragment file(s)`,
        { isDryRun: true },
      );
      return;
    }

    saveChangelogToFile(userConfig.changelogFile, renderedTemplate);
    deleteFragmentsFiles(this.fragmentsToDelete);
  }
  getChangelog() {
    const userConfig = this.getUserConfig();
    const fragmentsToBurn =
      this.fragmentsToBurn ?? getFragments(userConfig).fragmentsToBurn;

    if (fragmentsToBurn.length === 0) {
      return null;
    }

    if (!this.fragmentsToBurn) {
      this.fragmentsToBurn = fragmentsToBurn;
    }

    return this.renderReleaseEntry(PREVIEW_VERSION);
  }
}
