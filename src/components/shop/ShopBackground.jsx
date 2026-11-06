import React, { useEffect } from "react";

export const SHOP_BACKGROUND =
"https://base44.app/api/apps/69e14a987a927963a9924d5a/files/mp/public/69e14a987a927963a9924d5a/ee04ab000_boutique-matrix-bg.png";

export const SHOP_PAGE_COLOR = "#05030a";

/**
 * Unique fond de la Boutique Matrix.
 * Neutralise le fond global du thème pendant l'affichage de la page
 * pour éviter tout doublon derrière l'image.
 */
export default function ShopBackground({ posX = 0, posY = 0, scale = 100 }) {
  useEffect(() => {
    const body = document.body;
    const previousImage = body.style.getPropertyValue("background-image");
    const previousColor = body.style.getPropertyValue("background-color");

    body.style.setProperty("background-image", "none", "important");
    body.style.setProperty("background-color", SHOP_PAGE_COLOR, "important");

    return () => {
      if (previousImage) body.style.setProperty("background-image", previousImage, "important");
      else body.style.removeProperty("background-image");
      if (previousColor) body.style.setProperty("background-color", previousColor, "important");
      else body.style.removeProperty("background-color");
    };
  }, []);

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 h-[100svh] overflow-hidden"
      aria-hidden="true">

      <div className="relative h-full w-full" style={{ paddingLeft: "clamp(0px, 3vw, 64px)" }}>
        <img
          src={SHOP_BACKGROUND}
          alt=""
          className="h-full w-full object-cover"
          style={{
            objectPosition: `${posX}% ${posY}%`,
            transform: `scale(${scale / 100})`,
            transformOrigin: `${posX}% ${posY}%`,
            transition: "transform 200ms ease-out"
          }} />

        <div
          className="absolute inset-0"
          style={{
            background:
            "linear-gradient(180deg, rgba(5,3,10,0.12) 0%, rgba(5,3,10,0.30) 42%, rgba(5,3,10,0.68) 74%, #05030a 100%)"
          }} />

      </div>
    </div>);

}