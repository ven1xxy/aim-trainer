class Target {
  x = 0;
  y = 0;
  width = 25;
  height = 25;
  scale = 1.0;

  constructor(x, y, width, height, scale) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.scale = scale;
  }

  calculateDrawTarget() {
    return new Target(
      this.x + this.width * ((1 - this.scale) / 2),
      this.y + this.height * ((1 - this.scale) / 2),
      this.width * this.scale,
      this.height * this.scale,
      1
    );
  }
}
