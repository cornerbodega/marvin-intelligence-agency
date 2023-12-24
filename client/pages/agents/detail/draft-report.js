// @author Marvin-Rhone
// dispatch.js is the page where the user can create a mission for an
// agent to complete.
// bring in original report's summary
// bring in agent's memory of previous reports
// bring in content of link from original report

import {
  Card,
  CardBody,
  CardTitle,
  CardSubtitle,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Row,
  Col,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
} from "reactstrap";

import { useUser } from "@auth0/nextjs-auth0/client";
import Link from "next/link";

import { useRouter } from "next/router";

import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";

import { getSupabase } from "../../../utils/supabase";
import { useState, useRef, useEffect } from "react";

import { slugify } from "../../../utils/slugify";

import saveTask from "../../../utils/saveTask";
import { useFirebaseListener } from "../../../utils/useFirebaseListener";
import Head from "next/head";
export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(context) {
    const supabase = getSupabase();
    const session = await getSession(context.req, context.res);
    const user = session?.user;
    const userId = user.sub;
    const { data: agency, agencyError } = await supabase
      .from("users")
      .select("agencyName")
      .eq("userId", user.sub);
    const agencyName = agency[0].agencyName;
    if (agencyError) {
      console.log("agencyError");
    }
    console.log("agency");
    console.log(agency);
    if (!agency || agency.length === 0) {
      return {
        redirect: {
          permanent: false,
          destination: "/agency/create-agency",
        },
        props: {},
      };
    }

    const { agentId, parentReportId } = context.query;
    console.log("parentReportId");
    console.log(parentReportId);

    console.log("agentId");
    console.log(agentId);
    let { data: agents, error } = await supabase
      .from("agents")
      .select(
        "agentId, expertise1, expertise2, expertise3, agentName, profilePicUrl, bio, specializedTraining"
      )
      .eq("agentId", agentId);
    if (error) {
      console.log(error);
    }
    const agent = agents[0];
    const expertiseOutput = [
      agent.expertise1,
      agent.expertise2,
      agent.expertise3,
    ];

    return {
      props: { userId, agent, expertiseOutput, agencyName },
    };
  },
});

