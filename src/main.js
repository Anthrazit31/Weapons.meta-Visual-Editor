import './style.css';
import { setupEventListeners } from './uiRenderer.js';

document.querySelector('#app').innerHTML = `
  <div class="dashboard-container">
    <header class="app-header">
      <div class="logo-area">
        <h1>WEAPONS<span class="highlight">.META</span> <span class="subtitle">VISUAL EDITOR</span></h1>
      </div>
      <div class="actions">
        <label for="file-upload" class="btn btn-primary">
            <span class="icon">📂</span> LOAD FILE
        </label>
        <input type="file" id="file-upload" accept=".meta,.xml" multiple style="display: none;" />
        <button id="save-btn" class="btn btn-secondary" style="margin-left: 10px;">
            <span class="icon">💾</span> SAVE
        </button>
      </div>
    </header>

    <main class="main-layout three-column-layout">
        <!-- LEFT: Primary Weapon Control -->
        <aside class="sidebar left-sidebar">
            <div class="sidebar-header">
                <label>Primary Weapon</label>
                <select id="weapon-select" class="compact-select" disabled>
                    <option value="">No File Loaded</option>
                </select>
            </div>
            <div id="primary-editor" class="accordion-container"></div>
        </aside>

        <!-- CENTER: Visualization -->
        <section class="center-content">
            <!-- Damage Analysis Chart (Top) -->
            <div class="chart-container-large">
                <canvas id="damageAnalysisChart"></canvas>
            </div>

            <!-- TTK Chart -->
            <div class="chart-container-large">
                <canvas id="ttkChart"></canvas>
            </div>
            
            <!-- Env Controls (Health/Armor Sliders) -->
            <div class="env-controls-panel" id="env-controls">
                <!-- Injected via JS -->
            </div>

            <!-- Comparison Stats -->
            <div class="comparison-grid" id="comparison-stats">
                 <!-- Injected via JS -->
            </div>
        </section>

        <!-- RIGHT: Comparison Weapon Control -->
        <aside class="sidebar right-sidebar">
             <div class="sidebar-header">
                <label>Comparison Weapon</label>
                <select id="compare-select" class="compact-select" disabled>
                    <option value="">None</option>
                </select>
            </div>
            <div id="compare-editor" class="accordion-container"></div>
        </aside>
    </main>
  </div>
`;

setupEventListeners();
