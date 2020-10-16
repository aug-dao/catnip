import React from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import { useSelector, useDispatch } from "react-redux";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import "fontsource-roboto";
import Typography from "@material-ui/core/Typography";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import DarkLogo from "../assets/images/dark_logo.png";
import discordIcon from "../assets/images/discordIcon.png";
import TImg from "../assets/images/t.png";
import NTImg from "../assets/images/nt.png";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    marginBottom: "15px",

    "& .MuiSwitch-track": {
      border: "none",
      backgroundColor: "black",
    },
  },
  formControl: {
    margin: theme.spacing(0),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  logo: {
    margin: "15px 0 0 15px",
  },
  discord_icon: {
    margin: "15px 20px 0 0",
  },
  darkmode_toggle: {
    marginTop: "17px",
  },
}));

const IOSSwitch = withStyles((theme) => ({
  root: {
    width: 42,
    height: 26,
    padding: 0,
    margin: theme.spacing(1),
  },
  switchBase: {
    padding: 1,
    "&$checked": {
      transform: "translateX(16px)",
      color: theme.palette.common.white,
      "& + $track": {
        backgroundColor: "#52d869",
        opacity: 1,
        border: "none",
      },
    },
    "&$focusVisible $thumb": {
      color: "#52d869",
      border: "6px solid #fff",
    },
  },
  thumb: {
    width: 24,
    height: 24,
  },
  track: {
    borderRadius: 26 / 2,
    border: `1px solid ${theme.palette.grey[400]}`,
    backgroundColor: theme.palette.grey[50],
    opacity: 1,
    transition: theme.transitions.create(["background-color", "border"]),
  },
  checked: {},
  focusVisible: {},
}))(({ classes, ...props }) => {
  return (
    <Switch
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked,
      }}
      {...props}
    />
  );
});

export default function PageHeader(props) {
  const classes = useStyles();

  const isContrast = useSelector((state) => state.settings.isContrast);
  const dispatch = useDispatch();

  const handleChange = () => {
    if (isContrast) {
      dispatch({ type: "CLOSE_CONTRAST" });
    } else {
      dispatch({ type: "OPEN_CONTRAST" });
    }
  };

  return (
    <div className={classes.root}>
      <Grid container spacing={0}>
        <Grid item xs={3}>
          <Box textAlign="left">
            <div className={classes.logo}>
              {isContrast ? (
                <img src={DarkLogo} width="100" />
              ) : (
                <img
                  src={
                    "https://cdn.discordapp.com/attachments/744571125484224643/752307707708440606/catnip1.png"
                  }
                  alt="catnip"
                  width="100"
                />
              )}
            </div>
          </Box>
        </Grid>
        <Grid item xs={2}>
          <Box textAlign="left"></Box>
        </Grid>
        <Grid item xs={3}></Grid>
        <Grid item xs={4}>
          <Box fontWeight="fontWeightBold" textAlign="right">
            <a href="https://discord.gg/a4hpuwd" target="_blank">
              <img
                className={classes.discord_icon}
                src={discordIcon}
                width="34"
              />
            </a>
            <FormControlLabel
              className={classes.darkmode_toggle}
              control={
                <IOSSwitch checked={isContrast} onChange={handleChange} />
              }
              label="Dark Mode"
            />
          </Box>
        </Grid>
      </Grid>
      <Grid container spacing={0}>
        <Grid item xs={8}></Grid>
        <Grid item xs={3}>
        </Grid>
        <Grid item xs={1}></Grid>
      </Grid>
    </div>
  );
}
