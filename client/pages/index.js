import React from "react";

export async function getServerSideProps(context) {
  return {
    redirect: {
      destination: "/reports/folders/view-folders",
      permanent: false,
    },
  };
}
export default function Home() {
  return <></>;
}
