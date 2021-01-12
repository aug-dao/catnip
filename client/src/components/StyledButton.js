import React, {useContext} from "react";
import Button from "@material-ui/core/Button";
import {makeStyles} from "@material-ui/core/styles";
import {AppContext} from "../contexts/AppContext";

// We can inject some CSS into the DOM.
const useStyles = makeStyles(() => ({
  root: {
    "& .MuiButton-root": {
      background: "#03caffe0",
      borderRadius: 12,
      border: 0,
      color: "white",
      fontWeight: "bold",
      fontSize: 11,
      height: 45,
      padding: "0 30px",
      width: "100%",
      marginTop: "16px",
      letterSpacing: "1px",

      "&:hover": {
        background: "#04b7e6e0"
      },

      "&.dark": {
        backgroundColor: "#00b2e2",

        "&:hover": {
          backgroundColor: "#00a2d2"
        }
      }
    }
  }
}));

function ClassNames(props) {
  const {children, ...other} = props;
  const classes = useStyles();
  const {isContrast} = useContext(AppContext);

  return (
    <div className={classes.root}>
      <Button className={isContrast ? "dark" : "light"} {...other}>
        {children || "class names"}
      </Button>
    </div>
  );
}

export default ClassNames;
