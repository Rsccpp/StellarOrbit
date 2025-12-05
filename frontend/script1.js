document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Initialize 3D Globe ---
    // Using Globe.gl library
    const globeContainer = document.getElementById('globeViz');
    
    try {
        const myGlobe = Globe()
            (globeContainer)
            .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
            .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
            .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
            .atmosphereColor('#00f3ff')
            .atmosphereAltitude(0.15)
            .width(window.innerWidth)
            .height(window.innerHeight);

        // Add random satellites (Points)
        const N = 20;
        const gData = [...Array(N).keys()].map(() => ({
            lat: (Math.random() - 0.5) * 180,
            lng: (Math.random() - 0.5) * 360,
            size: Math.random() / 3,
            color: ['#00f3ff', '#bc13fe', '#ffffff'][Math.round(Math.random() * 2)]
        }));

        myGlobe.pointsData(gData)
            .pointAltitude(0.1)
            .pointColor('color');

        // Auto-rotate controls
        const controls = myGlobe.controls();
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.6;
        
        // Handle Window Resize
        window.addEventListener('resize', () => {
            myGlobe.width(window.innerWidth).height(window.innerHeight);
        });

    } catch (e) {
        console.log("Globe failed to load (likely due to network/CORS). Fallback to CSS background.");
        globeContainer.style.background = "radial-gradient(circle, #1a2a6c, #b21f1f, #fdbb2d)";
    }

    // --- 2. Simulated Telemetry Log ---
    const logContainer = document.getElementById('telemetry-log');
    const messages = [
        "Analyzing spectral bands...",
        "Thermal anomaly scan: NEGATIVE",
        "Optimizing neural weights...",
        "Downlinking packet #4029...",
        "Solar array efficiency: 99.2%",
        "Edge processor load: 34%",
        "Aligning star tracker...",
        "Buffer cleared."
    ];

    setInterval(() => {
        // Remove blinking cursor from previous last line
        const oldLast = logContainer.lastElementChild;
        if(oldLast) oldLast.classList.remove('blink');

        // Create new log line
        const msg = messages[Math.floor(Math.random() * messages.length)];
        const p = document.createElement('p');
        // Add timestamp
        const time = new Date().toISOString().split('T')[1].split('.')[0];
        p.innerText = `[${time}] > ${msg}`;
        p.classList.add('blink');
        
        logContainer.appendChild(p);

        // Auto scroll to bottom
        logContainer.scrollTop = logContainer.scrollHeight;

        // Keep list clean (max 10 lines)
        if(logContainer.children.length > 10) {
            logContainer.removeChild(logContainer.firstElementChild);
        }
    }, 2000);

    // --- 3. Scroll Animations (Intersection Observer) ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    /* --- Chatbot Logic --- */
const chatToggle = document.getElementById('chat-toggle');
const chatWindow = document.getElementById('chat-window');
const closeChat = document.getElementById('close-chat');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const chatBody = document.getElementById('chat-body');

// Toggle Chat Window
if(chatToggle) {
    chatToggle.addEventListener('click', () => chatWindow.classList.add('active'));
    closeChat.addEventListener('click', () => chatWindow.classList.remove('active'));

    // Send Message Function
    function sendMessage() {
        const text = chatInput.value.trim();
        if (text === "") return;

        // 1. Add User Message
        addMessage(text, 'user-msg');
        chatInput.value = '';

        // 2. Simulate Bot Response (Simple Logic)
        setTimeout(() => {
            let reply = "I am analyzing that request...";
            
            if(text.toLowerCase().includes('hello')) reply = "Greetings, Commander. Systems are operational.";
            else if(text.toLowerCase().includes('password')) reply = "For security, please use the Login portal.";
            else if(text.toLowerCase().includes('eirsat')) reply = "EIRSAT-1 is operational. Telemetry is nominal.";
            else reply = "My neural network is still learning. Please contact human command.";

            addMessage(reply, 'bot-msg');
        }, 800);
    }

    function addMessage(text, className) {
        const div = document.createElement('div');
        div.classList.add('message', className);
        div.innerHTML = `<p>${text}</p>`;
        chatBody.appendChild(div);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}


    // --- 4. Smooth Scrolling ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});  


// CONFIGURATION
const API_KEY = "your_api";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const chatbotPopup = document.getElementById("chatbot-popup");

// Toggle Chat Popup Visibility
function toggleChatbot() {
    chatbotPopup.style.display = chatbotPopup.style.display === "block" ? "none" : "block";
}

// Function to create a chat message list item
const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    let chatContent = `<p>${message}</p>`;
    chatLi.innerHTML = chatContent;
    return chatLi;
};

