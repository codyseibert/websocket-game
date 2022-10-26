const canvas = document.getElementById("canvas") as HTMLCanvasElement;

export function setupCanvas(width: number, height: number) {
  canvas.width = width;
  canvas.height = height;
  return canvas.getContext("2d") as CanvasRenderingContext2D;
}

export function getCanvasSize() {
  return {
    width: canvas.width,
    height: canvas.height,
  };
}

export const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
