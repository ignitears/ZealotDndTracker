const statsData = {
    "Physical": ["STR", "Health", "Endurance", "Speed"],
    "Magic": ["Control", "Endurance", "Capacity", "Cast Speed"],
    "Charisma": ["Body", "Speech"],
    "Soul": ["STR", "Health", "Endurance", "Enchantments"],
    "Performance": ["Intellectual", "Wisdom", "Insanity", "Magic", "Physical"],
    "Instinct": ["Physical", "Magical", "Soul", "Charisma"]
};

const defaultMikeData = {
    "name": "Mike", "family-name": "?", "age": "42",
    "appearance": "180 cm guy, sharp-looking university professor, neat black hair and modern thin-framed glasses. He has a very serious, intense expression.",
    "personality": "Serious but can joke with close friends.",
    "backstory": "He’s a skillful university professor.",
    "hp-base": "100", "hp-current": "100", "hp-max": "100", "hp-regen": "5.0",
    "soul-hp-current": "10", "soul-hp-max": "10",
    "mana-base": "50", "mana-current": "50", "mana-max": "50", "mana-regen": "2.0",
    "insanity-base": "50", "insanity-current": "50", "insanity-max": "50", "insanity-regen": "1.0",
    "magic-lvl": "1", "magic-control": "4",
    "performance-lvl": "5", "performance-intellectual": "5", "performance-wisdom": "20"
};

const statContainer = document.getElementById('tab-stats');
let charList = JSON.parse(localStorage.getItem('dnd_char_list_v4')) || ['Mike'];
let prefix = "dnd_char_v4_" + (localStorage.getItem('dnd_active_char_v4') || 'Mike') + "_";

// Toggle Profile Details Drawer with rotating structural icon arrows
function toggleDetails() {
    const details = document.getElementById('profile-details');
    const arrow = document.getElementById('arrow-icon');
    
    details.classList.toggle('open');
    if (details.classList.contains('open')) {
        if (arrow) arrow.style.transform = 'rotate(180deg)';
    } else {
        if (arrow) arrow.style.transform = 'rotate(0deg)';
    }
}

// Generate Stat Cards Dynamically
for (const [branch, subStats] of Object.entries(statsData)) {
    const safeBranchId = branch.toLowerCase();
    let cardHtml = `
        <div class="card animate-card">
            <div class="card-header no-select">
                <h3>${branch}</h3>
                <div class="main-lvl">
                    <input type="number" id="${safeBranchId}-lvl" data-save="true" placeholder="0" max="100">
                </div>
            </div>`;
            
    subStats.forEach(sub => {
        const safeId = `${branch}-${sub}`.replace(/\s+/g, '-').toLowerCase();
        const inputType = sub === "Enchantments" ? "text" : "number";
        cardHtml += `
            <div class="input-group">
                <label class="no-select">${sub}</label>
                <input type="${inputType}" id="${safeId}" data-save="true">
            </div>`;
    });
    cardHtml += `</div>`;
    statContainer.innerHTML += cardHtml;
}

// Sync Main Headline Header Name Label
const nameInput = document.getElementById('name');
const headerName = document.getElementById('header-name');
nameInput.addEventListener('input', (e) => {
    headerName.textContent = e.target.value || '?';
});

