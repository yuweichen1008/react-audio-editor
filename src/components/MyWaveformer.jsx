import React, { useCallback, useEffect,  useRef, useState,  useMemo } from "react";
import { WaveSurfer, WaveForm, Region } from "wavesurfer-react";
import RegionsPlugin from "wavesurfer.js/dist/plugin/wavesurfer.regions.min";
import TimelinePlugin from "wavesurfer.js/dist/plugin/wavesurfer.timeline.min";

function generateNum(min, max) {
    return Math.random() * (max - min + 1) + min;
}

function generateTwoNumsWithDistance(distance, min, max) {
    const num1 = generateNum(min, max);
    const num2 = generateNum(min, max);
    // if num2 - num1 < 10
    if (num2 - num1 >= 10) {
        return [num1, num2];
    }
    return generateTwoNumsWithDistance(distance, min, max);
}

const MyWaveformer = ({ url }) => {
    const [timelineVis, setTimelineVis] = useState(true);

    const plugins = useMemo(() => {
        return [
            {
                plugin: RegionsPlugin,
                options: { dragSelection: true }
            },
            timelineVis && {
                plugin: TimelinePlugin,
                options: {
                    container: "#timeline"
                }
            }
        ].filter(Boolean);
    }, [timelineVis]);

    const toggleTimeline = useCallback(() => {
        setTimelineVis(!timelineVis);
    }, [timelineVis]);

    const [regions, setRegions] = useState([
        {
            id: "region-1",
            start: 0.5,
            end: 10,
            color: "rgba(0, 0, 0, .5)",
            data: {
                systemRegionId: 31
            }
        },
        {
            id: "region-2",
            start: 15,
            end: 25,
            color: "rgba(225, 195, 100, .5)",
            data: {
                systemRegionId: 32
            }
        },
        {
            id: "region-3",
            start: 35,
            end: 45,
            color: "rgba(25, 95, 195, .5)",
            data: {
                systemRegionId: 33
            }
        }
    ]);

    // use regions ref to pass it inside useCallback
    // so it will use always the most fresh version of regions list
    const regionsRef = useRef(regions);

    useEffect(() => {
        regionsRef.current = regions;
    }, [regions]);

    const regionCreatedHandler = useCallback(
        (region) => {
            console.log("region-created --> region:", region);

            if (region.data.systemRegionId) return;

            setRegions([
                ...regionsRef.current,
                { ...region, data: { ...region.data, systemRegionId: -1 } }
            ]);
        },
        [regionsRef]
    );

    const wavesurferRef = useRef();
    const handleWSMount = useCallback(
        (waveSurfer) => {
            wavesurferRef.current = waveSurfer;
            if (wavesurferRef.current) {
                wavesurferRef.current.load(url);

                wavesurferRef.current.on("region-created", regionCreatedHandler);

                wavesurferRef.current.on("ready", () => {
                    console.log("WaveSurfer is ready");
                });

                wavesurferRef.current.on("region-removed", (region) => {
                    console.log("region-removed --> ", region);
                });

                wavesurferRef.current.on("loading", (data) => {
                    console.log("loading --> ", data);
                });

                if (window) {
                    window.surferidze = wavesurferRef.current;
                }
            }
        },
        [url, regionCreatedHandler]
    );

    const generateRegion = useCallback(() => {
        if (!wavesurferRef.current) return;
        const minTimestampInSeconds = 0;
        const maxTimestampInSeconds = wavesurferRef.current.getDuration();
        const distance = generateNum(0, 10);
        const [min, max] = generateTwoNumsWithDistance(
            distance,
            minTimestampInSeconds,
            maxTimestampInSeconds
        );

        const r = generateNum(0, 255);
        const g = generateNum(0, 255);
        const b = generateNum(0, 255);

        setRegions([
            ...regions,
            {
                id: `custom-${generateNum(0, 9999)}`,
                start: min,
                end: max,
                color: `rgba(${r}, ${g}, ${b}, 0.5)`
            }
        ]);
    }, [regions, wavesurferRef]);

    const removeLastRegion = useCallback(() => {
        let nextRegions = [...regions];

        nextRegions.pop();

        setRegions(nextRegions);
    }, [regions]);

    const play = useCallback(() => {
        wavesurferRef.current.playPause();
    }, []);

    const handleRegionUpdate = useCallback((region, smth) => {
        console.log("region-update-end --> region:", region);
        console.log(smth);
    }, []);

    return (
        <div className="App">
            <WaveSurfer plugins={plugins} onMount={handleWSMount}>
                <WaveForm id="waveform">
                    {regions.map((regionProps) => (
                        <Region
                            onUpdateEnd={handleRegionUpdate}
                            key={regionProps.id}
                            {...regionProps}
                        />
                    ))}
                </WaveForm>
                <div id="timeline" />
            </WaveSurfer>
            <button onClick={play}>Play / Pause</button>
            <button onClick={generateRegion}>Generate Region</button>
            <button onClick={removeLastRegion}>Remove Last Region</button>
            <button onClick={toggleTimeline}>Toggle Timeline</button>
        </div>
    );
}

export default MyWaveformer;