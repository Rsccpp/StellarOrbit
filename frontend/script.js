// (NEW) Add these at the top with your other 'const' variables
const analysisStats = document.getElementById('analysisStats');
const statsText = document.getElementById('statsText');

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Scroll Animation Observer
    const observerOptions = {
        threshold: 0.1, // Trigger when 10% of element is visible
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    // Target all elements with .fade-in class
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));

    // 2. Smooth Scrolling for Navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // 3. Mobile Menu Toggle (Optional structure added in HTML)
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if(mobileMenu){
        mobileMenu.addEventListener('click', () => {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '70px';
            navLinks.style.right = '0';
            navLinks.style.background = '#0b0d17';
            navLinks.style.width = '100%';
            navLinks.style.padding = '20px';
        });
    }
});

document.getElementById('analyzeButton').addEventListener('click', () => {
    const fileInput = document.getElementById('imageUpload');
    const analysisType = document.getElementById('analysisType').value;
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select an image file first.');
        return;
    }

    const resultsContainer = document.getElementById('resultsContainer');
    const statusMessage = document.getElementById('statusMessage');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const originalImage = document.getElementById('originalImage');
    const resultImage = document.getElementById('resultImage');

    // --- Show loading state ---
    resultsContainer.classList.remove('hidden');
    loadingSpinner.classList.remove('hidden');
    statusMessage.textContent = 'Analyzing... This may take a moment.';
    statusMessage.style.color = '#333';
    originalImage.src = '';
    resultImage.src = '';
    
    // (NEW) Hide old stats on new analysis
    analysisStats.classList.add('hidden');
    statsText.textContent = '';

    // --- Prepare form data to send ---
    const formData = new FormData();
    formData.append('file', file);

    // --- Call the Backend API ---
    // The URL matches the @app.route in app.py
    const apiEndpoint = `http://127.0.0.1:5000/analyze/${analysisType}`;

    fetch(apiEndpoint, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            // If server responds with an error, show it
            return response.json().then(err => {
                throw new Error(err.error || `HTTP error! Status: ${response.status}`);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        loadingSpinner.classList.add('hidden');
        
        if (data.result_url) {
            statusMessage.textContent = 'Analysis Complete!';
            
            // Display the original image (using a local URL)
            originalImage.src = URL.createObjectURL(file);
            
            // Display the result image (from the server's response URL)
            resultImage.src = data.result_url;
            
            // for detection
            if (data.stats) {
                const stats = data.stats;
                
                // Determine labels based on what the user selected
                let pixelLabel = "Pixels Detected";
                if (analysisType === 'water') pixelLabel = "Water Pixels Detected";
                if (analysisType === 'crop') pixelLabel = "Healthy Crop Pixels";
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
            // This case should be caught by the .catch block, but as a fallback
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