// --- Advanced Math Calculation Scaling Engine ---
function calculateDynamicStats() {
    const hpBase = parseInt(document.getElementById('hp-base')?.value) || 100;
    const manaBase = parseInt(document.getElementById('mana-base')?.value) || 50;
    const insanityBase = parseInt(document.getElementById('insanity-base')?.value) || 50;

    const physStr = parseInt(document.getElementById('physical-str')?.value) || 0;
    const physHealth = parseInt(document.getElementById('physical-health')?.value) || 0;
    const physEnd = parseInt(document.getElementById('physical-endurance')?.value) || 0;
    const physSpeed = parseInt(document.getElementById('physical-speed')?.value) || 0;
    
    const magControl = parseInt(document.getElementById('magic-control')?.value) || 0;
    const magEnd = parseInt(document.getElementById('magic-endurance')?.value) || 0;
    const magCap = parseInt(document.getElementById('magic-capacity')?.value) || 0;
    const magCastSpeed = parseInt(document.getElementById('magic-cast-speed')?.value) || 0;
    
    const soulStr = parseInt(document.getElementById('soul-str')?.value) || 0;
    const soulHealth = parseInt(document.getElementById('soul-health')?.value) || 0;
    const soulEnd = parseInt(document.getElementById('soul-endurance')?.value) || 0;
    
    const perfIntel = parseInt(document.getElementById('performance-intellectual')?.value) || 0;
    const perfWis = parseInt(document.getElementById('performance-wisdom')?.value) || 0;
    const perfInsan = parseInt(document.getElementById('performance-insanity')?.value) || 0;
    const perfMag = parseInt(document.getElementById('performance-magic')?.value) || 0;
    const perfPhys = parseInt(document.getElementById('performance-physical')?.value) || 0;

    const instPhys = parseInt(document.getElementById('instinct-physical')?.value) || 0;
    const instMag = parseInt(document.getElementById('instinct-magical')?.value) || 0;
    const instSoul = parseInt(document.getElementById('instinct-soul')?.value) || 0;
    const instChar = parseInt(document.getElementById('instinct-charisma')?.value) || 0;

    const wpnPhysBase = parseInt(document.getElementById('wpn-phys-base')?.value) || 0;
    const wpnMagBase = parseInt(document.getElementById('wpn-mag-base')?.value) || 0;
    const wpnSoulBase = parseInt(document.getElementById('wpn-soul-base')?.value) || 0;
    const wpnFlatPhys = parseInt(document.getElementById('wpn-flat-phys')?.value) || 0;
    const wpnFlatMag = parseInt(document.getElementById('wpn-flat-mag')?.value) || 0;
    const wpnFlatSoul = parseInt(document.getElementById('wpn-flat-soul')?.value) || 0;
    const wpnPctPhys = parseInt(document.getElementById('wpn-pct-phys')?.value) || 0;
    const wpnPctMag = parseInt(document.getElementById('wpn-pct-mag')?.value) || 0;
    const wpnPctSoul = parseInt(document.getElementById('wpn-pct-soul')?.value) || 0;

    let flatModifiers = { 'hp-max': 0, 'mana-max': 0, 'insanity-max': 0 };
    let pctModifiers = { 'hp-max': 0, 'mana-max': 0, 'insanity-max': 0 };

    document.querySelectorAll('.mod-row').forEach(row => {
        const target = row.querySelector('.mod-target').value;
        const type = row.querySelector('.mod-type').value;
        const val = parseInt(row.querySelector('.mod-value').value) || 0;
        if (target && val) {
            if (type === 'flat') flatModifiers[target] += val;
            else if (type === 'percent') pctModifiers[target] += val;
        }
    });

    const baseHpMax = hpBase + physEnd + soulEnd;
    const baseManaMax = manaBase + magCap;
    const baseInsanityMax = insanityBase + perfInsan;

    const finalHpMax = Math.floor((baseHpMax + flatModifiers['hp-max']) * (1 + pctModifiers['hp-max'] / 100));
    const finalManaMax = Math.floor((baseManaMax + flatModifiers['mana-max']) * (1 + pctModifiers['mana-max'] / 100));
    const finalInsanityMax = Math.floor((baseInsanityMax + flatModifiers['insanity-max']) * (1 + pctModifiers['insanity-max'] / 100));

    const hpRegenVal = (5 * (1 + physHealth / 100)).toFixed(2);
    const manaRegenVal = (2 * (1 + magEnd / 100)).toFixed(2);
    const insanityRegenVal = (1 * (1 + perfInsan / 100)).toFixed(2);

    if(document.getElementById('hp-base') && !document.getElementById('hp-base').value) document.getElementById('hp-base').value = hpBase;
    if(document.getElementById('mana-base') && !document.getElementById('mana-base').value) document.getElementById('mana-base').value = manaBase;
    if(document.getElementById('insanity-base') && !document.getElementById('insanity-base').value) document.getElementById('insanity-base').value = insanityBase;

    document.getElementById('hp-max').value = finalHpMax;
    document.getElementById('mana-max').value = finalManaMax;
    document.getElementById('insanity-max').value = finalInsanityMax;
    document.getElementById('hp-regen').value = hpRegenVal;
    document.getElementById('mana-regen').value = manaRegenVal;
    document.getElementById('insanity-regen').value = insanityRegenVal;

    const apBonus = Math.floor(physSpeed / 5);
    const manaDiscount = Math.floor(magControl / 5);
    const castDiscount = Math.floor(magCastSpeed / 5);
    const insanityReduction = Math.floor(perfInsan / 10);
    const dmgMultiplier = 1 + (perfIntel / 100);
    const totalPhysDR = ((physEnd + soulEnd) * 0.25).toFixed(2);

    if(document.getElementById('vital-initiative')) document.getElementById('vital-initiative').value = `+${apBonus}`;
    if(document.getElementById('vital-ap')) document.getElementById('vital-ap').value = 1 + apBonus;

    document.querySelectorAll('.ability-card').forEach(card => {
        const baseMana = parseInt(card.querySelector('.base-mana').value) || 0;
        const skillDmg = parseInt(card.querySelector('.base-dmg').value) || 0;
        const wpnPct = (parseInt(card.querySelector('.wpn-pct').value) || 0) / 100;
        const dmgType = card.querySelector('.ability-dmg-type').value;
        const baseCast = card.querySelector('.base-cast') ? parseInt(card.querySelector('.base-cast').value) || 0 : 0;

        let currentWpnBase = 0;
        let extraFlat = 0;
        let wpnPctBonus = 0;
        let statDmgBonus = 0;

        if (dmgType === 'physical') {
            currentWpnBase = wpnPhysBase;
            extraFlat = wpnFlatPhys;
            wpnPctBonus = wpnPctPhys;
            statDmgBonus = physStr;
        } else if (dmgType === 'magic') {
            currentWpnBase = wpnMagBase;
            extraFlat = wpnFlatMag;
            wpnPctBonus = wpnPctMag;
            statDmgBonus = magControl;
        } else if (dmgType === 'soul') {
            currentWpnBase = wpnSoulBase;
            extraFlat = wpnFlatSoul;
            wpnPctBonus = wpnPctSoul;
            statDmgBonus = soulStr;
        }

        const totalWpnDmg = (currentWpnBase * (1 + wpnPctBonus / 100)) * wpnPct;
        const calculatedDmg = Math.floor((totalWpnDmg + extraFlat + skillDmg + statDmgBonus) * dmgMultiplier);

        card.querySelector('.final-mana').textContent = Math.max(0, baseMana - manaDiscount);
        card.querySelector('.final-dmg').textContent = calculatedDmg;
        if (card.querySelector('.final-cast')) {
            card.querySelector('.final-cast').textContent = Math.max(0, baseCast - castDiscount);
        }
    });

    const nerdGrid = document.getElementById('nerd-grid');
    if (nerdGrid) {
        nerdGrid.innerHTML = `
            <div>
                <strong style="color: var(--hp-color)">RECOVERIES:</strong><br>
                HP Recovery = <strong>${hpRegenVal} per turn</strong> (+${physHealth}%)<br>
                MP Recovery = <strong>${manaRegenVal} per turn</strong> (+${magEnd}%)<br>
                Insanity Recovery = <strong>${insanityRegenVal} per turn</strong> (+${perfInsan}%)<br>
                Soul Recovery = <strong> ${(1 * (1 + soulHealth / 100)).toFixed(2)} per turn</strong> (+${soulHealth}%)
            </div>
            <div>
                <strong style="color: var(--accent)">ACTION & CASTING:</strong><br>
                Initiative = <strong>+${apBonus}</strong><br>
                Action point = <strong>${1 + apBonus}</strong> (+${apBonus} from Phy.Spd)<br>
                Mana Cost Decrease = <strong>-${manaDiscount}</strong> mana<br>
                Cast Speed = <strong>-${castDiscount} turn</strong> delay
            </div>
            <div>
                <strong style="color: #ff9800">RAW COMBAT MODS:</strong><br>
                Extra Physical Damage = <strong>+${physStr}</strong><br>
                Extra Magic Damage = <strong>+${magControl}</strong><br>
                Extra Soul Damage = <strong>+${soulStr}</strong><br>
                All Weapon Damage = <strong>+${perfIntel}%</strong><br>
                All Skill Damage = <strong>+${perfIntel}%</strong>
            </div>
            <div>
                <strong style="color: #e91e63">MITIGATIONS:</strong><br>
                Physical Damage Reduction = <strong>${totalPhysDR}%</strong><br>
                Soul Damage Reduction = <strong>0%</strong><br>
                Magic Damage Decrease = <strong>-${magEnd} damage</strong>
            </div>
            <div>
                <strong style="color: #00bcd4">HARDENED RESISTANCES:</strong><br>
                Disease resistance = <strong>+${physHealth}</strong><br>
                Immobilize type status resistance = <strong>+${physEnd + soulEnd}</strong><br>
                Magic status resistance = <strong>+${magEnd}</strong><br>
                Skill locking status resistance = <strong>+${Math.floor(magCap / 5)}</strong><br>
                Soul Status Resistance = <strong>+${soulHealth}</strong><br>
                Immobilize Status Resistance = <strong>+${physEnd + soulEnd}</strong>
            </div>
            <div>
                <strong style="color: #ffeb3b">DICE ROLL MODIFIERS:</strong><br>
                Bonus Magic Hit Check Roll = <strong>+${perfMag}</strong> (from Perf.Magic)<br>
                Bonus Magic Performance Roll = <strong>+${perfMag}</strong> (from Perf.Magic)<br>
                Bonus Physical Hit Check Roll = <strong>+${perfPhys}</strong> (from Perf.Phy)<br>
                Bonus Physical Performance Roll = <strong>+${perfPhys}</strong> (from Perf.Phy)<br>
                Physical Roll Die = <strong>+${instPhys}</strong> (from instincts)<br>
                Magic Roll Die = <strong>+${instMag}</strong> (from instincts)<br>
                Soul Roll Die = <strong>+${instSoul}</strong> (from instincts)<br>
                Charisma Roll Die = <strong>+${instChar}</strong> (from instincts)
            </div>
            <div>
                <strong style="color: #9e9e9e">MASTERY & GROWTH:</strong><br>
                All Weapon Mastery = <strong>+${perfIntel}%</strong><br>
                All Skill Exp = <strong>+${perfIntel}%</strong><br>
                Crafting Mastery = <strong>+${perfWis}%</strong>
            </div>
        `;
    }

    const dmCheck = document.getElementById('dm-check-details');
    if (dmCheck) {
        dmCheck.innerHTML = `
            <div>
                <strong style="color:var(--hp-color)">HP & Mitigations:</strong><br>
                Base (${hpBase}) + Phys End (${physEnd}) + Soul End (${soulEnd}) = ${baseHpMax} Baseline<br>
                Final Max HP: ${finalHpMax} | Regen: <strong>${hpRegenVal}/turn</strong><br>
                Physical DR: <strong>-${totalPhysDR}%</strong><br>
                Magic Mitigation: <strong>-${magEnd} flat damage</strong>
            </div>
            <div>
                <strong style="color:var(--mana-color)">Mana & Spell Discounts:</strong><br>
                Base (${manaBase}) + Magic Capacity (${magCap}) = ${baseManaMax} Baseline<br>
                Final Max Mana: ${finalManaMax} | Regen: <strong>${manaRegenVal}/turn</strong><br>
                Mana Discount Breakpoint: <strong>-${manaDiscount} cost</strong>
            </div>
            <div>
                <strong style="color:var(--insanity-color)">Insanity & Fortitude:</strong><br>
                Base (${insanityBase}) + Perf Insanity (${perfInsan}) = ${baseInsanityMax} Baseline<br>
                Final Max Insanity: ${finalInsanityMax} | Regen: <strong>${insanityRegenVal}/turn</strong><br>
                Insanity Absorption: <strong>-${insanityReduction} flat per hit</strong>
            </div>
            <div>
                <strong style="color:var(--accent)">Split Weapon Damage Formulas:</strong><br>
                Phys Base: ${wpnPhysBase} (+${wpnPctPhys}%) | Flat: +${wpnFlatPhys} | STR: +${physStr}<br>
                Mag Base: ${wpnMagBase} (+${wpnPctMag}%) | Flat: +${wpnFlatMag} | Control: +${magControl}<br>
                Soul Base: ${wpnSoulBase} (+${wpnPctSoul}%) | Flat: +${wpnFlatSoul} | Soul: +${soulStr}<br>
                Intellectual Skill Multiplier: <strong>+${perfIntel}%</strong> (×${dmgMultiplier.toFixed(2)})
            </div>
        `;
    }
}

