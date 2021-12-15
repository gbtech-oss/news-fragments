import {
  renderTemplate,
  generateTemplateData,
  saveChangelogToFile,
} from "../src/build-template";
import { buildConfig } from "../src/config";

import fs from "fs-extra";
import mockFs from "mock-fs";
import moment from "moment";

let changelogTemplate;
let changelogFile;

const TODAY = moment().format("YYYY-MM-DD");

const mockData = {
  newVersion: "0.0.2",
  bumpDate: TODAY,
  fragments: [
    {
      title: "Feature",
      fragmentEntries: ["Implements JWT handler", "Add x-request-id to logger"],
    },
    {
      title: "Bugfix",
      fragmentEntries: [
        "Update auth function to work properly when JWT is null",
      ],
    },
  ],
};

const expectedOutput = `
[//]: # (s-0.0.2)
  
# [0.0.2] - (${TODAY})

## Feature
* Implements JWT handler
* Add x-request-id to logger

## Bugfix
* Update auth function to work properly when JWT is null

[//]: # (e-0.0.2)

`;

beforeEach(() => {
  var config = buildConfig({});
  changelogTemplate = config.changelogTemplate;
  changelogFile = config.changelogFile;
});

afterEach(() => {
  mockFs.restore();
});

test("should render correctly the template", () => {
  const result = renderTemplate(changelogTemplate, mockData, "0.0.2");
  expect(result).toStrictEqual(expectedOutput);
});

test("should write in an empty file", () => {
  mockFs({
    "CHANGELOG.md": "",
  });
  const renderedTemplate = renderTemplate(changelogTemplate, mockData, "0.0.2");
  saveChangelogToFile(changelogFile, renderedTemplate);
  expect(fs.readFileSync(changelogFile).toString()).toStrictEqual(`
[//]: # (s-0.0.2)
  
# [0.0.2] - (${TODAY})

## Feature
* Implements JWT handler
* Add x-request-id to logger

## Bugfix
* Update auth function to work properly when JWT is null

[//]: # (e-0.0.2)

`);
});

test("should prepend in a file with content", () => {
  mockFs({
    "CHANGELOG.md": "matheuszin_reidelas2011@hotmail.com",
  });
  const renderedTemplate = renderTemplate(changelogTemplate, mockData, "0.0.2");
  saveChangelogToFile(changelogFile, renderedTemplate);
  const data = fs.readFileSync(changelogFile);
  expect(data.toString()).toStrictEqual(`
[//]: # (s-0.0.2)
  
# [0.0.2] - (${TODAY})

## Feature
* Implements JWT handler
* Add x-request-id to logger

## Bugfix
* Update auth function to work properly when JWT is null

[//]: # (e-0.0.2)

matheuszin_reidelas2011@hotmail.com`);
});

test("should generate the data to use in template", () => {
  const fakeFragments = [
    {
      title: "Feature",
      fragmentEntries: ["Implements JWT handler", "Add x-request-id to logger"],
    },
    {
      title: "Bugfix",
      fragmentEntries: [
        "Update auth function to work properly when JWT is null",
      ],
    },
  ];
  expect(
    generateTemplateData("0.0.2", "YYYY-MM-DD", fakeFragments)
  ).toStrictEqual(mockData);
});