// Function to call Gemini API
const generateResponse = async (userMessage) => {
    const incomingChatLi = createChatLi("Thinking...", "incoming");
    chatBox.appendChild(incomingChatLi);
    chatBox.scrollTo(0, chatBox.scrollHeight);

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ text: userMessage }] 
                }]
            }),
        });

        const data = await response.json();
        const botMessage = data.candidates[0].content.parts[0].text;
        
        // Update the "Thinking..." message with the actual response
        incomingChatLi.querySelector("p").textContent = botMessage;

    } catch (error) {
        incomingChatLi.querySelector("p").textContent = "Oops! Something went wrong. Please try again.";
        console.error("Error:", error);
    } finally {
        chatBox.scrollTo(0, chatBox.scrollHeight);
    }
};

// Handle User Input
const handleChat = () => {
    const userMessage = userInput.value.trim();
    if (!userMessage) return;

    // Append user message
    chatBox.appendChild(createChatLi(userMessage, "outgoing"));
    chatBox.scrollTo(0, chatBox.scrollHeight);
    
    // Clear input
    userInput.value = "";

    // Generate Bot Response
    setTimeout(() => {
        generateResponse(userMessage);
    }, 600);
};

// Event Listeners
sendBtn.addEventListener("click", handleChat);

userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleChat();
    }
});


// live-Oops
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. RADAR SYSTEM ---
    const radarCanvas = document.getElementById('radarCanvas');
    const rCtx = radarCanvas.getContext('2d');
    const width = radarCanvas.width;
    const height = radarCanvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    let angle = 0;
    let debris = []; // Array to store debris objects

    // Create random debris occasionally
    setInterval(() => {
        if(Math.random() > 0.7 && debris.length < 5) {
            debris.push({
                x: centerX + (Math.random() - 0.5) * 200,
                y: centerY + (Math.random() - 0.5) * 200,
                life: 100 // frames to live
            });
            // Log it in terminal
            addLog("Unknown object detected on radar.", "warn");
            document.getElementById('prox-count').textContent = debris.length;
        }
    }, 1000);

    function drawRadar() {
        // Fade effect for trail
        rCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        rCtx.fillRect(0, 0, width, height);

        // Draw Rings
        rCtx.strokeStyle = '#004400';
        rCtx.lineWidth = 1;
        rCtx.beginPath(); rCtx.arc(centerX, centerY, 40, 0, Math.PI * 2); rCtx.stroke();
        rCtx.beginPath(); rCtx.arc(centerX, centerY, 80, 0, Math.PI * 2); rCtx.stroke();
        rCtx.beginPath(); rCtx.arc(centerX, centerY, 120, 0, Math.PI * 2); rCtx.stroke();

        // Crosshairs
        rCtx.beginPath();
        rCtx.moveTo(centerX, 0); rCtx.lineTo(centerX, height);
        rCtx.moveTo(0, centerY); rCtx.lineTo(width, centerY);
        rCtx.stroke();

        // Draw Sweep Line
        rCtx.strokeStyle = '#00f3ff';
        rCtx.shadowBlur = 10;
        rCtx.shadowColor = '#00f3ff';
        rCtx.lineWidth = 2;
        rCtx.beginPath();
        rCtx.moveTo(centerX, centerY);
        rCtx.lineTo(centerX + Math.cos(angle) * 140, centerY + Math.sin(angle) * 140);
        rCtx.stroke();
        rCtx.shadowBlur = 0;

        // Draw Satellite Center
        rCtx.fillStyle = '#fff';
        rCtx.beginPath(); rCtx.arc(centerX, centerY, 3, 0, Math.PI*2); rCtx.fill();

        // Draw Debris Blips
        debris.forEach((d, index) => {
            rCtx.fillStyle = `rgba(255, 0, 0, ${d.life / 100})`;
            rCtx.beginPath();
            rCtx.arc(d.x, d.y, 4, 0, Math.PI * 2);
            rCtx.fill();
            d.life--;
            
            // Text label near debris
            if(d.life > 80) {
                rCtx.fillStyle = '#00ff00';
                rCtx.font = '10px Courier';
                rCtx.fillText(`OBJ-${index}`, d.x + 5, d.y - 5);
            }
        });

        // Remove old debris
        debris = debris.filter(d => d.life > 0);
        if(debris.length === 0) document.getElementById('prox-count').textContent = "0";

        // Update Angle
        angle += 0.05;
        requestAnimationFrame(drawRadar);
    }
    drawRadar();


    // --- 2. SPECTRUM ANALYZER (Canvas) ---
    const specCanvas = document.getElementById('spectrumCanvas');
    const sCtx = specCanvas.getContext('2d');
    const bars = 10;
    const barWidth = specCanvas.width / bars;

    function drawSpectrum() {
        sCtx.clearRect(0, 0, specCanvas.width, specCanvas.height);
        
        for(let i=0; i<bars; i++) {
            const h = Math.random() * specCanvas.height;
            
            // Gradient Color
            const gradient = sCtx.createLinearGradient(0, specCanvas.height, 0, 0);
            gradient.addColorStop(0, '#bc13fe');
            gradient.addColorStop(1, '#00f3ff');
            
            sCtx.fillStyle = gradient;
            sCtx.fillRect(i * barWidth, specCanvas.height - h, barWidth - 2, h);
        }
        requestAnimationFrame(drawSpectrum);
    }
    drawSpectrum();


    // --- 3. TERMINAL LOGIC (Standard) ---
    const terminal = document.getElementById('telemetry-log');
    function addLog(msg, type = 'normal') {
        const time = new Date().toLocaleTimeString('en-US', { hour12: false });
        const p = document.createElement('div');
        p.className = `log-line ${type === 'warn' ? 'log-warn' : 'log-info'}`;
        p.innerHTML = `<span class="log-ts">[${time}]</span> ${msg}`;
        terminal.appendChild(p);
        terminal.scrollTop = terminal.scrollHeight; 
    }
    
    // Initial logs
    addLog("Radar System Initialized.");
    addLog("Scanning Sector 4...");
});

