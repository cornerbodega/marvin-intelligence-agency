import { Button, Nav, NavItem } from "reactstrap";
import Logo from "../../logo/Logo";

import { useRouter } from "next/router";

const navigation = [
  // {
  //   title: "Missions",
  //   href: "/reports/folders/view-folders",
  //   icon: "bi bi-patch-check",
  // },
  {
    title: "Reports",
    href: "/reports/folders/view-folders",
    icon: "bi bi-body-text",
  },
  {
    title: "Intel-Net",
    href: "/intelnet/folders/view-intelnet",
    icon: "bi bi-globe2",
  },
  {
    title: "Agents",
    href: "/agents/view-agents",
    icon: "bi bi-person-badge",
  },
  // {
  //   title: "Reports",
  //   href: "/reports/folders/view-folders",
  //   icon: "bi bi-body-text",
  // },
  // Make Insights part of Missions UI
  // {
  //   title: "Insights",
  //   href: "/ui/cards",
  //   icon: "bi bi-hdd-stack",
  // },
  // {
  //   title: "Continua",
  //   href: "/ui/badges",
  //   icon: "bi bi-link",
  // },

  // {
  //   title: "Buttons",
  //   href: "/ui/buttons",
  //   icon: "bi bi-hdd-stack",
  // },

  // {
  //   title: "Table",
  //   href: "/ui/tables",
  //   icon: "bi bi-layout-split",
  // },
  // {
  //   title: "Grid",
  //   href: "/ui/grid",
  //   icon: "bi bi-patch-check",
  // },
  // {
  //   title: "Forms",
  //   href: "/ui/forms",
  //   icon: "bi bi-textarea-resize",
  // },
  // {
  //   title: "Breadcrumbs",
  //   href: "/ui/breadcrumbs",
  //   icon: "bi bi-hdd-stack",
  // },
  // {
  //   title: "Welcome",
  //   href: "/",
  //   icon: "bi bi-speedometer2",
  // },
  {
    title: "Support",
    href: "/support",
    icon: "bi bi-patch-question-fill",
  },
];

const Sidebar = ({ showMobilemenu }) => {
  let curl = useRouter();
  const location = curl.pathname;

  return (
    <div className="p-3">
      <div
        style={{
          textAlign: "right",
          marginBottom: "-10px",
          // background: "blue",
        }}
      >
        <a
          close="true"
          size="sm"
          className="ms-auto d-lg-none"
          style={{
            zIndex: 9999,
            color: "white",
            textDecoration: "none",
            cursor: "pointer",
          }}
          // onClick={showMobilemenu}
          onClick={(e) => {
            e.stopPropagation(); // Stop the click from reaching the canvas
            showMobilemenu();
          }}
        >
          ✖
        </a>
      </div>
      <div className="d-flex align-items-center">
        <div style={{ marginTop: "20px" }}>
          <Logo />
        </div>
      </div>

      <div className="pt-4 mt-2">
        <Nav
          vertical
          className="sidebarNav"
          style={{ zIndex: "100", fontStyle: "italic" }}
        >
          {navigation.map((navi, index) => (
            <NavItem key={index} className="sidenav-bg">
              {/* <Link > */}
              {/* {navi.href} */}
              <a
                href={navi.href}
                className={
                  location.includes(navi.href.split("/")[1])
                    ? "sidebarSelected bg-text-underline nav-link py-3"
                    : "nav-link sidebarSelected  py-3"
                }
                style={
                  location.includes(navi.href.split("/")[1])
                    ? { textDecoration: "underline", color: "#E7007C" }
                    : { color: "white" }
                }
              >
                <i className={navi.icon}></i>
                <span className="ms-3 d-inline-block">{navi.title}</span>
              </a>
              {/* </Link> */}
            </NavItem>
          ))}
          {/* <Button
            color="secondary"
            tag="a"
            target="_blank"
            className="mt-3"
            href="https://www.wrappixel.com/templates/xtreme-next-js-free-admin-template/"
          >
            Download Free
          </Button>
          <Button
            color="danger"
            tag="a"
            target="_blank"
            className="mt-3"
            href="https://www.wrappixel.com/templates/xtreme-react-redux-admin/?ref=33"
          >
            Upgrade To Pro
          </Button> */}
        </Nav>
      </div>
    </div>
  );
};

export default Sidebar;