function addAbility(type, savedData = null) {
    const list = document.getElementById(`${type}-list`);
    const isSpell = type === 'spells';
    const card = document.createElement('div');
    card.className = 'ability-card animation-fade';
    
    card.innerHTML = `
        <div class="ability-row" style="margin-top: 0;">
            <input type="text" class="ability-name" placeholder="${isSpell ? 'Spell Name...' : 'Skill Name...'}" value="${savedData ? savedData.name : ''}" oninput="saveAbilities()">
            <select class="ability-dmg-type" onchange="calculateDynamicStats(); saveAbilities();" style="background: #121212; border: 1px solid var(--border-color); color: var(--text-main); border-radius: 6px; padding: 4px;">
                <option value="physical">Physical</option>
                <option value="magic">Magic</option>
                <option value="soul">Soul</option>
            </select>
            <button onclick="this.parentElement.parentElement.remove(); calculateDynamicStats(); saveAbilities();" class="add-btn" style="background: var(--danger);">Delete</button>
        </div>
        <div class="ability-row">
            <label>Weapon %:</label> <input type="number" class="wpn-pct" value="${savedData ? savedData.wpnPct : '100'}" oninput="calculateDynamicStats(); saveAbilities();">
            <label>Skill Dmg:</label> <input type="number" class="base-dmg" value="${savedData ? savedData.baseDmg : '10'}" oninput="calculateDynamicStats(); saveAbilities();">
            <label style="color:var(--accent)">Final Dmg:</label> <span class="calculated-val final-dmg">10</span>
        </div>
        <div class="ability-row">
            <label>Base Mana:</label> <input type="number" class="base-mana" value="${savedData ? savedData.baseMana : '10'}" oninput="calculateDynamicStats(); saveAbilities();">
            <label>Final Cost:</label> <span class="calculated-val final-mana">10</span>
        </div>
        ${isSpell ? `<div class="ability-row"><label>Base Cast (Turns):</label> <input type="number" class="base-cast" value="${savedData ? savedData.baseCast : '1'}" oninput="calculateDynamicStats(); saveAbilities();"><label>Final Time:</label> <span class="calculated-val final-cast">1</span></div>` : ''}
        <div class="ability-row" style="flex-direction: column; align-items: flex-start; gap: 5px;">
            <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
                <label>Stat Modifiers:</label>
                <button class="add-btn" onclick="addModifierRow(this.parentElement.nextElementSibling); saveAbilities();" style="padding: 2px 8px; font-size:11px;">+ Add Mod</button>
            </div>
            <div class="mods-container"></div>
        </div>
        <div class="ability-row">
            <textarea class="ability-desc" placeholder="Description / Effects..." style="min-height: 40px; margin-top: 10px;" oninput="saveAbilities()">${savedData ? savedData.desc : ''}</textarea>
        </div>
    `;
    list.appendChild(card);
    const container = card.querySelector('.mods-container');
    if (savedData && savedData.mods) {
        savedData.mods.forEach(m => addModifierRow(container, m));
    }
    if (savedData && savedData.dmgType) {
        card.querySelector('.ability-dmg-type').value = savedData.dmgType;
    }
    calculateDynamicStats();
}

