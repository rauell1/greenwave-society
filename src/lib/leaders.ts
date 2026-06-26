export const EXECUTIVE_LEADERS = [
  {
    name: "Martin Kyalo",
    role: "Chief Executive Officer (CEO)",
    email: "",
  },
  {
    name: "Njeri Njoroge",
    role: "Chief Operating Officer (COO)",
    email: "",
  },
  {
    name: "Eugene Shadrack",
    role: "Chief Innovation Officer (CIO)",
    email: "",
  },
  {
    name: "Mark Katana",
    role: "Chief Strategy and Well-being Officer (CSWO)",
    email: "",
  },
  {
    name: "Roy Okola Otieno",
    role: "Head of Design",
    email: "",
  },
  {
    name: "Roy John",
    role: "Design Assistant",
    email: "",
  },
] as const;

export type LeaderName = (typeof EXECUTIVE_LEADERS)[number]["name"];
