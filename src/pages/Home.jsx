import React, { useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Form from "../components/form";
import ActionTable from "../components/table/ActionTable";
import {
  getAllItems,
  createItem,
  updateItem,
  deleteItem,
} from "../services/itemService";

export default function Home() {
  const [filtro, setFiltro] = useState({ name: "" });
  const [registros, setRegistros] = useState([]);
  const [adicionando, setAdicionando] = useState(false);
  const [editandoItem, setEditandoItem] = useState({});

  useEffect(() => {
    carregar();
  }, []);

  const carregar = (filtroEnviar = filtro) => {
    setFiltro(filtroEnviar);

    getAllItems(filtroEnviar.name).then((data) => {
      setRegistros(data);
    });
  };

  const fFiltro = {
    title: "Filtro",
    form: {
      name: {
        label: "Filtro por nome",
        type: "text",
        value: filtro.name,
        space: 6,
      },
    },

    submit: {
      label: "buscar",
      action: carregar,
    },
  };

  const tRegistros = {
    title: "Itens",
    onLineClick: (item) => setEditandoItem(item),
    newItemAction: () => setAdicionando(true),
    columns: [
      {
        label: "Nome",
        name: "name",
      },
      {
        label: "Descrição",
        name: "description",
      },
    ],

    array: registros,
  };

  const adicionarItem = (form) => {
    createItem(form).then(() => {
      setAdicionando(false);
      setEditandoItem({});
      carregar();
    });
  };

  const editarItem = (form) => {
    updateItem(editandoItem.id, form).then(() => {
      setAdicionando(false);
      setEditandoItem({});
      carregar();
    });
  };

  const deletarItem = () => {
    deleteItem(editandoItem.id).then(() => {
      setEditandoItem({});
      carregar();
    });
  };

  const fAdicionar = {
    title: "Item",
    form: {
      name: {
        label: "Nome",
        type: "text",
        value: editandoItem.name,
        space: 12,
      },
      description: {
        label: "Descrição",
        type: "textarea",
        value: editandoItem.description,
        space: 12,
      },
    },

    submit: {
      label: "Salvar",
      action: editandoItem.id ? editarItem : adicionarItem,
    },
    close: {
      label: "fechar",
      action: () => {
        setAdicionando(false);
        setEditandoItem({});
      },
    },

    customActions: editandoItem.id
      ? [
          {
            warning: true,
            label: "Deletar item",
            action: () => deletarItem("Ação 1!"),
          },
        ]
      : undefined,
  };

  return (
    <div>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Projeto CRUD
            </Typography>
          </Toolbar>
        </AppBar>
      </Box>

      <div style={{ margin: 10, borderRadius: 10 }}>
        {adicionando || editandoItem.id ? (
          <Form formData={fAdicionar} />
        ) : (
          <>
            <Form formData={fFiltro} />

            <ActionTable structure={tRegistros} />
          </>
        )}
      </div>
    </div>
  );
}
