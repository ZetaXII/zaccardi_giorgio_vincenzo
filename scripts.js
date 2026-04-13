// --- CONFIGURAZIONE ---
const NUMERO_MAX_IMMAGINI = 55;
const NUMERO_MAX_VIDEO = 1;
const ELEMENTI_PER_BLOCCO = 5;
const BASE_PATH = "images/foto_lavori/";

// --- Variabili DOM e Stato ---
const galleriaContainer = document.getElementById('galleria-lavori');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const lightboxOverlay = document.getElementById('lightboxOverlay');
const lightboxMediaContainer = document.getElementById('lightboxMediaContainer');
const lightboxCloseBtn = document.getElementById('lightboxClose');
const lightboxPrevBtn = document.getElementById('lightboxPrev');
const lightboxNextBtn = document.getElementById('lightboxNext');

// Variabili per il menu mobile
const hamburgerBtn = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobile-nav');
const logoTextElement = document.querySelector('.logo-text');

let posizioneCorrenteCarosello = 0;
let posizioneCorrenteLightbox = 0;
let tuttiGliElementi = [];

// --- FUNZIONI UTILITY (omesse per brevità, codice invariato) ---

/**
 * Funzione per mescolare un array (Algoritmo Fisher-Yates Shuffle).
 * @param {Array} array L'array da mescolare.
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Genera l'array completo dei percorsi di Immagini e Video.
 */
function generaElencoFile() {
    let elementi = [];

    // 1. Genera Immagini
    for (let i = 1; i <= NUMERO_MAX_IMMAGINI; i++) {
        elementi.push({
            src: `${BASE_PATH}${i}.jpg`,
            alt: `Progetto Idraulico/Irrigazione #${i}`,
            type: 'img'
        });
    }

    // 2. Genera Video
    for (let i = 1; i <= NUMERO_MAX_VIDEO; i++) {
        elementi.push({
            src: `${BASE_PATH}${i}.mp4`,
            alt: `Video Lavoro #${i}`,
            type: 'video'
        });
    }

    // 3. Mescola gli elementi (come richiesto)
    //shuffleArray(elementi);

    return elementi;
}

/**
 * Crea il codice HTML per un singolo elemento della galleria.
 * @param {Object} item L'oggetto contenente src, alt e type.
 * @param {number} index L'indice dell'elemento nell'array (utile per lightbox).
 */
function creaElementoHTML(item, index) {
    const itemHTML = document.createElement('div');
    itemHTML.className = 'galleria-item';
    itemHTML.dataset.index = index;

    if (item.type === 'img') {
        itemHTML.innerHTML = `<img src="${item.src}" alt="${item.alt}" loading="lazy">`;
    } else if (item.type === 'video') {
        itemHTML.className += ' video-item';
        itemHTML.innerHTML = `
                    <video controls preload="metadata" title="${item.alt}" poster="${item.src.replace('.mp4', '.jpg')}">
                        <source src="${item.src}" type="video/mp4">
                        Il tuo browser non supporta il tag video.
                    </video>
                `;
    }
    return itemHTML;
}

/**
 * Aggiorna la visualizzazione del carosello e sposta di un blocco intero (5 elementi).
 */
function aggiornaCarosello() {
    const itemElement = galleriaContainer.querySelector('.galleria-item');
    if (!itemElement) {
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        return;
    }

    const elementoLarghezza = itemElement.offsetWidth;
    const computedStyle = getComputedStyle(galleriaContainer);
    const gap = parseFloat(computedStyle.getPropertyValue('--gap-carosello')) || 20;

    const scorrimentoBloccoUnitario = elementoLarghezza + gap;
    const offset = posizioneCorrenteCarosello * scorrimentoBloccoUnitario * ELEMENTI_PER_BLOCCO;

    galleriaContainer.style.transform = `translateX(-${offset}px)`;

    prevBtn.disabled = posizioneCorrenteCarosello === 0;

    const indicePrimoNascosto = (posizioneCorrenteCarosello + 1) * ELEMENTI_PER_BLOCCO;
    nextBtn.disabled = indicePrimoNascosto >= tuttiGliElementi.length;
}

/**
 * Mostra l'elemento specifico nel lightbox e aggiorna lo stato dei bottoni.
 * @param {number} index L'indice dell'elemento da mostrare.
 */
function mostraElementoInLightbox(index) {
    if (index < 0 || index >= tuttiGliElementi.length) {
        return;
    }

    posizioneCorrenteLightbox = index;
    const item = tuttiGliElementi[posizioneCorrenteLightbox];

    lightboxMediaContainer.innerHTML = '';

    if (item.type === 'img') {
        const img = document.createElement('img');
        img.src = item.src;
        img.alt = item.alt;
        lightboxMediaContainer.appendChild(img);
    } else if (item.type === 'video') {
        const video = document.createElement('video');
        video.src = item.src;
        video.controls = true;
        video.autoplay = true;
        video.loop = true;
        video.muted = false;
        video.setAttribute('playsinline', '');
        video.poster = item.src.replace('.mp4', '.jpg');
        lightboxMediaContainer.appendChild(video);
    }

    lightboxPrevBtn.disabled = posizioneCorrenteLightbox === 0;
    lightboxNextBtn.disabled = posizioneCorrenteLightbox === tuttiGliElementi.length - 1;
}