const CreateMission = ({
  userId,
  agent,
  agencyName,

  expertiseOutput,
}) => {
  const { user, error, isLoading } = useUser();
  const [briefingSuggestion, setBriefingSuggestion] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parentReportSummary, setParentReportSummary] = useState();
  const [agentMissionHistory, setAgentMissionHistory] = useState();
  const [briefing, setBriefing] = useState();
  const [showSuggestedBriefing, setShowSuggestedBriefing] = useState();
  const [draft, setDraft] = useState();
  const [isStreaming, setIsStreaming] = useState(false);
  const [feedbackInput, setFeedbackInput] = useState("");
  const router = useRouter();
  const draftRef = useRef();
  const [parentReportTitle, setParentReportTitle] = useState("");
  const [parentReportId, setParentReportId] = useState("");
  const [parentReportSlug, setParentReportSlug] = useState("");

  const [notificationIntervalId, setNotificationIntervalId] = useState();
  const [notificationMessages, setNotificationMessages] = useState([]);

  const [writeDraftTaskId, setWriteDraftTaskId] = useState();
  const [isSaving, setIsSaving] = useState(false);

  const firebaseDraftData = useFirebaseListener(
    user
      ? `/${
          process.env.NEXT_PUBLIC_env === "production"
            ? "asyncTasks"
            : "localAsyncTasks"
        }/${process.env.NEXT_PUBLIC_SERVER_UID}/${user.sub}/quickDraft/context`
      : null
  );
  const firebaseFolderIdData = useFirebaseListener(
    user
      ? `/${
          process.env.NEXT_PUBLIC_env === "production"
            ? "asyncTasks"
            : "localAsyncTasks"
        }/${process.env.NEXT_PUBLIC_SERVER_UID}/${
          user.sub
        }/saveLinkedReport/context/folderId`
      : null
  );
  const [hasSavedReport, setHasSavedReport] = useState(false);

  useEffect(() => {
    if (firebaseFolderIdData && hasSavedReport) {
      router.push({
        pathname: `/reports/folders/intel-report/${firebaseFolderIdData}`,
        query: { userId },
      });
    }
  }, [firebaseFolderIdData]);

  useEffect(() => {
    if (!firebaseDraftData) return;
    if (firebaseDraftData.draft) {
      if (firebaseDraftData.expertiseOutput) {
        if (
          JSON.stringify(firebaseDraftData.expertiseOutput) ===
          JSON.stringify(expertiseOutput)
        ) {
          setDraft(firebaseDraftData.draft);
        }
      }
      if (isSubmitting) {
        setIsSubmitting(false);
      }
    }
  }, [firebaseDraftData]);

  useEffect(() => {
    if (router.query.parentReportTitle) {
      setParentReportTitle(JSON.parse(router.query.parentReportTitle));
    }
    if (router.query.parentReportId) {
      setParentReportId(router.query.parentReportId);
    }
    if (router.query.parentReportTitle) {
      setParentReportSlug(slugify(router.query.parentReportTitle));
    }
  });

  const [feedbacks, setFeedbacks] = useState([]);
  async function handleQuickDraft(e) {
    if (e) {
      e.preventDefault();
    }
    setIsSubmitting(true);
    setFeedbackInput("");
    const draftData = {
      briefingInput,
      expertiseOutput,
      feedbacks,
      userId,
    };
    if (feedbackInput) {
      let newFeedbacks = feedbacks;
      newFeedbacks.push({ feedback: feedbackInput, draft });
      setFeedbacks(newFeedbacks);
      draftData.feedbacks = newFeedbacks;
      setFeedbackInput("");
    }
    try {
      const clearQuickDraftTask = {
        type: "quickDraft",
        status: "cleared",
        userId: user.sub,
        context: {},
        createdAt: new Date().toISOString(),
      };
      await saveTask(clearQuickDraftTask);
      const clearSaveReportTask = {
        type: "saveLinkedReport",
        status: "cleared",
        userId: user.sub,
        context: {},
        createdAt: new Date().toISOString(),
      };
      await saveTask(clearSaveReportTask);

      const newTask = {
        type: "quickDraft",
        status: "queued",
        userId: user.sub,
        context: {
          ...draftData,
          userId: user.sub,
          existingExpertise: expertiseOutput,
        },
        createdAt: new Date().toISOString(),
      };
      const newTaskRef = await saveTask(newTask);

      if (newTaskRef) {
        setWriteDraftTaskId(newTaskRef.key); // Store the task ID to set up the listener
      } else {
        console.error("Failed to queue the task.");
      }
    } catch (error) {
      console.error("Error queuing the task:", error.message);
    } finally {
      clearInterval(notificationIntervalId); // Clear the interval properly
      setNotificationMessages([]);
    }
  }
  async function handleAcceptReport(e) {
    e.preventDefault();
    setIsSaving(true);
    setHasSavedReport(true);
    setIsSubmitting(true);

    try {
      const draftData = {
        briefingInput: router.query.briefingInput,
        existingAgentId: agent.agentId,
        draft,
      };
      if (router.query.parentReportId) {
        draftData.parentReportId = router.query.parentReportId;
      }
      if (router.query.highlightedText) {
        draftData.highlightedText = router.query.highlightedText;
      }
      if (router.query.elementId) {
        draftData.elementId = router.query.elementId;
      }

      const saveReportTask = {
        type: "saveLinkedReport",
        status: "queued",
        userId: user.sub,
        context: {
          ...draftData,
          draft,
          agentId: agent.agentId,
          expertises: expertiseOutput,
          userId: user.sub,
        },
        createdAt: new Date().toISOString(),
      };

      const newTaskRef = await saveTask(saveReportTask);

      if (!newTaskRef) {
        console.error("Failed to queue the task.");
      }
    } catch (error) {
      console.error("Error queuing the task:", error.message);
    } finally {
    }
  }

  useEffect(() => {
    async function fetchBriefingSuggestion() {
      // Logic to build expertiseString from agent prop
      const expertises = [agent.expertise1, agent.expertise2, agent.expertise3];
      let expertiseString = expertises[0];

      if (expertises.length > 1) {
        expertiseString += " and " + expertises[1];
      }
      if (expertises.length > 2) {
        expertiseString += " and " + expertises[2];
      }
      console.log("expertiseString");
      console.log(expertiseString);

      const getSuggestionParams = { expertiseString, agentId: agent.agentId };
      if (router.query.parentReportId) {
        const parentReportId = router.query.parentReportId;
        getSuggestionParams.parentReportId = parentReportId;
        getSuggestionParams.highlightedText = router.query.highlightedText;
      }
      // try {
      const briefingResponse = await fetch("/api/reports/get-suggestion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(getSuggestionParams),
      });

      if (briefingResponse.ok) {
        const data = await briefingResponse.json();
        console.log("briefing response data");
        console.log(data);
        if (data.briefingSuggestion) {
          // setBriefingSuggestion(data.briefingSuggestion);
          setBriefingInput(data.briefingSuggestion);
        }

        if (data.parentReportSummary) {
          setParentReportSummary(data.parentReportSummary);
        }
        if (data.agentMissionHistory) {
          setAgentMissionHistory(data.agentMissionHistory);
        }
      } else {
        console.error("Failed to fetch briefing suggestion");
      }
    }
    if (!router.query.briefing) {
      fetchBriefingSuggestion();
    } else {
      setBriefing(router.query.briefing);
      console.log("router.query.briefing");
      console.log(router.query.briefing);
      // handle
    }
  }, [agent]);

  const textareaRef = useRef(null);
  const [briefingInput, setBriefingInput] = useState("");

  useEffect(() => {
    if (textareaRef.current) {
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

  return (
    <div>
      <Head>
        <title>
          Agent {agent.agentName} | {agencyName}
        </title>
      </Head>

      <Breadcrumb
        style={{ fontWeight: "200", fontFamily: "monospace" }}
        className="text-white"
      >
        <BreadcrumbItem>
          <i className={`bi bi-person-badge`}></i>
          &nbsp;
          <Link
            style={{ fontWeight: "200", textDecoration: "none" }}
            className="text-white"
            href="/agents/view-agents"
          >
            Agents
          </Link>
        </BreadcrumbItem>

        <BreadcrumbItem style={{ fontWeight: "800" }} className="">
          Agent {agent.agentName}
        </BreadcrumbItem>
      </Breadcrumb>

      <Row>
        <Col md={{ size: 7, offset: 2 }}>
          <Form onSubmit={handleQuickDraft}>
            <FormGroup>
              <div>
                <div style={{ marginTop: "20px" }}></div>

                <FormGroup>
                  <Row>
                    <Col className="col-8">
                      <Label htmlFor="exampleText" className="text-white">
                        What would you like to know?
                      </Label>
                    </Col>
                    <Col>
                      <div
                        onClick={(e) => {
                          setBriefingInput("");
                        }}
                        style={{
                          paddingTop: "4px",
                          fontSize: "0.75em",
                          display: "flex",
                          justifyContent: "flex-end",
                          cursor: "pointer",
                        }}
                      >
                        <i className="bi bi-x-circle"></i>
                      </div>
                    </Col>
                  </Row>

                  <div className="textareaWrapper">
                    <textarea
                      ref={textareaRef}
                      autoFocus
                      value={briefingInput}
                      onChange={(e) => setBriefingInput(e.target.value)}
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
                        "--cursor-pos": "0px", // Initial value
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "flex-start",
                      paddingTop: "8px",
                    }}
                  >
                    <Button
                      color="primary"
                      style={{ border: "1px solid green", marginRight: "16px" }}
                      disabled={isSubmitting || !briefingInput}
                    >
                      <i className="bi bi-folder"></i>+ Create Report
                    </Button>
                  </div>
                </FormGroup>
              </div>
            </FormGroup>
            <div>
              <Card
                style={{
                  backgroundColor: "black",
                  color: "white",
                  border: "1px solid white",
                  borderRadius: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    borderRadius: "16px",
                    marginBottom: "16px",
                    marginTop: "0px",
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      height: "337px",
                      width: "100%", // Make the width 100% to fill the container
                      position: "relative",
                    }}
                  >
                    <img
                      src={`${agent.profilePicUrl}`}
                      style={{
                        height: "100%",
                        width: "100%",
                        borderTopLeftRadius: "16px",
                        borderTopRightRadius: "16px",
                        objectFit: "cover", // This is key for maintaining aspect ratio
                        objectPosition: "center", // Adjusts the position of the image within its frame
                      }}
                      alt="agent"
                    />
                  </div>
                </div>

                <CardBody>
                  <CardTitle
                    style={{
                      display: "flex",
                      marginTop: "16px",
                      justifyContent: "center",
                      fontWeight: 800,
                      color: "white",
                      fontSize: "1.2rem",
                    }}
                  >
                    Agent {agent.agentName}
                  </CardTitle>
                  <CardSubtitle
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      marginTop: "16px",
                      marginBottom: "16px",
                      justifyContent: "center",
                    }}
                    className="mb-2 text-muted"
                    tag="h6"
                  >
                    <Badge
                      style={{ marginBottom: "5px" }}
                      color="info"
                      className="ms-3 expertiseBadge"
                    >
                      {agent.expertise1}
                    </Badge>
                    <Badge
                      color="info"
                      style={{ marginBottom: "5px" }}
                      className="ms-3 expertiseBadge"
                    >
                      {agent.expertise2}
                    </Badge>
                    <Badge
                      color="info"
                      className="ms-3 expertiseBadge"
                      // style={{ marginTop: "10px" }}
                    >
                      {agent.expertise3}
                    </Badge>
                  </CardSubtitle>
                  <div>
                    <div
                      style={{ marginLeft: "auto", textAlign: "right" }}
                    ></div>
                    <div>
                      <h4>Bio</h4>
                    </div>
                    <div style={{ fontSize: "0.8em" }}>{agent.bio}</div>

                    {agentMissionHistory && (
                      <>
                        <div>
                          <h4>Report History</h4>
                        </div>
                        <ul>
                          {agentMissionHistory.map((mission, index) => {
                            if (mission.reportFolders.length == 0) {
                              return <></>;
                            }
                            return (
                              <li key={index}>
                                {/* {JSON.stringify(mission)} */}
                                <Link
                                  className="reportFont"
                                  style={{
                                    textDecoration: "none",
                                    fontWeight: 300,
                                    color: "#E7007C",
                                    cursor: "pointer",
                                  }}
                                  href={`/reports/folders/intel-report/${mission.reportFolders[0].folderId}`}
                                >
                                  {mission.reportTitle}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </>
                    )}

                    {parentReportSummary && (
                      <>
                        <div>
                          <h4>Parent Report Context</h4>
                        </div>
                        <div>
                          <Link
                            className="reportFont"
                            style={{
                              textDecoration: "none",
                              fontWeight: 300,
                              color: "#E7007C",
                              cursor: "pointer",
                            }}
                            href={`/reports/folders/intel-report/${parentReportId}`}
                          >
                            {parentReportTitle}
                          </Link>
                        </div>
                        <div style={{ fontSize: "0.85em" }}>
                          {parentReportSummary}
                        </div>
                      </>
                    )}
                  </div>
                </CardBody>
              </Card>
            </div>
          </Form>
          <div style={{ marginTop: "50px" }} ref={draftRef}></div>
          {draft && (
            <Card style={{ background: "black", color: "white" }}>
              <CardBody className="report">
                <i className="bi bi-body-text"> New Draft </i>
                <div
                  style={{ color: "white" }}
                  dangerouslySetInnerHTML={{ __html: draft }}
                />
              </CardBody>
            </Card>
          )}
          {draft && !draft.endsWith(" ".repeat(3)) && (
            <div className="scroll-downs">
              <div className="mousey">
                <div className="scroller"></div>
              </div>
            </div>
          )}
          {draft && !isSubmitting && draft.endsWith(" ".repeat(3)) && (
            <>
              <Form onSubmit={(e) => handleQuickDraft(e)}>
                <FormGroup>
                  <div style={{ marginTop: "40px" }}></div>
                  <Label htmlFor="exampleText" className="text-white">
                    Feedback
                  </Label>
                  <Input
                    style={{ backgroundColor: "#131313" }}
                    id="exampleText"
                    placeholder="What do you think?"
                    name="text"
                    rows="5"
                    type="textarea"
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                  />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "flex-end",
                      paddingTop: "8px",
                    }}
                  >
                    <Button
                      color="primary"
                      style={{
                        border: "1px solid yellow",
                        marginRight: "16px",
                      }}
                      disabled={isSubmitting}
                    >
                      <i className="bi bi-arrow-clockwise"></i>
                      &nbsp;Refine
                    </Button>
                  </div>
                </FormGroup>
              </Form>
              <Button
                color="primary"
                style={{ border: "3px solid green", marginTop: "40px" }}
                disabled={isSubmitting || !draft.endsWith(" ".repeat(3))}
                onClick={(e) => handleAcceptReport(e)}
              >
                <i className="bi bi-floppy"></i> Save Report
              </Button>
              {isSaving && isSubmitting && "Savinng Report..."}
            </>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default CreateMission;
