import type { ProjectRecord } from './types'

export const projects: ProjectRecord[] = [
  {
    slug: 'five-inch-carbon-fiber-fpv-drone',
    state: 'ready',
    title: '5-inch carbon-fiber FPV drone',
    metaTitle:
      '5-inch carbon-fiber FPV drone, built and tuned in Betaflight',
    metaDescription:
      'A 5-inch carbon-fiber FPV drone Rami Kronbi designed and built, sized from thrust, weight and current, with Betaflight PIDs, GPS and return-to-home tuned.',
    summary:
      'A 5-inch carbon-fiber quadcopter I designed and built. I sized its propulsion and power from thrust, weight, and current calculations, configured and tuned Betaflight (PID loops, flight modes, GPS features, return-to-home), and evaluated GPS accuracy, RF link quality, and flight performance under GNSS jamming and IMU/GNSS integration constraints.',
    role: 'Designer and builder.',
    form: 'artifact',
    schemaType: 'CreativeWork',
    hero: {
      kind: 'image',
      media: {
        src: '/images/authority/fpv-drone/build.jpg',
        alt: 'The drone mid-build on an ESD mat: the 5-inch carbon-fiber frame with its four motors, beside the electronics, a battery, the radio transmitter, and calipers.',
        caption:
          'Mid-build: the 5-inch carbon-fiber frame and its motors, with the electronics, battery, and radio laid out beside it.',
        width: 1200,
        height: 1600,
      },
    },
    answer: {
      what: 'A 5-inch carbon-fiber FPV drone I designed, built, and tuned myself.',
      problem:
        'A drone flies well only when its propulsion and power fit its thrust, weight, and current budget, and its flight controller has to be configured and tuned before you can trust it with GPS features and return-to-home.',
      how: 'I selected the propulsion and power components from thrust, weight, and current calculations and integrated them on a 5-inch carbon-fiber frame. Then I configured and tuned Betaflight’s PID loops, flight modes, GPS features, and return-to-home behavior, and evaluated GPS accuracy, RF link quality, and flight performance under GNSS jamming and IMU/GNSS integration constraints.',
      role: 'I designed and built it, then configured, tuned, and tested it.',
    },
    stages: [
      {
        step: '01',
        title: 'Size',
        detail:
          'Propulsion and power components selected from thrust, weight, and current calculations.',
      },
      {
        step: '02',
        title: 'Build',
        detail: 'The parts go together on a 5-inch carbon-fiber frame.',
      },
      {
        step: '03',
        title: 'Tune',
        detail:
          'Betaflight PID loops, flight modes, GPS features, and return-to-home behavior configured and tuned.',
      },
      {
        step: '04',
        title: 'Evaluate',
        detail:
          'GPS accuracy, RF link quality, and flight performance evaluated under the GNSS jamming that is common in Lebanon.',
      },
    ],
    limits: [
      'The analysis panels are verified on simulated signals with known noise, vibration and distortion (the Noise Lab recovers the simulated white noise to within 1 %); long captures from the real unit are still to come.',],
    sources: [
      {
        label: 'Betaflight',
        href: 'https://betaflight.com',
        kind: 'documentation',
        note: 'The open-source flight-controller firmware it runs.',
      },
    ],
    articleSlug: 'engineering-a-five-inch-fpv-drone-from-first-principles',
    topics: ['control-systems', 'embedded-systems', 'robotics-perception'],
    keywords: [
      'FPV drone',
      'quadcopter',
      'UAV',
      'Betaflight',
      'PID tuning',
      'GPS',
      'return to home',
      'carbon fiber',
    ],
  },
  {
    slug: '360-spherical-panorama-stitching',
    state: 'ready',
    title: '360° spherical panorama stitching',
    metaTitle: '360° Spherical Panorama Stitching — CPU-only OpenCV pipeline',
    metaDescription:
      'A CPU-only Python and OpenCV pipeline that turns handheld phone video into an equirectangular panorama and a self-contained Three.js viewer.',
    summary:
      'A CPU-only Python and OpenCV pipeline that turns handheld phone video or stills into an equirectangular panorama and generates a Three.js viewer.',
    role: 'Sole developer.',
    form: 'artifact',
    schemaType: 'SoftwareSourceCode',
    hero: {
      kind: 'image',
      media: {
        src: '/images/authority/spherical-panorama/panorama.jpg',
        alt: 'Full equirectangular panorama reconstructed from a handheld phone sweep of an interior room.',
        caption:
          'Equirectangular panorama recovered from a 309-frame phone sweep. 4096 × 2048 output; 36.9% of the sphere imaged.',
      },
    },
    videos: [
      {
        src: '/images/authority/spherical-panorama/v2-sweep.mp4',
        poster: '/images/authority/spherical-panorama/v2-sweep-poster.jpg',
        alt: 'Simulated camera sweep: frames from a turning camera are placed into a panorama strip using the gyro, then bundle adjustment moves all 73 orientations into alignment while an error plot compares methods.',
        caption:
          'The second version, on a simulated sweep. Frames are first placed with the integrated gyro, then bundle adjustment solves all orientations and the focal length together. Mean rotation error: gyro 2.01°, pairwise chain 1.35°, bundle adjusted 0.04°.',
      },
    ],
    answer: {
      what: 'A CPU-only Python and OpenCV pipeline that turns handheld phone video or stills into an equirectangular panorama and generates a self-contained Three.js viewer.',
      problem:
        'General-purpose stitchers hide the geometric decisions behind a single call, which makes it hard to explain why a panorama tilts, ghosts, or drifts under real handheld capture.',
      how: 'Frames are extracted, matched with ORB features and RANSAC, related by homography under a pure-rotation camera model, projected back onto a sphere, and rendered in a browser viewer. Temporal smoothing damps the pitch and roll wobble left after per-pair estimation. A second version uses a gyro to guide matching and find loop closures, then bundle-adjusts every orientation and the focal length at once; so far it runs on simulated sweeps.',
      role: 'I built the pipeline, the viewer, the 186 tests, and the technical documentation on my own.',
    },
    stages: [
      {
        step: '01',
        title: 'Extract',
        detail:
          'Frames are pulled from a phone video by interval, count, frame rate, or measured motion. Camera intrinsics come from EXIF when available, otherwise from an explicit field of view or calibration file.',
      },
      {
        step: '02',
        title: 'Match',
        detail:
          'ORB features are matched between adjacent frames, filtered with Lowe’s ratio test, and validated by RANSAC. If an adjacent pair fails, the matcher tries across the gap and interpolates the missing step rather than silently discarding the frame.',
      },
      {
        step: '03',
        title: 'Rotate',
        detail:
          'The relative rotation is recovered from R = K⁻¹HK under a pure-rotation model. Numerical noise means the matrix is rarely a perfect rotation, so singular-value decomposition projects it back onto the rotation manifold before chaining.',
      },
      {
        step: '04',
        title: 'Warp',
        detail:
          'Each source frame is inverse-warped onto an equirectangular canvas. Each output pixel is a world direction; that direction is rotated into the camera, projected onto the image plane, and sampled.',
      },
      {
        step: '05',
        title: 'Blend',
        detail:
          'Overlaps are blended, multiband, feathered, or sharp, and the parts of the sphere the sweep never saw are inpainted from their surroundings.',
      },
      {
        step: '06',
        title: 'Smooth',
        detail:
          'A moving average over the chained global rotations damps per-pair pitch and roll wobble. It is deliberately simple: not bundle adjustment, loop closure, or exposure matching.',
      },
      {
        step: '07',
        title: 'View',
        detail:
          'The final 4096 × 2048 panorama is served through a self-contained Three.js viewer that makes the recovered geometry directly inspectable in a browser.',
      },
    ],
    measurements: [
      {
        label: 'Rotation error, v2',
        value: '0.04°',
        context: 'mean, bundle adjusted, on a simulated 73-frame sweep; 2.01° gyro only, 1.35° pairwise chaining',
      },
      {
        label: 'Sample frames',
        value: '309',
        context: 'phone video, single handheld sweep',
      },
      {
        label: 'Recovered sweep',
        value: '333°',
        context: 'from a horizontal pan',
      },
      {
        label: 'Median RANSAC inliers',
        value: '921',
        context: 'per adjacent pair',
      },
      {
        label: 'Interpolated pairs',
        value: '15 of 308',
        context: 'recovered across a gap',
      },
      {
        label: 'Sphere imaged',
        value: '36.9%',
        context: 'phone-height horizontal band',
      },
      {
        label: 'Output resolution',
        value: '4096 × 2048',
        context: 'equirectangular',
      },
      {
        label: 'End-to-end time',
        value: '~2 minutes',
        context: 'Ryzen 7 5800H, CPU only',
      },
      {
        label: 'Pitch wobble reduction',
        value: '13.5×',
        context: 'temporal smoothing, on the sample run',
      },
      {
        label: 'Roll wobble reduction',
        value: '5.2×',
        context: 'temporal smoothing, on the sample run',
      },
    ],
    limits: [
      'The analysis panels are verified on simulated signals with known noise, vibration and distortion (the Noise Lab recovers the simulated white noise to within 1 %); long captures from the real unit are still to come.',
      'Pure-rotation camera model — translation while sweeping introduces parallax that no homography can explain.',
      'A phone-height horizontal sweep sees a band around the viewer, so the poles are never captured; filling is not reconstruction.',
      'Blank walls and repeated textures weaken ORB matching and can force interpolation.',
      'The phone pipeline has no bundle adjustment or loop closure; drift is damped rather than corrected. The gyro-guided, bundle-adjusted version has only run on simulated data: no lens distortion, rolling shutter, or camera-gyro time offset, and a real capture would need a synced sensor log.',
      'No exposure matching; brightness changes remain visible across seams.',
    ],
    media: [
      {
        src: '/images/authority/spherical-panorama/stage1-frame.jpg',
        step: 'Extract',
        alt: 'A single extracted phone-video frame that becomes an input to the pipeline.',
        caption: 'Extract — one frame pulled from the phone video.',
      },
      {
        src: '/images/authority/spherical-panorama/stage2-matches.jpg',
        step: 'Match',
        alt: 'A pair of adjacent frames with ORB feature matches drawn between them.',
        caption: 'Match — ORB matches that survive Lowe’s ratio and RANSAC.',
      },
      {
        src: '/images/authority/spherical-panorama/stage3-many.jpg',
        step: 'Warp',
        alt: 'A mosaic of intermediate stitched frames laid onto the equirectangular canvas.',
        caption: 'Rotate and warp — every frame placed on the equirectangular canvas by its chained rotation, before smoothing.',
      },
      {
        src: '/images/authority/spherical-panorama/side-by-side.jpg',
        step: 'Smooth',
        alt: 'Side-by-side comparison of the panorama with and without temporal smoothing.',
        caption:
          'Smooth — long horizontal edges before and after.',
      },
      {
        src: '/images/authority/spherical-panorama/pano-on-band.jpg',
        step: 'View',
        alt: 'The recovered panorama shown as a horizontal band, illustrating incomplete spherical coverage.',
        caption: 'The captured band is only about 37% of the full sphere.',
      },
      {
        src: '/images/authority/spherical-panorama/v2-rotation-error.png',
        step: 'Smooth',
        alt: 'Log-scale plot of rotation error per frame against ground truth for gyro only, pairwise chaining and bundle adjustment on a simulated 73-frame sweep.',
        caption: 'Simulated: the gyro drifts to 4.3° by the last frame and pairwise chaining ends 2.1° off; bundle adjustment stays under 0.14° throughout.',
      },
      {
        src: '/images/authority/spherical-panorama/v2-loop-seam.webp',
        alt: 'Side-by-side close-up where the end of a simulated sweep meets its start: misaligned and doubled without bundle adjustment, continuous with it.',
        caption: 'Simulated: where the sweep meets its start, chaining leaves a 2.09° break; after bundle adjustment it is 0.03°.',
      },
      {
        src: '/images/authority/spherical-panorama/goat.webp',
        alt: 'Interactive Three.js viewer showing the reconstructed panorama being explored.',
        caption: 'View — the reconstructed geometry in the Three.js viewer.',
      },
    ],
    sources: [
      {
        label: 'GitHub — 360-spherical-stitching',
        href: 'https://github.com/Kronbii/360-spherical-stitching',
        kind: 'repository',
      },
      {
        label: 'Live viewer — 360.ramikronbi.com',
        href: 'https://360.ramikronbi.com',
        kind: 'demo',
      },
      {
        label: 'GitHub — the second version: gyro prior and bundle adjustment',
        href: 'https://github.com/Kronbii/360-spherical-stitching/tree/imu-bundle-adjustment',
        kind: 'repository',
        note: 'The simulator, the v2 pipeline, its tests and the media script.',
      },
      {
        label: 'README, TECHNICAL.md, and TEMPORAL_SMOOTHING.md',
        href: 'https://github.com/Kronbii/360-spherical-stitching#readme',
        kind: 'documentation',
      },
    ],
    articleSlug: 'building-a-360-panorama-stitcher-from-a-phone-sweep',
    topics: [
      'computer-vision',
      'robotics-perception',
      'open-source-engineering',
    ],
    keywords: [
      'panorama stitching',
      'equirectangular projection',
      'OpenCV',
      'ORB features',
      'RANSAC',
      'temporal smoothing',
      'Three.js viewer',
    ],
  },
  {
    slug: 'easypid-arduino-library',
    state: 'ready',
    title: 'easyPID',
    metaTitle: 'easyPID — hardware-agnostic Arduino PID controller library',
    metaDescription:
      'A hardware-agnostic Arduino PID library with independent instances, anti-windup, derivative filtering, state introspection, and an optional relay autotuner.',
    summary:
      'A hardware-agnostic Arduino PID controller library with independent instances, timing controls, anti-windup, derivative filtering, state introspection, and an optional relay autotuner.',
    role: 'Author.',
    form: 'diagram',
    schemaType: 'SoftwareSourceCode',
    hero: {
      kind: 'diagram',
      diagramId: 'pid-loop',
      caption:
        'The closed-loop signal path exposed by easyPID: setpoint, measured value, error, term contributions, and bounded output.',
      alt: 'Block diagram of a PID control loop showing setpoint, error, proportional, integral, and derivative branches, output saturation, and feedback from the plant sensor.',
    },
    answer: {
      what: 'A hardware-agnostic Arduino PID controller library published through Arduino Library Manager.',
      problem:
        'Most PID examples end at the equation, leaving timing, windup, noise, and diagnostics implicit — precisely the parts that decide whether a controller actually settles.',
      how: 'The library exposes independent controller instances with automatic or caller-supplied timing, selectable anti-windup, optional derivative low-pass filtering, output limits, runtime tuning, and per-term state introspection. An optional relay autotuner is available with documented operating conditions.',
      role: 'I wrote the library, its examples, and its documentation.',
    },
    stages: [
      {
        step: '01',
        title: 'Instance',
        detail:
          'Each control loop is its own object with its own gains and state, so a project can run multiple loops without sharing global state.',
      },
      {
        step: '02',
        title: 'Timing',
        detail:
          'Timing can be handled automatically from millis() or provided by a scheduler as an explicit delta, which keeps behavior stable when logging or another sensor changes loop duration.',
      },
      {
        step: '03',
        title: 'Bound',
        detail:
          'Output limits and selectable anti-windup behavior treat actuator saturation as an expected operating condition rather than an afterthought.',
      },
      {
        step: '04',
        title: 'Filter',
        detail:
          'An optional low-pass filter on the derivative term makes derivative action usable on the noisy sensors typically connected to microcontrollers.',
      },
      {
        step: '05',
        title: 'Inspect',
        detail:
          'Per-term contributions are exposed so tuning becomes diagnosis: it is possible to see whether the integral is carrying the system or the derivative is amplifying noise.',
      },
      {
        step: '06',
        title: 'Autotune',
        detail:
          'An optional relay autotuner deliberately drives the process into oscillation to derive candidate gains, with documented preconditions around bounded actuation and human supervision.',
      },
    ],
    measurements: [
      {
        label: 'Distribution',
        value: 'Arduino Library Manager',
        context: 'contributed Device Control library',
      },
      {
        label: 'Versions',
        value: '1.0.0, 1.1.0',
        context:
          'listed on the Arduino Library Manager 2026-01-15 and 2026-08-09',
      },
      { label: 'License', value: 'MIT' },
      {
        label: 'Architecture',
        value: 'Any',
        context: 'runs on AVR Uno-class boards and beyond',
      },
    ],
    limits: [
      'The analysis panels are verified on simulated signals with known noise, vibration and distortion (the Noise Lab recovers the simulated white noise to within 1 %); long captures from the real unit are still to come.',
      'Tuning is system-specific; a gain set that behaves on one plant will misbehave on another.',
      'Autotuning drives the process into sustained oscillation and requires safe actuator bounds, a tolerant process, and a person ready to stop the run.',
      'Filter and anti-windup behavior are choices with tradeoffs; the library exposes them rather than hiding them.',
    ],
    sources: [
      {
        label: 'easyPID tuning guide',
        href: 'https://github.com/Kronbii/easyPID/blob/main/docs/tuning_guide.md',
        kind: 'documentation',
      },
      {
        label: 'GitHub — easyPID',
        href: 'https://github.com/Kronbii/easyPID',
        kind: 'repository',
      },
      {
        label: 'Arduino Library Manager listing',
        href: 'https://www.arduinolibraries.info/libraries/easy-pid',
        kind: 'listing',
      },
      {
        label: 'Author profile — Arduino Libraries',
        href: 'https://www.arduinolibraries.info/authors/kronbii',
        kind: 'listing',
      },
      {
        label: 'README and examples',
        href: 'https://github.com/Kronbii/easyPID/tree/main/examples',
        kind: 'documentation',
      },
    ],
    articleSlug: 'designing-a-pid-library-for-real-embedded-control',
    topics: ['embedded-systems', 'control-systems', 'open-source-engineering'],
    keywords: [
      'PID controller',
      'Arduino library',
      'anti-windup',
      'derivative filtering',
      'relay autotuner',
      'embedded control',
    ],
  },
  {
    slug: 'imu-bench',
    state: 'ready',
    title: 'IMU test bench: live 3D view, noise measurement and calibration',
    metaTitle: 'IMU test bench (imu-bench): live 3D view, noise measurement and calibration for any IMU',
    metaDescription:
      'Connect an Inertial Sense IMX, a PX4 or ArduPilot flight controller, a microcontroller IMU or a ROS 2 topic and see it live in 3D within seconds, then measure it: vibration spectra, Allan-deviation noise, magnetometer calibration and camera–IMU alignment, with Kalibr-ready output. Open source.',
    summary:
      'A real-time workbench for inertial sensors. Connect an Inertial Sense IMX, a PX4 or ArduPilot flight controller, any microcontroller IMU or a ROS 2 topic, and within seconds the device is on screen as a live 3D model, with its raw signals at full rate, its health decoded bit by bit, and its magnetometer calibration laid bare. Then it measures what an integration needs: vibration spectra that expose motor tones and frame resonances, an Allan-deviation Noise Lab that writes the noise model Kalibr asks for, a magnetometer ellipsoid fit it applies to the stream, and a camera view that projects the IMU\'s horizon into the image and stabilises it by rotation alone. Sensors that only report gyro and accelerometer get attitude from a built-in fusion filter; every session can be recorded, replayed, or republished as standard ROS 2 topics. Developed against a real Inertial Sense RUG-3-IMX-5 for camera–IMU integration on an NVIDIA Jetson, and open source.',
    role: 'Sole author: architecture, sensor drivers, the C++ bridge on the vendor SDK, sensor fusion, the analysis maths, the ROS 2 bridge, the 3D and WebGL dashboard, tests and documentation.',
    form: 'artifact',
    schemaType: 'SoftwareSourceCode',
    hero: {
      kind: 'image',
      media: {
        src: '/images/authority/imu-bench/imx-live.png',
        alt: 'The imu-bench dashboard live on a real Inertial Sense RUG-3-IMX-5 over USB: the enclosure drawn in 3D over a contour-line terrain with its X, Y and Z axes, live roll, pitch and yaw, an attitude indicator, a heading card, and the unit\'s serial number.',
        caption:
          'Live on a real Inertial Sense RUG-3-IMX-5: the enclosure, modelled from its engineering drawing, moves with the sensor in real time.',
      },
    },
    videos: [
      {
        src: '/images/authority/imu-bench/dashboard.mp4',
        poster: '/images/authority/imu-bench/dashboard-poster.jpg',
        alt: 'Screen recording of the dashboard: the RUG-3 enclosure tilting and turning in 3D with axis callouts, while the roll, pitch and yaw readouts, the attitude indicator and the heading card follow it.',
        caption:
          'The full dashboard, recorded frame by frame from its built-in simulator; the same view runs live on real hardware.',
      },
    ],
    answer: {
      what: 'A real-time workbench that turns any inertial sensor into a live 3D view, a replayable recording and standard ROS 2 topics, whatever protocol the device speaks.',
      problem:
        'Every inertial sensor arrives with its own protocol, units, axes and vendor tool. Bringing one up can take days before you can even see whether it is pointing the right way, and every new sensor starts that work over.',
      how: 'A Python core with one driver per protocol translates each device into a small common language: SI units, an FRD body and a NED world. The Inertial Sense driver runs the vendor SDK through a C++ bridge; others speak MAVLink, JSON or CSV lines, or ROS 2. A Madgwick filter supplies attitude when the sensor has none, and a React, three.js and WebGL dashboard brings it all to life in 3D and runs the analysis: FFT spectra, Allan deviation in a background worker, a least-squares ellipsoid fit and pinhole camera geometry, each covered by tests.',
      role: 'I designed and built all of it: the drivers, the bridge, the fusion, the ROS 2 conversion, the dashboard and the tests, and brought it up on a real IMX unit and on PX4 software-in-the-loop.',
    },
    stages: [
      {
        step: '01',
        title: 'Connect',
        detail:
          'Plug in and go: drivers for the Inertial Sense IMX (found on USB automatically and followed across replugs), MAVLink autopilots, anything that prints JSON or CSV over serial, UDP, TCP or stdin, and ROS 2 Imu topics.',
      },
      {
        step: '02',
        title: 'Normalise',
        detail:
          'Every driver speaks the same few messages (device, attitude, IMU, magnetometer, barometer, status, link) in SI units with an FRD body and a NED world, converted to ROS conventions only at the ROS boundary.',
      },
      {
        step: '03',
        title: 'Fuse',
        detail:
          'A 6-axis Madgwick filter gives attitude to sensors that only report gyro and accelerometer, with a separate magnetometer heading loop, so a poor calibration can never tilt the horizon.',
      },
      {
        step: '04',
        title: 'Show',
        detail:
          'The device in 3D as what it really is (an enclosure drawn from its datasheet, a quadrotor, or a breakout board), full-rate strip charts with CSV export, barometric height, decoded health, magnetometer coverage plots and the device\'s configuration.',
      },
      {
        step: '05',
        title: 'Analyse',
        detail:
          'Welch spectra and a spectrogram show vibration by frequency; an Allan-deviation Noise Lab reads white noise, bias instability and random walk off a still capture and writes Kalibr\'s imu.yaml; an ellipsoid fit removes hard and soft iron; and the IMU\'s horizon, drawn into a synthetic or webcam image, gives the camera–IMU rotation and time offset.',
      },
      {
        step: '06',
        title: 'Hand on',
        detail:
          'Record and replay any session, or republish it live as ROS 2 Imu, MagneticField and FluidPressure topics for the rest of the robot. A test suite and continuous integration cover the maths, the parsers and the decoders.',
      },
    ],
    measurements: [
      {
        label: 'Raw IMU streaming',
        value: '1 kHz',
        context: 'from the Inertial Sense RUG-3-IMX-5 over USB at 1.00 ms spacing; attitude at 143 Hz',
      },
      {
        label: 'Hot-plug recovery',
        value: '0.12 s',
        context: 'to detect an unplug; the stream is back about 30 ms after the sensor returns, on whatever port it gets',
      },
      {
        label: 'Fused tilt accuracy',
        value: '0.06°',
        context: 'mean error on simulated motion with a 0.17 °/s gyro bias; 0.5° heading with a magnetometer',
      },
      {
        label: 'ROS 2 fidelity',
        value: '0.001°',
        context: 'attitude error after a full publish-and-subscribe round trip, ROS 2 Jazzy',
      },
    ],
    limits: [
      'The analysis panels are verified on simulated signals with known noise, vibration and distortion (the Noise Lab recovers the simulated white noise to within 1 %); long captures from the real unit are still to come.',
      'Verified on a real Inertial Sense RUG-3-IMX-5 and on PX4 1.18 in software-in-the-loop; ArduPilot and real flight-controller hardware have not been run yet.',
      'The line driver is verified with synthetic CSV and JSON streams; the bundled MPU-6050 sketch has not yet been run on hardware.',
      'The fusion accuracy figures come from simulated motion, not a reference rig.',
      'The video, the chart, spectrum and camera stills on this page come from the built-in simulator; the other stills are a real IMX unit and PX4 software-in-the-loop.',
    ],
    media: [
      {
        src: '/images/authority/imu-bench/px4-sitl.png',
        step: 'Connect',
        alt: 'The same dashboard connected over MAVLink to PX4 1.18 running in software-in-the-loop: the name reads PX4, a quadrotor model with nose, right and down axes and a motor callout showing Disarmed and LOITER, and the firmware version.',
        caption:
          'Point it at a flight controller instead: on PX4 1.18 in software-in-the-loop it recognises the vehicle, draws a quadrotor and reads the flight mode and sensor health.',
      },
      {
        src: '/images/authority/imu-bench/vibration.png',
        step: 'Analyse',
        alt: 'A log-scale power spectrum with X, Y and Z traces and peaks labelled in hertz, beside a 30-second spectrogram in which two motor tones step between throttle settings above a steady frame resonance.',
        caption:
          'Vibration by frequency, from the simulator: a motor tone and its harmonic stepping with throttle, and a fixed 23 Hz frame resonance.',
      },
      {
        src: '/images/authority/imu-bench/camera.png',
        step: 'Analyse',
        alt: 'Left: a synthetic camera view with the horizon and pitch ladder predicted by the IMU drawn over the tilted scene. Right: the same image warped by rotation alone so the horizon is level, the cropped border hatched.',
        caption:
          'A camera on the IMU, here synthetic: once mount and time offset are dialled in, the predicted horizon sits on the real one and the stabilised view holds level.',
      },
      {
        src: '/images/authority/imu-bench/signals.png',
        step: 'Show',
        alt: 'Four live strip charts: tilt, angular rate, specific force and magnetic field, each with X, Y and Z traces in orange, green and blue, a time window selector and a CSV button per chart.',
        caption:
          'Every signal at full rate, here from the simulator: tilt, angular rate, specific force and magnetic field, each exportable to CSV in one click.',
      },
    ],
    sources: [
      {
        label: 'GitHub — imu-bench',
        href: 'https://github.com/Kronbii/imu-bench',
        kind: 'repository',
        note: 'Code, drivers, tests, the stream protocol and the IMX-5 integration guide.',
      },
      {
        label: 'Live demo',
        href: 'https://kronbii.github.io/imu-bench/',
        kind: 'demo',
        note: 'The full dashboard in your browser, no hardware needed, driven by its built-in simulator.',
      },
    ],
    articleSlug: '',
    topics: ['robotics-perception', 'embedded-systems', 'open-source-engineering'],
    keywords: [
      'IMU',
      'AHRS',
      'sensor fusion',
      'Inertial Sense IMX-5',
      'MAVLink',
      'PX4',
      'ROS 2',
      'Madgwick filter',
      'Allan variance',
      'Kalibr',
      'vibration analysis',
      'camera–IMU calibration',
      'Python',
      'C++',
      'TypeScript',
      'three.js',
    ],
  },
  {
    slug: 'brainiacs-autonomous-race-car',
    state: 'ready',
    title: 'Brainiacs autonomous race car',
    metaTitle: 'Brainiacs autonomous race car — WRO Future Engineers 2023',
    metaDescription:
      'A WRO Future Engineers car that splits perception on a Jetson Nano from real-time control on an Arduino Mega, with OpenCV sign logic and PID steering.',
    summary:
      'A WRO Future Engineers vehicle dividing Jetson Nano perception from Arduino Mega real-time control, with OpenCV traffic-sign logic, PID steering, an MPU6050 IMU, and TCS34725 color sensing.',
    role: 'All the software, integration, sensors, and control; Wassim Ghaddar designed the hardware. Coached by Mohamad Al Kaderi.',
    form: 'artifact',
    schemaType: 'CreativeWork',
    hero: {
      kind: 'image',
      media: {
        src: '/images/authority/race-car/front.jpeg',
        alt: 'Front view of the Brainiacs vehicle showing camera, chassis, and drive wheels.',
        caption:
          'The car we raced at WRO Future Engineers 2023: the camera above the drivetrain for the perception pipeline.',
      },
    },
    answer: {
      what: 'A dual-processor autonomous vehicle built for the Future Engineers category of WRO Lebanon 2023, the national round of the World Robot Olympiad.',
      problem:
        'A twenty-day build had to combine visual understanding, traffic-marker logic, obstacle avoidance, and reliable motion on limited compute and a student budget.',
      how: 'Perception runs in Python and OpenCV on a Jetson Nano and is sent as compact events to an Arduino Mega, which owns the time-sensitive steering PID and drivetrain commands. A TCS34725 color sensor and MPU6050 IMU close gaps the camera cannot handle alone.',
      role: 'I did all the software, the integration, the sensors, and the control; Wassim Ghaddar designed the hardware. Our coach was Mohamad Al Kaderi.',
    },
    stages: [
      {
        step: '01',
        title: 'See',
        detail:
          'The Jetson Nano runs OpenCV lane and traffic-sign logic in Python. Its output is a small stream of events, not raw imagery.',
      },
      {
        step: '02',
        title: 'Decide',
        detail:
          'A TCS34725 color sensor and MPU6050 IMU refine track- and heading-related decisions when the visual channel is uncertain or off-cadence.',
      },
      {
        step: '03',
        title: 'Steer',
        detail:
          'The Arduino Mega closes a PID steering loop at a predictable cadence, isolating time-sensitive control from the vision pipeline’s bursty timing.',
      },
      {
        step: '04',
        title: 'Move',
        detail:
          'Motor commands drive the physical vehicle. Chassis, wiring, and power are part of the tuning problem, not incidental to it.',
      },
    ],
    measurements: [
      {
        label: 'Build time',
        value: '20 days',
        context: 'from scratch, as RHU reported',
      },
      {
        label: 'Placement',
        value: 'Second, Future Engineers',
        context: 'WRO Lebanon national round, July 2023',
      },
      {
        label: 'Event size',
        value: '>95 teams / >250 participants',
        context: 'the whole national event, across four categories',
      },
    ],
    limits: [
      'The analysis panels are verified on simulated signals with known noise, vibration and distortion (the Noise Lab recovers the simulated white noise to within 1 %); long captures from the real unit are still to come.',
      'We finished second: announced third in July 2023, and re-ranked to second afterwards.',
      'Twenty days only leaves so much time to optimise or document each subsystem.',
      'Track and traffic-sign behavior are tied to the WRO Future Engineers 2023 environment and cannot be generalized without new testing.',
    ],
    media: [
      {
        src: '/images/authority/race-car/front.jpeg',
        alt: 'Front view of the Brainiacs vehicle showing camera, chassis, and drive wheels.',
        caption:
          'Front view — camera mounted above the drivetrain for the perception pipeline.',
      },
      {
        src: '/images/authority/race-car/schematic.png',
        step: 'Move',
        alt: 'Full electrical schematic of the vehicle, including Jetson Nano, Arduino Mega, motor driver, IMU, and color sensor.',
        caption:
          'System schematic — perception, control, sensing, and drive on one diagram.',
      },
      {
        src: '/images/authority/race-car/team.jpeg',
        alt: 'Team Brainiacs standing with the vehicle at the WRO Future Engineers competition venue.',
        caption: 'Team Brainiacs at the competition venue.',
        credit: 'Photo from the project team gallery.',
      },
    ],
    sources: [
      {
        label: 'GitHub — autonomous-race-car',
        href: 'https://github.com/Kronbii/autonomous-race-car',
        kind: 'repository',
      },
      {
        label:
          'RHU — Engineering students win big in the World Robotics Olympiad',
        href: 'https://www.rhu.edu.lb/media-room/news/rhu-engineering-students-win-big-in-the-world-robotics-olympiad',
        kind: 'institution',
      },
    ],
    articleSlug: 'building-an-autonomous-race-car-in-twenty-days',
    topics: [
      'robotics-perception',
      'embedded-systems',
      'computer-vision',
      'control-systems',
    ],
    keywords: [
      'WRO Future Engineers',
      'Jetson Nano',
      'Arduino Mega',
      'PID steering',
      'MPU6050',
      'TCS34725',
      'sensor fusion',
    ],
  },
  {
    slug: 'thermal-super-resolution',
    state: 'ready',
    title: 'Thermal super-resolution',
    metaTitle:
      'Thermal super-resolution: IMDN adapted to thermal imagery',
    metaDescription:
      'An IMDN-derived thermal super-resolution pipeline trained with thermal-specific objectives and optimized for edge inference on NVIDIA Jetson hardware.',
    summary:
      'An IMDN-derived single-channel thermal super-resolution pipeline trained with thermal-specific objectives and optimized for deployment on NVIDIA Jetson hardware.',
    role: 'Built it myself, for drones and ground robots: architecture adaptation, training, and edge inference.',
    form: 'artifact',
    schemaType: 'SoftwareSourceCode',
    hero: {
      kind: 'image',
      media: {
        src: '/images/authority/thermal-super-resolution/x2-showcase.webp',
        alt: 'Side-by-side comparison of a low-resolution thermal frame and its ×2 super-resolved output.',
        caption:
          '×2 super-resolution — a low-resolution thermal frame beside the reconstructed output on the same scene.',
      },
    },
    answer: {
      what: 'A single-channel super-resolution pipeline that adapts an Information Multi-Distillation Network to thermal imagery for deployment near the sensor.',
      problem:
        'RGB-trained super-resolution models can hallucinate texture that has no thermal meaning, and higher-resolution thermal sensors are expensive relative to lower-resolution alternatives.',
      how: 'The IMDN architecture is adapted to a single channel, pretraining is transferred from RGB data, a thermal-specific training objective shifts attention toward heat-relevant gradients and contrast, and the model is optimized toward FP16 and INT8 execution on NVIDIA Jetson hardware.',
      role: 'I built it myself, for unmanned aerial and ground vehicles that need to see in the dark: the architecture adaptation, the training, and the edge inference.',
    },
    stages: [
      {
        step: '01',
        title: 'Adapt',
        detail:
          'Information Multi-Distillation Network layers are adapted from three-channel RGB to a single thermal channel to match sensor semantics.',
      },
      {
        step: '02',
        title: 'Transfer',
        detail:
          'Weights pretrained on RGB provide a useful starting point in a domain where thermal training data is scarce.',
      },
      {
        step: '03',
        title: 'Retrain',
        detail:
          'A thermal-specific objective moves the model toward gradients, contrast, and structure that belong to heat imagery, rather than photographic texture priors.',
      },
      {
        step: '04',
        title: 'Deploy',
        detail:
          'Inference is moved toward FP16 and INT8 execution and measured as a complete pipeline on named NVIDIA Jetson hardware, not as a bare model file.',
      },
    ],
    measurements: [
      {
        label: '×2 quality',
        value: '34.2 dB / 0.840',
        context: 'PSNR / SSIM',
      },
      {
        label: '×3 quality',
        value: '31.0 dB / 0.757',
        context: 'PSNR / SSIM',
      },
      {
        label: '×4 quality',
        value: '29.6 dB / 0.713',
        context: 'PSNR / SSIM',
      },
      {
        label: 'Edge inference',
        value: '~130 FPS',
        context: '×2 on an RTX 3070 laptop GPU (~60 FPS at ×4)',
      },
      {
        label: 'On the drone',
        value: '20–30 FPS',
        context: 'NVIDIA Jetson Orin, onboard'
      },
    ],
    limits: [
      'The analysis panels are verified on simulated signals with known noise, vibration and distortion (the Noise Lab recovers the simulated white noise to within 1 %); long captures from the real unit are still to come.',
      'Reported quality numbers are dataset-specific and become less constrained at larger enlargement factors.',
      '“Real time” is a property of a full pipeline on named hardware at a named input size, not of a model file. On an RTX 3070 laptop GPU it runs at about 130 FPS at ×2 and 60 FPS at ×4; on the Jetson Orin the drone carries, 20–30 FPS, faster than a thermal camera delivers frames.',
      'The next real test is task-based: does downstream detection actually improve?',
    ],
    media: [
      {
        src: '/images/authority/thermal-super-resolution/x2-showcase.webp',
        alt: 'Low-resolution thermal frame and its ×2 super-resolved reconstruction placed side by side.',
        caption: '×2 comparison.',
      },
      {
        src: '/images/authority/thermal-super-resolution/x3-showcase.webp',
        alt: 'Low-resolution thermal frame and its ×3 super-resolved reconstruction placed side by side.',
        caption:
          '×3 comparison — the task becomes less constrained as scale grows.',
      },
    ],
    sources: [
      {
        label: 'GitHub — thermal-super-resolution',
        href: 'https://github.com/Kronbii/thermal-super-resolution',
        kind: 'repository',
      },
    ],
    articleSlug: 'adapting-super-resolution-to-thermal-imagery',
    topics: ['computer-vision', 'edge-ai', 'robotics-perception', 'applied-ai'],
    keywords: [
      'thermal super-resolution',
      'IMDN',
      'Jetson Orin',
      'edge inference',
      'single-channel super-resolution',
    ],
  },
  {
    slug: 'pid-light-tracking-robot',
    state: 'ready',
    title: 'PID light tracker',
    metaTitle:
      'PID light tracker — a two-axis Arduino experiment in real control',
    metaDescription:
      'An Arduino two-axis light-tracking robot that turns PID tuning, sensor noise, saturation, and settling into a visible control experiment.',
    summary:
      'An Arduino project from fall 2024 that uses light sensing and two servo axes to follow a light source with PID control.',
    role: 'Lead developer and system architect, with Wassim Ghaddar on hardware integration and testing.',
    form: 'diagram',
    schemaType: 'SoftwareSourceCode',
    hero: {
      kind: 'image',
      media: {
        src: '/images/authority/pid-light-tracker/cad.jpg',
        alt: 'CAD render of the light tracker: a 3D-printed base, a pan servo, a tilt bracket, and a mount carrying four light sensors behind a cross-shaped shade.',
        caption: 'The tracker in CAD: two MG995 servos for pan and tilt, and four LDRs split by a shade so each axis sees a difference in light.',
      },
    },
    videos: [
      {
        src: '/images/authority/pid-light-tracker/video-two-axis-final.mp4',
        poster: '/images/authority/pid-light-tracker/video-two-axis-final-poster.jpg',
        alt: 'The finished two-axis tracker turning to follow a desk lamp as it is moved by hand.',
        caption: 'The finished tracker following a moving lamp on two axes.',
      },
      {
        src: '/images/authority/pid-light-tracker/video-single-axis-pid.mp4',
        step: 'Control',
        poster: '/images/authority/pid-light-tracker/video-single-axis-pid-poster.jpg',
        alt: 'An early prototype following a desk lamp, first on one axis, then on two axes with PID control.',
        caption: 'The prototype: one axis first, then two axes with PID.',
      },
      {
        src: '/images/authority/pid-light-tracker/video-two-axis-build.mp4',
        step: 'Actuate',
        poster: '/images/authority/pid-light-tracker/video-two-axis-build-poster.jpg',
        alt: 'Close-ups of the two-axis frame: the light-sensor boards under a printed shade, and the servos.',
        caption: 'The two-axis build: four light sensors under a shade, two servos.',
      },
    ],
    media: [
      {
        src: '/images/authority/pid-light-tracker/schematic.jpg',
        step: 'Sense',
        alt: 'Circuit schematic: four LDR voltage dividers with 10 kΩ resistors feeding the Arduino Uno’s analog inputs, and two servos on PWM pins 6 and 9.',
        caption: 'The circuit, simulated in Proteus: four LDR dividers into an Arduino Uno, two servos on PWM.',
      },
    ],
    answer: {
      what: 'An Arduino two-axis light-tracking robot that runs a PID controller against a small light-sensor array.',
      problem:
        'A tracker that can be made to move with proportional control is not the same as one that settles: gain, noise, saturation, and mechanical behavior all conspire.',
      how: 'Four light-dependent resistors form directional error signals, the Arduino runs a PID controller against them, and yaw and pitch servos move the sensor assembly. Calibration includes safe mechanical limits, sensor filtering, and a consistent update rate.',
      role: 'I led the software and system architecture; Wassim Ghaddar handled hardware integration and testing.',
    },
    stages: [
      {
        step: '01',
        title: 'Sense',
        detail:
          'Light-dependent resistors produce an error signal in two axes. Filtering and centering matter as much as the raw reading.',
      },
      {
        step: '02',
        title: 'Control',
        detail:
          'A PID controller converts error into servo commands. Proportional gain provides response; integral removes bias; derivative damps motion when the sensor is quiet enough for it to help.',
      },
      {
        step: '03',
        title: 'Actuate',
        detail:
          'Yaw and pitch servos move the sensor assembly. Backlash, limited travel, and chassis flex are inside the loop, not outside it.',
      },
      {
        step: '04',
        title: 'Calibrate',
        detail:
          'The system requires a defined center, safe mechanical limits, sensible sensor filtering, and a consistent update rate before tuning is meaningful.',
      },
    ],
    limits: [
      'The analysis panels are verified on simulated signals with known noise, vibration and distortion (the Noise Lab recovers the simulated white noise to within 1 %); long captures from the real unit are still to come.',
      'PID tuning is system-specific; per-axis gains may differ because inertia and friction differ per axis.',
      'Sensor noise can turn derivative action into jitter unless it is filtered.',
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
    articleSlug: 'what-a-two-axis-light-tracker-teaches-about-pid-control',
    topics: ['robotics-perception', 'embedded-systems', 'control-systems'],
    keywords: [
      'PID tuning',
      'light tracker',
      'Arduino',
      'two-axis servo',
      'sensor filtering',
    ],
  },
  {
    slug: 'fine-crack-tracing-toolkit',
    state: 'ready',
    title: 'Fine crack tracing toolkit',
    metaTitle:
      'Fine crack tracing: from segmentation masks to measurable paths',
    metaDescription:
      'A Python package and CLI that turns crack masks into ordered lines, splines, overlays, and metrics for infrastructure inspection.',
    summary:
      'An installable Python package and CLI for turning pre-segmented crack masks into ordered lines, optional splines, visual overlays, and evaluation metrics.',
    role: 'Built it from scratch and maintain it.',
    form: 'artifact',
    schemaType: 'SoftwareSourceCode',
    hero: {
      kind: 'image',
      media: {
        src: '/images/authority/fine-crack/test-frame.png',
        alt: 'A segmentation mask of a thin crack, red on black: the input the tracing toolkit starts from.',
        caption:
          'The input: a crack mask from a segmentation model, before it is traced into an ordered path.',
      },
    },
    answer: {
      what: 'A Python package and command-line interface that turn pre-segmented crack masks into ordered paths, smoothed curves, overlays, and metric exports.',
      problem:
        'A segmentation mask names the pixels but leaves inspection engineers without an ordered trace, a comparable reference, or an evaluation record.',
      how: 'The toolkit accepts frames and masks, extracts candidate crack points, orders them with a choice of classic, minimum-spanning-tree, or greedy strategies, optionally fits smoother curves, generates overlays, and exports metrics as CSV and JSON.',
      role: 'I built it from scratch for real-time crack and damage extraction: not just a segmentation mask, but metric details you can measure. I maintain the package, its command-line interface, and its documentation.',
    },
    stages: [
      {
        step: '01',
        title: 'Ingest',
        detail:
          'The toolkit consumes raw frames and pre-segmented masks. It begins after segmentation and does not attempt to detect cracks itself.',
      },
      {
        step: '02',
        title: 'Order',
        detail:
          'Candidate points can be ordered with a classic approach, a minimum-spanning-tree path, or a greedy alternative, chosen for the geometry at hand.',
      },
      {
        step: '03',
        title: 'Smooth',
        detail:
          'Optional spline fitting produces smoother traces without erasing meaningful bends. ORB or Shi-Tomasi features support corner detection where local structure matters.',
      },
      {
        step: '04',
        title: 'Evaluate',
        detail:
          'Outputs can be evaluated with precision, recall, F1, IoU, mean and maximum distance, and RMS error, and exported to CSV and JSON.',
      },
    ],
    media: [
      {
        src: '/images/authority/fine-crack/centreline-trace.png',
        step: 'Order',
        alt: 'Three crack shapes on a dark background, with a green polyline traced through each crack and pixel lengths labelled beside them.',
        caption:
          'Given a thin crack image, Shi-Tomasi corners ordered by a minimum spanning tree follow the centreline, 5–10 % short of a skeleton reference. The frame here is a 3 px skeleton of the mask, standing in for a fine crack.',
      },
      {
        src: '/images/authority/fine-crack/trace-comparison.png',
        step: 'Evaluate',
        alt: 'The same three crack masks traced three ways: default ORB with almost no path, Shi-Tomasi with MST following the outline, and a skeleton reference in pink.',
        caption:
          'The same mask used as the frame. With default settings, ORB finds almost no corners on a flat mask and one crack is recorded as 0 px; Shi-Tomasi with MST ordering traces the mask’s outline rather than its centreline.',
      },
    ],
    limits: [
      'The analysis panels are verified on simulated signals with known noise, vibration and distortion (the Noise Lab recovers the simulated white noise to within 1 %); long captures from the real unit are still to come.',
      'It needs a frame that shows the crack itself. Given only a thick mask, it traces the mask’s outline, not its centreline, and the default ORB corners can be too few to draw a path at all.',
      'The toolkit begins after segmentation and is not a crack detector.',
      'Validation at dataset scale, across crack types, widths, and imaging conditions, is the next step.',
      'The metrics keep their standard definitions; the package does not redefine them.',
    ],
    sources: [
      {
        label: 'GitHub — fine-crack-tracing',
        href: 'https://github.com/Kronbii/fine-crack-tracing',
        kind: 'repository',
      },
      {
        label: 'Package README and CLI documentation',
        href: 'https://github.com/Kronbii/fine-crack-tracing#readme',
        kind: 'documentation',
      },
    ],
    articleSlug: 'turning-segmented-cracks-into-measurable-paths',
    topics: [
      'computer-vision',
      'open-source-engineering',
    ],
    keywords: [
      'crack tracing',
      'segmentation post-processing',
      'infrastructure inspection',
      'ordered paths',
      'evaluation metrics',
    ],
  },
  {
    slug: 'multilingual-medical-prescription-ocr',
    state: 'hold',
    title: 'Multilingual Medical Prescription OCR',
    metaTitle:
      'Multilingual medical prescription OCR — CLI and FastAPI service',
    metaDescription:
      'A CLI and FastAPI service that extracts medicine names from Arabic, English, and French prescription images, framed as a prototype extraction tool with human review.',
    summary:
      'A CLI and FastAPI service that uses Gemini to extract medicine names from Arabic, English, and French prescription images, with an optional medicine database.',
    role: 'Built on my own.',
    form: 'diagram',
    schemaType: 'SoftwareSourceCode',
    hero: {
      kind: 'diagram',
      diagramId: 'prescription-flow',
      caption:
        'Flow of a prescription through the service — from ingest, through model extraction and optional database normalization, to a reviewable structured result.',
      alt: 'Diagram of a prescription OCR service showing image ingest, request validation, model extraction, optional medicine database normalization, and a structured result destined for human review.',
    },
    answer: {
      what: 'A CLI and FastAPI service that uses a Gemini-based extraction step to pull medicine names from prescription images in Arabic, English, and French.',
      problem:
        'Prescriptions are ambiguous inputs: handwriting varies, abbreviations are local, medicine names are easy to confuse, and pages routinely mix scripts.',
      how: 'The service wraps a bounded model call in a validated API and a batch-friendly CLI, supports an optional medicine database for normalization, keeps configuration and credentials out of the repository, and shapes its output so a person can check it.',
      role: 'I built the service, the CLI, and the documentation.',
    },
    stages: [
      {
        step: '01',
        title: 'Ingest',
        detail:
          'The CLI handles individual images or directories with bounded parallelism; the FastAPI service accepts validated requests and returns predictable responses.',
      },
      {
        step: '02',
        title: 'Extract',
        detail:
          'A Gemini-based extraction step produces a structured list of medicine names from images in Arabic, English, or French.',
      },
      {
        step: '03',
        title: 'Normalize',
        detail:
          'An optional medicine database supports normalization and review without pretending that a fuzzy match is a clinical decision.',
      },
      {
        step: '04',
        title: 'Review',
        detail:
          'The structured result is designed to be reviewed by a person against the source image. It is a prototype extraction step, not a prescribing, dispensing, or clinical decision system.',
      },
    ],
    limits: [
      'The analysis panels are verified on simulated signals with known noise, vibration and distortion (the Noise Lab recovers the simulated white noise to within 1 %); long captures from the real unit are still to come.',
      'The service extracts and does not prescribe, dispense, or check interactions.',
      'Every result has to be checked by a person against the source image.',
      'Real prescription images can contain personal health information, so I don’t use them as demos.',
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
    articleSlug: 'extracting-medicine-names-from-multilingual-prescriptions',
    topics: ['applied-ai', 'health-technology', 'document-intelligence'],
    keywords: [
      'medical OCR',
      'multilingual prescriptions',
      'Arabic OCR',
      'FastAPI',
      'Gemini',
      'human-in-the-loop',
    ],
  },
  {
    slug: 'daleel-lebanese-election-information',
    state: 'hold',
    title: 'Daleel',
    metaTitle:
      'Daleel: verifiable Lebanese election information',
    metaDescription:
      'An independent multilingual Lebanese parliamentary-election information platform designed around source archiving, append-only history, and verifiable records.',
    summary:
      'An independent, multilingual Lebanese parliamentary-election information platform designed around source archiving, append-only history, and verifiable records.',
    role: 'Lead developer, with Layth Ayache on the frontend and a separate content-ingestion backend.',
    form: 'artifact',
    schemaType: 'SoftwareSourceCode',
    hero: {
      kind: 'image',
      media: {
        src: '/images/authority/daleel/hero.jpeg',
        alt: 'Daleel product hero image from the project repository showing the platform’s branded interface.',
        caption:
          'Daleel — the platform’s hero identity as published in the project repository.',
      },
    },
    answer: {
      what: 'An independent, multilingual civic-technology platform for Lebanese parliamentary-election information.',
      problem:
        'Political information becomes more useful when a reader can see where each fact came from and how it changed. Ordinary content systems optimize for the current value and lose that trail.',
      how: 'The platform pairs a Next.js frontend with an Express backend, Prisma and PostgreSQL, JWT authentication, CSRF protection, rate limiting, and immutable data models intended to preserve a verifiable trail of sources and changes.',
      role: 'I lead the platform’s development; Layth Ayache contributed to the frontend and built a separate content-ingestion backend.',
    },
    stages: [
      {
        step: '01',
        title: 'Archive',
        detail:
          'Sources are archived alongside the records they support so a reader can inspect where a fact came from.',
      },
      {
        step: '02',
        title: 'Preserve',
        detail:
          'Data models are designed to be append-only, so record history is retained rather than overwritten.',
      },
      {
        step: '03',
        title: 'Translate',
        detail:
          'The platform is multilingual across Arabic, English, and French, treating direction, names, and source availability as first-class concerns rather than a translation layer.',
      },
      {
        step: '04',
        title: 'Protect',
        detail:
          'JWT authentication, CSRF protection, and rate limiting matter here because a single unauthorized change would undermine the whole promise.',
      },
    ],
    limits: [
      'The analysis panels are verified on simulated signals with known noise, vibration and distortion (the Noise Lab recovers the simulated white noise to within 1 %); long captures from the real unit are still to come.',
      'Daleel is independent: it is not an official election authority and has no institutional or political affiliation.',
      'I don’t present its dataset as complete, live, or officially certified.',
      'Correction workflows, contributor governance, legal review, and a visible policy for disputed information remain institutional work that a database cannot do on its own.',
    ],
    sources: [
      {
        label: 'GitHub — daleel',
        href: 'https://github.com/Kronbii/daleel',
        kind: 'repository',
      },
      {
        label: 'Technical documentation (TECHNICAL.md)',
        href: 'https://github.com/Kronbii/daleel/blob/main/docs/technical.md',
        kind: 'documentation',
      },
    ],
    articleSlug: 'designing-election-information-for-verifiability',
    topics: ['civic-technology', 'open-source-engineering'],
    keywords: [
      'civic technology',
      'Lebanese elections',
      'append-only data',
      'verifiability',
      'multilingual platform',
    ],
  },
  {
    slug: 'lebanese-motorcycle-theory-trainer',
    state: 'hold',
    title: 'Lebanese Motorcycle Theory Trainer',
    metaTitle: 'Lebanese motorcycle theory trainer — an Arabic RTL study tool',
    metaDescription:
      'An Arabic right-to-left Vite/React/TypeScript study tool for the Lebanese motorcycle theory exam with adaptive review and localStorage-only progress.',
    summary:
      'An Arabic right-to-left Vite/React/TypeScript study tool for the Lebanese motorcycle theory exam with adaptive review, coverage-aware selection, and localStorage-only progress.',
    role: 'Built on my own.',
    form: 'diagram',
    schemaType: 'SoftwareSourceCode',
    hero: {
      kind: 'gallery',
      items: [
        {
          src: '/images/authority/motorcycle-trainer/sign-127.webp',
          alt: 'Lebanese road-sign image from the trainer question bank.',
          caption: 'Road-sign question — sign 127.',
        },
        {
          src: '/images/authority/motorcycle-trainer/sign-135.webp',
          alt: 'Lebanese road-sign image from the trainer question bank.',
          caption: 'Road-sign question — sign 135.',
        },
        {
          src: '/images/authority/motorcycle-trainer/sign-140.webp',
          alt: 'Lebanese road-sign image from the trainer question bank.',
          caption: 'Road-sign question — sign 140.',
        },
        {
          src: '/images/authority/motorcycle-trainer/sign-150.webp',
          alt: 'Lebanese road-sign image from the trainer question bank.',
          caption: 'Road-sign question — sign 150.',
        },
      ],
    },
    answer: {
      what: 'A focused Arabic right-to-left React application for studying the Lebanese motorcycle theory exam.',
      problem:
        'Learning a fixed question bank rewards coverage of what a learner does not yet know, not repetition of what they already do. Doing this in a right-to-left interface adds directional detail that a generic quiz app does not handle well.',
      how: 'The trainer holds 251 multiple-choice questions including 101 road-sign questions, offers a 30-question exam mode with a 25/30 passing threshold, uses coverage-aware selection to surface unseen material, and stores per-learner progress in localStorage.',
      role: 'I built it on my own. It is not an official government app, and no government body endorses it.',
    },
    stages: [
      {
        step: '01',
        title: 'Bank',
        detail:
          '251 multiple-choice questions and 101 road-sign questions with extracted sign imagery form the trainer’s content base.',
      },
      {
        step: '02',
        title: 'Select',
        detail:
          'Coverage-aware selection surfaces unseen material before over-drilling familiar questions; missed and weaker questions receive more attention.',
      },
      {
        step: '03',
        title: 'Practice',
        detail:
          'Practice mode focuses on weak and recently missed items; review mode makes mistakes easy to revisit; exam mode uses a 30-question set with a 25/30 pass threshold.',
      },
      {
        step: '04',
        title: 'Preserve',
        detail:
          'Progress is stored in the browser’s localStorage. It is usable without an account and no personal study history is collected.',
      },
    ],
    measurements: [
      { label: 'Total questions', value: '251', context: 'multiple choice' },
      {
        label: 'Road-sign questions',
        value: '101',
        context: 'with extracted sign imagery',
      },
      { label: 'Exam length', value: '30', context: 'per attempt' },
      {
        label: 'Passing threshold',
        value: '25 / 30',
        context: 'in exam mode',
      },
    ],
    limits: [
      'The analysis panels are verified on simulated signals with known noise, vibration and distortion (the Noise Lab recovers the simulated white noise to within 1 %); long captures from the real unit are still to come.',
      'The trainer is not an official government application.',
      'Rules and exam procedures can change, so the question source and its update date should always be visible.',
      'Progress belongs to one browser unless a future feature exports or moves it.',
    ],
    media: [
      {
        src: '/images/authority/motorcycle-trainer/sign-127.webp',
        alt: 'Lebanese road-sign extracted from the trainer question bank (sign 127).',
        caption: 'A single road-sign question tile.',
      },
      {
        src: '/images/authority/motorcycle-trainer/sign-135.webp',
        alt: 'Lebanese road-sign extracted from the trainer question bank (sign 135).',
        caption: 'A single road-sign question tile.',
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
    articleSlug: 'building-an-adaptive-motorcycle-theory-trainer-for-lebanon',
    topics: ['education-technology', 'lebanon', 'frontend-engineering'],
    keywords: [
      'motorcycle theory exam',
      'Arabic RTL',
      'adaptive practice',
      'localStorage progress',
      'Vite React TypeScript',
    ],
  },
  {
    slug: 'local-first-ai-support-triage',
    state: 'hold',
    title: 'AI Customer Support Council',
    metaTitle:
      'AI Customer Support Council — a local-first internal triage console',
    metaDescription:
      'A self-hosted internal admin console built as a Valsoft Corporation technical assessment: LLM triage, deterministic routing, human review, and JSON export.',
    summary:
      'A self-hosted internal admin console for synthetic B2B support intake and triage, built as a technical-assessment deliverable for Valsoft Corporation. It is not a customer-facing platform.',
    role: 'Built on my own as a technical assessment for Valsoft Corporation.',
    form: 'diagram',
    schemaType: 'SoftwareSourceCode',
    hero: {
      kind: 'diagram',
      diagramId: 'support-council',
      caption:
        'A submission moves from intake through machine-assisted triage, deterministic routing and escalation, human review, persistence, and JSON export.',
      alt: 'Diagram of the AI Customer Support Council architecture: intake, LLM proposal, deterministic rules, human review, PostgreSQL persistence, and JSON export, with Redis-backed background work.',
    },
    answer: {
      what: 'A self-hosted internal admin console for synthetic B2B support intake and triage.',
      problem:
        'An LLM can fluently propose categories and urgency, but if it quietly becomes the policy engine the workflow loses both auditability and control.',
      how: 'A React/TypeScript/Vite frontend talks to a FastAPI/Pydantic/SQLAlchemy backend with Redis- and RQ-based background jobs, PostgreSQL persistence, and an Ollama-by-default local model provider or an optional OpenAI-compatible endpoint. Deterministic rules such as confidence thresholds and escalation conditions live outside the model.',
      role: 'I built it on my own as a technical-assessment deliverable for Valsoft Corporation.',
    },
    stages: [
      {
        step: '01',
        title: 'Intake',
        detail:
          'Synthetic B2B support submissions enter the system through a narrow admin console with a login, dashboard, submissions view, and submission detail view.',
      },
      {
        step: '02',
        title: 'Propose',
        detail:
          'A local LLM proposes a category, urgency, and rationale for each submission. Ollama is the default provider; an OpenAI-compatible endpoint is optional.',
      },
      {
        step: '03',
        title: 'Enforce',
        detail:
          'Deterministic rules apply confidence thresholds and escalation conditions. A low-confidence response can be sent for human review no matter how fluent the explanation sounds.',
      },
      {
        step: '04',
        title: 'Review',
        detail:
          'Human reviewers see the original submission, the model’s proposal, its confidence, and the rules that changed or escalated it. Accepting or overriding a result is explicit.',
      },
      {
        step: '05',
        title: 'Persist',
        detail:
          'State lives in PostgreSQL. Background work is scheduled through Redis and RQ. JSON export reflects the reviewed state, not a hidden intermediate prediction.',
      },
    ],
    limits: [
      'The analysis panels are verified on simulated signals with known noise, vibration and distortion (the Noise Lab recovers the simulated white noise to within 1 %); long captures from the real unit are still to come.',
      'The console is an internal admin tool for a technical assessment. It is not a customer-facing help desk.',
      'Local-first operation is a privacy and repeatability choice; it also creates operational responsibilities around model availability, queue state, and migrations.',
      'A failed inference and a failed support request are separate failure modes and are handled as such.',
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
    articleSlug: 'building-a-local-first-ai-support-triage-council',
    topics: ['applied-ai', 'full-stack-systems', 'local-first-software'],
    keywords: [
      'local-first AI',
      'support triage',
      'LLM plus deterministic rules',
      'Ollama',
      'FastAPI',
      'PostgreSQL',
    ],
  },
  {
    slug: 'ree-personal-finance-tracker',
    state: 'hold',
    title: 'REE Personal Finance Tracker',
    metaTitle: 'REE — an offline-first personal finance desktop app',
    metaDescription:
      'A Flutter desktop personal-finance application for multi-wallet transactions, subscriptions, debts, savings goals, and local insights.',
    summary:
      'A Flutter desktop personal-finance application for multi-wallet transactions, subscriptions, debts, savings goals, and local insights, with local SQLite storage.',
    role: 'Built on my own.',
    form: 'artifact',
    schemaType: 'SoftwareSourceCode',
    hero: {
      kind: 'image',
      media: {
        src: '/images/authority/ree-finance/image1.jpeg',
        alt: 'Screenshot of REE showing the desktop finance interface with wallets, transactions, and analysis views.',
        caption: 'REE on the desktop: the main workspace.',
      },
    },
    answer: {
      what: 'A Flutter desktop personal-finance application designed as a private, keyboard-aware, offline-first workflow.',
      problem:
        'Finance tools that begin with a dashboard hide the repeated work of records — wallets, income, expenses, transfers, subscriptions, debts, and goals — that dashboards are built on.',
      how: 'REE targets Flutter desktop with a clean data / domain / presentation split and local SQLite storage. Multi-wallet accounts, categorized transactions, bulk entry, subscriptions, debts in both directions, savings goals, and monthly and yearly analysis are first-class workflows.',
      role: 'I built it on my own.',
    },
    stages: [
      {
        step: '01',
        title: 'Record',
        detail:
          'Wallets, income, expenses, transfers, subscriptions, debts, and savings goals are entered efficiently, with bulk entry as a core workflow rather than a hidden setting.',
      },
      {
        step: '02',
        title: 'Store',
        detail:
          'Data lives locally in SQLite. The app starts and remains useful without an account or continuous network connection.',
      },
      {
        step: '03',
        title: 'Analyze',
        detail:
          'Monthly and yearly analysis, subscription tracking, and debt visibility emerge from records the user can inspect.',
      },
      {
        step: '04',
        title: 'Recover',
        detail:
          'Backup and export are essential; local ownership without recovery is fragile.',
      },
    ],
    limits: [
      'The analysis panels are verified on simulated signals with known noise, vibration and distortion (the Noise Lab recovers the simulated white noise to within 1 %); long captures from the real unit are still to come.',
      'Long-term reliability is the next bar to clear: migration tests, backup restoration, import validation, and rounding and currency handling.',
    ],
    media: [
      {
        src: '/images/authority/ree-finance/image1.jpeg',
        alt: 'REE desktop screenshot showing wallets and transaction entry.',
        caption: 'Primary workspace.',
      },
      {
        src: '/images/authority/ree-finance/image2.jpeg',
        alt: 'REE desktop screenshot showing analysis and category views.',
        caption: 'Monthly and yearly analysis.',
      },
      {
        src: '/images/authority/ree-finance/image3.jpeg',
        alt: 'REE desktop screenshot showing subscriptions and debts views.',
        caption: 'Subscriptions, debts, and goals.',
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
    articleSlug: 'designing-an-offline-first-personal-finance-desktop-app',
    topics: ['local-first-software', 'flutter', 'product-engineering'],
    keywords: [
      'personal finance',
      'Flutter desktop',
      'local-first',
      'SQLite',
      'offline-first',
    ],
  },
  {
    slug: 'juno',
    state: 'hold',
    title: 'Juno',
    metaTitle:
      'Juno — a local-first personal and household finance tracker for Linux and iPhone',
    metaDescription:
      'A Flutter finance tracker for the Linux desktop and iPhone by Rami Kronbi: local-first storage, optional Supabase sync, bank CSV import, budgets and goals, and logging from Siri, Shortcuts, and Back Tap.',
    summary:
      'A personal and household finance tracker for the Linux desktop and iPhone, built in Flutter. It is local-first, with optional Supabase sync between devices, and it is the new version of my earlier finance app, REE.',
    role: 'Built on my own.',
    form: 'artifact',
    schemaType: 'SoftwareSourceCode',
    hero: {
      kind: 'image',
      media: {
        src: '/images/vneo/juno-home.jpg',
        alt: 'Juno’s home screen with demo data: the month’s spending, budgets, and accounts.',
        caption: 'The home screen, with demo data.',
        width: 1440,
        height: 920,
      },
    },
    answer: {
      what: 'A local-first personal and household finance tracker for the Linux desktop and iPhone.',
      problem:
        'Tracking money only works if logging is quick enough to keep up, and a shared household needs to see what is personal and what is shared. Juno is built around both: fast entry everywhere, and a Personal or Household mark on every entry.',
      how: 'A Flutter app on drift tables, with every read and write going through one Ledger layer. Sync is optional: each round pushes local changes to Supabase and pulls server changes since a per-table cursor, with last-write-wins conflicts and deterministic ids so two devices converge instead of duplicating. On iPhone, Siri, Shortcuts, Back Tap, and the Action Button drop entries into a shared inbox that Juno imports on its next launch.',
      role: 'I built it on my own: the app, its sync engine, its design system, and its tests.',
    },
    stages: [
      {
        step: '01',
        title: 'Log',
        detail:
          'Expenses, income, and transfers across accounts, each marked Personal or Household. On desktop, N opens a new entry; on iPhone, Siri, Shortcuts, Back Tap, the Action Button, and a home-screen widget log without opening the app.',
      },
      {
        step: '02',
        title: 'Import',
        detail:
          'A bank CSV comes in with its columns guessed, categories learned, already-seen rows skipped, and an undo. Excel workbooks and Notion CSV exports import too, and export writes everything back out to CSV.',
      },
      {
        step: '03',
        title: 'Plan',
        detail:
          'Monthly budgets per category or scope, savings goals with contributions, and recurring entries that log themselves on their due date, with a reminder on the day and budget alerts at 80% and 100%.',
      },
      {
        step: '04',
        title: 'Understand',
        detail:
          'Where the money went this month, what changed against the same point last month, six-month trends, top places, recurring costs, totals per tag, and net worth over twelve months.',
      },
      {
        step: '05',
        title: 'Sync',
        detail:
          'Optional Supabase sync with row-level security. Every row carries an update time and a soft delete, so a device pushes what changed and pulls what it missed.',
      },
    ],
    limits: [
      'The analysis panels are verified on simulated signals with known noise, vibration and distortion (the Noise Lab recovers the simulated white noise to within 1 %); long captures from the real unit are still to come.',
      'Sync conflicts resolve last-write-wins, so if two devices edit the same entry before syncing, the later edit is the one kept.',
      'Exchange rates are the ones you set: totals stay in USD, and each entry keeps the USD value it was logged at.',
      'The iPhone app is built on a Mac and installed from Xcode.',
    ],
    media: [
      {
        src: '/images/authority/juno/insights.webp',
        alt: 'Juno’s Insights screen on the desktop with demo data: the month’s spending by category, a day-by-day calendar, and what changed this month.',
        caption: 'Insights on the desktop, with demo data.',
      },
      {
        src: '/images/authority/juno/plan.webp',
        alt: 'Juno’s Plan screen on the desktop with demo data: four monthly budgets with what is left in each.',
        caption: 'Budgets in Plan.',
      },
      {
        src: '/images/authority/juno/phone-home.webp',
        alt: 'Juno’s home screen on iPhone with demo data: the month’s spending, safe to spend today, and personal versus household spending.',
        caption: 'The home screen on iPhone.',
      },
    ],
    sources: [
      {
        label: 'GitHub — juno',
        href: 'https://github.com/Kronbii/juno',
        kind: 'repository',
      },
      {
        label: 'iPhone setup: widget, Siri, and Shortcuts',
        href: 'https://github.com/Kronbii/juno/blob/main/docs/ios-setup.md',
        kind: 'documentation',
      },
    ],
    articleSlug: 'rebuilding-my-finance-app-around-local-first-sync',
    topics: ['local-first-software', 'flutter', 'product-engineering'],
    keywords: [
      'personal finance',
      'household budget',
      'Flutter',
      'local-first',
      'Supabase sync',
      'iOS App Intents',
    ],
  },
  {
    slug: 'omnisign-lebanese-sign-language',
    state: 'ready',
    title: 'OmniSign — Lebanese Sign Language recognition',
    metaTitle: 'OmniSign: real-time Lebanese Sign Language recognition',
    metaDescription:
      'OmniSign recognizes Lebanese Sign Language in real time on phones and small boards. Rami Kronbi co-founded it and built its computer-vision pipeline.',
    summary:
      'OmniSign recognizes Lebanese Sign Language from a camera in real time, the alphabet and more than 30 everyday words and expressions, and turns it into text and speech. It runs on phones and on small boards like a Raspberry Pi 5 or a Jetson. I co-founded it and built its computer-vision pipeline; we collected more than 40,000 signs across Lebanon with deaf community partners, and it won First Prize in the Public Choice category at the National FYP Demo Day 2025.',
    role: 'Co-founder; I built the computer-vision pipeline, worked on the models, and built the embedded deployment with Layth Ayache.',
    form: 'artifact',
    schemaType: 'CreativeWork',
    hero: {
      kind: 'image',
      media: {
        src: '/images/authority/omnisign/omnisign-demo-poster.jpg',
        alt: 'A man holds a phone running OmniSign up to a driver who is signing through his car window.',
      },
    },
    videos: [
      {
        src: '/images/authority/omnisign/omnisign-demo-2025.mp4',
        poster: '/images/authority/omnisign/omnisign-demo-poster.jpg',
        alt: 'The OmniSign project film, narrated with English subtitles: why it started, data collection with community partners, and the app tested in a clinic, a café, and a car.',
        caption: 'The team’s project film: data collection with community partners, then the app tested in a clinic, a café, and a car.',
      },
    ],
    media: [
      {
        src: '/images/authority/omnisign/omnisign-lsl-arabic-alphabet-dataset.webp',
        step: 'Collect',
        alt: 'A grayscale grid of 28 hand signs photographed against a white wall, each labelled with its Arabic letter and name.',
        caption: 'The Arabic alphabet in Lebanese Sign Language: one signer, one raw frame per letter, before augmentation.',
      },
      {
        src: '/images/authority/omnisign/omnisign-app-clinic-test.jpg',
        step: 'Recognize',
        alt: 'A man in a blue jacket signs from a chair in a clinic room while a phone in the foreground shows him in the app’s camera view.',
        caption: 'Testing the app with a signer in a clinic room.',
      },
      {
        src: '/images/authority/omnisign/omnisign-app-counter-test.jpg',
        step: 'Speak',
        alt: 'A young man in glasses signs at a café counter as the cashier points a phone running the app at him.',
        caption: 'Testing at a café counter.',
      },
      {
        src: '/images/authority/omnisign/omnisign-data-collection-booth.jpg',
        step: 'Collect',
        alt: 'A team member leans over a laptop at an outdoor table while a woman in a headscarf signs beside printed sheets of hand-sign photos.',
        caption: 'A data-collection booth: volunteers sign from printed reference sheets while a laptop records.',
      },
      {
        src: '/images/authority/omnisign/omnisign-fyp-demo-day-2025-team.jpg',
        alt: 'Team members in a lecture hall holding LAU certificates of participation.',
        caption: 'National FYP Demo Day 2025 at LAU, where OmniSign won First Prize in the Public Choice category. Photo: Rafik Hariri University.',
      },
    ],
    answer: {
      what: 'A real-time recognizer for Lebanese Sign Language, with basic American Sign Language, that turns signs into text and speech on a phone or a small board.',
      problem:
        'Lebanese Sign Language has its own signs and regional variations, and almost no data. General sign-language models don’t carry over, so the dataset had to be built from scratch, with the people who sign it.',
      how: 'MediaPipe extracts hand, pose, and face landmarks from each frame. Isolated signs, like the alphabet, are classified from the hand landmarks; signs that unfold over time are read from a 30-frame window by an LSTM. The models run on phones, on a Raspberry Pi 5, on Jetson boards, and on a DX Robotics board, and the result is shown as text and spoken aloud.',
      role: 'I co-founded OmniSign and built its computer-vision pipeline: the landmark extraction, the data collection and cleaning, and the path from camera to prediction. I worked on the models with Layth Ayache, who led the AI and ML work, and we built the embedded deployment together. I tested it on an iPhone 13 Pro and a Raspberry Pi 5. The team: Layth Ayache, Tayseer Laz, Abou Baker Hussien Al Khatib, and Nour El Hariri, supervised by Dr. Oussama Mustapha at RHU.',
    },
    stages: [
      {
        step: '01',
        title: 'Collect',
        detail:
          'Three months of collection across Lebanon, with the Sin El Fil Church deaf community, the Aaramoun Orphanage Center, SignWithNaila, and RHU: more than 40,000 signs, stored as landmarks per signer and per sign.',
      },
      {
        step: '02',
        title: 'See',
        detail:
          'MediaPipe turns each frame into hand, pose, and face landmarks, so the model learns the shape of a sign, not the person or the room.',
      },
      {
        step: '03',
        title: 'Recognize',
        detail:
          'Single signs, like the alphabet, are classified from the 21 hand landmarks; signs that move are read from 30 frames at a time by an LSTM.',
      },
      {
        step: '04',
        title: 'Speak',
        detail:
          'The recognized sign is shown as text and spoken, on a phone or on a small board running offline.',
      },
    ],
    measurements: [
      { label: 'Public Choice', value: '1st prize', context: 'National FYP Demo Day, LAU, May 2025' },
      { label: 'Signs collected', value: '40,000+', context: 'across Lebanon, before augmentation' },
      { label: 'Accuracy', value: '98%', context: 'internal evaluation, controlled conditions' },
      { label: 'Runs on', value: 'Phones & boards', context: 'iPhone 13 Pro, Raspberry Pi 5, Jetson, DX Robotics' },
    ],
    limits: [
      'The analysis panels are verified on simulated signals with known noise, vibration and distortion (the Noise Lab recovers the simulated white noise to within 1 %); long captures from the real unit are still to come.',
      'The 98% is an internal evaluation under controlled conditions; real use varies with lighting, camera angle, and signing speed.',
      'It recognizes the alphabet and a set of everyday words and expressions, not unrestricted continuous signing.',
    ],
    sources: [
      {
        label: 'Team project page — Layth Ayache',
        href: 'https://laythayache.com/projects/omnisign',
        kind: 'article',
      },
      {
        label: 'Team project page — Tayseer Laz',
        href: 'https://tayseerlaz.com/work/omnisign/',
        kind: 'article',
      },
      {
        label: 'RHU: OmniSign wins Public Choice at National FYP Demo Day 2025',
        href: 'https://www.rhu.edu.lb/media-room/news/rhu-team-wins-public-choice-award-at-national-fyp-demo-day-2025',
        kind: 'institution',
      },
      {
        label: 'GitHub — dataset collector prototype',
        href: 'https://github.com/laythayache/dataset-collector',
        kind: 'repository',
      },
    ],
    articleSlug: 'building-real-time-lebanese-sign-language-translation',
    topics: ['computer-vision', 'edge-ai', 'embedded-systems', 'applied-ai'],
    keywords: [
      'Lebanese Sign Language',
      'sign language recognition',
      'MediaPipe',
      'LSTM',
      'Raspberry Pi 5',
      'edge deployment',
      'accessibility',
    ],
  },
  {
    slug: 'posture-aware-classroom-desk',
    state: 'ready',
    title: 'Smart Interactive Desk (BEMO)',
    metaTitle:
      'Smart Interactive Desk (BEMO), a posture-aware classroom desk',
    metaDescription:
      'A posture-estimation prototype that closes a physical loop with a motorized desk.',
    summary:
      'A prototype that combines computer vision, ESP32 control, motorized height and tilt, immediate LED feedback, and a dashboard for longer-term patterns.',
    role: 'Team lead on a senior graduation project at Rafik Hariri University, supervised by Prof. Ahmad Kubeissi, with Bassam Kousa, Ali Daaboul, Mohamad Berjawi, and Mohamad Hariri; I worked on everything except the hardware design.',
    form: 'artifact',
    schemaType: 'CreativeWork',
    media: [
      {
        src: '/images/authority/smart-desk/demo.webp',
        alt: 'Animated demonstration of the BEMO desk adjusting height and tilt while its display updates.',
        caption: 'Demonstration animation from the project repository.',
      },
    ],
    diagramIds: ['posture-loop'],
    hero: {
      kind: 'image',
      media: {
        src: '/images/authority/smart-desk/night-pic.jpeg',
        alt: 'The BEMO smart desk prototype photographed at night with its tilting top, camera arm, and control screen lit.',
        caption: 'The BEMO prototype, from the project repository.',
      },
    },
    answer: {
      what: 'A prototype posture-aware desk that closes a physical loop between vision, control, and motion.',
      problem:
        'A posture model cannot be treated as an isolated prediction: camera placement, desk motion, false corrections, and mechanical limits all matter.',
      how: 'A camera-based posture model watches how you sit; ultrasonic and time-of-flight sensors measure the desk itself, so the motors can set its height and tilt safely, with feedback on a screen and a dashboard.',
      role: 'I led our five-person senior graduation project, supervised by Prof. Ahmad Kubeissi at RHU, with Bassam Kousa, Ali Daaboul, Mohamad Berjawi, and Mohamad Hariri. I worked across everything except the hardware design: the posture model, the sensors, the control, and the software.',
    },
    stages: [
      {
        step: '01',
        title: 'Observe',
        detail: 'A desk-mounted camera estimates posture.',
      },
      {
        step: '02',
        title: 'Decide',
        detail:
          'The ESP32 applies dead bands, mechanical limits, and slow transitions before acting.',
      },
      {
        step: '03',
        title: 'Move',
        detail: 'Motorized height and tilt actuators change the work surface.',
      },
      {
        step: '04',
        title: 'Signal',
        detail:
          'Immediate LED feedback and a longer-term dashboard keep the user in the loop.',
      },
    ],
    measurements: [
      {
        label: 'Award',
        value: 'Best Graduating Project',
        context: 'RHU Engineering Jury, 2025',
      },
    ],
    limits: [
      'The analysis panels are verified on simulated signals with known noise, vibration and distortion (the Noise Lab recovers the simulated white noise to within 1 %); long captures from the real unit are still to come.',
      'The repository also covers handwriting capture, a music player, and desk-to-desk messaging; this page sticks to the posture loop.',
      'It is a prototype: the posture model was tuned on our own team, not on a classroom of students.',
    ],
    sources: [
      {
        label: 'GitHub — smart-interactive-desk',
        href: 'https://github.com/Kronbii/smart-interactive-desk',
        kind: 'repository',
      },
      {
        label: 'Demo video',
        href: 'https://youtu.be/5TPmpPc6rjY',
        kind: 'video',
      },
    ],
    articleSlug: 'connecting-posture-estimation-to-a-motorized-desk',
    topics: ['embedded-systems', 'computer-vision', 'robotics-perception'],
    keywords: ['posture estimation', 'ESP32', 'motorized desk', 'closed loop'],
  },
  {
    slug: 'runway-inspection-uav',
    state: 'hold',
    title: 'Jetson-powered runway-inspection UAV',
    metaTitle:
      'Runway-inspection UAV: onboard FOD detection, in simulation',
    metaDescription:
      'A simulated runway-inspection UAV: a YOLOv11 debris detector onboard a Jetson at about 30 FPS, with similarity matching and false-positive filtering.',
    summary:
      'A runway-inspection UAV I’m building as a simulation project. A lightweight YOLOv11 detector for foreign object debris (FOD) runs onboard on a Jetson at about 30 FPS. I trained it on online and synthetically generated data, reached 75–80% model accuracy, and added similarity matching and false-positive filtering for in-flight tests that simulate runway conditions.',
    role: 'My own project; I develop and test it.',
    form: 'diagram',
    schemaType: 'CreativeWork',
    hero: {
      kind: 'diagram',
      diagramId: 'uav-fod',
      caption:
        'A lightweight YOLOv11 detector runs onboard on a Jetson at about 30 FPS; similarity matching and false-positive filtering clean up its detections during in-flight tests that simulate runway conditions.',
      alt: 'Diagram of the runway-inspection UAV pipeline: the UAV’s camera feeds a YOLOv11 FOD detector running onboard on a Jetson, followed by similarity matching and false-positive filtering; below, the training data (online and synthetic), the simulated runway flight tests, and the filtered detections.',
    },
    answer: {
      what: 'A simulated prototype of a drone that inspects a runway for foreign object debris, with the detector running onboard.',
      problem:
        'Foreign object debris is anything loose on a runway that shouldn’t be there. Spotting it from a drone means finding small objects on a large surface, from a moving camera, with only the compute the aircraft can carry.',
      how: 'A lightweight YOLOv11 detector runs onboard on a Jetson at about 30 FPS. I trained it on online and synthetically generated data, and on top of its raw detections I added similarity matching and false-positive filtering. The in-flight tests simulate runway conditions.',
      role: 'It’s my own project, ongoing since 2026: I trained the detector, run it onboard, and built the matching and filtering around it.',
    },
    stages: [
      {
        step: '01',
        title: 'Train',
        detail:
          'A lightweight YOLOv11 FOD detector, trained on online and synthetically generated data to 75–80% model accuracy.',
      },
      {
        step: '02',
        title: 'Detect',
        detail: 'The detector runs onboard on a Jetson at about 30 FPS.',
      },
      {
        step: '03',
        title: 'Filter',
        detail:
          'Similarity matching and false-positive filtering clean up the raw detections.',
      },
      {
        step: '04',
        title: 'Fly',
        detail: 'In-flight tests simulate runway conditions.',
      },
    ],
    measurements: [
      { label: 'Onboard speed', value: '~30 FPS', context: 'YOLOv11 on a Jetson' },
      {
        label: 'Model accuracy',
        value: '75–80%',
        context: 'trained on online and synthetic data',
      },
      { label: 'Status', value: 'Ongoing', context: 'simulation project, since 2026' },
    ],
    limits: [
      'The analysis panels are verified on simulated signals with known noise, vibration and distortion (the Noise Lab recovers the simulated white noise to within 1 %); long captures from the real unit are still to come.',
      'It’s a simulation project: the flight tests simulate runway conditions rather than fly over a real runway.',
      'The model learned from online and synthetic images, so the 75–80% says how it does on that kind of data. Real debris on a real runway is the harder test.',
    ],
    sources: [
      {
        label: 'Ultralytics YOLO11',
        href: 'https://docs.ultralytics.com/models/yolo11',
        kind: 'documentation',
        note: 'The detector family the onboard model comes from.',
      },
    ],
    articleSlug: 'running-fod-detection-on-a-uav',
    topics: ['edge-ai', 'robotics-perception', 'computer-vision', 'applied-ai'],
    keywords: [
      'FOD detection',
      'foreign object debris',
      'runway inspection',
      'UAV',
      'YOLOv11',
      'NVIDIA Jetson',
      'edge inference',
      'synthetic data',
    ],
  },
  {
    slug: 'emotion-recognition-autism-support',
    state: 'ready',
    title: 'Edge emotion-recognition prototype for children with autism',
    metaTitle:
      'Real-time emotion recognition for children with autism',
    metaDescription:
      'A real-time facial-landmark and CNN pipeline on a Jetson Orin Nano, built as a support tool for children with autism, at about 92% development accuracy.',
    summary:
      'A real-time emotion-recognition pipeline I developed in 2022–2023 as a support tool for children with autism. It pairs facial landmarks with a convolutional neural network and runs on a Jetson Orin Nano. After I combined and cleaned image and video data from CALMED, Kaggle, and other sources, it reached about 92% development accuracy. The prototype and the concept were later acquired following a Gulf-region competition.',
    role: 'Computer-vision intern at VIBE, a startup, in a small team with a mentor; I developed the pipeline and combined and cleaned its training data.',
    form: 'diagram',
    schemaType: 'CreativeWork',
    hero: {
      kind: 'diagram',
      diagramId: 'emotion-pipeline',
      caption:
        'Facial landmarks and a CNN run in real time on a Jetson Orin Nano, trained on combined and cleaned data from CALMED, Kaggle, and other sources. The output is there to support, not to diagnose.',
      alt: 'Diagram of the emotion-recognition pipeline: a camera, face and facial-landmark extraction, and a CNN on a Jetson Orin Nano; below, the combined training data, the real-time output, and a note that it is a support tool, not a diagnosis.',
    },
    answer: {
      what: 'A real-time emotion-recognition prototype for children with autism, running on a Jetson Orin Nano.',
      problem:
        'A support tool that reads facial expressions has to work for the children it is meant for, which means learning from data that includes them, and it has to keep up in real time on a small device.',
      how: 'Facial landmarks and a convolutional neural network run together on a Jetson Orin Nano in real time. I trained the network on image and video data from CALMED, Kaggle, and other sources that I combined and cleaned, and it reached about 92% development accuracy.',
      role: 'I developed the pipeline in 2022–2023, as a computer-vision intern at VIBE, a startup, in a small team with a mentor, and prepared the data it learned from, a collection of datasets around CALMED. The prototype and the concept were later acquired following a Gulf-region competition.',
    },
    stages: [
      {
        step: '01',
        title: 'Gather',
        detail:
          'Image and video data from CALMED, Kaggle, and other sources, combined and cleaned into one training set.',
      },
      {
        step: '02',
        title: 'Train',
        detail:
          'A convolutional neural network learns expressions from the cleaned data, reaching about 92% development accuracy.',
      },
      {
        step: '03',
        title: 'Run',
        detail: 'Facial landmarks and the CNN run live on a Jetson Orin Nano.',
      },
      {
        step: '04',
        title: 'Support',
        detail: 'The result is meant to support, never to diagnose.',
      },
    ],
    measurements: [
      {
        label: 'Development accuracy',
        value: '~92%',
        context: 'after combining and cleaning the data',
      },
      { label: 'Hardware', value: 'Jetson Orin Nano', context: 'real time' },
      {
        label: 'Outcome',
        value: 'Acquired',
        context: 'prototype and concept, following a Gulf-region competition',
      },
    ],
    limits: [
      'The analysis panels are verified on simulated signals with known noise, vibration and distortion (the Noise Lab recovers the simulated white noise to within 1 %); long captures from the real unit are still to come.',
      'The ~92% is development accuracy on the data I combined. It doesn’t tell you how it will do with one particular child in one particular room.',
      'It reads facial expressions, and an expression is not always what someone feels. It is a support tool, not a diagnosis.',
    ],
    sources: [
      {
        label: 'GitHub — CNN-Emotion-Detection',
        href: 'https://github.com/Kronbii/CNN-Emotion-Detection',
        kind: 'repository',
        note: 'The CNN training, live-test, and evaluation code. The dataset isn’t included.',
      },
      {
        label: 'CALMED dataset paper',
        href: 'https://arxiv.org/abs/2307.13706',
        kind: 'article',
        note: 'One of the datasets I trained on, built for emotion detection in children with autism.',
      },
    ],
    articleSlug: 'lessons-from-an-edge-emotion-recognition-prototype',
    topics: ['edge-ai', 'computer-vision', 'applied-ai'],
    keywords: [
      'emotion recognition',
      'autism',
      'Jetson Orin Nano',
      'CNN',
      'facial landmarks',
      'CALMED',
      'edge inference',
    ],
  },
  {
    slug: 'upstream-open-source-contributions',
    state: 'ready',
    title: 'Upstream fixes to Betaflight, PX4, and OpenFront',
    metaTitle:
      'Upstream contributions to Betaflight, PX4, and OpenFront',
    metaDescription:
      'Small, test-backed fixes contributed upstream to Betaflight flight-controller firmware, the PX4 EKF2 estimator, and the OpenFront browser game.',
    summary:
      'Fixes and one feature contributed to three upstream open-source projects: a Redpine CC2500 debug-mode fix and a W25M flash read fix in Betaflight, an EKF2 range-height reset fix in PX4, and a HUD feature and a HUD fix in OpenFront.',
    role: 'Sole author of each contribution; reviewed and merged, revised, or closed by the upstream maintainers.',
    form: 'diagram',
    schemaType: 'CreativeWork',
    hero: {
      kind: 'diagram',
      diagramId: 'upstream-fixes',
      caption:
        'Each contribution follows the same path: a reported fault, an explicit root cause, the smallest fix, a regression test, and a written rationale for the maintainers.',
      alt: 'Diagram of the contribution workflow: reported issue, root cause, minimal fix, regression test, written rationale, and maintainer review.',
    },
    media: [
      {
        src: '/images/authority/upstream/betaflight-15706.jpg',
        step: 'Betaflight #15706 — Redpine CC2500 debug mode',
        alt: 'GitHub page of Betaflight pull request #15706, “give the Redpine CC2500 driver its own debug mode”, marked Merged, with three maintainer approvals.',
        caption: 'Betaflight #15706, merged by the maintainers on 16 September 2026.',
      },
      {
        src: '/images/authority/upstream/betaflight-15705.jpg',
        step: 'Betaflight #15705 — short die reads in W25M flash',
        alt: 'GitHub page of Betaflight pull request #15705, “honour short die reads in w25m_readBytes”, open with approvals from blckmn, haslinghuis, and nerdCopter.',
        caption: 'Betaflight #15705, approved by three maintainers and waiting to merge.',
      },
      {
        src: '/images/authority/upstream/openfront-4868.jpg',
        step: 'OpenFront #4868 and #4985 — HUD fixes',
        alt: 'GitHub page of OpenFront pull request #4868, “Make the end timer warnings more visible”, marked Merged.',
        caption: 'OpenFront #4868, the end-of-game timer warnings, merged in August 2026.',
      },
    ],
    answer: {
      what: 'A set of small upstream pull requests to Betaflight, PX4, and OpenFront, each fixing a specific reported fault.',
      problem:
        'Flight-controller firmware and estimators fail in narrow, hardware-dependent ways: a debug channel that two drivers write with different meanings, a flash read that silently returns short, a height fusion path that never refreshes its timeout. The same discipline applies to a browser game HUD that a mobile browser can zoom into a stuck state.',
      how: 'I read the code path until the mechanism is explicit, reproduce or reason through the fault, change the smallest surface that removes it, add a regression test where the project has a test harness, and write the pull request so a maintainer can check the reasoning without re-deriving it.',
      role: 'I wrote each pull request. Betaflight #15706, OpenFront #4868, and OpenFront #4985 were merged by the maintainers; Betaflight #15705 is approved by three maintainers and waiting to merge; PX4 #28286 was closed as a duplicate of #28283, which applies the same fix and was merged.',
    },
    stages: [
      {
        step: '01',
        title: 'Betaflight #15706 — Redpine CC2500 debug mode',
        detail:
          'The FrSky and Redpine CC2500 drivers both wrote the same debug channel with different meanings for indices 0, 1, and 2, and a blackbox log records only the numeric debug mode, so the two layouts could not be told apart afterwards. The fix gives the Redpine driver its own debug mode. Merged 2026-09-16; 3 files, +24/−11.',
      },
      {
        step: '02',
        title: 'Betaflight #15705 — short die reads in W25M flash',
        detail:
          'The W25M wrapper split reads at die boundaries but assumed the die driver returned the full requested length. The W25N01G die driver clamps each transfer to a NAND page, so multi-page reads left the tail of the buffer unfilled while reporting success. The fix honours the returned count. Approved by three Betaflight maintainers and waiting to merge, as of 23 October 2026; 1 file, +16/−15.',
      },
      {
        step: '03',
        title: 'PX4 #28286 — recurring EKF2 range height resets',
        detail:
          'When a range finder was the only active height source, successful range fusion did not refresh the estimator’s global height-fusion timestamp, so altitude reset every five seconds. The proposed fix refreshes the timestamp on successful range height fusion and adds regression coverage; the new test failed before the change and passed after it (187 of 187 tests). Closed on 2026-08-19 as a duplicate of #28283, which was opened first and applies the same fix; #28283 was merged on 2026-09-09. Mine was 5 files, +40/−5.',
      },
      {
        step: '04',
        title: 'OpenFront #4868 and #4985 — HUD fixes',
        detail:
          '#4868 adds a progressive end-of-game timer warning (center alert at 1:00, alternating timer at 0:30, alternating control bar at 0:10) with reduced-motion handling and focused tests; merged 2026-08-07. #4985 stops iOS double-tap zoom from leaving the HUD stuck off-screen, using touch-action: manipulation plus a narrow touchend guard; merged 2026-08-13.',
      },
    ],
    measurements: [
      {
        label: 'Pull requests',
        value: '5',
        context: 'three merged, one approved and waiting, one closed as a duplicate of a merged fix',
      },
      { label: 'Betaflight #15706', value: 'merged', context: '2026-09-16' },
      { label: 'OpenFront #4868', value: 'merged', context: '2026-08-07' },
      { label: 'OpenFront #4985', value: 'merged', context: '2026-08-13' },
      {
        label: 'PX4 #28286',
        value: 'duplicate',
        context: 'same fix merged as #28283',
      },
    ],
    limits: [
      'The analysis panels are verified on simulated signals with known noise, vibration and distortion (the Noise Lab recovers the simulated white noise to within 1 %); long captures from the real unit are still to come.',
      'These are small changes, not architecture work; the value is in the diagnosis and the tests, not the line count.',
      'My PX4 pull request was not the one merged: the maintainers kept #28283, opened first with the same fix, so I don’t count mine as an accepted contribution.',
    ],
    sources: [
      {
        label: 'Betaflight PR #15706',
        href: 'https://github.com/betaflight/betaflight/pull/15706',
        kind: 'repository',
      },
      {
        label: 'Betaflight PR #15705',
        href: 'https://github.com/betaflight/betaflight/pull/15705',
        kind: 'repository',
      },
      {
        label: 'PX4 PR #28286',
        href: 'https://github.com/PX4/PX4-Autopilot/pull/28286',
        kind: 'repository',
      },
      {
        label: 'PX4 PR #28283 (the merged fix)',
        href: 'https://github.com/PX4/PX4-Autopilot/pull/28283',
        kind: 'repository',
      },
      {
        label: 'OpenFront PR #4868',
        href: 'https://github.com/openfrontio/OpenFrontIO/pull/4868',
        kind: 'repository',
      },
      {
        label: 'OpenFront PR #4985',
        href: 'https://github.com/openfrontio/OpenFrontIO/pull/4985',
        kind: 'repository',
      },
    ],
    articleSlug: 'what-small-upstream-fixes-teach-about-firmware',
    topics: [
      'open-source-engineering',
      'embedded-systems',
      'robotics-perception',
    ],
    keywords: [
      'Betaflight',
      'PX4',
      'EKF2',
      'open-source contribution',
      'firmware debugging',
      'C',
    ],
  },
  {
    slug: 'hantawatch-outbreak-dashboard',
    state: 'hold',
    title: 'Hantawatch — outbreak situational-awareness dashboard',
    metaTitle:
      'Hantawatch — an OSINT dashboard for the 2026 MV Hondius hantavirus outbreak',
    metaDescription:
      'A deployed dashboard that aggregates public health and news sources into a live map, event feed, and indicators for a single outbreak.',
    summary:
      'A deployed situational-awareness dashboard for the MV Hondius hantavirus outbreak of April–May 2026, built from public sources only: a country choropleth, status-colored case events, a linked event feed, indicators, and a news ticker.',
    role: 'Sole developer.',
    form: 'diagram',
    schemaType: 'SoftwareSourceCode',
    hero: {
      kind: 'diagram',
      diagramId: 'osint-feed',
      caption:
        'Public sources are aggregated server-side and rendered as a map, feed, and indicators; every event row links back to its source.',
      alt: 'Diagram of the dashboard data flow: public sources, server-side aggregation, dashboard panels, URL-driven filters, and outbound source links.',
    },
    answer: {
      what: 'A live dashboard that turns public outbreak sources into one shareable situational view.',
      problem:
        'During a fast-moving outbreak, the public record is scattered across agency bulletins, a GIS layer, and news feeds. Reading them together, with a map and a sense of what changed, is the missing layer.',
      how: 'A Next.js server component fetches and normalizes WHO disease-outbreak news, CDC material, an ArcGIS case layer, and GDELT and Google News feeds; a client map renders a choropleth and case markers; filters live in the URL so any view can be shared.',
      role: 'I designed, built, and deployed it on my own.',
    },
    stages: [
      {
        step: '01',
        title: 'Aggregate',
        detail:
          'Cases, case events, and news are fetched in parallel on the server and normalized into one event model with source-health checks.',
      },
      {
        step: '02',
        title: 'Render',
        detail:
          'A dark basemap with a country choropleth of active cases, circle markers colored by status, an event feed, a KPI panel with deltas, a 14-day sparkline, and a news ticker.',
      },
      {
        step: '03',
        title: 'Filter',
        detail:
          'View, search text, and country are URL parameters; clicking a country polygon or a top-countries row toggles the country filter.',
      },
      {
        step: '04',
        title: 'Link out',
        detail:
          'Every event row is an anchor to its source page. The dashboard summarizes; it does not become the source.',
      },
    ],
    limits: [
      'The analysis panels are verified on simulated signals with known noise, vibration and distortion (the Noise Lab recovers the simulated white noise to within 1 %); long captures from the real unit are still to come.',
      'It aggregates public information only: no patient-level data, and it is not an epidemiological product.',
      'The source parsers are specific to one outbreak and its feeds; this is not a general surveillance system.',
      'There is no automated test suite yet, and the only documentation is a handoff note.',
    ],
    sources: [
      {
        label: 'Live dashboard',
        href: 'https://hanta-virus-dashboard.vercel.app',
        kind: 'demo',
      },
      {
        label: 'GitHub — hanta-virus-dashboard',
        href: 'https://github.com/Kronbii/hanta-virus-dashboard',
        kind: 'repository',
      },
    ],
    articleSlug: 'building-an-outbreak-dashboard-from-public-sources',
    topics: ['civic-technology', 'applied-ai'],
    keywords: [
      'OSINT',
      'outbreak dashboard',
      'Next.js',
      'Leaflet',
      'public health',
      'TypeScript',
    ],
  },
  {
    slug: 'basira-retinal-screening',
    state: 'hold',
    title: 'Basira — retinal screening decision support',
    metaTitle:
      'Basira — a council-of-models retinal screening prototype for eye clinics',
    metaDescription:
      'A multi-tenant prototype in which three independent retinal-image models read a fundus image, a consensus engine merges them, and a doctor confirms or overrides.',
    summary:
      'A prototype web platform for eye clinics in Lebanon in which three independent retinal-image models each analyze a fundus or OCT image, a consensus engine reports agreement, urgency, and a referral suggestion, and the reviewing doctor confirms or overrides before a report is issued.',
    role: 'Sole developer. Not clinically validated; not a medical device.',
    form: 'diagram',
    schemaType: 'SoftwareSourceCode',
    hero: {
      kind: 'diagram',
      diagramId: 'council-consensus',
      caption:
        'Three independent models vote; consensus is reported with an agreement score; a doctor has the final decision.',
      alt: 'Diagram of the Basira pipeline: image upload, three independent models, consensus engine, doctor review, and a PDF report.',
    },
    answer: {
      what: 'A decision-support prototype that second-reads retinal images for clinics and always leaves the decision to a doctor.',
      problem:
        'Retinal screening in a clinic depends on scarce specialist time. A second reader that prioritizes and flags, running on an ordinary CPU on site, could help, but only if it never pretends to diagnose.',
      how: 'A FastAPI backend, a separate ML service, and a Next.js frontend share one data directory. Three independent retinal-image models, each with a classification head trained on openly licensed public datasets (DDR, IDRiD, RFMiD, PAPILA), read the image; a consensus engine merges the three; the doctor confirms or overrides; a trilingual PDF report is generated.',
      role: 'I built the platform, the model integration, and the deployment on my own.',
    },
    stages: [
      {
        step: '01',
        title: 'Gate',
        detail:
          'An image-quality gate runs before any model; ungradable images are reported as such.',
      },
      {
        step: '02',
        title: 'Read three times',
        detail:
          'Each council member serves predictions only when its encoder and a trained head both load; an untrained head never produces a diagnosis, and the API reports stubs explicitly.',
      },
      {
        step: '03',
        title: 'Merge',
        detail:
          'The consensus engine reports unanimous, majority, or split agreement, an urgency level, and a referral recommendation, with explainability heatmaps.',
      },
      {
        step: '04',
        title: 'Review',
        detail:
          'The doctor’s confirmation or override is the record; the PDF report is generated from that decision.',
      },
    ],
    measurements: [
      {
        label: 'Council latency',
        value: '~2 s per eye',
        context: 'all three models on a plain CPU, no GPU',
      },
    ],
    limits: [
      'The analysis panels are verified on simulated signals with known noise, vibration and distortion (the Noise Lab recovers the simulated white noise to within 1 %); long captures from the real unit are still to come.',
      'Basira is in development. Benchmarks on public datasets guide the engineering but say nothing about clinical performance; the clinical validation study has not been run, and Basira is not a medical device.',
      'The live deployment uses a demo clinic and demo data only.',
    ],
    sources: [
      {
        label: 'Live prototype',
        href: 'https://basira.ramikronbi.com',
        kind: 'demo',
        note: 'Demo clinic and demo data only.',
      },
    ],
    articleSlug: 'designing-a-council-of-models-for-retinal-screening',
    topics: ['applied-ai', 'health-technology'],
    keywords: [
      'retinal screening',
      'decision support',
      'FastAPI',
      'Python',
      'ophthalmology',
    ],
  },
  {
    slug: 'imagen-raw-to-edit-dataset-pipeline',
    state: 'hold',
    title: 'Imagen — learning a photographer’s edit from RAW brackets',
    metaTitle:
      'Imagen — a RAW-to-retouched dataset pipeline and HDRNet training for real-estate photography',
    metaDescription:
      'An end-to-end pipeline that pairs bracketed RAW exposures with a photographer’s final edits and trains a bilateral-grid network to reproduce the style.',
    summary:
      'A freelance pipeline for a French real-estate photography agency that ingests bracketed RAW sessions, decodes them through a color-accurate DNG pipeline into 16-bit linear frames, pairs them with the photographer’s edited JPEGs, and trains an HDRNet model to replicate the editing style.',
    role: 'Computer vision engineer and author of the pipeline, with Layth Ayache on training runs.',
    form: 'diagram',
    schemaType: 'SoftwareSourceCode',
    hero: {
      kind: 'diagram',
      diagramId: 'raw-pipeline',
      caption:
        'Ingest, preprocess, targets, dataloader, and HDRNet training; each stage writes a manifest so a run can resume.',
      alt: 'Diagram of the Imagen pipeline: RAW bracket ingestion, color-accurate preprocessing, target generation, dataloader, and HDRNet training.',
    },
    answer: {
      what: 'A dataset pipeline and training setup that teaches a neural network to edit real-estate photographs the way one photographer does.',
      problem:
        'Architectural photographers shoot ambient brackets, flash fills, and lights-on stacks for every frame, then hand-blend and grade them. The style is consistent but slow to reproduce.',
      how: 'Brackets are grouped by timestamp; RAW files are decoded with the full DNG color pipeline (linearization, white balance and camera calibration, forward matrix, Bradford adaptation) and lens correction into 16-bit linear sRGB; the edited JPEG is linearized as the target; an HDRNet bilateral-grid network is trained on the pairs.',
      role: 'I designed and built the pipeline and its color science; Layth Ayache contributed training and delivery runs.',
    },
    stages: [
      {
        step: '01',
        title: 'Ingest',
        detail:
          'Detect −6/−3/0/+3/+6 EV ambient brackets, flash fills, and lights-on stacks across any listing folder structure; write an index per listing.',
      },
      {
        step: '02',
        title: 'Decode',
        detail:
          'Sony ARW through LibRaw; Canon EOS R5 DNG 1.7 with JPEG XL tiles through a tifffile fallback and the DNG specification’s color pipeline.',
      },
      {
        step: '03',
        title: 'Target',
        detail:
          'The photographer’s JPEG is linearized so the artistic values are preserved exactly.',
      },
      {
        step: '04',
        title: 'Train',
        detail:
          'HDRNet learns the mapping; the pipeline resumes automatically after interruption.',
      },
    ],
    measurements: [
      {
        label: 'Editing throughput before',
        value: '2–3 photos/day',
        context: 'a team of three, by the client’s count',
      },
      {
        label: 'Editing throughput after',
        value: '~40 photos/day',
        context: 'per team member, by the client’s count',
      },
    ],
    limits: [
      'The analysis panels are verified on simulated signals with known noise, vibration and distortion (the Noise Lab recovers the simulated white noise to within 1 %); long captures from the real unit are still to come.',
      'The photographs belong to the client, so none appear here, and the code is private.',
      'Style transfer is per photographer; the model does not generalize across agencies.',
    ],
    sources: [],
    articleSlug: 'why-color-science-comes-before-the-model',
    topics: ['computer-vision', 'applied-ai'],
    keywords: [
      'HDRNet',
      'RAW processing',
      'DNG',
      'color pipeline',
      'Python',
      'PyTorch',
    ],
  },
  {
    slug: 'lumiscan-lesion-dashboard',
    state: 'hold',
    title: 'Lumiscan dashboard — tracking skin lesions across scans',
    metaTitle:
      'Lumiscan dashboard — a multi-tenant clinical platform for a lesion-scanning device',
    metaDescription:
      'A patient, lesion, and scan platform built for an ESP32 lesion-scanning device, with organization-scoped data and narrative-only AI.',
    summary:
      'A Next.js and PostgreSQL platform that lets a clinic record patients, lesions, and successive scans from a lesion-scanning device, view metric trends over time, and generate narrative summaries, with strict organization scoping and a stubbed device-ingestion API.',
    role: 'Sole developer, built for the device’s product owner.',
    form: 'diagram',
    schemaType: 'SoftwareSourceCode',
    hero: {
      kind: 'diagram',
      diagramId: 'lesion-timeline',
      caption:
        'Organization scoping is structural; classification arrives from outside; the language model writes narratives only.',
      alt: 'Diagram of the Lumiscan data model: organization, patient, lesion, scan, timeline, narrative summaries, and follow-up notes.',
    },
    answer: {
      what: 'The software side of a lesion-scanning device: a place to keep patients, lesions, and scans, and to see whether a lesion is changing.',
      problem:
        'A device that classifies a mole is not a product on its own. Clinics need to track lesions over time, manage follow-up when something is flagged, and read a summary they can act on.',
      how: 'Next.js with tRPC for the interface, a versioned REST endpoint for devices, Drizzle on PostgreSQL, S3-compatible private image storage, and an Anthropic-backed narrative module. Every clinical row carries an organization id derived server-side; cross-organization access returns not-found.',
      role: 'I built the platform on my own for the device’s product owner; classification runs on the device, never in the app.',
    },
    stages: [
      {
        step: '01',
        title: 'Scope',
        detail:
          'Organization id is denormalized down every clinical table and never read from the client.',
      },
      {
        step: '02',
        title: 'Record',
        detail:
          'Manual entry is the MVP path; the device-ingestion API is defined, authenticated by hashed device keys, idempotent, and simulated by a script.',
      },
      {
        step: '03',
        title: 'Compare',
        detail:
          'A lesion timeline shows successive scans with metric trends and flags.',
      },
      {
        step: '04',
        title: 'Narrate',
        detail:
          'Patient-friendly and doctor-facing summaries are generated from stored results; the model never produces a classification.',
      },
    ],
    limits: [
      'The analysis panels are verified on simulated signals with known noise, vibration and distortion (the Noise Lab recovers the simulated white noise to within 1 %); long captures from the real unit are still to come.',
      'Prototype authentication with one local workspace; live device ingestion is deferred; HIPAA and GDPR are designed-for-later, not implemented.',
      'All patient data in the demo is synthetic, including generated dermoscopic imagery.',
      'The device and its classifier belong to the product owner, so I don’t go into them here.',
    ],
    sources: [
      {
        label: 'GitHub — lumiscan-dashboard',
        href: 'https://github.com/Kronbii/lumiscan-dashboard',
        kind: 'repository',
      },
    ],
    articleSlug: 'making-tenant-isolation-the-only-path',
    topics: ['applied-ai', 'health-technology', 'full-stack-systems'],
    keywords: [
      'multi-tenancy',
      'PHI',
      'tRPC',
      'Drizzle',
      'TypeScript',
      'medical device software',
    ],
  },
  {
    slug: 'evoid-applied-vision-venture',
    state: 'hold',
    title: 'Evoid — an applied computer-vision venture',
    metaTitle:
      'Evoid — co-founding a small applied AI and computer-vision venture in Beirut',
    metaDescription:
      'A small venture delivering computer-vision and mobile applications for external clients, co-founded by Rami Kronbi.',
    summary:
      'Evoid is a small applied AI and computer-vision venture in Beirut that I co-founded and worked in as systems engineer and product manager, delivering prototypes and applications for external clients.',
    role: 'Co-founder; systems engineer and product manager.',
    form: 'diagram',
    schemaType: 'CreativeWork',
    hero: {
      kind: 'diagram',
      diagramId: 'venture-loop',
      caption:
        'Each engagement starts from a client workflow, ships a bounded prototype, and feeds what was learned into the next one.',
      alt: 'Diagram of the venture’s engagement loop: client problem, bounded prototype, delivery and learning.',
    },
    answer: {
      what: 'A small venture that builds computer-vision and mobile software for clients, and the organization behind the PadelEye prototype.',
      problem:
        'Early-stage computer-vision work for real clients needs a vehicle that can scope, deliver, and maintain small systems without a large agency structure.',
      how: 'A small technical team takes bounded engagements; the venture’s public site is at evoid.dev; a padel line-judging prototype (PadelEye) is developed under its GitHub organization.',
      role: 'I co-founded Evoid and worked in it from 2023 to 2025, leading technical direction and client coordination, and I built most of the public site.',
    },
    stages: [
      {
        step: '01',
        title: 'Scope',
        detail:
          'Each engagement is bounded to one workflow and one deliverable.',
      },
      {
        step: '02',
        title: 'Build',
        detail:
          'Computer-vision and mobile prototypes; PadelEye is the venture’s own experiment in automated line judging from a camera stream.',
      },
      {
        step: '03',
        title: 'Deliver',
        detail: 'Delivery and maintenance stay with the same small team.',
      },
    ],
    measurements: [
      {
        label: 'Client applications',
        value: '5',
        context:
          'computer-vision apps delivered to external clients, 2023–2025',
      },
    ],
    limits: [
      'The analysis panels are verified on simulated signals with known noise, vibration and distortion (the Noise Lab recovers the simulated white noise to within 1 %); long captures from the real unit are still to come.',
      'Client names and outcomes stay private unless a client agrees otherwise.',
      'PadelEye is an early prototype with trained weights and scaffolding, not a product.',
    ],
    sources: [
      { label: 'evoid.dev', href: 'https://www.evoid.dev/', kind: 'demo' },
    ],
    articleSlug: 'what-a-small-vision-venture-taught-me-about-scope',
    topics: ['computer-vision', 'product-engineering'],
    keywords: [
      'computer vision',
      'startup',
      'Beirut',
      'product management',
      'PadelEye',
    ],
  },
  {
    slug: 'water-shooting-robot',
    state: 'hold',
    title: 'Water-shooting robot',
    metaTitle: 'Water-shooting robot — an Arduino mechatronic targeting system',
    metaDescription:
      'An early Arduino mechatronics project that aims, elevates, and fires timed water bursts at predefined targets using a simple ballistic model.',
    summary:
      'An early Arduino mechatronics project: a stepper-driven lift sets nozzle height, a servo aims, a solenoid valve fires timed bursts, and a simple ballistic and water-level model estimates the required height for each target.',
    role: 'Repository author.',
    form: 'diagram',
    schemaType: 'SoftwareSourceCode',
    hero: {
      kind: 'diagram',
      diagramId: 'water-robot',
      caption:
        'A target table drives aiming and height; a ballistic relation and a water-level update estimate each shot.',
      alt: 'Diagram of the water robot control sequence: target table, servo aim, stepper lift, solenoid burst, height model, and water-level update.',
    },
    answer: {
      what: 'A small mechatronic system that hits predefined targets with water bursts, without a pump.',
      problem:
        'Hitting a target with a gravity-fed stream depends on nozzle height and on how much water is left; both change from shot to shot.',
      how: 'Firmware on an Arduino steps through a table of target distances and angles, moves a lead-screw lift with a stepper, rotates the nozzle with a servo, opens a relay-driven solenoid for a timed burst, and updates a modeled water level with a Torricelli-style relation after each shot.',
      role: 'I wrote the firmware and organized the repository into firmware, test sketches, CAD, and documentation.',
    },
    stages: [
      {
        step: '01',
        title: 'Model',
        detail:
          'Required nozzle height is estimated from target distance and the current water height.',
      },
      {
        step: '02',
        title: 'Actuate',
        detail:
          'Stepper lift, servo aim, and a solenoid valve on a relay, each with its own bring-up test sketch.',
      },
      {
        step: '03',
        title: 'Calibrate',
        detail:
          'Steps per millimetre and predicted versus actual height are logged over serial.',
      },
    ],
    limits: [
      'The analysis panels are verified on simulated signals with known noise, vibration and distortion (the Noise Lab recovers the simulated white noise to within 1 %); long captures from the real unit are still to come.',
      'The physics is deliberately simplified, and the README says empirical tuning is needed.',
      'Wiring documentation is a placeholder and exact part numbers are not recorded.',
      'There are no test results or media in the repository; it is early mechatronics work, not a finished system.',
    ],
    sources: [
      {
        label: 'GitHub — water-shooting-robot',
        href: 'https://github.com/Kronbii/water-shooting-robot',
        kind: 'repository',
      },
    ],
    articleSlug: 'a-first-mechatronic-loop-without-a-pump',
    topics: ['robotics-perception', 'embedded-systems', 'control-systems'],
    keywords: [
      'Arduino',
      'mechatronics',
      'stepper',
      'servo',
      'solenoid',
      'C++',
    ],
  },
  {
    slug: 'bsheel-quest-app',
    state: 'ready',
    title: 'Bsheel — a gamified quest app for Lebanon',
    metaTitle:
      'Bsheel: a real-world quest app with checked proof',
    metaDescription:
      'Bsheel, co-founded with Razan Hasbini and Tayseer Laz, awards XP once quest proof is approved; Rami built its staged AI proof check, live in production.',
    summary:
      'Bsheel is a game you play in the real world. It hands you three random quests, you pick one, do it before its timer runs out, and post a photo or video as proof; XP lands once the proof is approved. I co-founded it with Razan Hasbini and Tayseer Laz. It is live on Google Play, the App Store, and bsheel.app, with more than 200 users, and my largest piece of the code is the automated proof check that sits in front of the moderators.',
    role: 'Co-founder, systems engineer, and product manager, with Razan Hasbini and Tayseer Laz.',
    form: 'diagram',
    schemaType: 'SoftwareSourceCode',
    hero: {
      kind: 'diagram',
      diagramId: 'quest-loop',
      caption:
        'Quest selection, timed completion, proof upload, moderation, XP, feed, and the admin console that keeps the loop honest.',
      alt: 'Diagram of the Bsheel quest loop: three quests, proof upload, moderation and XP, feed and votes, worker queue, and admin console.',
    },
    media: [
      { src: '/images/authority/bsheel/bsheel-quest-picker.jpg', step: 'Pick', alt: 'Bsheel’s quest picker offering three real-world quests, each with a category, time limit and XP reward.', caption: 'Three random quests; choosing one starts its timer.' },
      { src: '/images/authority/bsheel/bsheel-active-quest.jpg', step: 'Pick', alt: 'Bsheel home screen with an active quest, a countdown timer and its XP reward.', caption: 'An active quest, with the time left and the XP it is worth.' },
      { src: '/images/authority/bsheel/bsheel-proof-upload.jpg', step: 'Prove', alt: 'Submitting proof for a drawing quest: one image attached, a caption, and a toggle to show it in the feed.', caption: 'Submitting proof: the image, a caption, and whether it goes to the feed.' },
      { src: '/images/authority/bsheel/bsheel-feed.jpg', step: 'Share', alt: 'An approved quest post in the Bsheel feed, with the proof image, XP earned and the caption.', caption: 'Once approved, the proof lands in the feed with the XP it earned.' },
    ],
    answer: {
      what: 'A mobile app that turns everyday life into short real-world quests: pick one of three, do it inside a timer, prove it with a photo or video, and earn XP once the proof is approved.',
      problem:
        'A game about doing things in the real world is easy to cheat and slow to moderate. Every quest needs someone to look at the proof, and a wrong rejection punishes an honest player, so the review step decides whether the game means anything.',
      how: 'Flutter clients for the app and the admin console talk to one self-hosted NestJS API over HTTPS and a WebSocket. PostgreSQL is the source of truth, Redis and BullMQ carry queues and locks, proof media sits in S3-compatible storage, and a worker built from the same codebase handles fan-out. Before a moderator sees a submission, a staged check runs cheap forensics first, then vision models, against what each quest’s proof can actually show.',
      role: 'I co-founded Bsheel with Razan Hasbini and Tayseer Laz and work on it as systems engineer and product manager. In the code, I built the automated proof-verification pipeline and its evaluation tooling, business accounts and the partner dashboard, the analytics event store, and admin tools for quest chains and paged lists.',
    },
    stages: [
      {
        step: '01',
        title: 'Pick',
        detail:
          'Three random quests across fitness, creativity, social, learning, and adventure. The player picks one, and a timer set per quest starts.',
      },
      {
        step: '02',
        title: 'Prove',
        detail:
          'Photo or video proof goes to private object storage, and the submission enters review as pending.',
      },
      {
        step: '03',
        title: 'Check',
        detail:
          'Forensics run first: capture time, exact and near-duplicate matching, screen dimensions. A cheap vision model looks next, a stronger one only where it could not tell, and only the most capable model may conclude a photo is fake.',
      },
      {
        step: '04',
        title: 'Review',
        detail:
          'A moderator approves or rejects, with the agent’s read beside the proof. XP is awarded once. A rejected player gets one appeal, and a second rejection is final.',
      },
      {
        step: '05',
        title: 'Share',
        detail:
          'Approved quests enter the feed with votes, comments, follows, collab groups, a world map, and leaderboards; notifications fan out from a durable queue, not from the phone.',
      },
    ],
    limits: [
      'The analysis panels are verified on simulated signals with known noise, vibration and distortion (the Noise Lab recovers the simulated white noise to within 1 %); long captures from the real unit are still to come.',
      'Roughly a third of the quest catalogue cannot be proven by a photo at all: a picture of a book does not show you read twenty pages, and “spend an hour with no phone” is photographed by the phone. For those quests the check only judges whether the photo is authentic, and a person still decides.',
      'The automated check is live in production. It was built to run in shadow mode first, recording what it would have decided while a moderator made the call, and to act on its own only where its verdicts agree with real moderator decisions.',
      'Some partner analytics, like a quest card being shown, are reported by the phone and cannot be confirmed by the server, so the dashboard keeps them apart from completions the backend recorded itself.',
      'My part of the public repository is about thirty merged pull requests, most of them from September 2026. Much of the app is Tayseer’s and Razan’s work.',
    ],
    sources: [
      { label: 'bsheel.app', href: 'https://bsheel.app/', kind: 'demo' },
      {
        label: 'Bsheel on the App Store',
        href: 'https://apps.apple.com/lb/app/bsheel/id6761139416',
        kind: 'listing',
      },
      {
        label: 'BSHEEL on Google Play',
        href: 'https://play.google.com/store/apps/details?id=com.questapp.mobile_app',
        kind: 'listing',
      },
      {
        label: 'Bsheel source on GitHub',
        href: 'https://github.com/razanhasbini/bsheel-',
        kind: 'repository',
        note: 'The app, admin console, and NestJS backend.',
      },
      {
        label: 'My pull requests to Bsheel',
        href: 'https://github.com/razanhasbini/bsheel-/pulls?q=is%3Apr+author%3AKronbii',
        kind: 'repository',
        note: 'Proof verification, evaluation, business accounts, and admin tooling.',
      },
    ],
    articleSlug: 'moderation-is-the-product-in-a-quest-app',
    topics: ['applied-ai'],
    keywords: [
      'Bsheel',
      'quest app',
      'gamification',
      'content moderation',
      'proof verification',
      'Flutter',
      'NestJS',
      'PostgreSQL',
      'Redis',
      'BullMQ',
      'Lebanon',
    ],
  },
  {
    slug: 'moto-961-bikey',
    state: 'hold',
    title: 'Moto 961 (Bikey) — a motorcycle app for Lebanon',
    metaTitle:
      'Moto 961 (Bikey) — ride tracking as maintenance data for motorcyclists in Lebanon',
    metaDescription:
      'An early-stage Flutter app in which rides are recorded as odometer data that drives maintenance schedules, a parts and mechanic directory, and shared road hazards for riders in Lebanon.',
    summary:
      'An early-stage Flutter prototype for motorcyclists in Lebanon built around one idea: a ride is data about the bike, so recorded distance drives the maintenance schedule, which drives the parts and mechanic directory, while riders share road hazards.',
    role: 'Team member with Tayseer Laz, who owns the repository; exact role pending Rami’s statement.',
    form: 'diagram',
    schemaType: 'CreativeWork',
    hero: {
      kind: 'diagram',
      diagramId: 'bike-loop',
      caption:
        'Ride, odometer, service due, find part and mechanic, log the work; road hazards from other riders feed the next ride.',
      alt: 'Diagram of the Moto 961 loop: ride tracking, odometer, service schedule, marketplace and mechanic directory, work log, and shared hazards.',
    },
    answer: {
      what: 'A motorcycle app that treats rides as maintenance data rather than achievements.',
      problem:
        'In Lebanon a motorcycle is transport and often livelihood, and everything around it is undocumented: roads, mechanics, parts, and the bike’s own service history live in the rider’s head.',
      how: 'GPS distance is summed between filtered fixes and moves an odometer; a distance-keyed maintenance schedule flags service; a marketplace and workshop directory are scoped to where the rider actually rides; road hazards reported by riders inform the next ride. Flutter monorepo with feature packages, Mapbox, and local storage; no backend yet.',
      role: 'Rami Kronbi is a member of the project team; Tayseer Laz owns the repository and wrote the current prototype.',
    },
    stages: [
      {
        step: '01',
        title: 'Record',
        detail:
          'Rides are GPS tracks with noisy fixes discarded and distance computed honestly.',
      },
      {
        step: '02',
        title: 'Schedule',
        detail:
          'Service intervals are keyed to distance, so a ride matters because of what it did to the bike.',
      },
      {
        step: '03',
        title: 'Find',
        detail:
          'Parts and mechanics are surfaced near the rider’s real routes.',
      },
      {
        step: '04',
        title: 'Share',
        detail: 'Road hazards reported by riders feed alerts for others.',
      },
    ],
    limits: [
      'The analysis panels are verified on simulated signals with known noise, vibration and distortion (the Noise Lab recovers the simulated white noise to within 1 %); long captures from the real unit are still to come.',
      'Early prototype: the repository is days old, has no backend, no authentication, and no store release.',
      'A planned SOS and group-ride feature would involve location and emergency-contact data and is not built.',
      'Rami’s specific contribution is not yet stated on this page.',
    ],
    sources: [
      {
        label: 'Repository (private)',
        href: 'https://github.com/TayseerLaz/bikey',
        kind: 'repository',
        note: 'Owned by Tayseer Laz.',
      },
    ],
    articleSlug: 'a-ride-is-data-about-the-bike',
    topics: ['product-engineering', 'lebanon'],
    keywords: ['Flutter', 'motorcycle', 'Lebanon', 'maintenance', 'Mapbox'],
  },
  {
    slug: 'quadrotor-rotor-fault-recovery',
    state: 'ready',
    title: 'Rotor-fault detection and recovery for a quadrotor',
    metaTitle:
      'Rotor-fault detection and recovery for a quadrotor, in simulation',
    metaDescription:
      'Detecting a weakened or lost rotor within tens of milliseconds and flying on: a Kalman estimator, a CUSUM detector, and a yaw-relaxed controller, in simulation.',
    summary:
      'A reproducible study of rotor-fault tolerance for a 5-inch quadrotor: estimate how well each rotor still works, detect and isolate a loss within tens of milliseconds, and recover, including from the complete loss of one rotor. Validated offline on PX4 software-in-the-loop flights; the test on the real vehicle is prepared, not done.',
    role: 'Sole author: vehicle model, estimator, detector, controllers, simulator, experiments, PX4 software-in-the-loop automation, analysis and the paper.',
    form: 'artifact',
    schemaType: 'SoftwareSourceCode',
    hero: {
      kind: 'image',
      media: {
        src: '/images/authority/quadrotor-rotor-fault-recovery/complete-loss.png',
        alt: 'Plot of position error after one rotor stops at two seconds in simulated hover: the nominal controller flips within a few tenths of a second, while the estimating pipeline and a controller told the true fault both recover, with the alarm and the switch to the yaw-relaxed controller marked.',
        caption:
          'Simulation: one rotor stops at 2 s. The nominal controller flips; the pipeline raises the alarm, switches to the yaw-relaxed controller and recovers.',
      },
    },
    videos: [
      {
        src: '/images/authority/quadrotor-rotor-fault-recovery/rotor-loss-sim.mp4',
        poster: '/images/authority/quadrotor-rotor-fault-recovery/rotor-loss-sim-poster.jpg',
        alt: 'Side-by-side 3D animation of a quadrotor losing one rotor: the left one flips and is lost; the right one tilts, spins and holds near its hover point, with the detection statistic crossing its threshold underneath.',
        caption:
          'Complete loss of the front-right rotor in hover, simulated. The nominal controller flips within 0.3 s; the pipeline flags the fault in 22 ms, switches to a yaw-relaxed controller at 58 ms and keeps the drone within 39 cm of its hover point.',
      },
    ],
    answer: {
      what: 'A detect, isolate and recover pipeline for rotor faults on a small quadrotor, built and evaluated in a 6-DOF simulator and then replayed on PX4 software-in-the-loop flights.',
      problem:
        'A quadrotor has no spare actuators. A chipped propeller or failing motor has to be noticed and compensated within tens of milliseconds, and a rotor that stops entirely can only be survived by giving up control of yaw. Flight software for small quadrotors mostly just disarms.',
      how: 'A Kalman filter estimates each rotor’s remaining effectiveness from a filtered rigid-body regression on gyro, accelerometer and velocity data, against a baseline learned in the first seconds of hover. A bank of CUSUM tests decides when a loss has happened and which rotor it hit. Partial losses are handled by re-allocating thrust; a complete loss switches to a gain-scheduled yaw-relaxed LQR controller after Mueller and D’Andrea.',
      role: 'I wrote the models, the algorithms, the simulator and the experiments, automated the PX4 software-in-the-loop runs, and wrote the paper.',
    },
    stages: [
      {
        step: '01',
        title: 'Model',
        detail:
          'A 5-inch FPV-class vehicle, about 0.64 kg with a thrust-to-weight ratio of 3.6, with sensor noise, 10 ms motion-capture latency, parameter spread and light turbulence.',
      },
      {
        step: '02',
        title: 'Diagnose',
        detail:
          'Effectiveness regression with one common filter on every signal, a Kalman filter, a learned healthy baseline, and a CUSUM bank tuned for 15, 30 and 60 % losses and calibrated on separate fault-free flights.',
      },
      {
        step: '03',
        title: 'Recover',
        detail:
          'Thrust re-allocation for partial losses; a numerically solved relaxed-hover equilibrium and gain-scheduled LQR for a complete loss, accepting a spin of about 23 rad/s.',
      },
      {
        step: '04',
        title: 'Stress',
        detail:
          'Monte-Carlo experiments with passive and oracle baselines, an ablation, and robustness sweeps over actuator delay, motor lag and turbulence to find where recovery breaks.',
      },
      {
        step: '05',
        title: 'Validate',
        detail:
          '110 headless PX4 software-in-the-loop flights of the x500 model in Gazebo, with motor faults injected in the simulated ESC and the diagnoser replayed offline on the flight logs. The log pipeline for Betaflight blackbox data and a tethered-test protocol are ready for the real quad.',
      },
    ],
    measurements: [
      {
        label: 'Detection, simulation',
        value: '200 / 200',
        context: '20–90 % losses detected and isolated to the right rotor; median 30 ms, 95th percentile 58 ms',
      },
      {
        label: 'Complete losses recovered, simulation',
        value: '56 / 56',
        context: '32 in hover, 24 during a 3.3 m/s figure-eight; the nominal controller lost every one',
      },
      {
        label: 'Detection, PX4 SITL',
        value: '56 / 56',
        context: '40 partial and 16 complete losses; median 120 and 132 ms. PX4’s own detector flagged no partial loss',
      },
      {
        label: 'False alarms',
        value: '0',
        context: 'in 32 min of fault-free simulated flight and 22 min of fault-free SITL flight',
      },
    ],
    limits: [
      'The analysis panels are verified on simulated signals with known noise, vibration and distortion (the Noise Lab recovers the simulated white noise to within 1 %); long captures from the real unit are still to come.',
      'Everything is simulation or software-in-the-loop. Nothing has flown with a fault yet, and the vehicle parameters are assumed rather than identified on a real frame.',
      'Simulated and Gazebo sensors are far cleaner than a vibrating 5-inch frame, so the false-alarm numbers are optimistic.',
      'In PX4 software-in-the-loop the diagnoser ran offline on the flight logs; no fault-tolerant controller ran inside PX4.',
      'Complete-loss recovery started to fail at 24 ms of actuator delay (2 ms assumed), motors 3.2 times slower than modelled, and three times the default turbulence.',
      'The tethered test on the real quadrotor is planned, not done.',
    ],
    media: [
      {
        src: '/images/authority/quadrotor-rotor-fault-recovery/detection-delay.png',
        step: 'Diagnose',
        alt: 'Scatter plot: detection delay falls from about 90 ms at 20 % rotor loss to about 22 ms at 90 %, median 30 ms over 200 runs. In PX4 SITL, all 40 partial and 16 complete losses are detected at medians of 120 and 132 ms, against 664 ms for PX4’s own detector.',
        caption:
          'How fast a fault is caught: a 30 ms median over 200 simulated faults, and 120–132 ms in PX4 software-in-the-loop, where PX4’s own detector took 664 ms.',
      },
      {
        src: '/images/authority/quadrotor-rotor-fault-recovery/sitl-complete.png',
        step: 'Validate',
        alt: 'Chart of 16 complete rotor losses in PX4 software-in-the-loop: the diagnoser alarm at about 120 to 145 ms on every run, the vehicle tilting past 90 degrees at about 450 to 540 ms, and PX4’s failure detector at about 640 to 690 ms.',
        caption:
          'PX4 software-in-the-loop: on every complete loss the diagnoser alarms long before the vehicle tilts past 90°; PX4’s own detector triggers after it.',
      },
      {
        src: '/images/authority/quadrotor-rotor-fault-recovery/partial-sweep.png',
        step: 'Recover',
        alt: 'Plot of median peak position deviation against the share of effectiveness lost on one rotor in simulated hover, for the nominal controller, a controller told the true fault, and the estimating pipeline.',
        caption:
          'Simulation: up to 60 % loss, the pipeline holds position as well as a controller told the true fault.',
      },
    ],
    sources: [
      {
        label: 'GitHub — rotor-fault-recovery',
        href: 'https://github.com/Kronbii/rotor-fault-recovery',
        kind: 'repository',
        note: 'Code, generated results, figures and the paper.',
      },
    ],
    articleSlug: 'what-losing-a-rotor-teaches-about-estimation',
    topics: ['control-systems', 'robotics-perception'],
    keywords: [
      'rotor fault detection',
      'fault-tolerant control',
      'quadrotor',
      'CUSUM',
      'Kalman filter',
      'PX4 SITL',
    ],
  },
  {
    slug: 'esp32-barn-door-star-tracker',
    state: 'ready',
    title: 'ESP32 barn-door star tracker',
    metaTitle:
      'ESP32 barn-door star tracker that removes the tangent error',
    metaDescription:
      'A 3D-printed star tracker whose ESP32 times every microstep from the mechanism’s geometry to remove the tangent error. Designed and simulated; not yet built.',
    summary:
      'A 3D-printed barn-door tracker for photographing the Orion Nebula with a DSLR. The ESP32 firmware times every microstep from the exact geometry of the mechanism, a Python model predicts the longest sharp exposure for each lens, and a planner picks the night. Designed, compiled and tested in software; not yet built.',
    role: 'Sole designer and developer: mechanism and CAD, electronics, firmware, error model, planner and documentation.',
    form: 'artifact',
    schemaType: 'CreativeWork',
    hero: {
      kind: 'image',
      media: {
        src: '/images/authority/esp32-barn-door-star-tracker/cad-render.png',
        alt: 'CAD render of the unbuilt tracker: two hinged boards, a vertical lead-screw tower with a carriage, an electronics box and a sight tube along the hinge.',
        caption: 'CAD render of the design, before the build.',
      },
    },
    answer: {
      what: 'An ESP32 barn-door star tracker for DSLR astrophotography: parametric CAD, firmware, a tracking-error model, an observing planner and an autoguiding prototype.',
      problem:
        'The sky turns 15 arcseconds per second, so at 200 mm a fixed camera smears stars in under half a second. Cheap barn-door trackers are simple, but their geometry adds a tangent error that grows the longer they run.',
      how: 'A 2 mm-lead screw pushing a 200 mm arm gives a 629:1 reduction from 3D-printer parts. Instead of running the motor at a speed, the firmware schedules each microstep for the instant the ideal sidereal angle crosses it, using the closed-form inverse of the geometry, so the tangent error is removed exactly and errors cannot accumulate.',
      role: 'I chose the mechanism, derived the geometry, wrote the firmware and the models, and modelled the parts for printing.',
    },
    stages: [
      {
        step: '01',
        title: 'Choose the mechanism',
        detail:
          'Worm, belt, geared-stepper and lead-screw drives compared by how much they divide motor-side error; a tangent-arm barn door wins at 629:1, 0.64 arcseconds per microstep.',
      },
      {
        step: '02',
        title: 'Let the firmware do the geometry',
        detail:
          'Position-based microstep scheduling from the inverse kinematics, a 20 kHz integer-only step interrupt, slews, homing, guide pulses, periodic-error correction and an intervalometer.',
      },
      {
        step: '03',
        title: 'Predict before building',
        detail:
          'An error budget per source, from polar alignment to the screw’s periodic error, converted into the longest sharp exposure per focal length.',
      },
      {
        step: '04',
        title: 'Plan the night',
        detail:
          'Every night from October to March scanned with JPL ephemerides for darkness, the Moon and the target’s altitude, ending in a first-session plan.',
      },
    ],
    measurements: [
      {
        label: 'Tracking residual',
        value: '±0.32″',
        context: 'host simulation of the firmware scheduler over a 2 h sidereal run (half a microstep)',
      },
      {
        label: 'Sharp exposure at 200 mm',
        value: '21 s',
        context: 'predicted, APS-C 3.72 µm pixels, 0.25° polar error, 1.5 px trail; 0.38 s untracked',
      },
      {
        label: 'Per microstep',
        value: '0.64″',
        context: 'design value, 629:1 effective reduction',
      },
      {
        label: 'Tests',
        value: '110',
        context: '60 C++ on the firmware core under address and undefined-behaviour sanitizers, 50 Python; models checked against JPL ephemerides',
      },
    ],
    limits: [
      'The analysis panels are verified on simulated signals with known noise, vibration and distortion (the Noise Lab recovers the simulated white noise to within 1 %); long captures from the real unit are still to come.',
      'Not built and not tested under the sky. Every performance figure is a model prediction.',
      'The lead screw’s periodic error, assumed ±4 µm, is the largest uncertainty and dominates the predicted budget.',
      'Single axis: declination drift can be measured, not corrected.',
      'Polar alignment with the sight tube is coarse, predicted 0.15–0.4°.',
      'The autoguiding prototype has only seen synthetic star fields.',
    ],
    media: [
      {
        src: '/images/authority/esp32-barn-door-star-tracker/tangent-correction.png',
        step: 'Let the firmware do the geometry',
        alt: 'Two plots: the tangent error of a constant-speed barn door growing past 250 arcminutes over two hours, and the firmware schedule staying within plus or minus 0.3 arcseconds.',
        caption: 'Why the firmware schedules steps: constant speed drifts by degrees; the schedule stays within half a microstep. Host simulation of the firmware code.',
      },
      {
        src: '/images/authority/esp32-barn-door-star-tracker/exposure-vs-focal-length.png',
        step: 'Predict before building',
        alt: 'Log-log plot of predicted longest sharp exposure against focal length, tracked, worst case, with periodic-error correction and untracked.',
        caption: 'Predicted longest sharp exposure per focal length. Model predictions, not sky measurements.',
      },
    ],
    sources: [
      {
        label: 'GitHub — star-tracker',
        href: 'https://github.com/Kronbii/star-tracker',
        kind: 'repository',
        note: 'Firmware, Python models, OpenSCAD files, bill of materials and build guides.',
      },
    ],
    articleSlug: 'a-barn-door-tracker-that-does-the-maths',
    topics: ['embedded-systems', 'control-systems'],
    keywords: ['star tracker', 'barn door tracker', 'ESP32', 'astrophotography', 'stepper scheduling'],
  },
  {
    slug: 'drone-control-bootcamp',
    state: 'ready',
    title: 'Teach it: a drone-control bootcamp',
    metaTitle:
      'A seven-evening drone-control bootcamp, from PID to rotor faults',
    metaDescription:
      'A course from PID on an RC circuit to a quadrotor that survives losing a rotor, with auto-checked notebooks and Arduino labs. Designed; not yet taught.',
    summary:
      'A seven-evening course that takes engineering students from PID on an RC circuit to a quadrotor that survives losing a rotor, taught with my easyPID library and my rotor-fault study. Every session has notes, an auto-checked notebook, a lab, a quiz and slides. It is ready for a first cohort and has not been taught yet.',
    role: 'Sole author: curriculum, notebooks, Python package, Arduino labs, rig design, slides and cohort plan.',
    form: 'artifact',
    schemaType: 'CreativeWork',
    hero: {
      kind: 'image',
      media: {
        src: '/images/authority/drone-control-bootcamp/rig-cascade.png',
        alt: 'Plot of the seesaw rig’s beam angle stepping to 10 degrees and then absorbing a tap: a single PID loop swings to 17 degrees, a rate and angle cascade to 13.',
        caption:
          'Session 4 on the rig model: a single loop against a rate and angle cascade, both stepping to 10° and then hit by a tap. Simulation with assumed parameters.',
      },
    },
    answer: {
      what: 'A ready-to-run, seven-evening bootcamp on drone control — PID, attitude, fault tolerance — with auto-checked notebooks, Arduino labs on a two-motor seesaw rig, slides, an instructor guide and a cohort plan.',
      problem:
        'Control theory is usually taught on paper. Students with printers and electronics still lack a structured path from “what is PID” to “how does a drone stay up, and what happens when a propeller breaks”.',
      how: 'Bench electronics first, then one drone axis on a rig with a potentiometer for ground truth, then the full quadrotor and its faults in simulation. Every exercise is auto-checked, every lab is predicted by a notebook before it is measured, and the capstone is scored by the same code on the rig and in simulation.',
      role: 'I wrote the curriculum and its software, ported easyPID to Python for the notebooks, designed the rig, and set up CI that runs every notebook and compiles every sketch.',
    },
    stages: [
      {
        step: '01',
        title: 'Bench PID',
        detail:
          'An RC circuit and a three-stage RC ladder with easyPID: windup, filtering and relay autotuning, each measured against a known answer.',
      },
      {
        step: '02',
        title: 'One drone axis',
        detail:
          'A two-motor seesaw rig with a potentiometer on the pivot: a thrust curve from a kitchen scale, interlocks, and the first closed loop on a clean angle.',
      },
      {
        step: '03',
        title: 'Attitude',
        detail:
          'The MPU-6050 estimate measured against the potentiometer, complementary and Kalman filters, and a rate and angle cascade built from two easyPID instances.',
      },
      {
        step: '04',
        title: 'The full vehicle',
        detail:
          'A minimal quadrotor simulator checked against the research model, mixing priorities, and a four-loop cascade.',
      },
      {
        step: '05',
        title: 'Faults and capstone',
        detail:
          'Fault signatures, CUSUM and re-allocation with the rotor-fault simulator, then an acceptance test that runs identically on the rig and in simulation.',
      },
    ],
    measurements: [
      {
        label: 'Sessions',
        value: '7',
        context: 'about three hours each, plus optional build and open-lab evenings',
      },
      {
        label: 'Auto-checked exercises',
        value: '41',
        context: 'in 7 notebooks built into student and solution versions; CI executes all 14',
      },
      {
        label: 'easyPID port',
        value: '≤ 4.8 × 10⁻⁴',
        context: 'worst relative difference from the compiled C++ library over 3,274 randomised updates',
      },
      {
        label: 'Kit per team',
        value: 'USD 96–168',
        context: 'estimated from a parts list for the bench kit and rig, before shipping and contingency',
      },
    ],
    limits: [
      'The analysis panels are verified on simulated signals with known noise, vibration and distortion (the Noise Lab recovers the simulated white noise to within 1 %); long captures from the real unit are still to come.',
      'Not taught yet: no student has taken the course, so I can’t say yet what students learn from it. A pilot plan says what the first cohort will measure.',
      'No rig has been built from the documents. The printable parts have not been printed, and the sketches’ motor and IMU drivers have been compiled but not run on hardware.',
      'Rig parameters, capstone pass limits and performance figures come from simulation with assumed values; session timings are estimates.',
      'Testing easyPID for the course found a first-run bias in its relay autotuner: an ultimate gain of about 42 on the first run and 28 on the second, against an exact 29. The lab runs it twice; the library is unchanged so far.',
    ],
    media: [
      {
        src: '/images/authority/drone-control-bootcamp/pid-rc.png',
        step: 'Bench PID',
        alt: 'Plot of capacitor voltage under P and PI control on an RC circuit: P settles below the 2.5 V setpoint, PI reaches it, and PI with too much integral gain overshoots.',
        caption: 'Session 1: P leaves an offset, PI removes it, too much integral gain overshoots. easyPID’s Python port on a simulated RC circuit.',
      },
      {
        src: '/images/authority/drone-control-bootcamp/rotor-loss.png',
        step: 'Faults and capstone',
        alt: 'Plot of position error after rotor 1 is lost at two seconds: the passive controller diverges, the detect and yaw-relaxed pipeline peaks near 40 cm and recovers.',
        caption: 'Session 6: losing a rotor in the rotor-fault simulator, passive controller against detection and yaw-relaxed control.',
      },
    ],
    sources: [
      {
        label: 'GitHub — drone-control-bootcamp',
        href: 'https://github.com/Kronbii/drone-control-bootcamp',
        kind: 'repository',
        note: 'Sessions, notebooks, Arduino labs, rig design, slides and the cohort plan.',
      },
      {
        label: 'GitHub — easyPID',
        href: 'https://github.com/Kronbii/easyPID',
        kind: 'repository',
        note: 'The Arduino library every lab uses.',
      },
    ],
    articleSlug: 'teaching-drone-control-from-an-rc-circuit-up',
    topics: ['control-systems', 'embedded-systems'],
    keywords: ['drone control course', 'PID', 'easyPID', 'quadrotor', 'control education', 'Arduino'],
  },
  {
    slug: 'road-speed-audit',
    state: 'ready',
    title: 'Road-speed audit from one fixed camera',
    metaTitle:
      'Road-speed audit from one fixed camera, on simulated video',
    metaDescription:
      'Vehicle speeds from one fixed camera, with mean, V85 and share over the limit, each with its uncertainty. Tested on simulated video; not yet on a real road.',
    summary:
      'An offline, open-source tool that measures vehicle speeds on one road segment from one fixed camera and gives a municipality the numbers it plans with: mean speed, the 85th-percentile speed, the share over the limit and flow, each with an uncertainty. Its accuracy, and where it fails, is measured on simulated video with exact ground truth. It has not been checked against radar on a real road yet. I built it in October 2026.',
    role: 'Sole author: calibration, detection and tracking, speed estimation, uncertainty, the video simulator, the experiments and the report.',
    form: 'artifact',
    schemaType: 'SoftwareSourceCode',
    hero: {
      kind: 'image',
      media: {
        src: '/images/authority/road-speed-audit/scene.png',
        alt: 'A rendered street scene labelled “Simulated scene”: a two-lane road with a green measurement zone, three tracked vehicles with their measured and true speeds, such as 54.8 km/h against a true 54.4.',
        caption:
          'A frame from the simulator, which knows every vehicle’s true speed. Measured speed beside the truth for each tracked vehicle. Simulated, not a real road.',
      },
    },
    videos: [
      {
        src: '/images/authority/road-speed-audit/a40-speed-overlay.mp4',
        poster: '/images/authority/road-speed-audit/a40-speed-overlay-poster.jpg',
        alt: 'Overpass view of a two-carriageway motorway, with tracked cars boxed and labelled with speeds: about 40 km/h on the left carriageway and about 100 km/h on the right.',
        caption:
          'The tool on a public clip of Germany’s A40 (Kathinka Engels, CC BY 3.0, via Wikimedia Commons; annotations added). The scale comes from standard lane-marking lengths, not a survey, and there is no reference measurement, so these speeds are unvalidated. It gave 8 valid speeds, sent 3 to review and rejected 31 fragments.',
      },
    ],
    answer: {
      what: 'A camera, a calibration and a tracker that measure vehicle speeds on one road segment, with an uncertainty on every number, a human review queue for doubtful records, and the statistics a municipality uses.',
      problem:
        'A municipality that wants to calm a street or check whether a measure worked needs speed data for that street. Radar surveys cost money and staff time; a camera on a pole is cheap, but only useful if its numbers can be trusted and it does not become a surveillance device.',
      how: 'Surveyed road points give a homography from the image to metres on the road. Background subtraction finds vehicles, a Kalman tracker follows them through occlusions, and a robust fit of position against time inside a measurement zone gives each speed. Monte Carlo over the calibration gives each speed its uncertainty, and doubtful records go to a person instead of the statistics.',
      role: 'I wrote the pipeline, the simulator that renders road scenes with exact ground truth, and the thirteen experiments that measure where it holds and where it breaks.',
    },
    stages: [
      {
        step: '01',
        title: 'Calibrate',
        detail:
          'Six or more surveyed road points clicked on one frame give an image-to-road homography, with residuals and a recovered camera as a plausibility check.',
      },
      {
        step: '02',
        title: 'Track',
        detail:
          'Shadow-aware background subtraction with a sub-pixel bottom edge, a two-stage Kalman and Hungarian tracker, coasting through occlusions, and stitching of partial tracks in road coordinates.',
      },
      {
        step: '03',
        title: 'Measure',
        detail:
          'A robust fit of position against time inside the zone, quality flags that reject or send records to review, and a Monte-Carlo uncertainty that carries the calibration error into the report.',
      },
      {
        step: '04',
        title: 'Validate',
        detail:
          '221 simulated runs over 13 experiments: distance, height, tilt, resolution, frame rate, traffic density, calibration error, lighting and weather-like conditions, and the point on the vehicle that is tracked.',
      },
      {
        step: '05',
        title: 'Report',
        detail:
          'Mean speed, 85th-percentile speed, share over the limit and flow by lane and direction, with 95 % confidence intervals. Numbers only: no images are kept.',
      },
    ],
    measurements: [
      {
        label: 'Speed error',
        value: '1.0 km/h',
        context: '95th-percentile error on 118 simulated vehicles; bias −0.23 km/h, no false records',
      },
      {
        label: '85th-percentile speed',
        value: '1.2 km/h',
        context: 'RMSE of the V85 a municipality would see, over 20 simulated traffic runs',
      },
      {
        label: 'Recommended zone',
        value: '≤ 25 m',
        context: 'from the pole, for a 95th-percentile error under 2 km/h with at least 80 % of vehicles measured (simulation)',
      },
      {
        label: 'Tracked point',
        value: '1.1 km/h',
        context: 'error tracking the sub-pixel bottom edge; tracking the box centre instead gave 17.4 km/h (simulated)',
      },
    ],
    limits: [
      'The analysis panels are verified on simulated signals with known noise, vibration and distortion (the Noise Lab recovers the simulated white noise to within 1 %); long captures from the real unit are still to come.',
      'Every figure comes from simulated video: a flat, straight road, an ideal lens and box-shaped vehicles. The tool has not been checked against radar or GPS on a real road; a field protocol for that is written. Its first run on real footage, a public motorway clip, has no reference speeds to compare against.',
      'The method was tuned on the same simulator, on other seeds, so real video will likely do worse than these numbers.',
      'Accuracy falls quickly with distance: at 75 m the 95th-percentile error is 7.6 km/h and fewer than half the vehicles are measured. A lamp post in the line of sight cut the share measured from 86 % to 50 %.',
      'Dusk and scenes without cast shadows raise the error to about 1.8 km/h and make the stated uncertainty too small.',
      'It is an audit tool for planning, not a certified enforcement device.',
    ],
    media: [
      {
        src: '/images/authority/road-speed-audit/a40-speed-fits.png',
        step: 'Validate',
        alt: 'Two panels of position against time: six vehicles approaching at 35–43 km/h and two leaving at 99 and 112 km/h, each a straight line through tracked points.',
        caption: 'The A40 clip: each valid vehicle’s position along the road over time; the slope of its fitted line is its speed.',
      },
      {
        src: '/images/authority/road-speed-audit/distance.png',
        step: 'Measure',
        alt: 'Plot of the 95th-percentile speed error against the distance of the measurement zone from the pole, rising from about 0.8 km/h at 25 m to about 11 km/h at 95 m, with the share of vehicles measured at each distance.',
        caption: 'Simulated video: the error grows with distance, and fewer vehicles are measured.',
      },
      {
        src: '/images/authority/road-speed-audit/contact.png',
        step: 'Track',
        alt: 'Bar chart of the 95th-percentile speed error for four choices of tracked point: 1.1 km/h for the sub-pixel bottom edge, 2.6 for the raw blob edge, 3.4 for a height-corrected box centre and 17.4 for the uncorrected box centre.',
        caption: 'Simulated video: tracking where the tyres meet the road, located to a fraction of a pixel, matters most.',
      },
    ],
    sources: [
      {
        label: 'GitHub — road-speed-audit',
        href: 'https://github.com/Kronbii/road-speed-audit',
        kind: 'repository',
        note: 'Code, the simulator, every experiment’s results and the field protocol.',
      },
      {
        label: 'Wikimedia Commons — Motorway A40, on bridge above the traffic',
        href: 'https://commons.wikimedia.org/wiki/File:Motorway_A40_-_on_bridge_above_the_traffic.webm',
        kind: 'video',
        note: 'The public clip in the demo, by Kathinka Engels, CC BY 3.0.',
      },
    ],
    articleSlug: 'measuring-road-speed-with-one-camera',
    topics: ['computer-vision', 'civic-technology'],
    keywords: ['vehicle speed measurement', 'homography', 'multi-object tracking', 'V85', 'road safety', 'traffic camera'],
  },
  {
    slug: 'landmine-detection-extraction-robot',
    state: 'ready',
    title: 'Landmine detection and extraction robot',
    metaTitle:
      'Landmine detection and extraction robot: ROS 2 autonomy',
    metaDescription:
      'The ROS 2 autonomy stack for a mine-detection rover with a 6-DoF arm, with 3D LiDAR SLAM, field-tested with dummy mines with the Lebanese Armed Forces.',
    summary:
      'A tracked rover with a 6-DoF arm, built at RHU in 2024–2025 to find landmines and clear its own path. I led all of its software: 2D and then 3D LiDAR SLAM, navigation with Nav2, detection and segmentation from a camera, and the arm’s kinematics. We built it in two phases, indoors first and then outdoors with GNSS, and tested it in Mechref with the Lebanese Armed Forces.',
    role: 'Software lead: SLAM, navigation, detection, segmentation, and the arm’s kinematics, in ROS 2.',
    form: 'artifact',
    schemaType: 'CreativeWork',
    hero: {
      kind: 'image',
      media: {
        src: '/images/authority/landmine/detection-poster.jpg',
        alt: 'The tracked rover with its 6-DoF arm facing a red cylinder, the stand-in target, in the indoor test arena.',
      },
    },
    videos: [
      {
        src: '/images/authority/landmine/navigation.mp4',
        poster: '/images/authority/landmine/navigation-poster.jpg',
        alt: 'RViz shows a 2D occupancy map with a planned path; then the rover drives itself through a walled indoor arena.',
        caption: 'Phase 1, indoors: a 2D map, a planned path, and the rover driving it on its own with Nav2.',
      },
      {
        src: '/images/authority/landmine/detection.mp4',
        step: 'See',
        poster: '/images/authority/landmine/detection-poster.jpg',
        alt: 'The tracked rover drives toward a red cylinder on the arena floor while a laptop terminal prints distance readings, then STOP.',
        caption: 'The rover finds a stand-in target and stops in front of it.',
      },
      {
        src: '/images/authority/landmine/arm.mp4',
        step: 'Reach',
        poster: '/images/authority/landmine/arm-poster.jpg',
        alt: 'The rover’s six-axis arm picks up a red cylinder and sets it down beside the robot.',
        caption: 'The 6-DoF arm lifts an object out of the rover’s way.',
      },
    ],
    media: [
      {
        src: '/images/authority/landmine/rviz-costmap.jpg',
        step: 'Indoors, in 2D',
        alt: 'RViz with a 2D occupancy grid, an inflated obstacle costmap, the robot’s pose, and a navigation goal arrow.',
        caption: 'The indoor map in RViz: occupancy grid, inflated costmap, and the goal the planner drives to.',
      },
    ],
    answer: {
      what: 'A tracked rover with a 6-DoF arm that maps its surroundings, navigates on its own, and detects landmines, built as an RHU project for a Lebanese Army initiative.',
      problem:
        'Landmines and unexploded remnants still lie in parts of Lebanon, including near RHU’s campus in Mechref. Clearing them by hand is slow and dangerous; a robot has to know where it is, where it has searched, and what it is looking at, on rough ground and without a reliable map.',
      how: 'Indoors, a 2D LiDAR, wheel encoders, and an IMU fuse into 2D SLAM, and Nav2 plans and drives. Outdoors, a 3D LiDAR and GNSS join the wheel odometry and IMU, with GNSS correcting the map globally so detected mines get real coordinates. A camera segments the scene and detects objects for navigation, and the 6-DoF arm moves obstacles out of the way and shows that a mine could be handled.',
      role: 'I led all the software: the autonomy stack, navigation, SLAM, detection, segmentation, and the arm’s kinematics and inverse kinematics. It was an RHU project before I graduated, built with Wassim Ghaddar and the RHU Robotics and Technology Club team, guided by lab engineer Mohammad Al Kaderi, with field tests in Mechref alongside the Lebanese Armed Forces.',
    },
    stages: [
      {
        step: '01',
        title: 'Indoors, in 2D',
        detail:
          'A 2D LiDAR, wheel encoders, and an IMU, fused with LiDAR scan registration into 2D SLAM; Nav2 plans paths through the map and drives the rover. This was the prototype.',
      },
      {
        step: '02',
        title: 'Outdoors, in 3D',
        detail:
          'A 3D LiDAR and GNSS replace the indoor setup. SLAM fuses wheel odometry, the IMU, and GNSS, which corrects the map globally and gives each detected mine a position.',
      },
      {
        step: '03',
        title: 'See',
        detail:
          'A camera runs segmentation and object detection, and its results feed the navigation; the LiDAR builds the 3D map.',
      },
      {
        step: '04',
        title: 'Reach',
        detail:
          'A 6-DoF arm, driven by kinematics and inverse kinematics I wrote, moves obstacles out of the path and shows that a mine could be handled.',
      },
      {
        step: '05',
        title: 'Field test',
        detail:
          'Small tests in Mechref with the Lebanese Armed Forces, using dummy mines.',
      },
    ],
    measurements: [
      { label: 'Phases', value: '2', context: 'indoor 2D prototype, then outdoor 3D with GNSS' },
      { label: 'Field tests', value: 'Mechref', context: 'with the Lebanese Armed Forces, dummy mines' },
      { label: 'DARE @ LAU', value: '3rd place', context: 'April 2024, the first universities robotics competition' },
    ],
    limits: [
      'The analysis panels are verified on simulated signals with known noise, vibration and distortion (the Noise Lab recovers the simulated white noise to within 1 %); long captures from the real unit are still to come.',
      'The outdoor tests were small, early trials with dummy mines; there are no quantified outdoor results yet.',
      'The arm is a proof of concept: it moves obstacles and shows how a mine could be handled, not a finished extraction tool.',
    ],
    sources: [
      {
        label: 'RHU: the robotics club’s DARE result (2024)',
        href: 'https://www.rhu.edu.lb/media-room/news/the-rhu-robotics-and-technology-club-celebrates-yet-another-victory',
        kind: 'institution',
      },
      {
        label: 'LAU: Advancing disaster management with robotics',
        href: 'https://news.lau.edu.lb/2024/advancing-disaster-management-with-robotics.php',
        kind: 'institution',
      },
    ],
    articleSlug: '',
    topics: ['robotics-perception', 'embedded-systems', 'computer-vision'],
    keywords: [
      'ROS 2',
      '3D LiDAR SLAM',
      '2D SLAM',
      'Nav2',
      'GNSS',
      'sensor fusion',
      'landmine detection',
      'demining robot',
      'semantic segmentation',
      'inverse kinematics',
    ],
  },
  {
    slug: 'ice-engine-simulator',
    state: 'ready',
    title: 'Four-cylinder engine simulator',
    metaTitle:
      'Four-cylinder engine simulator in MATLAB',
    metaDescription:
      'MATLAB scripts that simulate a four-cylinder spark-ignition engine: slider-crank kinematics, a thermodynamic cycle, crank torque, a flywheel, and gear ratios.',
    summary:
      'A MATLAB simulator I wrote as the main project of the Automotive Engineering course at RHU, in fall 2024. They simulate a four-stroke, four-cylinder spark-ignition engine at 2000 rpm over a full 720° cycle: the slider-crank kinematics, a single-zone thermodynamic cycle, the crank torque of one cylinder and of all four, a flywheel to smooth it, the engine’s performance figures, and the ratios of an eight-speed gearbox.',
    role: 'Sole author, Automotive Engineering course project.',
    form: 'diagram',
    schemaType: 'SoftwareSourceCode',
    hero: {
      kind: 'diagram',
      diagramId: 'engine-pipeline',
      caption:
        'Each stage feeds the next: one file of parameters, then the kinematics, the gas cycle, the torque, and the flywheel and gearbox it sizes.',
      alt: 'Diagram of the simulator pipeline: geometry and parameters, slider-crank kinematics, thermodynamic cycle, crank torque summed over four cylinders, flywheel sizing, and gear ratios.',
    },
    videos: [
      {
        src: '/images/authority/ice-engine/four-cylinder-animation.mp4',
        poster: '/images/authority/ice-engine/four-cylinder-animation-poster.jpg',
        alt: 'Four slider-cranks turning together through one 720° cycle, each cylinder’s chamber flashing as it fires in the order 1-3-4-2, with a crank-angle readout.',
        caption: 'The four-cylinder animation from the simulator: one full cycle, firing order 1-3-4-2.',
      },
    ],
    media: [
      { src: '/images/authority/ice-engine/pv-diagram.webp', step: 'Thermodynamic cycle', alt: 'Pressure–volume diagram of one cylinder over a full cycle, coloured by phase.', caption: 'The P–V loop of one cylinder: the work per cycle is its area, about 460 J.' },
      { src: '/images/authority/ice-engine/pressure-crank-angle.webp', step: 'Thermodynamic cycle', alt: 'Cylinder pressure against crank angle, with intake, compression, combustion, expansion, and exhaust shaded.', caption: 'Pressure over the 720° cycle, peaking near 34 atm after ignition.' },
      { src: '/images/authority/ice-engine/torque-four-cylinder.webp', step: 'Torque', alt: 'Crank torque of four cylinders 180° apart, summed, with its mean.', caption: 'Four cylinders 180° apart: a mean of about 146 N·m.' },
      { src: '/images/authority/ice-engine/torque-flywheel.webp', step: 'Flywheel and performance', alt: 'Torque before and after adding the flywheel, with the surplus-energy area shaded.', caption: 'The flywheel absorbs about 370 J of surplus energy per cycle.' },
      { src: '/images/authority/ice-engine/piston-velocity.webp', step: 'Kinematics', alt: 'Piston velocity against crank angle with and without an 18 mm crank offset.', caption: 'Piston velocity with and without the 18 mm offset.' },
      { src: '/images/authority/ice-engine/gear-ratios.webp', step: 'Gearbox', alt: 'Bar chart of the eight gear ratios from 5.38 in first to 0.64 in eighth.', caption: 'The eight gear ratios, 5.38 down to 0.64, with sixth as direct drive.' },
    ],
    answer: {
      what: 'A MATLAB model of a four-stroke, four-cylinder spark-ignition engine through one full cycle, from the geometry of its crank to the gear ratios of the car it drives.',
      problem:
        'An engine is one chain of dependencies: the crank geometry sets the cylinder volume, the volume sets the pressure, the pressure and the moving masses set the torque, and the torque decides the flywheel and the gearbox. Simulating it means following that chain end to end.',
      how: 'One file holds every parameter. A slider-crank solution gives piston motion and cylinder volume at each crank angle. A single-zone cycle with polytropic strokes, Wiebe combustion and orifice-flow gas exchange is iterated until its temperature converges. A linear force and moment solve gives the crank torque, four phase-shifted cylinders are summed, and the result sizes a flywheel and an eight-speed gearbox.',
      role: 'I wrote the whole simulator, as the main project of the Automotive Engineering course at RHU in fall 2024.',
    },
    measurements: [
      { label: 'Engine power', value: '30.6 kW', context: 'four cylinders at 2000 rpm' },
      { label: 'Mean torque', value: '146 N·m', context: 'four cylinders' },
      { label: 'Fuel conversion', value: '28%', context: 'efficiency' },
      { label: 'Flywheel', value: '13.6 cm', context: 'radius of a 50 mm steel disc, for a 4% speed fluctuation' },
    ],
    stages: [
      {
        step: '01',
        title: 'Parameters',
        detail:
          'One file holds every input: link lengths and masses, 2000 rpm, valve and combustion timing in crank degrees, gas properties, and the flywheel and transmission constants.',
      },
      {
        step: '02',
        title: 'Kinematics',
        detail:
          'Piston position, velocity and acceleration, connecting-rod angle and cylinder volume at every crank angle, for a cylinder axis through the crankshaft (compression ratio 9.8) and one offset by −18 mm (10.1).',
      },
      {
        step: '03',
        title: 'Thermodynamic cycle',
        detail:
          'Polytropic compression and expansion; a Wiebe burn (a = 5, m = 2) over 60° around top dead centre toward a constant-volume end-of-combustion state; exhaust blowdown and intake as compressible orifice flow with residual-gas mixing; repeated until the cycle temperature converges.',
      },
      {
        step: '04',
        title: 'Torque',
        detail:
          'At each crank angle an 8×8 linear system of forces and moments, with masses, rod inertia, gravity and gas force, gives the crank torque; four cylinders shifted by 180° are summed.',
      },
      {
        step: '05',
        title: 'Flywheel and performance',
        detail:
          'A flywheel sized from the torque-excess energy for a 0.04 speed-fluctuation coefficient, as a steel disc 50 mm thick; work, indicated and brake power, MEP and BMEP, efficiencies, specific fuel consumption, volumetric efficiency and piston speed.',
      },
      {
        step: '06',
        title: 'Gearbox',
        detail:
          'Eight gear ratios solved with fsolve between a top speed of 245 km/h and a first gear for a 2600 kg vehicle on a 7 % grade.',
      },
      {
        step: '07',
        title: 'Animation',
        detail: 'The four slider-cranks drawn moving together, each cylinder flashing as it fires.',
      },
    ],
    limits: [
      'The analysis panels are verified on simulated signals with known noise, vibration and distortion (the Noise Lab recovers the simulated white noise to within 1 %); long captures from the real unit are still to come.',
      'The mean effective pressures the scripts print are about half what they should be: the displacement constant is smaller than the engine’s swept volume of about 503 cc.',
      'Friction is a flat 10 % of indicated power, and there is no heat transfer to the cylinder walls, no emissions model and no knock.',
      'The engine turns at one fixed speed, and the speed-fluctuation curve is an idealised sine between the flywheel’s limits, not a simulation of the shaft.',
    ],
    sources: [
      {
        label: 'GitHub — ICE-matlab-simulator',
        href: 'https://github.com/Kronbii/ICE-matlab-simulator',
        kind: 'repository',
      },
    ],
    articleSlug: 'simulating-an-engine-from-crank-to-gearbox',
    topics: [],
    keywords: [
      'MATLAB',
      'internal combustion engine',
      'four-stroke engine',
      'slider-crank',
      'engine thermodynamics',
      'Wiebe function',
      'flywheel design',
      'gear ratios',
    ],
  },
]

export const projectMap = Object.fromEntries(projects.map((p) => [p.slug, p]))

export const readyProjects = projects.filter((p) => p.state === 'ready')
export const reviewProjects = projects.filter((p) => p.state === 'review')

export function getProject(
  slug: string
): (typeof projects)[number] | undefined {
  return projectMap[slug]
}
