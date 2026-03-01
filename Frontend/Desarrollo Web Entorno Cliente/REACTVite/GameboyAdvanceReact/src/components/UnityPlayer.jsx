import { useEffect, useRef } from "react";

export default function UnityPlayer() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (window.unityInstance) return;

    const script = document.createElement("script");
    script.src = "/Build/gba.loader.js";
    script.async = true;

    script.onload = () => {
      window.createUnityInstance(canvasRef.current, {
        dataUrl: "/Build/gba.data",
        frameworkUrl: "/Build/gba.framework.js",
        codeUrl: "/Build/gba.wasm",
        devicePixelRatio: 1,
      }).then((instance) => {
        window.unityInstance = instance;
      });
    };

    document.head.appendChild(script);
  }, []);

  return (
    <canvas
      id="unity-canvas"
      ref={canvasRef}
      width={240}
      height={160}
      style={{
        width: "240px",
        height: "160px",
        background: "black",
      }}
    />
  );
}
