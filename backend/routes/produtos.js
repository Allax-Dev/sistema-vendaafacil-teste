const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  db.all('SELECT * FROM produtos', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { nome, preco } = req.body;
  if (!nome || preco <= 0) return res.status(400).json({ error: 'Produto inválido' });

  db.run('INSERT INTO produtos (nome, preco) VALUES (?, ?)', [nome, preco], function(err){
    if(err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, nome, preco });
  });
});

router.delete('/:id', (req, res) => {
  db.run('DELETE FROM produtos WHERE id = ?', [req.params.id], function(err){
    if(err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Produto removido' });
  });
});

router.put('/:id', (req, res) => {
  const { nome, preco } = req.body;
  const id = req.params.id;

  if (!nome || !preco || preco <= 0) {
    return res.status(400).json({ error: 'Produto inválido' });
  }

  db.run(
    'UPDATE produtos SET nome = ?, preco = ? WHERE id = ?',
    [nome, Number(preco), id],
    function(err) {
      if (err) {
        console.log("ERRO UPDATE:", err);
        return res.status(500).json({ error: err.message });
      }

     
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      res.json({ message: 'Produto atualizado', id });
    }
  );
});

module.exports = router;