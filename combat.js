import { updateHealth } from './healthModule.js';

let characterId; // Variável para armazenar o ID do personagem
let currentHealth = 80; // Exemplo de valor de saúde atual
let currentMana = 30;   // Exemplo de valor de mana atual
let currentXp = 150;    // Exemplo de valor de XP atual

updateHealth(currentHealth);

document.getElementById('health-value').innerText = currentHealth;
document.getElementById('mana-value').innerText = currentMana;
document.getElementById('xp-value').innerText = currentXp;
document.getElementById('combatForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('combatUsername').value;
    const characterName = document.getElementById('characterName').value;

    fetch('/start-combat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, characterName })
    })
    .then(response => response.json())
    .then(data => {
        characterId = data.characterId; // Obter o ID do personagem do backend
        const combatLog = document.getElementById('combatLog');
        combatLog.innerHTML = ''; // Limpa o log atual

        data.log.forEach(entry => {
            const p = document.createElement('p');
            p.textContent = entry;
            combatLog.appendChild(p);
        });

        const result = document.createElement('h3');
        result.textContent = `Resultado: ${data.result}`;
        combatLog.appendChild(result);

        document.getElementById('combatActions').style.display = 'block'; // Mostrar ações de combate
    })
    .catch(error => console.error('Error:', error));
});

document.getElementById('useSkill').addEventListener('click', function() {
    const skillId = prompt('Enter the skill ID to use:');

    fetch('/use-skill', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ characterId, skillId })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
    })
    .catch(error => console.error('Error:', error));
});

document.getElementById('useItem').addEventListener('click', function() {
    const itemId = prompt('Enter the item ID to use:');

    fetch('/use-item', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ characterId, itemId })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
    })
    .catch(error => console.error('Error:', error));
});