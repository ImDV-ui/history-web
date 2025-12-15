const app = document.getElementById('app');
const controls = document.getElementById('controls');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');

let allArticles = [];

async function loadData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading data:', error);
        app.innerHTML = '<p>Error cargando los artículos.</p>';
        return [];
    }
}

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function renderGrid(articles) {
    if (articles.length === 0) {
        app.innerHTML = '<p class="no-results">No se encontraron artículos.</p>';
        return;
    }

    const grid = document.createElement('div');
    grid.className = 'articles-grid';

    articles.forEach(article => {
        const card = document.createElement('div');
        card.className = 'card';
        card.onclick = () => window.location.href = `?id=${article.id}`;

        // Fixed: Use .png as verified in file system
        const imgPath = `${article.image}.png`;

        card.innerHTML = `
            <img src="${imgPath}" alt="${article.title}" class="card-image" onerror="this.src='https://via.placeholder.com/300'">
            <div class="card-content">
                <span class="card-date">${article.date}</span>
                <h3 class="card-title">${article.title}</h3>
            </div>
        `;
        grid.appendChild(card);
    });

    app.innerHTML = '';
    app.appendChild(grid);
}

function renderArticle(article) {
    const imgPath = `${article.image}.png`;

    app.innerHTML = `
        <a href="index.html" class="back-btn">&larr; Volver al inicio</a>
        <article class="article-detail">
            <header class="detail-header">
                <h1 class="detail-title">${article.title}</h1>
                <div class="detail-meta">
                    Por ${article.author} | ${article.date}
                </div>
            </header>
            <img src="${imgPath}" alt="${article.title}" class="detail-image" onerror="this.src='https://via.placeholder.com/800'">
            <div class="detail-body">
                ${article.content}
            </div>
        </article>
    `;
}

function filterAndSortArticles() {
    let filtered = [...allArticles];

    // Search
    const query = searchInput.value.toLowerCase();
    if (query) {
        filtered = filtered.filter(a =>
            a.title.toLowerCase().includes(query) ||
            a.author.toLowerCase().includes(query)
        );
    }

    // Sort
    const sortVal = sortSelect.value;
    filtered.sort((a, b) => {
        if (sortVal === 'date-desc') return new Date(b.date) - new Date(a.date);
        if (sortVal === 'date-asc') return new Date(a.date) - new Date(b.date);
        if (sortVal === 'title-asc') return a.title.localeCompare(b.title);
        if (sortVal === 'title-desc') return b.title.localeCompare(a.title);
        return 0;
    });

    renderGrid(filtered);
}

async function init() {
    allArticles = await loadData();
    const id = getQueryParam('id');

    if (id !== null) {
        // Detail view
        if (controls) controls.style.display = 'none'; // Hide controls in detail view
        const article = allArticles.find(a => a.id == id);
        if (article) {
            renderArticle(article);
        } else {
            app.innerHTML = '<p>Artículo no encontrado. <a href="index.html">Volver</a></p>';
        }
    } else {
        // Grid view
        if (controls) controls.style.display = 'flex'; // Show controls

        // Setup listeners
        if (searchInput) searchInput.addEventListener('input', filterAndSortArticles);
        if (sortSelect) sortSelect.addEventListener('change', filterAndSortArticles);

        // Initial render (default sort is usually date desc from json order, 
        // but we can force sort if needed. 
        // Let's force initial sort based on select default (date-desc)
        filterAndSortArticles();
    }
}

init();
