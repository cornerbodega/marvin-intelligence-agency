import styles from "./IntelliFab.module.css";
import { useState } from "react";

const IntelliFab = ({ onClick, icon, fabType }) => {
  const [logo, setLogo] = useState("");
  console.log("fabType");
  console.log(fabType);
  if (logo == "") {
    if (fabType === "report") {
      setLogo(`bi bi-link`);
    }
    if (fabType === "folder") {
      setLogo(`bi bi-folder`);
    }
    if (fabType === "agent") {
      setLogo(`bi bi-person-badge`);
    }
  }

  return (
    <button className={styles.fab} onClick={onClick}>
      {logo && <i className={logo}></i>} {icon}
    </button>
  );
};
export default IntelliFab;
