/* ══ Shared cursor — dot + ring + analog photo trail ══ */
(function(){
    // Determine path prefix based on page depth
    var depth = (function(){
        var path = window.location.pathname;
        if(path.indexOf('/projects/') !== -1) return '../../';
        if(path.indexOf('/playground/') !== -1 || path.indexOf('/playground') !== -1) return '../';
        return '';
    })();

    var ANALOG_IMGS = [
        depth+'images/analog/img20211113_13274114.jpg',
        depth+'images/analog/img20211113_13274143.jpg',
        depth+'images/analog/img20211113_13274190.jpg',
        depth+'images/analog/img20211113_13274382.jpg',
        depth+'images/analog/ANALOGt41.jpg',
        depth+'images/analog/ANALOGt43.jpg'
    ];

    // Inject CSS
    var style = document.createElement('style');
    style.textContent = [
        '*, *::before, *::after { cursor:none !important; }',
        '#cursor-dot { position:fixed; pointer-events:none; z-index:10000;',
        '  width:7px; height:7px; background:var(--fg, #1A1A1A);',
        '  border-radius:50%; transform:translate(-50%,-50%); transition: width 0.2s, height 0.2s; }',
        '#cursor-ring { position:fixed; pointer-events:none; z-index:9999;',
        '  width:36px; height:36px; border:1.5px solid var(--fg, #1A1A1A);',
        '  border-radius:50%; transform:translate(-50%,-50%); opacity:0.35;',
        '  transition: width 0.25s, height 0.25s, opacity 0.25s; }',
        'body.cursor-hover #cursor-dot { width:10px; height:10px; }',
        'body.cursor-hover #cursor-ring { width:50px; height:50px; opacity:0.5; }',
        '.cursor-trail-img { position:fixed; pointer-events:none; z-index:9998;',
        '  width:48px; height:62px; object-fit:cover; border-radius:2px;',
        '  opacity:0; filter:grayscale(1) contrast(1.05);',
        '  will-change:transform,opacity; transition:opacity 0.5s ease; }'
    ].join('\n');
    document.head.appendChild(style);

    // Inject DOM
    var dot = document.createElement('div'); dot.id = 'cursor-dot';
    var ring = document.createElement('div'); ring.id = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    // Remove old pixel trail canvas if present
    var oldCanvas = document.getElementById('cursor-canvas');
    if(oldCanvas) oldCanvas.remove();

    var mx=0, my=0, ringX=0, ringY=0;
    var TRAIL_N=4, TRAIL_SPACING=80, TRAIL_FADE=1800;
    var distSinceDrop=0, lastTX=0, lastTY=0;

    document.addEventListener('mousemove', function(e){
        mx = e.clientX; my = e.clientY;
        dot.style.left = mx+'px'; dot.style.top = my+'px';

        var dx = mx-lastTX, dy = my-lastTY;
        distSinceDrop += Math.sqrt(dx*dx + dy*dy);
        lastTX = mx; lastTY = my;

        if(distSinceDrop >= TRAIL_SPACING){
            distSinceDrop = 0;
            dropTrail(mx, my);
        }
    });

    function dropTrail(x, y){
        var existing = document.querySelectorAll('.cursor-trail-img');
        if(existing.length >= TRAIL_N) existing[0].remove();
        var img = document.createElement('img');
        img.className = 'cursor-trail-img';
        img.src = ANALOG_IMGS[Math.floor(Math.random()*ANALOG_IMGS.length)];
        var rot = (Math.random()-0.5)*8;
        img.style.left = (x+14)+'px';
        img.style.top = (y+14)+'px';
        img.style.transform = 'rotate('+rot+'deg)';
        img.style.opacity = '0';
        document.body.appendChild(img);
        requestAnimationFrame(function(){
            img.style.transition = 'opacity 0.25s ease';
            img.style.opacity = '0.85';
        });
        setTimeout(function(){
            img.style.transition = 'opacity 1.2s ease';
            img.style.opacity = '0';
            setTimeout(function(){ if(img.parentNode) img.remove(); }, 1300);
        }, TRAIL_FADE);
    }

    // Ring follow with easing
    (function ringFollow(){
        ringX += (mx-ringX)*0.18;
        ringY += (my-ringY)*0.18;
        ring.style.left = ringX+'px';
        ring.style.top = ringY+'px';
        requestAnimationFrame(ringFollow);
    })();

    // Hover states for interactive elements
    document.addEventListener('mouseover', function(e){
        if(e.target.closest('a,button,.pg-tile,.project-item,.sidebar-item'))
            document.body.classList.add('cursor-hover');
    });
    document.addEventListener('mouseout', function(e){
        if(e.target.closest('a,button,.pg-tile,.project-item,.sidebar-item'))
            document.body.classList.remove('cursor-hover');
    });
})();
