// App State
let currentUser = null;
let currentBooking = null;
let isFirstVisit = true;

// DOM Elements
const loadingScreen = document.getElementById('loading-screen');
const onboardingScreen = document.getElementById('onboarding');
const authScreen = document.getElementById('auth-screen');
const mainApp = document.getElementById('main-app');
const notification = document.getElementById('notification');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    registerServiceWorker();
    setupEventListeners();
});

// App Initialization
function initializeApp() {
    // Check if user has visited before
    const hasVisited = localStorage.getItem('hasVisited');
    const userData = localStorage.getItem('userData');
    
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        
        if (userData) {
            currentUser = JSON.parse(userData);
            showMainApp();
        } else if (!hasVisited) {
            showOnboarding();
        } else {
            showAuth();
        }
    }, 2000);
}

// Service Worker Registration
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered:', registration);
            })
            .catch(error => {
                console.log('SW registration failed:', error);
            });
    }
}

// Event Listeners Setup
function setupEventListeners() {
    // Onboarding
    setupOnboardingListeners();
    
    // Authentication
    setupAuthListeners();
    
    // Main App
    setupMainAppListeners();
    
    // Navigation
    setupNavigationListeners();
    
    // Location
    getCurrentLocation();
}

// Onboarding Listeners
function setupOnboardingListeners() {
    const nextBtn = document.getElementById('onboarding-next');
    const skipBtn = document.getElementById('onboarding-skip');
    let currentSlide = 0;
    const totalSlides = 3;
    
    nextBtn.addEventListener('click', () => {
        if (currentSlide < totalSlides - 1) {
            currentSlide++;
            showSlide(currentSlide);
            
            if (currentSlide === totalSlides - 1) {
                nextBtn.textContent = 'Get Started';
            }
        } else {
            finishOnboarding();
        }
    });
    
    skipBtn.addEventListener('click', finishOnboarding);
    
    function showSlide(index) {
        const slides = document.querySelectorAll('.onboarding-slide');
        const indicators = document.querySelectorAll('.indicator');
        
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
    }
    
    function finishOnboarding() {
        localStorage.setItem('hasVisited', 'true');
        onboardingScreen.classList.add('hidden');
        showAuth();
    }
}

// Authentication Listeners
function setupAuthListeners() {
    const authForm = document.getElementById('auth-form');
    const authToggleBtn = document.getElementById('auth-toggle-btn');
    const authTitle = document.getElementById('auth-title');
    const authSubtitle = document.getElementById('auth-subtitle');
    const authSubmit = document.getElementById('auth-submit');
    const authToggleText = document.getElementById('auth-toggle-text');
    const nameGroup = document.getElementById('name-group');
    const emailGroup = document.getElementById('email-group');
    
    let isSignUp = false;
    
    authToggleBtn.addEventListener('click', () => {
        isSignUp = !isSignUp;
        
        if (isSignUp) {
            authTitle.textContent = 'Create Account';
            authSubtitle.textContent = 'Join LetsGo today';
            authSubmit.textContent = 'Sign Up';
            authToggleText.textContent = 'Already have an account?';
            authToggleBtn.textContent = 'Sign In';
            nameGroup.classList.remove('hidden');
            emailGroup.classList.remove('hidden');
        } else {
            authTitle.textContent = 'Welcome Back';
            authSubtitle.textContent = 'Sign in to continue your journey';
            authSubmit.textContent = 'Sign In';
            authToggleText.textContent = "Don't have an account?";
            authToggleBtn.textContent = 'Sign Up';
            nameGroup.classList.add('hidden');
            emailGroup.classList.add('hidden');
        }
    });
    
    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const phone = document.getElementById('phone').value;
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        
        if (!phone) {
            showNotification('Please enter your phone number', 'error');
            return;
        }
        
        if (isSignUp && (!name || !email)) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        // Simulate authentication
        currentUser = {
            phone: phone,
            name: name || 'User',
            email: email || '',
            rating: 4.9,
            trips: Math.floor(Math.random() * 100) + 10
        };
        
        localStorage.setItem('userData', JSON.stringify(currentUser));
        
        showNotification(isSignUp ? 'Account created successfully!' : 'Welcome back!', 'success');
        
        setTimeout(() => {
            authScreen.classList.add('hidden');
            showMainApp();
        }, 1500);
    });
}

// Main App Listeners
function setupMainAppListeners() {
    // Profile button
    document.getElementById('profile-btn').addEventListener('click', () => {
        showScreen('profile');
    });
    
    // Find rides button
    document.getElementById('find-rides-btn').addEventListener('click', () => {
        const destination = document.getElementById('destination-location').value;
        if (!destination) {
            showNotification('Please enter your destination', 'error');
            return;
        }
        showScreen('vehicle');
    });
    
    // Vehicle selection
    setupVehicleSelection();
    
    // Back buttons
    document.getElementById('vehicle-back-btn').addEventListener('click', () => {
        showScreen('home');
    });
    
    document.getElementById('booking-back-btn').addEventListener('click', () => {
        showScreen('vehicle');
    });
    
    document.getElementById('profile-back-btn').addEventListener('click', () => {
        showScreen('home');
    });
    
    // Book ride button
    document.getElementById('book-ride-btn').addEventListener('click', () => {
        if (!currentBooking) {
            showNotification('Please select a vehicle', 'error');
            return;
        }
        
        showNotification('Booking your ride...', 'info');
        
        setTimeout(() => {
            showScreen('booking');
            simulateBookingProgress();
        }, 2000);
    });
    
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('userData');
        currentUser = null;
        mainApp.classList.add('hidden');
        showAuth();
        showNotification('Signed out successfully', 'success');
    });
    
    // Quick actions
    setupQuickActions();
}

