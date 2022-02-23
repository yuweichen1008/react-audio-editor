import React, { useState, useRef, useEffect } from 'react';
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugin/wavesurfer.regions.min.js";
import TimelinePlugin from "wavesurfer.js/dist/plugin/wavesurfer.timeline.min.js";

const Annotate = ({ url }) => {
    const waveformRef = useRef()
    const [play, setPlay] = useState(false)
    const [isDataLoading, setisDataLoading] = useState(false)

    useEffect(() => {
        setisDataLoading(true);
        if (waveformRef.current) {
            const wavesurfer = WaveSurfer.create({
                container: waveformRef.current,
                barWidth: 2,
                barHeight: 1,
                barGap: null,
                mediaControls: false,
                plugins: [
                    RegionsPlugin.create(),
                    TimelinePlugin.create({ container: "#timeline" }),
                ],
            });
            wavesurfer.load(url);
            // this.props.history.listen((location, action) => {
            //     wavesurfer.stop();
            // })
            wavesurfer.on("ready", () => {
                wavesurfer.enableDragSelection({ color: "rgba(0, 102, 255, 0.3)" });
            });
            wavesurfer.on("pause", (r, e) => {
                setPlay(false);
            });
        }
    }, [url])

    return (
        <>
            <div>Annotate</div>
            <div ref={waveformRef}></div>
        </>
    )
}

export default Annotate