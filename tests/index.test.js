import { readFileSync } from "fs";
import fs from "fs";
import { patchFs } from "fs-monkey";
import { Volume } from "memfs";
import moment from "moment";
import { vi } from "vitest";

import { newsFragmentsUserConfig } from "../src/config";
import Plugin from "../src/index";

const pjson = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url)),
);

let newsFragments;

beforeEach(() => {
  const vol = Volume.fromNestedJSON({
    fragments: {
      ".gitkeep": "",
      "collect-me.feature": "Coleta com sucesso",
    },
    "CHANGELOG.md": "",
  });
  patchFs(vol);
  newsFragments = new Plugin();
});

test("should collect a fragment when running init method", () => {
  newsFragments.init();
  expect(newsFragments.fragmentsToBurn).toStrictEqual([
    { title: "Features", fragmentEntries: ["Coleta com sucesso"] },
  ]);
  expect(newsFragments.fragmentsToDelete).toStrictEqual([
    "fragments/collect-me.feature",
  ]);
});

test("should delete fragments when generated changelog", () => {
  const version = pjson.version;
  const date = moment().format("YYYY-MM-DD");
  const expectedOutput = `
[//]: # (s-${version})

# [${version}] - (${date})

## Features
* Coleta com sucesso

[//]: # (e-${version})

`;
  newsFragments.init();
  newsFragments.bump(version);

  expect(fs.readdirSync(newsFragmentsUserConfig.fragmentsFolder)).toStrictEqual(
    [".gitkeep"],
  );
  expect(
    fs.readFileSync(newsFragmentsUserConfig.changelogFile).toString(),
  ).toStrictEqual(expectedOutput);
});

test("should not mutate changelog or fragments when release-it dry-run is active", () => {
  const version = pjson.version;
  const changelogBefore = fs.readFileSync(
    newsFragmentsUserConfig.changelogFile,
  ).toString();
  const fragmentsBefore = fs.readdirSync(
    newsFragmentsUserConfig.fragmentsFolder,
  );

  newsFragments.config = { isDryRun: true };
  newsFragments.log = { exec: vi.fn() };

  newsFragments.init();
  newsFragments.bump(version);

  expect(
    fs.readdirSync(newsFragmentsUserConfig.fragmentsFolder),
  ).toStrictEqual(fragmentsBefore);
  expect(
    fs.readFileSync(newsFragmentsUserConfig.changelogFile).toString(),
  ).toStrictEqual(changelogBefore);
  expect(newsFragments.log.exec).toHaveBeenCalledWith(
    expect.stringContaining(newsFragmentsUserConfig.changelogFile),
    { isDryRun: true },
  );
});

test("should return null from getChangelog when there are no pending fragments", () => {
  const vol = Volume.fromNestedJSON({
    fragments: { ".gitkeep": "" },
    "CHANGELOG.md": "",
  });
  patchFs(vol);
  const plugin = new Plugin();
  plugin.init();
  expect(plugin.getChangelog()).toBeNull();
});

test("should return rendered changelog from getChangelog when fragments exist", () => {
  const date = moment().format("YYYY-MM-DD");
  newsFragments.init();

  const changelog = newsFragments.getChangelog();

  expect(changelog).toContain("[//]: # (s-NEXT_RELEASE)");
  expect(changelog).toContain(`# [NEXT_RELEASE] - (${date})`);
  expect(changelog).toContain("## Features");
  expect(changelog).toContain("* Coleta com sucesso");
  expect(changelog).toContain("[//]: # (e-NEXT_RELEASE)");
});

test("should return changelog from getChangelog without calling init first", () => {
  const changelog = newsFragments.getChangelog();

  expect(changelog).toContain("Coleta com sucesso");
});
