import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import "fontsource-roboto";
import StyledButton from "./StyledButton";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary
  },
  formControl: {
    margin: theme.spacing(0),
    minWidth: 120
  },
  selectEmpty: {
    marginTop: theme.spacing(2)
  }
}));

export default function Swap(props) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Grid container spacing={0}>
        <Grid item xs={4}>
          <Paper className={classes.paper} square={true} elevation={0}>
            <Box textAlign="left"></Box>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper className={classes.paper} square={true} elevation={0}>
            <Box textAlign="center">
              <form className={classes.root} noValidate autoComplete="off">
                <StyledButton variant="contained" onClick={props.swapBranch}>
                  Swap
                </StyledButton>
              </form>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper className={classes.paper} square={true} elevation={0}>
            <Box textAlign="left"></Box>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
