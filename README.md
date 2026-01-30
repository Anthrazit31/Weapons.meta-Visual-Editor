# Weapons.Meta Visualizer 🎯

> **The ultimate visual editing tool for FiveM & GTA V Weapon Meta files.**

**Weapons.Meta Visualizer** transforms the complex task of balancing weapon statistics into an intuitive, visual experience. Forget editing thousands of lines of XML text blindly; optimize your server's gunplay with real-time feedback, interactive charts, and powerful comparison tools.


<div align="center">
  <img src="https://i.imgur.com/DKWgC3e.png" width="48%" alt="Visual Editor Preview 1" />
  <img src="https://i.imgur.com/M9ACY3U.png" width="48%" alt="Visual Editor Preview 2" />
</div>

## 🌟 Key Features

### 📊 Real-Time Visualization
Instantly see how your changes affect the weapon's performance. The tool renders simplified graphs for:
*   **Damage Falloff**: Visualize perfectly how damage drops over distance.
*   **Time-To-Kill (TTK)**: Calculate exactly how fast a weapon kills at any range.
*   **Damage Analysis**: Differentiate between Body, Head, and Limb damage curves.

### ⚔️ Side-by-Side Comparison
Never balance in a vacuum again. Select a **Primary Weapon** and a **Comparison Weapon** to view their stats, recoil, and damage curves overlaid on the same charts. Instantly spot which weapon is overpowered or underpowered.

### 🎯 Live Simulation
Adjust **Target Health** and **Target Armor** sliders dynamically. See exactly how many bullets it takes to kill a standard player versus a max-armor juggernaut in real-time.

### 🛠️ Comprehensive Editor
Modify every crucial aspect of the weapon meta directly from the UI:
*   **Core Stats**: Damage, Fire Rate, Clip Size.
*   **Range Mechanics**: Max Range, Falloff Start/End, Minimum Damage Modifiers.
*   **Advanced Multipliers**: Headshot, Armor, and Limb damage multipliers.

### 💾 Seamless Import & Export
*   **Load**: Drag and drop your existing `weapons.meta` / `.xml` files.
*   **Save**: With one click, generate and download a valid, game-ready `weapons.meta` file containing all your changes.

---

## 🚀 Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (Version 14 or higher)
*   npm (included with Node.js)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/weapons-meta-visualizer.git
    cd weapons-meta-visualizer
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    ```

4.  **Open the App**
    Click the local URL shown in your terminal (usually `http://localhost:5173`) to open the editor in your browser.

---

## 🎮 How to Use

1.  **Load Data**: Click the `📂 LOAD FILE` button and select your `weapons.meta` file.
2.  **Select Weapons**:
    *   Use the **Left Sidebar** to select the specific weapon you want to edit.
    *   (Optional) Use the **Right Sidebar** to select a second weapon for comparison.
3.  **Analyze & Edit**:
    *   Observe the **Central Graphs** to understand current performance.
    *   Modify values in the sidebars. Charts update instantly as you type.
    *   Use the **Health/Armor Sliders** in the center to test different target scenarios.
4.  **Save**:
    *   Click `💾 SAVE` to download the updated file. Replace your server's existing file with this new one.

---

## 🛠️ Technologies Used

*   **Vite**: For lightning-fast development and building.
*   **Chart.js**: For rendering beautiful, responsive, and interactive data visualizations.
*   **Vanilla JavaScript (ES6+)**: High-performance logic without the overhead of heavy frameworks.
*   **CSS3**: Modern, responsive dark-mode styling.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/yourusername/weapons-meta-visualizer/issues).

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

*Made with AI for the FiveM & GTA V Modding Community.*
