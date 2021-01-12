import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import Paper from "@material-ui/core/Paper";

const useStyles = makeStyles({
  table: {
    minWidth: 500,
    fontSize: 16
  }
});

export default function Status(props) {
  const classes = useStyles();
  if (props.bpoolAddress) {
    return (
      <div>
        <TableContainer component={Paper}>
          <Table
            className={classes.root}
            size="small"
            aria-label="a dense table"
          >
            <TableHead variant="body1">
              <TableRow>
                <TableCell style={{fontSize: 18}} align="center">
                  <strong>Token</strong>
                </TableCell>
                <TableCell style={{fontSize: 18}} align="center">
                  <strong>Contract balance</strong>
                </TableCell>
                <TableCell style={{fontSize: 18}} align="center">
                  <strong>Allowance</strong>
                </TableCell>
                <TableCell style={{fontSize: 18}} align="center">
                  <strong>Balance</strong>
                </TableCell>
                <TableCell style={{fontSize: 18}} align="center">
                  <strong>Normalized weight</strong>
                </TableCell>
                <TableCell style={{fontSize: 18}} align="center">
                  <strong>Denormalized weight</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody variant="body1">
              {props.statusArray.map(row => (
                <TableRow key={row[0]}>
                  <TableCell style={{fontSize: 18}} component="th" scope="row">
                    {row[1]}
                  </TableCell>
                  <TableCell style={{fontSize: 18}} align="right">
                    {row[2]}
                  </TableCell>
                  <TableCell style={{fontSize: 18}} align="right">
                    {row[3]}
                  </TableCell>
                  <TableCell style={{fontSize: 18}} align="right">
                    {row[4]}
                  </TableCell>
                  <TableCell style={{fontSize: 18}} align="right">
                    {row[5]}
                  </TableCell>
                  <TableCell style={{fontSize: 18}} align="right">
                    {row[6]}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    );
  } else {
    return null;
  }
}
