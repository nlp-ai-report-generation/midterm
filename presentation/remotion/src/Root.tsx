import { Composition } from "remotion";
import outline from "../../content/outline.json";
import { MidtermDeckVideo } from "./MidtermDeckVideo";

const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;
const DURATION_IN_FRAMES = outline.videoScenes.reduce(
  (sum, scene) => sum + Math.round(scene.durationSec * FPS),
  0
);

export const RemotionRoot = () => {
  return (
    <Composition
      id="MidtermDeckVideo"
      component={MidtermDeckVideo}
      width={WIDTH}
      height={HEIGHT}
      fps={FPS}
      durationInFrames={DURATION_IN_FRAMES}
      defaultProps={{ outline }}
    />
  );
};
