---
title: Building real-time Lebanese Sign Language recognition
published: false
tags: computervision, machinelearning, accessibility, edgeai
canonical_url: https://ramikronbi.com/writing/building-real-time-lebanese-sign-language-translation
---

Lebanese Sign Language has a data problem before it has a model problem. It has its own signs and its own regional variations, between Beirut, the Beqaa, and the South, and almost no recorded data. General sign-language datasets don’t carry over, so OmniSign had to start by building its own.

## Collecting the data with the people who sign

We spent three months collecting across Lebanon with community partners: the deaf community at Sin El Fil Church, the Aaramoun Orphanage Center, the educator SignWithNaila, and booths at Rafik Hariri University. That gave us more than 40,000 signs before augmentation. We stored each one as landmarks rather than raw video, per signer and per sign, which keeps the data about the shape of the sign instead of the person’s face or the room.

![A grayscale grid of 28 hand signs photographed against a white wall, each labelled with its Arabic letter and name.](https://ramikronbi.com/images/authority/omnisign/omnisign-lsl-arabic-alphabet-dataset.webp)
*The Arabic alphabet in Lebanese Sign Language, one raw frame per letter, before augmentation.*

## From a camera frame to a word

I built the computer-vision pipeline. MediaPipe turns each frame into hand, pose, and face landmarks. Single signs, like the letters of the alphabet, are classified from the 21 hand landmarks; signs that unfold over time are read from a window of 30 frames by an LSTM. The result is shown as text and spoken aloud. On an internal evaluation under controlled conditions it reached 98%; in real use, lighting, camera angle, and signing speed all move that number, which is why the collection deliberately covered many signers and settings.

## Small enough to carry

A translator only helps if it is there when the conversation happens. With Layth Ayache I built the embedded deployment, so the same models run on iOS and Android phones and offline on small boards: a Raspberry Pi 5, Jetson boards, and a DX Robotics board. I tested it on an iPhone 13 Pro and a Raspberry Pi 5, and the team tested the app in a clinic, at a café counter, and with a driver in his car.

OmniSign is a team project. I co-founded it with Layth Ayache, who leads the AI and ML work, Tayseer Laz, Abou Baker Hussien Al Khatib, and Nour El Hariri, with Dr. Oussama Mustapha at RHU as our research advisor. It won First Prize in the Public Choice category at the National FYP Demo Day 2025, at LAU. It recognizes the alphabet and more than 30 everyday words and expressions today; a wider vocabulary, starting with clinical terms, is next.

---

*Originally published on [ramikronbi.com](https://ramikronbi.com/writing/building-real-time-lebanese-sign-language-translation). The project page, with the team’s film: [OmniSign](https://ramikronbi.com/projects/omnisign-lebanese-sign-language).*
