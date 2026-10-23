import styles from './authority.module.css'

interface DiagramProps {
  id: string
  caption: string
  alt: string
}

interface DiagramNodeProps {
  title: string
  detail?: string
}

function Node({ title, detail }: DiagramNodeProps) {
  return (
    <div className={styles.diagramNode}>
      <span className={styles.diagramNodeTitle}>{title}</span>
      {detail ? <span className={styles.diagramNodeDetail}>{detail}</span> : null}
    </div>
  )
}

function Arrow({ label }: { label?: string }) {
  return (
    <span className={styles.diagramArrow} aria-hidden="true">
      {label ?? '→'}
    </span>
  )
}

function pidLoop() {
  return (
    <div className={styles.diagram}>
      <div className={styles.diagramRow}>
        <Node title="Setpoint" detail="Desired value r(t) from the caller." />
        <Arrow />
        <Node title="Error" detail="e(t) = r(t) − y(t) computed on each sample." />
        <Arrow />
        <Node title="PID sum" detail="P · e + I · ∫e dt + D · de/dt with filtering and anti-windup." />
      </div>
      <div className={styles.diagramRow} style={{ marginTop: '1rem' }}>
        <Node title="Output limits" detail="Bounded actuator command u(t)." />
        <Arrow />
        <Node title="Plant" detail="Motor, heater, or valve driven by u(t)." />
        <Arrow />
        <Node title="Sensor" detail="Measured y(t) fed back to the error step." />
      </div>
    </div>
  )
}

function lightTracker() {
  return (
    <div className={styles.diagram}>
      <div className={styles.diagramRow}>
        <Node title="4 × LDR" detail="Top, bottom, left, right sensors form a directional error." />
        <Arrow />
        <Node title="PID controller" detail="Runs on Arduino; per-axis gains, filtering, and limits." />
        <Arrow />
        <Node title="Yaw & pitch servos" detail="Two servos move the sensor assembly." />
      </div>
      <div className={styles.diagramRowThree} style={{ marginTop: '1rem' }}>
        <Node title="Debug output" detail="Per-term contributions to distinguish measurement vs controller." />
        <Node title="Mechanical limits" detail="Backlash, travel, and chassis flex are inside the loop." />
        <Node title="Feedback" detail="New sensor pose changes the light distribution — closing the loop." />
      </div>
    </div>
  )
}

function prescriptionFlow() {
  return (
    <div className={styles.diagram}>
      <div className={styles.diagramRow}>
        <Node title="Ingest" detail="CLI batches or validated FastAPI requests with images." />
        <Arrow />
        <Node title="Extract" detail="Gemini call returns structured medicine-name candidates." />
        <Arrow />
        <Node title="Normalize" detail="Optional medicine database supports lookup and review." />
      </div>
      <div className={styles.diagramRowThree} style={{ marginTop: '1rem' }}>
        <Node title="Structured result" detail="Medicine names, uncertainty, and error paths." />
        <Node title="Human review" detail="Every result is verified against the source image." />
        <Node title="Boundary" detail="Not a prescribing, dispensing, or clinical system." />
      </div>
    </div>
  )
}

function supportCouncil() {
  return (
    <div className={styles.diagram}>
      <div className={styles.diagramRow}>
        <Node title="Intake" detail="Synthetic B2B submissions enter the console." />
        <Arrow />
        <Node title="LLM proposal" detail="Ollama local model (or optional OpenAI-compatible provider)." />
        <Arrow />
        <Node title="Deterministic rules" detail="Confidence thresholds and escalation conditions." />
      </div>
      <div className={styles.diagramRow} style={{ marginTop: '1rem' }}>
        <Node title="Human review" detail="Original submission, proposal, confidence, and rules — all visible." />
        <Arrow />
        <Node title="PostgreSQL" detail="Reviewed state persists here; Redis/RQ handles background work." />
        <Arrow />
        <Node title="JSON export" detail="Reflects the reviewed state, not intermediate predictions." />
      </div>
    </div>
  )
}

function signTranslation() {
  return (
    <div className={styles.diagram}>
      <div className={styles.diagramRow}>
        <Node title="Camera" detail="Signer, background, lighting, and hardware differ per deployment." />
        <Arrow />
        <Node title="Recognition" detail="Visual model produces candidate signs with confidence." />
        <Arrow />
        <Node title="Language output" detail="Recognized signs are converted for a listener in context." />
      </div>
      <div className={styles.diagramRowThree} style={{ marginTop: '1rem' }}>
        <Node title="Mobile" detail="Handheld deployment with limited compute." />
        <Node title="Web" detail="Browser deployment with different latency profile." />
        <Node title="Offline embedded" detail="Standalone device without network dependency." />
      </div>
    </div>
  )
}

