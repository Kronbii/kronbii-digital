import type { ArticleRecord } from './types'

export const articles: ArticleRecord[] = [
  {
    slug: 'engineering-a-five-inch-fpv-drone-from-first-principles',
    state: 'ready',
    title: 'Engineering a five-inch FPV drone from first principles',
    metaTitle: 'Engineering a five-inch FPV drone from first principles',
    metaDescription:
      'How Rami Kronbi designed and built a 5-inch carbon-fiber FPV drone: propulsion and power sized from thrust, weight, and current, Betaflight tuned through GPS and return-to-home, and the link and GPS tested under jamming.',
    dek: 'Building a five-inch FPV drone is an exercise in coupled constraints: every part you choose changes what the others have to do.',
    heroMedia: {
      src: '/images/authority/fpv-drone/build.jpg',
      alt: 'The drone mid-build on an ESD mat: the 5-inch carbon-fiber frame with its four motors, beside the electronics, a battery, the radio transmitter, and calipers.',
      caption: 'Mid-build: the frame and its motors, with the electronics, battery, and radio laid out beside it.',
    },
    body: [
      {
        kind: 'p',
        text: 'Building a five-inch FPV drone is an exercise in coupled constraints. Motor and propeller choices set thrust and current draw. Battery voltage changes the whole power system. Frame weight and where each component sits change how the drone responds. Software tuning only begins once the physical build is coherent.',
      },
      { kind: 'h2', text: 'Start from the numbers' },
      {
        kind: 'p',
        text: 'I selected the propulsion and power components from thrust, weight, and current calculations. The three are tied together: the motors and propellers have to make enough thrust for the weight of everything on the frame, that thrust costs current, and the battery and electronics have to deliver that current while adding weight of their own.',
      },
      {
        kind: 'p',
        text: 'Change one and the others move. A bigger propeller or a stronger motor buys thrust and spends current; a battery that can supply more current is usually heavier, which asks for more thrust again. The calculation is where you find a combination that closes before you buy or solder anything.',
      },
      { kind: 'h2', text: 'The build' },
      {
        kind: 'p',
        text: 'The components went together on a 5-inch carbon-fiber frame. The build photo on the project page catches it halfway: the frame and its four motors on an ESD mat, with the electronics, a battery, the radio transmitter, and a pair of calipers beside it.',
      },
      { kind: 'h2', text: 'Tuning in Betaflight' },
      {
        kind: 'p',
        text: 'Betaflight is the open-source firmware that runs on the flight controller. I configured and tuned its PID loops, set up its flight modes, and configured its GPS features and return-to-home behavior.',
      },
      {
        kind: 'p',
        text: 'The PID loops are what make the drone go where the sticks point it: they compare the rotation the gyro measures with the rotation the pilot asks for and correct the difference thousands of times a second. It is the same feedback idea behind easyPID, the Arduino PID library I wrote, on a machine that reacts far faster.',
      },
      {
        kind: 'p',
        text: 'Return-to-home is the feature that flies the drone back on its own, typically when the radio link drops, and it steers by GPS. That makes it only as trustworthy as the position fix and the link behind it, which is why the last step was testing both.',
      },
      { kind: 'h2', text: 'Testing when GPS cannot be trusted' },
      {
        kind: 'p',
        text: 'I evaluated GPS accuracy, RF link quality, and flight performance, including under GNSS jamming and the constraints of integrating IMU and GNSS data.',
      },
      {
        kind: 'p',
        text: 'Jamming matters because so much of a drone’s autonomy rests on satellite positioning. When GNSS is jammed, the position that GPS features and return-to-home depend on stops being reliable. The IMU keeps measuring motion, and it is good at that over short spans, but its estimate drifts over time. How the two are combined decides how the drone behaves when one of them degrades.',
      },
      {
        kind: 'p',
        text: 'A five-inch quad packs a lot of engineering into a small frame: the arithmetic of power and weight, a fast feedback controller, a radio link, and sensors that each fail in their own way. Betaflight is also where some of my open-source work lives; the small fixes I have contributed to its firmware are written up separately.',
      },
    ],
    sources: [
      {
        label: 'Betaflight',
        href: 'https://betaflight.com',
        kind: 'documentation',
        note: 'The open-source flight-controller firmware.',
      },
    ],
    projectSlug: 'five-inch-carbon-fiber-fpv-drone',
    topics: ['control-systems', 'embedded-systems', 'robotics-perception'],
    keywords: ['FPV drone', 'quadcopter', 'Betaflight', 'PID tuning', 'GPS rescue', 'GNSS jamming'],
  },
  {
    slug: 'building-a-360-panorama-stitcher-from-a-phone-sweep',
    state: 'ready',
    title: 'Building a 360° panorama stitcher from a phone sweep',
    metaTitle: 'Building a 360° panorama stitcher from a phone sweep',
    metaDescription:
      'A phone video, a pure-rotation camera model, and a stubborn question about how much of a 360° reconstruction pipeline can be made explicit instead of hidden behind a stitching API.',
    dek: 'A phone video, a pure-rotation camera model, and a stubborn question: how much of a 360° reconstruction pipeline can be made explicit instead of hidden behind a stitching API?',
    heroMedia: {
      src: '/images/authority/spherical-panorama/pano-on-band.jpg',
      alt: 'Recovered spherical band from a horizontal phone sweep, laid flat as an equirectangular image.',
      caption: 'Recovered band from a horizontal phone sweep. Only 36.9% of the sphere is captured.',
    },
    body: [
      {
        kind: 'p',
        text: 'A panorama looks simple only after it works. Before that, it is a chain of small geometric errors. A few bad correspondences tilt the camera estimate. A fraction of a degree of pitch error accumulates into a staircase along a ceiling. A handheld step sideways introduces parallax that no homography can honestly explain.',
      },
      {
        kind: 'p',
        text: 'I built this pipeline to make that chain visible. It accepts a phone video or a folder of stills and produces an equirectangular panorama plus a self-contained Three.js viewer. The implementation is CPU-only Python and OpenCV. There is no gyroscope dependency and no opaque “stitch” call doing the whole job.',
      },
      { kind: 'h3', text: 'The pipeline is eight decisions, not one algorithm' },
      {
        kind: 'p',
        text: 'Frames are extracted from video by interval, count, frame rate, or measured motion. Camera intrinsics come from EXIF when possible, then fall back to an explicit field of view or calibration file. Adjacent frames are matched with ORB features, Lowe’s ratio test, and RANSAC. If an adjacent pair fails, the matcher tries across the gap and interpolates the missing step instead of silently discarding the frame.',
      },
      {
        kind: 'p',
        text: 'The useful part begins after the homography. Under a pure-rotation model, the relative camera rotation is recovered with R = K⁻¹HK. Numerical noise means that matrix is rarely a perfect rotation, so singular-value decomposition projects it back onto the rotation manifold before the estimates are chained into global orientations.',
      },
      {
        kind: 'p',
        text: 'Each source frame is then inverse-warped onto an equirectangular canvas: an output pixel becomes a world direction, that direction is rotated into the camera, projected onto the image plane, and sampled. Overlaps can be blended in several ways, and unseen regions can be filled, with the important caveat that filling is not reconstruction.',
      },
      { kind: 'h3', text: 'The straight line that exposed the real problem' },
      {
        kind: 'p',
        text: 'On the sample run, independent pairwise estimates left only small pitch and roll errors. They were still enough to turn long architectural edges into a visible staircase. A moving average over the chained rotations reduced pitch wobble by 13.5× and roll wobble by 5.2× on that run.',
      },
      {
        kind: 'p',
        text: 'That fix is deliberately modest. It does not replace global bundle adjustment or close the loop around a full sweep. It solves the instability that was actually visible while keeping the pipeline easy to inspect.',
      },
      { kind: 'h3', text: 'What the sample run says—and what it does not' },
      {
        kind: 'p',
        text: 'The sample used 309 phone-video frames and recovered a 333° sweep. Median RANSAC support was 921 inliers per adjacent pair; 15 of 308 pairs were recovered through interpolation. At 4096 × 2048, the full run took about two minutes on a Ryzen 7 5800H, including roughly 19 seconds of feature matching and 96 seconds of warping.',
      },
      {
        kind: 'p',
        text: 'Only 36.9% of the sphere had actually been photographed. A phone-height horizontal sweep sees a band around the viewer, not the floor and ceiling. The missing poles can be inpainted, but that is filling, not captured detail.',
      },
      {
        kind: 'p',
        text: 'The other limit is parallax. The model assumes the phone rotates around its optical center. Translate while sweeping past a nearby object and the scene no longer has a single homography. Blank walls and repeated textures also weaken matching. There is no bundle adjustment or exposure matching in the current version, so drift and brightness changes are still on the list.',
      },
      {
        kind: 'p',
        text: 'The result is useful because it is inspectable. Every stage has a module, the run records its resolved configuration and intrinsics, more than 200 tests cover the pipeline, and the browser viewer makes the final geometry tangible. It is less a magic panorama button than a working map of the decisions behind one.',
      },
    ],
    sources: [
      {
        label: 'GitHub — 360-spherical-stitching',
        href: 'https://github.com/Kronbii/360-spherical-stitching',
        kind: 'repository',
      },
      { label: 'Live viewer — 360.ramikronbi.com', href: 'https://360.ramikronbi.com', kind: 'demo' },
      {
        label: 'TECHNICAL.md — method notes',
        href: 'https://github.com/Kronbii/360-spherical-stitching/blob/main/TECHNICAL.md',
        kind: 'documentation',
      },
      {
        label: 'TEMPORAL_SMOOTHING.md',
        href: 'https://github.com/Kronbii/360-spherical-stitching/blob/main/TEMPORAL_SMOOTHING.md',
        kind: 'documentation',
      },
    ],
    projectSlug: '360-spherical-panorama-stitching',
    topics: ['computer-vision', 'robotics-perception', 'open-source-engineering'],
    keywords: ['panorama pipeline', 'ORB features', 'temporal smoothing', 'equirectangular'],
  },
  {
    slug: 'designing-a-pid-library-for-real-embedded-control',
    state: 'ready',
    title: 'Designing a PID library for real embedded control',
    metaTitle: 'Designing a PID library for real embedded control',
    metaDescription:
      'The PID equation is short. A controller that behaves predictably on an Arduino needs much more than three gains.',
    dek: 'The PID equation is short. A controller that behaves predictably on an Arduino needs much more than three gains.',
    body: [
      {
        kind: 'p',
        text: 'Most introductions to PID control end at the formula. Real embedded control starts after it. The loop may run late. An actuator saturates. Sensor noise dominates the derivative term. A second controller needs to coexist with the first. The person tuning the system needs to see what each term is doing instead of guessing from the final output.',
      },
      {
        kind: 'p',
        text: 'easyPID grew from that gap. It is a hardware-agnostic Arduino library built around independent controller instances rather than global state. A project can run multiple loops, use automatic millis() timing or pass an explicit time delta, change gains at runtime, limit outputs, and inspect the controller’s internal state.',
      },
      { kind: 'h3', text: 'Timing belongs in the interface' },
      {
        kind: 'p',
        text: 'A control loop is not only a function of error; it is a function of time. Hiding the sample interval makes a controller look stable in one sketch and behave differently when logging, communication, or another sensor changes the loop duration.',
      },
      {
        kind: 'p',
        text: 'easyPID therefore supports two timing modes. Automatic timing is convenient for ordinary Arduino sketches. Manual delta time lets a scheduler or test harness own the clock. The latter also makes simulation and repeatable tests easier because time becomes input rather than ambient state.',
      },
      { kind: 'h3', text: 'Saturation and noise are normal operating conditions' },
      {
        kind: 'p',
        text: 'Integral windup happens when the requested output exceeds what the actuator can deliver while the integral term keeps accumulating. When the system finally returns to a controllable range, that stored error can drive a long overshoot. The library provides selectable anti-windup behavior and explicit output bounds so saturation is part of the model.',
      },
      {
        kind: 'p',
        text: 'Derivative action has the opposite sensitivity: it reacts strongly to high-frequency measurement noise. Optional low-pass filtering makes the derivative term usable on the sensors people actually connect to microcontrollers.',
      },
      {
        kind: 'p',
        text: 'State introspection is just as important. Exposing the proportional, integral, and derivative contributions turns tuning from a ritual into diagnosis. If the integral term is carrying the system, or the derivative term is amplifying noise, you can see it.',
      },
      { kind: 'h3', text: 'Autotuning is a tool with consequences' },
      {
        kind: 'p',
        text: 'The optional relay autotuner deliberately drives the process into oscillation and derives candidate gains from the response. That can be useful, but it is not a safe default. The actuator must have limits, the process must tolerate repeated oscillation, and a person must be ready to stop the run. The documentation treats those conditions as part of the feature rather than a footnote.',
      },
      {
        kind: 'p',
        text: 'easyPID is distributed through Arduino Library Manager as a contributed Device Control library and remains small enough for Uno-class AVR boards. Its main design lesson is broader than PID: reusable embedded code should expose timing, limits, state, and failure modes. The equation is the easy part. The contract around it is what makes it reusable.',
      },
    ],
    sources: [
      { label: 'GitHub — easyPID', href: 'https://github.com/Kronbii/easyPID', kind: 'repository' },
      {
        label: 'Arduino Library Manager listing',
        href: 'https://www.arduinolibraries.info/libraries/easy-pid',
        kind: 'listing',
      },
      {
        label: 'Examples and tuning documentation',
        href: 'https://github.com/Kronbii/easyPID/tree/main/examples',
        kind: 'documentation',
      },
    ],
    projectSlug: 'easypid-arduino-library',
    topics: ['embedded-systems', 'control-systems', 'open-source-engineering'],
    keywords: ['PID library', 'Arduino', 'anti-windup', 'autotune', 'derivative filtering'],
  },
  {
    slug: 'building-an-autonomous-race-car-in-twenty-days',
    state: 'ready',
    title: 'Building an autonomous race car in twenty days',
    metaTitle: 'Building an autonomous race car in twenty days',
    metaDescription:
      'A small autonomous vehicle forced perception, control, power, mechanics, and team decisions into one unforgiving loop.',
    dek: 'A small autonomous vehicle forced perception, control, power, mechanics, and team decisions into one unforgiving loop.',
    heroMedia: {
      src: '/images/authority/race-car/front.jpeg',
      alt: 'Front view of the Brainiacs autonomous race car, showing camera, chassis, and drivetrain.',
      caption: 'The Brainiacs vehicle — camera above the drive.',
    },
    body: [
      {
        kind: 'p',
        text: 'Twenty days is not enough time to make every subsystem elegant. It is enough time to learn which boundaries matter.',
      },
      {
        kind: 'p',
        text: 'The Brainiacs vehicle was built for the 2023 World Robot Olympiad Future Engineers challenge. It had to read the track, react to traffic markers, avoid obstacles, and keep moving reliably. The practical answer was not one powerful computer doing everything. We divided the problem between a Jetson Nano and an Arduino Mega.',
      },
      {
        kind: 'p',
        text: 'The Jetson handled camera work in Python and OpenCV. It extracted the visual events that mattered to driving rather than sending raw imagery downstream. The Arduino owned the time-sensitive control loop: steering, motor commands, and sensor readings that should not pause because a vision frame took longer than expected.',
      },
      { kind: 'h3', text: 'Splitting perception from control' },
      {
        kind: 'p',
        text: 'That division made the system easier to reason about. Computer vision is bursty. Exposure changes, a difficult frame, or a detection step can move execution time around. Steering control needs a predictable cadence. A simple command interface between the two processors isolated those timing behaviors.',
      },
      {
        kind: 'p',
        text: 'The rest of the sensing stack filled gaps the camera could not cover alone. A TCS34725 color sensor supported track and corner logic. An MPU6050 IMU gave the controller another view of motion and heading. PID steering converted error into smoother corrections than a sequence of hard left/right rules.',
      },
      { kind: 'h3', text: 'Calibration became part of the software' },
      {
        kind: 'p',
        text: 'The repository documents camera thresholds, IMU bias, color sensing, and PID tuning because those values were not incidental. They were the difference between code that looked plausible and a vehicle that completed laps.',
      },
      {
        kind: 'p',
        text: 'This kind of build also exposes power and mechanical constraints quickly. A vision model cannot compensate for loose steering geometry. A clean control loop cannot fix voltage sag. The useful engineering work happens at the interfaces: making a camera event specific enough for the controller, making the controller tolerant of noisy sensors, and keeping the wiring and frame serviceable while the design changes daily.',
      },
      {
        kind: 'p',
        text: 'Rafik Hariri University reported that Wassim Ghaddar and I placed third in the Future Engineers category in July 2023, and noted that its teams built their robots from scratch in twenty days.',
      },
      {
        kind: 'p',
        text: 'The placement matters, but the lasting result is the architecture. The project is an end-to-end autonomous system small enough to see all at once: photons become features, features become events, events become steering commands, and those commands meet a physical vehicle with inertia, noise, and imperfect hardware.',
      },
    ],
    sources: [
      {
        label: 'GitHub — autonomous-race-car',
        href: 'https://github.com/Kronbii/autonomous-race-car',
        kind: 'repository',
      },
      {
        label: 'RHU — competition report',
        href: 'https://www.rhu.edu.lb/media-room/news/rhu-engineering-students-win-big-in-the-world-robotics-olympiad',
        kind: 'institution',
      },
    ],
    projectSlug: 'brainiacs-autonomous-race-car',
    topics: ['robotics', 'embedded-systems', 'computer-vision', 'control-systems'],
    keywords: ['WRO Future Engineers', 'Jetson Nano', 'PID steering', 'MPU6050'],
  },
  {
    slug: 'adapting-super-resolution-to-thermal-imagery',
    state: 'ready',
    title: 'Adapting super-resolution to thermal imagery',
    metaTitle: 'Adapting super-resolution to thermal imagery',
    metaDescription:
      'Upscaling a thermal frame is not the same problem as enlarging an RGB photograph, especially when the result must run beside the rest of a perception stack.',
    dek: 'Upscaling a thermal frame is not the same problem as enlarging an RGB photograph, especially when the result must run beside the rest of a perception stack.',
    heroMedia: {
      src: '/images/authority/thermal-super-resolution/x3-showcase.webp',
      alt: 'Side-by-side ×3 thermal super-resolution comparison from the project results directory.',
      caption: '×3 thermal super-resolution — comparison from the results directory.',
    },
    body: [
      {
        kind: 'p',
        text: 'Low-resolution thermal sensors are useful because they see structure that ordinary cameras miss, particularly in darkness and low-contrast scenes. Their price rises sharply with resolution. Super-resolution offers another path: spend computation to recover a more useful signal from the sensor already available.',
      },
      {
        kind: 'p',
        text: 'The catch is that an RGB super-resolution model learns the visual statistics of ordinary photographs. It is rewarded for reconstructing texture, color edges, and detail that may have no thermal meaning. A plausible-looking result can be worse than a soft one if it invents gradients that downstream perception treats as evidence.',
      },
      {
        kind: 'p',
        text: 'This project adapts an Information Multi-Distillation Network to single-channel thermal data. RGB pretraining provides a useful starting point, while a thermal-specific training objective shifts attention toward gradients, contrast, and structure that belong to heat imagery.',
      },
      { kind: 'h3', text: 'Quality has to be measured at every scale' },
      {
        kind: 'p',
        text: 'In evaluation, the model reached 34.2 dB PSNR and 0.840 SSIM at ×2 enlargement, 31.0 dB and 0.757 at ×3, and 29.6 dB and 0.713 at ×4. Those numbers should be read with their scale: the task becomes less constrained as the enlargement factor grows.',
      },
      {
        kind: 'p',
        text: 'They also do not replace visual inspection. Side-by-side crops reveal whether an edge became cleaner or merely sharper, whether small hot objects survive reconstruction, and where the model smooths detail away.',
      },
      { kind: 'h3', text: 'Edge deployment changes the model' },
      {
        kind: 'p',
        text: 'A robotics pipeline rarely gets the entire device to itself. Super-resolution may sit before detection, tracking, or measurement. Latency, memory traffic, and preprocessing therefore matter as much as the neural network.',
      },
      {
        kind: 'p',
        text: 'The deployment work moved inference to FP16 and INT8 and measured the whole system on NVIDIA Jetson AGX Orin: about 45 frames per second. A speed figure means little without the hardware that produced it, so I always give the two together.',
      },
      {
        kind: 'p',
        text: 'That distinction is central to the project. “Real time” is not a property of a model file. It is a property of a complete pipeline on named hardware, at a named input size, while doing the work around inference.',
      },
      {
        kind: 'p',
        text: 'Thermal super-resolution is valuable when it improves a downstream decision without hiding uncertainty. So the next evaluations should be task-based: does a detector find more relevant objects, does measurement remain stable, and where does reconstruction create false confidence? Better-looking frames are not the final objective. Better perception is.',
      },
    ],
    sources: [
      {
        label: 'GitHub — thermal-super-resolution',
        href: 'https://github.com/Kronbii/thermal-super-resolution',
        kind: 'repository',
      },
      {
        label: 'Also on Medium',
        href: 'https://medium.com/@ramikronbi/seeing-in-the-dark-real-time-thermal-super-resolution-that-actually-runs-on-edge-devices-5d95b4bab7b2',
        kind: 'article',
      },
      {
        label: 'Also on DEV',
        href: 'https://dev.to/ramikronbi/seeing-in-the-dark-real-time-thermal-super-resolution-that-actually-runs-on-edge-devices-3nc7',
        kind: 'article',
      },
      {
        label: 'Also on Hashnode',
        href: 'https://ramis-blog.hashnode.dev/seeing-in-the-dark-real-time-thermal-super-resolution-that-actually-runs-on-edge-devices',
        kind: 'article',
      },
      {
        label: 'Also on Substack',
        href: 'https://kronbii.substack.com/p/seeing-in-the-dark-real-time-thermal',
        kind: 'article',
      },
    ],
    projectSlug: 'thermal-super-resolution',
    topics: ['computer-vision', 'edge-ai', 'robotics-perception'],
    keywords: ['thermal super-resolution', 'IMDN', 'Jetson Orin', 'edge deployment'],
  },
  {
    slug: 'what-a-two-axis-light-tracker-teaches-about-pid-control',
    state: 'ready',
    title: 'What a two-axis light tracker teaches about PID control',
    metaTitle: 'What a two-axis light tracker teaches about PID control',
    metaDescription:
      'A small Arduino robot turns control theory into something visible: error, overshoot, noise, saturation, and settling all happen in front of you.',
    dek: 'A small Arduino robot turns control theory into something visible: error, overshoot, noise, saturation, and settling all happen in front of you.',
    body: [
      {
        kind: 'p',
        text: 'A light-tracking robot has a clean objective. Measure where the light is, move two servo axes, and keep the source centered. That simplicity makes it a good control experiment because the interesting behavior cannot hide behind a complex application.',
      },
      {
        kind: 'p',
        text: 'The project uses light sensing to estimate directional error, an Arduino to run the controller, and yaw and pitch servos to move the sensor assembly. I led the software and system architecture, and Wassim Ghaddar handled hardware integration and testing.',
      },
      {
        kind: 'p',
        text: 'The first version of a tracker can be made to move with proportional control. The useful version has to settle. Too much proportional gain creates oscillation. Too little leaves the mechanism slow and hesitant. Integral action can remove persistent bias, but it can also build up while a servo is already at its limit. Derivative action can damp motion, but a noisy sensor can turn it into jitter.',
      },
      { kind: 'h3', text: 'Mechanics are inside the loop' },
      {
        kind: 'p',
        text: 'Servo backlash, limited travel, sensor placement, chassis flex, and wiring are not external annoyances. They change the plant being controlled. A gain set that behaves well on one axis may be wrong for the other because the inertia and friction differ.',
      },
      {
        kind: 'p',
        text: 'Calibration therefore includes more than choosing three numbers. The system needs a defined center, safe mechanical limits, sensible sensor filtering, and an update rate that remains consistent. Debug output helps separate a bad measurement from a bad controller response.',
      },
      {
        kind: 'p',
        text: 'The project includes Arduino source, CAD models, a Proteus simulation, a report, and a real demonstration video. Together they make the control loop inspectable from code to mechanism.',
      },
      {
        kind: 'p',
        text: 'The most useful lesson is that PID tuning is not a one-time formula. It is a conversation between measurement, time, actuation, and the physical system. A two-axis tracker makes that conversation easy to see—and difficult to fake.',
      },
    ],
    sources: [
      {
        label: 'GitHub — PID-light-tracker',
        href: 'https://github.com/Kronbii/PID-light-tracker',
        kind: 'repository',
      },
      {
        label: 'Project demonstration video',
        href: 'https://youtu.be/Ye032oekX0A',
        kind: 'video',
      },
    ],
    projectSlug: 'pid-light-tracking-robot',
    topics: ['robotics', 'embedded-systems', 'control-systems'],
    keywords: ['PID tuning', 'sensor noise', 'servo saturation', 'settling'],
  },
  {
    slug: 'turning-segmented-cracks-into-measurable-paths',
    state: 'ready',
    title: 'Turning segmented cracks into measurable paths',
    metaTitle: 'Turning segmented cracks into measurable paths',
    metaDescription:
      'A segmentation mask says which pixels belong to a crack. Inspection work often needs the next layer: an ordered line, a trace, and measurements that can be compared.',
    dek: 'A segmentation mask says which pixels belong to a crack. Inspection work often needs the next layer: an ordered line, a trace, and measurements that can be compared.',
    heroMedia: {
      src: '/images/authority/fine-crack/test-frame.png',
      alt: 'Test frame from the fine-crack tracing repository showing a thin crack across a rough surface.',
      caption: 'Test frame — a starting point for tracing evaluation.',
    },
    body: [
      {
        kind: 'p',
        text: 'Crack segmentation produces a region. Many inspection tasks need a path. They need to trace where the crack runs, smooth the trace without erasing meaningful bends, compare it with a reference, and export results that can be analyzed outside a notebook.',
      },
      {
        kind: 'p',
        text: 'The fine-crack tracing toolkit packages that work as an installable Python project with a command-line interface. It consumes raw frames and pre-segmented masks, extracts candidate crack points, orders them, optionally fits smoother curves, generates overlays, and exports metrics in CSV and JSON.',
      },
      {
        kind: 'p',
        text: 'The repository exposes several ordering strategies rather than pretending one heuristic fits every geometry: a classic approach, a minimum-spanning-tree path, and a greedy alternative. ORB or Shi-Tomasi features can support corner detection where local structure matters. The output can be evaluated with precision, recall, F1, IoU, mean and maximum distance, and RMS error.',
      },
      { kind: 'h3', text: 'Why packaging matters' },
      {
        kind: 'p',
        text: 'Computer-vision experiments often stop in the state where only the original author can reproduce them. Paths are hard-coded, configuration lives in notebook cells, and evaluation is a collection of plots with no machine-readable record.',
      },
      {
        kind: 'p',
        text: 'Turning the work into a package changes the engineering question. Inputs and outputs need contracts. Configuration needs predictable precedence. Runs need named output directories. Metrics need stable serialization. A command such as `fine-tracing run` or `fine-tracing metrics` becomes a repeatable interface rather than a memory of which cells to execute.',
      },
      {
        kind: 'p',
        text: 'The toolkit is not a crack detector. It begins after segmentation. That boundary is useful: it keeps the package focused on geometry and evaluation while allowing different segmentation models to feed it.',
      },
      {
        kind: 'p',
        text: 'The next serious validation step is dataset-level comparison across crack types, widths, branching patterns, and imaging conditions. The current value is the reproducible bridge from mask to path—the layer required before a thin visual defect can become a measurement.',
      },
    ],
    sources: [
      {
        label: 'GitHub — fine-crack-detection',
        href: 'https://github.com/Kronbii/fine-crack-detection',
        kind: 'repository',
      },
      {
        label: 'Package README and CLI documentation',
        href: 'https://github.com/Kronbii/fine-crack-detection#readme',
        kind: 'documentation',
      },
    ],
    projectSlug: 'fine-crack-tracing-toolkit',
    topics: ['computer-vision', 'infrastructure-inspection', 'open-source-engineering'],
    keywords: ['crack tracing', 'ordered paths', 'IoU', 'segmentation post-processing'],
  },
  {
    slug: 'extracting-medicine-names-from-multilingual-prescriptions',
    state: 'hold',
    title: 'Extracting medicine names from multilingual prescriptions',
    metaTitle: 'Extracting medicine names from multilingual prescriptions',
    metaDescription:
      'A small document-intelligence service for Arabic, English, and French prescriptions—and an example of why medical OCR needs explicit human verification.',
    dek: 'A small document-intelligence service for Arabic, English, and French prescriptions—and an example of why medical OCR needs explicit human verification.',
    body: [
      {
        kind: 'p',
        text: 'Prescriptions are a difficult OCR input. Handwriting is inconsistent, abbreviations are local, medicine names are easy to confuse, and a single page may move between Arabic, English, and French. A technically successful extraction is still not a safe dispensing decision.',
      },
      {
        kind: 'p',
        text: 'This project wraps a Gemini-based extraction step in two practical interfaces: a command-line tool for individual images or directories, and a FastAPI service for integration. The output is structured around medicine names and can be checked against an optional medicine database.',
      },
      { kind: 'h3', text: 'Structure around the model' },
      {
        kind: 'p',
        text: 'The model call is only one part of the system. Batch processing needs bounded parallelism and clear output locations. An API needs validation, error handling, and a predictable result shape. Configuration and credentials must stay outside the repository. The optional database supports normalization and review without pretending that a fuzzy match is clinical truth.',
      },
      {
        kind: 'p',
        text: 'Multilingual input also changes evaluation. A useful test set needs variation in script, handwriting, image quality, rotation, lighting, and the presence of non-medicine text. Accuracy should be reported at the extracted-name level, with separate accounting for missed names, incorrect additions, and uncertain matches.',
      },
      { kind: 'h3', text: 'The safety boundary is part of the product' },
      {
        kind: 'p',
        text: 'This is an extraction prototype. It does not prescribe, dispense, check interactions, or replace a pharmacist or clinician. Every output has to be checked by a person against the source image. Real prescription images may contain personal health information, so public demonstrations should use synthetic or safely redacted material.',
      },
      {
        kind: 'p',
        text: 'Those constraints are not a disclaimer attached after the implementation. They determine which data can be stored, what logs may contain, how results are presented, and whether the interface encourages confirmation.',
      },
      {
        kind: 'p',
        text: 'The broader lesson is simple: applied AI becomes useful when the system around the model makes its uncertainty and limits operational. Returning a list is easy. Returning a list that a person can safely review is the real task.',
      },
    ],
    sources: [
      {
        label: 'GitHub — medical-prescription-OCR',
        href: 'https://github.com/Kronbii/medical-prescription-OCR',
        kind: 'repository',
      },
      {
        label: 'CLI and FastAPI documentation',
        href: 'https://github.com/Kronbii/medical-prescription-OCR#readme',
        kind: 'documentation',
      },
    ],
    projectSlug: 'multilingual-medical-prescription-ocr',
    topics: ['applied-ai', 'health-technology', 'document-intelligence'],
    keywords: ['medical OCR', 'multilingual', 'human verification', 'FastAPI'],
  },
  {
    slug: 'designing-election-information-for-verifiability',
    state: 'ready',
    title: 'Designing election information for verifiability',
    metaTitle: 'Designing election information for verifiability',
    metaDescription:
      'In civic technology, the source and history of a fact matter as much as the interface that displays it.',
    dek: 'In civic technology, the source and history of a fact matter as much as the interface that displays it.',
    heroMedia: {
      src: '/images/authority/daleel/hero.jpeg',
      alt: 'Daleel platform hero image from the project repository.',
      caption: 'Daleel — the project’s hero image from the public repository.',
    },
    body: [
      {
        kind: 'p',
        text: 'Daleel—Arabic for “guide”—is a Lebanese parliamentary-election information project built around a simple principle: political information should be inspectable. A candidate profile or district record is more useful when a reader can see where it came from and when it changed.',
      },
      {
        kind: 'p',
        text: 'That requirement changes the architecture. An ordinary content system optimizes for the current value. Daleel’s design treats history and sources as first-class data. Its public repository describes archived sources, append-only records, and immutable data models intended to preserve a verifiable trail.',
      },
      { kind: 'h3', text: 'Neutrality needs mechanisms' },
      {
        kind: 'p',
        text: 'Calling a platform independent does not make it neutral. The product has to show its work. Source links, archived evidence, consistent fields, and change history give readers tools to evaluate a record without trusting the publisher blindly.',
      },
      {
        kind: 'p',
        text: 'The platform is multilingual in Arabic, English, and French. That is not a cosmetic translation layer in Lebanon; it affects names, search, layout direction, source availability, and the risk of different language versions drifting apart.',
      },
      {
        kind: 'p',
        text: 'The documented stack pairs a Next.js frontend with an Express backend and Prisma/PostgreSQL. Authentication, CSRF protection, rate limiting, and immutable models support the public information layer. The security work matters for the same reason: a single unauthorized change would undermine the central promise.',
      },
      { kind: 'h3', text: 'What Daleel is not' },
      {
        kind: 'p',
        text: 'Daleel is not an official election authority, and I don’t present its dataset as complete or live. It is an independent civic-technology project: an engineering approach to election information you can check for yourself.',
      },
      {
        kind: 'p',
        text: 'The hard work ahead is institutional as much as technical: source standards, correction workflows, contributor governance, legal review, and a visible policy for disputed information. A database can preserve history, but people still decide what enters it and how errors are handled.',
      },
      {
        kind: 'p',
        text: 'The project is valuable because it makes those decisions explicit. For high-trust public information, a polished profile page is not enough. Provenance is a product feature.',
      },
    ],
    sources: [
      { label: 'GitHub — daleel', href: 'https://github.com/Kronbii/daleel', kind: 'repository' },
      {
        label: 'TECHNICAL.md',
        href: 'https://github.com/Kronbii/daleel/blob/main/TECHNICAL.md',
        kind: 'documentation',
      },
    ],
    projectSlug: 'daleel-lebanese-election-information',
    topics: ['civic-technology', 'information-integrity', 'full-stack-systems'],
    keywords: ['civic technology', 'append-only', 'provenance', 'Lebanese elections'],
  },
  {
    slug: 'building-an-adaptive-motorcycle-theory-trainer-for-lebanon',
    state: 'hold',
    title: 'Building an adaptive motorcycle theory trainer for Lebanon',
    metaTitle: 'Building an adaptive motorcycle theory trainer for Lebanon',
    metaDescription:
      'An Arabic RTL study tool that keeps progress in the browser and spends practice time on the questions a learner is most likely to miss.',
    dek: 'An Arabic RTL study tool that keeps progress in the browser and spends practice time on the questions a learner is most likely to miss.',
    body: [
      {
        kind: 'p',
        text: 'The Lebanese Motorcycle Theory Exam Trainer is a focused React application, not an online course platform. It contains 251 multiple-choice questions, including 101 road-sign questions with extracted sign images. Exam mode selects 30 questions and uses a 25/30 passing threshold. Practice mode remembers weak and recently missed material.',
      },
      { kind: 'h3', text: 'Random is not the same as useful' },
      {
        kind: 'p',
        text: 'Pure random selection can repeat familiar questions while leaving large parts of a bank unseen. The trainer uses coverage-aware selection so new attempts introduce unseen material before over-drilling what the learner already knows. Missed and weaker questions receive more attention, and a review mode makes mistakes easy to revisit.',
      },
      {
        kind: 'p',
        text: 'The application stores progress in localStorage. That keeps the tool usable without an account or backend and avoids collecting personal study history. It also means progress belongs to one browser unless the learner exports or moves it through a future feature.',
      },
      {
        kind: 'p',
        text: 'Arabic right-to-left layout is built into the experience rather than applied at the end. Question flow, answer alignment, numbers, road-sign images, and mixed-script labels all need deliberate handling. A technically correct translation can still feel broken if directionality is inconsistent.',
      },
      { kind: 'h3', text: 'What it is not' },
      {
        kind: 'p',
        text: 'The trainer uses the documented Lebanese motorcycle question set, but it is not an official government app, and no government body endorses it. Rules and exam procedures can change, so the question source and its update date should always be visible.',
      },
      {
        kind: 'p',
        text: 'The project shows how a small local-first interface can improve a very specific learning loop. It does not need profiles, streaks, social features, or an AI tutor to be useful. It needs good question coverage, clear feedback, accurate content, and a respectful Arabic interface.',
      },
    ],
    sources: [
      {
        label: 'GitHub — lebanese-driving-test',
        href: 'https://github.com/Kronbii/lebanese-driving-test',
        kind: 'repository',
      },
      {
        label: 'Application README and question data',
        href: 'https://github.com/Kronbii/lebanese-driving-test#readme',
        kind: 'documentation',
      },
    ],
    projectSlug: 'lebanese-motorcycle-theory-trainer',
    topics: ['education-technology', 'lebanon', 'frontend-engineering'],
    keywords: ['adaptive practice', 'Arabic RTL', 'localStorage progress', 'motorcycle exam'],
  },
  {
    slug: 'building-a-local-first-ai-support-triage-council',
    state: 'hold',
    title: 'Building a local-first AI support triage council',
    metaTitle: 'Building a local-first AI support triage council',
    metaDescription:
      'An internal support workflow where an LLM proposes structure, deterministic rules enforce policy, and a human keeps the final say.',
    dek: 'An internal support workflow where an LLM proposes structure, deterministic rules enforce policy, and a human keeps the final say.',
    body: [
      {
        kind: 'p',
        text: 'The AI Customer Support Council is a self-hosted technical-assessment project built for Valsoft Corporation. It is an internal admin console for synthetic B2B support requests, not a customer-facing help desk.',
      },
      {
        kind: 'p',
        text: 'The application takes a submission through intake, machine-assisted triage, deterministic routing and escalation, human review, persistence, and structured export. Its four screens—login, dashboard, submissions, and submission detail—are deliberately narrow because the product has one operator and one job.',
      },
      { kind: 'h3', text: 'The LLM is one component, not the workflow' },
      {
        kind: 'p',
        text: 'An LLM can turn messy text into proposed categories, urgency, and rationale. It should not quietly become the policy engine. The project separates model output from deterministic rules such as confidence thresholds and escalation conditions. A low-confidence response can be sent for review no matter how fluent the explanation sounds.',
      },
      {
        kind: 'p',
        text: 'State is stored in PostgreSQL. Background work runs through Redis and RQ. The backend uses FastAPI, Pydantic, SQLAlchemy, and Alembic; the frontend uses React, TypeScript, Vite, TanStack Query, React Hook Form, and Zod. Ollama with a local model is the default provider, with an optional OpenAI-compatible endpoint.',
      },
      {
        kind: 'p',
        text: 'That local-first default matters for privacy, cost control, and repeatability. It also creates operational responsibilities: model availability, queue state, migrations, auditability, and a clear distinction between a failed inference and a failed support request.',
      },
      { kind: 'h3', text: 'Human review is a designed state' },
      {
        kind: 'p',
        text: 'The reviewer needs to see the original submission, the model’s proposal, confidence, and the rules that changed or escalated it. Accepting or overriding a result should be explicit. The export must reflect the reviewed state, not a hidden intermediate prediction.',
      },
      {
        kind: 'p',
        text: 'The best pattern here is not “replace support staff with AI.” It is to make a noisy intake queue easier to inspect while keeping policy deterministic and decisions attributable. The council metaphor works only when disagreement, uncertainty, and review remain visible.',
      },
    ],
    sources: [
      {
        label: 'GitHub — AI-customer-support-council',
        href: 'https://github.com/Kronbii/AI-customer-support-council',
        kind: 'repository',
      },
      {
        label: 'Architecture and testing documentation',
        href: 'https://github.com/Kronbii/AI-customer-support-council#readme',
        kind: 'documentation',
      },
    ],
    projectSlug: 'local-first-ai-support-triage',
    topics: ['applied-ai', 'full-stack-systems', 'local-first-software'],
    keywords: ['local-first', 'LLM triage', 'Ollama', 'PostgreSQL', 'human review'],
  },
  {
    slug: 'designing-an-offline-first-personal-finance-desktop-app',
    state: 'hold',
    title: 'Designing an offline-first personal finance desktop app',
    metaTitle: 'Designing an offline-first personal finance desktop app',
    metaDescription:
      'REE treats personal finance as a private desktop workflow: fast entry, local storage, and enough structure to understand where money moves.',
    dek: 'REE treats personal finance as a private desktop workflow: fast entry, local storage, and enough structure to understand where money moves.',
    heroMedia: {
      src: '/images/authority/ree-finance/image2.jpeg',
      alt: 'REE screenshot showing monthly analysis and category breakdown views.',
      caption: 'REE — monthly analysis and category breakdown.',
    },
    body: [
      {
        kind: 'p',
        text: 'Personal finance tools often begin with the dashboard. REE began with the records behind it: wallets, income, expenses, transfers, subscriptions, debts, savings goals, and the repeated work of entering them.',
      },
      {
        kind: 'p',
        text: 'The application is built in Flutter for desktop. It supports multiple wallets, categorized transactions, bulk entry, recurring-payment tracking, debts in both directions, savings goals, and monthly and yearly analysis. The repository documents a clean architecture with separate data, domain, and presentation concerns and local SQLite storage.',
      },
      { kind: 'h3', text: 'Desktop-first changes the interaction' },
      {
        kind: 'p',
        text: 'A desktop finance tool should respect keyboards, larger tables, and the fact that a person may enter many records in one session. Bulk entry is not an advanced feature hidden in settings; it is a core workflow. The interface can use space for comparison and history without turning every value into a decorative card.',
      },
      {
        kind: 'p',
        text: 'Offline-first also makes the ownership model clear. The main record is local. The app can start and remain useful without an account or continuous network connection. Backup and export become essential because local ownership without recovery is fragile.',
      },
      { kind: 'h3', text: 'Architecture follows trust' },
      {
        kind: 'p',
        text: 'Finance data is sensitive even when the application is not connected to a bank. Storage paths, backups, logs, and exports need predictable behavior. Separating domain logic from the interface makes calculations testable and reduces the risk that a presentation change alters financial rules.',
      },
      {
        kind: 'p',
        text: 'A visual style alone does not make finance easier. The stronger idea is operational: keep the data close, make repetitive work efficient, and let insights emerge from records the user can inspect.',
      },
      {
        kind: 'p',
        text: 'The next quality bar is long-term reliability—migration tests, backup restoration, import validation, and clear handling of rounding and currency. A personal finance app earns trust slowly, one predictable operation at a time.',
      },
    ],
    sources: [
      {
        label: 'GitHub — personal-finance-tracker',
        href: 'https://github.com/Kronbii/personal-finance-tracker',
        kind: 'repository',
      },
      {
        label: 'Architecture, storage, and build documentation',
        href: 'https://github.com/Kronbii/personal-finance-tracker#readme',
        kind: 'documentation',
      },
    ],
    projectSlug: 'ree-personal-finance-tracker',
    topics: ['local-first-software', 'flutter', 'product-engineering'],
    keywords: ['personal finance', 'Flutter desktop', 'offline-first', 'SQLite'],
  },
  {
    slug: 'rebuilding-my-finance-app-around-local-first-sync',
    state: 'hold',
    title: 'Rebuilding my finance app around local-first sync',
    metaTitle: 'Rebuilding my finance app around local-first sync',
    metaDescription:
      'Juno, the new version of Rami Kronbi’s finance app, keeps every entry on the device first and syncs between Linux and iPhone only if you ask it to. How the sync, the logging, and the imports work.',
    dek: 'Juno keeps the data on the device first and syncs only if you ask. Most of the work went into making that boring and safe.',
    heroMedia: {
      src: '/images/authority/juno/insights.webp',
      alt: 'Juno’s Insights screen on the desktop with demo data: the month’s spending by category, a day-by-day calendar, and what changed this month.',
      caption: 'Insights on the desktop, with demo data.',
    },
    body: [
      {
        kind: 'p',
        text: 'Juno is the new version of my finance app. The first one, REE, was a Flutter desktop app with local storage. Juno keeps that local-first core and adds an iPhone app, optional sync between the phone and the Linux desktop, and ways to log an expense without opening the app.',
      },
      {
        kind: 'p',
        text: 'Every entry is marked Personal or Household, so a shared household can see how much goes to each. Without any configuration Juno runs local-only; sync is something you switch on.',
      },
      { kind: 'h2', text: 'Sync that converges' },
      {
        kind: 'p',
        text: 'Sync runs through Supabase, and its rules are deliberately simple. Every row carries an updated-at time and a soft-delete marker, so a deletion is a change like any other rather than a row that silently vanishes. Each round pushes the device’s local changes, then pulls everything the server has changed since a per-table cursor that the server itself stamps. Conflicts resolve last-write-wins.',
      },
      {
        kind: 'p',
        text: 'Seeded data needs one more rule. Default categories and the occurrences of recurring entries are created on each device, and if each device gave them random ids, the first sync would produce two of everything. They get deterministic ids instead, so two devices that create the same category or the same rent payment converge on one row rather than duplicating it. The sync engine itself is written so it can run against a fake remote in tests.',
      },
      { kind: 'h2', text: 'Logging without opening the app' },
      {
        kind: 'p',
        text: 'A finance tracker is only as good as the entries that actually make it in. On iPhone, Juno exposes App Intents, so Siri, Shortcuts, Back Tap, and the Action Button can all log an entry, and a home-screen widget logs with one tap. Those entries land in a shared inbox, and Juno imports them the next time it launches. On the desktop, N opens a new entry and Enter saves it.',
      },
      { kind: 'h2', text: 'Imports that remember' },
      {
        kind: 'p',
        text: 'Juno guesses the columns of a bank CSV, learns your categories, skips rows it has already seen, and lets you undo an import. Excel workbooks and Notion exports come in the same way, with any Category column matched to your own categories, and everything exports back out to CSV.',
      },
      {
        kind: 'p',
        text: 'Currencies matter in Lebanon, where accounts can be in Lebanese pounds or dollars. An account can hold LBP, EUR, or another currency at a rate you set, totals stay in USD, and each entry keeps the USD value it was logged at, so a later change in the rate does not rewrite the past.',
      },
      { kind: 'h2', text: 'Checked like CI, on every push' },
      {
        kind: 'p',
        text: 'One script runs exactly what CI runs: generated code, formatting, analysis with infos counted as failures, and every test, and a git hook can run it on each push. A screenshot test renders every screen at phone and desktop sizes, light and dark; the screenshots on the project page come from it, using the app’s demo data.',
      },
      {
        kind: 'p',
        text: 'The look borrows from three earlier projects: the instrument-style frame of Bikey, with structure drawn in hairlines and every figure set in mono; the type system of Lazpress; and the warm dark palette of Tayseer, burgundy on near-black with cream ink.',
      },
    ],
    sources: [
      { label: 'GitHub — juno', href: 'https://github.com/Kronbii/juno', kind: 'repository' },
      {
        label: 'iPhone setup: widget, Siri, and Shortcuts',
        href: 'https://github.com/Kronbii/juno/blob/main/docs/ios-setup.md',
        kind: 'documentation',
      },
    ],
    projectSlug: 'juno',
    topics: ['local-first-software', 'flutter', 'product-engineering'],
    keywords: ['local-first', 'Flutter', 'Supabase', 'sync', 'personal finance', 'App Intents'],
  },
  {
    slug: 'building-real-time-lebanese-sign-language-translation',
    state: 'ready',
    title: 'Building real-time Lebanese Sign Language translation',
    metaTitle: 'Building real-time Lebanese Sign Language translation',
    metaDescription: 'OmniSign, a real-time Lebanese Sign Language translation system, and why the dataset was the hard part.',
    dek: 'Lebanese Sign Language has a data problem before it has a model problem.',
    body: [
      {
        kind: 'p',
        text: 'Lebanese Sign Language has a data problem before it has a model problem. General sign-language datasets do not automatically transfer to local vocabulary, signing patterns, or the communication settings in which a system will be used.',
      },
      {
        kind: 'p',
        text: 'OmniSign is a real-time translation system spanning camera input, visual recognition, language output, and deployment across mobile, web, and offline embedded environments. We built a 300,000-image dataset, reached 95–97% accuracy in development at roughly 45 frames per second, and piloted it in two Beirut coffee shops and one church.',
      },
      {
        kind: 'p',
        text: 'The team’s project page gives different numbers: 40,000 sign samples collected from 21 Lebanese sign-language schools, 50,000 after augmentation, and 80,000 landmark records. We collected the dataset ourselves, and the counts differ because they measure different things, samples versus images.',
      },
      {
        kind: 'p',
        text: 'The important engineering question is not only whether a classifier recognizes a held-out image. A usable translator must remain responsive across different signers, backgrounds, cameras, lighting, and signing speeds. Dataset balance and consent matter. So do uncertainty handling and the decision to ask for a repeated sign instead of producing a confident wrong translation.',
      },
      {
        kind: 'p',
        text: 'OmniSign was a team project. Layth Ayache led the AI and data work; Nour El Hariri, Tayseer Laz, and Abou Baker Hussien Al Khatib were on the team; Dr. Oussama Mustapha supervised; I was a co-founder and the computer vision engineer. The project won the Public Choice first prize at the 2025 National FYP Demo Day.',
      },
    ],
    sources: [
      { label: 'Team project page — Layth Ayache', href: 'https://laythayache.com/projects/omnisign', kind: 'article' },
      { label: 'Team project page — Tayseer Laz', href: 'https://tayseerlaz.com/work/omnisign/', kind: 'article' },
      {
        label: 'Also on Medium',
        href: 'https://medium.com/@ramikronbi/we-built-sign-language-ai-for-a-language-with-almost-no-dataset-c4a60df1cf96',
        kind: 'article',
      },
      {
        label: 'Also on DEV',
        href: 'https://dev.to/ramikronbi/we-built-sign-language-ai-for-a-language-with-almost-no-dataset-heres-what-that-actually-looks-kem',
        kind: 'article',
      },
    ],
    projectSlug: 'omnisign-lebanese-sign-language',
    topics: ['computer-vision', 'edge-ai', 'embedded-systems'],
    keywords: ['sign language', 'edge inference', 'dataset governance'],
  },
  {
    slug: 'connecting-posture-estimation-to-a-motorized-desk',
    state: 'ready',
    title: 'Connecting posture estimation to a motorized desk',
    metaTitle: 'Connecting posture estimation to a motorized desk',
    metaDescription: 'How the BEMO smart desk, a senior graduation project, closed a physical loop between posture sensing, ESP32 control, and motorized height and tilt.',
    dek: 'A posture-aware desk closes a physical loop between vision, control, and motion.',
    body: [
      {
        kind: 'p',
        text: 'A posture-aware desk closes a physical loop: a camera estimates how someone is sitting, software decides whether the posture has drifted, and motors change the work surface. The prototype combines computer vision, ESP32 control, motorized height and tilt, immediate LED feedback, and a dashboard for longer-term patterns.',
      },
      {
        kind: 'p',
        text: 'The system is interesting because a posture model cannot be treated as an isolated prediction. Camera placement changes the visible geometry. Desk movement changes the camera view. A false correction can be distracting or unsafe. The control policy therefore needs dead bands, mechanical limits, slow transitions, and a manual override.',
      },
      {
        kind: 'p',
        text: 'The Smart Interactive Desk, codenamed BEMO, was our senior graduation project at Rafik Hariri University: Bassam Kousa, Ali Daaboul, Mohamad Berjawi, Mohamad Hariri, and me as team lead. It won the Best Senior Project award. The code and a demo video are linked below; the team’s formal report and test results live outside the repository.',
      },
    ],
    sources: [
      { label: 'GitHub — smart-interactive-desk', href: 'https://github.com/Kronbii/smart-interactive-desk', kind: 'repository' },
      { label: 'Demo video', href: 'https://youtu.be/5TPmpPc6rjY', kind: 'video' },
    ],
    projectSlug: 'posture-aware-classroom-desk',
    topics: ['embedded-systems', 'computer-vision', 'robotics-perception'],
    keywords: ['posture estimation', 'ESP32', 'motorized desk'],
  },
  {
    slug: 'running-fod-detection-on-a-uav',
    state: 'ready',
    title: 'Running FOD detection on a UAV',
    metaTitle: 'Running FOD detection on a UAV — YOLOv11 onboard a Jetson',
    metaDescription:
      'How Rami Kronbi runs a lightweight YOLOv11 foreign-object-debris detector onboard a Jetson at about 30 FPS in a simulated runway-inspection UAV, trained on online and synthetic data and cleaned up with similarity matching and false-positive filtering.',
    dek: 'Looking for debris on a runway from a drone means finding small things on a big surface, from a camera that never stops moving, with only the compute the drone can carry.',
    body: [
      {
        kind: 'p',
        text: 'Foreign object debris, or FOD, is anything loose on a runway that shouldn’t be there. This is my own simulation project, ongoing since 2026: a runway-inspection UAV that runs a lightweight FOD detector onboard, on a Jetson, at about 30 frames per second.',
      },
      { kind: 'h2', text: 'Why onboard' },
      {
        kind: 'p',
        text: 'Running the detector on the drone keeps the whole chain on the aircraft: the camera, the model, and the filtering that decides what counts as a find. The price is that the model has to be small enough to keep up on the compute a drone can carry. That is why it is a lightweight YOLOv11 detector, and about 30 frames per second is what it runs at onboard.',
      },
      { kind: 'h2', text: 'The data' },
      {
        kind: 'p',
        text: 'I trained the detector on online and synthetically generated data, and it reached 75–80% model accuracy. Images of debris lying on runways are not easy to find in quantity, and synthetic data is one way to fill out a training set for an object that is small, varied, and rare.',
      },
      { kind: 'h2', text: 'More than a stream of boxes' },
      {
        kind: 'p',
        text: 'A detector on its own returns a box for every frame where it thinks it sees something. From a moving drone, the same object turns up frame after frame, and pavement texture, markings, and shadows can look like debris for a moment. So on top of the raw detections I added similarity matching and false-positive filtering, so that what comes out of a flight is a shorter list of likely FOD rather than every box the model drew.',
      },
      { kind: 'h2', text: 'Testing in simulation' },
      {
        kind: 'p',
        text: 'The in-flight tests simulate runway conditions. Simulation lets me repeat a test under the same conditions, and it is also the project’s limit: the 75–80% describes the model on online and synthetic data, and real debris on a real runway is the test still ahead.',
      },
    ],
    sources: [
      {
        label: 'Ultralytics YOLO11',
        href: 'https://docs.ultralytics.com/models/yolo11',
        kind: 'documentation',
        note: 'The detector family the onboard model comes from.',
      },
    ],
    projectSlug: 'runway-inspection-uav',
    topics: ['edge-ai', 'computer-vision', 'robotics-perception'],
    keywords: [
      'FOD detection',
      'foreign object debris',
      'YOLOv11',
      'NVIDIA Jetson',
      'UAV',
      'synthetic data',
      'edge inference',
    ],
  },
  {
    slug: 'lessons-from-an-edge-emotion-recognition-prototype',
    state: 'ready',
    title: 'Lessons from an edge emotion-recognition prototype',
    metaTitle: 'Lessons from an edge emotion-recognition prototype for children with autism',
    metaDescription:
      'Rami Kronbi on building a real-time emotion-recognition pipeline on Jetson Orin Nano for children with autism: combining CALMED, Kaggle, and other data, reaching about 92% development accuracy, and keeping it a support tool rather than a diagnosis.',
    dek: 'Most of the work in an emotion-recognition prototype is in the data, and most of the care is in what you let the output mean.',
    body: [
      {
        kind: 'p',
        text: 'Between 2022 and 2023 I developed a real-time emotion-recognition pipeline for children with autism. It pairs facial landmarks with a convolutional neural network and runs on a Jetson Orin Nano, a small computer that can sit right next to the camera.',
      },
      { kind: 'h2', text: 'The data came first' },
      {
        kind: 'p',
        text: 'I combined image and video data from CALMED, Kaggle, and other sources and cleaned it into one training set. CALMED is the one built for this problem: a dataset for emotion detection in children with autism. Combining sources like these is most of the work. They label emotions in their own ways and record faces in different conditions, and they have to be cleaned into something one model can learn from.',
      },
      {
        kind: 'p',
        text: 'With the data combined and cleaned, the pipeline reached about 92% development accuracy.',
      },
      { kind: 'h2', text: 'Running it live' },
      {
        kind: 'p',
        text: 'The Jetson Orin Nano runs the pipeline in real time: facial landmarks describe the shape of the face, and the CNN classifies the expression. The code for the network is public. It trains a small Keras CNN on 48×48 grayscale face crops, runs it on a live camera feed, and evaluates it with a confusion matrix and a classification report. The dataset itself isn’t included.',
      },
      { kind: 'h2', text: 'What the output means' },
      {
        kind: 'p',
        text: 'A facial expression is not a direct reading of what someone feels, and about 92% on development data says how the model does on that data, not how it will do with one child in one room. So I built it as a support tool: a signal that can help the people around a child, never a diagnosis.',
      },
      { kind: 'h2', text: 'Afterwards' },
      {
        kind: 'p',
        text: 'The prototype and the concept were later acquired following a Gulf-region competition.',
      },
    ],
    sources: [
      {
        label: 'GitHub — CNN-Emotion-Detection',
        href: 'https://github.com/Kronbii/CNN-Emotion-Detection',
        kind: 'repository',
        note: 'The CNN training, live-test, and evaluation code.',
      },
      {
        label: 'CALMED dataset paper',
        href: 'https://arxiv.org/abs/2307.13706',
        kind: 'article',
        note: 'A dataset for emotion detection in children with autism.',
      },
    ],
    projectSlug: 'emotion-recognition-autism-support',
    topics: ['edge-ai', 'computer-vision'],
    keywords: ['emotion recognition', 'autism', 'Jetson Orin Nano', 'CNN', 'CALMED', 'edge inference'],
  },
  {
    slug: 'what-four-years-of-technical-mentoring-taught-me',
    state: 'ready',
    title: 'What four years of technical mentoring taught me',
    metaTitle: 'What four years of technical mentoring taught me',
    metaDescription: 'Four years as lead technical organizer for NASA Space Apps Beirut, and what structured mentoring does for a hackathon team.',
    dek: 'Technical mentoring is not solving the participant’s project for them.',
    body: [
      {
        kind: 'p',
        text: 'From 2021 to 2024 I was lead technical organizer for NASA Space Apps in Beirut, supporting roughly 250–400 participants a year with a volunteer team of 10–15 people. The work included technical bootcamps using NASA datasets, problem selection, prototyping, competition requirements, and submission strategy. Over three consecutive years, teams we supported earned six Global Top 10 placements. Rafik Hariri University’s 2022 report on the event names me as the university’s student volunteer.',
      },
      {
        kind: 'p',
        text: 'The useful lesson is that technical mentoring is not solving a participant’s project for them. It is building enough structure that a team can narrow a problem, understand the evidence, choose a tractable prototype, and tell the truth about what it achieved in a short weekend.',
      },
      {
        kind: 'p',
        text: 'The placements belong to the teams and the wider community. Mentoring created the conditions, not the results.',
      },
    ],
    sources: [
      { label: 'RHU — RHU team makes it to the final stages of NASA Space Apps (2022)', href: 'https://www.rhu.edu.lb/media-room/news/rhu-team-makes-it-to-the-final-stages-of-the-nasa-space-apps-annual-international-competition', kind: 'institution' },
    ],
    projectSlug: '',
    topics: [],
    keywords: ['NASA Space Apps', 'technical mentoring', 'hackathon'],
  },
  {
    slug: 'building-technology-around-crisis-response-operations',
    state: 'ready',
    title: 'Building technology around crisis-response operations',
    metaTitle: 'Building technology around crisis-response operations',
    metaDescription: 'How NASNA, a humanitarian coordination platform for displaced people in Lebanon, was designed around verification, matching, offline intake, and privacy.',
    dek: 'In crisis response, the interface is only one part of the system.',
    body: [
      {
        kind: 'p',
        text: 'NASNA (ناسنا) is a humanitarian coordination platform connecting displaced and war-affected people in Lebanon with NGOs, donors, and volunteers. I co-founded it in 2024, during the autumn displacement crisis, and worked on it through 2025 as AI engineer and developer alongside Mohammad Homsi (full-stack developer and tech lead), Abed El-Fattah Amouneh (product manager and frontend developer), and Lynn El Solh (multimedia designer). The platform is open source under AGPL-3.0 and live at nasna.world.',
      },
      {
        kind: 'p',
        text: 'In crisis response, the interface is only one part of the system. Requests need verification, triage, safe matching, follow-up, and careful handling of personal information. Supply changes quickly. Volunteers have uneven availability. A database can make coordination more legible, but it can also create risk if access, consent, retention, and escalation are not designed around vulnerable people.',
      },
      {
        kind: 'p',
        text: 'The platform is a three-sided network. Displaced families are registered by field agents through a multi-step intake form, or register themselves through a public form; the form collects household composition, needs, urgency, and special needs, and requires explicit consent that cannot be bypassed. NGOs define a coverage profile, the areas and aid types they serve and their maximum case load, and receive only the pending cases that match it. Admins run a dispatch center with urgency indicators, stale-case highlighting after 24 hours, and an operations map of Lebanon.',
      },
      {
        kind: 'p',
        text: 'Two design decisions matter most under crisis conditions. The intake form works offline: if a field agent loses connectivity, submissions are saved locally in the browser and synced when the connection returns. And personal data is treated as the main risk: the displaced person’s contact number is never exposed in the NGO case feed, duplicate registrations are detected by phone number before submission, and the repository documents rules against personal information in logs and URLs.',
      },
      {
        kind: 'p',
        text: 'The stack is React 19 and TypeScript on Firebase (Firestore, Auth, Cloud Functions, Hosting), with Arabic, English, and French interfaces built right-to-left first. My part was the AI and engineering side of the product alongside the team; the tech lead and product roles belonged to Mohammad Homsi and Abed El-Fattah Amouneh.',
      },
      {
        kind: 'p',
        text: 'What the platform does not do is replace the people doing the work. It gives verification, triage, matching, and follow-up a shared structure. The questions I still want to answer are about scale and outcomes: how many cases moved through the pipeline, and what we learned from the ones that stalled.',
      },
    ],
    sources: [
      { label: 'GitHub — nasna', href: 'https://github.com/1homsi/nasna', kind: 'repository' },
      { label: 'nasna.world', href: 'https://nasna.world', kind: 'demo' },
    ],
    projectSlug: '',
    topics: [],
    keywords: ['crisis response', 'operations', 'privacy'],
  },
  {
    slug: 'turning-physics-outreach-into-a-multi-university-program',
    state: 'ready',
    title: 'Turning physics outreach into a multi-university program',
    metaTitle: 'Turning physics outreach into a multi-university program — National Physics Day',
    metaDescription:
      'How Rami Kronbi, society lead of the Physics & Astronomy Club in Beirut from 2021 to 2024, founded National Physics Day across four universities, built hands-on double-slit, electrical, and telescope experiments, and made demonstrations for Moe Abbas’s outreach.',
    dek: 'Good science outreach gives people something they can manipulate and question.',
    body: [
      {
        kind: 'p',
        text: 'From 2021 to 2024 I was society lead of the Physics & Astronomy Club in Beirut. In that time I founded National Physics Day and led it across four universities. I expanded the club’s hands-on physics and astronomy activities with double-slit, electrical, and telescope experiments, and I developed demonstrations for the LAU presentations and Cosmic Dome outreach of Mohamad (Moe) Abbas, an astrophysics researcher at NYU Abu Dhabi.',
      },
      { kind: 'h2', text: 'Something to manipulate and question' },
      {
        kind: 'p',
        text: 'Good science outreach gives people something they can manipulate and question. A double-slit experiment turns an abstract account of interference into a pattern you can see: light through two narrow openings lands as bright and dark bands, not two simple stripes, and changing the slits changes the pattern. An electrical experiment lets someone change a circuit with their own hands and watch what happens. A telescope makes scale and observation immediate in a way a slide cannot.',
      },
      { kind: 'h2', text: 'One day, four universities' },
      {
        kind: 'p',
        text: 'Founding National Physics Day meant taking that idea beyond one club and one campus, and leading it across four universities. An experiment at an outreach event has to work again and again, survive curious hands, and be explainable in a minute to someone who has never thought about interference. That is an engineering problem as much as a teaching one.',
      },
      { kind: 'h2', text: 'Demonstrations for someone else’s talk' },
      {
        kind: 'p',
        text: 'Building demonstrations for Moe Abbas’s presentations at LAU and for the Cosmic Dome outreach was a different kind of work. A demonstration inside someone else’s talk has to show one idea clearly at the moment it comes up, then get out of the way of the story the speaker is telling.',
      },
    ],
    sources: [],
    projectSlug: '',
    topics: [],
    keywords: [
      'physics outreach',
      'National Physics Day',
      'astronomy outreach',
      'double-slit experiment',
      'telescope',
      'science communication',
      'Beirut',
    ],
  },
  {
    slug: 'what-small-upstream-fixes-teach-about-firmware',
    state: 'ready',
    title: 'What small upstream fixes teach about firmware',
    metaTitle: 'What small upstream fixes teach about firmware',
    metaDescription: 'Five pull requests to Betaflight, PX4, and OpenFront, and the discipline they share: make the mechanism explicit, change the smallest surface, and test it.',
    dek: 'Five pull requests to Betaflight, PX4, and OpenFront, and the habit they share: make the mechanism explicit before touching the code.',
    body: [
      {
        kind: 'p',
        text: 'Most of what I have learned from large open-source codebases came from fixing very small things in them. A firmware project like Betaflight or an estimator like PX4’s EKF2 is too large to hold in one head, so each fix begins the same way: read one path until the mechanism is explicit, then change as little as possible.',
      },
      { kind: 'h2', text: 'A debug channel with two meanings' },
      {
        kind: 'p',
        text: 'In Betaflight, the FrSky and Redpine CC2500 receiver drivers both wrote the same debug channel, and indices 0, 1, and 2 meant different things in each. For FrSky, debug[1] was a count of missing packets; for Redpine it was a signed bind offset or a raw RSSI byte. Because a blackbox log stores only the numeric debug mode and not the active protocol, nothing reading the log afterwards could tell the layouts apart. The fix in #15706 gives Redpine its own debug mode. It was merged the same day.',
      },
      { kind: 'h2', text: 'A read that returned success early' },
      {
        kind: 'p',
        text: 'The W25M flash wrapper split reads at die boundaries and assumed the die driver returned the whole requested length. The W25N01G die driver clamps every transfer to a NAND page and returns the clamped count. The wrapper checked only that the count was non-zero, advanced by the full length it had asked for, and reported success, so any read across a page boundary left the tail of the buffer unfilled. #15705 honours the returned count. It is open at the time of writing.',
      },
      { kind: 'h2', text: 'A timeout that was never refreshed' },
      {
        kind: 'p',
        text: 'In PX4’s EKF2, when a range finder was the only active height source, successful range height fusion did not refresh the estimator’s global height-fusion timestamp. The estimator then treated all height sources as timed out and reset altitude every five seconds. #28286 refreshes the timestamp on successful fusion and adds a regression test that failed before the change and passed after it. The maintainers closed it without merging. I include it here because the diagnosis and the test are the useful part, and because a record of contributions that lists only accepted ones is not honest.',
      },
      { kind: 'h2', text: 'The same discipline in a browser HUD' },
      {
        kind: 'p',
        text: 'OpenFront is a browser strategy game, far from firmware, but the two merged fixes there followed the same pattern. #4868 makes the end-of-game timer warning progressive and adds focused tests for each threshold. #4985 stops iOS double-tap zoom from leaving the HUD stuck off-screen, using the declarative touch-action property first and a narrow touchend guard only as a fallback, instead of blocking touch events globally as the issue had suggested.',
      },
      {
        kind: 'p',
        text: 'None of these changes is large. What they share is a pull request written so the maintainer can verify the mechanism without re-deriving it, and a test wherever the project has a harness. That is the part of open-source work I want to keep doing.',
      },
    ],
    sources: [
      { label: 'Betaflight PR #15706', href: 'https://github.com/betaflight/betaflight/pull/15706', kind: 'repository' },
      { label: 'Betaflight PR #15705', href: 'https://github.com/betaflight/betaflight/pull/15705', kind: 'repository' },
      { label: 'PX4 PR #28286', href: 'https://github.com/PX4/PX4-Autopilot/pull/28286', kind: 'repository' },
      { label: 'OpenFront PR #4868', href: 'https://github.com/openfrontio/OpenFrontIO/pull/4868', kind: 'repository' },
      { label: 'OpenFront PR #4985', href: 'https://github.com/openfrontio/OpenFrontIO/pull/4985', kind: 'repository' },
    ],
    projectSlug: 'upstream-open-source-contributions',
    topics: ['open-source-engineering', 'embedded-systems', 'robotics-perception'],
    keywords: ['Betaflight', 'PX4', 'EKF2', 'open source', 'firmware'],
  },
  {
    slug: 'talks-workshops-and-teaching',
    state: 'ready',
    title: 'Talks, workshops, and teaching',
    metaTitle: 'Talks, workshops, and teaching — Rami Kronbi',
    metaDescription: 'Public talks and workshops by Rami Kronbi on on-device AI, version control, and engineering careers.',
    dek: 'Sessions I’ve given on on-device AI, version control, and engineering careers.',
    body: [
      {
        kind: 'p',
        text: 'These are the public talks and workshops I have given, with the event and date for each, and a link wherever there is one.',
      },
      { kind: 'h2', text: 'GDG DevFest Tripoli 2025' },
      {
        kind: 'p',
        text: 'On 20 December 2025 I spoke at DevFest Tripoli 2025, organized by GDG North Lebanon at Beirut Arab University’s Tripoli campus, in the 11:10–11:50 slot. The talk, “On-Device Multimodal Assistants: Can We Fit GPT-Vision on Small Hardware?”, covered quantization, memory budgets, and hardware acceleration for running vision-language models on consumer hardware, and ended with a live demo.',
      },
      { kind: 'h2', text: 'CodewithSerah Pre-Winter Sprint Bootcamp, January 2026' },
      {
        kind: 'p',
        text: 'In January 2026 I gave two sessions at the CodewithSerah Pre-Winter Sprint Bootcamp, announced by the host on 26 January. The first, “Git & GitHub”, covered how version control works from repositories and branches to pull requests, and how to use GitHub as a portfolio. The second, “The Long Way into AI (And Why That’s Normal)”, was about careers and the choices behind them.',
      },
      { kind: 'h2', text: 'Git and GitHub beginner workshop, LAU Byblos, April 2026' },
      {
        kind: 'p',
        text: 'In April 2026 I coordinated a hands-on Git and GitHub workshop hosted by the LAU Byblos Software Engineering Club. The exercise material, written by Tarek AlSaleh, walks students through a staged repository with merge conflicts, stashes, and rebases, and is public on GitHub.',
      },
    ],
    sources: [
      { label: 'GDG North Lebanon DevFest 2025', href: 'https://north25.gdglebanon.com/', kind: 'institution' },
      { label: 'CodewithSerah — LinkedIn post about the sessions', href: 'https://www.linkedin.com/posts/codewithserah_git-github-the-long-way-into-ai-rami-activity-7421484335364681728-DWk1', kind: 'article' },
      { label: 'GitHub — Git_Github_Beginner_Workshop', href: 'https://github.com/Tarek-AL-Saleh/Git_Github_Beginner_Workshop', kind: 'repository' },
    ],
    projectSlug: '',
    topics: [],
    keywords: ['talks', 'DevFest', 'on-device AI', 'Git workshop', 'teaching'],
  },
  {
    slug: 'building-an-outbreak-dashboard-from-public-sources',
    state: 'hold',
    title: 'Building an outbreak dashboard from public sources',
    metaTitle: 'Building an outbreak dashboard from public sources',
    metaDescription: 'Hantawatch aggregates public outbreak sources into one linked, shareable map and feed; the design rule is that nothing appears without its source.',
    dek: 'Aggregating what agencies and newsrooms already publish into one map is useful only if every claim stays linked to where it came from.',
    body: [
      { kind: 'p', text: 'When the MV Hondius hantavirus outbreak developed in April and May 2026, the public record was spread across WHO disease-outbreak news, CDC material, a GIS case layer, and news feeds. Hantawatch aggregates those into one live dashboard: a country choropleth, status-colored case events, an event feed, indicators with deltas, a 14-day sparkline, and a news ticker.' },
      { kind: 'h2', text: 'The server does the reading' },
      { kind: 'p', text: 'Aggregation runs in a server component: cases, case events, and news are fetched in parallel, normalized into one event model, and checked for source health. The page shell is static; the live panel renders dynamically inside a Suspense boundary. Getting that split right under Next.js 16’s cache-components mode was most of the framework work.' },
      { kind: 'h2', text: 'State lives in the URL' },
      { kind: 'p', text: 'The view, the search text, and the selected country are URL parameters. Clicking a country polygon or a top-countries row toggles the country filter, so any state of the dashboard can be shared or restored with the back button. That constraint kept the client small.' },
      { kind: 'h2', text: 'Nothing without a link' },
      { kind: 'p', text: 'Every row in the event feed is an anchor to its source page, and the ticker opens each story at its origin. The dashboard is a reading aid for public information, not a new source of it. It holds no patient-level data and makes no epidemiological claim of its own.' },
      { kind: 'p', text: 'What it lacks is also clear: the parsers are specific to this outbreak and its feeds, there is no automated test suite yet, and the repository’s documentation is a handoff note rather than a README. Those are the next things to fix before it is presented as more than a working prototype.' },
    ],
    sources: [
      { label: 'Live dashboard', href: 'https://hanta-virus-dashboard.vercel.app', kind: 'demo' },
      { label: 'GitHub — hanta-virus-dashboard', href: 'https://github.com/Kronbii/hanta-virus-dashboard', kind: 'repository' },
    ],
    projectSlug: 'hantawatch-outbreak-dashboard',
    topics: ['civic-technology', 'applied-ai'],
    keywords: ['OSINT', 'outbreak', 'dashboard', 'Next.js'],
  },
  {
    slug: 'designing-a-council-of-models-for-retinal-screening',
    state: 'ready',
    title: 'Designing a council of models for retinal screening',
    metaTitle: 'Designing a council of models for retinal screening',
    metaDescription: 'Why Basira reads every retinal image with three independent models, reports their agreement, and leaves the decision to a doctor.',
    dek: 'Three foundation models that disagree in the open are more useful to a clinic than one model that is confidently wrong.',
    body: [
      { kind: 'p', text: 'Basira is a prototype screening platform for eye clinics in Lebanon. A doctor or technician uploads a fundus or OCT image; three independent retinal-image models each read it; a consensus engine reports whether they agree; the doctor confirms or overrides; the clinic gets a PDF report. It is decision support. It never diagnoses on its own.' },
      { kind: 'h2', text: 'Why three models' },
      { kind: 'p', text: 'The three models come from different lineages and were pretrained on different data. Each is used as an encoder with a head I trained on openly licensed datasets: DDR and IDRiD for diabetic-retinopathy grading, RFMiD for other diseases, PAPILA for glaucoma. Reporting agreement as unanimous, majority, or split gives the reviewing doctor something a single probability does not: a signal of when the models themselves are uncertain.' },
      { kind: 'h2', text: 'The safe path is enforced in code' },
      { kind: 'p', text: 'A council member serves real predictions only when its encoder and a trained head both load. Otherwise a deterministic stub takes its seat and the API says so. An untrained head never produces a diagnosis; that rule is enforced in the model loader and covered by tests. A quality gate runs before any model, and explainability heatmaps accompany every reading.' },
      { kind: 'h2', text: 'Built for a clinic box, not a data center' },
      { kind: 'p', text: 'The whole council runs in about two seconds per eye on a plain CPU. That is what makes an on-premises deployment plausible in Lebanon, where connectivity and power are not guaranteed and patient images should not leave the building.' },
      { kind: 'h2', text: 'What it is not' },
      { kind: 'p', text: 'Basira is in development. So far it has been benchmarked retrospectively on public datasets, to guide the engineering. It is not clinically validated and it is not a medical device; the clinical study that could support a performance figure has not been run yet. I treat those limits as part of the design, not as footnotes.' },
    ],
    sources: [
      { label: 'Live prototype', href: 'https://basira.ramikronbi.com', kind: 'demo', note: 'Demo clinic and demo data only.' },
    ],
    projectSlug: 'basira-retinal-screening',
    topics: ['applied-ai', 'health-technology'],
    keywords: ['retinal screening', 'consensus', 'decision support'],
  },
  {
    slug: 'why-color-science-comes-before-the-model',
    state: 'ready',
    title: 'Why color science comes before the model',
    metaTitle: 'Why color science comes before the model',
    metaDescription: 'Teaching a network a photographer’s edit depends on linear, calibrated, exact training pairs; most of the Imagen pipeline is the decode.',
    dek: 'To teach a network a photographer’s edit, the training pairs must be linear, calibrated, and exact. Most of the work is in the decode.',
    body: [
      { kind: 'p', text: 'Professional real-estate photographers shoot every frame as a set: ambient brackets at −6, −3, 0, +3, and +6 EV, flash fills, and lights-on stacks, then blend and grade by hand. The Imagen pipeline captures that before-and-after relationship at scale so an HDRNet bilateral-grid network can learn one photographer’s style. It was a freelance engagement for a French real-estate agency.' },
      { kind: 'h2', text: 'Ingestion has to guess right' },
      { kind: 'p', text: 'Sessions arrive as folders of RAW files and edited JPEGs with no labels. Ingestion groups brackets by timestamp, identifies the ambient sequence, flash fills, and lights-on stacks, and writes an index per listing so a run can resume after interruption.' },
      { kind: 'h2', text: 'The DNG pipeline, in full' },
      { kind: 'p', text: 'Canon EOS R5 DNGs from recent converters use JPEG XL tiles that LibRaw cannot decode, so the pipeline falls back to tifffile and applies the DNG specification’s color pipeline itself: per-channel polynomial linearization from the opcode list, white balance and camera calibration, the forward matrix to XYZ D50, Bradford adaptation to D65, and finally linear sRGB. Lens distortion, chromatic aberration, and vignetting are corrected with lensfun profiles. The output is 16-bit linear PNG, scene-referred, with no gamma.' },
      { kind: 'h2', text: 'Targets must not be reinterpreted' },
      { kind: 'p', text: 'The photographer’s JPEG is the ground truth. It is linearized so the artistic values are preserved exactly rather than re-graded by the pipeline. If the target drifts, the model learns the pipeline’s taste instead of the photographer’s.' },
      { kind: 'p', text: 'Layth Ayache contributed training and delivery runs. The client’s imagery stays private. By the client’s count, editing throughput went from two or three photos a day for a team of three to about forty a day per team member. What I can show here is the mechanism: get the decode right, keep the target exact, and the model has something honest to learn.' },
    ],
    sources: [],
    projectSlug: 'imagen-raw-to-edit-dataset-pipeline',
    topics: ['computer-vision', 'applied-ai'],
    keywords: ['HDRNet', 'RAW', 'DNG', 'color science'],
  },
  {
    slug: 'making-tenant-isolation-the-only-path',
    state: 'hold',
    title: 'Making tenant isolation the only path',
    metaTitle: 'Making tenant isolation the only path',
    metaDescription: 'For the Lumiscan clinical platform, tenant isolation is structural: organization scoping on every row, one service layer for two front doors, and a language model that only narrates.',
    dek: 'For a clinical platform, the dominant risk is one organization seeing another’s patients. The architecture should make that mistake hard to write.',
    body: [
      { kind: 'p', text: 'Lumiscan is an ESP32-based device, owned by its product owner, that scans skin lesions and outputs a classification with metrics. A device alone is not a product; clinics need somewhere to keep patients, lesions, and scans, to see whether a lesion is changing, and to manage follow-up. The dashboard is that platform.' },
      { kind: 'h2', text: 'Scoping is structural' },
      { kind: 'p', text: 'Every table that holds protected health information carries a non-null organization id, denormalized down every branch from patient to lesion to scan. The id is always derived server-side from the session, never from a request body or query parameter. All reads and writes go through a scoped repository, and a lint rule bans raw database access in feature code. A cross-organization request returns not-found, never forbidden, so the existence of another clinic’s rows is not confirmed.' },
      { kind: 'h2', text: 'Two front doors, one service layer' },
      { kind: 'p', text: 'The interface uses tRPC; devices use a versioned REST endpoint with hashed device keys and idempotency. Both are thin adapters over the same service functions, so manual entry and device ingestion write the same way and differ only in who the actor is. The device API is defined, tested, and simulated by a script; live ingestion is deferred until firmware is ready.' },
      { kind: 'h2', text: 'Narratives, never classification' },
      { kind: 'p', text: 'Classification arrives from the device. A language model writes a patient-friendly explanation and a doctor-facing summary from stored results, and it is explicitly forbidden from producing a triage label that drives the interface. Images are private objects in S3-compatible storage with keys prefixed by organization; they never enter the database.' },
      { kind: 'p', text: 'The prototype has a single local workspace instead of real authentication, and HIPAA and GDPR are designed for rather than implemented. All demo data is synthetic. Those are the expected limits of an MVP; what is already settled is that the safe path is the only path.' },
    ],
    sources: [
      { label: 'GitHub — lumiscan-dashboard', href: 'https://github.com/Kronbii/lumiscan-dashboard', kind: 'repository' },
    ],
    projectSlug: 'lumiscan-lesion-dashboard',
    topics: ['applied-ai', 'health-technology', 'full-stack-systems'],
    keywords: ['multi-tenancy', 'PHI', 'clinical software'],
  },
  {
    slug: 'what-a-small-vision-venture-taught-me-about-scope',
    state: 'ready',
    title: 'What a small vision venture taught me about scope',
    metaTitle: 'What a small vision venture taught me about scope',
    metaDescription: 'Co-founding Evoid, a small applied computer-vision venture in Beirut, and the lesson about bounding engagements.',
    dek: 'Co-founding a small applied computer-vision venture in Beirut was mostly a lesson in bounding engagements.',
    body: [
      { kind: 'p', text: 'Evoid is a small venture I co-founded to do applied AI and computer-vision work for clients in Beirut, alongside a team that includes Tayseer Laz and Abou Baker Al Khatib. I worked as systems engineer and product manager: client coordination, technical direction, and building the public site.' },
      { kind: 'p', text: 'The useful lesson was about scope. A client with a workflow that a camera could improve rarely needs a platform; they need one bounded prototype that answers one question, delivered by the same people who will maintain it. PadelEye, the venture’s own experiment in automated padel line judging from a camera stream, is a case in point: trained weights and a scaffolded pipeline exist, and it is still a prototype, not a product.' },
      { kind: 'p', text: 'Between 2023 and 2025 we delivered five computer-vision applications for external clients. I don’t name them or their outcomes here; that is for each client to agree to first.' },
    ],
    sources: [
      { label: 'evoid.dev', href: 'https://www.evoid.dev/', kind: 'demo' },
    ],
    projectSlug: 'evoid-applied-vision-venture',
    topics: ['computer-vision', 'product-engineering'],
    keywords: ['startup', 'computer vision', 'scope'],
  },
  {
    slug: 'a-first-mechatronic-loop-without-a-pump',
    state: 'ready',
    title: 'A first mechatronic loop without a pump',
    metaTitle: 'A first mechatronic loop without a pump',
    metaDescription: 'An early Arduino project that hit targets with gravity-fed water bursts, and the lesson that the plant changes after every action.',
    dek: 'An early Arduino project that hit targets with gravity-fed water bursts, and taught that the plant changes after every action.',
    body: [
      { kind: 'p', text: 'The water-shooting robot is one of my earliest mechatronics projects. It aims a nozzle with a servo, sets its height with a stepper-driven lead screw, and fires timed bursts through a solenoid valve at a table of predefined targets. There is no pump; the stream is gravity-fed from a bottle.' },
      { kind: 'p', text: 'That choice made the physics part of the control problem. The required nozzle height for a target depends on the water level, and the water level drops after every shot. The firmware estimates height from a simple ballistic relation and updates the modeled level with a Torricelli-style expression after each burst. Both are simplifications, and the README says so: empirical tuning is needed.' },
      { kind: 'p', text: 'The repository is organized as firmware, focused bring-up test sketches for each actuator, CAD, and documentation, with calibration steps for steps-per-millimetre and predicted-versus-actual height logged over serial. It is early work, kept public because the loop is complete and the assumptions are written down.' },
    ],
    sources: [
      { label: 'GitHub — water-shooting-robot', href: 'https://github.com/Kronbii/water-shooting-robot', kind: 'repository' },
    ],
    projectSlug: 'water-shooting-robot',
    topics: ['robotics', 'embedded-systems', 'control-systems'],
    keywords: ['Arduino', 'mechatronics', 'control'],
  },
  {
    slug: 'moderation-is-the-product-in-a-quest-app',
    state: 'ready',
    title: 'Moderation is the product in a quest app',
    metaTitle: 'Moderation is the product in a quest app — building proof checks for Bsheel',
    metaDescription:
      'How Rami Kronbi built the proof checks behind Bsheel, a real-world quest app: a review state machine with one appeal, a forensics-first AI cascade that never rejects on a cheap verdict, and shadow mode scored against human moderators.',
    dek: 'A quest only counts when someone has looked at the proof. Most of the engineering in Bsheel follows from that.',
    body: [
      {
        kind: 'p',
        text: 'Bsheel hands you three random real-world quests. You pick one, do it before its timer runs out, and post a photo or video as proof. The XP arrives only after the proof is approved. I co-founded it with Razan Hasbini and Tayseer Laz, and I work on it as systems engineer and product manager. It is live on Google Play and at bsheel.app.',
      },
      { kind: 'h2', text: 'From a hackathon app to a real backend' },
      {
        kind: 'p',
        text: 'Bsheel started in March 2026 as a hackathon app built on Supabase. In September 2026 we rebuilt it on a self-hosted NestJS backend: Flutter clients for the app and the admin console, PostgreSQL as the source of truth, Redis and BullMQ for queues and locks, S3-compatible storage for proof media, and a worker built from the same codebase as the API. Every domain is layered the same way, from presentation down to infrastructure, and slow or cross-domain effects go through a transactional outbox to idempotent workers.',
      },
      { kind: 'h2', text: 'A quest counts when a person has seen the proof' },
      {
        kind: 'p',
        text: 'The core is a small state machine. Submitting proof marks the quest as submitted and the proof as pending. A moderator approves it, and the XP is awarded once, or rejects it. A rejected player can appeal once: the submission goes back to pending with the appeal spent, and a second rejection is final. Those rules are enforced on the server, not in the app.',
      },
      {
        kind: 'p',
        text: 'The feed, votes, comments, collab groups, and leaderboards all sit on top of that. They are what make Bsheel fun, but they only mean something if the proof underneath them is honest. That is why the admin console is built around a review queue, appeals, and an XP reconciliation audit.',
      },
      { kind: 'h2', text: 'Asking a photo only what it can answer' },
      {
        kind: 'p',
        text: 'The part of Bsheel I spent the most time on is automated proof checking. My first pass was a single vision-model call with a generic prompt. The prompt was not the problem. When I went through the quest catalogue and asked of each quest whether a photo could prove it, roughly a third could not. A photo of a book does not show you read twenty pages. “Spend an hour with no phone” cannot be proven by a picture the phone took. A model asked anyway still answers, with a confidence score attached, and that is how an automated reviewer confidently rejects an honest player.',
      },
      {
        kind: 'p',
        text: 'So every quest now carries a verification contract: either the image can show the task, or it can only show whether the photo is authentic, or nothing about it bears on the task. The check runs in stages. Forensics come first and cost almost nothing: capture time, exact-byte and near-duplicate matching, screen dimensions, and markers of generated content. Then a cheap model, and a stronger one only where the cheap one could not tell. Most submissions stop early. Before any rejection, the most capable model has to agree; a confident verdict from a cheaper tier is never enough to reject.',
      },
      {
        kind: 'p',
        text: 'I keep two numbers apart: how sure the model is of its verdict, and how relevant the media is to the quest. A photo of a coffee cup is irrelevant to “compliment a stranger”, and the submission is still honest. So relevance can hold back an automatic approval, but it can never cause a rejection.',
      },
      { kind: 'h2', text: 'Shadow mode, and a number to earn' },
      {
        kind: 'p',
        text: 'The pipeline runs in shadow mode by default: it records what it would have decided, and a person still decides. Moderators see the agent’s read beside the proof, including what it looked for and did not find, because “no sunrise in this frame” is usually the line that matters. To know whether it deserves to act, I built an evaluation that scores its verdicts against decisions moderators already made. It includes a backfill over submissions reviewed before the agent existed, so its verdict could not have influenced the decision it is scored against.',
      },
      { kind: 'h2', text: 'Bugs you only find by leaving it running' },
      {
        kind: 'p',
        text: 'The hardest bugs showed up after the pipeline had been running for a while, not when I read the code. A run interrupted by a restart could never be picked up again, because the claim on it was a label, not a lease that expires. A decision could be recorded and then quietly never applied. Both are fixed: claims expire, and a decision that fails to apply fails the run, so a retry is a real retry.',
      },
      {
        kind: 'p',
        text: 'The perceptual hash that catches re-used photos was the strangest bug. It records whether each pixel is brighter than its neighbour, so a dark screenshot, a white wall, and a night sky all hash to the same value. Two unrelated people photographing two unrelated blank things looked like one stolen photo. It never rejected anyone, because automatic rejection was switched off, but it would have the moment that changed. Those frames now get no hash at all. A fingerprint that a whole class of images shares is not a fingerprint.',
      },
      { kind: 'h2', text: 'The rest of my part' },
      {
        kind: 'p',
        text: 'Around the proof check I built business accounts for places on the map, granted by membership rather than by an admin role, with a partner dashboard as its own web app. I added an event store for the top of the funnel, kept apart from completions because a phone saying it showed a quest card is not something the server can confirm. I also built admin tools for quest chains and collections, and keyset pagination for the admin lists. Much of the app itself is Tayseer’s and Razan’s work.',
      },
      {
        kind: 'p',
        text: 'In a game about doing things in the real world, the playful features are the easy part. Trust in the proof is the product, and the moderation behind it is where most of the engineering went.',
      },
    ],
    sources: [
      { label: 'bsheel.app', href: 'https://bsheel.app/', kind: 'demo' },
      {
        label: 'BSHEEL on Google Play',
        href: 'https://play.google.com/store/apps/details?id=com.questapp.mobile_app',
        kind: 'listing',
      },
      {
        label: 'Bsheel source on GitHub',
        href: 'https://github.com/razanhasbini/bsheel-',
        kind: 'repository',
      },
      {
        label: 'AI proof verification pull request',
        href: 'https://github.com/razanhasbini/bsheel-/pull/54',
        kind: 'repository',
        note: 'The staged cascade and per-quest verification contract.',
      },
      {
        label: 'Making the pipeline safe to leave running',
        href: 'https://github.com/razanhasbini/bsheel-/pull/70',
        kind: 'repository',
        note: 'Leases, silent decisions, and the perceptual-hash fix.',
      },
    ],
    projectSlug: 'bsheel-quest-app',
    topics: ['applied-ai'],
    keywords: [
      'content moderation',
      'proof verification',
      'vision models',
      'shadow mode',
      'perceptual hash',
      'NestJS',
      'Flutter',
      'gamification',
    ],
  },
  {
    slug: 'a-ride-is-data-about-the-bike',
    state: 'hold',
    title: 'A ride is data about the bike',
    metaTitle: 'A ride is data about the bike',
    metaDescription: 'The central design decision behind Moto 961, an early-stage motorcycle app for Lebanon: rides feed maintenance, not leaderboards.',
    dek: 'Most motorcycle apps are trackers or classifieds. Moto 961 is built on one different idea.',
    body: [
      { kind: 'p', text: 'In Lebanon a motorcycle is transport and often livelihood. Around it, almost nothing is documented: potholes and closures nobody announces, mechanics found by word of mouth, parts scattered across shops, and a service history that lives in three mechanics’ memories. Moto 961, working name Bikey, is an early-stage app I am part of with Tayseer Laz, who owns the repository and wrote the current prototype.' },
      { kind: 'p', text: 'The spine of the product is a single decision: rides are not achievements, they are data about the bike. Recorded distance moves the odometer; the odometer tells you the chain needs adjusting in 900 kilometres; the schedule points you to a part and a mechanic near where you actually ride; logging the work resets the schedule; hazards other riders hit shape your next ride. Pull one part out and the others get worse.' },
      { kind: 'p', text: 'The prototype is a Flutter monorepo with feature packages, Mapbox, and local storage, and no backend yet. It is days old at the time of writing, so this page records the design, not a shipped product. What I contributed will be stated here once the team’s roles are written down.' },
    ],
    sources: [
      { label: 'Repository (private)', href: 'https://github.com/TayseerLaz/bikey', kind: 'repository', note: 'Owned by Tayseer Laz.' },
    ],
    projectSlug: 'moto-961-bikey',
    topics: ['product-engineering', 'lebanon'],
    keywords: ['motorcycle', 'Lebanon', 'Flutter'],
  },
  {
    slug: 'what-losing-a-rotor-teaches-about-estimation',
    state: 'ready',
    title: 'What losing a rotor teaches about estimation',
    metaTitle: 'What losing a rotor teaches about estimation',
    metaDescription:
      'A quadrotor that loses a rotor has a fraction of a second to notice. Why detecting it is an estimation problem, and why the hard part is knowing what the healthy machine looks like.',
    dek: 'A quadrotor that loses a rotor has a fraction of a second to notice. Noticing turns out to be an estimation problem, and most of it is about what you assume the healthy machine is.',
    body: [
      {
        kind: 'p',
        text: 'A quadrotor has exactly as many actuators as it has things to control: one collective thrust and three torques. A hexacopter can route around a damaged propeller; a quadrotor cannot. When one rotor weakens, the vehicle has to notice and compensate before its attitude loop saturates, and when a rotor stops entirely, the only way to stay in the air is to give up control of yaw and let the vehicle spin.',
      },
      {
        kind: 'p',
        text: 'The study models that situation for a 5-inch FPV-class quadrotor, about 0.64 kg with a thrust-to-weight ratio of 3.6, with sensor noise, a 10 ms motion-capture latency, parameter uncertainty and light turbulence. Everything below is simulation; the parameters are assumed, not identified on a real frame.',
      },
      {
        kind: 'h2',
        text: 'The hard part is knowing, not steering',
      },
      {
        kind: 'p',
        text: 'The clearest result is the gap between two controllers that differ only in what they know. After a complete loss of one rotor in hover, the nominal controller, never told about the fault, lost the vehicle in all 32 runs, typically by flipping within about 0.3 seconds. A yaw-relaxed controller in the spirit of Mueller and D’Andrea, handed the true fault the instant it happened, recovered every one.',
      },
      {
        kind: 'p',
        text: 'So the control law that survives a rotor loss already exists. What separates a crash from a recovery is information: that a fault happened, which rotor it hit, and how much effectiveness is left, delivered fast enough to act on.',
      },
      {
        kind: 'h2',
        text: 'Estimating something no sensor measures',
      },
      {
        kind: 'p',
        text: 'A small quadrotor usually has no direct measurement of how well each rotor is working. The pipeline infers it. The rotational dynamics and the vertical force balance are linear in the four rotor-effectiveness factors once each rotor’s thrust is predicted from the motor commands, so a Kalman filter can track those factors from the gyro, the accelerometer and the velocity estimate.',
      },
      {
        kind: 'p',
        text: 'One detail matters more than it looks: the gyro has to be differentiated to get angular acceleration, and differentiating noise is a bad idea, so it goes through a filter. Every other signal in the regression goes through the same filter, so the equation stays exact for a constant fault instead of being exact for none of its terms.',
      },
      {
        kind: 'h2',
        text: 'The healthy vehicle is not the nominal vehicle',
      },
      {
        kind: 'p',
        text: 'The next lesson was about the baseline. A thrust coefficient a few percent off, or a mass error, looks exactly like a few percent of lost effectiveness. A detector that compares the vehicle against its nominal model therefore starts every flight slightly alarmed.',
      },
      {
        kind: 'p',
        text: 'The fix is to learn what healthy looks like on this particular vehicle: the estimate is averaged over the first 2.5 seconds of hover and detection runs against that. With this step removed in an ablation, static mismatch stayed in the residual: one fault-free flight raised a false alarm, and so did one faulty flight before its fault even began.',
      },
      {
        kind: 'h2',
        text: 'Deciding fast, and deciding once',
      },
      {
        kind: 'p',
        text: 'Estimation produces a number; detection has to make a decision. The detector uses a bank of CUSUM tests, each designed for a different size of loss: 15, 30 and 60 percent. A single test tuned for small faults roughly doubled the median detection delay, from 30 to 61 ms, because a large fault then accumulates evidence at the rate of the small one it was designed for.',
      },
      {
        kind: 'p',
        text: 'With the bank, all 200 injected losses between 20 and 90 percent were detected (median 30 ms, 95th percentile 58 ms) and isolated to the correct rotor, with no false alarm in 32 minutes of fault-free flight, including aggressive manoeuvres that were not used to set the thresholds. The yaw-relaxed controller then took over complete losses about 60 ms after the failure and held position while the vehicle spun at about 23 rad/s.',
      },
      {
        kind: 'h2',
        text: 'What the oracle got wrong',
      },
      {
        kind: 'p',
        text: 'At 70 to 80 percent loss, the estimating pipeline had a smaller peak deviation than the oracle that knew the truth. The oracle idles a weakened rotor the moment it fails; the estimating pipeline keeps using it for the 70 to 90 ms it takes the alarm and the estimate to cross the switching threshold, and that partial thrust helps. An oracle is an upper bound on information, not on the decisions made with it.',
      },
      {
        kind: 'h2',
        text: 'Where it breaks',
      },
      {
        kind: 'p',
        text: 'Mapping where it fails is the most useful result. In the robustness sweeps, recovery from a complete loss started to fail at 24 ms of actuator delay (the controller assumes 2 ms), with motors 3.2 times slower than modelled, and at three times the default turbulence. All three act during the spin-up transient, when the relaxed equilibrium leaves little margin and the body tilts by 40 degrees or more.',
      },
      {
        kind: 'p',
        text: 'The limits of the study are just as clear. The noise in the simulation is white and the turbulence a simple random process; the vibration on a real 5-inch frame is narrow-band, much larger and tied to motor speed. The detection numbers describe what the method does when its model is right.',
      },
      {
        kind: 'p',
        text: 'The first step beyond the original simulator is done. Replayed offline on 110 PX4 software-in-the-loop flights of a 2 kg quadrotor in Gazebo, the same diagnoser detected all 40 partial and 16 complete losses, with median delays of 120 and 132 ms, and flagged every complete loss before the vehicle tilted past 90 degrees. PX4’s own failure detector raised nothing for the partial losses and flagged the complete ones only after about 660 ms, once the attitude limit was crossed. Gazebo’s IMU is nearly noise-free, though, so that run says little about false alarms on a real frame. Blackbox logs from a real flight, then a tethered rig, come next.',
      },
      {
        kind: 'p',
        text: 'Losing a rotor is a lesson in estimation. The controller that survives is the one that knows soonest, and how soon it knows depends less on clever control than on an honest model of the healthy machine.',
      },
    ],
    sources: [
      {
        label: 'GitHub — rotor-fault-recovery',
        href: 'https://github.com/Kronbii/rotor-fault-recovery',
        kind: 'repository',
      },
      {
        label: 'Mueller and D’Andrea, Stability and control of a quadrocopter despite the complete loss of one, two, or three propellers (ICRA 2014)',
        href: 'https://doi.org/10.1109/ICRA.2014.6906588',
        kind: 'article',
      },
    ],
    projectSlug: 'quadrotor-rotor-fault-recovery',
    topics: ['control-systems', 'robotics-perception'],
    heroMedia: {
      src: '/images/authority/quadrotor-rotor-fault-recovery/complete-loss.png',
      alt: 'Plot of position error after one rotor stops in simulated hover: the nominal controller flips, while the estimating pipeline and a controller told the true fault both recover.',
      caption: 'Simulation: one rotor stops at 2 s; the nominal controller flips, the pipeline recovers.',
    },
    keywords: ['rotor fault detection', 'quadrotor', 'Kalman filter', 'CUSUM', 'fault-tolerant control'],
  },
  {
    slug: 'a-barn-door-tracker-that-does-the-maths',
    state: 'ready',
    title: 'A barn-door tracker that does the maths',
    metaTitle: 'A barn-door star tracker that does the maths',
    metaDescription:
      'The barn-door tracker’s tangent error is pure geometry, so an ESP32 can remove it exactly by timing every microstep, and an error model shows what limits the exposure next.',
    dek: 'The barn-door tracker’s famous tangent error is pure geometry, so the firmware can remove it exactly instead of the mechanics approximating it.',
    body: [
      {
        kind: 'p',
        text: 'A barn-door tracker is two boards on a hinge. Point the hinge at the celestial pole, open the boards at the rate the sky turns, and a camera on the top board follows the stars. It is the cheapest way to take long exposures of the night sky, and it has one famous flaw: a straight screw pushing a board that swings in an arc does not open it at a constant angular rate. Driven at constant speed, the design in this project would drift off the sky by about 30 arcminutes in the first hour and more than four degrees over its full travel.',
      },
      {
        kind: 'p',
        text: 'The classic fixes are mechanical: a curved rod, or a second arm that cancels most of the error. This design takes the other route. The error is pure geometry, so the firmware can remove it exactly.',
      },
      {
        kind: 'h2',
        text: 'Schedule steps, not speed',
      },
      {
        kind: 'p',
        text: 'The firmware never runs the motor at a speed. The geometry of a roller pushing a strike plate gives a closed-form relation between the screw position and the board angle, and its inverse. For each microstep, the firmware computes the instant at which the ideal sidereal angle crosses that step’s true angle and fires the step then. Because every step is placed against the ideal angle rather than added to the previous one, errors cannot accumulate: in a two-hour simulated run of the same C++ code the ESP32 runs, the board stays within half a microstep, 0.32 arcseconds, of the sky.',
      },
      {
        kind: 'p',
        text: 'The ESP32 cannot use its floating-point unit inside interrupts, so the work is split. A 1 kHz task does the trigonometry and fills a small lock-free queue of step times; a 20 kHz interrupt only compares integer timestamps and pulses the driver.',
      },
      {
        kind: 'h2',
        text: 'Choosing the drive by division',
      },
      {
        kind: 'p',
        text: 'The deciding argument for the lead screw was division. Every error that starts at the motor, such as uneven microsteps or an eccentric coupler, is divided by the reduction ratio before it reaches the sky. A 2 mm-lead screw pushing a 200 mm arm gives 629:1 from parts sold for 3D-printer Z axes, about 0.64 arcseconds per microstep. Printed worm gears and belt drums reach a fraction of that.',
      },
      {
        kind: 'h2',
        text: 'Predicting before building',
      },
      {
        kind: 'p',
        text: 'Nothing has been built yet, so the useful question was what would limit it. A Python error model converts each source, from polar misalignment and drive-rate error to the screw’s periodic error and refraction, into on-sky trail, and from that into the longest sharp exposure for each lens. At 200 mm on an APS-C camera it predicts about 21 seconds per frame, against 0.38 seconds without tracking.',
      },
      {
        kind: 'p',
        text: 'The model also changed the plan. With an assumed periodic error of ±4 µm, the screw’s wobble outweighs polar-alignment error up to about one degree of misalignment. A better polar scope would buy little; a periodic-error correction table, which the firmware already supports, could raise the 200 mm limit to over a minute. That assumption is also the model’s biggest uncertainty, and measuring the real screw is the first job after the build.',
      },
      {
        kind: 'h2',
        text: 'What is left',
      },
      {
        kind: 'p',
        text: 'The parts are modelled for printing, the firmware compiles, and the tests pass, but every performance number is a prediction until the tracker is built and pointed at the Orion Nebula. The first session is planned for a moonless window in November. After that, an autoguiding camera, prototyped so far only on synthetic star fields, is the next step.',
      },
    ],
    sources: [
      {
        label: 'GitHub — star-tracker',
        href: 'https://github.com/Kronbii/star-tracker',
        kind: 'repository',
      },
    ],
    projectSlug: 'esp32-barn-door-star-tracker',
    topics: ['embedded-systems', 'control-systems'],
    heroMedia: {
      src: '/images/authority/esp32-barn-door-star-tracker/tangent-correction.png',
      alt: 'Two plots: the tangent error of a constant-speed barn door growing over two hours, and the firmware schedule staying within plus or minus 0.3 arcseconds.',
      caption: 'Constant speed against the firmware’s schedule, from a host simulation of the firmware code.',
    },
    keywords: ['barn door tracker', 'ESP32', 'stepper motor', 'astrophotography'],
  },
  {
    slug: 'teaching-drone-control-from-an-rc-circuit-up',
    state: 'ready',
    title: 'Teaching drone control from an RC circuit up',
    metaTitle: 'Teaching drone control from an RC circuit up',
    metaDescription:
      'How a seven-evening course gets engineering students from PID on an RC circuit to a quadrotor that survives losing a rotor, and why every lab is predicted in a notebook before it is measured.',
    dek: 'A drone is a stack of feedback loops. The course builds that stack one loop at a time, starting where mistakes are cheap.',
    body: [
      {
        kind: 'p',
        text: 'Most students meet control theory as transfer functions on a whiteboard. Then they meet a drone, and the gap between the two is wide: noisy sensors, motors that lag, integrators that wind up, and a vehicle that flips in a fraction of a second when a gain is wrong. The course is designed to close that gap in seven evenings, in teams of three, with hardware cheap enough to break.',
      },
      {
        kind: 'h2',
        text: 'Start where mistakes are cheap',
      },
      {
        kind: 'p',
        text: 'The first two sessions use an Arduino and a resistor-capacitor circuit. A capacitor charging through a resistor is a first-order plant with an exact answer, so a student can predict a P controller’s offset on paper, measure it on the bench, and see the two agree. A three-stage RC ladder then adds enough lag to make tuning interesting: windup, derivative noise, setpoint kick and relay autotuning, each checked against a known result rather than judged by eye.',
      },
      {
        kind: 'p',
        text: 'Every lab uses easyPID, my Arduino library, and the notebooks use a Python port of it. The port is tested against the compiled C++ library on 3,274 randomised updates, so a gain found in a notebook means the same thing in a sketch. Building those tests also found a real flaw: the library’s relay autotuner reports a high ultimate gain on its first run from rest, about 42 against an exact 29, and a good one on the second. The lab now runs it twice.',
      },
      {
        kind: 'h2',
        text: 'One drone axis, with the answer key attached',
      },
      {
        kind: 'p',
        text: 'Session three moves to a two-motor seesaw: one axis of a quadrotor on a pivot. The rig has a potentiometer on the pivot, which a real drone never has. Students first close the loop on that clean, absolute angle; in the next session they fuse a gyro and an accelerometer and measure their estimate against the potentiometer. Students get to see exactly how wrong their attitude estimate is, which a flying drone never shows them.',
      },
      {
        kind: 'p',
        text: 'The same rig teaches why drones use cascades. A single loop on the angle swings about 7 degrees when the beam is tapped; an inner rate loop under an outer angle loop holds it to about 3 in the rig model. Students predict that in the notebook before they see it on the bench.',
      },
      {
        kind: 'h2',
        text: 'Then the full vehicle, then what breaks',
      },
      {
        kind: 'p',
        text: 'The last sessions are in simulation: the allocation matrix that turns thrust and torques into four motor commands, mixing priorities when the motors saturate, and a position, velocity, attitude and rate cascade. Session six uses my rotor-fault study as its simulator. Students derive why a quadrotor cannot hover once a rotor has lost too much thrust, detect and isolate a fault with CUSUM tests, and watch a yaw-relaxed controller keep a vehicle in the air after a rotor stops.',
      },
      {
        kind: 'p',
        text: 'The capstone is an acceptance test written as code. The same test runs on the rig and on the rig model, so teams tune in simulation first and are scored the same way on hardware. The report asks for the gap between model and hardware, stated plainly.',
      },
      {
        kind: 'h2',
        text: 'What is not done',
      },
      {
        kind: 'p',
        text: 'Nobody has taken the course yet. The notebooks run, the sketches compile and the tests pass, but no rig has been built from the documents, and the rig’s parameters come from simulation. The pilot plan lists what the first cohort will measure; until then I can’t say what students learn from it.',
      },
    ],
    sources: [
      {
        label: 'GitHub — drone-control-bootcamp',
        href: 'https://github.com/Kronbii/drone-control-bootcamp',
        kind: 'repository',
      },
      {
        label: 'GitHub — easyPID',
        href: 'https://github.com/Kronbii/easyPID',
        kind: 'repository',
      },
    ],
    projectSlug: 'drone-control-bootcamp',
    topics: ['control-systems', 'embedded-systems'],
    heroMedia: {
      src: '/images/authority/drone-control-bootcamp/pid-rc.png',
      alt: 'Plot of capacitor voltage under P and PI control on an RC circuit, with the 2.5 V setpoint.',
      caption: 'Session 1: P, PI, and PI with too much integral gain on a simulated RC circuit.',
    },
    keywords: ['control education', 'PID', 'easyPID', 'quadrotor', 'drone control'],
  },
  {
    slug: 'measuring-road-speed-with-one-camera',
    state: 'ready',
    title: 'Measuring road speed with one camera, and knowing how wrong it is',
    metaTitle: 'Measuring road speed with one camera, and knowing how wrong it is',
    metaDescription:
      'A fixed camera can measure vehicle speeds cheaply, but a speed survey is only useful if its error is known. How simulated video with exact ground truth shows where the method holds and where it breaks.',
    dek: 'A camera on a pole is the cheapest speed survey a street can get. The hard part is not measuring speed; it is knowing how far to trust the number.',
    body: [
      {
        kind: 'p',
        text: 'Speed is one of the main risk factors on roads: the World Health Organization estimates that every 1 % increase in mean speed raises the risk of a fatal crash by about 4 %. A municipality that wants to calm a street, argue for a crossing or check whether a measure worked needs speed data for that particular street. Radar surveys cost money and staff time. A camera on a lamp post is cheap, but its numbers are only useful if their error is known, and only acceptable if it does not become a surveillance device.',
      },
      {
        kind: 'h2',
        text: 'From pixels to metres',
      },
      {
        kind: 'p',
        text: 'The method is classical computer vision. A handful of points on the road, measured with a tape and clicked on one frame, give a homography: a mapping from the image to metres on the road plane. Background subtraction finds moving vehicles, a Kalman tracker follows each one through the frames, and the point where the tyres meet the road is mapped onto the road. A robust straight-line fit of position against time, inside a defined measurement zone, gives the speed.',
      },
      {
        kind: 'p',
        text: 'Each record leaves with an uncertainty, computed by perturbing the calibration and the pixel positions and fitting again. Records that look doubtful, such as merged vehicles, gaps or large residuals, go to a human review queue instead of into the statistics. The tool writes numbers, not images.',
      },
      {
        kind: 'h2',
        text: 'Ground truth from a simulator',
      },
      {
        kind: 'p',
        text: 'The difficulty with validating speed measurement is ground truth: on a real road, the true speed of every car is exactly what nobody has. So the project includes a renderer that draws road scenes through a calibrated camera, with lane markings, buildings, shadows, sensor noise, compression and motion blur, and knows every vehicle’s true speed. The full pipeline runs on those frames exactly as it would on a video file.',
      },
      {
        kind: 'p',
        text: 'On the baseline setup, a camera on a 6 m pole watching a zone 20 to 50 m away at 30 frames per second, 95 % of measured speeds were within about 1 km/h of the truth, with no false records. Over 20 simulated traffic runs, the 85th-percentile speed that planners use came out within about 1.2 km/h (RMSE).',
      },
      {
        kind: 'h2',
        text: 'Where it breaks',
      },
      {
        kind: 'p',
        text: 'The useful part of 221 simulated runs is the map of failures. Distance matters most: each pixel covers more road further away, so at 75 m the 95th-percentile error reaches 7.6 km/h and fewer than half the vehicles are measured. The point that is tracked matters almost as much. Tracking the centre of the vehicle’s box, without correcting for its height, gave 95th-percentile errors of 17 km/h; the bottom edge, located to a fraction of a pixel, gave about 1 km/h. Sensor noise, compression and motion blur barely mattered. Dusk and flat lighting without cast shadows did, and there the stated uncertainty was too small, which is the more dangerous failure.',
      },
      {
        kind: 'p',
        text: 'A few passes of a car driven at a known speed correct most of the calibration error. In one simulated low-resolution, far-zone setup, five such passes cut the speed bias from about 6 % to under 2 %.',
      },
      {
        kind: 'h2',
        text: 'What simulation cannot say',
      },
      {
        kind: 'p',
        text: 'The simulated road is flat and straight, the lens is ideal and the vehicles are boxes. These numbers describe the method when its assumptions hold. The next step is a field check against radar or GPS on one real road, following a protocol written for it. Until then the tool is an audit aid for planning, and it is not, and should not become, an enforcement device.',
      },
    ],
    sources: [
      {
        label: 'GitHub — road-speed-audit',
        href: 'https://github.com/Kronbii/road-speed-audit',
        kind: 'repository',
      },
      {
        label: 'World Health Organization — Road traffic injuries fact sheet',
        href: 'https://www.who.int/news-room/fact-sheets/detail/road-traffic-injuries',
        kind: 'documentation',
      },
    ],
    projectSlug: 'road-speed-audit',
    topics: ['computer-vision', 'civic-technology'],
    heroMedia: {
      src: '/images/authority/road-speed-audit/scene.png',
      alt: 'A rendered street scene labelled “Simulated scene”, with tracked vehicles showing measured and true speeds.',
      caption: 'A frame from the simulator, with measured and true speeds. Simulated, not a real road.',
    },
    keywords: ['vehicle speed measurement', 'traffic camera', 'homography', 'V85', 'road safety'],
  },
  {
    slug: 'simulating-an-engine-from-crank-to-gearbox',
    state: 'ready',
    title: 'Simulating an engine from crank to gearbox',
    metaTitle: 'Simulating a four-cylinder engine from crank to gearbox in MATLAB',
    metaDescription:
      'How a chain of MATLAB scripts follows a four-cylinder engine from its slider-crank geometry through a converging thermodynamic cycle to crank torque, a flywheel and an eight-speed gearbox, and what the model leaves out.',
    dek: 'One chain of scripts that follows a four-cylinder engine from the geometry of its crank, through the gas in its cylinders, to the gear ratios of the car it drives.',
    body: [
      {
        kind: 'p',
        text: 'For an automotive course assignment at RHU in fall 2024, I wrote a simulator for a four-stroke, four-cylinder spark-ignition engine running at 2000 rpm. It covers one full cycle, 720° of crank rotation, and it is built as a chain in which every stage takes the previous one’s output as its input. The geometry gives the volume, the volume gives the pressure, the pressure gives the torque, and the torque sizes the flywheel and the gearbox.',
      },
      { kind: 'h2', text: 'One file of numbers' },
      {
        kind: 'p',
        text: 'Every parameter lives in constants.m: link lengths and masses, the engine speed, the timing of intake, compression, combustion, expansion and exhaust in crank degrees, the gas properties, and the flywheel and transmission constants. Each later script loads what the one before it saved, so a change there runs through every result downstream.',
      },
      { kind: 'h2', text: 'The slider-crank' },
      {
        kind: 'p',
        text: 'part1.m solves the slider-crank at every crank angle: piston position, velocity and acceleration, the angle of the connecting rod, and the cylinder volume. It does this twice, once with the cylinder axis passing through the crankshaft and once with the two offset by −18 mm, with compression ratios of 9.8 and 10.1. The same pass computes the rod’s angular velocity and acceleration and the accelerations of each part’s centre of mass, which the torque calculation needs later.',
      },
      { kind: 'h2', text: 'A cycle that has to agree with itself' },
      {
        kind: 'p',
        text: 'part2.m runs a single-zone thermodynamic cycle over that volume. Compression and expansion are polytropic. Combustion takes 60° around top dead centre: a constant-volume heat addition from the fuel’s heating value gives the temperature at the end of combustion, and a Wiebe function, with a = 5 and m = 2, sets how much of the charge has burned at each angle in between.',
      },
      {
        kind: 'p',
        text: 'The gas exchange is where the cycle loops back on itself. Exhaust blowdown and intake are modelled as compressible flow through a valve orifice, and the gas left over from the exhaust mixes with the fresh charge. That mixture sets the temperature at the start of the next compression, which changes everything after it. So the script runs the cycle again until the temperature at the end of intake matches the one it started compression with.',
      },
      { kind: 'h2', text: 'From gas pressure to crank torque' },
      {
        kind: 'p',
        text: 'With the pressure known, the torque comes from the forces on the mechanism. At every crank angle the script writes the force and moment balances for the crank, the connecting rod and the piston, including their masses, the rod’s rotational inertia, gravity and the gas force on the piston, as an 8×8 linear system, and solves it for the torque on the crank.',
      },
      {
        kind: 'p',
        text: 'That is one cylinder. The other three are the same curve shifted by 180°, 360° and 540°, and their sum is the torque of the engine.',
      },
      { kind: 'h2', text: 'Flywheel and gearbox' },
      {
        kind: 'p',
        text: 'A cylinder’s torque swings above and below its mean over a cycle. The script integrates the energy of that excess between the crossings of the mean and sizes a flywheel to hold the speed fluctuation to a coefficient of 0.04, as a steel disc 50 mm thick; its radius follows from the inertia it needs.',
      },
      {
        kind: 'p',
        text: 'The same run reports the engine’s performance: work per cycle from the pressure–volume loop, indicated and brake power, mean effective pressure and brake mean effective pressure, efficiencies, specific fuel consumption, volumetric efficiency and mean piston speed.',
      },
      {
        kind: 'p',
        text: 'The last step designs an eight-speed gearbox. The top gear is set by a top speed of 245 km/h, the first gear by what it takes to move a 2600 kg vehicle up a 7 % grade while accelerating, and fsolve finds the two factors of a progressive series of ratios between them.',
      },
      { kind: 'h2', text: 'Watching it run' },
      {
        kind: 'p',
        text: 'animation.m draws the four slider-cranks moving together and flashes each cylinder as it fires. It makes the phase shift that the torque sum depends on visible.',
      },
      { kind: 'h2', text: 'What it leaves out' },
      {
        kind: 'p',
        text: 'These are coursework scripts. Friction is a flat 10 % of indicated power. There is no heat loss to the cylinder walls, no emissions model and no knock. The engine turns at one fixed speed, and the speed-fluctuation curve is an idealised sine between the flywheel’s limits rather than a simulation of the shaft. The repository has no write-up of the results; they print when the scripts run.',
      },
    ],
    sources: [
      {
        label: 'GitHub — ICE-matlab-simulator',
        href: 'https://github.com/Kronbii/ICE-matlab-simulator',
        kind: 'repository',
      },
    ],
    projectSlug: 'ice-engine-simulator',
    topics: [],
    keywords: ['MATLAB', 'engine simulation', 'slider-crank', 'Wiebe function', 'flywheel', 'gear ratios'],
  },
  {
    slug: 'ai-should-serve-society',
    state: 'ready',
    title: 'AI Should Serve Society — Not Just Industry and Billionaires',
    metaTitle: 'AI Should Serve Society — Not Just Industry and Billionaires',
    metaDescription:
      'An essay by Rami Kronbi on who AI actually serves: technology is never neutral, building for society is a choice, and what that looked like when his team built OmniSign for Lebanese Sign Language.',
    dek: 'Build with purpose. Others will follow.',
    body: [
      { kind: 'p', text: 'AI is moving fast. It is moving faster than our laws, faster than our ethics, and often, faster than our collective sense of responsibility.' },
      { kind: 'p', text: 'The real question isn’t how powerful AI can become.' },
      { kind: 'p', text: 'The question that keeps me up at night is: who does it actually serve?' },
      { kind: 'p', text: 'Right now, the vast majority of AI innovation is optimized for three things: scale, profit, and market dominance.' },
      { kind: 'p', text: 'And look — that’s not inherently wrong. Businesses need to grow. But it is incomplete.' },
      { kind: 'p', text: 'When AI serves only industry titans and billionaires, we miss out on its most profound potential: the ability to uplift society at large.' },
      { kind: 'h2', text: 'Technology is never neutral' },
      { kind: 'p', text: 'We have to stop pretending that algorithms are objective.' },
      { kind: 'p', text: 'Every model we train, every dataset we curate, and every deployment strategy we choose reflects a human choice.' },
      { kind: 'p', text: 'We are constantly answering silent questions:' },
      { kind: 'p', text: 'What problem are we solving? Who actually benefits from this solution? And who gets left behind?' },
      { kind: 'p', text: 'When we design purely for efficiency or revenue, technology naturally gravitates toward the people who already have money and power. It follows the path of least resistance.' },
      { kind: 'p', text: 'But society’s hardest problems — accessibility, safety, healthcare gaps, educational inequality, and the climate crisis — rarely sit at the top of a revenue roadmap.' },
      { kind: 'p', text: 'That is exactly why leadership matters.' },
      { kind: 'h2', text: 'Using AI for society is a choice' },
      { kind: 'p', text: 'Building AI for social good doesn’t mean abandoning technical excellence or innovation. It means redirecting that brilliance with intention.' },
      { kind: 'p', text: 'True leadership in this space — whether you are an engineer, a researcher, or a founder — isn’t about who builds the biggest model.' },
      { kind: 'p', text: 'It’s about choosing problems that matter, even if they don’t scale immediately.' },
      { kind: 'p', text: 'It’s about designing systems people can understand and trust, rather than black boxes that alienate them.' },
      { kind: 'p', text: 'It’s about measuring success by the impact you leave on a community, not just the valuation you raise in a seed round.' },
      { kind: 'h2', text: 'How we actually do this' },
      { kind: 'p', text: 'So how do we move this from an abstract ideal to reality?' },
      { kind: 'p', text: 'It starts by getting out of the bubble — building from real human pain points, not tech-first ideas looking for a problem.' },
      { kind: 'p', text: 'It means collaborating outside the tech echo chamber: sitting down with educators, doctors, and community leaders who understand the nuance of the problems we’re trying to solve.' },
      { kind: 'p', text: 'It means designing for constraints and accessibility, not just for the ideal user with the fastest internet connection.' },
      { kind: 'p', text: 'Sometimes, the most revolutionary thing you can do is ship a smaller, focused solution that solves one real problem incredibly well.' },
      { kind: 'h2', text: 'Building where nothing existed: a personal example' },
      { kind: 'p', text: 'My team and I experienced this firsthand when we built OmniSign.' },
      { kind: 'p', text: 'We saw a massive gap in accessibility for the Deaf community in Lebanon — there was no real-time tool to bridge the communication barrier.' },
      { kind: 'p', text: 'But when we started, we hit a wall. There wasn’t even a dataset for Lebanese Sign Language.' },
      { kind: 'p', text: 'The resources didn’t exist because the market hadn’t deemed it “profitable enough” to build them.' },
      { kind: 'p', text: 'We could have stopped there.' },
      { kind: 'p', text: 'Instead, we realized that if we wanted AI to serve this community, we had to do the heavy lifting ourselves.' },
      { kind: 'p', text: 'We built the dataset from scratch and developed the model to translate Lebanese Sign Language in real time.' },
      { kind: 'p', text: 'We didn’t wait for permission. We didn’t wait for big tech. We built it because it was necessary.' },
      { kind: 'p', text: 'For more insight, visit the official project website, linked below.' },
      { kind: 'h2', text: 'The kind of AI we should be proud of' },
      { kind: 'p', text: 'The AI worth building isn’t just faster — it’s safer.' },
      { kind: 'p', text: 'It doesn’t blindly replace people. It empowers them.' },
      { kind: 'p', text: 'It reaches those usually written off as “not the target market.”' },
      { kind: 'p', text: 'This isn’t about rejecting industry. It’s about expanding our definition of responsibility.' },
      { kind: 'h2', text: 'Final thought' },
      { kind: 'p', text: 'AI is going to shape society whether we intend it to or not.' },
      { kind: 'p', text: 'The difference between a future of exploitation and one of empowerment is who leads the conversation.' },
      { kind: 'p', text: 'If you are building AI today, you are already shaping that future.' },
      { kind: 'p', text: 'The real power move isn’t optimizing for the top 1%. It’s choosing to build for the rest of us.' },
      { kind: 'p', text: 'Build with purpose. Others will follow.' },
    ],
    sources: [
      {
        label: 'Medium — AI Should Serve Society',
        href: 'https://medium.com/@ramikronbi/ai-should-serve-society-not-just-industry-and-billionaires-52d6b685e35d',
        kind: 'article',
        note: 'First published here on 9 January 2026.',
      },
      {
        label: 'DEV — AI Should Serve Society',
        href: 'https://dev.to/ramikronbi/ai-should-serve-society-not-just-industry-and-billionaires-37c9',
        kind: 'article',
        note: 'Also published on DEV the same day.',
      },
      {
        label: 'OmniSign — team project page',
        href: 'https://laythayache.com/projects/omnisign',
        kind: 'article',
      },
    ],
    projectSlug: '',
    topics: ['applied-ai', 'civic-technology'],
    keywords: ['AI for social good', 'responsible AI', 'technology ethics', 'accessibility', 'OmniSign', 'Lebanese Sign Language'],
  },
]

export const articleMap = Object.fromEntries(articles.map((a) => [a.slug, a]))
export const readyArticles = articles.filter((a) => a.state === 'ready')
export const reviewArticles = articles.filter((a) => a.state === 'review')

export function getArticle(slug: string): typeof articles[number] | undefined {
  return articleMap[slug]
}
