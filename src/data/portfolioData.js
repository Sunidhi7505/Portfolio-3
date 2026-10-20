/**
 * Central content file — edit text, links, projects, skills and achievements HERE.
 * No UI component contains hard-coded personal content.
 *
 * Sources:
 *  - Resume PDF (Google Drive)      → primary source of truth
 *  - GitHub profile + repo READMEs  → project enrichment
 *  - Owner-provided highlights      → DSA counts, leadership roles, NPTEL score (added Oct 2026)
 *  - LinkedIn                       → blocks automated access; nothing was taken from it
 *
 * Anything that could not be verified is omitted rather than invented.
 * Fields named `tech`/`logo` refer to keys in src/utils/icons.js.
 */

const RESUME_FILE_ID = '1N0QRHPtnh7McFYR2KakXqByrp0sNPd2l'

export const profile = {
  name: 'Sunidhi Goyal',
  firstName: 'Sunidhi',
  monogram: 'SG',
  headline: 'I build secure, full-stack web applications with Java and Spring Boot.',
  roles: ['Software Developer', 'Java & Spring Boot Developer', 'Full-Stack Developer', 'DSA Problem Solver'],
  intro:
    'Computer Science graduate from Chandigarh University. I recently completed an SDE internship at Intellect Design Arena, where I built a visitor management system with QR check-in and role-based access control.',
  // Shown as the hero status pill — only verified facts.
  status: 'Completed SDE Internship · Intellect Design Arena',
  location: 'Agra, Uttar Pradesh, India',
  tagline: 'Java · Spring Boot · REST APIs · Full-stack projects',
  // Background-removed crop of public/profile.png. Set to null to fall back to the illustrated placeholder.
  photo: '/profile-hero.webp',
  photoAlt: 'Portrait of Sunidhi Goyal',
}

export const links = {
  linkedin: 'https://www.linkedin.com/in/sunidhi-goyal-444835251/',
  github: 'https://github.com/Sunidhi7505',
  githubRepos: 'https://github.com/Sunidhi7505?tab=repositories',
  leetcode: 'https://leetcode.com/u/Sunidhi_24/',
  email: 'sunidhigoyal7505@gmail.com', // publicly listed on the resume
  resumeView: `https://drive.google.com/file/d/${RESUME_FILE_ID}/view`,
  // Direct-download form of the same Drive file. Falls back to the viewer if Drive refuses.
  resumeDownload: `https://drive.google.com/uc?export=download&id=${RESUME_FILE_ID}`,
}

/** Navigation. `ids` are the section ids that should highlight the item. */
export const navItems = [
  { label: 'Home', href: '#home', ids: ['home'] },
  { label: 'About', href: '#about', ids: ['about'] },
  { label: 'Skills', href: '#skills', ids: ['skills'] },
  { label: 'Experience', href: '#experience', ids: ['experience'] },
  { label: 'Projects', href: '#projects', ids: ['projects'] },
  { label: 'Education', href: '#education', ids: ['education', 'certifications'] },
  { label: 'Achievements', href: '#achievements', ids: ['achievements'] },
  { label: 'Contact', href: '#contact', ids: ['contact'] },
]

export const about = {
  summary: [
    'I’m a Computer Science graduate (B.E., Chandigarh University, 2022–2026) who enjoys the backend side of full-stack work: designing REST APIs, securing them with Spring Security and JWT, and modelling data cleanly with OOP and SQL.',
    'In summer 2026 I completed a two-month SDE internship at Intellect Design Arena in Chennai. I trained across Java, OOP, DSA, SQL, Spring Boot and security fundamentals, then built a Smart Visitor Management System with QR-code check-in, invite-link pre-registration and role-based access control.',
    'On my own time I build end-to-end projects such as Foody, a food delivery platform with 20+ REST endpoints, Razorpay payments and live delivery tracking, and I practise data structures and algorithms in C++ — 500+ problems solved across platforms.',
  ],
  interests: [
    { title: 'Backend & REST APIs', text: 'Layered Spring Boot services with clear request/response contracts.' },
    { title: 'Application security', text: 'JWT authentication, Spring Security and role-based access control.' },
    { title: 'Data structures & algorithms', text: 'Regular problem solving in C++ and Java on LeetCode and Codolio.' },
    { title: 'Full-stack delivery', text: 'Taking features from database to UI — and deploying them.' },
  ],
  philosophy:
    'I like code that is easy to reason about: OOP-driven layering, explicit permissions, and AI-assisted development used as a tool — not a shortcut — on real projects.',
  highlights: [
    { value: 8.13, decimals: 2, label: 'CGPA · B.E. Computer Science' },
    { value: 20, suffix: '+', label: 'REST APIs in Foody' },
    { value: 500, suffix: '+', label: 'DSA problems solved' },
    { value: 3, suffix: '+', label: 'User roles with RBAC (internship)' },
  ],
}

