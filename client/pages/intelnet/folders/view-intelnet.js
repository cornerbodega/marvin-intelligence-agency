import { Row, Breadcrumb, BreadcrumbItem } from "reactstrap";
import useRouter from "next/router";
import { useEffect, useRef, useState } from "react";
import { debounce } from "lodash";
import { getSession } from "@auth0/nextjs-auth0";
import { getSupabase } from "../../../utils/supabase";
import { slugify } from "../../../utils/slugify";
import IntelliCardGroup from "../../../components/IntelliCardGroup";
const PAGE_COUNT = 6;
const supabase = getSupabase();
export async function getServerSideProps(context) {
  const session = await getSession(context.req, context.res);

  let userId = session?.user.sub;
  if (!userId) {
    userId = "null";
  }
  let { data: agency, agencyError } = await supabase
    .from("users")
    .select("agencyName")
    .eq("userId", userId);
  if (agencyError) {
    console.log("agencyError");
  }
  console.log("agency");
  console.log(agency);
  if (!agency || agency.length === 0) {
    agency = [{ agencyName: "Guest Agency" }];
  }
  let { data: folders, error } = await supabase
    .from("folders")
    .select("*")

    .filter("folderName", "neq", null)
    .filter("folderPicUrl", "neq", null)
    .filter("availability", "eq", "GLOBAL")
    .limit(PAGE_COUNT)
    .order("folderId", { ascending: false });

  // Extract folderIds from the obtained folders data
  const folderIds = folders.map((folder) => folder.folderId);

  let folderLikes = [];

  // Check if there are any folderIds to avoid unnecessary query
  if (folderIds.length > 0) {
    let { data, folderLikesError } = await supabase
      .from("folderLikes")
      .select()
      .in("folderId", folderIds); // Filter folderLikes by folderIds from the first query

    if (!folderLikesError) {
      folderLikes = data;
    } else {
      console.error("Error fetching folder likes:", folderLikesError);
    }
  } else {
    console.log("No folders found for the given criteria");
  }

  const _folderLikesByFolderId = folderLikes.reduce((acc, folderLike) => {
    if (!acc[folderLike.folderId]) {
      acc[folderLike.folderId] = 0;
    }

    acc[folderLike.folderId] += folderLike.likeValue; // Updated to sum the likeValue
    return acc;
  }, {});

  console.log("folderLikesByFolderId");
  console.log(_folderLikesByFolderId);

  // Query the reportFolders table to get the count of reports for each folderId
  let { data: reportCountsData, error: reportCountsError } = await supabase
    .from("folders")
    .select(`folderId, reportFolders(count)`)
    .in("folderId", folderIds);
  console.log("reportCountsData");
  console.log(reportCountsData);

  if (reportCountsError) {
    console.error("Error fetching report counts:", reportCountsError);
  }

  const _reportCountsByFolderId = reportCountsData.reduce((acc, item) => {
    acc[item.folderId] = item.reportFolders[0].count || null;
    return acc;
  }, {});
  return {
    props: {
      folders,
      userId,
      _folderLikesByFolderId,
      _reportCountsByFolderId,
    },
  };
}

