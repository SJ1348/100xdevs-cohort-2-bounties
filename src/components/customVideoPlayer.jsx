import React, { useEffect, useRef } from "react";
import videojs from "video.js";
import "videojs-contrib-eme";
import "video.js/dist/video-js.css";

// shape {startTime:number (sec), endTime:number (sec), name:string}
const segments = [
  {
    startTime: 0,
    endTime: 50,
    name: "Segment-1",
  },
  {
    startTime: 50,
    endTime: 120,
    name: "Segment-2",
  },
  {
    startTime: 120,
    endTime: 150,
    name: "Segment-3",
  },
  {
    startTime: 150,
    endTime: 170,
    name: "Segment-4",
  },
  {
    startTime: 170,
    endTime: 210,
    name: "Segment-5",
  },
];

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

//  on clicking on the segment scroll to the start of that segment
const scrollToSegment = (time, player) => {
  player.currentTime(time);
};

// render segments and their time stamps in view
const showSegmentsInView = (player, segmentsContainer) => {
  for (const segment of segments) {
    const div = document.createElement("div");
    const heading = document.createElement("p");
    const p = document.createElement("p");

    p.innerText = `${formatTime(segment.startTime)} - ${formatTime(
      segment.endTime
    )}`;
    heading.innerText = `${segment.name}`;

    div.classList.add("segment");
    div.append(heading, p);

    //   <div class="segmaent">
    //     <p>Segment-1</p>
    //     <p>0:0 - 0:50</p>
    //   </div>;

    // click handler

    div.addEventListener("click", () =>
      scrollToSegment(segment.startTime, player)
    );

    segmentsContainer.appendChild(div);
  }
};

// handle player ready
const handlePlayerReady = (player, segmentsConatiner) => {
  showSegmentsInView(player, segmentsConatiner);
};

// get current segment name
// const getCurrentSegmentName = (currentTime) => {
//   let data = "";
//   for (const segment of segments) {
//     if (segment.startTime <= currentTime && currentTime <= segment.endTime) {
//       data = segment.name;
//       break;
//     }
//   }
//   return data;
// };

const CustomVideoPlayer = () => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  const initPlayer = (player) => {
    player.eme();
    player.src({
      src: "https://cdn.bitmovin.com/content/assets/art-of-motion_drm/mpds/11331.mpd",
      type: "application/dash+xml",
      keySystems: {
        "com.widevine.alpha": "https://cwip-shaka-proxy.appspot.com/no_auth",
      },
    });
    // player.spriteThumbnails({
    //   url: "https://raw.githubusercontent.com/GiriAakula/samuel-miller-task/master/openvideo.png",
    //   width: 160,
    //   height: 90,
    // });
  };
  useEffect(() => {
    const TimeToolTipComponent = videojs.getComponent("TimeTooltip");
    const SeekBarComponent = videojs.getComponent("SeekBar");
    // creating custom component for segments
    class TimeToolTip extends TimeToolTipComponent {
      constructor(player, options = {}) {
        super(player, options);
      }

      updateTime(seekBarRect, seekBarPoint, time, cb) {
        this.requestNamedAnimationFrame("TimeTooltip#updateTime", () => {
          let content;
          const duration = this.player_.duration();

          if (this.player_.liveTracker && this.player_.liveTracker.isLive()) {
            const liveWindow = this.player_.liveTracker.liveWindow();
            const secondsBehind = liveWindow - seekBarPoint * liveWindow;

            content =
              (secondsBehind < 1 ? "" : "-") +
              formatTime(secondsBehind, liveWindow);
          } else {
            content = formatTime(time, duration);
          }

          this.update(seekBarRect, seekBarPoint, `${content}}`);
          if (cb) {
            cb();
          }
        });
      }
    }

    class SeekBar extends SeekBarComponent {
      constructor(player, options = {}) {
        super(player, options);
      }
      createEl() {
        const seekbar = super.createEl(
          "div",
          {
            className: "vjs-progress-holder",
          },
          {
            "aria-label": this.localize("Progress Bar"),
          }
        );

        const segmentsContainer = videojs.dom.createEl("div", {
          className: "vjs-progress-segments",
        });

        let left = 0;
        for (let i = 0; i < segments.length; i++) {
          const width = Number(
            Number(
              ((segments[i].endTime - segments[i].startTime) /
                segments[segments.length - 1].endTime) *
                100
            ).toFixed(2)
          );
          const segment = videojs.dom.createEl("div", {
            className: `vjs-progress-segment vjs-progress-segment-${i + 1}`,
            style: `width: ${width}%; left: ${left}%;`,
          });
          segmentsContainer.appendChild(segment);
          left += width;
        }

        seekbar.appendChild(segmentsContainer);

        return seekbar;
      }
    }

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
      // registering components
      videojs.registerComponent("TimeTooltip", TimeToolTip);
      videojs.registerComponent("SeekBar", SeekBar);

      const player = (playerRef.current = videojs(videoElement, options, () => {
        initPlayer(playerRef.current);
      }));

      const segmentsContainer = document.getElementById("segments");
      handlePlayerReady(player, segmentsContainer);
    }
  }, [videoRef]);

  return (
    <div data-vjs-player>
      <div ref={videoRef} />
      <div id="segments"></div>
    </div>
  );
};

export default CustomVideoPlayer;
