import { Row, Breadcrumb, BreadcrumbItem } from "reactstrap";
import Link from "next/link";
import useRouter from "next/router";
import { useEffect, useRef, useState } from "react";
import { debounce } from "lodash";
import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";
import IntelliCardGroup from "../../components/IntelliCardGroup";

import { getSupabase } from "../../utils/supabase";
const supabase = getSupabase();

import { slugify } from "../../utils/slugify";
import Head from "next/head";
const PAGE_COUNT = 6;
export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(context) {
    const session = await getSession(context.req, context.res);
    const user = session?.user;

    let { data: agency, agencyError } = await supabase
      .from("users")
      .select("agencyName")
      .eq("userId", user.sub);
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

    let { data: agents, error } = await supabase
      .from("agents")
      .select(
        "agentId, expertise1, expertise2, expertise3, agentName, profilePicUrl, bio"
      )
      .eq("userId", user.sub)
      .limit(PAGE_COUNT)
      .order("agentId", { ascending: false });

    // other pages will redirect here if they're empty
    // If no agency, go to create agency page
    // If no agents, go to crete agent page
    // let agency;
    return {
      props: { agents, userId: user.sub, agencyName: agency[0].agencyName },
    };
  },
});
const ViewAgents = ({ agents, userId, agencyName }) => {
  const [isLast, setIsLast] = useState(false);
  const containerRef = useRef(null);
  const [offset, setOffset] = useState(1);
  const [isInView, setIsInView] = useState(false);
  const [loadedAgents, setLoadedAgents] = useState(agents);
  const [parentReportTitle, setParentReportTitle] = useState("");
  const [parentReportId, setParentReportId] = useState("");
  const [parentReportSlug, setParentReportSlug] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const router = useRouter;
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
  useEffect(() => {
    if (!agents || agents.length === 0) {
      goToPage("/reports/folders/view-folders");
    }
  });

  const handleScroll = (container) => {
    if (containerRef.current && typeof window !== "undefined") {
      const container = containerRef.current;
      const { bottom } = container.getBoundingClientRect();
      const { innerHeight } = window;
      setIsInView((prev) => bottom <= innerHeight);
    }
  };

  async function loadPagedResults() {
    console.log("Loading paged results");

    const { data, error } = await supabase
      .from("agents")
      .select("*")
      .eq("userId", userId)
      .filter("agentName", "neq", null)
      .filter("profilePicUrl", "neq", null)
      .limit(PAGE_COUNT)
      .order("agentId", { ascending: false });

    if (error) {
      console.error("Error loading paged results:", error);
      return;
    }

    setLoadedAgents(data);
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
      let { data: filteredAgents, error } = await supabase
        .from("agents")
        .select("*")
        .ilike("bio", `%${searchInput}%`)
        .eq("userId", userId);

      if (error) {
        console.error("Error fetching data:", error);
        return;
      }

      console.log("filteredReports");
      console.log(filteredAgents);
      setLoadedAgents(filteredAgents);
    } catch (error) {
      console.error("An unexpected error occurred:", error);
    }
  }
  const handleCardClick = (agent) => {
    router.push({
      pathname: "/agents/detail/draft-report",
      query: { ...router.query, agentId: agent.agentId },
    });
  };
  function goToPage(name) {
    router.push(name);
  }
  useEffect(() => {
    if (!isLast) {
      const loadMoreAgents = async () => {
        const from = offset * PAGE_COUNT;
        const to = from + PAGE_COUNT - 1;
        setOffset((prev) => prev + 1);

        const { data } = await supabase
          .from("agents")
          .select("*")
          .range(from, to)
          .order("createdAt", { ascending: false });

        return data;
      };

      if (isInView) {
        loadMoreAgents().then((moreAgents) => {
          setLoadedAgents([...loadedAgents, ...moreAgents]);
          if (moreAgents.length < PAGE_COUNT) {
            setIsLast(true);
          }
        });
      }
    }
  }, [isInView, isLast]);

  return (
    <>
      <Head>
        <title>Agents | {agencyName}</title>
      </Head>
      <Breadcrumb style={{ fontWeight: "200", fontFamily: "monospace" }}>
        <BreadcrumbItem className="text-white">
          <i className="bi bi-briefcase" />
          &nbsp;
          <Link
            style={{ color: "white", textDecoration: "none" }}
            href="/reports/folders/view-folders"
          >
            {agencyName}
          </Link>
        </BreadcrumbItem>
        <BreadcrumbItem className="text-white">
          <i className={`bi bi-person-badge`}></i>
          &nbsp;
          <div
            style={{
              fontWeight: "200",
              textDecoration: "none",
              color: "white",
            }}
          >
            Agents
          </div>
        </BreadcrumbItem>
        {parentReportTitle && (
          <BreadcrumbItem className="text-white">
            <Link
              className="text-white"
              style={{ fontWeight: "200", textDecoration: "none" }}
              href={`/missions/report/${parentReportId}-${parentReportSlug}`}
            >
              {parentReportTitle}
            </Link>
          </BreadcrumbItem>
        )}
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
          placeholder="⌕ Search Agents"
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
      <div ref={containerRef}>
        <Row className="text-primary">
          <IntelliCardGroup
            offset={offset}
            handleCardClick={handleCardClick}
            datums={loadedAgents}
            datumsType={"agents"}
          ></IntelliCardGroup>
        </Row>
      </div>
    </>
  );
};

export default ViewAgents;
