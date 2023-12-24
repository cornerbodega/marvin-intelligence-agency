import { Button, Row, Breadcrumb, BreadcrumbItem, Col } from "reactstrap";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { debounce } from "lodash";

import { v4 as uuidv4 } from "uuid"; // UUID library

import { getSession } from "@auth0/nextjs-auth0";

import { getSupabase } from "../../../utils/supabase";

// rest of component
import { slugify } from "../../../utils/slugify";
import IntelliCardGroup from "../../../components/IntelliCardGroup";
import Link from "next/link";

import Head from "next/head";
import { saveToSupabase } from "../../../utils/saveToSupabase";
const PAGE_COUNT = 6;
const supabase = getSupabase();

export async function getServerSideProps(context) {
  const session = await getSession(context.req, context.res);
  const userId = session?.user.sub;
  if (userId) {
    let { data: agency, agencyError } = await supabase
      .from("users")
      .select("agencyName")
      .eq("userId", userId);
    if (agencyError) {
      console.log("agencyError");
    }

    if (!agency || agency.length === 0) {
      return {
        redirect: {
          permanent: false,
          destination: "/agency/create-agency",
        },
        props: {},
      };
    }

    let { data: folders, error } = await supabase
      .from("folders")
      .select("*")
      .eq("userId", userId)
      .filter("folderName", "neq", null)
      .filter("folderPicUrl", "neq", null)
      .or(`availability.neq.DELETED,availability.is.null`)
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

    console.log("_folderLikesByFolderId");
    console.log(_folderLikesByFolderId);

    // Query the reportFolders table to get the count of reports for each folderId
    let { data: reportCountsData, error: reportCountsError } = await supabase
      .from("folders")
      .select(`folderId, reportFolders(count)`)
      .in("folderId", folderIds);

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
        _userId: userId,
        _agencyName: agency[0].agencyName,
        _folderLikesByFolderId,
        _reportCountsByFolderId,
      },
    };
  } else {
    return {
      props: {
        folders: [],
        _userId: null,
        _agencyName: null,
        _folderLikesByFolderId: null,
        _reportCountsByFolderId: null,
      },
    };
  }
}
const ViewReports = ({
  folders,
  _userId,
  _agencyName,
  _folderLikesByFolderId,
  _reportCountsByFolderId,
}) => {
  const [isLast, setIsLast] = useState(false);
  const containerRef = useRef(null);
  const [offset, setOffset] = useState(2);
  const [isInView, setIsInView] = useState(false);
  const [loadedReports, setLoadedReports] = useState(folders);
  const [briefingInput, setBriefingInput] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [userId, setUserId] = useState(_userId);
  const [agencyName, setAgencyName] = useState(_agencyName);
  console.log("loadedReports");
  console.log(loadedReports);
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
        .eq("userId", userId);

      if (error) {
        console.error("Error fetching data:", error);
        return;
      }

      setLoadedReports(filteredReports);
    } catch (error) {
      console.error("An unexpected error occurred:", error);
    }
  }
  const [triedToLoadReports, setTriedToLoadReports] = useState(false);
  // Fetch or Create User ID to allow for guest access
  useEffect(() => {
    const userId = fetchOrCreateUserId(_userId);

    if (userId && loadedReports.length === 0 && !triedToLoadReports) {
      loadPagedResults();
    }
    setTriedToLoadReports(true);
  }, []);

  async function fetchOrCreateUserId(authUserId) {
    let guestUserId = authUserId || localStorage.getItem("guestUserId");
    let guestAgencyName = agencyName || localStorage.getItem("guestAgencyName");

    // set;
    if (!guestAgencyName) {
      const agencyName = await fetchFunnyAgencyName(guestUserId);
      localStorage.setItem("guestAgencyName", agencyName);
      guestAgencyName = agencyName;
    }
    setAgencyName(guestAgencyName);
    if (!guestUserId) {
      guestUserId = uuidv4();
      localStorage.setItem("guestUserId", guestUserId);
    }
    setUserId(guestUserId);

    return guestUserId;
  }

  const fetchFunnyAgencyName = async (guestUserId) => {
    if (_agencyName) {
      return _agencyName;
    }
    try {
      const response = await fetch("/api/agency/generate-guest-agency-name");
      if (response.ok) {
        const { agencyName } = await response.json();
        setAgencyName(`Guest ${agencyName}`);
        return agencyName;
      }
    } catch (error) {
      console.error("Error fetching funny agency name:", error);
    }
  };

  const [didClickQuickDraft, setDidClickQuickDraft] = useState(false);
  async function handleQuickDraftClick() {
    if (didClickQuickDraft) {
      return;
    }

    setDidClickQuickDraft(true);

    const createUserModel = {
      userId,
      agencyName,
    };
    const savedUser = await saveToSupabase("users", createUserModel).catch(
      (error) => {
        console.log(error);
      }
    );

    const draftData = { briefingInput };
    const newTask = {
      type: "quickDraft",
      status: "queued",
      userId,
      context: {
        ...draftData,
        userId,
        reportLength,
      },
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch("/api/tasks/save-task", {
        method: "POST", // Specify the request method
        headers: {
          "Content-Type": "application/json", // Content type header to tell the server the nature of the request body
        },
        body: JSON.stringify(newTask), // Convert the JavaScript object to a JSON string
      });

      if (response.ok) {
        router.push({
          pathname: "/reports/create-report/quick-draft",
          query: { ...router.query, briefingInput, userId },
        });
      } else {
        console.error("Failed to save the task");
      }
    } catch (error) {
      console.error("An error occurred while saving the task:", error);
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
  const router = useRouter();

  const handleCardClick = (folder) => {
    console.log(folder);
    const folderName = folder.folderName;
    const folderId = folder.folderId;

    console.log("ViewReports HandleCardClick Clicked!");

    const folderSlug = slugify(`${folderId}-${folderName}`);

    router.push({
      pathname: `/reports/folders/intel-report/${folderSlug}`,
      query: { userId },
    });
  };

  const [folderLikesByFolderId, setFolderLikesByFolderId] = useState(
    _folderLikesByFolderId
  );
  const [reportCountsByFolderId, setReportCountsByFolderId] = useState(
    _reportCountsByFolderId
  );
  useEffect(() => {
    if (!isLast && !searchInput && userId) {
      const loadMoreReports = async () => {
        const from = offset * PAGE_COUNT;
        const to = from + PAGE_COUNT - 1;
        setOffset((prev) => prev + 1);

        let { data: folders } = await supabase
          .from("folders")
          .select("*")
          .range(from, to)
          .or(`availability.neq.DELETED,availability.is.null`)
          .eq("userId", userId)
          .order("createdAt", { ascending: false });

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
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      // textareaRef.current.parentElement.style.setProperty(
      //   "--cursor-pos-x",
      //   "6px"
      // );
      const textWidth = getTextWidth(
        briefingInput,
        window.getComputedStyle(textareaRef.current).fontSize
      );
      const paddingLeft = parseFloat(
        window.getComputedStyle(textareaRef.current).paddingLeft
      );
      const paddingRight = parseFloat(
        window.getComputedStyle(textareaRef.current).paddingRight
      );

      const lineHeight = parseFloat(
        window.getComputedStyle(textareaRef.current).lineHeight
      );

      const textareaContentWidth =
        textareaRef.current.offsetWidth - paddingLeft - paddingRight;

      const lines = Math.ceil(textWidth / textareaContentWidth);
      const lastLineWidth = textWidth % textareaContentWidth || textWidth;

      const cursorLeft = lastLineWidth + paddingLeft;
      const cursorTop = (lines - 1) * lineHeight;

      textareaRef.current.parentElement.style.setProperty(
        "--cursor-pos-x",
        `${cursorLeft}px`
      );
      if (lines > 1) {
        textareaRef.current.parentElement.style.setProperty(
          "--cursor-pos-x",
          `${cursorLeft + lines * 5}px`
        );
      }

      if (briefingInput.length === 0) {
        console.log("briefingInput.length === 0");
        // textareaRef.current.parentElement.style.setProperty("top", "14px");
        textareaRef.current.parentElement.style.setProperty(
          "--cursor-pos-y",
          `${cursorTop + 45}px`
        );
        textareaRef.current.parentElement.style.setProperty(
          "caret-color",
          "transparent"
        );
        textareaRef.current.parentElement.classList.remove("no-background");
      } else {
        textareaRef.current.parentElement.style.setProperty(
          "caret-color",
          "limegreen"
        );
        textareaRef.current.parentElement.classList.add("no-background");
      }
    }
  }, [briefingInput, textareaRef]);

  function getTextWidth(text, fontSize) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = fontSize + " Arial";
    return context.measureText(text).width;
  }

  useEffect(() => {
    if (textareaRef && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const [reportLength, setReportLength] = useState("short");
  function handleSelectedLength(length) {
    console.log("handleselected length");
    console.log(length);
    setReportLength(length);
  }

  return (
    <>
      <Head>
        <title>Reports | {agencyName}</title>
      </Head>

      <Breadcrumb style={{ fontFamily: "monospace" }}>
        <BreadcrumbItem className="text-white">
          <i className="bi bi-briefcase" />
          &nbsp;
          <Link
            href="/agency/rename-agency"
            style={{ color: "white", textDecoration: "none" }}
          >
            {agencyName}
          </Link>
        </BreadcrumbItem>
        <BreadcrumbItem className="text-white" active>
          Create Report
        </BreadcrumbItem>
      </Breadcrumb>
      <div id="quickDraftBriefingInput">
        <div className="textareaWrapper">
          <textarea
            ref={textareaRef}
            autoFocus
            value={briefingInput}
            onChange={(e) => setBriefingInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleQuickDraftClick();
              }
            }}
            placeholder="What would you like to know?"
            style={{
              padding: "12px 12px 13px 13px",
              borderWidth: "0px",
              width: "100%",
              height: "180px",
              color: "white",
              borderRadius: "8px",
              border: "1px solid white",
              backgroundColor: "#000",
              "--cursor-pos": "0px",
            }}
          />
        </div>
        <Row>
          <Col>
            <div>
              <div style={{ marginBottom: "10px" }}>
                <Button
                  onClick={handleQuickDraftClick}
                  style={{
                    textAlign: "left",
                    borderColor: "#31A0D1",
                    borderWidth: "4px",
                    alignContent: "right",
                    marginTop: "0px",
                    marginRight: "8px",
                    cursor: "pointer",
                    width: "108",
                  }}
                  disabled={briefingInput.length === 0 || didClickQuickDraft}
                  className="btn btn-primary "
                >
                  <i className="bi bi-body-text"></i> Create Report
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </div>
      {loadedReports.length > 0 && (
        <>
          <div style={{ marginBottom: "20px", width: "100%", display: "flex" }}>
            <input
              type="text"
              style={{
                borderRadius: "8px",
                borderWidth: "0px",
                backgroundColor: "#000",
                color: "white",
                border: "1px solid grey",
                height: "2em",
                flexGrow: 1, // Let it grow to take the available space
                textIndent: "10px",
              }}
              lines="1"
              placeholder="⌕ Search existing reports"
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
      )}
    </>
  );
};

export default ViewReports;
