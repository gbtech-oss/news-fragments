import { Plugin } from "release-it";

import {
  generateTemplateData,
  renderTemplate,
  saveChangelogToFile,
} from "./build-template.js";
import { newsFragmentsUserConfig } from "./config.js";
import { deleteFragmentsFiles, getFragments } from "./file.js";
import { checkChangelogFile, checkFragmentsFolder } from "./helpers.js";

const PREVIEW_VERSION = "NEXT_RELEASE";

export default class NewsFragments extends Plugin {
  start() {
    checkChangelogFile(newsFragmentsUserConfig.changelogFile);
    checkFragmentsFolder(newsFragmentsUserConfig.fragmentsFolder);
  }
  init() {
    this.start();

    const newsFragments = getFragments(newsFragmentsUserConfig);

    this.fragmentsToBurn = newsFragments.fragmentsToBurn;
    this.fragmentsToDelete = newsFragments.fragmentsToDelete;
  }
  renderReleaseEntry(version) {
    const templateData = generateTemplateData(
      version,
      newsFragmentsUserConfig.changelogDateFormat,
      this.fragmentsToBurn,
    );
    return renderTemplate(
      newsFragmentsUserConfig.changelogTemplate,
      templateData,
      version,
    );
  }
  bump(version) {
    const renderedTemplate = this.renderReleaseEntry(version);
    if (this.config?.isDryRun) {
      this.log?.exec(
        `news-fragments: prepend release to ${newsFragmentsUserConfig.changelogFile} and delete ${this.fragmentsToDelete.length} fragment file(s)`,
        { isDryRun: true },
      );
      return;
    }

    saveChangelogToFile(
      newsFragmentsUserConfig.changelogFile,
      renderedTemplate,
    );
    deleteFragmentsFiles(this.fragmentsToDelete);
  }
  getChangelog() {
    const fragmentsToBurn =
      this.fragmentsToBurn ??
      getFragments(newsFragmentsUserConfig).fragmentsToBurn;

    if (fragmentsToBurn.length === 0) {
      return null;
    }

    if (!this.fragmentsToBurn) {
      this.fragmentsToBurn = fragmentsToBurn;
    }

    return this.renderReleaseEntry(PREVIEW_VERSION);
  }
}
