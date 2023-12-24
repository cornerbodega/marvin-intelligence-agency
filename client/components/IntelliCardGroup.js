import { motion } from "framer-motion";
import IntelliCardGroupRow from "./IntelliCardGroupRow";

const IntelliCardGroup = ({
  datums,
  handleCardClick,
  datumsType,
  offset,
  folderLikesByFolderId,
  reportCountsByFolderId,
}) => {
  const cardsModel = datums;

  const rowsInThrees = cardsModel
    ? cardsModel.reduce((acc, item, index) => {
        if (index % 3 === 0) {
          acc.push([]);
        }
        acc[Math.floor(index / 3)].push(item);
        return acc;
      }, [])
    : [];
  const PAGE_COUNT = 6;
  return (
    <>
      {rowsInThrees.map((cols, index) => {
        const recalculatedDelay =
          index >= PAGE_COUNT * 2
            ? (index - PAGE_COUNT * (offset - 1)) / 15
            : index / 15;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              ease: [0.25, 0.25, 0, 1],
              delay: recalculatedDelay,
            }}
          >
            <div style={{ marginBottom: "16px" }}>
              <IntelliCardGroupRow
                handleCardClick={handleCardClick}
                cols={cols}
                datumsType={datumsType}
                folderLikesByFolderId={folderLikesByFolderId}
                reportCountsByFolderId={reportCountsByFolderId}
              />
            </div>
          </motion.div>
        );
      })}
    </>
  );
};

export default IntelliCardGroup;
