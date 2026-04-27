<p align="center">
   <img src="./changelog.png" alt="Logo" title="Logo" />
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/news-fragments?activeTab=versions"><img src="https://img.shields.io/npm/v/news-fragments?label=version&color=blue" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/news-fragments?activeTab=versions"><img src="https://img.shields.io/npm/dw/news-fragments?color=green" alt="weekly downloads" /></a>
  <a href="https://www.npmjs.com/package/news-fragments?activeTab=versions"><img src="https://img.shields.io/npm/l/news-fragments" alt="license" /></a>
</p>

News Fragments is a plugin for [release-it](https://github.com/release-it/release-it) that generates a changelog from small "fragment" files. During development, contributors add one fragment file per change; at release time the fragments are compiled into a versioned changelog entry and then deleted automatically.

## Requirements

- Node v22+
- npm v10+

## Installation

```bash
npm install news-fragments
```

## Setup

Add `news-fragments` as a plugin inside your [release-it](https://github.com/release-it/release-it) configuration in `package.json`:

```json
{
  "release-it": {
    "plugins": {
      "news-fragments": {}
    }
  }
}
```

Pass any [config options](#config-params) directly in this object to override the defaults.

---

## Release Workflow

Follow these steps every time you need to publish a new version.

### 1. Create fragment files during development

For each change you want to appear in the changelog, run:

```bash
news-fragments create <fragment-type> "<description>"
```

**Available fragment types** (default): `feature`, `bugfix`, `doc`, `removal`, `misc`.

Examples:

```bash
news-fragments create feature "Add dark mode support"
news-fragments create bugfix "Fix race condition on login"
news-fragments create misc "Update dependencies"
```

Each command creates a timestamped file inside the `fragments/` folder (e.g., `fragments/1714220400000.feature`). Commit these files together with the code changes they describe.

### 2. Preview the next changelog entry

Before releasing, verify what the generated changelog will look like:

```bash
news-fragments preview
```

To preview an already-released version stored in `CHANGELOG.md`:

```bash
news-fragments preview -p <version>
# e.g. news-fragments preview -p 1.2.3
```

### 3. Run the release

```bash
npm run release
```

This command triggers `release-it`, which will:

1. Run the test suite (`npm test`) as a pre-release check.
2. Prompt you to select the next version (patch / minor / major).
3. Burn the pending fragments into `CHANGELOG.md` under the new version header and delete the fragment files.
4. Bump the version in `package.json`.
5. Commit, tag, and push the release.

> The burn step runs automatically via the `news-fragments` plugin — you do **not** need to run `news-fragments burn` manually when using `release-it`.

### Manual burn (without release-it)

If you need to compile fragments into the changelog outside of `release-it`, use:

```bash
news-fragments burn <version>
# e.g. news-fragments burn 2.0.0
```

This writes the changelog entry for `<version>` and removes all consumed fragment files.

---

## Config

### Default config

```json
{
  "changelogFile": "CHANGELOG.md",
  "changelogDateFormat": "YYYY-MM-DD",
  "changelogTemplate": "<built-in handlebars template>",
  "fragmentsFolder": "fragments",
  "fragmentsTypes": [
    { "title": "Features",                  "extension": "feature" },
    { "title": "Bugfixes",                  "extension": "bugfix"  },
    { "title": "Documentation",             "extension": "doc"     },
    { "title": "Deprecations and Removals", "extension": "removal" },
    { "title": "Misc",                      "extension": "misc"    }
  ]
}
```

### Default changelog template

```handlebars
# [{{newVersion}}] - ({{bumpDate}})
{{#fragments}}
## {{title}}
{{#each fragmentEntries}}
* {{this}}
{{/each}}
{{/fragments}}
```

### Config params

| Key | Description |
|-----|-------------|
| `changelogFile` | Path to the changelog file. |
| `changelogDateFormat` | [Moment.js](https://momentjs.com/docs/#/displaying/format/) date format used in the changelog header. |
| `changelogTemplate` | A [Handlebars](https://handlebarsjs.com/) template string for each version block. |
| `fragmentsFolder` | Path to the folder where fragment files are stored. |
| `fragmentsTypes` | Array of `{ title, extension }` objects that define the supported fragment types and their changelog section headings. |

> See this plugin in action by checking our [CHANGELOG.md](./CHANGELOG.md)

---

## CLI Reference

```bash
news-fragments --help
```

| Command | Description |
|---------|-------------|
| `news-fragments create <type> "<text>"` | Create a new fragment file of the given type. |
| `news-fragments preview` | Print the next changelog entry to the terminal. |
| `news-fragments preview -p <version>` | Print a previously released changelog entry. |
| `news-fragments burn <version>` | Compile fragments into the changelog and delete them. |

---

## Contributing

```bash
# Install dependencies
npm install

# Run tests (includes lint)
npm test
```
