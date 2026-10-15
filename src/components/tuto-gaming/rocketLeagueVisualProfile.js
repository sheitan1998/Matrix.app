function stableHash(value) {
  let hash = 2166136261;
  for (const character of String(value || 'matrix')) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function rocketVehicleProfile(bodyName = '', wheelName = '') {
  const body = String(bodyName).toLowerCase();
  const family = /fennec|merc|road hog|battle bus/.test(body)
    ? 'boxy'
    : /dominus|breakout|endo|masamune|samurai/.test(body)
      ? 'sport'
      : 'rally';
  const wheelHash = stableHash(wheelName);
  return {
    family,
    wheelRadius: 30 + (wheelHash % 6),
    wheelSpokes: 5 + (wheelHash % 5),
    stripeOffset: stableHash(bodyName) % 44,
  };
}
