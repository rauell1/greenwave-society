export interface Activity { title: string; desc: string; date: string; type: string; mediaUrl: string }

export const DEFAULT_ACTIVITIES: Activity[] = [
  {
    title: "Maangani Primary and Secondary Schools",
    desc: "Greenwave's first project, a school-focused conservation and education programme delivering hands-on environmental learning and community support to students in Maangani.",
    date: "6 Jul 2024",
    type: "Education",
    mediaUrl: "/gallery",
  },
  {
    title: "Ngong Hike",
    desc: "A community hike through the Ngong Hills bringing youth together around environmental appreciation, physical wellbeing, and connection to Kenya's natural landscape.",
    date: "6 Jul 2024",
    type: "Community",
    mediaUrl: "/gallery",
  },
  {
    title: "Wellness Picnic",
    desc: "An outdoor gathering focused on team wellbeing, member bonding, and grounding the Greenwave community in shared purpose ahead of the year ahead.",
    date: "Dec 2024",
    type: "Wellness",
    mediaUrl: "/gallery",
  },
  {
    title: "Valentine's Day Picnic",
    desc: "A mental health awareness event and community picnic designed to foster peer connection, open conversation, and emotional support among Greenwave youth members.",
    date: "14 Feb 2025",
    type: "Mental Health",
    mediaUrl: "/gallery",
  },
  {
    title: "Departmental Hang Out",
    desc: "A cross-department team session to strengthen internal collaboration, align on shared goals, and build the relationships that keep Greenwave running effectively.",
    date: "14 Feb 2025",
    type: "Team Building",
    mediaUrl: "/gallery",
  },
  {
    title: "Kangemi Restoration Programme",
    desc: "A hands-on ecosystem restoration initiative in Kangemi, bringing youth volunteers together to rehabilitate green spaces, plant trees, and connect environmental action with community pride.",
    date: "Jul 2025",
    type: "Conservation",
    mediaUrl: "/gallery",
  },
  {
    title: "Mentorship at Kangemi Vocational Centre",
    desc: "A mentorship engagement at Kangemi Vocational Centre equipping young people with career guidance, practical skills, and the confidence to navigate employment and enterprise.",
    date: "May 2025",
    type: "Mentorship",
    mediaUrl: "/gallery",
  },
  {
    title: "Featured Video Story",
    desc: "A short documentary capturing Greenwave's community work in action: the faces, places, and moments behind the mission.",
    date: "2025",
    type: "Media",
    mediaUrl: "https://youtu.be/Bhy13UQbjQw?si=YsJ8C9V0cGA5Z4_X",
  },
];