export const experience = [
  {
    id: 'intellect',
    company: 'Intellect Design Arena',
    role: 'Associate Consultant — SDE Internship',
    type: 'Internship',
    period: 'June 2026 – August 2026',
    location: 'Chennai, Tamil Nadu',
    summary:
      'Two-month software development internship combining structured training with building a production-style application.',
    points: [
      'Strengthened core software development skills through hands-on training across 6+ areas — Java, OOP, DSA, SQL, Spring Boot and security fundamentals — applying AI-assisted development practices to real projects.',
      'Developed a Smart Visitor Management System using Java, Spring Boot and MySQL, supporting 2 visitor categories (regular and occasional) with end-to-end check-in workflows, including QR-code-based check-in and pre-registration via invite links.',
      'Designed and implemented Role-Based Access Control (RBAC) across 3+ user roles (e.g. admin, security staff, visitor), applying Spring Security and OOP principles to enforce permission-based access across the system.',
    ],
    tech: ['java', 'springboot', 'mysql', 'springsecurity'],
  },
]

/**
 * Only categories with verified skills are rendered.
 * `note` is shown on hover; keep it factual. `source` marks skills not on the resume.
 * No proficiency percentages are shown because none are documented.
 */
export const skillCategories = [
  {
    id: 'languages',
    label: 'Languages',
    icon: 'Code2',
    skills: [
      { name: 'Java', logo: 'java', note: 'Backend services, OOP design and DSA practice.' },
      { name: 'C++', logo: 'cpp', note: 'Primary language for DSA problem solving.' },
      { name: 'SQL', logo: 'sql', note: 'Relational queries; MySQL practice on LeetCode.' },
      { name: 'JavaScript', logo: 'javascript', note: 'Used in SortVision and Foody front ends.' },
    ],
  },
  {
    id: 'backend',
    label: 'Backend',
    icon: 'Server',
    skills: [
      { name: 'Spring Boot', logo: 'springboot', note: 'Foody API, Student Management backend and the internship visitor system.' },
      { name: 'REST APIs', logo: 'rest', note: '20+ endpoints designed for Foody.' },
      { name: 'Spring Security', logo: 'springsecurity', note: 'Role-based access control across 3+ roles.' },
      { name: 'JWT', logo: 'jwt', note: 'Token-based authentication in Foody.' },
      { name: 'Hibernate', logo: 'hibernate', note: 'ORM layer for relational persistence.' },
      { name: 'Spring Data JPA', logo: 'spring', note: 'Repository layer for the Student Management backend.' },
    ],
  },
  {
    id: 'frontend',
    label: 'Frontend',
    icon: 'Layout',
    skills: [
      { name: 'HTML', logo: 'html5', note: 'Semantic markup for all web projects.' },
      { name: 'CSS', logo: 'css3', note: 'Responsive layouts for Foody and SortVision.' },
      { name: 'JavaScript', logo: 'javascript', note: 'DOM, async code and interactive visualisation.' },
    ],
  },
  {
    id: 'databases',
    label: 'Databases',
    icon: 'Database',
    skills: [
      { name: 'MySQL', logo: 'mysql', note: 'Relational storage for the visitor management system.' },
      { name: 'MongoDB', logo: 'mongodb', note: 'Document storage listed for Foody.' },
    ],
  },
  {
    id: 'tools',
    label: 'Tools & APIs',
    icon: 'Wrench',
    skills: [
      { name: 'Git', logo: 'git', note: 'Version control.' },
      { name: 'GitHub', logo: 'github', note: 'Source hosting for every project.' },
      { name: 'Maven', logo: 'maven', note: 'Build tool for Java projects.' },
      { name: 'Postman', logo: 'postman', note: 'API testing.' },
      { name: 'IntelliJ IDEA', logo: 'intellij', note: 'Primary Java IDE.' },
      { name: 'VS Code', logo: 'vscode', note: 'Front-end and general editing.' },
      { name: 'Leaflet.js', logo: 'leaflet', note: 'Live delivery map in Foody.' },
      { name: 'Razorpay', logo: 'razorpay', note: 'Payment integration in Foody (test mode per README).' },
    ],
  },
  {
    id: 'cs',
    label: 'Core CS',
    icon: 'Cpu',
    skills: [
      { name: 'Data Structures & Algorithms', logo: 'dsa', note: '500+ problems solved across platforms.' },
      { name: 'OOP', logo: 'oop', note: 'Layered design used throughout the Java projects.' },
      { name: 'DBMS', logo: 'dbms', note: 'University coursework.' },
      { name: 'Operating Systems', logo: 'os', note: 'University coursework.' },
      { name: 'Computer Networks', logo: 'networks', note: 'University coursework.' },
    ],
  },
]


