import { Row, Col, Breadcrumb, BreadcrumbItem } from "reactstrap";
import { useEffect, useRef, useState } from "react";

import { getSupabase } from "../../../../utils/supabase";

const supabase = getSupabase();
import { useUser } from "@auth0/nextjs-auth0/client";
import LibraryImage from "../../../../components/LibraryImage";
import { useFirebaseListener } from "../../../../utils/useFirebaseListener";

import Head from "next/head";

import IntelliPrint from "../../../../components/IntelliPrint/IntelliPrint";
import IntelliCopyUrl from "../../../../components/IntelliCopyUrl/IntelliCopyUrl";
import Image from "next/image";
export async function getServerSideProps(context) {
  console.log("context.params.folderSlug");
  console.log(context.params.folderSlug);
  const folderId = context.params.folderSlug.split("-")[0];
  if (!folderId) {
    console.log("Error! No folder Id");
    return {};
  }

  let { data: missionsResponse, error } = await supabase
    .from("reportFolders")
    .select(
      `
        reportId,
        folderId,
        folders:folders (
            folderName,
            folderDescription,
            folderPicDescription,
            folderPicUrl
        ),
        reports:reports (
            reportTitle,
            reportPicUrl,
            reportPicDescription,
            reportId,
            reportContent,
            agentId,
            agent:agentId (
                agentId,
                agentName,
                expertise1,
                expertise2,
                expertise3,
                specializedTraining

            )
        )
    `
    )
    .eq("folderId", folderId);

  // Get the list fo users who have liked this folder
  // Get the list fo users who have liked this folder
  let { data: _folderLikes, folderLikesError } = await supabase
    .from("folderLikes")
    .select()
    .eq("folderId", folderId);

  if (!_folderLikes) {
    _folderLikes = [];
  }
  if (folderLikesError) {
    console.error("folderLikesError");
    console.error(folderLikesError);
  }
  // Log the results and errors for debugging
  console.log("missionsResponse1");
  console.log(missionsResponse);
  console.log("folderId");
  console.log(folderId);
  console.error(error);

  console.log("missionsResponse2");
  console.log(missionsResponse);
  if (!missionsResponse || missionsResponse.length === 0) {
    return console.log("No missions found");
  }
  let expertises = [];
  let agentId = 0;
  let specializedTraining = "";
  if (missionsResponse[0].reports.agent) {
    agentId = missionsResponse[0].reports.agent.agentId;

    if (missionsResponse[0].reports.agent.expertise1) {
      expertises.push(missionsResponse[0].reports.agent.expertise1);
    }
    if (missionsResponse[0].reports.agent.expertise2) {
      expertises.push(missionsResponse[0].reports.agent.expertise2);
    }
    if (missionsResponse[0].reports.agent.expertise3) {
      expertises.push(missionsResponse[0].reports.agent.expertise3);
    }

    if (missionsResponse[0].reports.agent.specializedTraining) {
      specializedTraining =
        missionsResponse[0].reports.agent.specializedTraining;
    }
  }
  let { data: linksResponse, error: linksError } = await supabase
    .from("links")
    .select("parentReportId, childReportId");

  if (error || linksError) {
    // handle errors
    console.error(error);
    console.error(linksError);
  }

  const _loadedReports = [];
  let _folderName = "";
  let _folderDescription = "";
  let _folderPicDescription = "";
  let _folderPicUrl = "";

  missionsResponse.forEach((mission) => {
    _loadedReports.push(mission.reports);

    _folderName = mission.folders.folderName;
    _folderDescription = mission.folders.folderDescription;
    _folderPicDescription = mission.folders.folderPicDescription;
    _folderPicUrl = mission.folders.folderPicUrl;
  });

  return {
    props: {
      _loadedReports,
      _folderName,
      folderId,
      _folderDescription,
      _folderPicDescription,
      _folderPicUrl,
      agentId,
      expertises,
      specializedTraining,
      _folderLikes,
    },
  };
}

