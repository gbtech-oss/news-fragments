import chalk from "chalk";
import MarkdownIt from "markdown-it";

const styles = {
  firstHeading: chalk.magenta.underline.bold,
  heading: chalk.green.bold,
};

const md = new MarkdownIt();

const renderInlineToken = (token, env) => {
  let content = token.content;

  if (env.headingLevel) {
    const prefix = `${"#".repeat(env.headingLevel)} `;
    content = prefix + content;
    const style =
      env.headingLevel === 1 ? styles.firstHeading : styles.heading;

    return style(content);
  }

  return content;
};

const renderTokens = (tokens, env) => {
  let result = "";

  for (const token of tokens) {
    switch (token.type) {
      case "heading_open":
        env.headingLevel = Number(token.tag.slice(1));
        break;
      case "heading_close":
        env.headingLevel = 0;
        result += "\n";
        break;
      case "inline":
        result += renderInlineToken(token, env);
        break;
      case "list_item_open":
        result += "- ";
        break;
      case "list_item_close":
        result += "\n";
        break;
      case "bullet_list_close":
        result += "\n";
        break;
      case "paragraph_open":
      case "paragraph_close":
      case "bullet_list_open":
      case "ordered_list_open":
      case "ordered_list_close":
        break;
      default:
        break;
    }
  }

  return result;
};

export const renderMarkdownForTerminal = (source) => {
  if (!source) {
    return "";
  }

  return renderTokens(md.parse(source, {}), { headingLevel: 0 });
};
