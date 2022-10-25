const canvas = document.getElementById("canvas") as HTMLCanvasElement;

export function setupCanvas(w: number, h: number) {
  canvas.width = w;
  canvas.height = h;
  return canvas.getContext("2d") as CanvasRenderingContext2D;
}

export function getCanvasSize() {
  return {
    width: canvas.width,
    height: canvas.height,
  };
}

export const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
