import { Composition } from 'remotion';
import { MidtermPitchVideo } from './Video';
import { FPS, WIDTH, HEIGHT } from './data/tokens';
import { getTotalDuration } from './data/scenes';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MidtermPitch"
      component={MidtermPitchVideo}
      durationInFrames={getTotalDuration()}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
