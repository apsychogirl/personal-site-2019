// logo animation
(function() {
  let logo = document.querySelector('.logo');
  if (!logo) {
    return;
  }

  gsap.set('.path', {
    drawSVG: '0% 0%'
  });
  gsap.set('.dot-group', {
    yPercent: 100
  });

  CustomBounce.create('myBounce', {strength: 0.6, squash: 2});

  const logoTl = gsap.timeline({delay: 8});

  logoTl
    .addLabel('i', 4.5)
    .set('.logo', {autoAlpha: 1})
    .timeScale(1.2)
    .staggerTo('.cPath', 0.5, {drawSVG: '100%', ease: Linear.easeNone}, 0.2, 1.5)
    .staggerTo('.a1Path', 0.25, {drawSVG: '100%', ease: Linear.easeNone}, 0.2, '-=0.35')
    .staggerTo('.a2Path', 0.25, {drawSVG: '100%', ease: Linear.easeNone}, 0.1, '-=0.04')
    .staggerTo('.s1Path', 0.4, {drawSVG: '100%', ease: Linear.easeNone}, 0.1, '-=0.02')
    .staggerTo('.s2Path', 0.3, {drawSVG: '100%', ease: Linear.easeNone}, 0.07, '-=0.1')
    .staggerTo('.s3Path', 0.4, {drawSVG: '100%', ease: Linear.easeNone}, 0.1, '-=0.4')
    .staggerTo('.s4Path', 0.2, {drawSVG: '100%', ease: Linear.easeNone}, 0.07, '-=0.1')
    .from('#dot', 0.01, {autoAlpha: 0}, '-=0.03')
    .to('#dot', 0.4, {yPercent: -300, ease: Power4.easeOut}, '-=0.01')
    .to('.dot-group', 0.4, {scale: 1.4, ease: Power4.easeOut}, '-=0.4')
    .to('#dot', 0.9, {yPercent: -150, ease: 'myBounce'})
    .to('#dot', 0.9, {
      scaleY: 0.6,
      scaleX: 1.2,
      ease: 'myBounce-squash',
      transformOrigin: 'bottom',
      delay: -0.9
    })
    .staggerTo('.iPath', 0.5, {drawSVG: '100%', ease: Linear.easeNone}, 0.05, 'i')
    .staggerTo('.ePath', 0.5, {drawSVG: '100%', ease: Linear.easeNone}, 0.05, '-=0.3')
    .to('#strokes', 0.2, {
      opacity: 0
    });
})();

// night mode toggle
(function() {
  let light = document.querySelector('#light');
  let toggle = document.querySelector('.js-night-toggle');
  let checkbox = document.querySelector('.js-night-checkbox');

  if (window.localStorage.darkMode === 'true') {
    document.documentElement.classList.add('night');
    checkbox.checked = true;
    localStorage.setItem('darkMode', checkbox.checked);
  }

  if (!toggle) {
    return;
  }

  if (light) {
    light.addEventListener('mouseup', e => {
      document.documentElement.classList.toggle('night');
      checkbox.checked = checkbox.checked ? false : true;

      localStorage.setItem('darkMode', checkbox.checked);
    });
  }

  toggle.addEventListener('mouseup', e => {
    document.documentElement.classList.toggle('night');
    localStorage.setItem('darkMode', checkbox.checked ? false : true);
  });
})();

