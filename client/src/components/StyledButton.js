import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Button from '@material-ui/core/Button';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import {useSelector} from 'react-redux';

// We can inject some CSS into the DOM.
const useStyles = makeStyles((theme) => ({
  root: {
    '& .MuiButton-root': {
      background: '#77d4ed',
      borderRadius: 12,
      border: 0,
      color: 'white',
      fontWeight: 'bold',
      fontSize: '104%',
      height: 45,
      padding: '0 30px',
      width: '100%',
      marginTop: '16px',
      letterSpacing: '1px',
      
      '&:hover': {
        background: '#67c4dd',
      },

      '&.dark': {
        color: '#00b2e2',

        '&:hover': {
          color: '#00a2d2',
        },
      }
    }    
  },
}));

function ClassNames(props) {
  const { children, ...other } = props;
  const classes = useStyles();
  const isContrast = useSelector(state => state.settings.isContrast);

  return (
    <div className={classes.root}>
      <Button className={isContrast ? 'dark' : 'light'} {...other}>
        {children || 'class names'}
      </Button>
    </div>    
  );
}

export default ClassNames;