/**
 * Inizializza la galleria, genera tutti gli elementi e li inserisce nel DOM.
 */
function inizializzaGalleria() {
    tuttiGliElementi = generaElencoFile();

    if (tuttiGliElementi.length === 0) {
        galleriaContainer.innerHTML = '<p style="text-align: center; width: 100%;">Nessun file trovato per la galleria. Verifica i nomi dei file e la cartella: images/foto_lavori/</p>';
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        return;
    }

    tuttiGliElementi.forEach((item, index) => {
        const elementoHTML = creaElementoHTML(item, index);
        galleriaContainer.appendChild(elementoHTML);
    });

    setTimeout(aggiornaCarosello, 100);
}

// --- GESTIONE EVENTI (Menu Mobile) ---
hamburgerBtn.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');

    // Aggiorna l'attributo ARIA (buona pratica di accessibilità)
    hamburgerBtn.setAttribute('aria-expanded', isOpen);

    // 1. Cambia l'icona (Hamburger <-> X)
    hamburgerBtn.querySelector('i').className = isOpen ? 'fa-solid fa-times' : 'fa-solid fa-bars';

    // 2. Cambia il colore dell'icona e del testo del logo (gestito parzialmente dal CSS, qui ci assicuriamo il colore)
    if (isOpen) {
        // Sull'apertura: l'icona e il testo diventano blu
        hamburgerBtn.style.color = 'var(--colore-primario)';
        if (logoTextElement) {
            logoTextElement.style.color = 'var(--colore-primario)';
        }
    } else {
        // Sulla chiusura: l'icona e il testo tornano bianchi
        hamburgerBtn.style.color = 'var(--colore-bianco)';
        if (logoTextElement) {
            logoTextElement.style.color = 'var(--colore-bianco)';
        }
    }

    // Blocca o sblocca lo scroll del body quando il menu è aperto/chiuso
    document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Chiudi il menu mobile quando si clicca su un link
mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        hamburgerBtn.querySelector('i').className = 'fa-solid fa-bars';
        document.body.style.overflow = '';

        // Assicurati che l'icona e il testo logo tornino bianchi alla chiusura
        hamburgerBtn.style.color = 'var(--colore-bianco)';
        if (logoTextElement) {
            logoTextElement.style.color = 'var(--colore-bianco)';
        }
    });
});


// --- GESTIONE EVENTI (Carosello Piccolo) ---

prevBtn.addEventListener('click', () => {
    if (posizioneCorrenteCarosello > 0) {
        posizioneCorrenteCarosello--;
        aggiornaCarosello();
    }
});

nextBtn.addEventListener('click', () => {
    const maxPosizione = Math.ceil(tuttiGliElementi.length / ELEMENTI_PER_BLOCCO) - 1;

    if (posizioneCorrenteCarosello < maxPosizione) {
        posizioneCorrenteCarosello++;
        aggiornaCarosello();
    }
});

window.addEventListener('resize', () => {
    posizioneCorrenteCarosello = 0;
    aggiornaCarosello();
});


// --- GESTIONE EVENTI (Lightbox Grande) ---

galleriaContainer.addEventListener('click', (event) => {
    const itemElement = event.target.closest('.galleria-item');
    if (itemElement) {
        const index = parseInt(itemElement.dataset.index);

        mostraElementoInLightbox(index);
        lightboxOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
});

lightboxCloseBtn.addEventListener('click', () => {
    lightboxOverlay.style.display = 'none';
    document.body.style.overflow = '';
    const videoInLightbox = lightboxMediaContainer.querySelector('video');
    if (videoInLightbox) {
        videoInLightbox.pause();
        videoInLightbox.currentTime = 0;
    }
});

// Navigazione frecce nel lightbox
lightboxPrevBtn.addEventListener('click', () => {
    if (posizioneCorrenteLightbox > 0) {
        mostraElementoInLightbox(posizioneCorrenteLightbox - 1);
    }
});

lightboxNextBtn.addEventListener('click', () => {
    if (posizioneCorrenteLightbox < tuttiGliElementi.length - 1) {
        mostraElementoInLightbox(posizioneCorrenteLightbox + 1);
    }
});


// Chiudi il lightbox cliccando fuori dal contenuto principale
lightboxOverlay.addEventListener('click', (event) => {
    // Verifica se il click è sull'overlay stesso
    if (event.target === lightboxOverlay) {
        lightboxCloseBtn.click();
    }
});


// --- AVVIO ---
inizializzaGalleria();