import { Bone, Droplets } from 'lucide-react';
import LotusScene from './LotusScene.jsx';
import PupScene from './PupScene.jsx';

// The artwork for each theme id. Themes live in the domain layer; how they look lives here.
// Adding a theme means adding an entry here and one in logic/domain/themes.js.
const ART = {
  lotus: { Scene: LotusScene, Icon: Droplets },
  pup: { Scene: PupScene, Icon: Bone },
};

export const artFor = (themeId) => ART[themeId] ?? ART.lotus;
