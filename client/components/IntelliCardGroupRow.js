import { CardGroup } from "reactstrap";
import IntelliCard from "./IntelliCard";

const IntelliCardGroupRow = ({
  cols,
  handleCardClick,
  datumsType,
  folderLikesByFolderId,
  reportCountsByFolderId,
}) => {
  const colLenth = cols.length;
  return (
    <CardGroup className="intelliReveal">
      {Array.apply(null, { length: colLenth }).map((e, i) =>
        colLenth > 2 ? (
          <IntelliCard
            imageSize="small"
            handleCardClick={handleCardClick}
            datums={cols[i]}
            key={i}
            index={i}
            folderLikesByFolderId={folderLikesByFolderId}
            reportCountsByFolderId={reportCountsByFolderId}
            datumsType={datumsType}
          ></IntelliCard>
        ) : (
          <IntelliCard
            handleCardClick={handleCardClick}
            imageSize="big"
            folderLikesByFolderId={folderLikesByFolderId}
            reportCountsByFolderId={reportCountsByFolderId}
            datums={cols[i]}
            datumsType={datumsType}
            key={i}
            index={i}
          ></IntelliCard>
        )
      )}
    </CardGroup>
  );
};
export default IntelliCardGroupRow;