/**
 * Project carousel. `art` picks the placeholder thumbnail (see components/ProjectThumb.jsx).
 * Set `image: '/projects/<file>.png'` on any project to show a real screenshot instead.
 * Links are only shown when they exist.
 */
export const projects = [
  {
    id: 'foody',
    title: 'Foody — Food Delivery Platform',
    description:
      'Full-stack food delivery app with 20+ REST APIs, JWT-secured customer/admin roles, Razorpay payments and live delivery tracking.',
    period: 'Nov 2025 – Jan 2026',
    art: 'food',
    image: null,
    tech: ['springboot', 'springsecurity', 'jwt', 'mongodb', 'javascript', 'leaflet', 'razorpay'],
    github: 'https://github.com/Sunidhi7505/Food-Delivery-Website-Updated-Version',
    live: 'https://food-store-management.vercel.app/register.html',
  },
  {
    id: 'sortvision',
    title: 'SortVision — Algorithm Visualizer',
    description:
      'Animated visualizer for 6 sorting algorithms with arrays up to 50 elements, time-complexity display and audio cues.',
    period: 'Jun 2024 – Jul 2024',
    art: 'sort',
    image: null,
    tech: ['html5', 'css3', 'javascript', 'dsa'],
    github: 'https://github.com/Sunidhi7505/SortingVisualizer',
    live: 'https://sortiing-visualizer-tg8d.vercel.app/',
  },
  {
    id: 'visitor-management',
    title: 'Smart Visitor Management System',
    description:
      'Internship project at Intellect Design Arena: QR-code check-in and invite-link pre-registration for 2 visitor types, with RBAC across 3+ roles.',
    period: 'Jun 2026 – Aug 2026',
    art: 'visitor',
    image: null,
    tech: ['java', 'springboot', 'springsecurity', 'mysql'],
    github: null,
    live: null,
    note: 'Built during internship — source not public',
  },
  {
    id: 'student-management',
    title: 'Student Management Backend',
    description:
      'Spring Boot REST API for student records with DTOs, request validation, global exception handling and MySQL via Spring Data JPA.',
    art: 'api',
    image: null,
    tech: ['springboot', 'spring', 'mysql', 'postman', 'java'],
    github: 'https://github.com/Sunidhi7505/StudentManagementApplication',
    live: null,
  },
  {
    id: 'news',
    title: 'News Website',
    description:
      'Live headlines fetched from an external news API with async/await and rendered in a responsive layout.',
    art: 'news',
    image: null,
    tech: ['html5', 'css3', 'javascript'],
    github: 'https://github.com/Sunidhi7505/NewsWebsite',
    live: null,
  },
  {
    id: 'headphone',
    title: 'Headphone Landing Page',
    description:
      'Responsive front-end headphone store page with product listings and add-to-cart.',
    art: 'headphone',
    image: null,
    tech: ['html5', 'css3', 'javascript'],
    github: 'https://github.com/Sunidhi7505/HeadphoneEcommerse',
    live: null,
  },
  {
    id: 'netflix',
    title: 'Netflix Frontend Clone',
    description:
      'Responsive front-end recreation of the Netflix landing page.',
    art: 'netflix',
    image: null,
    tech: ['html5', 'css3'],
    github: 'https://github.com/Sunidhi7505/NetflixFrontendClone',
    live: null,
  },
]

