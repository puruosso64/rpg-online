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
    user: 'root',
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

app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'favicon.ico'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/create-character', (req, res) => {
    res.sendFile(path.join(__dirname, 'create-character.html'));
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

app.get('/list-characters', (req, res) => {
    res.sendFile(path.join(__dirname, 'list-characters.html'));
});

app.get('/start-combat', (req, res) => {
    res.sendFile(path.join(__dirname, 'start-combat.html'));
});

app.get('/distribute-points', (req, res) => {
    res.sendFile(path.join(__dirname, 'distribute-points.html'));
});

app.get('/character-details', (req, res) => {
    res.sendFile(path.join(__dirname, 'character-details.html'));
});

app.get('/inventory', (req, res) => {
    res.sendFile(path.join(__dirname, 'inventory.html'));
});

app.get('/missions', (req, res) => {
    res.sendFile(path.join(__dirname, 'missions.html'));
});

app.get('/logout', (req, res) => {
    // Adicione aqui a lógica para limpar a sessão, cookies, etc.
    res.redirect('/login');
});

app.use(express.static(path.join(__dirname)));

// Detalhes do personagem
app.post('/character-details', (req, res) => {
    const { username, characterName } = req.body;

    connection.query('SELECT * FROM characters WHERE nome = ? AND user_id = (SELECT id FROM users WHERE username = ?)', 
    [characterName, username], (err, results) => {
        if (err || results.length === 0) {
            console.error('Erro ao buscar detalhes do personagem:', err || 'Personagem não encontrado');
            return res.status(500).send('Erro ao buscar detalhes do personagem.');
        }

        const character = results[0];
        res.status(200).json({
            name: character.nome,
            race: character.race,
            class: character.class,
            level: character.lvl,
            experience: character.experience,
            nextLevelExp: character.next_level_exp,
            strength: character.strength,
            dexterity: character.dexterity,
            intelligence: character.intelligence,
            constitution: character.constitution,
            attributePoints: character.attribute_points
        });
    });
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
            let attributePoints = character.attribute_points;

            if (newExperience >= nextLevelExp) {
                newLevel++;
                nextLevelExp = Math.floor(nextLevelExp * 1.5);
                attributePoints += 5; // Adiciona 5 pontos de atributo a cada nível
                log.push(`${character.nome} subiu para o nível ${newLevel} e ganhou 5 pontos de atributo!`);
            }

            connection.query(
                'UPDATE characters SET experience = ?, lvl = ?, next_level_exp = ?, attribute_points = ? WHERE id = ?',
                [newExperience, newLevel, nextLevelExp, attributePoints, character.id],
                (err) => {
                    if (err) {
                        console.error('Erro ao atualizar experiência, nível e pontos de atributo:', err);
                        return res.status(500).send('Erro ao atualizar experiência, nível e pontos de atributo.');
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

// Rota para aprender habilidades
app.post('/learn-skill', (req, res) => {
    const { username, characterName, skillId } = req.body;

    connection.query('SELECT * FROM characters WHERE nome = ? AND user_id = (SELECT id FROM users WHERE username = ?)', 
    [characterName, username], (err, characterResults) => {
        if (err || characterResults.length === 0) {
            console.error('Erro ao buscar personagem:', err || 'Personagem não encontrado');
            return res.status(500).send('Erro ao buscar personagem.');
        }

        const character = characterResults[0];

        connection.query('SELECT * FROM skills WHERE id = ?', [skillId], (err, skillResults) => {
            if (err || skillResults.length === 0) {
                console.error('Erro ao buscar habilidade:', err || 'Habilidade não encontrada');
                return res.status(500).send('Erro ao buscar habilidade.');
            }

            const skill = skillResults[0];

            if (character.lvl < skill.required_level) {
                return res.status(400).json({ message: 'Nível insuficiente para aprender essa habilidade.' });
            }

            connection.query('INSERT INTO character_skills (character_id, skill_id) VALUES (?, ?)', 
            [character.id, skill.id], (err) => {
                if (err) {
                    console.error('Erro ao aprender habilidade:', err);
                    return res.status(500).send('Erro ao aprender habilidade.');
                }
                res.status(200).json({ message: 'Habilidade aprendida com sucesso!' });
            });
        });
    });
});

// Rota para usar habilidades
app.post('/use-skill', (req, res) => {
    const { characterId, skillId } = req.body;

    connection.query('SELECT * FROM skills WHERE id = ?', [skillId], (err, skillResults) => {
        if (err || skillResults.length === 0) {
            console.error('Erro ao buscar habilidade:', err || 'Habilidade não encontrada');
            return res.status(500).send('Erro ao buscar habilidade.');
        }

        const skill = skillResults[0];

        // Aplique o efeito da habilidade aqui (dano, cura, etc.)

        res.status(200).json({ message: `Habilidade ${skill.name} usada com sucesso!`, skill });
    });
});

// Rota para usar um item
app.post('/use-item', (req, res) => {
    const { characterId, itemId } = req.body;

    connection.query('SELECT * FROM character_items WHERE character_id = ? AND item_id = ?', 
    [characterId, itemId], (err, results) => {
        if (err || results.length === 0 || results[0].quantity <= 0) {
            console.error('Erro ao buscar item ou item esgotado:', err || 'Item não encontrado ou esgotado');
            return res.status(500).send('Erro ao buscar item ou item esgotado.');
        }

        const item = results[0];

        // Aplique o efeito do item aqui (cura, buff, etc.)
        // Exemplo simples: Curar personagem

        connection.query(
            'UPDATE character_items SET quantity = quantity - 1 WHERE character_id = ? AND item_id = ?',
            [characterId, itemId], (err) => {
                if (err) {
                    console.error('Erro ao atualizar quantidade de itens:', err);
                    return res.status(500).send('Erro ao atualizar quantidade de itens.');
                }
                res.status(200).json({ message: `Item usado com sucesso!`, item });
            }
        );
    });
});

// Rota para aceitar missões
app.post('/accept-mission', (req, res) => {
    const { characterId, missionId } = req.body;

    connection.query('SELECT * FROM character_missions WHERE character_id = ? AND mission_id = ?', 
    [characterId, missionId], (err, results) => {
        if (results.length > 0) {
            return res.status(400).send('Missão já foi aceita.');
        }

        connection.query('INSERT INTO character_missions (character_id, mission_id) VALUES (?, ?)', 
        [characterId, missionId], (err) => {
            if (err) {
                console.error('Erro ao aceitar missão:', err);
                return res.status(500).send('Erro ao aceitar missão.');
            }
            res.status(200).send('Missão aceita com sucesso!');
        });
    });
});

// Rota para completar missões
app.post('/complete-mission', (req, res) => {
    const { characterId, missionId } = req.body;

    connection.query('SELECT * FROM character_missions WHERE character_id = ? AND mission_id = ? AND status = "incomplete"', 
    [characterId, missionId], (err, results) => {
        if (err || results.length === 0) {
            return res.status(400).send('Missão não encontrada ou já completada.');
        }

        connection.query('SELECT * FROM missions WHERE id = ?', [missionId], (err, missionResults) => {
            if (err || missionResults.length === 0) {
                console.error('Erro ao buscar missão:', err || 'Missão não encontrada');
                return res.status(500).send('Erro ao buscar missão.');
            }

            const mission = missionResults[0];

            connection.query('UPDATE character_missions SET status = "complete" WHERE character_id = ? AND mission_id = ?', 
            [characterId, missionId], (err) => {
                if (err) {
                    console.error('Erro ao completar missão:', err);
                    return res.status(500).send('Erro ao completar missão.');
                }

                let queries = [];
                let params = [];

                // Atualiza a experiência do personagem
                queries.push('UPDATE characters SET experience = experience + ? WHERE id = ?');
                params.push(mission.experience_reward, characterId);

                // Recompensa item (se houver)
                if (mission.item_reward) {
                    queries.push('INSERT INTO character_items (character_id, item_id, quantity) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE quantity = quantity + 1');
                    params.push(characterId, mission.item_reward);
                }

                // Recompensa em dinheiro (se houver)
                if (mission.money_reward > 0) {
                    queries.push('UPDATE characters SET money = money + ? WHERE id = ?');
                    params.push(mission.money_reward, characterId);
                }

                connection.query(queries.join('; '), params, (err) => {
                    if (err) {
                        console.error('Erro ao distribuir recompensas:', err);
                        return res.status(500).send('Erro ao distribuir recompensas.');
                    }
                    res.status(200).send('Missão completada com sucesso!');
                });
            });
        });
    });
});

//Rota para distribuir pontos de atributos
app.post('/distribute-points', (req, res) => {
    const { username, characterName, strength, dexterity, intelligence, constitution } = req.body;

    connection.query('SELECT * FROM characters WHERE nome = ? AND user_id = (SELECT id FROM users WHERE username = ?)', 
    [characterName, username], (err, results) => {
        if (err || results.length === 0) {
            console.error('Erro ao buscar personagem:', err || 'Personagem não encontrado');
            return res.status(500).send('Erro ao buscar personagem.');
        }

        const character = results[0];
        const totalPoints = strength + dexterity + intelligence + constitution;

        if (totalPoints > character.attribute_points) {
            return res.status(400).json({ message: 'Você não tem pontos de atributo suficientes.' });
        }

        const newStrength = character.strength + strength;
        const newDexterity = character.dexterity + dexterity;
        const newIntelligence = character.intelligence + intelligence;
        const newConstitution = character.constitution + constitution;
        const remainingPoints = character.attribute_points - totalPoints;

        connection.query(
            'UPDATE characters SET strength = ?, dexterity = ?, intelligence = ?, constitution = ?, attribute_points = ? WHERE id = ?',
            [newStrength, newDexterity, newIntelligence, newConstitution, remainingPoints, character.id],
            (err) => {
                if (err) {
                    console.error('Erro ao distribuir pontos de atributo:', err);
                    return res.status(500).send('Erro ao distribuir pontos de atributo.');
                }
                res.status(200).json({ message: 'Pontos de atributo distribuídos com sucesso!' });
            }
        );
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
                nextLevelExp = Math.floor(nextLevelExp * 1.5); // Aumenta o XP necessário para o próximo nível
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

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