function postureLoop() {
  return (
    <div className={styles.diagram}>
      <div className={styles.diagramRow}>
        <Node title="Camera" detail="Desk-mounted camera estimates posture." />
        <Arrow />
        <Node title="ESP32 policy" detail="Dead bands, mechanical limits, slow transitions." />
        <Arrow />
        <Node title="Actuators" detail="Motorized height and tilt change the work surface." />
      </div>
      <div className={styles.diagramRow} style={{ marginTop: '1rem' }}>
        <Node title="Feedback" detail="LED signals current state to the user." />
        <Arrow />
        <Node title="Dashboard" detail="Longer-term posture patterns for review." />
        <Arrow />
        <Node title="Manual override" detail="A person can stop or unset any correction." />
      </div>
    </div>
  )
}

function uavFod() {
  return (
    <div className={styles.diagram}>
      <div className={styles.diagramRow}>
        <Node title="UAV camera" detail="The drone carries a camera over a simulated runway." />
        <Arrow />
        <Node title="YOLOv11 on Jetson" detail="Lightweight FOD detector running onboard at ~30 FPS." />
        <Arrow />
        <Node title="Matching & filtering" detail="Similarity matching and false-positive filtering on the raw detections." />
      </div>
      <div className={styles.diagramRowThree} style={{ marginTop: '1rem' }}>
        <Node title="Training data" detail="Online and synthetically generated data; 75–80% model accuracy." />
        <Node title="Flight tests" detail="In-flight tests simulate runway conditions." />
        <Node title="Detections" detail="The FOD candidates that make it through the filtering." />
      </div>
    </div>
  )
}

function fpvStack() {
  return (
    <div className={styles.diagram}>
      <div className={styles.diagramRow}>
        <Node title="Motors & props" detail="Chosen from thrust and current targets." />
        <Arrow />
        <Node title="Battery" detail="Voltage sets the power budget and headroom." />
        <Arrow />
        <Node title="Frame" detail="Weight and component placement decide response." />
      </div>
      <div className={styles.diagramRowThree} style={{ marginTop: '1rem' }}>
        <Node title="Betaflight config" detail="Wires flight-controller behavior together." />
        <Node title="PID tuning" detail="Only after the physical build is coherent." />
        <Node title="Flight modes / GPS / RTH" detail="Configured and evaluated in real conditions." />
      </div>
    </div>
  )
}

function emotionPipeline() {
  return (
    <div className={styles.diagram}>
      <div className={styles.diagramRow}>
        <Node title="Camera" detail="A live view of the child’s face." />
        <Arrow />
        <Node title="Face & landmarks" detail="Facial landmarks describe the shape of the face." />
        <Arrow />
        <Node title="CNN" detail="Classifies the expression on a Jetson Orin Nano." />
      </div>
      <div className={styles.diagramRowThree} style={{ marginTop: '1rem' }}>
        <Node title="Training data" detail="CALMED, Kaggle, and other image and video sources, combined and cleaned." />
        <Node title="Real time" detail="Runs live on the device; ~92% development accuracy." />
        <Node title="Support" detail="A support tool, not a diagnosis." />
      </div>
    </div>
  )
}

function upstreamFixes() {
  return (
    <div className={styles.diagram}>
      <div className={styles.diagramRow}>
        <Node title="Reported issue" detail="An upstream bug report or a fault reproduced on real hardware." />
        <Arrow />
        <Node title="Root cause" detail="Read the driver or estimator path until the mechanism is explicit." />
        <Arrow />
        <Node title="Minimal fix" detail="Change the smallest surface that removes the fault." />
      </div>
      <div className={styles.diagramRowThree} style={{ marginTop: '1rem' }}>
        <Node title="Regression test" detail="A test that fails before the change and passes after it." />
        <Node title="Written rationale" detail="The pull request explains the mechanism, not only the diff." />
        <Node title="Maintainer review" detail="Merged, revised, or closed by the project’s maintainers." />
      </div>
    </div>
  )
}

function talksLoop() {
  return (
    <div className={styles.diagram}>
      <div className={styles.diagramRow}>
        <Node title="Build" detail="A system that ran on real hardware or in a real workflow." />
        <Arrow />
        <Node title="Explain" detail="Mechanism, constraints, and what failed, for a mixed audience." />
        <Arrow />
        <Node title="Hand over" detail="Slides, demos, and exercises others can repeat." />
      </div>
    </div>
  )
}

