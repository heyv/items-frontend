import React, { Component, Fragment } from "react";
import IconButton from "@mui/material/IconButton";
import Checkbox from "@mui/material/Checkbox";
import Fab from "@mui/material/Fab";
import AddIcon from '@mui/icons-material/Add';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';

export default class ActionTable extends Component {
  getRowKeys(row) {
    if (this.props.structure.key) {
      const entry = Object.entries(row).filter(
        (entry) => this.props.structure.key === entry[0]
      );

      return entry[0][1];
    }

    if (this.props.structure.keys) {
      return Object.entries(row).filter((entry) =>
        this.props.structure.keys.includes(entry[0])
      );
    }

    return row;
  }

  renderCell(item, column) {
    if (column.checkbox) {
      return (
        <Checkbox
          checked={item[column.name]}
          disabled={!column.onCheck}
          onChange={(e) => column.onCheck(item, e.target.checked)}
        />
      );
    }

    if (column.domain) {
      return column.domain.desc(item[column.name]);
    }

    // if(column.html){
    //     return(
    //         <DangerouslyHtml text={item[column.name]}/>
    //     )
    // }

    // if(column.icon){
    //     return(
    //         <Icon iconProps={item[column.name]}/>
    //     )
    // }

    if (column.audio) {
      if (!item[column.name] || item[column.name] === "") return "";

      return (
        <audio preload="none" controls>
          <source src={item[column.name]} />
        </audio>
      );
    }

    if (column.image) {
      if (!item[column.name] || item[column.name] === "") return "";

      return (
        <img
          src={item[column.name]}
          alt="Imagem"
          className="media-object"
          width="100"
          height="100"
        />
      );
    }

    if (column.date) {
      return isoToSqlDate(item[column.name]);
    }

    if (column.link) {
      //return <a target="_blank" href="http://twitter.com">{item[column.name]}</a>
      return (
        <a target="_blank" href={item[column.link]}>
          {item[column.name]}
        </a>
      );
    }

    return item[column.name] ? item[column.name] : (column.emptyText ? column.emptyText : '-');
  }

  getColumnsFromArray(array) {
    const columns = [];

    if (array.length > 0) {
      Object.keys(array[0]).forEach((key) => {
        columns.push({
          name: key,
          label: key,
        });
      });
    }

    return columns;
  }

  render() {
    const { array, columns, actions, title, newItemAction, onLineClick } =
      this.props.structure;

    const renderColumns = columns
      ? columns.filter((c) => c.visible || c.visible === undefined)
      : this.getColumnsFromArray(array);

    return (
      <div>
        {newItemAction && (
          <div style={{paddingBottom: 10, paddingTop: 10, textAlign: 'right'}}>
            <Fab size="small" color="primary" aria-label="add" onClick={newItemAction}>
              <AddIcon style={{color: 'white'}} />
            </Fab>
          </div>
          
        )}

        <h4>{title}</h4>

        {array && array.map((item, rowIndex) => (
          <Card sx={{ minWidth: 275, marginTop: 2}} style={item.customStyle ? item.customStyle : {}}>
            <CardContent>
            {renderColumns && renderColumns.map((column, key) => (
              <div style={{marginBottom: 10}}>
                <h4>
                  {column.label}
                </h4>
                {this.renderCell(item, column)}
              </div>
            ))}
            </CardContent>
            {onLineClick &&
              <CardActions>
                <Button 
                  size="small"
                  variant={item.customStyle ? "contained" : "outlined"}
                  onClick={
                    onLineClick
                      ? () => onLineClick(this.getRowKeys(item))
                      : null
                  }
                >
                  Selecionar
                </Button>
              </CardActions>
            }
            {actions && (
              <CardActions>
                {actions.map((action, key) => (
                  <IconButton
                    key={key}
                    title={action.title ? action.title : ""}
                    className="text-warning"
                    aria-label="Delete"
                    onClick={() =>
                      action.action(this.getRowKeys(item), rowIndex)
                    }
                  >
                    <i className={action.icon}></i>
                  </IconButton>
                ))}
              </CardActions>
            )}
          </Card>
        ))}
      </div>
    );
  }
}

export function isoToSqlDate(isoDate) {
  if (!isoDate) return "0000-00-00";

  return isoDate.split("T")[0];
}