// ... inside DOMContentLoaded ...

    // --- 4. PLANETARY DEFENSE (NASA NEO API) ---
    async function fetchAsteroids() {
        const neoList = document.getElementById('neo-list');
        const neoCount = document.getElementById('neo-count');
        
        // Get Today's Date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // NASA API URL
        const apiKey = 'your_api'; 
        const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${apiKey}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            
            // Get list of objects for today
            const asteroids = data.near_earth_objects[today];
            
            // Update Count
            neoCount.textContent = data.element_count;
            
            // Clear Loading Text
            neoList.innerHTML = '';

            // Sort by size (largest first) to make it interesting
            asteroids.sort((a, b) => b.estimated_diameter.meters.estimated_diameter_max - a.estimated_diameter.meters.estimated_diameter_max);

            // Take top 10 to fit UI
            asteroids.slice(0, 10).forEach(ast => {
                const name = ast.name.replace('(', '').replace(')', ''); // Clean name
                const size = Math.round(ast.estimated_diameter.meters.estimated_diameter_max) + 'm';
                
                // Distance in Lunar Distances (LD) is easier to read than km
                const distKm = parseFloat(ast.close_approach_data[0].miss_distance.kilometers);
                const distLD = (distKm / 384400).toFixed(1) + ' LD';
                
                const isHazard = ast.is_potentially_hazardous_asteroid;

                // Create HTML Row
                const div = document.createElement('div');
                div.className = `neo-item ${isHazard ? 'neo-danger' : ''}`;
                div.innerHTML = `
                    <span class="neo-name">${isHazard ? '⚠ ' : ''}${name}</span>
                    <span class="neo-size">${size}</span>
                    <span class="neo-dist">${distLD}</span>
                `;
                neoList.appendChild(div);
                
                // If Hazard, log it to the Main Terminal as well!
                if(isHazard) {
                    addLog(`THREAT DETECTED: ${name} (${size}) passing at ${distLD}`, "warn");
                }
            });

        } catch (error) {
            console.error("NASA API Error:", error);
            neoList.innerHTML = '<p style="color:red; text-align:center;">OFFLINE: LINK SEVERED</p>';
        }
    }

    // Run once on load
    fetchAsteroids();