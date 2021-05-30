import { useState, useRef, useEffect, useCallback } from 'react'
import WaveSurfer from "wavesurfer.js";

const defaultregions = [
    {
        id: "region-1",
        start: 0.5,
        end: 10,
        color: "rgba(0, 0, 0, .5)",
        subtitle: "hello how are you"
    }
]

const formWaveSurferOptions = ref => ({
    container: ref,
    waveColor: "#eee",
    progressColor: "OrangeRed",
    cursorColor: "OrangeRed",
    barWidth: 3,
    barRadius: 3,
    responsive: true,
    height: 150,
    // If true, normalize by the maximum peak instead of 1.0.
    normalize: true,
    // Use the PeakCache to improve rendering speed of large waveforms.
    partialRender: true,
    backend: 'MediaElement',
    // plugins: [
    //     WaveSurfer.regions.create(),
    //     WaveSurfer.minimap.create({
    //         height: 30,
    //         waveColor: '#ddd',
    //         progressColor: '#999'
    //     }),
    //     WaveSurfer.timeline.create({
    //         container: '#wave-timeline'
    //     }),
    //     WaveSurfer.cursor.create()
    // ]
});

const MyWaveformer = ( {url} ) => {
    const [playing, setPlay] = useState(false)
    const [regions, setRegions] = useState(defaultregions[0])
    const waveformRef = useRef(null);
    const wavesurfer = useRef(null);
    const regionRef = useRef(regions);

    useEffect(() => {
        setPlay(false)

        const options = formWaveSurferOptions(waveformRef.current);

        wavesurfer.current = WaveSurfer.create(options);
        

        return () => {
            wavesurfer.current.destroy();
        }
    }, [url])

    const handlePlayPause = () => {
        setPlay(!playing);
        wavesurfer.current.playPause();
    };

    const handleWSMount = useCallback(
        waveSurfer => {
            wavesurfer.current = waveSurfer;

            if(wavesurfer.current){
                console.log("WaveSurfer load url");
                wavesurfer.current.load(url);
    
                wavesurfer.current.on("region-created", regionCreatedHandler);
                // wavesurfer.current.load("../../../media/example.mp4")
                regionRef.current = regions;
                wavesurfer.current.on("ready", () => {
                    console.log("WaveSurfer is ready");
                    // regionRef.current = regions;
                    // wavesurfer.current.loadRegion(regionRef);
                })

                wavesurfer.current.on("region-removed", region => {
                    console.log("region-removed --> ", region);
                });
            }
        },
        [regionCreatedHandler, regions, url],
    );

    const regionCreatedHandler = useCallback(
        region => {
          console.log("region-created --> region:", region);
    
          if (region.data.systemRegionId) return;
    
          setRegions([
            ...regionRef.current,
            { ...region, data: { ...region.data, subtitle: "default" } }
          ]);
        },
        [regionRef]
    );

    return (
        <div>
            <div id="waveform" ref={waveformRef}/>
            <div className="controls">
                <button onClick={handlePlayPause}>{!playing ? "Play" : "Pause"}</button>
            </div>
        </div>
    )
}

export default MyWaveformer