const ViewReports = ({
  _loadedReports,
  _folderName,
  folderId,
  _folderDescription,
  _folderPicDescription,
  _folderPicUrl,
  agentId,
  _folderLikes,
}) => {
  const { user } = useUser();
  const userId = user ? user.sub : null;
  const [loadedReports, setLoadedReports] = useState(_loadedReports);

  const [isStreaming, setIsStreaming] = useState(false);

  const [folderName, setFolderName] = useState(_folderName);
  const [folderDescription, setFolderDescription] =
    useState(_folderDescription);
  const [folderPicDescription] = useState(_folderPicDescription);
  const [folderPicUrl, setFolderPicUrl] = useState(_folderPicUrl);

  const [hasStartedContinuum, setHasStartedContinuum] = useState(false);
  const firebaseSaveData = useFirebaseListener(
    user
      ? `/${
          process.env.NEXT_PUBLIC_env === "production"
            ? "asyncTasks"
            : "localAsyncTasks"
        }/${
          process.env.NEXT_PUBLIC_SERVER_UID
        }/${userId}/finalizeAndVisualizeReport/context/`
      : null
  );

  const [agent] = useState({});

  const firebaseFolderData = useFirebaseListener(
    user
      ? `/${
          process.env.NEXT_PUBLIC_env === "production"
            ? "asyncTasks"
            : "localAsyncTasks"
        }/${
          process.env.NEXT_PUBLIC_SERVER_UID
        }/${userId}/regenerateFolder/context`
      : null
  );
  const firebaseDraftData = useFirebaseListener(
    user
      ? `/${
          process.env.NEXT_PUBLIC_env === "production"
            ? "asyncTasks"
            : "localAsyncTasks"
        }/${process.env.NEXT_PUBLIC_SERVER_UID}/${userId}/continuum/`
      : null
  );

  const [likes, setLikes] = useState(
    _folderLikes.map((like) => like.likeValue).reduce((a, b) => a + b, 0)
  );

  async function fetchUpdatedReports() {
    console.log("FETCH UPDATED REPORTS");

    let { data: updatedMissionsResponse, error: updatedError } = await supabase
      .from("reportFolders")
      .select(
        `
              folders (folderName, folderDescription, folderPicUrl),
              reports (reportTitle, reportPicUrl, reportPicDescription, reportId, reportContent, reportPicDescription)
          `
      )
      .eq("folderId", folderId);
    console.log("updatedMissionsResponse");
    console.log(updatedMissionsResponse);
    if (updatedError) {
      console.error(updatedError);
      return;
    }

    const updatedMissions = [];
    updatedMissionsResponse.forEach((mission) => {
      updatedMissions.push({ ...mission.reports });
    });

    // Update the state with the newly fetched data
    setLoadedReports(updatedMissions);
    updateReports(updatedMissions); // this one sets links on initial load
  }

  useEffect(() => {
    if (firebaseDraftData) {
      if (firebaseDraftData.context) {
        // setDraft(firebaseDraftData.context.draft);
      }
      if (firebaseDraftData.status == "complete") {
        if (hasStartedContinuum) {
          fetchUpdatedReports();
          setHasStartedContinuum(false);
          setIsStreaming(false);

          setContinuumCompleted(true);
        }
      }
    }
  }, [firebaseDraftData]);

  useEffect(() => {
    if (firebaseFolderData) {
      if (
        firebaseFolderData.folderId &&
        firebaseFolderData.folderId == folderId &&
        firebaseFolderData.folderPicUrl
      ) {
        setFolderName(firebaseFolderData.folderName);
        setFolderDescription(firebaseFolderData.folderDescription);
        setFolderPicUrl(firebaseFolderData.folderPicUrl);
      }
    }
  }, [firebaseFolderData, folderId]);

  useEffect(() => {
    if (firebaseSaveData) {
      console.log("firebase save data");

      if (
        firebaseSaveData.folderId &&
        firebaseSaveData.folderId == folderId &&
        firebaseSaveData.reportPicUrl
      ) {
        fetchUpdatedReports();
        updateReports();
      }
    }
  }, [firebaseSaveData, folderId]);

  async function updateReports(newestReports) {
    console.log("UPDATE REPORTS");
    if (!loadedReports) return;
    let reports = newestReports;
    if (!reports) reports = loadedReports;
    const updatedReports = await Promise.all(
      reports.map(async (report) => {
        const clonedReport = { ...report };
        await getLinks(clonedReport);
        return clonedReport;
      })
    );

    console.log("Setting Loaded Reports");
    setLoadedReports(updatedReports);
  }

  async function getLinks(report) {
    let { data: links, error: linksError } = await supabase
      .from("links")
      .select("*")
      .eq("parentReportId", report.reportId);

    if (linksError) {
      console.log("linksError", linksError);
      return;
    }
    console.log("links");
    console.log(links);
    if (links && links.length > 0) {
      const container = document.createElement("div");
      container.innerHTML = report.reportContent;
      links.forEach((link) => {
        const element = container.querySelector(`[id="${link.elementId}"]`);
        let highlightedText = (() => {
          try {
            return JSON.parse(link.highlightedText);
          } catch {
            return link.highlightedText;
          }
        })();

        if (element) {
          const newLink = `<a href="#${link.childReportId}">${highlightedText}</a>`;

          const updatedHTML = element.innerHTML.replace(
            highlightedText,
            newLink
          );
          element.innerHTML = updatedHTML;
        }
      });

      report.reportContent = container.innerHTML; // Update the reportContent directly
    }
  }

  const [parentChildIdMap, setParentChildIdMap] = useState({});

  useEffect(() => {
    async function fetchChildReports(parentReportId) {
      try {
        const response = await fetch("/api/reports/get-children-of-report", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ parentReportId }),
        });

        if (!response.ok) {
          console.error("Error fetching child reports");
          return [];
        }

        const { childReports } = await response.json();

        return childReports;
      } catch (error) {
        console.error("Error:", error);
        return [];
      }
    }

    async function getParentChildIdMap() {
      const seenReportIds = [];
      let parentChildIdMap = {};
      let resultParentChildMap = {};
      for (const loadedReport of loadedReports) {
        const reportChildren = await fetchChildReports(loadedReport.reportId);
        parentChildIdMap[loadedReport.reportId] = reportChildren;
      }
      const parentReportIds = Object.keys(parentChildIdMap).sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true })
      );

      for (const parentReportId of parentReportIds) {
        console.log("parentReportId");
        const childReports = parentChildIdMap[parentReportId];
        console.log(parentReportId);

        if (!seenReportIds.includes(parentReportId)) {
          seenReportIds.push(parentReportId);
          if (!resultParentChildMap[parentReportId]) {
            resultParentChildMap[parentReportId] = [];
          }
          childReports.forEach((childReport) => {
            console.log("childReport");
            console.log(childReport);
            if (!seenReportIds.includes(childReport.childReportId)) {
              resultParentChildMap[parentReportId].push(
                childReport.childReportId
              );
            }
            seenReportIds.push(childReport.childReportId);
          });
        }
      }
      // {"1300":[{"childReportId":1301}],"1301":[{"childReportId":1302}],"1302":[{"childReportId":1303}],"1303":[{"childReportId":1304}],"1304":[]}

      // Finding the minimum key to set it as a rootKey

      // const data = {
      //   1197: [1198, 1199, 1200],
      //   1198: [1201, 1203],
      //   1199: [1202],
      //   1200: [1286],
      //   1201: [1204],
      //   1202: [],
      //   1203: [],
      //   1204: [],
      //   1286: [],
      // };

      function buildTree(data) {
        const recurse = (key) => {
          console.log("Processing key:", key);

          const childrenData = data[key];
          if (!childrenData) {
            console.error("Key not found in data:", key);
            return { id: null, children: null };
          }

          const children = childrenData.map((childData) => {
            const childKey = childData.childReportId;
            console.log("Child key:", childKey);
            return recurse(String(childKey));
          });

          return {
            id: Number(key),
            children: children.length > 0 ? children : null,
          };
        };

        const rootKey = String(Math.min(...Object.keys(data).map(Number)));
        console.log("Root key:", rootKey);
        return recurse(rootKey);
      }

      const tree = buildTree(parentChildIdMap);
      parentChildIdMap = tree;
      return parentChildIdMap;
    }

    getParentChildIdMap().then((map) => {
      setParentChildIdMap(map);
    });
  }, [loadedReports, isStreaming, hasStartedContinuum]);
  const NestedList = ({ children, loadedReports }) => {
    return (
      <ol>
        {children &&
          children.map((item) => (
            <li style={{ marginBottom: "8px", marginTop: "8px" }} key={item.id}>
              {!item.id && <LibraryImage style={{ marginTop: "20px" }} />}
              {item.id && (
                <a
                  className="linkFont"
                  style={{
                    fontWeight: "500",
                    textDecoration: "none",
                    cursor: "pointer",
                  }}
                  href={`#${item.id}`}
                  onClick={() => console.log(`Navigating to report ${item.id}`)}
                >
                  {loadedReports.find((report) => report.reportId === item.id)
                    ?.reportTitle || `Loading Report ID: ${item.id}`}
                </a>
              )}
              {item.children && (
                <NestedList
                  // children={item.children}
                  loadedReports={loadedReports}
                >
                  {item.children}
                </NestedList>
              )}
            </li>
          ))}
      </ol>
    );
  };

  const [hasLiked, setHasLiked] = useState(false);
  async function handleLike() {
    // Query the folderLikes table to check if the user has already liked or disliked the folder
    const { data: existingLikes, error: likesError } = await supabase
      .from("folderLikes")
      .select("likeValue")
      .eq("folderId", folderId)
      .eq("userId", userId);

    if (likesError) {
      console.error("Error checking existing likes", likesError);
      return; // Exit early if there is an error fetching the likes
    }

    // Calculate the current balance of likes and dislikes for this user and folder
    const likeBalance = existingLikes.reduce(
      (total, record) => total + record.likeValue,
      0
    );
    console.log("likeBalance");
    console.log(likeBalance);
    // Determine the likeValue based on the like balance
    const likeValue = likeBalance >= 0 ? -1 : 1;

    // Prepare the record for the database operation
    const likeRecord = { folderId, userId, likeValue };

    // Insert a new like or dislike record
    const { data, error } = await supabase
      .from("folderLikes")
      .insert([likeRecord]);

    if (error) {
      console.error("Error updating likes", error);
    } else {
      // Update the local state to reflect the new like or dislike
      setLikes((prevLikes) => prevLikes + likeValue);
      // If the balance was zero, the user has now liked/disliked for the first time
      if (likeBalance === 0) {
        setHasLiked(likeValue === 1);
      } else {
        // If the balance was not zero, we simply invert the current hasLiked state
        setHasLiked((prevHasLiked) => !prevHasLiked);
      }
    }
  }

  // Speech
  // Use state to track whether audio is playing
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false); // New state for loading

  // Use ref to persist the audio object without re-rendering the component
  const audioRef = useRef(null);
  const handleReadReportClick = async (index) => {
    // If audio is currently playing, pause it
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // If audio is already loaded and is paused, resume playing
      if (audioRef.current && isLoadingAudio === false) {
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        // Start loading new audio
        setIsLoadingAudio(true);

        // Fetch the new text to read
        const textToRead = document.getElementById(
          `reportRoot${index}`
        ).textContent;

        try {
          const response = await fetch("/api/reports/speech/speak", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: textToRead }),
          });

          if (response.ok) {
            const audioBlob = await response.blob();
            // If there was a previous audio object, revoke the old object URL
            if (audioRef.current) {
              URL.revokeObjectURL(audioRef.current.src);
            }
            // Assign the new audio blob to the audioRef
            audioRef.current = new Audio(URL.createObjectURL(audioBlob));
            audioRef.current.play();
            setIsPlaying(true);
            audioRef.current.onended = () => {
              setIsPlaying(false);
            };
          } else {
            throw new Error("Network response was not ok.");
          }
        } catch (error) {
          console.error("There was a problem with the fetch operation:", error);
        }
        setIsLoadingAudio(false);
      }
    }
  };

  return (
    <>
      {folderPicUrl && (
        <Head>
          <title>{folderName}</title>

          {/* General tags */}
          <meta name="title" content={folderName} />
          <meta name="description" content={folderDescription} />
          <meta name="image" content={folderPicUrl} />

          {/* Open Graph tags */}
          <meta property="og:title" content={folderName} />
          <meta property="og:description" content={folderDescription} />
          <meta property="og:image" content={folderPicUrl} />
          <meta property="og:url" content={folderPicUrl} />

          {/* Twitter Card tags */}
          <meta name="twitter:title" content={folderName} />
          <meta name="twitter:description" content={folderDescription} />
          <meta name="twitter:image" content={folderPicUrl} />
          <meta name="twitter:card" content="summary_large_image" />
        </Head>
      )}
      <div style={{ maxWidth: "90%" }}>
        <Breadcrumb>
          <BreadcrumbItem
            className="text-white reportFont"
            style={{ fontWeight: "800", fontSize: "2em" }}
            active
          >
            {folderName}
          </BreadcrumbItem>
        </Breadcrumb>
        <div className="folder-section report-section">
          {folderPicUrl && (
            <div
              style={{
                height: "700px",
                position: "relative",
                width: "auto",
              }}
              className="image-container"
            >
              <a
                href={folderPicUrl}
                target="_blank"
                rel="noopener noreferrer"
                alt={folderPicDescription}
                title={folderPicDescription}
              >
                <Image src={`${folderPicUrl}`} fill={true} />
              </a>
            </div>
          )}
        </div>

        <div style={{ marginTop: "-30px", marginBottom: "20px" }}>
          <Row>
            <Col style={{ whiteSpace: "nowrap" }}>
              <span
                style={{
                  marginRight: "20px",
                  color: "gold",
                }}
              >
                <i
                  onClick={handleLike}
                  style={{
                    color: `${likes > 0 ? "gold" : "white"}`,
                    cursor: "pointer",
                  }}
                  className={`bi bi-star${
                    likes === 0 ? "bi bi-star" : "bi bi-star-fill"
                  }`}
                />
                {likes == 0 ? "" : ` ${likes}`}
              </span>
              <span style={{ marginRight: "20px" }}>
                <IntelliPrint loadedReports={loadedReports} />
              </span>

              <span style={{ marginRight: "20px" }}>
                <IntelliCopyUrl />
              </span>
            </Col>
          </Row>
        </div>
        <div> {folderDescription}</div>
        <div
          className="reportTitle reportFont section-title"
          style={{ marginTop: "30px", fontSize: "1em" }}
        >
          <Row>
            <Col>Table of Contents</Col>
          </Row>
        </div>
        {!parentChildIdMap.id && <LibraryImage style={{ marginTop: "30px" }} />}
        {parentChildIdMap.id && (
          <ul className="linkFont" style={{ fontSize: "0.85em" }}>
            <li style={{ marginBottom: "8px" }} key={parentChildIdMap.id}>
              <a
                style={{
                  color: "#E7007C",
                  textDecoration: "none",
                  cursor: "pointer",
                  fontWeight: 800,
                  fontSize: "1.2em",
                }}
                href={`#${parentChildIdMap.id}`}
                onClick={() => console.log("Navigating to parent report")}
              >
                {loadedReports.find(
                  (report) => report.reportId === parentChildIdMap.id
                )?.reportTitle || `Report ID: ${parentChildIdMap.id}`}
              </a>
              <NestedList loadedReports={loadedReports}>
                {parentChildIdMap.children}
              </NestedList>
            </li>
          </ul>
        )}

        {loadedReports &&
          loadedReports.map((cols, index) => {
            const report = loadedReports[index];
            const reportId = loadedReports[index].reportId;
            if (
              !loadedReports[index].reportContent.includes(
                `<h2 id="reportTitle">`
              )
            ) {
              return;
            }
            const reportTitle = loadedReports[index].reportContent
              .split(`<h2 id="reportTitle">`)[1]
              .split(`</h2>`)[0];
            const __html = `<div className="report">${
              loadedReports[index].reportContent
                .split(`<h2 id="reportTitle">`)[1]
                .split(`</h2>`)[1]
            }`;

            return (
              <div key={index} id={reportId} className="report-section">
                <div className="title-container">
                  <div className="reportTitle reportFont section-title">
                    {reportTitle}
                  </div>
                  {index !== 0 && (
                    <a href="#top" className="top-button text-white">
                      ⇧
                    </a>
                  )}
                </div>
                <div style={{ height: "700px" }} className="image-container">
                  {!report.reportPicUrl && <LibraryImage />}
                  {report.reportPicUrl && (
                    <a
                      href={report.reportPicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={report.reportPicUrl}
                        alt={report.reportPicDescription}
                        title={report.reportPicDescription}
                        className="report-image"
                        style={{ borderRadius: "10px" }}
                      />
                    </a>
                  )}
                </div>
                {/* Speech */}
                <Row>
                  <Col>
                    <div
                      onClick={() => handleReadReportClick(index)}
                      disabled={isLoadingAudio}
                      style={{
                        fontSize: "1.25em",

                        marginTop: "10px",
                      }}
                    >
                      {isLoadingAudio ? (
                        <i className="bi bi-hourglass-split" />
                      ) : isPlaying ? (
                        <i className="bi bi-pause-btn" />
                      ) : (
                        <i
                          style={{ cursor: "pointer" }}
                          className="bi bi-speaker"
                        />
                      )}
                    </div>
                  </Col>
                </Row>
                <div
                  id={`reportRoot${index}`}
                  className="report text-primary reportFont"
                  dangerouslySetInnerHTML={{ __html }}
                />
              </div>
            );
          })}
      </div>
    </>
  );
};

export default ViewReports;