export const education = [
  {
    id: 'cu',
    degree: 'Bachelor of Engineering — Computer Science',
    institution: 'Chandigarh University',
    location: 'Mohali, Punjab',
    period: '2022 – 2026',
    score: '8.13 CGPA',
    highlights: ['Coursework: Data Structures & Algorithms, OOP, DBMS, Operating Systems, Computer Networks'],
  },
  {
    id: 'class12',
    degree: 'Class XII — C.B.S.E.',
    institution: 'Sachdeva Millennium School',
    location: 'Agra, Uttar Pradesh',
    period: '2020 – 2021',
    score: '75.4%',
    highlights: [],
  },
  {
    id: 'class10',
    degree: 'Class X — C.B.S.E.',
    institution: 'J.R.M. International School',
    location: 'Agra, Uttar Pradesh',
    period: '2018 – 2019',
    score: '70.83%',
    highlights: [],
  },
]

// Credential IDs are not publicly documented, so none are shown.
export const certifications = [
  {
    id: 'nptel-elite-silver',
    name: 'Foundation of Cloud, IoT, Edge and ML',
    issuer: 'NPTEL · IIT Kanpur',
    badge: 'Elite Silver · 78%',
    year: '2025',
    mark: 'NP',
    url: 'https://drive.google.com/file/d/1zjsia2WGM_yX0gTdl4bB1TeQJyjKL-Tt/view?usp=sharing',
  },
  {
    id: 'coursera-java-fs',
    name: 'Java Full Stack Development',
    issuer: 'Coursera',
    badge: 'Course certificate',
    year: '2025',
    mark: 'C',
    url: 'https://drive.google.com/file/d/1SyOte3gDGCI1ecWQ_vf1fjvPcVWDcdVk/view?usp=sharing',
  },
]

/**
 * Achievements & highlights. `icon` is a lucide icon name resolved in components/Achievements.jsx.
 * The LeetCode figures are owner-provided ("350+"); the easy/medium/hard split is the Codolio
 * snapshot (19 Oct 2026) across platforms, labelled as such in the UI.
 */
export const achievements = {
  leetcode: {
    solved: '350+',
    title: 'LeetCode problems solved',
    text: 'Practised in C++, Java and MySQL.',
    difficulty: { easy: 310, medium: 242, hard: 16 },
    difficultyNote: 'Across platforms · Codolio snapshot, 19 Oct 2026',
    // Public LeetCode stats card (heatmap + easy/medium/hard), the same kind GitHub profiles embed.
    // Remove this line to hide it; the card hides itself automatically if it cannot load.
    cardUrl: 'https://leetcard.jacoblin.cool/Sunidhi_24?theme=light&font=Inter&ext=heatmap',
    profileUrl: links.leetcode,
  },
  items: [
    { icon: 'Binary', title: '500+ DSA problems solved', text: 'Across platforms, practised mainly in C++ and Java.' },
    { icon: 'Layers', title: 'Real-world full-stack applications', text: 'Built and deployed end-to-end web apps, from database to UI.' },
    { icon: 'Briefcase', title: 'Prior internship experience', text: 'SDE internship at Intellect Design Arena, Jun – Aug 2026.' },
    { icon: 'Trophy', title: 'Flipkart Grid 7.0 · National Semi-Finalist', text: 'Reached the national semi-finals.', url: 'https://drive.google.com/file/d/1l7TqYEDjkV-L9tEobSnfZ7AsWftzknHc/view?usp=sharing' },
    { icon: 'Award', title: 'NPTEL Elite Silver · 78%', text: 'Foundation of Cloud, IoT, Edge and ML (IIT Kanpur).' },
    { icon: 'GraduationCap', title: '8.13 CGPA · Academic excellence', text: 'B.E. Computer Science, Chandigarh University.' },
    { icon: 'ShieldCheck', title: 'Discipline In-charge', text: 'Served as the school’s Discipline In-charge in Class XI.' },
    { icon: 'Users', title: 'Class Representative', text: 'Served as class representative in 8th semester, Jan – Apr 2026.' },
  ],
}

export const socials = [
  { id: 'linkedin', label: 'LinkedIn', logo: 'linkedin', url: links.linkedin },
  { id: 'github', label: 'GitHub', logo: 'github', url: links.github },
  { id: 'leetcode', label: 'LeetCode', logo: 'leetcode', url: links.leetcode },
]

export const contact = {
  heading: 'Let’s Connect',
  text: 'Open to internships and entry-level software roles. The quickest way to reach me is email or LinkedIn.',
}

export const footer = {
  tagline: 'Secure, well-structured software — one clean API at a time.',
}