function addModifierRow(container, savedMod = null) {
    const row = document.createElement('div');
    row.className = 'mod-row animation-fade';
    row.innerHTML = `
        <select class="mod-target" onchange="calculateDynamicStats(); saveAbilities();">
            <option value="">None</option>
            <option value="hp-max">Max HP</option>
            <option value="mana-max">Max Mana</option>
            <option value="insanity-max">Max Insanity</option>
        </select>
        <select class="mod-type" onchange="calculateDynamicStats(); saveAbilities();">
            <option value="flat">+</option>
            <option value="percent">%</option>
        </select>
        <input type="number" class="mod-value" value="${savedMod ? savedMod.value : '0'}" oninput="calculateDynamicStats(); saveAbilities();">
        <button onclick="this.parentElement.remove(); calculateDynamicStats(); saveAbilities();" class="add-btn" style="background: var(--danger); padding: 2px 6px; font-size: 11px;">✕</button>
    `;
    container.appendChild(row);
    if (savedMod) {
        row.querySelector('.mod-target').value = savedMod.target;
        row.querySelector('.mod-type').value = savedMod.type;
    }
}

// --- LocalStorage Structural Engines ---
function saveAbilities() {
    const abilities = [];
    document.querySelectorAll('.ability-card').forEach(card => {
        const type = card.closest('#spells-list') ? 'spells' : 'skills';
        const mods = [];
        card.querySelectorAll('.mod-row').forEach(row => {
            mods.push({
                target: row.querySelector('.mod-target').value,
                type: row.querySelector('.mod-type').value,
                value: row.querySelector('.mod-value').value
            });
        });
        abilities.push({
            type,
            name: card.querySelector('.ability-name').value,
            baseMana: card.querySelector('.base-mana').value,
            baseDmg: card.querySelector('.base-dmg').value,
            baseCast: card.querySelector('.base-cast') ? card.querySelector('.base-cast').value : null,
            desc: card.querySelector('.ability-desc').value,
            dmgType: card.querySelector('.ability-dmg-type').value,
            wpnPct: card.querySelector('.wpn-pct').value,
            mods
        });
    });
    localStorage.setItem(prefix + 'saved_abilities_v4', JSON.stringify(abilities));
}

