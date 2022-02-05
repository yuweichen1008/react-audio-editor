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
    // const [annotate, setAnnotate] = useState<import('./Annotation').IAnnotate> ();
    const [zoomLevel, setZoomLevel] = useState(5);

    const [regions, setRegions] = useState([]);
    const [currentRegionID, setCurrentRegionID] = useState(0)
    const regionsRef = useRef(regions);
    // for edit region
    const [regionStart, setRegionStart] = useState(0)
    const [regionEnd, setRegionEnd] = useState(0)
    const [regionSubtitle, setRegionSubtitle] = useState("")

    useEffect(() => {
        console.log("Try to get file")
        
        console.log("End of trying")
    }, [url])
    // load url's default annotation file
    // useEffect(() => {
    //     if (url === "") return;
    //     const getData = (url) => {
            // let filelocation = 'data/' + url.substring(url.lastIndexOf('/')+1).split('.').slice(0,-1) + '.json';
            // let filelocation = '../data/video1.json'
            // console.log(filelocation);
            // fetch(filelocation)
            // .then(response => {
            //     const contentType = response.headers.get("content-type");
            //     if (contentType && contentType.indexOf("application/json") !== -1) {
            //         return response.json().then(data => {
            //           // process your JSON data further
            //           console.log("JSON " + data)
            //         });
            //       } else {
            //         return response.text().then(text => {
            //           // this is text, do something with it
            //           console.log("Text" + text)
            //         });
            //       }
            // })
            // .then(response => {
            //     response.json()
            // }).then(
            //     data => console.log(data)
            // )
    //         fetch('../data/video1.json'
    //             , {
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                     'Accept': 'application/json'
    //                 }
    //             }
    //         )
    //             .then(function (response) {
    //                 console.log(response)
    //                 return response.json();
    //             })
    //             .then(function (myJson) {
    //                 console.log(myJson);
    //             });
    //     }
    //     getData(url)
    // }, [url])

    useEffect(() => {
        regionsRef.current = regions;
    }, [regions])

    // useEffect(() => {
    //     annotateRef.current = annotate;
    // }, [annotate])

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

            // setAnnotate({
            //     id: 0,
            //     start: 0,
            //     end: 0,
            //     sbutitle: ""
            // })
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

    const handleSliderChange = (event) => {
        setZoomLevel(event.target.value);
        wavesurferRef.current.zoom(zoomLevel);
        // console.log("zoom level change to " + zoomLevel);
    }

    return (
        <div className="px-16">
            <WaveSurfer plugins={plugins} onMount={handleWSMount}>
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

                <div id="zoom-slider" className="flex justify-items-center">
                    <input id="slider"
                        type="range"
                        min="5"
                        max="100"
                        step="1"
                        value={zoomLevel}
                        className="w-full mx-32 mt-3"
                        onChange={handleSliderChange}
                        ref={sliderRef} />
                </div>
            </WaveSurfer>
            <div className="grid grid-cols-3">
                <button className="bg-green-200" onClick={play}>Play / Pause</button>
                {/* <button onClick={generateRegion}>Generate Region</button> */}
                <button className="bg-red-200" onClick={removeLastRegion}>Remove Last Region</button>
                <button className="bg-gray-200" onClick={toggleTimeline}>Toggle Timeline</button>
            </div>

            <form className="flex justify-around max-w-lg min-w-full mt-4 ml-3">
                <div className="w-32">

                    <div>
                        <label>Begin</label>
                        <input value={regionStart}
                            onChange={e => setRegionStart(e.target.value)}></input>
                    </div>
                    <div>
                        <label>End</label>
                        <input value={regionEnd}
                            onChange={e => setRegionEnd(e.target.value)}></input>
                    </div>
                </div>
                <div className="w-32">
                    <label>Note</label>
                    <input value={regionSubtitle}
                        onChange={e => setRegionSubtitle(e.target.value)}></input>
                </div>
                <div className="w-72">
                    <button className="px-6 py-2 mt-2 border-2 border-gray-400 rounded-full hover:bg-red-500" onClick={updateAnnotation}>Update Annotation</button>
                    <button className="px-6 py-2 mt-1 border-2 border-gray-400 rounded-full hover:bg-red-500" onClick={deleteAnnotation}>Delete Annotation</button>
                    <button className="px-6 py-2 mt-1 border-2 border-gray-400 rounded-full hover:bg-red-500" onClick={removeLastRegion}>Remove Last Created Region</button>
                </div>
            </form>

            {/* <Annotation data={annotate} /> */}
        </div>
    );
}

export default MyWaveformer;