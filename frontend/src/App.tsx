import React, { useState } from 'react';
import MyWaveformer from './components/MyWaveformer';
import PlayList from './components/PlayList';

const tracks = [
  {
    id: 0,
    title: "Brahms: St Anthony Chorale - Theme, Two Pianos Op.56b",
    url:
      "https://www.mfiles.co.uk/mp3-downloads/brahms-st-anthony-chorale-theme-two-pianos.mp3"
  },
  {
    id: 1,
    title: "Franz Schubert's Ständchen - Voice (Clarinet) & Piano",
    url:
      "https://www.mfiles.co.uk/mp3-downloads/franz-schubert-standchen-serenade.mp3"
  }
];

function App() {
  const [selectedTrack, setSelectedTrack] = useState(tracks[0]);

  return (
    <div className="App">
      <header className="App-header">
      </header>
      <main>
        <div className="flex justify-center mt-12">

          <input className="py-2 text-sm text-black placeholder-gray-500 border border-gray-200 w-96 focus:border-light-blue-500"
            type="text"
            placeholder="Input URL" />
          <button className="block px-3 py-3 ml-6 border border-blue-300 rounded-lg">Download YouTube Video</button>
        </div>
        <div className="justify-center w-full ">
          <MyWaveformer url={selectedTrack.url} />
        </div>
        <div className="justify-center w-full ">

          <PlayList
            tracks={tracks}
            selectedTrack={selectedTrack}
            setSelectedTrack={setSelectedTrack}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