function loadAbilities() {
    const data = localStorage.getItem(prefix + 'saved_abilities_v4');
    if (!data) return;
    JSON.parse(data).forEach(ab => addAbility(ab.type, ab));
}

function addInventoryItem(savedItem = null) {
    const list = document.getElementById('inventory-list');
    const div = document.createElement('div');
    div.className = 'inventory-item animation-fade';
    div.innerHTML = `
        <input type="text" class="inv-name" placeholder="Item Name..." value="${savedItem ? savedItem.name : ''}" oninput="saveInventory()" style="flex: 2; font-weight: bold; color: var(--accent);">
        <input type="number" class="inv-qty" placeholder="Qty" value="${savedItem ? savedItem.qty : '1'}" oninput="saveInventory()">
        <input type="text" class="inv-desc" placeholder="Weight, notes, or stats..." value="${savedItem ? savedItem.desc : ''}" oninput="saveInventory()" style="flex: 3;">
        <button onclick="this.parentElement.remove(); saveInventory();" class="add-btn" style="background: var(--danger); padding: 6px 10px;">✕</button>
    `;
    list.appendChild(div);
    saveInventory();
}

// --- Dynamic Core Input Save Hooks ---
function saveInventory() {
    const items = [];
    document.querySelectorAll('.inventory-item').forEach(item => {
        items.push({
            name: item.querySelector('.inv-name').value,
            qty: item.querySelector('.inv-qty').value,
            desc: item.querySelector('.inv-desc').value
        });
    });
    localStorage.setItem(prefix + 'saved_inventory_v4', JSON.stringify(items));
}

