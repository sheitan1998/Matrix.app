import React, { forwardRef } from 'react';

// Editor data-* annotations belong to DOM elements, not Three.js property paths.
const RouletteSceneElement = forwardRef(function RouletteSceneElement({ as, children, ...props }, ref) {
  const sceneProps = Object.fromEntries(
    Object.entries(props).filter(([name]) => !name.startsWith('data-')),
  );
  return React.createElement(as, { ...sceneProps, ref }, children);
});

export default RouletteSceneElement;