const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'rpg_user',
    password: 'admin',
    database: 'rpg_online'
});

connection.connect(err => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.stack);
        return;
    }
    console.log('Conectado ao banco de dados MySQL.');
});

// Servir as páginas HTML separadas
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/create-character', (req, res) => {
    res.sendFile(path.join(__dirname, 'create-character.html'));
});

app.get('/list-characters', (req, res) => {
    res.sendFile(path.join(__dirname, 'list-characters.html'));
});

app.get('/combat', (req, res) => {
    res.sendFile(path.join(__dirname, 'combat.html'));
});

// Registro de usuário
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    connection.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (results.length > 0) {
            return res.status(400).send('Usuário já existe.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        connection.query('INSERT INTO users (username, passwrd) VALUES (?, ?)', 
        [username, hashedPassword], (err, results) => {
            if (err) throw err;
            res.status(201).send('Usuário registrado com sucesso.');
        });
    });
});

// Login de usuário
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    connection.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (results.length === 0) {
            return res.status(400).send('Usuário não encontrado.');
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.passwrd);
        if (!match) {
            return res.status(400).send('Senha incorreta.');
        }

        res.send('Login bem-sucedido.');
    });
});

// Criação de personagem
app.post('/create-character', (req, res) => {
    const { username, nome, race, class: characterClass } = req.body;

    connection.query('SELECT id FROM users WHERE username = ?', [username], (err, results) => {
        if (err || results.length === 0) {
            console.error('Erro ao buscar usuário:', err || 'Usuário não encontrado');
            return res.status(500).send('Erro ao buscar usuário.');
        }

        const userId = results[0].id;

        connection.query('INSERT INTO characters (user_id, nome, race, class) VALUES (?, ?, ?, ?)', 
        [userId, nome, race, characterClass], (err, results) => {
            if (err) {
                console.error('Erro ao criar personagem:', err);
                return res.status(500).send('Erro ao criar personagem.');
            }
            res.status(201).send('Personagem criado com sucesso.');
        });
    });
});

// Listar personagens
app.post('/list-characters', (req, res) => {
    const { username } = req.body;

    connection.query('SELECT id FROM users WHERE username = ?', [username], (err, results) => {
        if (err || results.length === 0) {
            console.error('Erro ao buscar usuário:', err || 'Usuário não encontrado');
            return res.status(500).send('Erro ao buscar usuário.');
        }

        const userId = results[0].id;

        connection.query('SELECT nome, race, class, lvl FROM characters WHERE user_id = ?', [userId], (err, results) => {
            if (err) {
                console.error('Erro ao listar personagens:', err);
                return res.status(500).send('Erro ao listar personagens.');
            }

            res.status(200).json(results);
        });
    });
});

// Rota para iniciar um combate
app.post('/start-combat', (req, res) => {
    const { username, characterName } = req.body;

    connection.query('SELECT * FROM characters WHERE nome = ? AND user_id = (SELECT id FROM users WHERE username = ?)', 
    [characterName, username], (err, results) => {
        if (err || results.length === 0) {
            console.error('Erro ao buscar personagem:', err || 'Personagem não encontrado');
            return res.status(500).send('Erro ao buscar personagem.');
        }

        const character = results[0];

        const monster = {
            name: 'Goblin',
            hp: 30,
            attack: 5,
            defense: 2,
            exp: 50 // Experiência ganha ao derrotar este monstro
        };

        let characterHp = character.strength * 2;
        let monsterHp = monster.hp;

        let log = [];

        while (characterHp > 0 && monsterHp > 0) {
            const characterAttack = Math.max(0, character.strength - monster.defense);
            monsterHp -= characterAttack;
            log.push(`${character.nome} ataca o ${monster.name} causando ${characterAttack} de dano. Monstro HP: ${monsterHp}`);

            if (monsterHp <= 0) break;

            const monsterAttack = Math.max(0, monster.attack - character.dexterity);
            characterHp -= monsterAttack;
            log.push(`${monster.name} ataca o ${character.nome} causando ${monsterAttack} de dano. Personagem HP: ${characterHp}`);
        }

        let result;
        if (characterHp > 0) {
            result = `${character.nome} venceu o combate!`;

            const newExperience = character.experience + monster.exp;
            let newLevel = character.lvl;
            let nextLevelExp = character.next_level_exp;

            if (newExperience >= nextLevelExp) {
                newLevel++;
                nextLevelExp = Math.floor(nextLevelExp * 1.5); // Aumentar a quantidade de XP necessária para o próximo nível
                log.push(`${character.nome} subiu para o nível ${newLevel}!`);
            }

            connection.query(
                'UPDATE characters SET experience = ?, lvl = ?, next_level_exp = ? WHERE id = ?',
                [newExperience, newLevel, nextLevelExp, character.id],
                (err) => {
                    if (err) {
                        console.error('Erro ao atualizar experiência e nível:', err);
                        return res.status(500).send('Erro ao atualizar experiência e nível.');
                    }
                }
            );
        } else {
            result = `${character.nome} foi derrotado.`;
        }

        log.push(result);
        res.status(200).json({ log, result, characterId: character.id });
    });
});



// Rota para usar uma habilidade
app.post('/use-skill', (req, res) => {
    const { characterId, skillId } = req.body;

    connection.query(
        'SELECT * FROM skills WHERE id = ?',
        [skillId],
        (err, results) => {
            if (err || results.length === 0) {
                console.error('Erro ao buscar habilidade:', err || 'Habilidade não encontrada');
                return res.status(500).send('Erro ao buscar habilidade.');
            }

            const skill = results[0];

            // Aplique o efeito da habilidade aqui (dano, cura, etc.)

            res.status(200).json({ message: `Habilidade ${skill.name} usada com sucesso!`, skill });
        }
    );
});

// Rota para usar um item
app.post('/use-item', (req, res) => {
    const { characterId, itemId } = req.body;

    connection.query(
        'SELECT * FROM character_items WHERE character_id = ? AND item_id = ?',
        [characterId, itemId],
        (err, results) => {
            if (err || results.length === 0 || results[0].quantity <= 0) {
                console.error('Erro ao buscar item ou item esgotado:', err || 'Item não encontrado ou esgotado');
                return res.status(500).send('Erro ao buscar item ou item esgotado.');
            }

            const item = results[0];

            // Aplique o efeito do item aqui (cura, buff, etc.)
            // Exemplo simples: Curar personagem

            connection.query(
                'UPDATE character_items SET quantity = quantity - 1 WHERE character_id = ? AND item_id = ?',
                [characterId, itemId],
                (err) => {
                    if (err) {
                        console.error('Erro ao atualizar quantidade de itens:', err);
                        return res.status(500).send('Erro ao atualizar quantidade de itens.');
                    }
                    res.status(200).json({ message: `Item usado com sucesso!`, item });
                }
            );
        }
    );
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
