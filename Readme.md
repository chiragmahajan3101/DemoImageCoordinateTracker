# Coordinates Tracker for Shapes Drawn on Image

A React-based web application that allows users to upload an image, draw shapes over it, and extract the bounding box coordinates of those shapes into a downloadable JSON file. 

Built with **React**, **React Bootstrap**, and **Mantine** for a clean, minimalist user interface.

* **Bootstrap endpoint:** {host}:{port}/
* **Mantine endpoint:** {host}:{port}/mt

## 🚀 Features

*   **Image Upload:** Easily upload any background image to the canvas.
*   **Customizable Brush:** Adjust brush color and stroke size (e.g., 7px) using Mantine UI sliders and color pickers.
*   **Canvas Drawing:** Freehand draw over the uploaded image to highlight specific regions.
*   **Coordinate Extraction:** Export the drawn boundaries as a JSON file containing the minimum and maximum X/Y coordinates.
*   **Canvas Reset:** Quickly clear the canvas drawings to start over.

## 🖼️ UI Reference
The layout features a straightforward, split-pane design:
*   **Left Pane:** The interactive canvas where the uploaded image and drawings appear.
*   **Right Pane:** Controls for uploading the image, selecting brush color, and adjusting brush size.
*   **Top Bar:** Action buttons for "Reset drawing" and "Download coordinates".

## 📖 Usage Example

1.  Click **Upload Image** and select a background file.
2.  Adjust your **Brush Color** and **Brush size**.
3.  Draw a shape around your target area in a **single, continuous stroke**.
4.  Click **Download coordinates** to generate and download the `.json` file.

### Example JSON Output
```json
[
  [
    [
      267,12
    ],
    [
      317,116
    ]
  ],
  [
    [
      45,5
    ],
    [
      114,114
    ]
  ]
]
```
## ⚠️ Known Limitations & Considerations

Please note the following technical behaviors regarding how shapes and coordinates are currently processed:

*   **Bounding Box vs. Exact Points:** The downloaded JSON provides a true bounding box (`minX`, `minY`, `maxX`, `maxY`). This means `minX` and `minY` are calculated independently from all points in the stroke. Consequently, the `minX` and `minY` values may originate from entirely **different points** on the drawn path, rather than representing a single "top-leftmost" coordinate pair on the line itself. 
*   **Single-Stroke Requirement:** Currently, a shape must be drawn in one continuous go (a single mousedown-to-mouseup event). 

To support drawing a single shape with multiple separate strokes in the future, the architecture will require one of the following updates:
1.  **Manual Grouping (UI Approach):** Introducing a "Finish Shape" or "Group Strokes" button so the application knows when a specific shape is officially completed before resetting the array for the next shape.
2.  **Algorithmic Grouping (Logic Approach):** Implementing complex path-intersection or proximity logic to automatically determine if a new stroke is meant to intersect with and be part of the previously drawn shape.