function osintFeed() {
  return (
    <div className={styles.diagram}>
      <div className={styles.diagramRow}>
        <Node title="Public sources" detail="WHO disease-outbreak news, CDC, an ArcGIS case layer, GDELT and Google News feeds." />
        <Arrow />
        <Node title="Aggregate" detail="Server-side fetch and normalization of cases, case events, and news, with source-health checks." />
        <Arrow />
        <Node title="Dashboard" detail="Country choropleth, status-colored case markers, event feed, KPIs, sparkline, ticker." />
      </div>
      <div className={styles.diagramRow} style={{ marginTop: '1rem' }}>
        <Node title="URL filters" detail="View, search, and country live in the URL so any state is shareable." />
        <Arrow />
        <Node title="Every row links out" detail="Each event points at its source page; nothing is asserted without a link." />
      </div>
    </div>
  )
}

function councilConsensus() {
  return (
    <div className={styles.diagram}>
      <div className={styles.diagramRow}>
        <Node title="Fundus or OCT image" detail="Uploaded by a clinic user; quality gate first." />
        <Arrow />
        <Node title="Three independent models" detail="Different lineages, each with its own trained classification head." />
        <Arrow />
        <Node title="Consensus" detail="Agreement score (unanimous, majority, split), urgency, referral suggestion." />
      </div>
      <div className={styles.diagramRow} style={{ marginTop: '1rem' }}>
        <Node title="Doctor review" detail="Confirms or overrides; nothing is final without a clinician." />
        <Arrow />
        <Node title="Report" detail="Branded PDF for the patient file, in Arabic, English, or French." />
      </div>
    </div>
  )
}

function rawPipeline() {
  return (
    <div className={styles.diagram}>
      <div className={styles.diagramRow}>
        <Node title="Ingest" detail="Group RAW brackets by timestamp: ambient −6…+6 EV, flash, lights-on, plus the edited JPEG." />
        <Arrow />
        <Node title="Preprocess" detail="Full DNG color pipeline and lens correction to 16-bit linear sRGB frames." />
        <Arrow />
        <Node title="Targets" detail="Linearized edited JPEG as the ground truth for each frame set." />
      </div>
      <div className={styles.diagramRow} style={{ marginTop: '1rem' }}>
        <Node title="Dataloader" detail="Paired inputs and targets with manifests per listing." />
        <Arrow />
        <Node title="HDRNet training" detail="A bilateral-grid network learns the photographer’s editing style." />
      </div>
    </div>
  )
}

function lesionTimeline() {
  return (
    <div className={styles.diagram}>
      <div className={styles.diagramRow}>
        <Node title="Organization" detail="Clinic, hospital, or solo doctor; every clinical row carries its org id." />
        <Arrow />
        <Node title="Patient → lesion → scan" detail="Manual entry now; a versioned device-ingestion API is defined and stubbed." />
        <Arrow />
        <Node title="Timeline" detail="Scans compared over time with metric trends and flags." />
      </div>
      <div className={styles.diagramRow} style={{ marginTop: '1rem' }}>
        <Node title="Narrative only" detail="A language model writes summaries from stored results; it never classifies." />
        <Arrow />
        <Node title="Follow-up" detail="Management notes when a scan is flagged." />
      </div>
    </div>
  )
}

function waterRobot() {
  return (
    <div className={styles.diagram}>
      <div className={styles.diagramRow}>
        <Node title="Target table" detail="Distance and angle per target, stored in arrays." />
        <Arrow />
        <Node title="Aim" detail="Servo rotates the nozzle; a stepper-driven lead screw sets the height." />
        <Arrow />
        <Node title="Fire" detail="A solenoid valve opens for a timed burst." />
      </div>
      <div className={styles.diagramRow} style={{ marginTop: '1rem' }}>
        <Node title="Height model" detail="Required nozzle height from a simple ballistic relation and the current water level." />
        <Arrow />
        <Node title="Level update" detail="A Torricelli-style relation lowers the modeled water level after each shot." />
      </div>
    </div>
  )
}

function ventureLoop() {
  return (
    <div className={styles.diagram}>
      <div className={styles.diagramRow}>
        <Node title="Client problem" detail="A workflow where a camera or a model could remove repetitive work." />
        <Arrow />
        <Node title="Prototype" detail="A small computer-vision or mobile build scoped to one engagement." />
        <Arrow />
        <Node title="Deliver and learn" detail="What shipped, what failed, and what the next engagement should avoid." />
      </div>
    </div>
  )
}

