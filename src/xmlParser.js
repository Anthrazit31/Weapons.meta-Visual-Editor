export function parseWeaponXML(xmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, "text/xml");

    const weapons = [];

    // Find CWeaponInfo items. Note: Structure is usually <Infos><Item type="CWeaponInfo">...</Item></Infos>
    // but sometimes nested differently. We'll search for all Item[type="CWeaponInfo"]

    const items = doc.querySelectorAll('Item[type="CWeaponInfo"]');

    items.forEach(item => {
        const weapon = {
            name: getTagValue(item, 'Name') || 'Unknown',
            damage: parseFloat(getTagValue(item, 'Damage')) || 0,
            timeBetweenShots: parseFloat(getTagValue(item, 'TimeBetweenShots')) || 0,
            weaponRange: parseFloat(getTagValue(item, 'WeaponRange')) || 0,
            damageFallOffRangeMin: parseFloat(getTagValue(item, 'DamageFallOffRangeMin')) || 0,
            damageFallOffRangeMax: parseFloat(getTagValue(item, 'DamageFallOffRangeMax')) || 0,
            damageFallOffModifier: parseFloat(getTagValue(item, 'DamageFallOffModifier')) || 1.0,
            // Advanced Modifiers
            headShotDamageModifier: parseFloat(getTagValue(item, 'HeadShotDamageModifierPlayer')) || parseFloat(getTagValue(item, 'HeadShotDamageModifier')) || 1.0,
            armorDamageModifier: parseFloat(getTagValue(item, 'ArmorDamageModifier')) || 1.0,
            limbDamageModifier: parseFloat(getTagValue(item, 'HitLimbsDamageModifier')) || 1.0,
            minHeadShotDistance: parseFloat(getTagValue(item, 'MinHeadShotDistancePlayer')) || 0,
            maxHeadShotDistance: parseFloat(getTagValue(item, 'MaxHeadShotDistancePlayer')) || 1000,

            // Existing fields
            clipSize: parseFloat(getTagValue(item, 'ClipSize')) || 0,
            group: getTagValue(item, 'Group') || 'Generic',
        };

        // Only add if it has a name starting with WEAPON_ (optional filter)
        if (weapon.name.startsWith('WEAPON_')) {
            weapons.push(weapon);
        }
    });

    return weapons;
}

function getTagValue(parent, tagName) {
    // Direct child search
    for (let i = 0; i < parent.children.length; i++) {
        if (parent.children[i].tagName === tagName) {
            // Check for 'value' attribute first, then text content
            if (parent.children[i].hasAttribute('value')) {
                return parent.children[i].getAttribute('value');
            }
            return parent.children[i].textContent;
        }
    }
    return null;
}

export function generateWeaponXML(weapons) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<CWeaponInfoBlob>\n';
    xml += '  <Infos>\n';

    weapons.forEach(w => {
        xml += '    <Item type="CWeaponInfo">\n';
        xml += `      <Name>${w.name}</Name>\n`;
        xml += `      <Damage value="${formatFloat(w.damage)}"/>\n`;
        xml += `      <TimeBetweenShots value="${formatFloat(w.timeBetweenShots)}"/>\n`;
        xml += `      <WeaponRange value="${formatFloat(w.weaponRange)}"/>\n`;
        xml += `      <DamageFallOffRangeMin value="${formatFloat(w.damageFallOffRangeMin)}"/>\n`;
        xml += `      <DamageFallOffRangeMax value="${formatFloat(w.damageFallOffRangeMax)}"/>\n`;
        xml += `      <DamageFallOffModifier value="${formatFloat(w.damageFallOffModifier)}"/>\n`;

        // Advanced
        xml += `      <HeadShotDamageModifierPlayer value="${formatFloat(w.headShotDamageModifier)}"/>\n`;
        xml += `      <ArmorDamageModifier value="${formatFloat(w.armorDamageModifier)}"/>\n`;
        xml += `      <HitLimbsDamageModifier value="${formatFloat(w.limbDamageModifier)}"/>\n`;
        xml += `      <MinHeadShotDistancePlayer value="${formatFloat(w.minHeadShotDistance)}"/>\n`;
        xml += `      <MaxHeadShotDistancePlayer value="${formatFloat(w.maxHeadShotDistance)}"/>\n`;

        xml += `      <ClipSize value="${w.clipSize}"/>\n`; // Usually int, but formatFloat is harmless or we can parse int
        xml += `      <Group>${w.group}</Group>\n`;

        // Add default values for required fields that might happen to be missing from our model but needed for valid XML
        // For now, we only write what we track.

        xml += '    </Item>\n';
    });

    xml += '  </Infos>\n';
    xml += '</CWeaponInfoBlob>';
    return xml;
}

function formatFloat(val) {
    if (typeof val !== 'number') return '0.000000';
    return val.toFixed(6);
}
