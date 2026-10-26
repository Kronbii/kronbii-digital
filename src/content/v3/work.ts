/**
 * The plain-language layer over the authority records, for /v3. Every line
 * restates a fact the record already holds (its summary, answer, measurements,
 * or sources) in words a non-engineer can skim; nothing here adds a claim. The
 * technical record stays one click away on each project page.
 */

import {
  getProject,
  readyProjects,
  type ProjectRecord,
} from '@/content/authority'

export type Field =
  | 'machines'
  | 'vision'
  | 'health'
  | 'civic'
  | 'open'
  | 'tools'

export const fields: { id: Field; label: string }[] = [
  { id: 'machines', label: 'Robots & drones' },
  { id: 'vision', label: 'Vision & AI' },
  { id: 'health', label: 'Health' },
  { id: 'civic', label: 'Civic & public' },
  { id: 'open', label: 'Open source' },
  { id: 'tools', label: 'Apps & tools' },
]

export interface PlainWork {
  /** What kind of thing it is, in two or three words. */
  kind: string
  /** One sentence: what it does, for anyone. */
  line: string
  /** The single most checkable fact about it. */
  proof: string
  /** Rami's part, short, with collaborators named. */
  part: string
  field: Field
  /** A real image from the record for cards; diagram-only work has none. */
  image?: { src: string; alt: string; position?: string }
}

