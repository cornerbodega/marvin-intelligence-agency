export default function getExampleReportContent() {
  function generateUniqueID() {
    return Math.random().toString(36).substr(2, 9);
  }

  return `<div id="report">
  <h2 id="reportTitle">
    Natural Language Processing (NLP) in the Modern Digital Landscape
  </h2>

  <h3>Introduction:</h3>
  <p>
    Natural Language Processing, a subfield of AI, focuses on enabling machines
    to understand and interpret human language. Its applications in the digital
    landscape are vast and transformative.
  </p>

  <h3 id="${generateUniqueID()}">Applications:</h3>
  <ul id="${generateUniqueID()}">
    <li>
      <strong id="${generateUniqueID()}">Search Engines:</strong>
      <div id="${generateUniqueID()}">
        Major search engines like Google leverage NLP to provide more accurate
        and context-aware search results.
      </div>
    </li>
    <li>
      <strong id="${generateUniqueID()}">Chatbots and Virtual Assistants:</strong>
      <div id="${generateUniqueID()}">
        Siri, Alexa, and Google Assistant, among others, use NLP to understand
        user queries and provide relevant responses.
      </div>
    </li>
    <li>
      <strong id="${generateUniqueID()}">Sentiment Analysis:</strong>
      <div id="${generateUniqueID()}">
        Businesses analyze customer reviews and feedback using NLP to gain
        insights into consumer sentiments.
      </div>
    </li>
    <li>
      <strong id="${generateUniqueID()}">Content Recommendations:</strong>
      <div id="${generateUniqueID()}">
        Platforms like Netflix and Spotify utilize NLP to analyze user
        preferences and deliver tailored content.
      </div>
    </li>
    <li>
      <strong id="${generateUniqueID()}">Translation Services:</strong>
      <div id="${generateUniqueID()}">
        Real-time translation and transcription services, such as Google
        Translate, use NLP for accurate translations.
      </div>
    </li>
  </ul>

  <h3>Conclusion:</h3>
  <p>
    NLP's applications are vast and integral to many services in the modern
    digital age. Its capabilities have transformed how businesses interact with
    consumers and how users access and interpret information.
  </p>
</div>
`;
}
