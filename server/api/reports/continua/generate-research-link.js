// @author Marvin-Rhone
import { JSDOM } from "jsdom";

import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  console.log("GENERATE RESEARCH LINK ENDPOINT");
  console.log(req.body);
  const { parentReportContent, existingHyperlinks } = req.body;

  const filteredReportContent = removeHighlightedText(
    parentReportContent,
    existingHyperlinks
  );

  function removeHighlightedText(html, links) {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    if (!links) return document.body.innerHTML;
    links.forEach((link) => {
      const element = document.querySelector(`[id="${link.elementId}"]`);
      if (element) {
        // Removing the quotes from the highlighted text before replacing it
        const unquotedHighlightedText = link.highlightedText.replace(/"/g, "");
        // element.innerHTML = "";
        element.innerHTML = element.innerHTML.replace(
          unquotedHighlightedText,
          ``
        );
      }
    });
    console.log("removeHighlightedText document.body.innerHTML");
    console.log(document.body.innerHTML);
    return document.body.innerHTML;
  }

  let existingLinksList = "";

  if (existingHyperlinks) {
    if (existingHyperlinks.length > 0) {
      existingHyperlinks.forEach((link) => {
        existingLinksList += link.highlightedText + ", ";
      });
    }
  }

  const continuumPrompt = `Please read the following HTML report. Pretend you are highlighting up to one sentence with your cursor that you find most interesting. Write an interesting research question that deep dive into the highlighted text for the purpose of expanding and enhancing the current report. Return a JSON-only response containing JSON with the following format: [{ elementId, highlightedText, researchQuestion }]. `;

  const messages = [
    {
      role: "user",
      content: `${continuumPrompt} ${filteredReportContent}`,
    },
  ];
  const researchLinksResponse = await getFromOpenAi4(messages);
  async function getFromOpenAi4(messages) {
    const results = await openai.chat.completions
      .create({
        model: "gpt-4",
        messages: messages,
      })
      .catch((error) => {
        console.log("get from open ai error");
        console.log(error);
      });

    return results.choices[0].message.content;
  }

  let researchLinks = researchLinksResponse;
  if (typeof researchLinksResponse === "string") {
    researchLinks = (() => {
      try {
        return JSON.parse(researchLinksResponse);
      } catch {
        return researchLinksResponse;
      }
    })();
  }
  const researchLink = {
    ...researchLinks[0],
    briefingInput: researchLinks[0].researchQuestion,
  };

  const responseObj = {
    researchLink,
  };

  return responseObj;
}
