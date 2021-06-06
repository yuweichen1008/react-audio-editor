import React, { useCallback, useEffect,  useRef, useState,  useMemo } from "react";
import { WaveSurfer, WaveForm, Region } from "wavesurfer-react";
import RegionsPlugin from "wavesurfer.js/dist/plugin/wavesurfer.regions.min";
import TimelinePlugin from "wavesurfer.js/dist/plugin/wavesurfer.timeline.min";
import Annotation from "./Annotation";

function generateNum(min, max) {
    return Math.random() * (max - min + 1) + min;
}

function generateTwoNumsWithDistance(distance, min, max) {
    const num1 = generateNum(min, max);
    const num2 = generateNum(min, max);
    if (num2 - num1 >= 10) {
        return [num1, num2];
    }
    return generateTwoNumsWithDistance(distance, min, max);
}

const MyWaveformer = ({ url }) => {
    const wavesurferRef = useRef();
    const [timelineVis, setTimelineVis] = useState(true);
    const [annotate, setAnnotate] = useState([
        {
            "id" : 1,
            "start": 10,
            "end" : 20,
            "subtitle" : "hello"
        }
    ])

    var currentAnnotate = {
        "Annotate":[
            {
                "id" : -1,
                "start" : 10,
                "end" : 20,
                "subtitle" : "hello"
            }
        ]
    }

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
        }
    ]);

    // use regions ref to pass it inside useCallback
    // so it will use always the most fresh version of regions list
    const regionsRef = useRef(regions);

    useEffect(() => {
        regionsRef.current = regions;
    }, [regions]);

    const editAnnotation = useCallback(
        (region) => {
            wavesurferRef.current.play(region.start, region.end);
        let idx = Object.keys(annotate).length + 1;
        if(region.id > idx){ // add new Annotation section
            let copy = [...annotate];
            console.log("ID " + idx);
            console.log("Start" + region.start);
            console.log("End " + region.end);
            copy = [...copy, {id : idx, start : region.start, end : region.end}]
            setAnnotate(copy);
        }
        },
        [annotate],
    )

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

    const handleWSMount = useCallback(
        (waveSurfer) => {
            wavesurferRef.current = waveSurfer;
            if (wavesurferRef.current) {
                wavesurferRef.current.load(url);

                wavesurferRef.current.on("region-created", regionCreatedHandler);

                wavesurferRef.current.on("ready", () => {
                    console.log("WaveSurfer is ready");
                    wavesurferRef.enableDragSelection({});
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

    useEffect(() => {
        if (wavesurferRef.current) {
            wavesurferRef.current.on("region-click", (region) => {
                console.log("region-click -->", region)
                editAnnotation(region)
            });
        }
    }, [editAnnotation])
    
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
        // update Annotation start end
        console.log(smth);
    }, []);

    return (
        <div>
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
            <form>
                <input type="text">{currentAnnotate.Annotate.id}</input>
                <input type="text">{currentAnnotate.Annotate.start}</input>
                <input type="text">{currentAnnotate.Annotate.end}</input>
                <input type="text">{currentAnnotate.Annotate.subtitle}</input>
            </form>
            <Annotation data={annotate} />
        </div>
    );
}

export default MyWaveformer;