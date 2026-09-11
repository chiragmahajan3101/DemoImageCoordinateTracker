import { useRef, useState } from "react";

export default function trackerUsingBSP() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [imageName, setImageName] = useState('');
  //State to store if image is uploaded or not for canvas visibility
  const [hasImage, setHasImage] = useState(false);
  //State to store selected color for brush
  const [brushColor, setBrushColor] = useState("#00000");
  // State to store brush size to draw
  const [brushSize, setBrushSize] = useState(5);


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

      URL.revokeObjectURL(imageURL);
      setImageName(uploadedFile.name);
      setHasImage(true);
    }

    imageVar.src = imageURL;
    console.log("Image Var: ", imageVar);

  }

  return (
    <>
      <div id="coordinate-tracker" className="m-2 p-5 text-center">
        <h1 className="mb-5">Drawn Shape Coordinate Tracker</h1>
        <div className="text-end">
          <button className="btn btn-success" disabled={false}>
          Download coordinates
        </button>
        </div>
        <div className="d-flex tracker-section justify-content-center border w-100">
          <div className="img-output border-end p-5 center w-50">
            <canvas
              ref={canvasRef}
              className={`border rounded mw-100 ${hasImage ? "" : "d-none"}`}
              style={{ cursor: "crosshair", touchAction: "none" }}
            />
          </div>
          <div className="input p-5 w-50 d-flex flex-column align-items-center">
            <div className="img-input mb-5">
              <label htmlFor="image-upload" className="btn btn-primary">
                Upload image
              </label>
              <span className="ms-3 text-muted">{imageName || "No image selected"}</span>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="d-none"
                onChange={uploadImage}
              />
            </div>
            <div className="brush-input d-flex flex-row justify-content-between">
              <div className="brush-color-input">
                <label htmlFor="brush-color" className="form-label d-block">
                  Brush Color
                </label>

                <input
                  id="brush-color"
                  type="color"
                  className="form-control form-control-color"
                  value={brushColor}
                  onChange={(event) => setBrushColor(event?.target.value)}
                />
              </div>
              <div className="brush-size-input">
                <label htmlFor="brush-size" className="form-label">
                  Brush size: {brushSize}px
                </label>

                <input
                  id="brush-size"
                  type="range"
                  className="form-range"
                  min="1"
                  max="50"
                  value={brushSize}
                  onChange={(event) => setBrushSize(Number(event.target.value))}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
