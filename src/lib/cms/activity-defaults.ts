export interface Activity {
  title: string;
  desc: string;
  date: string;
  type: string;
  mediaUrl: string;
  imageUrl?: string;
  imageAlt?: string;
  location?: string;
  highlight?: string;
}

export const DEFAULT_ACTIVITIES: Activity[] = [
  {
    title: "Empower 360 Cohort I Graduation Ceremony & Community Market",
    desc: "Celebrated the official certification of 26 youth changemakers following intensive systems thinking and community leadership training, paired with our zero single-use plastic artisan market.",
    date: "2026-10-30",
    type: "Flagship",
    location: "Ubunifu Hub, Nairobi",
    highlight: "26 Leaders Certified • 296 Photo Archive",
    mediaUrl: "/events/graduation-cohort-1",
    imageUrl: "https://cdn.greenwavesociety.org/images/events/graduation-cohort-1/web/graduation_cohort_1_001.webp",
    imageAlt: "Empower 360 Cohort I official graduation ceremony and certification on stage",
  },
  {
    title: "World Suicide Prevention Day Youth Baraza",
    desc: "An open, safe-space community baraza addressing youth mental health, emotional wellbeing, and peer crisis intervention, breaking stigma and establishing lasting community care networks.",
    date: "2026-09-10",
    type: "Mental Health",
    location: "Nairobi, Kenya",
    highlight: "Safe-Space Dialogue • Peer Support",
    mediaUrl: "/events/suicide-prevention-2026",
    imageUrl: "/images/g-3.jpg",
    imageAlt: "Youth mental health dialogue and peer support session in Nairobi",
  },
  {
    title: "Kangemi Community Green Spaces & Ecosystem Restoration",
    desc: "Hands-on riverbank and public space rehabilitation bringing youth volunteers together to plant indigenous trees, clear solid waste, and establish community-managed green pockets.",
    date: "2025-07-26",
    type: "Conservation",
    location: "Kangemi, Nairobi",
    highlight: "Ecosystem Restoration • Tree Planting",
    mediaUrl: "/gallery",
    imageUrl: "/images/20250726_183058.jpg",
    imageAlt: "Youth volunteers conducting environmental restoration and tree planting in Kangemi",
  },
  {
    title: "Vocational Mentorship at Kangemi Vocational Centre",
    desc: "Practical career guidance, technical mentorship, and green enterprise coaching connecting young vocational trainees with real-world entrepreneurial pathways and industry leaders.",
    date: "2025-05-15",
    type: "Mentorship",
    location: "Kangemi Vocational Centre",
    highlight: "Enterprise Skills • Youth Mentorship",
    mediaUrl: "/gallery",
    imageUrl: "/images/g-54.jpg",
    imageAlt: "Vocational skills mentorship and career guidance session",
  },
  {
    title: "Valentine's Day Youth Wellness Picnic",
    desc: "An outdoor community picnic combining mental wellness check-ins, mindful reflection, team bonding, and peer support to ground our youth community in empathy and shared purpose.",
    date: "2025-02-14",
    type: "Wellness",
    location: "Nairobi Arboretum",
    highlight: "Mindfulness • Peer Connection",
    mediaUrl: "/gallery",
    imageUrl: "/images/20250215_174908.jpg",
    imageAlt: "Outdoor youth wellness picnic and community reflection circle",
  },
  {
    title: "Annual Community Assembly & Strategic Reflection",
    desc: "Year-end community assembly uniting volunteers, mentors, and partner organisations to review collective impact, celebrate milestones, and chart strategic goals for 2025.",
    date: "2024-12-14",
    type: "Community",
    location: "Nairobi, Kenya",
    highlight: "Collective Impact • Strategic Review",
    mediaUrl: "/gallery",
    imageUrl: "/images/20241214_135952.jpg",
    imageAlt: "Greenwave Society annual community gathering and member engagement",
  },
  {
    title: "Ngong Hills Conservation Trek & Youth Hike",
    desc: "A scenic environmental trek through the Ngong Hills ridge, engaging youth in discussions on biodiversity conservation, watershed protection, and holistic outdoor wellbeing.",
    date: "2024-07-06",
    type: "Conservation",
    location: "Ngong Hills, Kajiado",
    highlight: "Biodiversity Trek • Nature Stewardship",
    mediaUrl: "/gallery",
    imageUrl: "/images/20240706135832_IMG_2321.JPG",
    imageAlt: "Youth changemakers hiking the Ngong Hills ridge for conservation appreciation",
  },
  {
    title: "Maangani Primary & Secondary Schools Environmental Outreach",
    desc: "Greenwave's inaugural education initiative: delivering interactive climate literacy, planting school fruit trees, and establishing student-led green clubs in Maangani.",
    date: "2024-07-06",
    type: "Education",
    location: "Maangani, Machakos",
    highlight: "Inaugural Project • School Green Clubs",
    mediaUrl: "/gallery",
    imageUrl: "/images/20241214_180212.jpg",
    imageAlt: "School outreach and hands-on environmental education with students",
  },
  {
    title: "Voices of the Greenwave: Documented Impact Story",
    desc: "A short documentary film capturing authentic community stories: the faces, grassroots initiatives, and transformative momentum of Greenwave Society across Kenya.",
    date: "2024-06-01",
    type: "Media",
    location: "Kenya",
    highlight: "Short Documentary • Grassroots Voices",
    mediaUrl: "https://youtu.be/Bhy13UQbjQw?si=YsJ8C9V0cGA5Z4_X",
    imageUrl: "/images/IMG_9411.jpg",
    imageAlt: "Documentary production highlighting Greenwave Society community transformation",
  },
];
