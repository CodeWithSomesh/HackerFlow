'use client';

import { useEffect, useState } from 'react';
import Plasma from './plasma';

const colors = ['#ed07ea', '#fbff05', '#EE82EE', '#08f8a5', '#00FFFF', '#15f4ee', '#3F00FF'];

export default function PlasmaWrapper() {
    const [color, setColor] = useState(colors[0]);
  
    useEffect(() => {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      setColor(randomColor);
    }, [colors]);
  
    return (
      <Plasma
        color={color}
        speed={1.0}
        direction="forward"
        scale={1.2}
        opacity={0.6}
        mouseInteractive={true}
      />
    );
  }
