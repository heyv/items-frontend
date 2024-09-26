import React, { useState } from "react";
import PropTypes from "prop-types";

// @material-ui/core components
// import Table from '@material-ui/core/Table';
// import TableBody from '@material-ui/core/TableBody';
// import TableCell from '@material-ui/core/TableCell';
// import TableHead from '@material-ui/core/TableHead';
// import TableRow from '@material-ui/core/TableRow';
import Paper from "@mui/material/Paper";
import TableContainer from "@mui/material/TableContainer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

// import styles from 'assets/jss/material-kit-pro-react/components/tableStyle.js';

// const useStyles = makeStyles(styles);

export default function CustomTable(props) {
  const {
    tableHead,
    tableData,
    tableHeaderColor,
    hover,
    colorsColls,
    coloredColls,
    customCellClasses,
    customClassesForCells,
    striped,
    tableShopping,
    customHeadCellClasses,
    customHeadClassesForCells,
  } = props;

  const [selected, setSelected] = useState([]);
  // const classes = useStyles();

  const selecionar = (prop, key) => {
    if (!prop.props) {
      return;
    }
    const selectedIndex = selected.indexOf(prop);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, prop.props.children);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const isSelected = (name) => selected.indexOf(name) !== -1;

  return (
    <div>
      <TableContainer component={Paper}>
        <Table>
          {tableHead !== undefined ? (
            <TableHead>
              <TableRow>
                {tableHead.map((prop, key) => {
                  // const tableCellClasses =
                  //   classes.tableHeadCell +
                  //   ' ' +
                  //   classes.tableCell +
                  //   ' ' +
                  //   cx({
                  //     [customHeadCellClasses[
                  //       customHeadClassesForCells.indexOf(key)
                  //     ]]: customHeadClassesForCells.indexOf(key) !== -1,
                  //     [classes.tableShoppingHead]: tableShopping,
                  //   });
                  return <TableCell key={key}>{prop}</TableCell>;
                })}
              </TableRow>
            </TableHead>
          ) : null}
          <TableBody>
            {tableData.map((prop, key) => {
              var rowColor = "";
              var rowColored = false;
              if (prop.color !== undefined) {
                rowColor = prop.color;
                rowColored = true;
                prop = prop.data;
              }
              const isItemSelected = isSelected(prop);
              // const tableRowClasses = cx({
              //   [classes.tableRowHover]: hover,
              //   [classes[rowColor + 'Row']]: rowColored,
              //   [classes.tableStripedRow]: striped && key % 2 === 0,
              // });
              if (prop.total) {
                return (
                  <TableRow key={key} hover>
                    <TableCell colSpan={prop.colspan} />
                    <TableCell>Total</TableCell>
                    <TableCell>{prop.amount}</TableCell>
                    {tableHead.length - (prop.colspan - 0 + 2) > 0 ? (
                      <TableCell
                        colSpan={tableHead.length - (prop.colspan - 0 + 2)}
                      />
                    ) : null}
                  </TableRow>
                );
              }
              if (prop.purchase) {
                return (
                  <TableRow key={key} hover={hover}>
                    <TableCell colSpan={prop.colspan} />
                    <TableCell>Total</TableCell>
                    <TableCell>{prop.amount}</TableCell>
                    <TableCell colSpan={prop.col.colspan}>
                      {prop.col.text}
                    </TableCell>
                  </TableRow>
                );
              }
              return (
                <TableRow key={key} hover selected={isItemSelected}>
                  {prop.map((prop, key) => {
                    // const tableCellClasses =
                    //   classes.tableCell +
                    //   ' ' +
                    //   cx({
                    //     [classes[colorsColls[coloredColls.indexOf(key)]]]:
                    //       coloredColls.indexOf(key) !== -1,
                    //     [customCellClasses[customClassesForCells.indexOf(key)]]:
                    //       customClassesForCells.indexOf(key) !== -1,
                    //   });
                    return (
                      <TableCell
                        onClick={() => selecionar(prop, key)}
                        style={{ cursor: "pointer" }}
                        key={key}
                      >
                        {prop}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

CustomTable.defaultProps = {
  tableHeaderColor: "gray",
  hover: true,
  colorsColls: [],
  coloredColls: [],
  striped: false,
  customCellClasses: [],
  customClassesForCells: [],
  customHeadCellClasses: [],
  customHeadClassesForCells: [],
};

CustomTable.propTypes = {
  tableHeaderColor: PropTypes.oneOf([
    "warning",
    "primary",
    "danger",
    "success",
    "info",
    "rose",
    "gray",
  ]),
  tableHead: PropTypes.arrayOf(PropTypes.string),
  // Of(PropTypes.arrayOf(PropTypes.node)) || Of(PropTypes.object),
  tableData: PropTypes.array,
  hover: PropTypes.bool,
  coloredColls: PropTypes.arrayOf(PropTypes.number),
  // Of(["warning","primary","danger","success","info","rose","gray"]) - colorsColls
  colorsColls: PropTypes.array,
  customCellClasses: PropTypes.arrayOf(PropTypes.string),
  customClassesForCells: PropTypes.arrayOf(PropTypes.number),
  customHeadCellClasses: PropTypes.arrayOf(PropTypes.string),
  customHeadClassesForCells: PropTypes.arrayOf(PropTypes.number),
  striped: PropTypes.bool,
  // this will cause some changes in font
  tableShopping: PropTypes.bool,
};
