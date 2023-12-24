import Image from "next/image";
import { Badge, Card, CardBody, CardSubtitle } from "reactstrap";
const IntelliCard = ({
  imageSize,
  datums,
  datumsType,
  handleCardClick,
  index,
  folderLikesByFolderId,
  reportCountsByFolderId,
}) => {
  const imageStyle = {
    borderTop: "2px solid #31A0D1",
    borderLeft: "2px solid #31A0D1",
    borderRight: "2px solid #31A0D1",
  };
  // if (index === 0) {
  imageStyle.borderTopLeftRadius = "16px";
  // }
  // if (index === 2) {
  imageStyle.borderTopRightRadius = "16px";

  let icon;
  let likes;
  let reportCount;
  const displayDatums = { ...datums };
  if (datumsType === "agents") {
    displayDatums.title = `Agent ${datums.agentName}`;
    displayDatums.picUrl = datums.profilePicUrl;
    icon = "bi bi-person-badge";
  }
  if (datumsType === "missions") {
    displayDatums.picUrl = datums.reportPicUrl;
    displayDatums.title = datums.reportTitle;
    icon = "bi bi-body-text";
  }
  if (datumsType === "folders") {
    displayDatums.picUrl = datums.folderPicUrl;
    displayDatums.title = datums.folderName;
    icon = "bi bi-folder";
    if (folderLikesByFolderId) {
      likes = folderLikesByFolderId[datums.folderId];
    }
    if (reportCountsByFolderId) {
      reportCount = reportCountsByFolderId[datums.folderId];
    }
  }
  if (imageSize === "small") {
    imageStyle.objectFit = "cover";
    displayDatums.picUrl = displayDatums.picUrl;
  }

  function handleClick() {
    handleCardClick(datums);
  }

  return (
    <>
      <Card
        onClick={handleClick}
        style={{ background: "black", cursor: "pointer" }}
        className="cardShadow text-white"
      >
        <div style={{ position: "relative", width: "100%" }}>
          {displayDatums.picUrl && (
            <img
              src={
                imageSize === "small"
                  ? displayDatums.picUrl.replace("medium", "small")
                  : displayDatums.picUrl
              }
              style={{ width: "100%", height: "auto", ...imageStyle }}
              layout="responsive"
              alt={displayDatums.title}
            />
          )}
        </div>

        <CardBody
          style={{
            display: "flex",
            backgroundColor: "black",
            borderBottomLeftRadius: "16px",
            borderBottomRightRadius: "16px",
            flexDirection: "column",
            justifyContent: "space-between",
            marginBottom: "30px",
            padding: "10px 20px 10px 20px",
            borderBottom: "2px solid #31A0D1",
            borderLeft: "2px solid #31A0D1",
            borderRight: "2px solid #31A0D1",
            boxShadow: `
            0 8px 0 -2px black, 
            0 8px 0 0 ${reportCount > 1 ? "#31A0D1" : "black"},
            0 16px 0 -2px black, 
            0 16px 0 0 ${reportCount > 2 ? "#31A0D1" : "black"},
            0 24px 0 -2px black, 
            0 24px 0 0 ${reportCount > 3 ? "#31A0D1" : "black"}
        `,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start", // Align items to the top
              marginBottom: "0px",
            }}
          >
            <div
              style={{
                fontWeight: "800",
                color: "white",
                fontSize: "1em",
                minHeight: "70px",
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
                overflow: "hidden",

                textOverflow: "ellipsis",
                whiteSpace: "normal",
              }}
              className="reportFont"
            >
              {icon && <i className={icon}></i>} {displayDatums.title}{" "}
              {reportCount && (
                <span style={{ whiteSpace: "nowrap" }}>
                  [{reportCount} <i className="bi bi-link" />]
                </span>
              )}
            </div>
          </div>
          {datums["expertise1"] && (
            <CardSubtitle
              style={{ marginTop: "8px" }}
              className="mb-2 text-muted"
              tag="h6"
            >
              {["expertise1", "expertise2", "expertise3"].map(
                (expertise, i) => (
                  <Badge key={i} className="expertiseBadge">
                    {datums[expertise]}
                  </Badge>
                )
              )}
            </CardSubtitle>
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              fontSize: "1rem",
            }}
          >
            {likes > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  color: "gold",
                }}
                // className="section-title"
              >
                {likes > 1 && <span>{likes}&nbsp;</span>}
                <i className="bi bi-star-fill" />
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </>
  );
};

export default IntelliCard;
