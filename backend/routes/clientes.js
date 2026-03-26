const express = require('express');
const router = express.Router();
const db = require('../database');
const { validarDocumento } = require('../utils/ValidarDocumento');

router.get('/', (req, res) => {
  db.all('SELECT * FROM clientes', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { nome, doc } = req.body;
  if (!nome || !doc) return res.status(400).json({ error: 'Campos obrigatórios' });
  if (!validarDocumento(doc)) return res.status(400).json({ error: 'CPF ou CNPJ inválido' });

  db.run('INSERT INTO clientes (nome, doc) VALUES (?, ?)', [nome, doc], function(err){
    if(err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, nome, doc });
  });
});

router.delete('/:id', (req, res) => {
  db.run('DELETE FROM clientes WHERE id = ?', [req.params.id], function(err){
    if(err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Cliente removido' });
  });
});

router.put('/:id', (req, res) => {
  const { nome, doc } = req.body;
  const id = req.params.id;

  if (!nome || !doc) {
    return res.status(400).json({ error: 'Dados inválidos' });
  }

  if (!validarDocumento(doc)) {
    return res.status(400).json({ error: 'CPF ou CNPJ inválido' });
  }

  db.run(
    'UPDATE clientes SET nome = ?, doc = ? WHERE id = ?',
    [nome, doc, id],
    function(err) {
      if (err) {
        console.log("ERRO UPDATE CLIENTE:", err);
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }

      res.json({ message: 'Cliente atualizado', id });
    }
  );
});

module.exports = router;