import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { offers } from "./offers.config.js";

// --- Configuration & Helpers ---

function getEnv(key, defaultVal = "") {
    if (window.ENV && window.ENV[key] && !window.ENV[key].startsWith("process.env")) return window.ENV[key];
    if (typeof process !== "undefined" && process.env && process.env[key]) return process.env[key];
    return defaultVal;
}

function getFirebaseConfig() {
    if (window.ENV && window.ENV.FIREBASE_CONFIG && !window.ENV.FIREBASE_CONFIG.apiKey.startsWith("process.env")) {
        return window.ENV.FIREBASE_CONFIG;
    }
    return {
        apiKey: getEnv("FIREBASE_API_KEY"),
        authDomain: getEnv("FIREBASE_AUTH_DOMAIN"),
        projectId: getEnv("FIREBASE_PROJECT_ID"),
        storageBucket: getEnv("FIREBASE_STORAGE_BUCKET"),
        messagingSenderId: getEnv("FIREBASE_MESSAGING_SENDER_ID"),
        appId: getEnv("FIREBASE_APP_ID")
    };
}

// Generate UUID for Click ID
function generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Build URL with params
function buildTargetUrl(baseUrl) {
    let finalUrl = baseUrl;
    try {
        const currentUrlParams = new URLSearchParams(window.location.search);
        const targetUrlObj = new URL(baseUrl);
        currentUrlParams.forEach((value, key) => {
            targetUrlObj.searchParams.append(key, value);
        });
        finalUrl = targetUrlObj.toString();
    } catch (e) {
        console.warn("Error parsing URL params:", e);
    }
    return finalUrl;
}

// --- Render Logic ---

function renderOffers() {
    const container = document.getElementById('offer-list-container');
    if (!container) return;

    container.innerHTML = ''; // Clear loading

    offers.forEach((offer, index) => {
        const isHero = index === 0;

        const card = document.createElement('div');
        // Styling based on rank
        if (isHero) {
            card.className = "glass-panel rounded-2xl p-6 relative overflow-hidden transform transition hover:scale-[1.01] border-brand-500/50 shadow-2xl shadow-brand-900/50";
            card.innerHTML = `
                <div class="absolute top-0 right-0 bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">EDITOR'S CHOICE</div>
                <div class="absolute -left-10 -top-10 w-32 h-32 bg-brand-500 blur-[60px] opacity-20 pointer-events-none"></div>
                
                <div class="flex flex-col md:flex-row items-center gap-4 relative z-10">
                    <div class="w-full md:w-auto flex-shrink-0 flex justify-center">
                        <img src="${offer.image}" alt="${offer.name}" class="w-20 h-20 rounded-full border-2 border-brand-500 shadow-lg object-cover">
                    </div>
                    <div class="text-center md:text-left flex-grow">
                        <div class="flex items-center justify-center md:justify-start gap-2 mb-1">
                            <h2 class="text-2xl font-bold text-white">${offer.name}</h2>
                            <span class="flex text-yellow-500 text-sm">★★★★★</span>
                        </div>
                        <p class="text-gray-300 text-sm mb-3">${offer.description}</p>
                        <div class="flex flex-wrap justify-center md:justify-start gap-2 mb-4 md:mb-0">
                            ${offer.badges.map(b => `<span class="bg-brand-900/50 border border-brand-500/30 text-[10px] px-2 py-0.5 rounded text-gray-300">${b}</span>`).join('')}
                        </div>
                    </div>
                    <div class="w-full md:w-auto flex-shrink-0">
                        <button class="offer-btn w-full md:w-auto bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold py-3 px-8 rounded-xl shadow-lg transform transition active:scale-95 flex flex-col items-center justify-center min-w-[160px]"
                                data-url="${offer.link}" data-id="${offer.id}" data-name="${offer.name}">
                            <span class="text-lg leading-none">Visit Site</span>
                            <span class="text-[10px] opacity-80 font-normal mt-1">Free Registration</span>
                        </button>
                    </div>
                </div>
            `;
        } else {
            card.className = "glass-panel rounded-xl p-4 flex items-center gap-4 hover:bg-white/5 transition";
            card.innerHTML = `
                <div class="flex-shrink-0 text-xl font-bold text-gray-600 w-6 text-center">#${offer.rank}</div>
                <div class="flex-shrink-0">
                     <img src="${offer.image}" alt="${offer.name}" class="w-12 h-12 rounded-lg object-cover bg-gray-800">
                </div>
                <div class="flex-grow min-w-0">
                    <div class="flex items-center gap-2">
                        <h3 class="font-bold text-white truncate">${offer.name}</h3>
                        <span class="text-yellow-500 text-xs font-bold">★ ${offer.rating}</span>
                    </div>
                    <p class="text-xs text-gray-400 truncate">${offer.description}</p>
                </div>
                <div class="flex-shrink-0">
                    <button class="offer-btn bg-gray-800 hover:bg-brand-600 border border-gray-700 hover:border-brand-500 text-white text-sm font-bold py-2 px-4 rounded-lg transition"
                            data-url="${offer.link}" data-id="${offer.id}" data-name="${offer.name}">
                        View
                    </button>
                </div>
            `;
        }

        container.appendChild(card);
    });
}