function loadInventory() {
    const data = localStorage.getItem(prefix + 'saved_inventory_v4');
    if (!data) return;
    JSON.parse(data).forEach(item => addInventoryItem(item));
}

const inputs = document.querySelectorAll('[data-save="true"]');
inputs.forEach(input => {
    const savedValue = localStorage.getItem(prefix + input.id);
    if (savedValue !== null) {
        input.value = savedValue;
    } else if (defaultMikeData[input.id] !== undefined) {
        input.value = defaultMikeData[input.id];
        localStorage.setItem(prefix + input.id, defaultMikeData[input.id]); 
    }
    input.addEventListener('input', (e) => {
        localStorage.setItem(prefix + e.target.id, e.target.value);
        calculateDynamicStats();
    });
});

headerName.textContent = nameInput.value || '?';
calculateDynamicStats();
loadAbilities();
loadInventory();

// Tab Content Switch Engine with Animation
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const target = document.getElementById(tab.dataset.target);
        target.classList.add('active');
    });
});

// Photo Base64 File Uploader Module
const imageInput = document.getElementById('image-input');
const charImage = document.getElementById('char-image');
const uploadText = document.getElementById('upload-text');
const savedImage = localStorage.getItem(prefix + 'image');

if (savedImage) {
    charImage.src = savedImage;
    charImage.style.display = 'block';
    uploadText.style.display = 'none';
}

imageInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            charImage.src = e.target.result;
            charImage.style.display = 'block';
            uploadText.style.display = 'none';
            localStorage.setItem(prefix + 'image', e.target.result);
        }
        reader.readAsDataURL(file);
    }
});

// Interactive Floating D20 Dice System Engine Logic
const diceBtn = document.getElementById('dice-btn');
const diceModal = document.getElementById('dice-modal');
const diceResult = document.getElementById('dice-result');
const diceText = document.getElementById('dice-text');
const diceContent = document.querySelector('.dice-content');

diceBtn.addEventListener('click', () => {
    const roll = Math.floor(Math.random() * 20) + 1;
    diceContent.className = 'dice-content'; 
    diceModal.classList.add('show');
    let count = 0;
    const interval = setInterval(() => {
        diceResult.textContent = Math.floor(Math.random() * 20) + 1;
        count++;
        if (count > 12) {
            clearInterval(interval);
            diceResult.textContent = roll;
            if (roll === 20) {
                diceContent.classList.add('crit-success');
                diceText.textContent = 'Critical Success!';
            } else if (roll === 1) {
                diceContent.classList.add('crit-fail');
                diceText.textContent = 'Critical Failure!';
            } else {
                diceText.textContent = 'Standard Roll';
            }
        }
    }, 40);
});
diceModal.addEventListener('click', () => diceModal.classList.remove('show'));

