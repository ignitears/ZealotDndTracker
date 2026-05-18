# TTRPG Character Card Dashboard

A simple, feature-rich character sheet web application built for tabletop role-playing games. This system allows players to track primary attributes, manage combat vitals, scale dynamic skills, and switch between customized UI themes effortlessly.

## Core Features

* **Dynamic Math Engine:** Automatically recalculates derived statistics (Max HP, Mana, Insanity, damage reductions, and spell discounts) in real-time as stats change.
* **Multi-Profile Tracking:** Easily create, switch, and delete individual character slots. Includes safe text handling to protect special naming symbols and symbols from state corruption.
* **Combat Rest Options:** Features one-click buttons for Short Rests (recovers 25% of pools) and Long Rests (restores pools to full maximums) that sync instantly with storage.
* **Adaptive Aesthetic Themes:** Choose between Default Dark, Cyber Futuristic, and Proxy Terminal layouts. Themes seamlessly mutate UI shapes, borders, and interactive dice button clip-paths.
* **Complete Inventory & Skill Trees:** Add, modify, or purge active skills, magical spells, stat-modifying rows, and inventory items dynamically.
* **JSON Backup Controls:** Import and export your entire local storage character sheet array as a clean data file for portability.

## Project Structure

* `index.html` — The main structural dashboard layout containing profile boxes, vital bars, navigation tabs, and system modals.
* `style.css` — High-performance responsive layouts built with modern CSS custom variables, custom animations, text-selection blocks, and theme clip-paths.
* `script.js` — Core functional logic managing local storage data binding, profile switches, dynamic mathematical scaling, and interactive dice roll sequences.

## Getting Started

1. Download or clone the project files (`index.html`, `style.css`, `script.js`) into a common folder.
2. Double-click or open the `index.html` file inside any modern web browser.
3. No external servers, compilations, or dependency installations are required. All data saves automatically to your web browser's secure LocalStorage space.
