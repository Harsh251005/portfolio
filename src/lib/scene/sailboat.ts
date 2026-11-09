/* ---------------------------------------------------------------
   The small sailboat, used on phones (portrait screens). The cruise
   liner (ship.ts) is too long for a narrow screen: the only free water
   is a thin strip under the hero buttons, so phones get this instead.
   --------------------------------------------------------------- */

export function drawSailboat(ctx: CanvasRenderingContext2D, t: number, w: number, h: number, hz: number) {
  const scale = Math.min(1, w / 1100) * 0.45 + 0.55;
  const span = w + 240;
  // Heading left at an easy drift, and round again. The speed follows the
  // boat's size, so on a small screen it doesn't race across.
  const bx = w + 120 - ((w * 0.36 + 120 + t * 10 * scale) % span);
  const wy = hz + (h - hz) * 0.2;
  const by = wy + Math.sin(t * 0.9) * 1.6 * scale;
  const roll = Math.sin(t * 0.7 + 1) * 0.035;

  // The dark reflection and the wake sit on the water, under the hull.
  ctx.fillStyle = 'rgba(2,5,12,0.42)';
  ctx.beginPath();
  ctx.ellipse(bx, wy + 7 * scale, 34 * scale, 5 * scale, 0, 0, 6.2832);
  ctx.fill();
  for (let i = 0; i < 5; i++) {
    const k = i / 4;
    const shimmer = Math.sin(t * 2.2 + i * 1.7);
    ctx.fillStyle = `rgba(190,205,230,${(0.34 - k * 0.26) * (0.75 + 0.25 * shimmer)})`;
    const len = (20 + i * 15) * scale;
    const gap = (i * 5 + 3) * scale;
    ctx.fillRect(bx + (28 + i * 19) * scale, wy + gap * 0.55 + 1, len, 1.3);
    ctx.fillRect(bx + (28 + i * 19) * scale, wy - gap * 0.2 + 1, len * 0.7, 1);
  }

  ctx.save();
  // Everything below the wavy waterline is hidden: the hull sits in the sea.
  ctx.beginPath();
  ctx.moveTo(bx - 70 * scale, wy - 120 * scale);
  ctx.lineTo(bx + 70 * scale, wy - 120 * scale);
  for (let x = 70; x >= -70; x -= 7) {
    ctx.lineTo(bx + x * scale, wy + 1.5 * scale + Math.sin(x * 0.14 + t * 2.2) * 1.3 * scale);
  }
  ctx.closePath();
  ctx.clip();

  ctx.translate(bx, by);
  ctx.rotate(roll);
  ctx.scale(scale, scale);
  // Hull.
  ctx.fillStyle = 'rgb(5,8,16)';
  ctx.beginPath();
  ctx.moveTo(-34, -8);
  ctx.quadraticCurveTo(-10, -5, 30, -7);
  ctx.lineTo(25, 7);
  ctx.lineTo(-23, 7);
  ctx.closePath();
  ctx.fill();
  // Mast.
  ctx.fillRect(-1, -64, 1.6, 58);
  // Sails, catching the moon on the side that faces it.
  const main = ctx.createLinearGradient(0, -60, 22, -10);
  main.addColorStop(0, 'rgb(150,163,190)');
  main.addColorStop(1, 'rgb(82,94,122)');
  ctx.fillStyle = main;
  ctx.beginPath();
  ctx.moveTo(1.5, -62);
  ctx.quadraticCurveTo(25, -36, 27, -11);
  ctx.lineTo(1.5, -11);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgb(60,70,96)';
  ctx.beginPath();
  ctx.moveTo(-2, -57);
  ctx.quadraticCurveTo(-18, -32, -27, -11);
  ctx.lineTo(-2, -11);
  ctx.closePath();
  ctx.fill();
  // A lamp at the stern.
  const lamp = 0.8 + 0.2 * Math.sin(t * 2.3);
  ctx.fillStyle = `rgba(255,214,140,${lamp})`;
  ctx.fillRect(15, -11, 3.2, 3.2);
  ctx.restore();

  const glow = ctx.createRadialGradient(bx + 16 * scale, by - 9 * scale, 0, bx + 16 * scale, by - 9 * scale, 15 * scale);
  glow.addColorStop(0, `rgba(255,205,120,${0.5 * lamp})`);
  glow.addColorStop(1, 'rgba(255,205,120,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(bx, by - 25 * scale, 32 * scale, 32 * scale);
}
