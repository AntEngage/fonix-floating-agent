import React, { useEffect, useRef } from "react";
import p5 from "p5";

const BubbleVisualizer = ({ volume, emotion, logo }) => {
  const sketchRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sketch = (p) => {
        let mainBubble;
        let outerBubble1;
        let outerBubble2;

        p.preload = () => {
          mainBubble = new Bubble(p, logo, 130, 0.05);
          outerBubble1 = new Bubble(p, logo, 220, 0.03);
          outerBubble2 = new Bubble(p, logo, 260, 0.01);
        };

        p.setup = () => {
          p.createCanvas(300, 300).parent("bubble-visualizer");
          const x = p.width / 2;
          const y = p.height / 2;
          mainBubble.setPosition(x, y);
          outerBubble1.setPosition(x, y);
          outerBubble2.setPosition(x, y);
        };

        p.draw = () => {
          // p.background(255);
          if (outerBubble2) outerBubble2.displayGradient('#ECECF5', '#F5ECF9');
          if (outerBubble1) outerBubble1.displayGradient('#D0D1E7', '#E7D1F0');
          if (mainBubble) mainBubble.displayGradient('#ABADD4', '#D3ACE4');
        };

        p.windowResized = () => {
          p.resizeCanvas(300, 300);
          const x = p.width / 2;
          const y = p.height / 2;
          if (mainBubble) mainBubble.setPosition(x, y);
          if (outerBubble1) outerBubble1.setPosition(x, y);
          if (outerBubble2) outerBubble2.setPosition(x, y);
        };

        p.updateBubbles = () => {
          if (mainBubble) mainBubble.update(volume, emotion, outerBubble1, outerBubble2);
        };
      };

      sketchRef.current = new p5(sketch);

      return () => {
        sketchRef.current.remove();
      };
    }
  }, [logo, volume, emotion]);

  class Bubble {
    constructor(p, logo, size, speed) {
      this.p = p;
      this.x = p.width / 2;
      this.y = p.height / 2;
      this.size = size;
      this.baseSize = size;
      this.extraSize = 0;
      this.color = p.color(52, 152, 219);
      this.logo = p.loadImage(logo);
      this.time = 0;
      this.speed = speed;
    }

    setPosition(x, y) {
      this.x = x;
      this.y = y;
    }

    displayGradient(color1, color2) {
      const radius = this.size / 2 + this.extraSize / 2;
      const gradientColor1 = this.p.color(color1);
      const gradientColor2 = this.p.color(color2);
      for (let r = radius; r > 0; r--) {
        const inter = this.p.map(r, 0, radius, 0, 1);
        const c = this.p.lerpColor(gradientColor1, gradientColor2, inter);
        this.p.fill(c);
        this.p.noStroke();
        this.p.ellipse(this.x, this.y, r * 2, r * 2);
      }
      if (this.size === 130) { // Only draw logo on main bubble
        this.drawLogo();
      }
    }

    update(volume, emotion, outerBubble1, outerBubble2) {
      this.time += this.speed;
      const volumeFactor = Math.min(volume / 30, 1);
      this.extraSize = this.p.sin(this.time) * this.baseSize * 0.3 * volumeFactor;

      // Update the outer bubbles using the passed instances
      outerBubble1.extraSize = -this.extraSize * 0.8;
      outerBubble2.extraSize = -this.extraSize * 0.6;
    }

    drawLogo() {
      if (this.logo && this.size === 130) {  // Only draw logo on main bubble
        const logoSize = this.size * 0.7;
        this.p.image(this.logo, this.x - logoSize / 2, this.y - logoSize / 2, logoSize, logoSize);
      }
    }
  }

  useEffect(() => {
    if (sketchRef.current) {
      sketchRef.current.updateBubbles();
    }
  }, [volume, emotion]);

  return <div id="bubble-visualizer"></div>;
};

export default BubbleVisualizer;