export const plain: Record<string, PlainWork> = {
  'landmine-detection-extraction-robot': {
    kind: 'Robotics · demining',
    line: 'A mine-detection rover with a 6-DoF extraction arm, for a Lebanese Army initiative; I built its autonomy software.',
    proof: 'Field-tested with dummy mines, with the Lebanese Armed Forces',
    part: 'Software lead: 3D LiDAR SLAM, Nav2, detection, the arm',
    field: 'machines',
  },
  'runway-inspection-uav': {
    kind: 'Drones · vision',
    line: 'A drone that looks for debris on a runway, with the detector running onboard; a simulation project.',
    proof: '~30 FPS onboard a Jetson, 75–80% model accuracy',
    part: 'My own project, ongoing',
    field: 'machines',
  },
  'emotion-recognition-autism-support': {
    kind: 'AI · support tool',
    line: 'Reads facial expressions in real time on a small device, as a support tool for children with autism.',
    proof: '~92% development accuracy; prototype later acquired',
    part: 'Intern at VIBE: developed the pipeline and its data',
    field: 'health',
  },
  'bsheel-quest-app': {
    kind: 'App · co-founder',
    line: 'A game you play in the real world: pick a quest, do it, prove it with a photo, earn XP once it is checked.',
    proof: 'Live on Google Play and the App Store · 200+ users',
    part: 'Co-founder, with Razan Hasbini and Tayseer Laz; I built the proof checks',
    field: 'tools',
  },
  'ice-engine-simulator': {
    kind: 'Simulation · automotive',
    line: 'A MATLAB model of a four-cylinder engine, from the motion of its pistons to the gear ratios of the car it drives.',
    proof: 'Public on GitHub · MATLAB',
    part: 'Sole author · course assignment',
    field: 'machines',
  },
  'brainiacs-autonomous-race-car': {
    kind: 'Robotics · competition',
    line: 'A self-driving model car that reads the course’s traffic signs and steers itself, built from scratch in 20 days.',
    proof: '2nd in Future Engineers · WRO Lebanon 2023',
    part: 'All the software and control; Wassim Ghaddar on hardware',
    field: 'machines',
    image: {
      src: '/images/authority/race-car/front.jpeg',
      alt: 'Front view of the Brainiacs vehicle showing camera, chassis, and drive wheels.',
      position: '50% 55%',
    },
  },
  'thermal-super-resolution': {
    kind: 'AI · thermal imaging',
    line: 'Makes low-resolution thermal camera images sharper, fast enough to run on the device beside the sensor.',
    proof: '~130 FPS on a laptop GPU, 20–30 FPS on the drone’s Jetson',
    part: 'Built solo, for drones and ground robots',
    field: 'vision',
    image: {
      src: '/images/authority/thermal-super-resolution/thermal-plate.webp',
      alt: 'A low-resolution thermal street scene beside the same frame upscaled three times.',
    },
  },
  'posture-aware-classroom-desk': {
    kind: 'Robotics · product',
    line: 'A desk that sees how you sit and adjusts its own height and tilt, with instant light feedback and a dashboard of longer-term patterns.',
    proof: 'Best Graduating Project · RHU Engineering Jury',
    part: 'Team lead; all but the hardware design',
    field: 'machines',
    image: {
      src: '/images/authority/smart-desk/night-pic.jpeg',
      alt: 'The BEMO smart desk prototype photographed at night with its tilting top, camera arm, and control screen lit.',
    },
  },
  '360-spherical-panorama-stitching': {
    kind: 'Computer vision',
    line: 'Turns one handheld phone sweep into a 360° panorama you can walk around in a browser.',
    proof: 'Live viewer at 360.ramikronbi.com',
    part: 'Built solo',
    field: 'vision',
    image: {
      src: '/images/authority/spherical-panorama/panorama.jpg',
      alt: 'Full equirectangular panorama reconstructed from a handheld phone sweep of an interior room.',
    },
  },
  'daleel-lebanese-election-information': {
    kind: 'Civic tech',
    line: 'Lebanese election information you can trace back to its source, kept with its full history, in Arabic, English, and French.',
    proof: 'Arabic, English, and French, every fact with its source',
    part: 'Lead developer, with Layth Ayache',
    field: 'civic',
    image: {
      src: '/images/authority/daleel/hero.jpeg',
      alt: 'Daleel product hero image from the project repository showing the platform’s branded interface.',
    },
  },
  'imagen-raw-to-edit-dataset-pipeline': {
    kind: 'AI · photography',
    line: 'Taught a neural network to edit real-estate photos the way one photographer does, for a French photography agency.',
    proof:
      'From 2–3 photos a day for a team of three to ~40 per person, by the client’s count',
    part: 'Pipeline author, with Layth Ayache on training',
    field: 'vision',
  },
  'five-inch-carbon-fiber-fpv-drone': {
    kind: 'Drones · embedded',
    line: 'A 5-inch carbon-fiber FPV drone, designed and built around thrust, weight, and current calculations, and tuned in Betaflight down to GPS and return-to-home.',
    proof: 'Designed, built, and tuned',
    part: 'Designer and builder',
    field: 'machines',
    image: {
      src: '/images/authority/fpv-drone/build.jpg',
      alt: 'The drone mid-build: the 5-inch carbon-fiber frame and its motors on an ESD mat, beside the electronics, battery, and radio.',
      position: '50% 52%',
    },
  },
  'upstream-open-source-contributions': {
    kind: 'Open source · drones',
    line: 'Bug fixes accepted into Betaflight, the open-source firmware that flies FPV drones, and into the OpenFront browser game.',
    proof: '3 fixes merged by the maintainers',
    part: 'Sole author of each fix',
    field: 'open',
  },
  'omnisign-lebanese-sign-language': {
    kind: 'AI · accessibility',
    line: 'Recognizes Lebanese Sign Language from a camera in real time, the alphabet and everyday words, and turns it into text on phones, the web, and offline devices.',
    proof: '1st prize, Public Choice · National FYP Demo Day 2025',
    part: 'Co-founder; I built the computer-vision pipeline',
    field: 'vision',
  },
  'basira-retinal-screening': {
    kind: 'AI · health',
    line: 'Three AI models second-read an eye scan and report how far they agree; a doctor always makes the final call.',
    proof: '~2 s per eye on a plain CPU',
    part: 'Built solo · a prototype, not a medical device',
    field: 'health',
  },
  'easypid-arduino-library': {
    kind: 'Open source · control',
    line: 'An Arduino library for PID control, the feedback loop that keeps a motor, an arm, or a reading on target.',
    proof: 'On the Arduino Library Manager · 2 releases',
    part: 'Author',
    field: 'open',
  },
  'imu-bench': {
    kind: 'Open source · sensing',
    line: 'Plug in any motion sensor and watch it move in 3D, live, whatever protocol it speaks.',
    proof: 'Inertial Sense, PX4, microcontroller and ROS 2 sources',
    part: 'Sole author',
    field: 'open',
    image: {
      src: '/images/authority/imu-bench/plate.png',
      alt: 'An Inertial Sense RUG-3 enclosure drawn in 3D, tilted over a contour-line terrain, with its orange X, green Y and blue Z axes and mono callouts.',
    },
  },
  'pid-light-tracking-robot': {
    kind: 'Robotics',
    line: 'A two-axis robot that turns to follow a light, steadied by a PID control loop on each axis.',
    proof: 'Demonstration video',
    part: 'Led the software, with Wassim Ghaddar on hardware',
    field: 'machines',
  },
  'water-shooting-robot': {
    kind: 'Robotics',
    line: 'An early robot that raises, aims, and fires timed water bursts at targets, without a pump.',
    proof: 'Firmware, CAD, and tests in one repository',
    part: 'Wrote the firmware',
    field: 'machines',
  },
  'hantawatch-outbreak-dashboard': {
    kind: 'Data · public health',
    line: 'A live dashboard that gathered public reports on the 2026 MV Hondius hantavirus outbreak into one shareable view.',
    proof: 'Deployed',
    part: 'Built solo',
    field: 'health',
  },
  'lumiscan-lesion-dashboard': {
    kind: 'Health software',
    line: 'Software for a skin-lesion scanner that keeps patients, lesions, and scans together, so a clinic can see whether a lesion is changing.',
    proof: 'Built for the device’s product owner',
    part: 'Built solo',
    field: 'health',
  },
  'multilingual-medical-prescription-ocr': {
    kind: 'AI · health',
    line: 'Reads medicine names off prescription photos written in Arabic, English, or French.',
    proof: 'An API and a command-line tool',
    part: 'Built solo',
    field: 'health',
  },
  'fine-crack-tracing-toolkit': {
    kind: 'Vision · inspection',
    line: 'Turns cracks already found in an image into ordered, measurable paths, with overlays and metrics.',
    proof: 'An installable Python package',
    part: 'Built from scratch',
    field: 'vision',
    image: {
      src: '/images/authority/fine-crack/test-frame.png',
      alt: 'A segmentation mask of a thin crack, the input the toolkit traces, used as an input to the tracing toolkit.',
    },
  },
  'lebanese-motorcycle-theory-trainer': {
    kind: 'Education',
    line: 'An Arabic study app for the Lebanese motorcycle theory exam, with practice that adapts to what you get wrong.',
    proof: '251 questions · 101 road signs',
    part: 'Built solo · not an official government app',
    field: 'civic',
  },
  'evoid-applied-vision-venture': {
    kind: 'Venture',
    line: 'A small applied computer-vision venture in Beirut, building prototypes and apps for clients.',
    proof: 'Co-founder, 2023–2025',
    part: 'Systems engineer and product manager',
    field: 'tools',
  },
  'local-first-ai-support-triage': {
    kind: 'AI · internal tools',
    line: 'A self-hosted console for sorting incoming support requests, built as a technical assessment for Valsoft.',
    proof: 'Technical assessment deliverable',
    part: 'Built solo',
    field: 'tools',
  },
  juno: {
    kind: 'App · personal finance',
    line: 'The new version of my finance app: a local-first personal and household tracker for the Linux desktop and iPhone, with optional sync between them.',
    proof: 'Public on GitHub · Flutter',
    part: 'Built solo',
    field: 'tools',
    image: {
      src: '/images/vneo/juno-home.jpg',
      alt: 'Juno’s home screen with demo data: the month’s spending, budgets, and accounts.',
      position: '0% 0%',
    },
  },
  'quadrotor-rotor-fault-recovery': {
    kind: 'Drones · control research',
    line: 'Teaches a small quadrotor to notice a damaged or lost rotor within a fraction of a second and keep flying.',
    proof: '200 of 200 simulated faults caught, median 30 ms',
    part: 'Sole author',
    field: 'machines',
    image: {
      src: '/images/authority/quadrotor-rotor-fault-recovery/plate.png',
      alt: 'Plot of position error after one rotor stops in simulated hover: the nominal controller flips, the estimating pipeline recovers.',
    },
  },
  'esp32-barn-door-star-tracker': {
    kind: 'Embedded · astrophotography',
    line: 'A 3D-printed camera mount that turns with the sky, so long night-sky photos stay sharp; designed, not yet built.',
    proof: 'Designed, not built; the firmware cancels the barn-door tangent error',
    part: 'Sole designer',
    field: 'machines',
    image: {
      src: '/images/authority/esp32-barn-door-star-tracker/cad-render-square.png',
      alt: 'CAD render of the tracker: two hinged boards, a lead-screw tower with a carriage, and an electronics box.',
    },
  },
  'drone-control-bootcamp': {
    kind: 'Teaching · control',
    line: 'A seven-evening course that takes students from a simple circuit to a drone that survives losing a propeller; ready, not yet taught.',
    proof: 'Designed, not yet taught',
    part: 'Sole author',
    field: 'machines',
    image: {
      src: '/images/authority/drone-control-bootcamp/plate.png',
      alt: 'Plot of the seesaw rig’s beam angle under a single PID loop and a rate and angle cascade, with a tap at four seconds.',
    },
  },
  'road-speed-audit': {
    kind: 'Vision · road safety',
    line: 'Measures how fast cars drive on one street from a single camera, and says how far each number can be trusted.',
    proof: '95 % of speeds within 1 km/h, on simulated video',
    part: 'Sole author',
    field: 'civic',
    image: {
      src: '/images/authority/road-speed-audit/plate.png',
      alt: 'A rendered street scene labelled “Simulated scene”, with tracked vehicles showing measured and true speeds.',
    },
  },
  'ree-personal-finance-tracker': {
    kind: 'Desktop app',
    line: 'A private, offline personal-finance app for wallets, subscriptions, debts, and savings goals.',
    proof: 'Your data stays on your computer',
    part: 'Built solo',
    field: 'tools',
    image: {
      src: '/images/authority/ree-finance/image1.jpeg',
      alt: 'Screenshot of REE showing the desktop finance interface with wallets, transactions, and analysis views.',
    },
  },
}

export interface WorkItem {
  project: ProjectRecord
  plain: PlainWork
}

/** Ready work that has a plain-language entry, in the record's order. */
export const works: WorkItem[] = readyProjects
  .filter((p) => plain[p.slug])
  .map((project) => ({ project, plain: plain[project.slug] }))

export const workBySlug = (slug: string): WorkItem | undefined => {
  const project = getProject(slug)
  return project && project.state === 'ready' && plain[slug]
    ? { project, plain: plain[slug] }
    : undefined
}

export const V3 = '/v3'
export const workHref = (slug: string, base: string = V3) =>
  `${base}/projects/${slug}`
/** Moves a /v3 link into another version (e.g. /v4), leaving every other link alone. */
export const rebase = (href: string, base: string) =>
  href.replace(/^\/v3(?=[/#?]|$)/, base)
/** Writing stays on the live record until /v3 has its own reader. */
export const noteHref = (slug: string) => `/writing/${slug}`