// --- Tracking Logic ---

async function initPage() {
    renderOffers();
    const clickId = generateUUID();
    console.log("Page Init. Global ClickID:", clickId);

    // Initialize Firebase
    let db = null;
    try {
        const firebaseConfig = getFirebaseConfig();
        if (firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("process.env")) {
            const app = initializeApp(firebaseConfig);
            db = getFirestore(app);
            console.log("Firebase initialized");
        }
    } catch (e) {
        console.error("Firebase init failed:", e);
    }

    // Attach Click Listeners to all generated buttons
    document.querySelectorAll('.offer-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const btnEl = e.currentTarget;

            // UI Feedback
            if (!btnEl.dataset.originalContent) {
                btnEl.dataset.originalContent = btnEl.innerHTML;
            }
            btnEl.innerHTML = '<span class="animate-pulse">...</span>';
            btnEl.disabled = true;

            const offerUrlRaw = btnEl.dataset.url;
            const offerId = btnEl.dataset.id;
            const offerName = btnEl.dataset.name;
            const targetUrl = buildTargetUrl(offerUrlRaw);

            const trackingData = {
                clickId: clickId,
                timestamp: serverTimestamp(),
                userAgent: navigator.userAgent,
                referer: document.referrer || "direct",
                targetUrl: targetUrl,
                offer_id: offerId,
                offer_name: offerName,
                rank_position: offers.find(o => o.id === offerId)?.rank || 0,
                screen: `${window.screen.width}x${window.screen.height}`,
            };

            // Async Write
            const writePromise = new Promise(async (resolve) => {
                if (!db) { resolve("no-db"); return; }
                try {
                    await addDoc(collection(db, "clicks"), trackingData);
                    console.log("Click tracked:", offerName);
                    resolve("success");
                } catch (error) {
                    console.error("Track error:", error);
                    resolve("error");
                }
            });

            // Timeout
            const timeoutPromise = new Promise(resolve => setTimeout(() => resolve("timeout"), 2000));

            await Promise.race([writePromise, timeoutPromise]);

            window.location.href = targetUrl;
        });
    });
}

// Reset buttons on page show (handles Back/Forward cache)
window.addEventListener('pageshow', (event) => {
    document.querySelectorAll('.offer-btn').forEach(btn => {
        btn.disabled = false;
        // Restore from saved state
        if (btn.dataset.originalContent) {
            btn.innerHTML = btn.dataset.originalContent;
        }
        // Fallback if state missing but button looks stuck
        else if (btn.innerHTML.includes('...')) {
            const isHero = btn.closest('.glass-panel').classList.contains('p-6'); // Crude check for hero
            if (isHero) {
                btn.innerHTML = `<span class="text-lg leading-none">Visit Site</span><span class="text-[10px] opacity-80 font-normal mt-1">Free Registration</span>`;
            } else {
                btn.innerHTML = 'View';
            }
        }
    });
});

initPage();
