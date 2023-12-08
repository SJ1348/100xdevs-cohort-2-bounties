import React, { useEffect, useRef } from "react";
import videojs from "video.js";
import "videojs-contrib-eme";
import "video.js/dist/video-js.css";
import "videojs-sprite-thumbnails";

// Shape {startTime: number (sec), endTime: number (sec), name: string}
interface Segment {
  start: number;
  end: number;
  text: string;
}

const segments: Segment[] = [
  {
    start: 0,
    end: 6,
    text: "Segment-1",
  },
  {
    start: 6,
    end: 15,
    text: "Segment-2",
  },
  {
    start: 15,
    end: 30,
    text: "Segment-3",
  },
  {
    start: 30,
    end: 36,
    text: "Segment-4",
  },
  {
    start: 36,
    end: 46,
    text: "Segment-5",
  },
];

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");
  return `${formattedMinutes}:${formattedSeconds}`;
}

const scrollToSegment = (time: number, player: any) => {
  player.currentTime(time);
};

const showSegmentsInView = (
  player: any,
  segmentsContainer: HTMLElement | null
) => {
  if (!segmentsContainer) return;

  for (const segment of segments) {
    const div = document.createElement("div");
    const heading = document.createElement("p");
    const p = document.createElement("p");

    p.innerText = `${formatTime(segment.start)} - ${formatTime(segment.end)}`;
    heading.innerText = `${segment.text}`;
    div.classList.add("segment");
    div.append(heading, p);

    div.addEventListener("click", () => scrollToSegment(segment.start, player));
    segmentsContainer.appendChild(div);
  }
};

const CustomVideoPlayerTS: React.FC = () => {
  const videoRef = useRef<any | null>(null);
  const playerRef = useRef<any | null>(null);

  useEffect(() => {
    const initPlayer = (player: any) => {
      player.eme();
      player.src({
        // src: "https://cdn.bitmovin.com/content/assets/art-of-motion_drm/mpds/11331.mpd",
        // type: "application/dash+xml",
        src: "//vjs.zencdn.net/v/oceans.mp4",
        type: "video/mp4",
        keySystems: {
          "com.widevine.alpha": "https://cwip-shaka-proxy.appspot.com/no_auth",
        },
      });
      player.spriteThumbnails({
        url: "https://raw.githubusercontent.com/GiriAakula/samuel-miller-task/master/openvideo.png",
        width: 160,
        height: 90,
      });
    };

    const options = {
      controls: true,
      fluid: true,
      html5: {
        vhs: {
          overrideNative: true,
        },
      },
    };

    if (!playerRef.current) {
      // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
      const videoElement = document.createElement("video-js");
      videoElement.classList.add("vjs-big-play-centered");
      videoRef.current.appendChild(videoElement);
      const player: any = (playerRef.current = videojs(
        videoElement,
        options,
        () => {
          initPlayer(playerRef.current);
        }
      ));
      //for chapters
      const segmentsContainer = document.getElementById("segments");
      showSegmentsInView(player, segmentsContainer);

      //for segments on seekbar
      const addSectionToSeekBar = (section: Segment) => {
        var seekBar = player.controlBar.progressControl.seekBar.el();
        const timeTooltip: any = player
          .getChild("controlBar")
          .getChild("progressControl")
          .getChild("seekBar")
          .getChild("mouseTimeDisplay")
          .getChild("timeTooltip");
        var sectionMarker = document.createElement("div");
        sectionMarker.className = "vjs-seek-button-marker";
        sectionMarker.style.left = `${
          (section.start / player.duration()) * 100
        }%`;
        sectionMarker.style.width = `${
          ((section.end - section.start) / player.duration()) * 100
        }%`;

        var textElement = document.createElement("div");
        textElement.className = "vjs-seek-button-section-text";
        textElement.textContent = section.text;
        sectionMarker.appendChild(textElement);
        seekBar.appendChild(sectionMarker);
        timeTooltip.update = function (seekBarRect, seekBarPoint, time) {
          this.write(`${time}`);
        };
      };
      player.on("loadedmetadata", function () {
        segments.forEach((section) => {
          addSectionToSeekBar(section);
        });
      });
    }
  }, [videoRef]);

  return (
    <>
      <style>
        {`
        .vjs-time-tooltip {
            display: flex;
            direction: column;
          }
          * {
            padding: 0;
            margin: 0;
            box-sizing: border-box;
          }
          .segment {
            padding: 8px 16px;
            cursor: pointer;
          }
          .vjs-time-tooltip {
            word-break: keep-all;
            white-space: nowrap;
          }
          .vjs-progress-segments {
            height: 100%;
            width: 100%;
            position: absolute;
            z-index: 10;
          }
          .vjs-progress-segment {
            border-right: 1px solid;
            border-left: 1px solid;
            position: absolute;
            z-index: 10;
            height: 100%;
            top: 0;
            transition: all 0.2s;
          }
          .vjs-progress-segment:hover {
            height: 300% !important;
            top: -100%;
            background-color: rgb(250, 250, 250, 0.4);
          }
          .button-section {
            padding: 10px;
            margin: 5px;
            border: 1px solid #ccc;
            background-color: #fff;
            cursor: pointer;
          }
          .button-section:hover {
            background-color: #E6E6FF;
          }
          .vjs-progress-holder.vjs-slider.vjs-slider-horizontal {
            height: 10px;
            z-index: 2;
          }
          .video-js .vjs-progress-control:hover .vjs-mouse-display {
            display: block;
          }
          .vjs-seek-button-marker {
            position: absolute;
            height: 10px;
            top: 0;
            bottom: 0;
            left: 0;
            background-color: transparant;
            border-left: solid rgba(0, 0, 0, 0.322);
            z-index: 0;
            cursor: pointer;
            transition: background-color 0.3s;
          }
          .vjs-seek-button-marker:hover {
            background-color: #E6E6FF;
          }
          .vjs-seek-button-marker .vjs-seek-button-section-text {
            position: absolute;
            width: max-content;
            padding: 4px;
            border-radius: 10%;
            top: 30px;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: black;
            color: #fff;
            font-size: 11px;
            opacity: 0;
            transition: opacity 0.3s;
          }
          .vjs-seek-button-marker:hover .vjs-seek-button-section-text {
            opacity: 1;
          }
        `}
      </style>
      <div data-vjs-player>
        <div ref={videoRef} />
        <div id="segments"></div>
      </div>
    </>
  );
};

export default CustomVideoPlayerTS;