function questLoop() {
  return (
    <div className={styles.diagram}>
      <div className={styles.diagramRow}>
        <Node title="Three quests" detail="The user picks one of three real-world challenges and a per-quest timer starts." />
        <Arrow />
        <Node title="Proof" detail="Photo or video proof is uploaded to private object storage." />
        <Arrow />
        <Node title="Moderation" detail="A reviewer approves or rejects; appeals exist; XP is written as a transaction." />
      </div>
      <div className={styles.diagramRowThree} style={{ marginTop: '1rem' }}>
        <Node title="Feed and votes" detail="Approved quests enter a hot-ordered feed with block and visibility filtering." />
        <Node title="Worker queue" detail="Notifications and fan-out run from a durable queue, not the client." />
        <Node title="Admin console" detail="Moderation queue, appeals, quest catalog, Quest of the Day, XP audit." />
      </div>
    </div>
  )
}

function bikeLoop() {
  return (
    <div className={styles.diagram}>
      <div className={styles.diagramRow}>
        <Node title="Ride" detail="GPS distance summed between filtered fixes." />
        <Arrow />
        <Node title="Odometer" detail="Each ride moves the bike’s odometer." />
        <Arrow />
        <Node title="Service due" detail="Maintenance schedule keyed to distance, not calendar." />
      </div>
      <div className={styles.diagramRow} style={{ marginTop: '1rem' }}>
        <Node title="Find part and mechanic" detail="Local marketplace and workshop directory near where the rider rides." />
        <Arrow />
        <Node title="Log the work" detail="The schedule resets; road hazards from other riders feed the next ride." />
      </div>
    </div>
  )
}

function deminingStack() {
  return (
    <div className={styles.diagram}>
      <div className={styles.diagramRow}>
        <Node title="Sensors" detail="Drivers and calibration." />
        <Arrow />
        <Node title="Perception" detail="Vision and LiDAR." />
        <Arrow />
        <Node title="Localization" detail="Sensor fusion and satellite-map georeferencing." />
      </div>
      <div className={styles.diagramRow} style={{ marginTop: '1rem' }}>
        <Node title="Path planning" />
        <Arrow />
        <Node title="Mission execution" detail="Autonomous." />
        <Arrow />
        <Node title="Base link" detail="Rover-base communications." />
      </div>
      <div className={styles.diagramRowThree} style={{ marginTop: '1rem' }}>
        <Node title="6-DoF extraction arm" detail="Carried by the mine-detection rover." />
        <Node title="Test tooling" detail="Built alongside the stack." />
        <Node title="Field tests" detail="Integrated system validated with dummy mines, with the Lebanese Armed Forces in Mechref." />
      </div>
    </div>
  )
}

function enginePipeline() {
  return (
    <div className={styles.diagram}>
      <div className={styles.diagramRow}>
        <Node title="Geometry" detail="One file of parameters: links, masses, 2000 rpm, valve and combustion timing." />
        <Arrow />
        <Node title="Kinematics" detail="Slider-crank position, velocity, acceleration and cylinder volume at every crank angle." />
        <Arrow />
        <Node title="Thermodynamic cycle" detail="Polytropic strokes, Wiebe combustion, orifice gas exchange; iterated to convergence." />
      </div>
      <div className={styles.diagramRow} style={{ marginTop: '1rem' }}>
        <Node title="Torque" detail="An 8×8 force and moment solve per crank angle; four cylinders summed 180° apart." />
        <Arrow />
        <Node title="Flywheel" detail="Sized for a 0.04 speed-fluctuation coefficient as a steel disc 50 mm thick." />
        <Arrow />
        <Node title="Gearbox" detail="Eight ratios between a 245 km/h top speed and a 7 % grade." />
      </div>
    </div>
  )
}

const RENDERERS: Record<string, () => JSX.Element> = {
  'demining-stack': deminingStack,
  'engine-pipeline': enginePipeline,
  'quest-loop': questLoop,
  'bike-loop': bikeLoop,
  'osint-feed': osintFeed,
  'council-consensus': councilConsensus,
  'raw-pipeline': rawPipeline,
  'lesion-timeline': lesionTimeline,
  'water-robot': waterRobot,
  'venture-loop': ventureLoop,
  'upstream-fixes': upstreamFixes,
  'talks-loop': talksLoop,
  'pid-loop': pidLoop,
  'light-tracker': lightTracker,
  'prescription-flow': prescriptionFlow,
  'support-council': supportCouncil,
  'sign-translation': signTranslation,
  'posture-loop': postureLoop,
  'uav-fod': uavFod,
  'fpv-stack': fpvStack,
  'emotion-pipeline': emotionPipeline,
}

export function Diagram({ id, caption, alt }: DiagramProps) {
  const render = RENDERERS[id]
  if (!render) {
    return null
  }
  return (
    <figure aria-label={alt}>
      {render()}
      <figcaption className={styles.diagramCaption}>{caption}</figcaption>
    </figure>
  )
}

export function hasDiagram(id: string) {
  return Boolean(RENDERERS[id])
}
