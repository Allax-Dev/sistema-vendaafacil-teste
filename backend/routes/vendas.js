const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  const sql = `SELECT v.id, v.total, c.nome AS cliente 
               FROM vendas v JOIN clientes c ON v.cliente_id = c.id`;
  db.all(sql, [], (err, rows) => {
    if(err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { cliente_id, itens } = req.body;
  if(!cliente_id || !itens || itens.length === 0) return res.status(400).json({ error: 'Venda inválida' });

  let total = itens.reduce((s, item) => s + item.preco * item.quantidade, 0);

  db.run('INSERT INTO vendas (cliente_id, total) VALUES (?, ?)', [cliente_id, total], function(err){
    if(err) return res.status(500).json({ error: err.message });
    const venda_id = this.lastID;

    const stmt = db.prepare('INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco) VALUES (?, ?, ?, ?)');
    itens.forEach(item => stmt.run(venda_id, item.produto_id, item.quantidade, item.preco));
    stmt.finalize();

    res.json({ id: venda_id, cliente_id, itens, total });
  });
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;

  db.run('DELETE FROM itens_venda WHERE venda_id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });

    db.run('DELETE FROM vendas WHERE id = ?', [id], function(err) {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ message: 'Venda excluída' });
    });
  });
});

router.put('/:id', (req, res) => {
  const { cliente_id } = req.body;
  const id = req.params.id;

  if (!cliente_id) {
    return res.status(400).json({ error: 'Cliente obrigatório' });
  }

  db.run(
    'UPDATE vendas SET cliente_id = ? WHERE id = ?',
    [cliente_id, id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ message: 'Venda atualizada' });
    }
  );
});

module.exports = router;