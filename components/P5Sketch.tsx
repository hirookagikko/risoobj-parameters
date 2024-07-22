'use client';

import React, { useEffect, useRef } from 'react';
import p5 from 'p5';

const P5Sketch: React.FC = () => {
  const sketchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let instance: p5;

    if (sketchRef.current) {
      const sketch = (p: p5) => {
        p.setup = () => {
          p.createCanvas(800, 800);
        };

        p.draw = () => {
          p.background(220);
          p.ellipse(p.width / 2, p.height / 2, 400, 400);
        };
      };

      instance = new p5(sketch, sketchRef.current);
    }

    return () => {
      if (instance) {
        instance.remove();
      }
    };
  }, []);

  return <div ref={sketchRef} />;
};

export default P5Sketch;