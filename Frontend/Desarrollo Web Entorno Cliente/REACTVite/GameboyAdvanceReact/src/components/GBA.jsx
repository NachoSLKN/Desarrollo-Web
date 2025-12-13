import UnityPlayer from "./UnityPlayer";

export default function GBA() {
  return (
    <div className="gba">
      <div className="gba-screen">
        <UnityPlayer />
      </div>

      <div className="gba-controls">
        <div className="dpad">+</div>

        <div className="ab-buttons">
          <button>A</button>
          <button>B</button>
        </div>
      </div>
    </div>
  );
}
