import React from "react";
import "./IntelliPrint.module.css"; // Import the CSS file

const IntelliPrint = ({ loadedReports }) => {
  const handlePrintClick = () => {
    const printableContent = getPrintableContent();
    const printWindow = window.open("", "", "width=800,height=800");
    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>Printable Content</title>
          <link rel="stylesheet" type="text/css" href="printStyles.css">
        </head>
        <body onload="window.print();">
          ${printableContent}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getPrintableContent = () => {
    return loadedReports
      .map((report, index) => {
        const reportTitle = report.reportContent
          .split(`<h2 id="reportTitle">`)[1]
          .split(`</h2>`)[0];
        const reportContent = report.reportContent
          .split(`<h2 id="reportTitle">`)[1]
          .split(`</h2>`)[1];

        return `
        <div className="intelli-report">
          <h1>${reportTitle}</h1>
          <img style="height: 16%;" src="${report.reportPicUrl}" alt="${report.reportPicDescription}" className="intelli-report-image">
          <div className="intelli-report-content">${reportContent}</div>
        </div>
      `;
      })
      .join("");
  };

  return (
    <span>
      {/* <button className="print-button"> */}
      <i
        onClick={handlePrintClick}
        //   onClick={handleGlobeClick}
        className="bi bi-printer"
        style={{
          color: "white",
          cursor: "pointer",
        }}
      />
      {/* </button> */}
      {/* Your existing content rendering logic here */}
    </span>
  );
};

export default IntelliPrint;
