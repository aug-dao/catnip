import React, {useState, useRef, useEffect} from "react";
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
import SettingsIcon from '@material-ui/icons/Settings';
import { HelpOutline } from "@material-ui/icons";
import Tooltip from "@material-ui/core/Tooltip";
import Button from '@material-ui/core/Button';

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
  custom_box: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative'
  },
  settings: {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    cursor: 'pointer',    
    borderRadius: 5,
    marginRight: 12,

    '&.light': {
      backgroundColor: 'rgb(237, 238, 242)',
      '&:hover': {
        backgroundColor: 'rgb(206, 208, 217)'
      }
    },

    '&.dark': {
      backgroundColor: 'rgb(64, 68, 79)',
      '&:hover': {
        backgroundColor: 'rgb(86, 90, 105)'
      }
    },    
  },
  settings_part: {
    position: 'absolute',
    top: 70,
    right: 20,
    padding: 15,
    borderRadius: 5,
    width: 370,
    textAlign: 'left',
    boxShadow: 'rgba(0, 0, 0, 0.01) 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 4px 8px, rgba(0, 0, 0, 0.04) 0px 16px 24px, rgba(0, 0, 0, 0.01) 0px 24px 32px',

    '&.light': {
      backgroundColor: 'rgb(247, 248, 250)'
    },

    '&.dark': {
      backgroundColor: 'rgb(44, 47, 54)'
    }
  },
  btn_groups: {
    display: 'flex',
    alignItems: 'center',
    
    '& button': {
      marginRight: 15,
      borderRadius: 20,      
      outline: 'none',
      boxShadow: 'none',

      '&.selected': {
        backgroundColor: 'rgb(33, 114, 229)',
        color: 'white'
      }
    }
  },
  flex_item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  slippage_btn: {
    borderRadius: 20,
    minWidth: 100,
    outline: 'none !important',
    boxShadow: 'none'
  },
  display_flex: {
    display: 'flex',
    marginBottom: 10,
    '& .MuiTypography-root': {
      marginRight: 10,      
    }
  },
  slippage_input: {
    padding: '6px 16px',
    borderRadius: 20,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(0, 0, 0, 0.87)',

    '& input': {
      width: 30,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      textAlign: 'right',
    }
  }
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

const slippage_list = [0.1, 0.5, 1]

export default function PageHeader(props) {
  const classes = useStyles();

  const isContrast = useSelector((state) => state.settings.isContrast);
  const dispatch = useDispatch();
  const [showSettings, setShowSettings] = useState(false);
  const [slippage, setSlippage] = useState(props.slippage);

  const handleChange = () => {
    if (isContrast) {
      dispatch({ type: "CLOSE_CONTRAST" });
    } else {
      dispatch({ type: "OPEN_CONTRAST" });
    }
  };

  const handleChangeSlippage = (slippage) => {
    setSlippage(slippage);
    props.changeSlippage(slippage)
  }

  const ref = useRef();


  const handleClick = e => {
    if (ref.current && !ref.current.contains(e.target)) {
      setShowSettings(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  });

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
          <Box fontWeight="fontWeightBold" textAlign="right" className={classes.custom_box}>
            <a href="https://discord.gg/a4hpuwd" target="_blank">
              <img
                className={classes.discord_icon}
                src={discordIcon}
                width="34"
              />
            </a>
            <div className={`${classes.settings} ${isContrast ? 'dark' : 'light'}`}>
              <SettingsIcon onClick={() => setShowSettings(!showSettings)}/>
            </div>            
            {
              showSettings ? 
                <div className={`${classes.settings_part} ${isContrast ? 'dark' : 'light'}`} ref={ref}>                  
                    <div className={classes.display_flex}>
                      <Typography
                        variant="body2"                      
                        padding="20px"                        
                      >
                        Slippage tolerance
                      </Typography>
                      <Tooltip
                        title={
                          <Typography color="inherit">
                            The difference between the market price and the
                            estimated price you'll pay due to trade size. The
                            larger the trade, the greater the price impact.
                          </Typography>
                        }
                        placement="right"
                        className={classes.tooltip}
                      >
                        <HelpOutline
                          color="textPrimary"
                          className={`question_logo ${
                            isContrast ? "dark" : "light"
                          }`}
                        />
                      </Tooltip>
                    </div>
                    <div className={classes.flex_item}>
                      <div className={classes.btn_groups}>
                        {slippage_list.map((item) =>
                          <Button variant="contained" onClick={() => handleChangeSlippage(item)} className={`${item == slippage ? 'selected' : ''} ${isContrast ? 'dark' : 'light'}` }>
                            {item}%
                          </Button>                          
                        )}         
                      </div>
                      <div className={classes.slippage_input}>
                        <input value={slippage} onChange={(e) => handleChangeSlippage(e.target.value)} type="number"/>%
                      </div>                      
                    </div>
                    <FormControlLabel
                      className={classes.darkmode_toggle}
                      control={
                        <IOSSwitch checked={isContrast} onChange={handleChange} />
                      }
                      label="Dark Mode"
                    />
                </div> : 
                ''
            }            
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