const ViewReports = ({
  folders,
  userId,
  _folderLikesByFolderId,
  _reportCountsByFolderId,
}) => {
  const [isLast, setIsLast] = useState(false);
  const containerRef = useRef(null);
  const [offset, setOffset] = useState(1);
  const [isInView, setIsInView] = useState(false);
  const [loadedReports, setLoadedReports] = useState(folders);
  const [searchInput, setSearchInput] = useState("");
  const [reportCountsByFolderId, setReportCountsByFolderId] = useState(
    _reportCountsByFolderId
  );

  async function loadPagedResults() {
    console.log("Loading paged results");

    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .eq("userId", userId)
      .filter("folderName", "neq", null)
      .filter("folderPicUrl", "neq", null)
      .limit(PAGE_COUNT)
      .order("folderId", { ascending: false });

    if (error) {
      console.error("Error loading paged results:", error);
      return;
    }

    setLoadedReports(data);
  }

  async function handleSearch(searchInput) {
    setSearchInput(searchInput);
    console.log("handleSearch");
    console.log(searchInput);

    if (searchInput.trim() === "") {
      loadPagedResults();
      return;
    }

    try {
      let { data: filteredReports, error } = await supabase
        .from("folders")
        .select("*")
        .ilike("folderName", `%${searchInput}%`)
        .filter("folderName", "neq", null)
        .filter("folderPicUrl", "neq", null)
        .filter("availability", "eq", "GLOBAL");

      if (error) {
        console.error("Error fetching data:", error);
        return;
      }

      console.log("filteredReports");
      console.log(filteredReports);
      setLoadedReports(filteredReports);
    } catch (error) {
      console.error("An unexpected error occurred:", error);
    }
  }

  useEffect(() => {
    const handleDebouncedScroll = debounce(
      () => !isLast && handleScroll(),
      200
    );
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleScroll = (container) => {
    if (containerRef.current && typeof window !== "undefined") {
      const container = containerRef.current;
      const { bottom } = container.getBoundingClientRect();
      const { innerHeight } = window;
      setIsInView((prev) => bottom <= innerHeight);
    }
  };

  async function handleFabClick() {
    console.log("ViewReports HandleClick Clicked!");
    goToPage("/reports/folders/view-folders");
  }
  const handleCardClick = (folder) => {
    const folderName = folder.folderName;
    const folderId = folder.folderId;
    const folderSlug = slugify(`${folderId}-${folderName}`);

    goToPage(`/intelnet/folders/intelnet-report/${folderSlug}`);
  };
  const router = useRouter;
  function goToPage(name) {
    router.push(name);
  }
  const [folderLikesByFolderId, setFolderLikesByFolderId] = useState(
    _folderLikesByFolderId
  );
  useEffect(() => {
    if (!isLast && !searchInput) {
      const loadMoreReports = async () => {
        const from = offset * PAGE_COUNT;
        const to = from + PAGE_COUNT - 1;
        setOffset((prev) => prev + 1);
        let { data: folders, error } = await supabase
          .from("folders")
          .select("*")
          // .eq("userId", userId)
          .filter("folderName", "neq", null)
          .filter("folderPicUrl", "neq", null)
          .filter("availability", "eq", "GLOBAL")
          .limit(PAGE_COUNT)
          .range(from, to)
          .order("folderId", { ascending: false });

        // Extract folderIds from the obtained folders data
        const folderIds = folders.map((folder) => folder.folderId);

        let folderLikes = [];

        if (folderIds.length > 0) {
          let { data } = await supabase
            .from("folderLikes")
            .select()
            .in("folderId", folderIds);

          folderLikes = data;
        }

        const newLikesByFolderId = folderLikes.reduce((acc, folderLike) => {
          if (!acc[folderLike.folderId]) {
            acc[folderLike.folderId] = 0;
          }

          acc[folderLike.folderId] += folderLike.likeValue;
          return acc;
        }, {});

        // Update the folderLikesByFolderId state with the new data
        setFolderLikesByFolderId((prev) => ({
          ...prev,
          ...newLikesByFolderId,
        }));

        // Fetch the report counts for the new folders
        let { data: reportCountsData } = await supabase
          .from("folders")
          .select(`folderId, reportFolders(count)`)
          .in("folderId", folderIds);

        const newReportCountsByFolderId = reportCountsData.reduce(
          (acc, item) => {
            acc[item.folderId] = item.reportFolders[0].count || null;
            return acc;
          },
          {}
        );

        // Update the reportCountsByFolderId state
        setReportCountsByFolderId((prev) => ({
          ...prev,
          ...newReportCountsByFolderId,
        }));
        return folders;
      };

      if (isInView && !isLast && !searchInput) {
        loadMoreReports().then((moreReports) => {
          setLoadedReports((prev) =>
            getUniqueFolders([...prev, ...moreReports])
          );
          if (moreReports.length < PAGE_COUNT) {
            setIsLast(true);
          }
        });
      }
    }
  }, [isInView, isLast]);
  function getUniqueFolders(folders) {
    const seenIds = new Set();
    const uniqueFolders = [];

    for (const folder of folders) {
      if (!seenIds.has(folder.folderId)) {
        seenIds.add(folder.folderId);
        uniqueFolders.push(folder);
      }
    }

    return uniqueFolders;
  }

  return (
    <>
      <Breadcrumb style={{ fontFamily: "monospace" }}>
        <BreadcrumbItem className="text-white" active>
          <i className={`bi bi-globe`}></i>&nbsp;Intel-Net
        </BreadcrumbItem>
      </Breadcrumb>

      <div style={{ marginBottom: "40px", width: "100%", display: "flex" }}>
        <input
          type="text"
          style={{
            borderRadius: "8px",
            borderWidth: "0px",
            backgroundColor: "#444",
            color: "white",
            height: "2em",
            flexGrow: 1, // Let it grow to take the available space
            textIndent: "10px",
          }}
          lines="1"
          placeholder="⌕ Search Global Reports"
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
      <div ref={containerRef}>
        <Row className="text-primary">
          <IntelliCardGroup
            offset={offset}
            handleCardClick={handleCardClick}
            datums={loadedReports}
            folderLikesByFolderId={folderLikesByFolderId}
            reportCountsByFolderId={reportCountsByFolderId}
            datumsType={"folders"}
          ></IntelliCardGroup>
        </Row>
      </div>
    </>
  );
};

export default ViewReports;
