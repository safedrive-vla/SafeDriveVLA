function switchVideo(prefix, videoContainerId, preview_id) {
    // Reference to all video containers
    var video1Container = document.getElementById(prefix + 'video1Container');
    var video2Container = document.getElementById(prefix + 'video2Container');

    // Hide all video containers first
    video1Container.style.display = 'none';
    video2Container.style.display = 'none';

    // Stop and reset videos
    var videos = video1Container.getElementsByTagName('video');
    for (var i = 0; i < videos.length; i++) {
        videos[i].pause();
    }

    videos = video2Container.getElementsByTagName('video');
    for (var i = 0; i < videos.length; i++) {
        videos[i].pause();
    }

    // Show the selected video container
    var selectedVideoContainer = document.getElementById(prefix + videoContainerId);
    selectedVideoContainer.style.display = 'block';

    // Update preview images
    var videoPreview1 = document.getElementById(prefix + 'video1Preview');
    var videoPreview2 = document.getElementById(prefix + 'video2Preview');

    videoPreview1.className = videoPreview1.className.replace(" preview-video-active", "");
    videoPreview2.className = videoPreview2.className.replace(" preview-video-active", "");

    document.getElementById(prefix + preview_id).className += " preview-video-active";
}


function isElementInViewport(el) {
    var rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function isElementInViewport(el) {
    var rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function checkVideoVisibility() {
    var videos = document.querySelectorAll('.auto-video');
    videos.forEach(function(video) {
        // Check if the video is in the viewport
        if (isElementInViewport(video)) {
            if (video.paused) {
                video.currentTime = 0; // Reset to start
                video.play();
            }
        } else {
            video.pause();
        }
    });
}

window.addEventListener('scroll', checkVideoVisibility);

document.addEventListener("DOMContentLoaded", function() {
    // Get all video elements with class 'video-music'
    var videos = document.querySelectorAll('.video-music');

    // Loop through each video and set the volume
    videos.forEach(function(video) {
        video.volume = 0.25; // 25% volume
    });
});


// CARLA-F comparison player — draggable split (SimLingo vs SafeDriveVLA) + thumbnail scene selection.
// Scoped to .sdv-compare-player so placeholder thumbnails in other axes are untouched.
document.addEventListener("DOMContentLoaded", function() {

    function pointerX(e) {
        return (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
    }

    function initSplitDrag(split) {
        var dragging = false;
        function setSplit(clientX) {
            var rect = split.getBoundingClientRect();
            var pct = ((clientX - rect.left) / rect.width) * 100;
            pct = Math.max(0, Math.min(100, pct));
            split.style.setProperty('--split', pct + '%');
        }
        function down(e) { dragging = true; setSplit(pointerX(e)); e.preventDefault(); }
        function move(e) { if (dragging) { setSplit(pointerX(e)); } }
        function up() { dragging = false; }
        split.addEventListener('mousedown', down);
        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', up);
        split.addEventListener('touchstart', down, { passive: false });
        window.addEventListener('touchmove', move, { passive: false });
        window.addEventListener('touchend', up);
    }

    function loadVideo(v, src) {
        if (v && src) {
            v.setAttribute('src', src);
            v.load();
            var p = v.play();
            if (p && p.catch) { p.catch(function() {}); }
        }
    }

    document.querySelectorAll('.sdv-compare-player').forEach(function(player) {
        var split = player.querySelector('[data-compare]');
        var baseline = player.querySelector('.sdv-cmp-baseline');
        var method = player.querySelector('.sdv-cmp-method');
        var capInstruction = player.querySelector('.sdv-cap-instruction');
        var thumbs = player.querySelectorAll('.thumb');

        if (split) { initSplitDrag(split); }

        thumbs.forEach(function(btn) {
            btn.addEventListener('click', function() {
                loadVideo(baseline, btn.dataset.baseline);
                loadVideo(method, btn.dataset.method);
                if (capInstruction && btn.dataset.instruction) {
                    capInstruction.textContent = btn.dataset.instruction;
                }
                if (split) { split.style.setProperty('--split', '50%'); }
                thumbs.forEach(function(t) {
                    t.classList.remove('is-active');
                    t.setAttribute('aria-selected', 'false');
                });
                btn.classList.add('is-active');
                btn.setAttribute('aria-selected', 'true');
            });
        });
    });
});