// me
(function() {
  let me = document.querySelector('#me');
  if (!me) {
    return;
  }

  gsap.registerPlugin(CustomEase, CustomWiggle);

  // animation - paused as default
  const meTl = gsap.timeline({
    onComplete: addMouseEvent,
    paused: true
  });

  gsap.set('#bg', {transformOrigin: '50% 50%'});
  gsap.set('#ear-right', {transformOrigin: '0% 50%'});
  gsap.set('#ear-left', {transformOrigin: '100% 50%'});
  gsap.set('#me', {opacity: 1});

  meTl
    .from('#me', {duration: 1, yPercent: 100, ease: Elastic.easeOut.config(0.5, 0.4)})
    .from(
      ['#head', '.hair', '.shadow'],
      {duration: 0.9, yPercent: 20, ease: Elastic.easeOut.config(0.58, 0.25)},
      0.1
    )
    .from(
      '#ear-right',
      {duration: 1, rotate: 40, yPercent: 10, ease: Elastic.easeOut.config(0.5, 0.2)},
      0.2
    )
    .from(
      '#ear-left',
      {duration: 1, rotate: -40, yPercent: 10, ease: Elastic.easeOut.config(0.5, 0.2)},
      0.2
    )
    .to(
      '#glasses',
      {
        duration: 1,
        keyframes: [{yPercent: -10}, {yPercent: -0}],
        ease: Elastic.easeOut.config(0.5, 0.2)
      },
      0.25
    )
    .from(
      ['#eyebrow-right', '#eyebrow-left'],
      {duration: 1, yPercent: 300, ease: Elastic.easeOut.config(0.5, 0.2)},
      0.2
    )
    .to(['#eye-right', '#eye-left'], {duration: 0.01, opacity: 1}, 0.35)
    .to(['#eye-right-2', '#eye-left-2'], {duration: 0.01, opacity: 0}, 0.35);
  // end animation

  // check for intersection
  // Had to observe the last card because the contact section is sticky so always in VRFieldOfView. bummer
  let mainContent = document.querySelector('.js-last-card');
  let hasBeenInView = false;
  let night = document.querySelector('.night');

  let observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        const isScrollingDown = entry.boundingClientRect.y < entry.rootBounds.y;

        if (entry.intersectionRatio != 0) {
          hasBeenInView = true;
        } else if (hasBeenInView && isScrollingDown) {
          meTl.play();
        } else {
          // rewind and pause animations
          meTl.progress(0).pause();
          blink.progress(0).pause();

          // and remove event listener for mouse
          document.removeEventListener('mousemove', updateScreenCoords);

          //remove the gsap listener controlling animation
          gsap.ticker.remove(animateFace);
        }
      });
    },
    {
      threshold: 0
    }
  );
  observer.observe(mainContent);

  // mouse coords

  let xPosition;
  let yPosition;

  let xPercent;
  let yPercent;

  let height;
  let width;

  function percentage(partialValue, totalValue) {
    return ((100 * partialValue) / totalValue).toFixed(2) * 1;
  }

  function updateWindowSize() {
    height = window.innerHeight;
    width = window.innerWidth;
  }
  updateWindowSize();

  let dizzyIsPlaying;

  function updateScreenCoords(event) {
    if (event && !dizzyIsPlaying) {
      xPosition = event.clientX;
      yPosition = event.clientY;
    }
    if ((event.movementX > 500 || event.movementX < -500) && !dizzyIsPlaying) {
      dizzyIsPlaying = true;
      dizzy.restart();
    }
  }

  let storedXPosition = 0;
  let storedYPosition = 0;

  function animateFace() {
    if (xPosition) {
      // important, only recalculating if the value changes
      if (storedXPosition != xPosition && storedYPosition != yPosition) {
        // console.log(xPosition, yPosition);

        xPercent = percentage(xPosition, width) - 50;
        yPercent = percentage(yPosition, height) - 20;

        yPercentLow = percentage(yPosition, height) - 80;
        yPercentHigh = percentage(yPosition, width) - 50;

        gsap.to('#face', {yPercent: yPercentLow / 30, xPercent: xPercent / 30});
        gsap.to('.eye', {yPercent: yPercent / 3, xPercent: xPercent / 2});
        gsap.to('#inner-face', {yPercent: yPercentHigh / 6, xPercent: xPercent / 8});
        gsap.to('#hair-front', {yPercent: yPercent / 15, xPercent: xPercent / 22});
        gsap.to(['#hair-back', '.shadow'], {
          yPercent: (yPercentLow / 20) * -1,
          xPercent: (xPercent / 20) * -1
        });
        gsap.to('.ear', {
          yPercent: (yPercentHigh / 1.5) * -1,
          xPercent: (xPercent / 10) * -1
        });
        gsap.to(['#eyebrow-left', '#eyebrow-right'], {yPercent: yPercentHigh * 2.5});

        storedXPosition = xPosition;
        storedYPosition = yPosition;
      }
    }
  }

  const blink = gsap.timeline({repeat: -1, repeatDelay: 5, paused: true});
  blink
    .to(['#eye-right', '#eye-left'], {duration: 0.01, opacity: 0}, 0)
    .to(['#eye-right-2', '#eye-left-2'], {duration: 0.01, opacity: 1}, 0)
    .to(['#eye-right', '#eye-left'], {duration: 0.01, opacity: 1}, 0.15)
    .to(['#eye-right-2', '#eye-left-2'], {duration: 0.01, opacity: 0}, 0.15);

  const smile = gsap.timeline({paused: true});
  smile
    .to('#mouth', {duration: 0.01, opacity: 1}, 0)
    .to('#mouth-2', {duration: 0.01, opacity: 0}, 0);

  CustomWiggle.create('myWiggle', {wiggles: 6, type: 'ease-out'});
  CustomWiggle.create('lessWiggle', {wiggles: 4, type: 'ease-in-out'});

  const dizzy = gsap.timeline({paused: true, onComplete: dizzyIsNotPlaying});
  dizzy
    .to('#eyes', {duration: 0.01, opacity: 0}, 0)
    .to('.dizzy', {duration: 0.01, opacity: 0.3}, 0)
    .to('.mouth-g', {duration: 0.01, opacity: 0}, 0)
    .to('#oh', {duration: 0.01, opacity: 0.85}, 0)
    .to(
      ['#head', '#hair-back', '.shadow'],
      {
        duration: 6,
        rotate: 2,
        transformOrigin: '50% 50%',
        ease: 'myWiggle'
      },
      0
    )
    .to(
      '#me',
      {
        duration: 6,
        rotate: -2,
        transformOrigin: '50% 100%',
        ease: 'myWiggle'
      },
      0
    )
    .to(
      '#me',
      {
        duration: 3.7,
        scale: 0.98,
        transformOrigin: '50% 100%',
        ease: 'lessWiggle'
      },
      0
    )
    .to(
      '.dizzy-1',
      {
        rotate: 360,
        duration: 1,
        repeat: 5,
        transformOrigin: '50% 50%',
        ease: Linear.easeNone
      },
      0.01
    )
    .to(
      '.dizzy-2',
      {
        rotate: -360,
        duration: 1,
        repeat: 5,
        transformOrigin: '50% 50%',
        ease: Linear.easeNone
      },
      0.01
    )
    .to('#eyes', {duration: 0.01, opacity: 1}, 4)
    .to('.dizzy', {duration: 0.01, opacity: 0}, 4)
    .to('#oh', {duration: 0.01, opacity: 0}, 4)
    .to('.mouth-g', {duration: 0.01, opacity: 1}, 4);

  function dizzyIsNotPlaying() {
    dizzyIsPlaying = false;
  }

  let hover = document.querySelectorAll('.js-hover');

  function playSmile() {
    smile.play();
  }

  function stopSmile() {
    smile.progress(0).pause();
  }

  hover.forEach(item => {
    item.addEventListener('mouseover', playSmile);
    item.addEventListener('mouseout', stopSmile);
  });

  // function being called at the end of main timeline
  function addMouseEvent() {
    document.addEventListener('mousemove', updateScreenCoords);

    // gsap's RAF, falls back to set timeout
    gsap.ticker.add(animateFace);

    blink.play();
  }

  window.addEventListener('resize', updateWindowSize);
})();