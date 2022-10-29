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

export function drawImage(image, x: number, y: number, degrees: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((degrees * Math.PI) / 180);
  ctx.drawImage(image, -image.width / 2, -image.width / 2);

  // ctx.translate(x + w / 2, y + h / 2);
  // ctx.rotate((degrees * Math.PI) / 180.0);
  // ctx.translate(-x - w / 2, -y - h / 2);
  // ctx.drawImage(image, x, y, w, h);
  ctx.restore();
}

export const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