// Vehicle Selection Setup
function setupVehicleSelection() {
    const vehicleOptions = document.querySelectorAll('.vehicle-option');
    const bookRideBtn = document.getElementById('book-ride-btn');
    
    vehicleOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove previous selection
            vehicleOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Select current option
            option.classList.add('selected');
            
            // Update booking data
            const vehicleType = option.dataset.type;
            const vehicleName = option.querySelector('.vehicle-name').textContent;
            const vehiclePrice = option.querySelector('.vehicle-price').textContent;
            
            currentBooking = {
                type: vehicleType,
                name: vehicleName,
                price: vehiclePrice,
                eta: option.querySelector('.vehicle-eta').textContent
            };
            
            // Update button
            bookRideBtn.textContent = `Book ${vehicleName}`;
            bookRideBtn.disabled = false;
        });
    });
}

// Quick Actions Setup
function setupQuickActions() {
    const actionBtns = document.querySelectorAll('.action-btn');
    const destinationInput = document.getElementById('destination-location');
    
    const locations = {
        'Home': 'Home Address',
        'Work': 'Office Complex',
        'Airport': 'International Airport',
        'Hospital': 'City Hospital'
    };
    
    actionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const location = btn.querySelector('span').textContent;
            destinationInput.value = locations[location] || location;
            showNotification(`Destination set to ${location}`, 'success');
        });
    });
}

// Navigation Listeners
function setupNavigationListeners() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const screen = item.dataset.screen;
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Show corresponding screen
            if (screen === 'profile') {
                showScreen('profile');
            } else {
                showScreen('home');
            }
        });
    });
}

// Screen Management
function showScreen(screenName) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active', 'slide-left');
    });
    
    const targetScreen = document.getElementById(`${screenName}-screen`);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
    
    // Update booking screen data
    if (screenName === 'booking' && currentBooking) {
        document.getElementById('booked-vehicle').textContent = currentBooking.name;
        document.getElementById('booked-fare').textContent = currentBooking.price;
        document.getElementById('arrival-time').textContent = currentBooking.eta;
    }
    
    // Update profile screen data
    if (screenName === 'profile' && currentUser) {
        document.getElementById('user-name').textContent = currentUser.name;
        document.getElementById('user-phone').textContent = currentUser.phone;
    }
}

// Show Functions
function showOnboarding() {
    onboardingScreen.classList.remove('hidden');
}

function showAuth() {
    authScreen.classList.remove('hidden');
}

function showMainApp() {
    mainApp.classList.remove('hidden');
    showScreen('home');
}

// Location Services
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // Simulate reverse geocoding
                const locations = [
                    'Downtown Plaza',
                    'Central Park Area',
                    'Business District',
                    'Residential Zone',
                    'Shopping Mall'
                ];
                
                const randomLocation = locations[Math.floor(Math.random() * locations.length)];
                document.getElementById('current-location').textContent = randomLocation;
                document.getElementById('pickup-location').value = randomLocation;
                document.getElementById('trip-pickup').textContent = randomLocation;
            },
            (error) => {
                console.log('Location error:', error);
                document.getElementById('current-location').textContent = 'Location unavailable';
            }
        );
    }
}

// Booking Progress Simulation
function simulateBookingProgress() {
    const steps = document.querySelectorAll('.progress-step');
    let currentStep = 2; // Start from "Driver assigned"
    
    const progressInterval = setInterval(() => {
        if (currentStep < steps.length) {
            steps[currentStep].classList.add('active');
            currentStep++;
            
            if (currentStep === 3) {
                showNotification('Driver is arriving at pickup location', 'info');
            } else if (currentStep === 4) {
                showNotification('Trip started! Enjoy your ride', 'success');
                clearInterval(progressInterval);
            }
        }
    }, 3000);
}

// Notification System
function showNotification(message, type = 'info') {
    const notificationText = document.querySelector('.notification-text');
    const notificationIcon = document.querySelector('.notification-icon');
    
    // Set icon based on type
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
    };
    
    notificationIcon.textContent = icons[type] || icons.info;
    notificationText.textContent = message;
    
    // Show notification
    notification.classList.remove('hidden');
    notification.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 300);
    }, 3000);
}

// PWA Features
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    
    // Show custom install prompt
    showNotification('Install LetsGo for the best experience!', 'info');
});

// Handle online/offline status
window.addEventListener('online', () => {
    showNotification('You are back online!', 'success');
});

window.addEventListener('offline', () => {
    showNotification('You are offline. Some features may be limited.', 'warning');
});

// Handle app visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // App became visible, refresh location if needed
        if (currentUser) {
            getCurrentLocation();
        }
    }
});

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

function formatTime(minutes) {
    if (minutes < 60) {
        return `${minutes} mins`;
    } else {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    }
}

function generateBookingId() {
    return 'LG' + Date.now().toString().slice(-6);
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showNotification,
        formatCurrency,
        formatTime,
        generateBookingId
    };
}