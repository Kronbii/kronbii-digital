# CV additions, October 2026

Suggested CV lines for the rotor-fault study, the star tracker, the drone-control bootcamp and the road-speed audit.
Every number comes from the project's own repository, where a script or test regenerates it; the source file is
named under each project. Pick what fits the page; each project has a one-line and a longer form.

## Rotor-fault detection and recovery for a quadrotor

One line:

- Rotor-fault detection and recovery for a 5-inch quadrotor (Python, PX4): detected and isolated 200/200 simulated
  rotor faults in a median 30 ms and recovered 56/56 complete rotor losses; validated on 110 PX4 software-in-the-loop
  flights, where PX4's own detector flagged none of the partial losses.

Longer:

- Built a reproducible simulation study of rotor-fault detection and recovery for a 5-inch quadrotor (Kalman-filter
  effectiveness estimation, CUSUM bank, yaw-relaxed LQR): 200/200 simulated faults detected and isolated (median 30 ms),
  56/56 simulated complete rotor losses recovered.
- Validated the diagnoser on 110 headless PX4 SITL flights (Gazebo, pymavlink automation, ULog replay): all 56 injected
  motor faults detected and isolated, median 120–132 ms, where PX4's failure detector flagged no partial loss.
- Wrote the log pipeline (PX4 ULog, Betaflight blackbox) and a tethered-test protocol for the first measured flights on
  the real quadrotor.

Label it as simulation and software-in-the-loop until the tethered test is done. Source: `rotor-fault-recovery`,
`docs/portfolio.md`, `results/headline.json`, `sitl/results/sitl_summary.json`.

## ESP32 barn-door star tracker

One line:

- ESP32 star tracker (C++, Python, OpenSCAD): firmware that removes the barn-door tangent error by timing each
  microstep from the mechanism's inverse kinematics, within ±0.32″ of sidereal in simulation; 60 C++ and 50 Python tests.

Longer:

- Designed an ESP32 star tracker whose firmware removes the barn-door tangent error exactly by scheduling each microstep
  from the mechanism's inverse kinematics; 60 host unit tests (ASan/UBSan) on a hardware-independent C++ core shared
  with the firmware.
- Built a Python tracking-error model and an exposure and target planner using skyfield and JPL ephemerides, which
  identified the lead screw's periodic error, not polar alignment, as the limit to design around.
- Modelled the mechanism parametrically in OpenSCAD (15 printed parts, STLs, drill templates), with CI covering the
  Python tests, host C++ tests, firmware compilation and CAD export.

Until it is built, say "designed" rather than "built", and keep performance numbers out of the CV. Source:
`star-tracker`, `docs/portfolio.md`.

## Teach it: a drone-control bootcamp

One line:

- Drone-control bootcamp (Python, Arduino, Jupyter): a seven-session course from PID to fault-tolerant quadrotor
  control, with 41 auto-checked exercises, 8 Arduino labs on a custom two-motor rig, and CI that runs every notebook and
  compiles every sketch.

Longer:

- Designed a 7-session drone-control curriculum (PID → attitude estimation → fault-tolerant quadrotor control):
  41 auto-checked Jupyter exercises, 8 Arduino labs on a custom two-motor rig, instructor guide, rubric and a
  USD 96–168-per-team kit plan.
- Turned my easyPID library into teaching material with a Python port verified against the C++ sources (3,274
  randomised updates), and found and documented a first-run bias in its relay autotuner by testing it against an RC
  ladder with a known ultimate gain.

Say "designed" until a cohort has taken it. The repository's own CV lines add "for university students at Space²";
add that back only once your role there is settled and you are happy for Space² to be named. Source:
`drone-control-bootcamp`, `docs/portfolio.md`.

## Road-speed audit from one fixed camera

One line:

- Camera-based vehicle-speed audit tool (Python, OpenCV): homography calibration, tracking, robust speed fits with
  Monte-Carlo uncertainty and a human review queue; on simulated video with exact ground truth, 88 % of vehicles
  measured with a 95th-percentile error of 1.0 km/h.

Longer:

- Built an offline camera-based vehicle-speed audit tool (homography calibration, background subtraction,
  Kalman/Hungarian tracker, robust speed fit with Monte-Carlo uncertainty, human review queue, municipal V85 report);
  on simulated video it measured 88 % of vehicles with a 95th-percentile speed error of 1.0 km/h.
- Wrote a numpy/OpenCV road-scene simulator with exact ground truth and ran 221 seeded runs across 13 experiments to
  derive camera-placement guidance; found that a compact calibration layout causes about 5× the speed bias of points
  spread over the zone.

Say "on simulated video" until the radar or GPS field check is done. The repository calls it step one of a Space²
road-safety pilot; add that only once you are happy for it to be public. Source: `road-speed-audit`, `docs/portfolio.md`.
