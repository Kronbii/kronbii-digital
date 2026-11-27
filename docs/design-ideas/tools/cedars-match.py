# Run from the repo root: python3 docs/design-ideas/tools/cedars-match.py (needs opencv-python).
# SIFT + ratio test + RANSAC (fundamental matrix) between the two cedar photos; keep a spread of inliers
import cv2, json, numpy as np, sys
A = cv2.imread('public/images/vneo/rami-cedars-1.webp')
B = cv2.imread('public/images/vneo/rami-cedars-2.webp')
h, w = A.shape[:2]
g1, g2 = cv2.cvtColor(A, cv2.COLOR_BGR2GRAY), cv2.cvtColor(B, cv2.COLOR_BGR2GRAY)
sift = cv2.SIFT_create(nfeatures=0, contrastThreshold=0.02)
k1, d1 = sift.detectAndCompute(g1, None)
k2, d2 = sift.detectAndCompute(g2, None)
raw = cv2.BFMatcher(cv2.NORM_L2).knnMatch(d1, d2, k=2)
good = [m for m, n in raw if m.distance < 0.8 * n.distance]
p1 = np.float32([k1[m.queryIdx].pt for m in good]); p2 = np.float32([k2[m.trainIdx].pt for m in good])
F, mask = cv2.findFundamentalMat(p1, p2, cv2.FM_RANSAC, 1.5, 0.999)
inl = mask.ravel().astype(bool)
P1, P2 = p1[inl], p2[inl]
print(f'keypoints {len(k1)} / {len(k2)}, ratio-test matches {len(good)}, RANSAC inliers {inl.sum()}', file=sys.stderr)
# the person, in each frame (normalised): head to the bottom of the bag
person1 = (0.53, 0.50, 0.93, 1.0); person2 = (0.52, 0.46, 0.95, 1.0)
def inside(p, b): return b[0] <= p[0] <= b[2] and b[1] <= p[1] <= b[3]
pts = [(float(a[0]/w), float(a[1]/h), float(b[0]/w), float(b[1]/h)) for a, b in zip(P1, P2)]
on = [p for p in pts if inside(p[:2], person1) and inside(p[2:], person2)]
off = [p for p in pts if p not in on]
# a spread: grid-thin the scene matches, keep the person's
def thin(ps, cell):
    seen, out = set(), []
    for p in ps:
        key = (int(p[0] / cell), int(p[1] / cell))
        if key in seen: continue
        seen.add(key); out.append(p)
    return out
scene = thin(off, 0.075)[:44]
person = thin(on, 0.04)[:16]
print(f'kept scene {len(scene)}, on him {len(person)} (of {len(on)})', file=sys.stderr)
r = lambda v: round(v, 4)
json.dump({
  'method': 'SIFT, ratio test 0.8, RANSAC fundamental matrix (1.5 px)',
  'keypoints': [len(k1), len(k2)], 'matches': len(good), 'inliers': int(inl.sum()),
  'scene': [[r(v) for v in p] for p in scene], 'person': [[r(v) for v in p] for p in person],
}, open('src/content/vneo/cedars-matches.json', 'w'))
# a check picture
canvas = np.hstack([A, B])
for p in scene + person:
    c = (168, 211, 183) if p in scene else (208, 143, 224)
    a = (int(p[0]*w), int(p[1]*h)); b = (int(p[2]*w)+w, int(p[3]*h))
    cv2.line(canvas, a, b, c, 1, cv2.LINE_AA); cv2.circle(canvas, a, 4, c, -1); cv2.circle(canvas, b, 4, c, -1)
cv2.imwrite('tmp/cedars-matches-check.jpg', cv2.resize(canvas, (1400, 933)), [cv2.IMWRITE_JPEG_QUALITY, 80])
