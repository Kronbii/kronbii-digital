---
title: "Turning segmented cracks into measurable paths"
description: "A segmentation mask says which pixels belong to a crack. Inspection needs the next layer: a centreline, a length, and a width you can compare. Here is how I get there, and how I check it."
canonical_url: https://ramikronbi.com/writing/turning-segmented-cracks-into-measurable-paths
cover_image: https://ramikronbi.com/images/authority/fine-crack/hero.jpg
tags: computervision, opensource
published: false
---
Crack segmentation produces a region. An inspection needs a measurement: how long the crack is, how wide it gets, where it branches, and a line that can go on a drawing or be compared with the last survey. The fine-crack tracing toolkit is the step between the two. It is an installable Python package with a command-line interface, and it starts after segmentation, so any model can feed it.

### From corners to a skeleton

My first version placed Shi-Tomasi corners inside the mask and linked them with a minimum spanning tree. It worked when the frame showed a thin crack. On a wide mask the corners sit on the edges, so the line traced the outline instead of the middle, and with the default quality threshold a long crack kept only a few dozen corners.

What worked in practice was to skeletonise the mask: thin it to a one-pixel line down its middle. A raw skeleton is not a measurement yet, though. Ragged mask edges sprout short false branches, a break in the mask splits one crack into pieces, the line stops half a width short of each end, and its pixel staircase overstates the length of a diagonal crack by up to 8%.

Version 1.0 deals with each of those. It reads the skeleton as a graph of ends and junctions, cuts side branches shorter than 2.5 half-widths of the crack, joins pieces whose ends face each other across a break, carries the ends out to the tips, and splits each crack into a trunk and its branches. Then it smooths each line in proportion to the crack’s width, centres it, and measures the width across the crack at every point to a fraction of a pixel. The corner tracer stays as the fallback for any crack whose skeleton cannot describe its mask, with one fix: its corners are walked onto the centreline before they are linked.

### Checking it

Real crack datasets label pixels, not lines, so they cannot say how long a crack really is. I wrote a generator that draws synthetic cracks with exact ground truth (the centreline, the width at every point, the junctions and the ends) and then damages each mask the way segmentation output tends to be damaged: ragged edges, breaks, pinholes, specks. On 100 of those images, version 1.0 sits 0.52 px from the true centreline on average, gets each image’s total length within 1.9% and the width within 0.65 px, and scores an F1 of 0.97 within 3 px. The first version scores 0.20 and misses most of every crack.

On real masks there is no true line, so the check there is steadiness. I traced all 458 hand-drawn masks of the Concrete Crack Segmentation Dataset (Özgenel, 2019), then damaged each mask and traced it again. The second trace sits a median 0.86 px from the first and its length changes by a median 0.75%. Each mask, 8 to 12 megapixels, takes a median 0.63 s on one laptop core.

### Why packaging matters

Computer-vision experiments often stop in the state where only the original author can reproduce them. Paths are hard-coded, configuration lives in notebook cells, and evaluation is a collection of plots with no machine-readable record.

Turning the work into a package changes the engineering question. Inputs and outputs need contracts. Settings need one place to live. Runs need named output folders. Results need stable formats: JSON with the full geometry, a CSV row per crack, GeoJSON and SVG for other tools. A command such as `fine-tracing trace` or `fine-tracing bench` becomes a repeatable interface rather than a memory of which cells to execute.

What it still cannot do is see past the mask. A width is only as good as the segmentation behind it, a pixel size assumes the camera faces the surface square on, and a bridge is a guess that two facing ends are one crack, so bridged stretches stay flagged. The next step is cracks measured by hand, so the widths can be checked in millimetres and not only against generated ground truth.

## Links

- [GitHub — fine-crack-tracing](https://github.com/Kronbii/fine-crack-tracing)
- [README, results and CLI documentation](https://github.com/Kronbii/fine-crack-tracing#readme)
- [Concrete Crack Segmentation Dataset (Özgenel, 2019)](https://data.mendeley.com/datasets/jwsn7tfbrp/1)

---

*Originally published at [ramikronbi.com](https://ramikronbi.com/writing/turning-segmented-cracks-into-measurable-paths). The project: [Fine crack tracing toolkit](https://ramikronbi.com/projects/fine-crack-tracing-toolkit).*
