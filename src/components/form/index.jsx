import React, { useEffect, useState, Fragment } from "react";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import Checkbox from "@mui/material/Checkbox";
import { Autocomplete, FormControlLabel } from "@mui/material";

const DynamicForm = ({ formData, uncontrollable }) => {
  // const [form, setForm] = useState();
  const [form, setForm] = useState(formData.form);

  useEffect(() => {
    let queryParams = {};
    if (formData.urlParams && formData.location) {
      queryParams = getQueryParams(formData.location.search);

      Object.keys(queryParams)
        .filter((param) => formData.form[param])
        .forEach((param) => (formData.form[param].value = queryParams[param]));
    }

    if (!uncontrollable) setForm({ ...formData.form });
  }, [formData]);

  const preencher = (campo, valor) => {
    const formAtualizar = { ...form };

    formAtualizar[campo].value = valor;
    formAtualizar[campo].emptyError = false;

    if (formData.autoSave) return formData.autoSave(campo, valor);

    setForm(formAtualizar);

    // if (formData.submit.auto) submit(formAtualizar);
    if (formData.submit && formData.submit.auto) submit(formAtualizar);
  };

  const preencherMultiplos = (campo, valor) => {
    const formAtualizar = { ...form };
    let value = [];

    valor.forEach((v) => {
      value.push(v.value);
    });

    formAtualizar[campo].value = value;
    formAtualizar[campo].emptyError = false;

    setForm(formAtualizar);

    if (formData.submit && formData.submit.auto) submit(formAtualizar);
  };

  const fileUpload = (e, campo) => {
    e.preventDefault();

    let files;

    if (e.dataTransfer) {
      files = e.dataTransfer.files;
    } else if (e.target) {
      files = e.target.files;
    }

    const uploadedFiles = [];

    const fileLoad = (file) => {
      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => {
        uploadedFiles.push(file);

        if (uploadedFiles.length === files.length) {
          //Upload complete for all files
          const formAtualizar = { ...form };

          formAtualizar[campo].value = uploadedFiles;
          formAtualizar[campo].emptyError = false;

          setForm(formAtualizar);
        }
      };
    };

    for (let i = 0; i < files.length; i++) {
      fileLoad(files[i]);
    }
  };

  const submit = (updatedForm) => {
    const { history, location, urlParams, submit } = formData;
    const returnForm = {};

    let isOk = true;

    const formAtualizar = updatedForm ? updatedForm : { ...form };

    let query = `?`;

    Object.keys(form).forEach((campo) => {
      returnForm[campo] = form[campo].value ? form[campo].value : null;

      query +=
        form[campo].value &&
        !form[campo].readOnly &&
        form[campo].type !== "component"
          ? `${campo}=${form[campo].value}&`
          : "";

      if (form[campo].required && !form[campo].value) {
        formAtualizar[campo].emptyError = true;
        isOk = false;
      }
    });

    if (urlParams && history && location) {
      history.push({
        pathname: location.pathname,
        search: query,
      });
    }

    setForm(formAtualizar);

    if (isOk) submit.action(returnForm);
  };

  const close = () => {
    if (formData.close && formData.close.action) {
      formData.close.action();
    } else {
      formData.history.go(-1);
    }
  };

  const returnAction = () => {
    const returnForm = {};

    Object.keys(form).forEach((campo) => {
      returnForm[campo] = form[campo].value ? form[campo].value : null;
    });
    return returnForm;
  };

  return (
    <div style={styles.mainContainer}>
      {form ? (
        <Fragment>
          <div style={styles.title}>
            <h4>{formData.title}</h4>
          </div>
          <Grid container spacing={2}>
            {Object.keys(form).map((formItem, key) => {
              const campo = form[formItem];

              if (campo.readOnly) {
                return (
                  <Grid
                    key={key}
                    item
                    xs={12}
                    lg={campo.space ? campo.space : 12}
                  >
                    <div style={styles.readOnly}>
                      <TextField
                        id="outlined-basic"
                        type="text"
                        label={campo.label}
                        variant="outlined"
                        fullWidth
                        value={campo.value ? campo.value : ""}
                        inputProps={{ readOnly: true }}
                        onClick={campo.onClick}
                        multiline
                      />
                    </div>
                  </Grid>
                );
              }

              switch (campo.type) {
                case "select":
                  return (
                    <Grid
                      key={key}
                      item
                      xs={12}
                      lg={campo.space ? campo.space : 12}
                    >
                      <FormControl
                        variant="outlined"
                        disabled={campo.disabled ? true : false}
                        fullWidth
                      >
                        <InputLabel id="simple-select-outlined-label">
                          {campo.label}
                        </InputLabel>
                        <Select
                          labelId="simple-select-outlined-label"
                          id="demo-simple-select-outlined"
                          value={campo.value ? campo.value : 0}
                          onChange={(e) => preencher(formItem, e.target.value)}
                          label="Age"
                          fullWidth
                        >
                          {campo.emptyItem && (
                            <MenuItem value={0}>
                              <em>
                                {campo.emptyItemText
                                  ? campo.emptyItemText
                                  : "(Selecione)"}
                              </em>
                            </MenuItem>
                          )}

                          {campo.options &&
                            campo.options.map((option, key) => (
                              <MenuItem key={key} value={option.value}>
                                {option.desc}
                              </MenuItem>
                            ))}

                          {campo.array &&
                            campo.array.data &&
                            campo.array.data.map((option, key) => (
                              <MenuItem
                                key={key}
                                value={option[campo.array.value]}
                              >
                                {option[campo.array.desc]}
                              </MenuItem>
                            ))}

                          {campo.domain &&
                            Object.entries(campo.domain).map((entry, key) => {
                              if (entry[0] != "desc")
                                return (
                                  <MenuItem key={key} value={entry[1]}>
                                    {campo.domain.desc(entry[1])}
                                  </MenuItem>
                                );
                            })}
                        </Select>
                      </FormControl>
                    </Grid>
                  );

                case "select-multiple":
                  return (
                    <Grid
                      key={key}
                      item
                      xs={12}
                      lg={campo.space ? campo.space : 12}
                    >
                      <FormControl variant="outlined" fullWidth>
                        <Autocomplete
                          multiple
                          id="tags-standard"
                          options={campo.options}
                          getOptionLabel={(option) => option.desc}
                          value={
                            campo.value
                              ? campo.options.filter((o) =>
                                  campo.value.includes(o.value)
                                )
                              : []
                          }
                          onChange={(event, newValue) => {
                            preencherMultiplos(formItem, newValue);
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label={campo.label}
                              // placeholder="Favorites"
                            />
                          )}
                        />
                      </FormControl>
                    </Grid>
                  );

                case "date":
                  return (
                    <Grid
                      key={key}
                      item
                      xs={12}
                      lg={campo.space ? campo.space : 12}
                    >
                      <TextField
                        id="outlined-basic"
                        type={campo.type}
                        multiline={campo.type === "textarea" ? true : false}
                        rows={5}
                        label={campo.label}
                        error={campo.emptyError}
                        helperText={
                          campo.emptyError
                            ? "Campo obrigatório"
                            : campo.helperText
                        }
                        variant="outlined"
                        fullWidth
                        value={campo.value ? campo.value : ""}
                        onChange={(e) => preencher(formItem, e.target.value)}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                  );

                case "file":
                  return (
                    <Grid
                      key={key}
                      item
                      xs={12}
                      lg={campo.space ? campo.space : 12}
                    >
                      <TextField
                        id="outlined-basic"
                        type="file"
                        label={campo.label}
                        variant="outlined"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        fullWidth
                        accept={campo.accept}
                        onChange={(e) => fileUpload(e, formItem)}
                      />
                    </Grid>
                  );

                case "check":
                  return (
                    <Grid
                      key={key}
                      item
                      xs={12}
                      lg={campo.space ? campo.space : 12}
                    >
                      <FormControlLabel
                        disabled={campo.disabled ? true : false}
                        type={campo.type}
                        checked={campo.value ? campo.value : ""}
                        control={<Checkbox />}
                        label={campo.label}
                        labelPlacement="end"
                        onClick={campo.onClick}
                        onChange={(e) => preencher(formItem, e.target.checked)}
                      />
                    </Grid>
                  );

                case "component":
                  return (
                    <Grid
                      key={key}
                      item
                      xs={12}
                      lg={campo.space ? campo.space : 12}
                    >
                      {campo.value}
                    </Grid>
                  );

                default:
                  return (
                    <Grid
                      key={key}
                      item
                      xs={12}
                      lg={campo.space ? campo.space : 12}
                    >
                      <TextField
                        id="outlined-basic"
                        type={campo.type}
                        multiline={campo.type === "textarea" ? true : false}
                        rows={5}
                        label={campo.label}
                        error={campo.emptyError}
                        helperText={
                          campo.emptyError
                            ? "Campo obrigatório"
                            : campo.helperText
                        }
                        variant="outlined"
                        fullWidth
                        value={campo.value ? campo.value : ""}
                        onChange={(e) => preencher(formItem, e.target.value)}
                      />
                    </Grid>
                  );
              }
            })}
            <Grid key={"key"} item xs={12} xl={12}></Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item>
              {formData.submit && !formData.submit.auto && (
                <Button
                  variant="contained"
                  color="primary"
                  style={styles.btn}
                  onClick={() => submit()}
                >
                  {formData.submit.label}
                </Button>
              )}
              {formData.close && (
                <Button
                  color="secondary"
                  variant="contained"
                  style={styles.btnCancel}
                  onClick={() => close()}
                >
                  {formData.close.label ? formData.close.label : "Fechar"}
                </Button>
              )}
              {formData.customActions &&
                formData.customActions.map((action, key) => (
                  <Button
                    key={key}
                    variant="contained"
                    color={action.warning ? "error" : "info"}
                    style={styles.btn}
                    onClick={() => action.action(returnAction())}
                  >
                    {action.label}
                  </Button>
                ))}
            </Grid>
          </Grid>
        </Fragment>
      ) : (
        <CircularProgress />
      )}
    </div>
  );
};

export default DynamicForm;

const styles = {
  mainContainer: {
    marginTop: 15,
    marginBottom: 15,
    padding: 15,
    backgroundColor: "white",
    borderRadius: 10,
  },
  title: {
    paddingTop: 15,
    paddingBottom: 15,
  },
  btn: {
    marginRight: 15,
    marginTop: 15,
    color: "white",
  },
  btnCancel: {
    marginRight: 15,
    marginTop: 15,
    backgroundColor: "#929699",
  },
  readOnly: {
    color: "black",
    borderColor: "black",
  },
};

const getQueryParams = (query = "") => {
  if (query === "") return {};

  let params = {};

  query
    .replaceAll("%20", " ")
    .replace("?", "")
    .split("&")
    .filter((p) => p)
    .forEach((p) => (params[p.split("=")[0]] = p.split("=")[1]));

  return params;
};
