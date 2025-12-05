document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CONFIGURATION (Your AWS IP) ---
    const API_BASE_URL = 'http://51.21.170.200:5000'; 

    // --- 2. TERMINAL LOGIC ---
    const terminal = document.getElementById('telemetry-log');

    function addLog(msg, type = 'normal') {
        if (!terminal) return; // Safety check
        const time = new Date().toLocaleTimeString('en-US', { hour12: false });
        const p = document.createElement('div');
        
        let colorClass = 'log-info';
        if (type === 'warn') colorClass = 'log-warn';
        if (type === 'alert') colorClass = 'log-err';
        if (type === 'success') colorClass = 'log-packet';

        // Color Hex Codes
        let colorHex = '#00f3ff';
        if(type === 'warn') colorHex = '#ffbd2e';
        if(type === 'alert') colorHex = '#ff4d4d';
        if(type === 'success') colorHex = '#00ff88';

        p.className = 'log-line';
        p.innerHTML = `<span class="log-ts">[${time}]</span> <span class="${colorClass}" style="color: ${colorHex}">${msg}</span>`;
        
        terminal.appendChild(p);
        terminal.scrollTop = terminal.scrollHeight;
    }

    // Initial Logs
    addLog("System Boot Sequence Initiated...", "normal");
    addLog("Radar Array: ONLINE", "success");
    addLog("Connecting to NASA Deep Space Network...", "warn");

    // --- 3. TACTICAL RADAR SYSTEM ---
    const radarCanvas = document.getElementById('radarCanvas');
    const hazardWarning = document.getElementById('hazard-warning');
    const proxCount = document.getElementById('prox-count');
    
    if (radarCanvas) {
        const ctx = radarCanvas.getContext('2d');
        const width = radarCanvas.width;
        const height = radarCanvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        
        let angle = 0;
        let debris = []; 

        setInterval(() => {
            if(Math.random() > 0.8 && debris.length < 4) {
                debris.push({
                    x: centerX + (Math.random() - 0.5) * 200,
                    y: centerY + (Math.random() - 0.5) * 200,
                    life: 150 
                });
                addLog("Unidentified Object detected in Sector 7", "warn");
            }
        }, 1500);

        function drawRadar() {
            ctx.fillStyle = 'rgba(0, 20, 0, 0.1)';
            ctx.fillRect(0, 0, width, height);

            ctx.strokeStyle = '#004400';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(centerX, centerY, 40, 0, Math.PI * 2); ctx.stroke();
            ctx.beginPath(); ctx.arc(centerX, centerY, 80, 0, Math.PI * 2); ctx.stroke();
            ctx.beginPath(); ctx.arc(centerX, centerY, 120, 0, Math.PI * 2); ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(centerX, 0); ctx.lineTo(centerX, height);
            ctx.moveTo(0, centerY); ctx.lineTo(width, centerY);
            ctx.stroke();

            ctx.strokeStyle = '#00f3ff';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00f3ff';
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + Math.cos(angle) * 130, centerY + Math.sin(angle) * 130);
            ctx.stroke();
            ctx.shadowBlur = 0;

            let activeThreats = 0;
            debris.forEach((d) => {
                ctx.fillStyle = `rgba(255, 0, 0, ${d.life / 100})`;
                ctx.beginPath();
                ctx.arc(d.x, d.y, 4, 0, Math.PI * 2);
                ctx.fill();
                d.life--;
                activeThreats++;
            });

            debris = debris.filter(d => d.life > 0);

            if(proxCount) proxCount.innerText = activeThreats;
            if(hazardWarning) {
                if(activeThreats > 0) {
                    hazardWarning.style.display = 'block';
                    hazardWarning.classList.add('active');
                } else {
                    hazardWarning.style.display = 'none';
                    hazardWarning.classList.remove('active');
                }
            }

            angle += 0.05;
            requestAnimationFrame(drawRadar);
        }
        drawRadar();
    }

    // --- 4. SPECTRUM ANALYZER ---
    const specCanvas = document.getElementById('spectrumCanvas');
    if (specCanvas) {
        const sCtx = specCanvas.getContext('2d');
        const bars = 15;
        const barW = specCanvas.width / bars;

        function drawSpectrum() {
            sCtx.clearRect(0, 0, specCanvas.width, specCanvas.height);
            for(let i=0; i<bars; i++) {
                const h = Math.random() * (specCanvas.height * 0.8);
                const grd = sCtx.createLinearGradient(0, specCanvas.height, 0, 0);
                grd.addColorStop(0, '#bc13fe');
                grd.addColorStop(1, '#00f3ff');
                sCtx.fillStyle = grd;
                sCtx.fillRect(i * barW, specCanvas.height - h, barW - 2, h);
            }
            setTimeout(() => requestAnimationFrame(drawSpectrum), 100);
        }
        drawSpectrum();
    }

    // --- 5. NASA NEO API (Using your Backend Proxy) ---
    async function fetchAsteroids() {
        const neoList = document.getElementById('neo-list');
        const neoCount = document.getElementById('neo-count');
        
        // ✅ CORRECTED: Use your AWS IP + the Python Proxy Route
        // This hides your API key from the public!
        const url = `${API_BASE_URL}/api/asteroids`;

        try {
            const response = await fetch(url);
            
            if(!response.ok) {
                throw new Error("Backend connection failed");
            }
            
            const data = await response.json();
            
            // Handle NASA Date Structure
            // Note: If python sends raw data, keys are dates.
            // We find the first key (which is today)
            const todayKey = Object.keys(data.near_earth_objects)[0];
            const asteroids = data.near_earth_objects[todayKey];
            
            if(neoCount) neoCount.textContent = data.element_count;
            if(neoList) neoList.innerHTML = '';

            asteroids.sort((a, b) => b.estimated_diameter.meters.estimated_diameter_max - a.estimated_diameter.meters.estimated_diameter_max);

            asteroids.slice(0, 10).forEach(ast => {
                const name = ast.name.replace(/[()]/g, ''); 
                const size = Math.round(ast.estimated_diameter.meters.estimated_diameter_max);
                const distKm = parseFloat(ast.close_approach_data[0].miss_distance.kilometers);
                const distLD = (distKm / 384400).toFixed(1); 
                const isHazard = ast.is_potentially_hazardous_asteroid;

                const row = document.createElement('div');
                row.className = `neo-item ${isHazard ? 'neo-danger' : ''}`;
                row.style.cssText = "display: flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 0.8rem; font-family: monospace;";
                
                row.innerHTML = `
                    <span style="color: ${isHazard ? '#ff4d4d' : '#00f3ff'}">${isHazard ? '⚠ ' : ''}${name}</span>
                    <span style="color: white">${size}m</span>
                    <span style="color: #bc13fe">${distLD} LD</span>
                `;
                neoList.appendChild(row);

                if(isHazard) {
                    addLog(`THREAT DETECTED: ${name} (${size}m) passing Earth`, "alert");
                }
            });
            addLog(`NASA Data Sync Complete. ${asteroids.length} objects tracked.`, "success");

        } catch (error) {
            console.error("NASA Feed Error:", error);
            if(neoList) neoList.innerHTML = '<p style="color:red; text-align:center; padding:10px;">OFFLINE: BACKEND LINK SEVERED</p>';
            addLog("ERROR: Unable to connect to NASA Feed via Proxy.", "alert");
        }
    }

    fetchAsteroids();

    // --- 6. CHATBOT TOGGLE ---
    window.toggleChatbot = function() {
        const popup = document.getElementById('chatbot-popup');
        if(popup) popup.classList.toggle('hidden');
    };
});