// --- Custom Theme Dialog Manager (Replaces native prompt/confirm popups) ---
const customDialog = document.getElementById('custom-dialog');
const dialogTitle = document.getElementById('dialog-title');
const dialogText = document.getElementById('dialog-text');
const dialogInput = document.getElementById('dialog-input');
const dialogConfirmBtn = document.getElementById('dialog-confirm-btn');
const dialogCancelBtn = document.getElementById('dialog-cancel-btn');
let dialogCallback = null;

function showCustomDialog(options) {
    dialogTitle.textContent = options.title || 'System Alert';
    dialogText.textContent = options.text || '';
    dialogInput.value = '';
    dialogInput.style.display = options.showInput ? 'block' : 'none';
    customDialog.classList.add('show');
    dialogCallback = options.callback || null;
}

dialogConfirmBtn.addEventListener('click', () => {
    customDialog.classList.remove('show');
    if (dialogCallback) dialogCallback(true, dialogInput.value);
});

dialogCancelBtn.addEventListener('click', () => {
    customDialog.classList.remove('show');
    if (dialogCallback) dialogCallback(false, null);
});

// --- Profiles & Drawer Sliding Menu Management ---
function toggleCharDrawer() {
    document.getElementById('char-drawer').classList.toggle('open');
    renderCharList();
}

function renderCharList() {
    const listDiv = document.getElementById('char-list');
    listDiv.innerHTML = '';
    const activeName = localStorage.getItem('dnd_active_char_v4') || 'Mike';
    
    charList.forEach(name => {
        const div = document.createElement('div');
        div.className = `char-item ${name === activeName ? 'active' : ''}`;
        
        const span = document.createElement('span');
        span.style.flex = '1';
        span.textContent = name;
        span.addEventListener('click', () => switchCharacter(name));
        div.appendChild(span);
        
        if (charList.length > 1) {
            const btn = document.createElement('button');
            btn.textContent = '✕';
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                openDeleteConfirm(name);
            });
            div.appendChild(btn);
        }
        
        listDiv.appendChild(div);
    });
}

function openCharPrompt() {
    showCustomDialog({
        title: 'New Character Profile',
        text: 'Enter a clean call-sign name for your new card layout:',
        showInput: true,
        callback: (confirmed, val) => {
            const name = val ? val.trim() : null;
            if (!confirmed || !name || charList.includes(name)) return;
            charList.push(name);
            localStorage.setItem('dnd_char_list_v4', JSON.stringify(charList));
            switchCharacter(name);
        }
    });
}

function openDeleteConfirm(name) {
    showCustomDialog({
        title: 'Erase Profile?',
        text: `Are you absolutely sure you want to delete ${name}? This action cannot be reversed.`,
        showInput: false,
        callback: (confirmed) => {
            if (!confirmed) return;
            charList = charList.filter(c => c !== name);
            localStorage.setItem('dnd_char_list_v4', JSON.stringify(charList));
            
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(`dnd_char_v4_${name}_`)) {
                    localStorage.removeItem(key);
                }
            });
            
            const activeName = prefix.replace("dnd_char_v4_", "").replace("_", "");
            if (activeName === name) switchCharacter(charList[0]);
            else renderCharList();
        }
    });
}

function switchCharacter(name) {
    localStorage.setItem('dnd_active_char_v4', name);
    prefix = "dnd_char_v4_" + name + "_";
    
    document.getElementById('spells-list').innerHTML = '';
    document.getElementById('skills-list').innerHTML = '';
    document.getElementById('inventory-list').innerHTML = '';
    
    const targetInputs = document.querySelectorAll('[data-save="true"]');
    targetInputs.forEach(input => {
        const savedValue = localStorage.getItem(prefix + input.id);
        if (savedValue !== null) {
            input.value = savedValue;
        } else if (defaultMikeData[input.id] !== undefined && name === 'Mike') {
            input.value = defaultMikeData[input.id];
        } else {
            if (input.id.endsWith('-base')) {
                input.value = input.id.startsWith('hp') ? 100 : 50;
            } else if (input.id === 'char-level') {
                input.value = 1;
            } else {
                input.value = '';
            }
        }
    });
    
    const savedImage = localStorage.getItem(prefix + 'image');
    const charImage = document.getElementById('char-image');
    const uploadText = document.getElementById('upload-text');
    if (savedImage) {
        charImage.src = savedImage;
        charImage.style.display = 'block';
        uploadText.style.display = 'none';
    } else {
        charImage.src = '';
        charImage.style.display = 'none';
        uploadText.style.display = 'block';
    }
    
    headerName.textContent = document.getElementById('name').value || name;
    
    calculateDynamicStats();
    loadAbilities();
    loadInventory();
    document.getElementById('char-drawer').classList.remove('open');
}

