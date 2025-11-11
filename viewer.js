document.addEventListener("DOMContentLoaded", () => {
    const imageContainer = document.getElementById("image-wrapper");
    const controls = document.getElementById("controls");
    const selectAllButton = document.getElementById("select-all");
    const deselectAllButton = document.getElementById("deselect-all");
    const themeSwitch = document.getElementById('theme-switch');
    const languageSelector = document.getElementById('language');
    const i18nElements = document.querySelectorAll('[data-i18n]');

    const translations = {
        en: {
            languageLabel: "Language:",
            colorsTitle: "Colors",
            selectAll: "Select All",
            deselectAll: "Deselect All",
            visualizationTitle: "Image Viewer"
        },
        es: {
            languageLabel: "Idioma:",
            colorsTitle: "Colores",
            selectAll: "Seleccionar todos",
            deselectAll: "Deseleccionar todos",
            visualizationTitle: "Visualizador de imagen"
        },
        fr: {
            languageLabel: "Langue:",
            colorsTitle: "Couleurs",
            selectAll: "Tout sélectionner",
            deselectAll: "Tout désélectionner",
            visualizationTitle: "Visionneuse d'image"
        },
        de: {
            languageLabel: "Sprache:",
            colorsTitle: "Farben",
            selectAll: "Alle auswählen",
            deselectAll: "Alle abwählen",
            visualizationTitle: "Bildbetrachter"
        },
        it: {
            languageLabel: "Lingua:",
            colorsTitle: "Colori",
            selectAll: "Seleziona tutto",
            deselectAll: "Deseleziona tutto",
            visualizationTitle: "Visualizzatore immagine"
        },
        pt: {
            languageLabel: "Idioma:",
            colorsTitle: "Cores",
            selectAll: "Selecionar todos",
            deselectAll: "Desmarcar todos",
            visualizationTitle: "Visualizador de imagem"
        }
    };

    function updateTranslations(lang) {
        i18nElements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang]?.[key]) {
                el.textContent = translations[lang][key];
            }
        });
    }

    languageSelector.addEventListener('change', (e) => {
        updateTranslations(e.target.value);
    });

    themeSwitch.addEventListener('change', () => {
        const isDark = themeSwitch.checked;
        document.body.classList.toggle('dark-mode', isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    const userLang = navigator.language.slice(0, 2);
    if (translations[userLang]) {
        languageSelector.value = userLang;
    }
    updateTranslations(languageSelector.value);

    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        themeSwitch.checked = true;
    }

    fetch("generate_image_list.json")
        .then(response => response.json())
        .then(data => {
            data.forEach((file, index) => {
                const img = new Image();
                img.src = `generate/${file}`;
                img.id = `img${index}`;
                img.classList.add("image-layer");

                // Detectar si es "Color 00.png"
                const isBaseImage = file.toLowerCase().includes("color 00.png");
                if (isBaseImage) {
                    img.classList.add("image-with-bg");
                }

                imageContainer.appendChild(img);

                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.id = `checkbox${index}`;

                const label = document.createElement("label");
                label.htmlFor = checkbox.id;
                label.innerText = getDisplayName(file);

                const div = document.createElement("div");
                div.appendChild(checkbox);
                div.appendChild(label);
                controls.appendChild(div);

                checkbox.addEventListener("change", () => {
                    img.style.display = checkbox.checked ? "block" : "none";
                });
            });
        });

    function getDisplayName(filename) {
        const match = filename.match(/Color (\d+)\.png/i);
        if (match) {
            return match[1] === "00" ? '🖼️✏️◾' : `🖼️🎨${match[1]}`;
        }
        return filename;
    }

    selectAllButton.addEventListener("click", () => {
        controls.querySelectorAll("input[type='checkbox']").forEach(checkbox => {
            checkbox.checked = true;
            const img = document.getElementById(`img${checkbox.id.replace('checkbox', '')}`);
            if (img) img.style.display = "block";
        });
    });

    deselectAllButton.addEventListener("click", () => {
        controls.querySelectorAll("input[type='checkbox']").forEach(checkbox => {
            checkbox.checked = false;
            const img = document.getElementById(`img${checkbox.id.replace('checkbox', '')}`);
            if (img) img.style.display = "none";
        });
    });

    // ===== ZOOM Y PANEO EN image-wrapper =====
    let zoom = 1;
    let panX = 0;
    let panY = 0;
    let isDragging = false;
    let startX, startY;

    imageContainer.addEventListener("wheel", (e) => {
        e.preventDefault();
        const delta = Math.sign(e.deltaY);
        zoom = Math.max(0.1, zoom - delta * 0.1);
        updateTransform();
    });

    imageContainer.addEventListener("mousedown", (e) => {
        isDragging = true;
        startX = e.clientX - panX;
        startY = e.clientY - panY;
        imageContainer.style.cursor = "grabbing";
    });

    window.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        panX = e.clientX - startX;
        panY = e.clientY - startY;
        updateTransform();
    });

    window.addEventListener("mouseup", () => {
        isDragging = false;
        imageContainer.style.cursor = "default";
    });

    function updateTransform() {
        const images = imageContainer.querySelectorAll("img");
        images.forEach(img => {
            if (img.style.display !== "none") {
                img.style.transform = `translate(-50%, -50%) scale(${zoom}) translate(${panX / zoom}px, ${panY / zoom}px)`;
            }
        });
    }
});
