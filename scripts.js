// --- CONFIG ---
const NUMERO_MAX_IMMAGINI = 55;
const NUMERO_MAX_VIDEO = 1;
const ELEMENTI_PER_BLOCCO = 5;
const BASE_PATH = "images/foto_lavori/";

// --- DOM ---
const galleriaContainer = document.getElementById('galleria-lavori');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const lightboxOverlay = document.getElementById('lightboxOverlay');
const lightboxMediaContainer = document.getElementById('lightboxMediaContainer');
const lightboxCloseBtn = document.getElementById('lightboxClose');
const lightboxPrevBtn = document.getElementById('lightboxPrev');
const lightboxNextBtn = document.getElementById('lightboxNext');

const hamburgerBtn = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobile-nav');
const logoTextElement = document.querySelector('.logo-text');

// --- STATE ---
let posizioneCorrenteCarosello = 0;
let posizioneCorrenteLightbox = 0;
let tuttiGliElementi = [];

// cache performance carosello
let itemWidth = 0;
let gap = 20;

// debounce resize
let resizeTimeout;

// --- UTILS ---
function generaElencoFile() {
    const elementi = [];

    for (let i = 1; i <= NUMERO_MAX_IMMAGINI; i++) {
        elementi.push({
            src: `${BASE_PATH}${i}.webp`,
            alt: `Progetto Idraulico #${i}`,
            type: 'img'
        });
    }

    for (let i = 1; i <= NUMERO_MAX_VIDEO; i++) {
        elementi.push({
            src: `${BASE_PATH}${i}.mp4`,
            alt: `Video lavoro #${i}`,
            type: 'video'
        });
    }

    return elementi;
}

function creaElementoHTML(item, index) {
    const el = document.createElement('div');
    el.className = item.type === 'video' ? 'galleria-item video-item' : 'galleria-item';
    el.dataset.index = index;

    if (item.type === 'img') {
        el.innerHTML = `
            <img src="${item.src}" alt="${item.alt}" loading="lazy">
        `;
    } else {
        el.innerHTML = `
            <video controls preload="metadata" poster="${item.src.replace('.mp4', '.webp')}">
                <source src="${item.src}" type="video/mp4">
            </video>
        `;
    }

    return el;
}

function initLayoutCache() {
    const first = galleriaContainer.querySelector('.galleria-item');
    if (!first) return;

    itemWidth = first.offsetWidth;

    const styles = getComputedStyle(galleriaContainer);
    gap = parseFloat(styles.getPropertyValue('--gap-carosello')) || 20;
}

// --- CAROSELLO ---
function aggiornaCarosello() {
    const offset = posizioneCorrenteCarosello * (itemWidth + gap) * ELEMENTI_PER_BLOCCO;
    galleriaContainer.style.transform = `translateX(-${offset}px)`;

    prevBtn.disabled = posizioneCorrenteCarosello === 0;

    const maxPos = Math.ceil(tuttiGliElementi.length / ELEMENTI_PER_BLOCCO) - 1;
    nextBtn.disabled = posizioneCorrenteCarosello >= maxPos;
}

// --- LIGHTBOX ---
function mostraElementoInLightbox(index) {
    if (index < 0 || index >= tuttiGliElementi.length) return;

    posizioneCorrenteLightbox = index;
    const item = tuttiGliElementi[index];

    lightboxMediaContainer.innerHTML = '';

    if (item.type === 'img') {
        const img = document.createElement('img');
        img.src = item.src;
        img.alt = item.alt;
        lightboxMediaContainer.appendChild(img);
    } else {
        const video = document.createElement('video');
        video.src = item.src;
        video.controls = true;
        video.autoplay = true;
        video.loop = true;
        video.muted = false;
        video.playsInline = true;
        video.preload = "metadata";
        video.poster = item.src.replace('.mp4', '.webp');

        lightboxMediaContainer.appendChild(video);
    }

    lightboxPrevBtn.disabled = index === 0;
    lightboxNextBtn.disabled = index === tuttiGliElementi.length - 1;
}

// --- INIT ---
function inizializzaGalleria() {
    tuttiGliElementi = generaElencoFile();

    if (!tuttiGliElementi.length) {
        galleriaContainer.innerHTML = "<p>Nessun contenuto</p>";
        return;
    }

    const frag = document.createDocumentFragment();

    tuttiGliElementi.forEach((item, i) => {
        frag.appendChild(creaElementoHTML(item, i));
    });

    galleriaContainer.appendChild(frag);

    setTimeout(() => {
        initLayoutCache();
        aggiornaCarosello();
    }, 100);
}

// --- MENU MOBILE ---
hamburgerBtn.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');

    hamburgerBtn.setAttribute('aria-expanded', isOpen);

    hamburgerBtn.querySelector('i').className =
        isOpen ? 'fa-solid fa-times' : 'fa-solid fa-bars';

    const color = isOpen ? 'var(--colore-primario)' : 'var(--colore-bianco)';
    hamburgerBtn.style.color = color;

    if (logoTextElement) logoTextElement.style.color = color;

    document.body.style.overflow = isOpen ? 'hidden' : '';
});

mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        hamburgerBtn.querySelector('i').className = 'fa-solid fa-bars';
        document.body.style.overflow = '';
    });
});

// --- CAROSELLO EVENTS ---
prevBtn.addEventListener('click', () => {
    if (posizioneCorrenteCarosello > 0) {
        posizioneCorrenteCarosello--;
        aggiornaCarosello();
    }
});

nextBtn.addEventListener('click', () => {
    const max = Math.ceil(tuttiGliElementi.length / ELEMENTI_PER_BLOCCO) - 1;

    if (posizioneCorrenteCarosello < max) {
        posizioneCorrenteCarosello++;
        aggiornaCarosello();
    }
});

// resize optimized
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);

    resizeTimeout = setTimeout(() => {
        posizioneCorrenteCarosello = 0;
        initLayoutCache();
        aggiornaCarosello();
    }, 150);
});

// --- LIGHTBOX EVENTS ---
galleriaContainer.addEventListener('click', (e) => {
    const item = e.target.closest('.galleria-item');
    if (!item) return;

    mostraElementoInLightbox(+item.dataset.index);
    lightboxOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
});

lightboxCloseBtn.addEventListener('click', () => {
    lightboxOverlay.style.display = 'none';
    document.body.style.overflow = '';

    const video = lightboxMediaContainer.querySelector('video');
    if (video) {
        video.pause();
        video.currentTime = 0;
    }
});

lightboxPrevBtn.addEventListener('click', () => {
    mostraElementoInLightbox(posizioneCorrenteLightbox - 1);
});

lightboxNextBtn.addEventListener('click', () => {
    mostraElementoInLightbox(posizioneCorrenteLightbox + 1);
});

lightboxOverlay.addEventListener('click', (e) => {
    if (e.target === lightboxOverlay) {
        lightboxCloseBtn.click();
    }
});

// --- START ---
inizializzaGalleria();