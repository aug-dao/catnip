import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import 'fontsource-roboto';
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  formControl: {
    margin: theme.spacing(0),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

export default function MarketHeader(props) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Grid container spacing={0} >
        <Grid item xs={4}>
          <Paper className={classes.paper} square={true} elevation={0}>
            <Box fontWeight="fontWeightBold" textAlign="left">   
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper className={classes.paper} square={true} elevation={0}>
            <Box fontWeight="fontWeightBold" textAlign="left">   
              <Typography variant="h6" color="textPrimary"  align="left" fontWeight="fontWeightBold" >
                  Will Trump win the 2020 U.S. presidential election?
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper className={classes.paper} square={true} elevation={0}>
            <Box fontWeight="fontWeightBold" textAlign="left">   
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
