const express = require('express');
const cors = require('cors');

const produtosRouter = require('./routes/produtos');
const clientesRouter = require('./routes/clientes');
const vendasRouter = require('./routes/vendas');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use('/produtos', produtosRouter);
app.use('/clientes', clientesRouter);
app.use('/vendas', vendasRouter);

app.listen(port, () => console.log(`API rodando em http://localhost:${port}`));