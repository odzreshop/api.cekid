document.addEventListener('DOMContentLoaded', () => {
    const apiListContainer = document.getElementById('api-list');
    const particleContainer = document.querySelector('.particle-container');
    const searchInput = document.getElementById('search-input');
    const categoryTabsContainer = document.getElementById('category-tabs');

    let allEndpointsData = [];

    function createParticles() {
        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particleContainer.appendChild(particle);
        }
    }

    function createCopyButton(textProvider) {
        const btn = document.createElement('button');
        btn.className = 'copy-btn';
        btn.type = 'button';
        btn.innerHTML = `
            <svg class="icon-copy" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/><path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zM-1 7a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1A.5.5 0 0 1-1 7zm2.5-.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5z"/></svg>
            <svg class="icon-check" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/></svg>
        `;
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(textProvider()).then(() => {
                btn.classList.add('copied');
                setTimeout(() => btn.classList.remove('copied'), 1500);
            });
        });
        return btn;
    }

    async function initializeApiTester() {
        try {
            const response = await fetch('/api/list-game-ids');
            const gameIdData = await response.json();
            
            const cekIdEndpoints = gameIdData.data
                .filter(ep => ep.name && !ep.slug.startsWith('test'))
                .map(ep => ({ ...ep }));

            const staticCategories = [
                { name: 'CEK BANK', endpoints: [{ name: 'Cek Rekening Bank', slug: 'cek-bank', endpoint: '/cekbank', query: '?bank_code=xxxx&account_number=xxxx' }] },
                { name: 'DOWNLOADER', endpoints: [
                    { name: 'TikTok Downloader', slug: 'download-tiktok', endpoint: '/api/download/tiktok', query: '?url=xxxx&apikey=freeApikey' },
                    { name: 'YouTube MP3', slug: 'download-ytmp3', endpoint: '/api/download/ytmp3', query: '?url=xxxx&apikey=freeApikey' },
                    { name: 'YouTube MP4', slug: 'download-ytmp4', endpoint: '/api/download/ytmp4', query: '?url=xxxx&apikey=freeApikey' }
                ]},
                { name: 'ORKUT', endpoints: [
                    { name: 'Orkut Login', slug: 'orkut-login', endpoint: '/api/tools/orderKuota/login', query: '?username=xxxx&password=xxxx&apikey=freeApikey' },
                    { name: 'Orkut Verify OTP', slug: 'orkut-verify', endpoint: '/api/tools/orderKuota/verifyOTP', query: '?username=xxxx&codeOTP=xxxx&apikey=freeApikey' }
                ]}
            ];

            allEndpointsData = [ { name: 'CEK ID GAME', endpoints: cekIdEndpoints }, ...staticCategories ];

            apiListContainer.innerHTML = '';
            categoryTabsContainer.innerHTML = '';
            allEndpointsData.forEach((category, index) => {
                if (category.endpoints.length === 0) return;

                const tab = document.createElement('div');
                tab.className = 'category-tab';
                tab.textContent = category.name;
                tab.dataset.categoryIndex = index;
                
                const contentWrapper = document.createElement('div');
                contentWrapper.className = 'category-content-wrapper';
                contentWrapper.dataset.categoryIndex = index;
                
                tab.addEventListener('click', () => {
                    document.querySelectorAll('.category-tab.active').forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('.category-content-wrapper.active').forEach(c => c.classList.remove('active'));

                    tab.classList.add('active');
                    contentWrapper.classList.add('active');

                    if (!contentWrapper.dataset.rendered) {
                        renderCategoryPlaceholders(contentWrapper, category.endpoints);
                        contentWrapper.dataset.rendered = "true";
                    }
                });

                categoryTabsContainer.appendChild(tab);
                apiListContainer.appendChild(contentWrapper);
            });
            
            if (categoryTabsContainer.children.length > 0) {
                categoryTabsContainer.children[0].click();
            }

            searchInput.addEventListener('input', handleSearch);

        } catch (error) {
            console.error('Failed to load endpoints:', error);
            apiListContainer.innerHTML = '<p style="color: red;">Error loading API endpoints.</p>';
        }
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const target = entry.target;
            if (entry.isIntersecting) {
                if (target.classList.contains('endpoint-placeholder')) {
                    const ep = JSON.parse(target.dataset.endpointData);
                    const endpointEl = renderEndpoint(ep);
                    target.replaceWith(endpointEl);
                    observer.observe(endpointEl);
                }
            } else {
                if (target.classList.contains('endpoint-container')) {
                    const ep = JSON.parse(target.dataset.endpointData);
                    const placeholder = document.createElement('div');
                    placeholder.className = 'endpoint-placeholder';
                    placeholder.dataset.endpointData = JSON.stringify(ep);
                    target.replaceWith(placeholder);
                    observer.observe(placeholder);
                }
            }
        });
    }, { rootMargin: "200px 0px 200px 0px" });

    function renderCategoryPlaceholders(contentContainer, endpoints) {
        endpoints.forEach(ep => {
            const placeholder = document.createElement('div');
            placeholder.className = 'endpoint-placeholder';
            placeholder.dataset.name = ep.name.toLowerCase();
            placeholder.dataset.endpointData = JSON.stringify(ep);
            contentContainer.appendChild(placeholder);
            observer.observe(placeholder);
        });
    }

    function renderEndpoint(ep) {
        const endpointContainer = document.createElement('div');
        endpointContainer.className = 'endpoint-container';
        endpointContainer.dataset.name = ep.name.toLowerCase();
        endpointContainer.dataset.endpointData = JSON.stringify(ep);

        const params = ep.query ? ep.query.substring(1).split('&').map(p => p.split('=')[0]).filter(Boolean) : [];
        const paramsHTML = params.map(paramName => {
            if (paramName === 'apikey') return '';
            return `
            <div class="field-container">
                <label for="param-${ep.slug}-${paramName}">${paramName.toUpperCase()}</label>
                <div class="input-group">
                    <input type="text" id="param-${ep.slug}-${paramName}" name="${paramName}" placeholder="Enter ${paramName}">
                </div>
            </div>`;
        }).join('');

        endpointContainer.innerHTML = `
            <div class="endpoint-header"><span class="method">GET</span><span class="path">${ep.name}</span><span class="arrow-icon">▼</span></div>
            <div class="endpoint-details">
                <div class="request-url-container"><label>REQUEST URL</label><div class="request-url-display"><pre></pre></div></div>
                ${paramsHTML}
                <button class="execute-btn"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M10.804 8 5 4.633v6.734L10.804 8zm.792-.696a.802.802 0 0 1 0 1.392l-6.363 3.692C4.713 12.69 4 12.345 4 11.692V4.308c0-.653.713-.998 1.233-.696l6.363 3.692z"/></svg>Execute</button>
                <div class="result-container"><div class="result-box"><div class="loader-wrapper"><div class="loader"><span></span><span></span><span></span></div></div><pre></pre></div></div>
            </div>`;
        
        const details = endpointContainer.querySelector('.endpoint-details');
        
        endpointContainer.querySelector('.endpoint-header').addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = endpointContainer.classList.contains('open');

            endpointContainer.parentElement.querySelectorAll('.endpoint-container.open').forEach(openEp => {
                if (openEp !== endpointContainer) {
                    openEp.classList.remove('open');
                    openEp.querySelector('.endpoint-details').style.maxHeight = null;
                }
            });

            endpointContainer.classList.toggle('open');
            details.style.maxHeight = isOpen ? null : `${details.scrollHeight}px`;
        });
        
        endpointContainer.querySelector('.execute-btn').addEventListener('click', e => { e.preventDefault(); handleExecute(endpointContainer); });

        endpointContainer.querySelectorAll('.input-group').forEach(group => {
            group.appendChild(createCopyButton(() => group.querySelector('input').value));
        });

        const resultBox = endpointContainer.querySelector('.result-box');
        resultBox.appendChild(createCopyButton(() => resultBox.querySelector('pre').textContent, true)).classList.replace('copy-btn', 'copy-result-btn');

        const requestUrlPre = endpointContainer.querySelector('.request-url-display pre');
        const requestUrlDisplay = endpointContainer.querySelector('.request-url-display');
        
        const getProxyUrl = () => {
            const queryParams = new URLSearchParams();
            endpointContainer.querySelectorAll('input[type="text"]').forEach(input => {
                if(input.value) queryParams.set(input.name, input.value);
            });
            if (ep.query && ep.query.includes('apikey=')) {
                queryParams.set('apikey', 'freeApikey');
            }
            return `${window.location.origin}${ep.endpoint}?${queryParams.toString()}`;
        };

        requestUrlDisplay.appendChild(createCopyButton(getProxyUrl));
        const updateRequestUrl = () => { requestUrlPre.textContent = getProxyUrl(); };
        endpointContainer.querySelectorAll('input[type="text"]').forEach(input => input.addEventListener('input', updateRequestUrl));
        updateRequestUrl();
        return endpointContainer;
    }

    async function handleExecute(container) {
        const executeBtn = container.querySelector('.execute-btn');
        const loader = container.querySelector('.loader-wrapper');
        const resultPre = container.querySelector('.result-box pre');
        const copyResultBtn = container.querySelector('.copy-result-btn');

        executeBtn.disabled = true;
        loader.style.display = 'flex';
        resultPre.textContent = '';
        copyResultBtn.style.display = 'none';

        const ep = JSON.parse(container.dataset.endpointData);
        const queryParams = new URLSearchParams();
        container.querySelectorAll('input[type="text"]').forEach(input => {
            if (input.value) queryParams.set(input.name, input.value);
        });
        if (ep.query && ep.query.includes('apikey=')) {
            queryParams.set('apikey', 'freeApikey');
        }
        
        const finalUrl = `${ep.endpoint}?${queryParams.toString()}`;

        try {
            const response = await fetch(finalUrl);
            const data = await response.json();
            resultPre.textContent = JSON.stringify(data, null, 2);
            copyResultBtn.style.display = 'flex';
        } catch (error) {
            resultPre.textContent = `Error: ${error.message}`;
        } finally {
            executeBtn.disabled = false;
            loader.style.display = 'none';
        }
    }

    function handleSearch(event) {
        const query = event.target.value.toLowerCase();
        document.querySelectorAll('.category-container').forEach(category => {
            const content = category.querySelector('.category-content');
            const header = category.querySelector('.category-header');
            const categoryIndex = category.dataset.categoryIndex;
            
            const matchingEndpoints = allEndpointsData[categoryIndex].endpoints.filter(ep => ep.name.toLowerCase().includes(query));

            const tab = document.querySelector(`.category-tab[data-category-index="${categoryIndex}"]`);
            if (tab) {
                tab.style.display = matchingEndpoints.length > 0 ? 'flex' : 'none';
            }

            if (content.dataset.rendered === "true") {
                 content.querySelectorAll('.endpoint-container, .endpoint-placeholder').forEach(container => {
                    const name = container.dataset.name;
                    container.style.display = name.includes(query) ? 'block' : 'none';
                });
            } else if (query && matchingEndpoints.length > 0 && !header.classList.contains('open')) {
                 header.click();
            }
        });
        
        const firstVisibleTab = document.querySelector('.category-tab[style*="display: flex"]');
        const activeTab = document.querySelector('.category-tab.active');
        if (query && firstVisibleTab && (!activeTab || activeTab.style.display === 'none')) {
            firstVisibleTab.click();
        }
    }

    createParticles();
    initializeApiTester();
});
