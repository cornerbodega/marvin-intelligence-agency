import React, { useState, useEffect } from "react";
// import "./IntelliCopyUrl.module.css";

const IntelliCopyUrl = () => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch (error) {
      console.error("Failed to copy the text: ", error);
    }
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 3000); // Message will disappear after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [copied]);

  return (
    <span className="copy-to-clipboard" style={{ cursor: "pointer" }}>
      <span onClick={copyToClipboard} className={copied ? "copied" : ""}>
        <i className="bi bi-send" />
      </span>
      {copied && (
        <span className="copied-message">
          <i className="bi bi-link" /> Copied to Clipboard
        </span>
      )}
    </span>
  );
};

export default IntelliCopyUrl;
