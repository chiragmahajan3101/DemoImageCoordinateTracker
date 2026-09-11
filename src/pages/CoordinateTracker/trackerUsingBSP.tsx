import { useRef, useState } from "react";

export default function trackerUsingBSP() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [imageName, setImageName] = useState('');
  //State to store if image is uploaded or not for canvas visibility
  const [hasImage, setHasImage] = useState(false);
  //State to store selected color for brush
  const [brushColor, setBrushColor] = useState("#000000");
  // State to store brush size to draw
  const [brushSize, setBrushSize] = useState(7  );


  // Ref to not render anything on change of its values
  const strokesRef = useRef<any>([]);
  const currentStrokeRef = useRef<any | null>(null);
  const isDrawingRef = useRef(false);
  const baseImageRef = useRef<ImageData | null>(null);


  function uploadImage(event: React.ChangeEvent<HTMLInputElement>) {
    console.log(event.target.files);
    const uploadedFile = event.target.files?.[0];

    if(!uploadedFile) {
      console.log("Image Not Uploaded Successfully");
      // To avoid any upload issue and typescript strict checks
      return;
    }

    const imageVar = new Image();
    const imageURL = URL.createObjectURL(uploadedFile);

    imageVar.onload = () => {
      const canvasVar = canvasRef.current;
      if(!canvasVar) {
        console.log("Canvas Not mounted");
        return;
      }

      const maxSize = 500;
      // scaling uploaded image based on max size
      const scale = Math.min(maxSize/imageVar.width, maxSize/imageVar.height, 1);

      canvasVar.width = Math.round(imageVar.width*scale);
      canvasVar.height = Math.round(imageVar.height*scale);

      const canvasContext = canvasVar.getContext("2d");
      canvasContext?.drawImage(imageVar, 0, 0, canvasVar.width, canvasVar.height);

      baseImageRef.current = canvasContext?.getImageData(
        0,
        0,
        canvasVar.width,
        canvasVar.height
      ) ?? null
      
      // Deleting all the previously stored strokes for fresh image
      strokesRef.current = [];
      currentStrokeRef.current = null;

      URL.revokeObjectURL(imageURL);
      setImageName(uploadedFile.name);
      setHasImage(true);
    };

    imageVar.src = imageURL;
    console.log("Image Var: ", imageVar);

  }

  // Function to return exact point coordinates to draw as normally drawing on canvas is a slight farther than actual point
  function getExactCursorPosition(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvasVar = event.currentTarget;
    const rectCoordinates = canvasVar.getBoundingClientRect();

    return {
      x: (event.clientX - rectCoordinates.left) * (canvasVar.width / rectCoordinates.width),
      y: (event.clientY - rectCoordinates.top) * (canvasVar.height / rectCoordinates.height),
    };
  }


  function startDrawing(event: React.PointerEvent<HTMLCanvasElement>) {
    if(!hasImage) {
      console.log("Cant Draw as no image is uploaded");
      return;
    }

    const canvasVar = canvasRef.current;
    const canvasContext = canvasVar?.getContext("2d");

    if(!canvasVar || !canvasContext) {
      console.error("Canvas not mounted properly");
      return;
    }

    const currentPointCoordinates = getExactCursorPosition(event);
    console.log("Mouse is clicked here: ", currentPointCoordinates);
    console.log("Started Drawing on Image");
    
    const newStroke = [currentPointCoordinates];
    strokesRef.current.push(newStroke);
    currentStrokeRef.current = newStroke;
    isDrawingRef.current = true;

    canvasVar.setPointerCapture(event.pointerId);

    canvasContext.beginPath();
    canvasContext.moveTo(currentPointCoordinates.x, currentPointCoordinates.y);
    canvasContext.strokeStyle = brushColor;
    canvasContext.lineWidth = brushSize;
    canvasContext.lineCap = "round";
    canvasContext.lineJoin = "round";
  }

  function draw(event: React.PointerEvent<HTMLCanvasElement>) {
    if(!isDrawingRef.current) {
      console.error("isDrawing state is set to false");
      return;
    }

    const canvasVar = canvasRef.current;
    const canvasContext = canvasVar?.getContext("2d");

    if(!canvasVar || !canvasContext) {
      console.error("Canvas not mounted properly");
      return;
    }

    const currentPointCoordinates = getExactCursorPosition(event);

    // Saving all stroker coordinates in current state
    currentStrokeRef.current?.push(currentPointCoordinates);

    canvasContext.lineTo(currentPointCoordinates.x, currentPointCoordinates.y);
    canvasContext.stroke();
  }

  function stopDrawing() {
    console.log("Stroker Stopped", currentStrokeRef.current);
    console.log("storedStroker", strokesRef.current);
    isDrawingRef.current = false;
    currentStrokeRef.current = null;
  }

  function resetDrawing() {
    const canvasVar = canvasRef.current
    const canvasContext = canvasVar?.getContext('2d')

    if (!canvasContext || !baseImageRef.current) return

    canvasContext.putImageData(baseImageRef.current, 0, 0)

    strokesRef.current = []
    currentStrokeRef.current = null
    isDrawingRef.current = false
  }

  function downloadCoordinatesJSON() {
    const strokeValues = strokesRef.current.map((points, index) => {
      const leftmostPoint = points.reduce((leftmost, point) =>
        point.x < leftmost.x ? point : leftmost
      )

      const rightmostPoint = points.reduce((rightmost, point) =>
        point.x > rightmost.x ? point : rightmost
      )

      const xValues = points.map((point) => point.x);
      const yValues = points.map((point) => point.y);

      // Retruning leftmost and rightmost points logic
      // return [
      //   {
      //     minPoints: [Math.round(leftmostPoint.x), Math.round(leftmostPoint.y)]
      //   },
      //   {
      //     maxPoints: [Math.round(rightmostPoint.x), Math.round(rightmostPoint.y)]
      //   }
      // ]

      return [
        [Math.round(Math.min(...xValues)), Math.round(Math.min(...yValues))],
        [Math.round(Math.max(...xValues)), Math.round(Math.max(...yValues))]
      ] 
    });

    const data = strokeValues;

    const jsonFile = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(jsonFile);
    const link = document.createElement("a");

    link.href = url;
    link.download = "shape-coordinates.json";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div id="coordinate-tracker" className="m-2 p-5 text-center">
        <h1 className="mb-5">Drawn Shape Coordinate Tracker</h1>
        <div className="text-end mb-2">
           <button
            className="btn btn-fossil-primary me-2"
            onClick={resetDrawing}
            disabled={!hasImage}
          >
            Reset drawing
          </button>
          <button className="btn btn-fossil-download" onClick={downloadCoordinatesJSON} disabled={!hasImage}>
          Download coordinates
          </button>
        </div>
        <div className="tracker-section border">
          <div className="row g-0">
            <div className="img-output border-end col-12 col-md-6 p-3 p-md-5 text-center">
              <canvas
                ref={canvasRef}
                className={`border mw-100 ${hasImage ? '' : 'd-none'}`}
                style={{ cursor: 'crosshair', touchAction: 'none' }}
                onPointerDown={startDrawing}
                onPointerMove={draw}
                onPointerUp={stopDrawing}
                onPointerCancel={stopDrawing}
                onPointerLeave={stopDrawing}
              />
            </div>

            <div className="input col-12 col-md-6 p-3 p-md-5 d-flex flex-column align-items-center">
              <div className="img-input mb-4 d-flex flex-wrap justify-content-center align-items-center gap-2">
                <label htmlFor="image-upload" className="btn btn-fossil-primary">
                  Upload Image
                </label>

                <span className="text-muted text-break">
                  {imageName || 'No image selected'}
                </span>

                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="d-none"
                  onChange={uploadImage}
                />
              </div>

              <div className="brush-input d-flex flex-column flex-sm-row align-items-center align-items-sm-end justify-content-center gap-4 w-100">
                <div className="brush-color-input">
                  <label htmlFor="brush-color" className="form-label d-block">
                    Brush Color
                  </label>

                  <input
                    id="brush-color"
                    type="color"
                    className="form-control form-control-color"
                    value={brushColor}
                    onChange={(event) => setBrushColor(event.target.value)}
                  />
                </div>

                <div className="brush-size-input w-100">
                  <label htmlFor="brush-size" className="form-label">
                    Brush size: {brushSize}px
                  </label>

                  <input
                    id="brush-size"
                    type="range"
                    className="form-range brush-slider"
                    min="1"
                    max="50"
                    value={brushSize}
                    style={
                      {
                        '--thumb-size': `${Math.max(10, Math.min(brushSize, 30))}px`,
                        '--brush-color': brushColor,
                      } as React.CSSProperties
                    }
                    onChange={(event) => setBrushSize(Number(event.target.value))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
