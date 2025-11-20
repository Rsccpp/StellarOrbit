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

