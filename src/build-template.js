import fs from "fs";
import Handlebars from "handlebars";
import moment from "moment";

function injectMetadata(compiledTemplate, version) {
  return `
[//]: # (s-${version})

${compiledTemplate}
[//]: # (e-${version})

`;
}

export const renderTemplate = function (changelogTemplate, data, version) {
  const compiledTemplate = Handlebars.compile(changelogTemplate, { noEscape: true });
  return injectMetadata(compiledTemplate(data), version);
};

export const saveChangelogToFile = function (filePath, renderedTemplate) {
  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    // asynchronously create a directory
    fs.writeFileSync(filePath, renderedTemplate);
    return;
  }

  const oldData = fs.readFileSync(filePath);
  const newData = new Buffer.from(renderedTemplate);
  fs.unlinkSync(filePath);
  fs.appendFileSync(filePath, newData + oldData);
};

export const generateTemplateData = function (
  newVersion,
  dateFormat,
  fragments,
) {
  return {
    newVersion,
    bumpDate: moment().format(dateFormat),
    fragments,
  };
};