// --- Import & Export JSON Backup Architecture ---
function exportCharacterData() {
    const backupData = {};
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('dnd_')) {
            backupData[key] = localStorage.getItem(key);
        }
    });
    
    const activeName = localStorage.getItem('dnd_active_char_v4') || 'Character';
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${activeName}_v4_backup.json`;
    link.click();
}

function importCharacterData(inputElement) {
    const file = inputElement.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedKeys = JSON.parse(e.target.result);
            Object.keys(importedKeys).forEach(key => {
                localStorage.setItem(key, importedKeys[key]);
            });
            
            charList = JSON.parse(localStorage.getItem('dnd_char_list_v4')) || ['Mike'];
            const activeName = localStorage.getItem('dnd_active_char_v4') || charList[0];
            switchCharacter(activeName);
            
            showCustomDialog({ title: 'Import Complete', text: 'All character files have been safely loaded.', showInput: false });
        } catch (err) {
            showCustomDialog({ title: 'Import Failed', text: 'Invalid backup file profile discovered.', showInput: false });
        }
    };
    reader.readAsText(file);
}

function changeTheme(theme) {
    document.body.className = theme !== 'default' ? `theme-${theme}` : '';
    localStorage.setItem('dnd_ui_theme', theme);
}

// Initialize theme configurations on page load
const savedTheme = localStorage.getItem('dnd_ui_theme') || 'default';
changeTheme(savedTheme);
if (document.getElementById('theme-select')) {
    document.getElementById('theme-select').value = savedTheme;
}

function toggleThemeDropdown() {
    document.getElementById('theme-dropdown').classList.toggle('open');
}

function selectTheme(theme, displayName) {
    changeTheme(theme);
    document.querySelector('#theme-dropdown .theme-toggle').textContent = displayName;
    document.getElementById('theme-dropdown').classList.remove('open');
}

// Adjust initialization to target the new custom layout
const initialTheme = localStorage.getItem('dnd_ui_theme') || 'default';
const displayNames = { default: 'Default Dark', cyber: 'Cyber Futuristic', proxy: 'Proxy Terminal' };

changeTheme(initialTheme);
setTimeout(() => {
    const toggleEl = document.querySelector('#theme-dropdown .theme-toggle');
    if (toggleEl) toggleEl.textContent = displayNames[initialTheme];
}, 50);

// Close menu automatically if clicking outside of it
document.addEventListener('click', (e) => {
    if (!e.target.closest('#theme-dropdown')) {
        document.getElementById('theme-dropdown')?.classList.remove('open');
    }
});

function deleteCurrentCharacter() {
    const activeName = localStorage.getItem('dnd_active_char_v4') || charList[0];
    if (charList.length <= 1) {
        showCustomDialog({ title: 'System Alert', text: 'You must keep at least one character profile active.', showInput: false });
        return;
    }
    openDeleteConfirm(activeName);
}

function longRest() {
    const hpMax = parseInt(document.getElementById('hp-max').value) || 100;
    const manaMax = parseInt(document.getElementById('mana-max').value) || 50;
    
    document.getElementById('hp-current').value = hpMax;
    document.getElementById('mana-current').value = manaMax;
    
    localStorage.setItem(prefix + 'hp-current', hpMax);
    localStorage.setItem(prefix + 'mana-current', manaMax);
    
    showCustomDialog({ title: 'Long Rest Complete', text: 'Your HP and Mana pools have been fully restored to maximum values.', showInput: false });
}

function shortRest() {
    const hpCurrent = parseInt(document.getElementById('hp-current').value) || 0;
    const hpMax = parseInt(document.getElementById('hp-max').value) || 100;
    const manaCurrent = parseInt(document.getElementById('mana-current').value) || 0;
    const manaMax = parseInt(document.getElementById('mana-max').value) || 50;
    
    const newHp = Math.min(hpMax, hpCurrent + Math.floor(hpMax * 0.25));
    const newMana = Math.min(manaMax, manaCurrent + Math.floor(manaMax * 0.25));
    
    document.getElementById('hp-current').value = newHp;
    document.getElementById('mana-current').value = newMana;
    
    localStorage.setItem(prefix + 'hp-current', newHp);
    localStorage.setItem(prefix + 'mana-current', newMana);
    
    showCustomDialog({ title: 'Short Rest Complete', text: 'You take a quick breather and restore 25% of your max HP and Mana.', showInput: false });
}