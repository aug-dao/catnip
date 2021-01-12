import React, { useState, useRef, useEffect, useContext } from "react";
import { AppContext } from "../contexts/AppContext";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import "fontsource-roboto";
import Typography from "@material-ui/core/Typography";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import DarkLogo from "../assets/images/dark_logo.png";
import discordIcon from "../assets/images/discordIcon.png";
import SettingsIcon from "@material-ui/icons/Settings";
import { HelpOutline } from "@material-ui/icons";
import Tooltip from "@material-ui/core/Tooltip";
import Button from "@material-ui/core/Button";
import { Web3Context } from "../contexts/Web3Context";
import StyledButton from "./StyledButton";

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
        marginBottom: "15px",

        "& .MuiSwitch-track": {
            border: "none",
            backgroundColor: "black"
        }
    },
    formControl: {
        margin: theme.spacing(0),
        minWidth: 120
    },
    selectEmpty: {
        marginTop: theme.spacing(2)
    },
    logo: {
        margin: "15px 0 0 15px"
    },
    discord_icon: {
        margin: "15px 20px 0 0"
    },
    darkmode_toggle: {
        marginTop: "17px"
    },
    custom_box: {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        position: "relative"
    },
    settings: {
        width: 36,
        height: 38,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 15,
        cursor: "pointer",
        borderRadius: 5,
        marginRight: 30,

        "&.light": {
            backgroundColor: "rgb(237, 238, 242)",
            "&:hover": {
                backgroundColor: "rgb(206, 208, 217)"
            }
        },

        "&.dark": {
            backgroundColor: "rgb(64, 68, 79)",
            "&:hover": {
                backgroundColor: "rgb(86, 90, 105)"
            }
        }
    },
    settings_part: {
        position: "absolute",
        top: 70,
        right: 20,
        padding: 15,
        borderRadius: 5,
        width: 370,
        textAlign: "left",
        boxShadow:
            "rgba(0, 0, 0, 0.01) 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 4px 8px, rgba(0, 0, 0, 0.04) 0px 16px 24px, rgba(0, 0, 0, 0.01) 0px 24px 32px",
        zIndex: 1,

        "&.light": {
            backgroundColor: "rgb(247, 248, 250)"
        },

        "&.dark": {
            backgroundColor: "rgb(44, 47, 54)"
        }
    },
    btn_groups: {
        display: "flex",
        alignItems: "center",

        "& button": {
            marginRight: 15,
            borderRadius: 20,
            outline: "none",
            boxShadow: "none",

            "&.selected": {
                backgroundColor: "rgb(33, 114, 229)",
                color: "white"
            }
        }
    },
    flex_item: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
    },
    slippage_btn: {
        borderRadius: 20,
        minWidth: 100,
        outline: "none !important",
        boxShadow: "none"
    },
    display_flex: {
        display: "flex",
        marginBottom: 10,
        "& .MuiTypography-root": {
            marginRight: 10
        }
    },
    about_icon: {
        margin: "17px 14px 0 0"
    },
    slippage_input: {
        padding: "6px 16px",
        borderRadius: 20,
        backgroundColor: "#e0e0e0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(0, 0, 0, 0.87)",
        width: 300,

        "& input": {
            width: 30,
            border: "none",
            outline: "none",
            background: "transparent",
            textAlign: "right"
        }
    }
}));

const IOSSwitch = withStyles(theme => ({
    root: {
        width: 42,
        height: 26,
        padding: 0,
        margin: theme.spacing(1)
    },
    switchBase: {
        padding: 1,
        "&$checked": {
            transform: "translateX(16px)",
            color: theme.palette.common.white,
            "& + $track": {
                backgroundColor: "#52d869",
                opacity: 1,
                border: "none"
            }
        },
        "&$focusVisible $thumb": {
            color: "#52d869",
            border: "6px solid #fff"
        }
    },
    thumb: {
        width: 24,
        height: 24
    },
    track: {
        borderRadius: 26 / 2,
        border: `1px solid ${theme.palette.grey[400]}`,
        backgroundColor: theme.palette.grey[50],
        opacity: 1,
        transition: theme.transitions.create(["background-color", "border"])
    },
    checked: {},
    focusVisible: {}
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
                checked: classes.checked
            }}
            {...props}
        />
    );
});

