import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { WaveSurfer, WaveForm } from "wavesurfer-react";
// import { Region } from "wavesurfer-react";
import RegionsPlugin from "wavesurfer.js/dist/plugin/wavesurfer.regions.min";
import TimelinePlugin from "wavesurfer.js/dist/plugin/wavesurfer.timeline.min";
import Annotation from "./Annotation";

function generateNum(min, max) {
    return Math.random() * (max - min + 1) + min;
}

function generateTwoNumsWithDistance(distance, min, max) {
    // TODO find last created region and add rand to min
    const num1 = generateNum(min, max);
    const num2 = generateNum(min, max);
    if (num2 - num1 >= 10) {
        return [num1, num2];
    }
    return generateTwoNumsWithDistance(distance, min, max);
}

const MyWaveformer = ({ url }) => {
    const wavesurferRef = useRef();
    const [isEdit, setisEdit] = useState(false);
    const [timelineVis, setTimelineVis] = useState(true);
    const [annotate, setAnnotate] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    // const [regions, setRegions] = useState(null);
    const [regions, setRegions] = useState();
    const [regionStart, setRegionStart] = useState(0)
    const [regionEnd, setRegionEnd] = useState(0)
    const [regionSubtitle, setRegionSubtitle] = useState("")

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

    const regionsRef = useRef(regions);

    useEffect(() => {
        regionsRef.current = regions;
    }, [regions]);

    const setCurrentAnnotate = useCallback(({ start, end, sub }) => {
        setRegionStart(start);
        setRegionEnd(end);
        setRegionSubtitle(sub);
    }, []);
    const editAnnotation = useCallback(

        (region) => {

            // function declare
            // const setCurrentAnnotate = ({ start, end, sub }) => {
            //     setRegionStart(start);
            //     setRegionEnd(end);
            //     setRegionSubtitle(sub);
            // };

            let idx = -1;
            let len = 0;
            if (annotate) {
                len = Object.keys(annotate).length;
                idx = len + 1;
            }
            region.start = Math.round(region.start);
            region.end = Math.round(region.end);
            console.log("ID " + region.id);
            console.log("Start" + region.start);
            console.log("End " + region.end);
            if (annotate) {
                setAnnotate((preAnnot) => [...preAnnot, { id: idx, start: region.start, end: region.end, subtitle: "default" }]);
                console.log("Annotate object length: " + Object.keys(annotate).length);
            } else {
                setAnnotate([{ id: 1, start: region.start, end: region.end, subtitle: "default" }]);
            }
            // update current
            setCurrentAnnotate({ start: region.start, end: region.end, subtitle: "default" });
            setisEdit(true);
        },
        [annotate, setCurrentAnnotate],
    )

    const regionCreatedHandler = useCallback(
        (region) => {
            console.log("region-created --> region:", region);

            if (region.data.systemRegionId) return;
            if(regions){
                setRegions((preRegion) => [...preRegion, { ...region.data, systemRegionId: -1 }]);
            }else{
                setRegions({ ...region.data, systemRegionId: -1 });
            }
        },
        [regions]
    );

    useEffect(() => {
        if (wavesurferRef.current) {
            wavesurferRef.current.on("region-click", (region) => {
                console.log("region-click -->", region);
                editAnnotation(region);
                setCurrentAnnotate({ start: region.start, end: region.end, subtitle: "default" })
            });
        }
    }, [editAnnotation, setCurrentAnnotate])

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
        if (isEdit) {
            region.start = Math.round(region.start);
            region.end = Math.round(region.end);
            editAnnotation(region)
        }
    }, [isEdit, editAnnotation]);

    const updateAnnotation = (event) => {
        console.log(event);
        event.preventDefault();
    }

    const deleteAnnotation = (event) => {
        console.log(event);
        event.preventDefault();
    }

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

                var slider = document.querySelector('#slider');

                slider.oninput = function () {
                    var zL = Number(slider.value);
                    setZoomLevel(zL);
                    console.log("zoom level change to " + zL);
                };
                wavesurferRef.current.on("region-removed", (region) => {
                    console.log("region-removed --> ", region);
                });

                wavesurferRef.current.on("loading", (data) => {
                    console.log("loading --> ", data);
                });

                wavesurferRef.current.on("region-update-end", (region, smth) => {
                    setisEdit(true)
                    handleRegionUpdate(region, smth);
                })

                if (window) {
                    window.surferidze = wavesurferRef.current;
                }
            }
        },
        [url, regionCreatedHandler, handleRegionUpdate]
    );

    return (
        <div>
            <WaveSurfer plugins={plugins} onMount={handleWSMount} zoomLevel={zoomLevel}>
                <WaveForm id="waveform">
                    {/* {regions.map((regionProps) => (
                        <Region
                            onUpdateEnd={handleRegionUpdate}
                            key={regionProps.id}
                            {...regionProps}
                        />
                    ))} */}
                </WaveForm>
                <div id="timeline" />
            </WaveSurfer>
            <div className="grid grid-cols-4 bg-red-500">
                <button onClick={play}>Play / Pause</button>
                <button onClick={generateRegion}>Generate Region</button>
                <button onClick={removeLastRegion}>Remove Last Region</button>
                <button onClick={toggleTimeline}>Toggle Timeline</button>
            </div>
            {isEdit &&
                <form className="flex flex-col max-w-lg mt-4 ml-3 justify-items-center">
                    <div>
                        <label>Start time</label>
                        <input value={regionStart}
                            onChange={e => setRegionStart(e.target.value)}></input>
                    </div>
                    <div>
                        <label>End time</label>
                        <input value={regionEnd}
                            onChange={e => setRegionEnd(e.target.value)}></input>
                    </div>
                    <div>
                        <label>Subtitle</label>
                        <input value={regionSubtitle}
                            onChange={e => setRegionSubtitle(e.target.value)}></input>
                    </div>

                    <button onClick={updateAnnotation}>Update Annotation</button>
                    <button onClick={deleteAnnotation}>Delete Annotation</button>
                </form>
            }
            <div id="zoom-slider">
                <input id="slider" type="range" min="1" max="200" value="1" className="w-full" />
            </div>
            <Annotation data={annotate} />
        </div>
    );
}

export default MyWaveformer;