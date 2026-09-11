import { useRef, useState } from "react";
import {
  Container,
  Title,
  Button,
  Grid,
  Group,
  Text,
  FileButton,
  ColorInput,
  Slider,
  Stack,
  Paper,
  Box,
} from "@mantine/core";

export default function TrackerUsingMTN() {
  type Point = {
    x: number;
    y: number;
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [imageName, setImageName] = useState("");
  const [hasImage, setHasImage] = useState(false);
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(7);

  const strokesRef = useRef<Point[][]>([]);
  const currentStrokeRef = useRef<Point[] | null>(null);
  const isDrawingRef = useRef(false);
  const baseImageRef = useRef<ImageData | null>(null);

  function uploadImage(uploadedFile: File | null) {
    console.log(uploadedFile ? [uploadedFile] : undefined); 

    if (!uploadedFile) {
      console.log("Image Not Uploaded Successfully");
      return;
    }

    const imageVar = new Image();
    const imageURL = URL.createObjectURL(uploadedFile);

    imageVar.onload = () => {
      const canvasVar = canvasRef.current;
      if (!canvasVar) {
        console.log("Canvas Not mounted");
        return;
      }

      const maxSize = 500;
      const scale = Math.min(
        maxSize / imageVar.width,
        maxSize / imageVar.height,
        1
      );

      canvasVar.width = Math.round(imageVar.width * scale);
      canvasVar.height = Math.round(imageVar.height * scale);

      const canvasContext = canvasVar.getContext("2d");
      canvasContext?.drawImage(
        imageVar,
        0,
        0,
        canvasVar.width,
        canvasVar.height
      );

      baseImageRef.current =
        canvasContext?.getImageData(
          0,
          0,
          canvasVar.width,
          canvasVar.height
        ) ?? null;

      strokesRef.current = [];
      currentStrokeRef.current = null;

      URL.revokeObjectURL(imageURL);
      setImageName(uploadedFile.name);
      setHasImage(true);
    };

    imageVar.src = imageURL;
    console.log("Image Var: ", imageVar);
  }

  function getExactCursorPosition(
    event: React.PointerEvent<HTMLCanvasElement>
  ): Point {
    const canvasVar = event.currentTarget;
    const rectCoordinates = canvasVar.getBoundingClientRect();

    return {
      x:
        (event.clientX - rectCoordinates.left) *
        (canvasVar.width / rectCoordinates.width),
      y:
        (event.clientY - rectCoordinates.top) *
        (canvasVar.height / rectCoordinates.height),
    };
  }

  function startDrawing(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!hasImage) {
      console.log("Cant Draw as no image is uploaded");
      return;
    }

    const canvasVar = canvasRef.current;
    const canvasContext = canvasVar?.getContext("2d");

    if (!canvasVar || !canvasContext) {
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
    if (!isDrawingRef.current) {
      console.error("isDrawing state is set to false");
      return;
    }

    const canvasVar = canvasRef.current;
    const canvasContext = canvasVar?.getContext("2d");

    if (!canvasVar || !canvasContext) {
      console.error("Canvas not mounted properly");
      return;
    }

    const currentPointCoordinates = getExactCursorPosition(event);
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
    const canvasVar = canvasRef.current;
    const canvasContext = canvasVar?.getContext("2d");

    if (!canvasContext || !baseImageRef.current) return;

    canvasContext.putImageData(baseImageRef.current, 0, 0);

    strokesRef.current = [];
    currentStrokeRef.current = null;
    isDrawingRef.current = false;
  }

  function downloadCoordinatesJSON() {
    const strokeValues = strokesRef.current.map((points) => {
      const xValues = points.map((point) => point.x);
      const yValues = points.map((point) => point.y);

      return [
        [Math.round(Math.min(...xValues)), Math.round(Math.min(...yValues))],
        [Math.round(Math.max(...xValues)), Math.round(Math.max(...yValues))],
      ];
    });

    const jsonFile = new Blob([JSON.stringify(strokeValues, null, 2)], {
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
    <Container id="coordinate-tracker" size="xl" py="xl">
      <Title ta="center" mb={40} order={1}>
        Drawn Shape Coordinate Tracker
      </Title>

      <Group justify="flex-end" mb="md">
        <Button
          onClick={resetDrawing}
          disabled={!hasImage}
          color="#5a5146" /* Matches your var(--fossil-primary) */
        >
          Reset drawing
        </Button>
        <Button
          onClick={downloadCoordinatesJSON}
          disabled={!hasImage}
          color="#8a7055" /* Matches your var(--fossil-accent) */
        >
          Download coordinates
        </Button>
      </Group>

      <Paper withBorder shadow="sm" radius="md" overflow="hidden">
        <Grid gutter={0}>
          {/* Canvas Section */}
          <Grid.Col
            span={{ base: 12, md: 6 }}
            p="xl"
            style={{
              borderRight: "1px solid var(--mantine-color-default-border)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Box
              component="canvas"
              ref={canvasRef}
              style={{
                cursor: "crosshair",
                touchAction: "none",
                display: hasImage ? "block" : "none",
                maxWidth: "100%",
                border: "1px solid var(--mantine-color-default-border)",
              }}
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              onPointerCancel={stopDrawing}
              onPointerLeave={stopDrawing}
            />
          </Grid.Col>

          {/* Controls Section */}
          <Grid.Col span={{ base: 12, md: 6 }} p="xl">
            <Stack align="center" justify="center" h="100%" gap="xl">
              
              <Group align="center" justify="center">
                <FileButton onChange={uploadImage} accept="image/*">
                  {(props) => (
                    <Button {...props} color="#5a5146">
                      Upload Image
                    </Button>
                  )}
                </FileButton>
                <Text c="dimmed" size="sm" style={{ wordBreak: "break-word" }}>
                  {imageName || "No image selected"}
                </Text>
              </Group>

              <Group align="flex-end" justify="center" w="100%" gap="xl">
                <ColorInput
                  label="Brush Color"
                  value={brushColor}
                  onChange={setBrushColor}
                  style={{ flex: 1, minWidth: "150px" }}
                />

                <Box style={{ flex: 2, minWidth: "200px" }}>
                  <Text size="sm" fw={500} mb={5}>
                    Brush size: {brushSize}px
                  </Text>
                  <Slider
                    min={1}
                    max={50}
                    value={brushSize}
                    onChange={setBrushSize}
                    color={brushColor}
                    styles={{
                      thumb: {
                        width: Math.max(12, Math.min(brushSize, 30)),
                        height: Math.max(12, Math.min(brushSize, 30)),
                      },
                    }}
                  />
                </Box>
              </Group>

            </Stack>
          </Grid.Col>
        </Grid>
      </Paper>
    </Container>
  );
}
