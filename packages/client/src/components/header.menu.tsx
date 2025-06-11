import { Tabs, Text } from "@mantine/core";
import { useLocation, useNavigate } from "react-router";

export const HeaderMenu = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const getActiveTab = () => {
    if (pathname === "/" || pathname.startsWith("/projects")) return "projects";
    if (pathname.startsWith("/home")) return "home";
    return "projects";
  };

  return (
    <Tabs variant={"pills"} value={getActiveTab()}>
      <Tabs.List m={5}>
        <Tabs.Tab
          value="projects"
          onClick={() => navigate("/projects")}
          style={{ borderRadius: "10px" }}
        >
          <Text fz={14}>Projects</Text>
        </Tabs.Tab>
      </Tabs.List>
    </Tabs>
  );
};
