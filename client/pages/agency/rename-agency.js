import { Button, Row, Col, Form, FormGroup, Label, Input } from "reactstrap";

import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";
import Auth0LoginButtons from "../../components/Auth0LoginButtons";
import { getSupabase } from "../../utils/supabase";
import { useState } from "react";
export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(context) {
    const supabase = getSupabase();
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

    const _agencyName = agency[0].agencyName;
    return { props: { user, _agencyName } };
  },
});

const ViewReports = ({ user, _agencyName }) => {
  const [agencyName, setAgencyName] = useState(_agencyName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  async function handleSubmit(e) {
    setIsSubmitting(true);
    const res = await fetch("/api/agency/update-agency-endpoint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ agencyName, user }),
    });
    setIsSubmitting(false);

    if (res.status === 200) {
      setAgencyName(agencyName);
    } else {
      console.log(JSON.stringify(res));
      alert("An error occurred while updating the agency. Please try again.");
    }
  }
  return (
    <>
      <Row>
        <div style={{ marginBottom: "40px" }}>
          <Auth0LoginButtons></Auth0LoginButtons>
        </div>
        <Col md={{ size: 8, offset: 0 }}>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>
                <i className="bi bi-briefcase" /> Intelligence Agency Name
              </Label>
              <Input
                autoFocus
                type="text"
                name="expertise1"
                id="expertise1"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                placeholder="Enter Agency Name"
              />
              <div className="text-right mt-4">
                <Button
                  style={{ marginTop: "-20px", fontSize: "0.65em" }}
                  color="primary"
                  disabled={isSubmitting}
                >
                  Update
                </Button>
              </div>
            </FormGroup>
          </Form>
        </Col>
      </Row>
    </>
  );
};

export default ViewReports;
