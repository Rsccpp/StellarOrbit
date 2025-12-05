// (NEW) Add these at the top with your other 'const' variables
const analysisStats = document.getElementById('analysisStats');
const statsText = document.getElementById('statsText');

document.addEventListener('DOMContentLoaded', () => {

    // ============================================================
    //  GLOBAL LOGIC (Runs on every page)
    // ============================================================
    
    // 1. Mobile Menu Toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    if(mobileMenu){
        mobileMenu.addEventListener('click', () => {
            if(navLinks) {
                navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '70px';
                navLinks.style.right = '0';
                navLinks.style.background = '#0b0d17';
                navLinks.style.width = '100%';
                navLinks.style.padding = '20px';
                navLinks.style.zIndex = '1000';
            }
        });
    }

    // 2. Scroll Animation Observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    // 3. Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if(target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });


    // ============================================================
    //  PAGE 1: MISSION / INDEX (Analysis Logic)
    // ============================================================
    const analyzeButton = document.getElementById('analyzeButton');
    
    if (analyzeButton) { // Only run if button exists (index.html)
        const fileInput = document.getElementById('imageUpload');
        const analysisStats = document.getElementById('analysisStats');
        const statsText = document.getElementById('statsText');
        const resultsContainer = document.getElementById('resultsContainer');
        const statusMessage = document.getElementById('statusMessage');
        const loadingSpinner = document.getElementById('loadingSpinner');
        const originalImage = document.getElementById('originalImage');
        const resultImage = document.getElementById('resultImage');

        analyzeButton.addEventListener('click', () => {
            const analysisType = document.getElementById('analysisType').value;
            const file = fileInput.files[0];

            if (!file) {
                alert('Please select an image file first.');
                return;
            }

            // UI Updates
            resultsContainer.classList.remove('hidden');
            loadingSpinner.classList.remove('hidden');
            statusMessage.textContent = 'Analyzing... This may take a moment.';
            statusMessage.style.color = '#333';
            originalImage.src = '';
            resultImage.src = '';
            
            if(analysisStats) analysisStats.classList.add('hidden');
            if(statsText) statsText.textContent = '';

            const formData = new FormData();
            formData.append('file', file);

            // USE YOUR AWS IP HERE
            const apiEndpoint = `http://51.21.170.200:5000/analyze/${analysisType}`;

            fetch(apiEndpoint, {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                loadingSpinner.classList.add('hidden');
                
                if (data.result_url) {
                    statusMessage.textContent = 'Analysis Complete!';
                    statusMessage.style.color = '#00f3ff';
                    
                    originalImage.src = URL.createObjectURL(file);
                    // Add timestamp to force reload
                    resultImage.src = data.result_url + '?t=' + new Date().getTime(); 
                    
                    if (data.stats) {
                        const stats = data.stats;
                        let pixelLabel = "Pixels Detected";
                        if (analysisType === 'water') pixelLabel = "Water Pixels Detected";
                        if (analysisType === 'fire') pixelLabel = "Fire Hotspot Pixels";
                        
                        statsText.innerHTML = `
                            <b>Method:</b> ${stats.analysis_method || 'AI Analysis'}<br>
                            <hr style="margin: 8px 0;">
                            Total Pixels: ${parseInt(stats.total_pixels).toLocaleString()}<br>
                            <b>${pixelLabel}: ${parseInt(stats.water_pixels).toLocaleString()}</b><br>
                            <strong>Coverage: ${stats.water_percentage}%</strong>
                        `;
                        analysisStats.classList.remove('hidden');
                    }
                } else {
                    throw new Error(data.error || 'Unknown error occurred.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                loadingSpinner.classList.add('hidden');
                statusMessage.textContent = `Error: ${error.message}`;
                statusMessage.style.color = 'red';
            });
        });
    }


    // ============================================================
    //  PAGE 2: LIVE OPS (Terminal Logic)
    // ============================================================
    const terminal = document.getElementById('telemetry-log');

    if (terminal) { // Only run if terminal exists (live-ops.html)
        
        const asciiArt = [
            "Initializing StellarOrbit v2.4...",
            "Loading Core Modules... [OK]",
            "Connecting to SatLink-Alpha... [OK]",
            "Decrypting Secure Stream... [OK]",
            "----------------------------------------"
        ];

        const logMessages = [
            { type: 'info', msg: "Heartbeat signal received from Sat-4" },
            { type: 'info', msg: "Solar array efficiency at 98.4%" },
            { type: 'info', msg: "Buffer flushed: 4024 bytes" },
            { type: 'warn', msg: "Thermal spike detected in sector 7G" },
            { type: 'info', msg: "Adjusting orbital trajectory..." },
            { type: 'err',  msg: "Packet loss on uplink channel 2 (Retrying)" },
            { type: 'info', msg: "Image compression algorithm optimized" },
            { type: 'info', msg: "Spectrometry analysis complete" },
            { type: 'warn', msg: "Latency jitter detected: 45ms" },
            { type: 'info', msg: "Syncing database with ground station" }
        ];

        function printLine(text, type = 'info') {
            const line = document.createElement('div');
            line.className = 'log-line';
            
            const now = new Date();
            const time = now.toLocaleTimeString('en-US', { hour12: false }) + "." + String(now.getMilliseconds()).padStart(3, '0');
            
            let colorClass = 'log-info';
            if(type === 'warn') colorClass = 'log-warn';
            if(type === 'err') colorClass = 'log-err';

            line.innerHTML = `<span class="log-ts">[${time}]</span> <span class="${colorClass}">${text}</span>`;
            
            terminal.appendChild(line);
            terminal.scrollTop = terminal.scrollHeight; // Auto Scroll to bottom
        }

        // 1. Run Startup Sequence
        let delay = 0;
        asciiArt.forEach((msg, index) => {
            setTimeout(() => {
                printLine(msg, 'info');
            }, index * 400); // Stagger them
            delay = index * 400;
        });

        // 2. Start Infinite Loop after startup
        setTimeout(() => {
            setInterval(() => {
                const randomLog = logMessages[Math.floor(Math.random() * logMessages.length)];
                printLine(randomLog.msg, randomLog.type);
            }, 2000); // New log every 2 seconds
        }, delay + 1000);
    }

});