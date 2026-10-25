# Action items

What's left to do on the site and around it, from the 23–24 October 2026 audit and Rami's answers on the resolve board (`/resolve`, local only). Tick items off here as they're done.

## For Rami

### When a project reaches a milestone
- [ ] **5-inch FPV drone, when finished:** photos of the finished quad, a flight clip or DVR, Betaflight screenshots (PID tab, GPS Rescue), a blackbox plot (gyro vs. setpoint), the parts list and all-up weight, the thrust/current sizing, and what the GPS, radio-link and jamming tests showed.
- [ ] **Star tracker, once built:** photos of the build and the first astrophotos.
- [ ] **Drone-control bootcamp, after the first cohort (planned for December 2026):** where it ran, how many students, photos.
- [ ] **Emotion recognition:** photos of the Jetson setup or the demo, once found.

### Outside the site
- [ ] **Backlinks:** add a credit line linking to ramikronbi.com on the Evoid, Basira, NASNA and Bsheel sites.
- [ ] **Tayseer's OmniSign page:** ask Tayseer to link your name to ramikronbi.com/projects/omnisign-lebanese-sign-language.
- [ ] **Post the corrected OmniSign article on DEV and Medium:** the draft is in docs/crosspost/omnisign-corrected.md; you post it.
- [x] **Merge the thermal repo pull request:** github.com/Kronbii/thermal-super-resolution/pull/3, which brings the README to one set of figures.
- [ ] **Google Search Console:** request indexing of the home page once this branch is live, so Google picks up the new favicon and image.
- [ ] **Cross-posts point home:** on DEV and Hashnode set each post's canonical URL to its page on ramikronbi.com (Medium: Import or "originally published at"), and add a "Full write-up: <link>" line. This makes your site the original for search engines.
- [ ] **Medium:** fix the display-name capitalisation in Settings ("Rami kronbi" → "Rami Kronbi").

### Add to the CV
- [ ] **Award name:** "Nazik Rafik Hariri Graduate Studies Award", RHU's wording, instead of "Nazek Hariri Academic Excellence Award".
- [ ] **WRO:** "World Robot Olympiad (WRO) Lebanon, Future Engineers, 2nd place, 2023" (the CV says 2024).
- [ ] **New awards:** OmniSign, 1st prize Public Choice, National FYP Demo Day 2025; CRDP certificate of appreciation, April 2025 (for NASA Space Apps Beirut volunteering); DARE @ LAU, 3rd place, 2024; Space Apps Beirut Exceptional Volunteering Certification, 2024; ASME EFx 2023, 2nd place in Lebanon (with Ibrahim and Wassim Ghaddar).
- [ ] **OmniSign:** add the co-founder title.
- [ ] **NASNA:** keep "Co-founder & Operations Lead".
- [ ] **360° stitching:** describe it as 3D mapping of environments without LiDAR (it started as real estate).
- [ ] **New projects:** lines for the rotor-fault study, the star tracker, the drone-control bootcamp and the road-speed audit (drafts in docs/geo/CV_ADDITIONS_2026-10.md).
- [ ] **Fix two cut-off titles:** "Emotion Recognition for Children with … Autism" and "5-inch Carbon-Fiber FPV … Drone".
- [ ] **Remove** the runway-inspection UAV line if it stays off the site.

## For Claude, from Rami's answers
- [x] **Remove Daleel:** take the project and its write-up off the site, with redirects.
- [x] **Remove the runway-inspection UAV:** take the project and its write-up off the site, with redirects.
- [x] **Landmine robot:** rewrite from Rami's account:
  - phase 1 indoors: 2D LiDAR, wheel odometry, IMU, 2D SLAM, Nav2
  - phase 2 outdoors: 3D LiDAR, GNSS, fused SLAM, segmentation and detection camera
  - the arm as a proof of concept and an obstacle remover
  - tests in Mechref with the LAF
  - an RHU project, supervised by a professor, with Rami leading all software
  - add his videos (navigation, object detection, robotic hand) and graphics from the ARIVE deck
  - research public mentions for links.
- [x] **OmniSign:**
  - use the team pages' figures, media and demo video
  - devices: iPhone 13 Pro, Raspberry Pi 5, Jetson, a DX Robotics board, phones
  - LSTM model, co-founder, on the Demo Day team
  - draft the corrected DEV and Medium posts.
- [x] **Race car:** WRO 2023 2nd place everywhere, plus the RHU article and its photos.
- [x] **BEMO:** a camera model for posture, the other sensors for desk height; update the repo README.
- [x] **Bsheel:** run the app locally and take screenshots.
- [x] **Rotor-fault study:** run the simulations, validate them, and show the evidence.
- [x] **Road-speed audit:** test on real road footage from public videos and show the evidence.
- [x] **Engine simulator:** run the scripts (Octave or a port) and add plots and an animation.
- [x] **Crack toolkit:** generate clean overlays and metrics from the repo.
- [x] **360° stitching:** rebuild the IMU-assisted, bundle-adjusted version, validate it on simulated data, and add a demo video. Done on the local branch `imu-bundle-adjustment` of the 360 repo (not pushed yet).
- [ ] **360° stitching, real capture:** run the v2 path on a real phone video with its gyro log.
- [x] **Space²:** "run along with alghadlana.com".
- [x] **Public CV:** publish a downloadable CV on the site (Rami: "don't hide anything").
- [x] **GitHub:** set every public repo's homepage to its page on the site and add a write-up link to each README; replace the thermal repo's description.
- [x] **SEO calls Rami left to Claude:**
  - make ramikronbi.com the canonical source for cross-posted articles
  - add Substack to the profile links
  - rewrite the home-page description around the current lead projects.
- [x] **Thermal figures:** ~130 FPS laptop / 20–30 FPS Jetson, on the site and in PR #3.

### Added 25 October
- [x] **Push the 360 repo's `imu-bundle-adjustment` branch**, linked from the project page.
- [ ] **Rami: INJAZ and DevFest posts:** nothing public names the teams or the talk; if INJAZ or GDG post them, send the links.
