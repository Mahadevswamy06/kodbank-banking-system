document.addEventListener('DOMContentLoaded', () => {
    // Entrance Animations for Cards
    if (typeof gsap !== 'undefined') {
        gsap.from(".glass-card", {
            duration: 1.2,
            y: 50,
            opacity: 0,
            ease: "power4.out",
            stagger: 0.2
        });

        gsap.from(".input-group", {
            duration: 1,
            x: -20,
            opacity: 0,
            ease: "power2.out",
            stagger: 0.1,
            delay: 0.5
        });

        gsap.from(".shape", {
            duration: 2,
            scale: 0.5,
            opacity: 0,
            ease: "elastic.out(1, 0.3)",
            stagger: 0.3
        });

        // Floating animation for shapes
        gsap.to(".shape-1", {
            y: 30,
            duration: 4,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });

        gsap.to(".shape-2", {
            y: -40,
            duration: 5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    }

    // Ripple effect on buttons
    const buttons = document.querySelectorAll('.btn-glow');
    buttons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            let x = e.clientX - e.target.offsetLeft;
            let y = e.clientY - e.target.offsetTop;

            let ripples = document.createElement('span');
            ripples.style.left = x + 'px';
            ripples.style.top = y + 'px';
            ripples.className = 'ripple'; // Add CSS for this if needed
            this.appendChild(ripples);

            setTimeout(() => {
                ripples.remove();
            }, 1000);
        });
    });

    // Credit Letter Animations
    const letters = document.querySelectorAll('.credit-name span:not(.space)');
    letters.forEach(letter => {
        letter.addEventListener('click', () => {
            letter.classList.add('clicked');
            setTimeout(() => {
                letter.classList.remove('clicked');
            }, 600);
        });
    });

    // Signature Visibility
    const footer = document.querySelector('.credit-footer');
    if (footer) {
        footer.classList.add('visible');
    }

    // --- THREE.JS 3D BACKGROUND ---
    const init3DBackground = () => {
        const canvas = document.getElementById('bg-3d-canvas');
        if (!canvas) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true
        });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Create a geometric icosahedron
        const geometry = new THREE.IcosahedronGeometry(2, 2);
        const material = new THREE.MeshPhongMaterial({
            color: 0x00d2ff,
            wireframe: true,
            transparent: true,
            opacity: 0.15
        });
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        // Add particles
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 3000;
        const posArray = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 15;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.008,
            color: 0x00d2ff,
            transparent: true,
            opacity: 0.5
        });

        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        // Lights
        const light = new THREE.PointLight(0xffffff, 1.5);
        light.position.set(5, 5, 5);
        scene.add(light);
        scene.add(new THREE.AmbientLight(0xffffff, 0.3));

        camera.position.z = 5;

        // Mouse interaction
        let mouseX = 0;
        let mouseY = 0;
        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5);
            mouseY = (e.clientY / window.innerHeight - 0.5);
        });

        const animate = () => {
            requestAnimationFrame(animate);

            sphere.rotation.y += 0.003;
            sphere.rotation.z += 0.001;

            particlesMesh.rotation.y += 0.0005;

            // Smoothly move camera based on mouse
            camera.position.x += (mouseX * 2 - camera.position.x) * 0.05;
            camera.position.y += (-mouseY * 2 - camera.position.y) * 0.05;
            camera.lookAt(scene.position);

            renderer.render(scene, camera);
        };

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        animate();
    };

    if (window.location.pathname.includes('dashboard.html')) {
        init3DBackground();
    }
});
