import { parseWeaponXML, generateWeaponXML } from './xmlParser.js';
import Chart from 'chart.js/auto';

let weaponsData = [];
let currentWeapon = null;
let compareWeapon = null;
let editingWeapon = 'primary'; // 'primary' or 'compare'

let damageAnalysisChart = null;
let ttkChart = null;

// Simulation State
let simTargetHealth = 100;
let simTargetArmor = 100;

export function setupEventListeners() {
    const fileInput = document.getElementById('file-upload');
    const weaponSelect = document.getElementById('weapon-select');
    const compareSelect = document.getElementById('compare-select');
    const saveBtn = document.getElementById('save-btn');

    // Toggle Buttons
    const btnEditPrimary = document.getElementById('edit-primary-btn');
    const btnEditCompare = document.getElementById('edit-compare-btn');

    if (fileInput) fileInput.addEventListener('change', handleFileUpload);

    if (weaponSelect) {
        weaponSelect.addEventListener('change', (e) => {
            currentWeapon = weaponsData.find(w => w.name === e.target.value) || null;
            renderPrimaryEditor();
            updateAll();
        });
    }

    if (compareSelect) {
        compareSelect.addEventListener('change', (e) => {
            compareWeapon = weaponsData.find(w => w.name === e.target.value) || null;
            renderCompareEditor();
            updateAll();
        });
    }

    if (btnEditPrimary) {
        btnEditPrimary.addEventListener('click', () => {
            editingWeapon = 'primary';
            btnEditPrimary.classList.add('active');
            btnEditCompare.classList.remove('active');
            renderEditor();
        });
    }

    if (btnEditCompare) {
        btnEditCompare.addEventListener('click', () => {
            editingWeapon = 'compare';
            btnEditCompare.classList.add('active');
            btnEditPrimary.classList.remove('active');
            renderEditor();
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            if (weaponsData.length === 0) {
                alert("No data to save.");
                return;
            }
            const xmlString = generateWeaponXML(weaponsData);
            const blob = new Blob([xmlString], { type: 'text/xml' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'weapons.meta';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }
}

async function handleFileUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (const file of files) {
        const text = await file.text();
        const parsed = parseWeaponXML(text);
        if (parsed && parsed.length > 0) {
            weaponsData = [...weaponsData, ...parsed];
        }
    }
    weaponsData.sort((a, b) => a.name.localeCompare(b.name));
    populateSelects();

    if (weaponsData.length > 0) {
        currentWeapon = weaponsData[0];
        document.getElementById('weapon-select').value = currentWeapon.name;
        updateAll();
        renderPrimaryEditor();
    }
}

function populateSelects() {
    const pSelect = document.getElementById('weapon-select');
    const cSelect = document.getElementById('compare-select');

    pSelect.innerHTML = '<option value="">Select Weapon</option>';
    cSelect.innerHTML = '<option value="">None</option>';

    pSelect.disabled = false;
    cSelect.disabled = false;

    weaponsData.forEach(w => {
        const name = w.name.replace('WEAPON_', '');
        const optP = document.createElement('option');
        optP.value = w.name;
        optP.textContent = name;
        pSelect.appendChild(optP);

        const optC = document.createElement('option');
        optC.value = w.name;
        optC.textContent = name;
        cSelect.appendChild(optC);
    });
}


function updateAll() {
    renderEnvControls();
    renderComparisonStats();
    initCharts();
}

function renderComparisonStats() {
    const container = document.getElementById('comparison-stats');
    if (!container) return;

    if (!currentWeapon) {
        container.innerHTML = '<div style="color:var(--text-muted);text-align:center;padding:1rem">Select a Primary Weapon to view stats</div>';
        return;
    }

    const getStats = (w) => {
        if (!w) return null;
        const rpm = w.timeBetweenShots > 0 ? (60 / w.timeBetweenShots) : 0;
        const dpsBody = w.damage * (rpm / 60);
        const headMult = w.headShotDamageModifier || 1.0;
        const dpsHead = dpsBody * headMult;

        const totalHP = simTargetHealth + simTargetArmor;
        const btkBody = Math.ceil(totalHP / w.damage);
        const ttkBody = (btkBody - 1) * w.timeBetweenShots;

        const dmgHead = w.damage * headMult;
        const btkHead = Math.ceil(totalHP / dmgHead);
        const ttkHead = (btkHead - 1) * w.timeBetweenShots;

        return { rpm, dpsBody, dpsHead, btkBody, ttkBody, btkHead, ttkHead };
    };

    const s1 = getStats(currentWeapon);
    const s2 = getStats(compareWeapon);

    const row = (label, v1, v2, unit = '', isTime = false) => {
        const val1 = v1 !== null ? (isTime ? v1.toFixed(3) : v1.toFixed(1)) + unit : '-';
        const val2 = v2 !== null ? (isTime ? v2.toFixed(3) : v2.toFixed(1)) + unit : '-';
        return `
            <div class="comp-row">
                <span class="comp-label">${label}</span>
                <span class="comp-val primary">${val1}</span>
                <span class="comp-val compare">${val2}</span>
            </div>
        `;
    };

    // Header for columns
    let html = `
        <div class="comp-row" style="border-bottom:1px solid var(--border-light)">
            <span class="comp-label">METRIC</span>
            <span class="comp-label" style="text-align:right;color:var(--accent-primary)">${currentWeapon.name.replace('WEAPON_', '').substring(0, 8)}</span>
            <span class="comp-label" style="text-align:right;color:var(--accent-success)">${compareWeapon ? compareWeapon.name.replace('WEAPON_', '').substring(0, 8) : '---'}</span>
        </div>
    `;

    html += row('Rate of Fire', s1.rpm, s2 ? s2.rpm : null, ' RPM');
    html += row('DPS (Body)', s1.dpsBody, s2 ? s2.dpsBody : null);
    html += row('DPS (Head)', s1.dpsHead, s2 ? s2.dpsHead : null);
    html += '<div style="height:10px"></div>'; // spacer
    html += row('BTK (Body)', s1.btkBody, s2 ? s2.btkBody : null);
    html += row('TTK (Body)', s1.ttkBody, s2 ? s2.ttkBody : null, 's', true);
    html += row('BTK (Head)', s1.btkHead, s2 ? s2.btkHead : null);
    html += row('TTK (Head)', s1.ttkHead, s2 ? s2.ttkHead : null, 's', true);

    container.innerHTML = html;
}

function renderEnvControls() {
    const container = document.getElementById('env-controls');
    if (!container) return;

    // If components already exist, just ensure handlers are attached or values synced, 
    // but DO NOT overwrite innerHTML to avoid killing the drag event.
    if (container.querySelector('.slider-health')) {
        return;
    }

    container.innerHTML = `
        <div class="slider-group">
            <div class="slider-header">
                <span class="text-success">Target Health</span>
                <span class="slider-val health-val">${simTargetHealth}%</span>
            </div>
            <input type="range" class="slider slider-health" min="0" max="100" value="${simTargetHealth}" oninput="updateHealth(this.value)">
        </div>
        
        <div class="slider-group">
            <div class="slider-header">
                 <span class="text-info">Target Armor</span>
                <span class="slider-val armor-val">${simTargetArmor}%</span>
            </div>
            <input type="range" class="slider slider-armor" min="0" max="100" value="${simTargetArmor}" oninput="updateArmor(this.value)">
        </div>
    `;

    window.updateHealth = (v) => {
        simTargetHealth = parseInt(v);
        const el = container.querySelector('.health-val');
        if (el) el.textContent = simTargetHealth + '%';

        // Update only necessary parts
        renderComparisonStats();
        initCharts();
    };

    window.updateArmor = (v) => {
        simTargetArmor = parseInt(v);
        const el = container.querySelector('.armor-val');
        if (el) el.textContent = simTargetArmor + '%';

        renderComparisonStats();
        initCharts();
    };
}

function renderPrimaryEditor() {
    renderSpecificEditor(currentWeapon, 'primary-editor');
}

function renderCompareEditor() {
    renderSpecificEditor(compareWeapon, 'compare-editor');
}

function renderSpecificEditor(weapon, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!weapon) {
        container.innerHTML = '<div style="padding:1rem;color:var(--text-muted);font-style:italic;font-size:0.9rem">No weapon selected.</div>';
        return;
    }

    container.innerHTML = '';

    const categories = [
        {
            id: 'core-stats',
            title: 'Core Stats',
            fields: [
                { key: 'damage', label: 'Damage', type: 'number', step: 1 },
                { key: 'timeBetweenShots', label: 'Time Between Shots (s)', type: 'number', step: 0.01 },
                { key: 'clipSize', label: 'Clip Size', type: 'number', step: 1 }
            ]
        },
        {
            id: 'range-falloff',
            title: 'Range & Falloff',
            fields: [
                { key: 'weaponRange', label: 'Max Range (m)', type: 'number', step: 10 },
                { key: 'damageFallOffRangeMin', label: 'Falloff Start (m)', type: 'number', step: 5 },
                { key: 'damageFallOffRangeMax', label: 'Falloff End (m)', type: 'number', step: 5 },
                { key: 'damageFallOffModifier', label: 'Falloff Min Dmg Modifier', type: 'number', step: 0.1 }
            ]
        },
        {
            id: 'advanced',
            title: 'Advanced Modifiers',
            fields: [
                { key: 'headShotDamageModifier', label: 'Headshot Multiplier', type: 'number', step: 0.1 },
                { key: 'armorDamageModifier', label: 'Armor Damage Multiplier', type: 'number', step: 0.05 },
                { key: 'limbDamageModifier', label: 'Limb Damage Multiplier', type: 'number', step: 0.05 },
                { key: 'minHeadShotDistance', label: 'Min Headshot Distance (m)', type: 'number', step: 1 },
                { key: 'maxHeadShotDistance', label: 'Max Headshot Distance (m)', type: 'number', step: 10 }
            ]
        }
    ];

    categories.forEach((cat, index) => {
        const details = document.createElement('details');
        details.className = 'editor-accordion';
        details.open = index < 3;

        const summary = document.createElement('summary');
        summary.textContent = cat.title;
        details.appendChild(summary);

        const content = document.createElement('div');
        content.className = 'accordion-content';

        cat.fields.forEach(field => {
            const wrapper = document.createElement('div');
            wrapper.className = 'input-group';

            const label = document.createElement('label');
            label.textContent = field.label;

            const input = document.createElement('input');
            input.type = field.type;
            input.step = field.step;
            input.value = weapon[field.key] !== undefined ? weapon[field.key] : '';
            input.className = 'editor-input';

            input.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) {
                    weapon[field.key] = val;
                    updateAll();
                }
            });

            wrapper.appendChild(label);
            wrapper.appendChild(input);
            content.appendChild(wrapper);
        });

        details.appendChild(content);
        container.appendChild(details);
    });
}
// Variables declared at top of file, no need to redeclare here