const slippage_list = ['0.1', '0.5', '1'];

export default function PageHeader() {
    const classes = useStyles();

    const { isContrast, toggleContrast, slippage, setSlippage } = useContext(
        AppContext
    );
    const { account, connectWeb3, disconnect } = useContext(Web3Context);
    const [showSettings, setShowSettings] = useState(false);

    const handleChangeSlippage = slippage => {
        setSlippage(slippage || '0');
    };

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
                                <img
                                    src={DarkLogo}
                                    width="100"
                                    alt="catnip-dark"
                                />
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
                    <Box
                        fontWeight="fontWeightBold"
                        textAlign="right"
                        className={classes.custom_box}
                    >
                        <a
                            className={classes.about_icon}
                            href="https://hackmd.io/@vI0VhzpxTLOQ3uSKoTaSmA/BJjSBMjuv#"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <HelpOutline
                                className={`question_logo ${
                                    isContrast ? "dark" : "light"
                                }`}
                            />
                        </a>
                        <a
                            href="https://twitter.com/share?ref_src=twsrc%5Etfw"
                            target="_blank"
                            className="twitter-share-button"
                            rel="noopener noreferrer"
                            data-text="Trade real world outcomes on Catnip Exchange"
                            data-related="catnip_exchange"
                            data-show-count="false"
                        >
                            Tweet
                        </a>
                        <a
                            href="https://discord.gg/a4hpuwd"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img
                                className={classes.discord_icon}
                                src={discordIcon}
                                alt="discord"
                                width="34"
                            />
                        </a>
                        <div
                            className={`${classes.settings} ${
                                isContrast ? "dark" : "light"
                            }`}
                        >
                            <SettingsIcon
                                onClick={() => setShowSettings(!showSettings)}
                            />
                        </div>
                        {!!showSettings && (
                            <div
                                className={`${classes.settings_part} ${
                                    isContrast ? "dark" : "light"
                                }`}
                                ref={ref}
                            >
                                <div className={classes.display_flex}>
                                    <Typography variant="body2" padding="20px">
                                        Slippage tolerance
                                    </Typography>
                                    <Tooltip
                                        title={
                                            <Typography color="inherit">
                                                Your transaction will revert if
                                                the price changes unfavorably by
                                                more than this percentage.
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
                                        {slippage_list.map(item => (
                                            <Button
                                                key={item.toString()}
                                                variant="contained"
                                                onClick={() =>
                                                    handleChangeSlippage(item)
                                                }
                                                className={`${
                                                    item === slippage
                                                        ? "selected"
                                                        : ""
                                                } ${
                                                    isContrast
                                                        ? "dark"
                                                        : "light"
                                                }`}
                                            >
                                                {item}%
                                            </Button>
                                        ))}
                                    </div>
                                    <div className={classes.slippage_input}>
                                        <input
                                            value={slippage}
                                            onChange={e =>
                                                handleChangeSlippage(
                                                    e.target.value
                                                )
                                            }
                                            type="number"
                                        />
                                        %
                                    </div>
                                </div>
                                <FormControlLabel
                                    className={classes.darkmode_toggle}
                                    control={
                                        <IOSSwitch
                                            checked={isContrast}
                                            onChange={toggleContrast}
                                        />
                                    }
                                    label="Dark Mode"
                                />
                                <Box>
                                    <StyledButton
                                        variant="contained"
                                        onClick={
                                            account ? disconnect : connectWeb3
                                        }
                                    >
                                        {account
                                            ? `Disconnect ${account.slice(
                                                  0,
                                                  6
                                              )}...${account.slice(-4)}`
                                            : "Connect Wallet"}
                                    </StyledButton>
                                </Box>
                            </div>
                        )}
                    </Box>
                </Grid>
            </Grid>
            <Grid container spacing={0}>
                <Grid item xs={8}></Grid>
                <Grid item xs={3}></Grid>
                <Grid item xs={1}></Grid>
            </Grid>
        </div>
    );
}
