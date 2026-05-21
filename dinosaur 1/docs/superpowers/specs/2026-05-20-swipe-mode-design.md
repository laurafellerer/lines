# Swipe Mode — Tinder-Style Card Swiping via Hand Tracking

## Overview
A third mode (Swipe) in the hand-wireframe app. Shows a virtual iPhone screen on the canvas where the user swipes Tinder-style profile cards left/right using their index finger, tracked via MediaPipe Hands.

## Layout
- iPhone frame drawn centered on the main canvas: rounded rect body (dark), inner screen (lighter), notch at top
- Inside the screen: one profile card at a time, with a smaller card peeking underneath (the stack)
- Card content: photo placeholder (colored circle + emoji), name + age, short bio line

## Interaction
- index_finger_tip position is mapped to the iPhone screen area
- When finger is detected over the screen area, the card follows the finger's horizontal position (offset)
- Swiping right → green "LIKE" badge fades in as card tilts right
- Swiping left → red "NOPE" badge fades in as card tilts left
- Beyond a threshold (~35% of screen width) → card animates off screen, next profile loads
- Counter in corner: "X swiped"

## Profile Data
- Static array of 10+ fake profiles (name, age, emoji/color, bio)
- Cycled through sequentially

## Implementation

### Files to modify
- `index.html` — add "Swipe" toolbar button
- `src/app.js` — add swipe mode state, mode switching, pass finger data to renderer
- `src/canvas.js` — add `renderSwipe(keypoints, handDetected)` method

### Render method
`renderSwipe(keypoints, handDetected)`:
1. Draw iPhone frame (outer + screen rects)
2. If no hand detected, show "Show your index finger" message
3. Get index_finger_tip position, map to screen coords
4. Calculate card offset from finger x-position within screen
5. Draw card stack (next card behind, current card on top with offset + rotation)
6. Draw LIKE/NOPE badges based on offset direction/magnitude
7. If offset exceeds threshold → trigger card dismiss animation → advance to next profile

### Data flow
- `detector.onFrame` → checks mode, passes keypoints to renderer
- CanvasRenderer stores swipe state (current profile index, card offset, animating flag)
- Profile data stored as a const array in canvas.js
