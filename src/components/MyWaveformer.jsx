import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { WaveSurfer, WaveForm } from "wavesurfer-react";
// import { Region } from "wavesurfer-react";
import RegionsPlugin from "wavesurfer.js/dist/plugin/wavesurfer.regions.min";
import TimelinePlugin from "wavesurfer.js/dist/plugin/wavesurfer.timeline.min";
import Annotation from "./Annotation";

const MyWaveformer = ({ url }) => {
    const wavesurferRef = useRef();
    const sliderRef = useRef();
    const annotateRef = useRef();
    // const [isEdit, setisEdit] = useState(false);
    const [timelineVis, setTimelineVis] = useState(true);
    const [annotate, setAnnotate] = useState([]);
    const [zoomLevel, setZoomLevel] = useState(1);

    const [regions, setRegions] = useState([]);
    const [currentRegionID, setCurrentRegionID] = useState(0)
    const regionsRef = useRef(regions);
    // for edit region
    const [regionStart, setRegionStart] = useState(0)
    const [regionEnd, setRegionEnd] = useState(0)
    const [regionSubtitle, setRegionSubtitle] = useState("")

    // zoom

    useEffect(() => {
        regionsRef.current = regions;
    }, [regions])

    useEffect(() => {
        annotateRef.current = annotate;
    }, [annotate])

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

    useEffect(() => {
        console.log(currentRegionID + "into edit")

    }, [currentRegionID])

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

    const createAnnotate = (data) => {
        console.log("createAnnotate: id" + data.id)
        console.log("createAnnotate: start" + data.start)
        console.log("createAnnotate: end" + data.end)
    }

    const setCurrentAnnotate = ({ start, end, sub }) => {
        setRegionStart(start);
        setRegionEnd(end);
        setRegionSubtitle(sub);
    };

    const removeLastRegion = useCallback(() => {
        let nextRegions = [...regions];

        nextRegions.pop();

        setRegions(nextRegions);
    }, [regions]);

    const play = useCallback(() => {
        wavesurferRef.current.playPause();
    }, []);

    const updateAnnotation = (event) => {
        console.log(event);
        console.log(regions)
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

                wavesurferRef.current.on("ready", () => {
                    console.log("WaveSurfer is ready");
                    wavesurferRef.enableDragSelection({});
                });

                wavesurferRef.current.on("region-created", regionCreatedHandler);

                wavesurferRef.current.on("region-removed", (region) => {
                    console.log("region-removed --> ", region);
                });

                wavesurferRef.current.on("loading", (data) => {
                    console.log("loading --> ", data);
                });

                wavesurferRef.current.on("region-update-end", (region, smth) => {
                    console.log("region-update-end --> ", region);
                    // setisEdit(true)
                    // handleRegionUpdate(region, smth);
                    region.start = Math.round(region.start);
                    region.end = Math.round(region.end);
                })

                wavesurferRef.current.on("region-click", (region) => {
                    console.log("region-click -->", region);
                    setCurrentRegionID(region.id);
                });
                
                if (window) {
                    window.surferidze = wavesurferRef.current;
                }
            }
        },
        [url, regionCreatedHandler]
    );

    const handleSliderMount = useCallback(
        (sliderbar) => {
            sliderRef.current = sliderbar;
        }, [])

    const handleSliderChange = (event) => {
        setZoomLevel(event.target.value);
        wavesurferRef.current.zoom(zoomLevel);
        // console.log("zoom level change to " + zoomLevel);
    }

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
                <div id="zoom-slider">
                    <input id="slider"
                        type="range"
                        min="1"
                        max="200"
                        step="1"
                        value={zoomLevel}
                        className="w-50"
                        onChange={handleSliderChange}
                        onMount={handleSliderMount} />
                </div>
            </WaveSurfer>
            <div className="grid grid-cols-3 bg-red-300">
                <button onClick={play}>Play / Pause</button>
                {/* <button onClick={generateRegion}>Generate Region</button> */}
                <button onClick={removeLastRegion}>Remove Last Region</button>
                <button onClick={toggleTimeline}>Toggle Timeline</button>
            </div>

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
                <button onClick={removeLastRegion}>Remove Last Created Region</button>
            </form>

            <Annotation data={annotate} />
        </div>
    );
}

export default MyWaveformer;