function initCharts() {
    if (!currentWeapon) return;

    if (damageAnalysisChart) damageAnalysisChart.destroy();
    if (ttkChart) ttkChart.destroy();

    // Prepare Data
    const totalHP = simTargetHealth + simTargetArmor;
    const maxDist = Math.max(
        currentWeapon.weaponRange,
        currentWeapon.damageFallOffRangeMax + 50,
        compareWeapon ? compareWeapon.weaponRange : 0
    );

    const labels = [];
    const step = 10;

    const getDataPoints = (w) => {
        const ptsBody = [];
        const ptsHead = [];
        const ptsLimb = [];

        const headMult = w.headShotDamageModifier || 1.0;
        const limbMult = w.limbDamageModifier || 1.0;

        for (let d = 0; d <= maxDist; d += step) {
            if (d % 50 === 0 && labels.length <= maxDist / 50) labels.push(d);

            // Base Damage calc (Falloff)
            let baseDmg = w.damage;
            if (d > w.damageFallOffRangeMin) {
                if (d >= w.damageFallOffRangeMax) {
                    baseDmg = w.damage * w.damageFallOffModifier;
                } else {
                    const rangeDiff = w.damageFallOffRangeMax - w.damageFallOffRangeMin;
                    const progress = (d - w.damageFallOffRangeMin) / rangeDiff;
                    const dmgDiff = (w.damage * w.damageFallOffModifier) - w.damage;
                    baseDmg = w.damage + (dmgDiff * progress);
                }
            }

            ptsBody.push({ x: d, y: baseDmg });
            ptsHead.push({ x: d, y: baseDmg * headMult });
            ptsLimb.push({ x: d, y: baseDmg * limbMult });
        }
        return { body: ptsBody, head: ptsHead, limb: ptsLimb };
    };

    const pData = getDataPoints(currentWeapon);
    const cData = compareWeapon ? getDataPoints(compareWeapon) : null;

    // --- DAMAGE ANALYSIS CHART ---
    const ctxDmg = document.getElementById('damageAnalysisChart').getContext('2d');
    const datasets = [
        // Primary
        {
            label: 'Body Damage',
            data: pData.body,
            borderColor: '#3b82f6', // Blue
            backgroundColor: 'transparent',
            borderWidth: 3,
            tension: 0.3,
            pointRadius: 0
        },
        {
            label: 'Head Damage',
            data: pData.head,
            borderColor: '#ef4444', // Red
            backgroundColor: 'transparent',
            borderWidth: 3,
            tension: 0.3,
            pointRadius: 0
        },
        {
            label: 'Limb Damage',
            data: pData.limb,
            borderColor: '#eab308', // Yellow
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.3,
            pointRadius: 0
        }
    ];

    if (cData) {
        datasets.push(
            {
                label: 'Compare Body',
                data: cData.body,
                borderColor: '#60a5fa', // Lighter Blue
                borderDash: [2, 2],
                borderWidth: 2,
                pointRadius: 0
            },
            {
                label: 'Compare Head',
                data: cData.head,
                borderColor: '#f87171', // Lighter Red
                borderDash: [2, 2],
                borderWidth: 2,
                pointRadius: 0
            }
        );
    }

    damageAnalysisChart = new Chart(ctxDmg, {
        type: 'line',
        data: { datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                title: { display: true, text: 'Damage Analysis', align: 'start', font: { size: 16 }, color: '#fff' },
                legend: { labels: { color: '#9ca3af' } },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                x: { type: 'linear', title: { display: true, text: 'Distance (m)' }, grid: { color: '#333' } },
                y: { title: { display: true, text: 'Damage' }, grid: { color: '#333' }, beginAtZero: true }
            }
        }
    });

    // --- TTK CHART --- (Reuse logic but with updated calls)
    const getTTK = (dmgPoints, w) => {
        return dmgPoints.map(p => {
            const btk = Math.ceil(totalHP / p.y);
            const ttk = (btk - 1) * w.timeBetweenShots;
            return { x: p.x, y: ttk };
        });
    };

    const pTTK = getTTK(pData.body, currentWeapon); // TTK based on Body
    const cTTK = cData ? getTTK(cData.body, compareWeapon) : [];

    const ctxTtk = document.getElementById('ttkChart').getContext('2d');
    ttkChart = new Chart(ctxTtk, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: `Primary TTK (${totalHP} HP)`,
                    data: pTTK,
                    borderColor: '#00f3ff', // Cyan
                    backgroundColor: 'rgba(0, 243, 255, 0.1)',
                    borderWidth: 2,
                    stepped: true,
                    fill: 'origin'
                },
                ...(cData ? [{
                    label: 'Compare TTK',
                    data: cTTK,
                    borderColor: '#bc13fe', // Purple
                    borderDash: [5, 5],
                    stepped: true
                }] : [])
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                title: { display: true, text: `Time-To-Kill (${totalHP} HP)`, align: 'start', font: { size: 16 }, color: '#fff' },
                legend: { position: 'top', labels: { color: '#9ca3af' } }
            },
            scales: {
                x: { type: 'linear', grid: { color: '#333' } },
                y: { title: { display: true, text: 'Seconds' }, grid: { color: '#333' }, beginAtZero: true }
            }
        }
    });
}
