const LOOP_BEFORE_END = 1;
const LOOP_POOL_INTERVAL = 500;

(function loadYouTubeAPI() {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";

    document.head.appendChild(tag);
})();
function initYouTubeLoop(playerId) {
    window._ytLoopQueue = window._ytLoopQueue || [];
    window._ytLoopQueue.push(playerId);
}
function onYouTubeIframeAPIReady() {
    const queue = window._ytLoopQueue || [];
    queue.forEach(createLoopPlayer);
}
function createLoopPlayer(playerId) {
    let watchHandle = null;
    const player = new YT.Player(playerId, {
        events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange
        }
    });
    function onPlayerReady() {
        watchHandle = setInterval(checkLoop, LOOP_POOL_INTERVAL);
    }
    function checkLoop() {
        if (!player || typeof player.getCurrentTime !== 'function') return;
        const current = player.getCurrentTime();
        const duration = player.getDuration();

        if (duration === 0) return;

        if (current >= duration - LOOP_BEFORE_END) {
            player.seekTo(0, true);
        }
    }
}