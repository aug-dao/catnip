import React from "react";
import {
  makeStyles,
  ThemeProvider,
  createMuiTheme,
} from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import "fontsource-roboto";
import Container from "@material-ui/core/Container";
import InputBase from "@material-ui/core/InputBase";
import { withStyles } from "@material-ui/core/styles";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Typography from "@material-ui/core/Typography";
import StyledButton from "./StyledButton";
import TImg from "../assets/images/t.png";
import NTImg from "../assets/images/nt.png";
import DImg from "../assets/images/d.png";
import infoIcon from "../assets/images/info.png";
import flipUpIcon from "../assets/images/flipUp.svg";
import flipDownIcon from "../assets/images/flipDown.svg";
import maxIcon from "../assets/images/max.svg";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import classNames from "classnames";
import { useSelector } from "react-redux";
import { InfoOutlined, HelpOutline } from "@material-ui/icons";
import Tooltip from "@material-ui/core/Tooltip";
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Link from "@material-ui/core/Link";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,

    "& .flex-item": {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 4,
      textAlign: "left",

      "&.last": {
        margin: 0,
      },
      "& .MuiLink-root": {
        color: "#00cbff",

        "&:hover": {
          textDecoration: "none",
        },
      },

      "& .MuiTypography-h6": {
        color: "#545454",
        marginBottom: "10px",
        lineHeight: "25px !important",
        fontSize: "1rem",
      },
    },

    "& .MuiTypography-h6": {
      lineHeight: "26px !important",
      marginBottom: "15px",
    },

    "& .Mui-disabled": {
      background: "#bbb",
    },

    "& .holding-status": {
      marginLeft: 15,
      padding: 20,
      paddingRight: 50,
      border: "1px solid #ccc",
      borderRadius: 8,
      border: "none",
      boxShadow:
        "rgba(0, 0, 0, 0.01) 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 4px 8px, rgba(0, 0, 0, 0.04) 0px 16px 24px, rgba(0, 0, 0, 0.01) 0px 24px 32px",

      "& img": {
        width: 40,
        height: 40,
        borderRadius: 30,
        marginRight: 15,
      },
    },

    "& .box-light": {
      background: "#fff",
      border: "none",
    },

    "& .box-dark": {
      background: "#212429",
    },

    "& span.yes": {
      color: "#50d94e",
      fontWeight: "bold",
    },

    "& span.no": {
      color: "#f78689",
      fontWeight: "bold",
    },

    "& .holding_num": {
      marginTop: "-8px",
    },

    "& .MuiSelect-root": {
      display: "flex",
      alignItems: "center",
      paddingRight: "50",

      "&:focus": {
        backgroundColor: "transparent",
      },

      "& img": {
        width: "25px",
        borderRadius: "25px",
        marginRight: "10px",
      },
    },

    "& hr": {
      "&.light": {
        border: "1px solid #ccc",
      },
      "&.dark": {
        border: "1px solid #5f5f5f",
      },
    },

    "& .main_part": {
      padding: "18px 16px 20px",
      textAlign: "center",
      marginBottom: "10px",
      borderRadius: "30px",

      "&.light": {
        color: theme.palette.text.secondary,
        boxShadow:
          "rgba(0, 0, 0, 0.01) 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 4px 8px, rgba(0, 0, 0, 0.04) 0px 16px 24px, rgba(0, 0, 0, 0.01) 0px 24px 32px",
      },

      "&.dark": {
        backgroundColor: "rgb(33, 36, 41)",
        color: "#eaeaea !important",

        "& .MuiInputBase-root": {
          color: "white !important",
        },

        "& .MuiTypography-h6": {
          color: "#eaeaea",
        },
        "& .Mui-disabled": {
          background: "#717171",
        },
      },
    },

    "& .info_logo": {
      "&.dark": {
        "& .MuiSvgIcon-root": {
          color: "#d8d8d8",
        },
      },
      "&.light": {
        "& .MuiSvgIcon-root": {
          color: "#888",
          marginTop: "1px",
        },
      },
    },

    "& .dark": {
      "& .MuiSvgIcon-root": {
        color: "white",
      },
    },

    "& .light": {
      "& .MuiSvgIcon-root": {
        color: "black",
      },
    },

    "& .main_footer": {
      "&.dark": {
        backgroundColor: "black !important",
        "& .MuiTypography-body2": {
          color: "#eaeaea",
        },
      },

      "&.light": {
        backgroundColor: "transparent !important",
        "& .MuiTypography-body2": {
          color: "rgba(0, 0, 0, 0.54)",
        },
      },

      "& .MuiTypography-body2": {
        "&.green": {
          color: "#25b525 !important",
        },
      },
    },

    "& .input-item": {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "20px",
      padding: "15px",
      borderRadius: "20px",
      float: "left",

      "&.dark": {
        border: "1px solid #5f5f5f",
      },

      "&.light": {
        border: "1px solid rgb(247, 248, 250)",
      },
    },
  },
  formControl: {
    margin: theme.spacing(0),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  displayFlex: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "5px",
  },
  width90: {
    width: "90%",
    margin: "0 auto",
  },
  no_price_impact: {
    color: "#202020",
    fontWeight: "bold",
  },
  price_impact: {
    fontWeight: "bold",
  },
  price_display: {
    fontWeight: "bold",
    color: "#de4aa3",
    fontSize: "96%",
  },
  menu_item: {
    "& img": {
      width: "25px",
      marginRight: "15px",
      borderRadius: "20px",
    },
  },
  float_left: {
    float: "left",
  },
  info_icon: {
    width: "20px",
    marginTop: "2px",
    marginLeft: "18px",
  },
  flip: {
    clear: "both",
    marginBottom: "12px",
    cursor: "pointer",
  },
  balance_display: {
    width: "110px",
  },
  max_icon: {
    marginTop: "19px",
    cursor: "pointer",
  },
  info_text: {
    "& p": {
      marginRight: 10,
    },
    "& .question_logo": {
      fontSize: 20,
      "&.light": {
        color: "rgba(0, 0, 0, 0.54) !important",
      },
      "&.dark": {
        color: "white",
      },
    },
  },
  tooltip: {
    fontSize: 18,
  },
  holdingsDisplay: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0 auto 20px",
    border: "1px solid rgb(247, 248, 250)",
    borderRadius: "20px",
    float: "left",
    verticalAlign: "top",
  },
  disabled_button: {
    background: "#a7a8a9",
  },
  trading_volume: {
    textAlign: "right",
    marginBottom: "14px",
    marginRight: "8px",
  },
}));

const iconStyles = {
  selectIcon: {
    color: "black",
  },
};

const CustomExpandMore = withStyles(iconStyles)(
  ({ className, classes, ...rest }) => {
    return (
      <ExpandMoreIcon
        {...rest}
        className={classNames(className, classes.selectIcon)}
      />
    );
  }
);

export default function Trading(props) {
  const classes = useStyles();
  const isContrast = useSelector((state) => state.settings.isContrast);

  const Theme = {
    overrides: {
      MuiPaper: {
        root: {
          backgroundColor: "rgb(33, 36, 41)",
        },
      },
      MuiButtonBase: {
        root: {
          color: "white",
        },
      },
      MuiTooltip: {
        tooltip: {
          fontSize: 20,
        },
      },
    },
  };

  const theme = createMuiTheme(Theme);

  return (
    <div className={classes.root}>
      <Container>
        <Grid container spacing={0}>
          <Grid item xs={false} sm={3} md={4}>
            <Paper square={true} elevation={0}>
              <Box fontWeight="fontWeightBold" textAlign="left"></Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box textAlign="left">
              { <div class="slippage_alert">
                <strong>Market Update, November 9:</strong> <b />We have pointed catnip to a new liquidity pool to facilitate the sale of *presumptive* winning shares (nTrump), traders may still access yTrump and the original pool <a href="https://catnip1.netlify.app/" target="_blank"> <strong>here.</strong>  </a>
                For more info see{" "}
                <a
                  href="https://medium.com/catnip-exchange/early-settlement-options-for-the-catnip-election-market-540843a0b1f6"
                  target="_blank"
                >
                  {" "}
                  this
                </a>
                .
              </div> }
            </Box>
            <Paper
              className={`main_part ${isContrast ? "dark" : "light"}`}
              square={true}
              elevation={0}
            >
              {/* {props.totalSwapVolume > 0 && (
                <div className={classes.trading_volume}>
                  <Typography variant="body2">
                    total volume: $
                    {((Number(props.totalSwapVolume) * 2.3) / 1000000).toFixed(
                      2
                    )}
                    {"M"}
                  </Typography>
                </div>
              )} */}
              <div className={classes.float_left}>
                <Typography
                  variant="h6"
                  color="textPrimary"
                  align="left"
                  fontWeight="fontWeightBold"
                >
                  Will Trump win the 2020 U.S. <br /> presidential election?
                </Typography>
              </div>
              <div>
                <a
                  href="https://predictionexplorer.com/market/0x1EBb89156091EB0d59603C18379C03A5c84D7355"
                  target="_blank"
                >
                  {/* <img className={classes.info_icon} src={infoIcon} alt="info icon"/> */}
                  <div className={`info_logo ${isContrast ? "dark" : "light"}`}>
                    <InfoOutlined />
                  </div>
                </a>
              </div>
              <div
                className={isContrast ? "input-item dark" : "input-item light"}
              >
                <div>
                  <Typography variant="body2" align="left">
                    From
                  </Typography>
                  <InputBase
                    autoFocus
                    className={classes.margin}
                    name="fromAmountDisplay"
                    value={props.fromAmountDisplay}
                    type="number"
                    min="0"
                    onChange={props.handleChange}
                    inputProps={{ style: { fontSize: 24, paddingRight: 10 } }}
                  />
                </div>

                <img
                  className={classes.max_icon}
                  src={maxIcon}
                  alt=""
                  onClick={props.getMax}
                />

                <div>
                  <Typography
                    className={classes.balance_display}
                    variant="body2"
                  >
                    Balance: {props.fromBalance}
                  </Typography>
                  {isContrast ? (
                    <ThemeProvider theme={theme}>
                      <Select
                        disableUnderline
                        name="fromToken"
                        value={props.fromToken}
                        onChange={props.handleChange}
                        style={{
                          fontSize: 24,
                        }}
                        IconComponent={CustomExpandMore}
                      >
                        {/* <MenuItem
                          value={props.yesContractAddress}
                          className={classes.menu_item}
                        >
                          <img src={TImg} alt="" /> <span>YES</span>
                        </MenuItem> */}
                        <MenuItem
                          value={props.noContractAddress}
                          className={classes.menu_item}
                        >
                          <img src={NTImg} alt="" /> <span>NO</span>
                        </MenuItem>
                        <MenuItem
                          value={props.daiContractAddress}
                          className={classes.menu_item}
                        >
                          <img src={DImg} alt="" /> <span>DAI</span>
                        </MenuItem>
                      </Select>
                    </ThemeProvider>
                  ) : (
                    <Select
                      disableUnderline
                      name="fromToken"
                      value={props.fromToken}
                      onChange={props.handleChange}
                      style={{
                        fontSize: 24,
                      }}
                      IconComponent={CustomExpandMore}
                    >
                      <MenuItem
                        value={props.yesContractAddress}
                        className={classes.menu_item}
                      >
                        <img src={TImg} alt="" /> <span>YES</span>
                      </MenuItem>
                      <MenuItem
                        value={props.noContractAddress}
                        className={classes.menu_item}
                      >
                        <img src={NTImg} alt="" /> <span>NO</span>
                      </MenuItem>
                      <MenuItem
                        value={props.daiContractAddress}
                        className={classes.menu_item}
                      >
                        <img src={DImg} alt="" /> <span>DAI</span>
                      </MenuItem>
                    </Select>
                  )}
                </div>
              </div>
              <div className={classes.flip} onClick={props.reversePair}>
                <img src={flipUpIcon} alt="up arrow" />
                <img src={flipDownIcon} alt="down arrow" />
              </div>

              <div
                className={isContrast ? "input-item dark" : "input-item light"}
              >
                <div>
                  <Typography variant="body2" align="left">
                    To
                  </Typography>
                  <InputBase
                    className={classes.margin}
                    name="toAmountDisplay"
                    value={props.toAmountDisplay}
                    type="number"
                    min="0"
                    onChange={props.handleChange}
                    inputProps={{ style: { fontSize: 24, paddingRight: 10 } }}
                  />
                </div>
                <div>
                  <Typography
                    className={classes.balance_display}
                    variant="body2"
                  >
                    Balance: {props.toBalance}
                  </Typography>
                  {isContrast ? (
                    <ThemeProvider theme={theme}>
                      <Select
                        disableUnderline
                        name="toToken"
                        value={props.toToken}
                        onChange={props.handleChange}
                        style={{
                          fontSize: 24,
                        }}
                        IconComponent={CustomExpandMore}
                      >
                        {/* <MenuItem
                          value={props.yesContractAddress}
                          className={classes.menu_item}
                        >
                          <img src={TImg} alt="" /> <span>YES</span>
                        </MenuItem> */}
                        <MenuItem
                          value={props.noContractAddress}
                          className={classes.menu_item}
                        >
                          <img src={NTImg} alt="" /> <span>NO</span>
                        </MenuItem>
                        <MenuItem
                          value={props.daiContractAddress}
                          className={classes.menu_item}
                        >
                          <img src={DImg} alt="" /> <span>DAI</span>
                        </MenuItem>
                      </Select>
                    </ThemeProvider>
                  ) : (
                    <Select
                      disableUnderline
                      name="toToken"
                      value={props.toToken}
                      onChange={props.handleChange}
                      style={{
                        fontSize: 24,
                      }}
                      IconComponent={CustomExpandMore}
                    >
                      <MenuItem
                        value={props.yesContractAddress}
                        className={classes.menu_item}
                      >
                        <img src={TImg} alt="" /> <span>YES</span>
                      </MenuItem>
                      <MenuItem
                        value={props.noContractAddress}
                        className={classes.menu_item}
                      >
                        <img src={NTImg} alt="" /> <span>NO</span>
                      </MenuItem>
                      <MenuItem
                        value={props.daiContractAddress}
                        className={classes.menu_item}
                      >
                        <img src={DImg} alt="" /> <span>DAI</span>
                      </MenuItem>
                    </Select>
                  )}
                </div>
              </div>
              {props.fromAmount > 0 && (
                <div className={`${classes.displayFlex} ${classes.width90}`}>
                  <Typography variant="body2" padding="20px">
                    Price per share:
                  </Typography>

                  <Typography
                    variant="body2"
                    color="textPrimary"
                    padding="20px"
                    className={classes.price_display}
                  >
                    {(props.fromToken === props.daiContractAddress ||
                      props.toToken === props.daiContractAddress) &&
                      "$"}
                    {props.pricePerShare}
                  </Typography>
                </div>
              )}
              {props.impliedOdds > 0 && (
                <div className={`${classes.displayFlex} ${classes.width90}`}>
                  <Typography variant="body2" padding="20px">
                    Implied Odds for{" "}
                    {props.toToken === props.yesContractAddress ? "YES" : "NO"}
                    {":"}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="textPrimary"
                    padding="20px"
                    className={classes.price_display}
                  >
                    {props.fromToken === props.yesContractAddress ||
                      props.fromToken === props.noContractAddress}
                    {props.impliedOdds}
                    {"%"}
                  </Typography>
                </div>
              )}
              {props.accounts ? (
                props.hasEnoughBalance ? (
                  props.isApproveRequired ? (
                    <div>
                      <StyledButton
                        variant="contained"
                        onClick={props.approve}
                        disabled={props.isSwapDisabled}
                      >
                        Approve
                      </StyledButton>
                      <StyledButton variant="contained" disabled>
                        Swap
                      </StyledButton>
                    </div>
                  ) : (
                    <StyledButton
                      variant="contained"
                      onClick={props.swapBranch}
                      disabled={props.isSwapDisabled}
                    >
                      Swap
                    </StyledButton>
                  )
                ) : (
                  <StyledButton variant="contained" disabled>
                    Insufficient Balance
                  </StyledButton>
                )
              ) : (
                <StyledButton variant="contained" onClick={props.connectWallet}>
                  connect Wallet
                </StyledButton>
              )}
            </Paper>
            <Modal
              className={classes.modal_display}
              show={props.show}
              onHide={props.hideModal}
              backdrop="static"
              keyboard={false}
            >
              <Modal.Header closeButton>
                <Modal.Title>Metamask is not installed</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <div className="loadAlert">
                  Please make sure to install{" "}
                  <a href="https://metamask.io/" target="_blank">
                    MetaMask
                  </a>{" "}
                  to use catnip. meow.
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  className={classes.cta_button}
                  variant="primary"
                  onClick={() => window.open("https://metamask.io/", "_blank")}
                >
                  Go to Metamask.io
                </Button>
              </Modal.Footer>
            </Modal>
            {props.fromAmount > 0 && (
              <Paper
                square={true}
                elevation={0}
                className={`main_footer ${isContrast ? "dark" : "light"}`}
              >
                <Box textAlign="right">
                  <form className={classes.root} noValidate autoComplete="off">
                    {props.fromToken === props.daiContractAddress && (
                      <div
                        className={`${classes.displayFlex} ${classes.width90}`}
                      >
                        <div
                          className={`${classes.displayFlex} ${classes.info_text}`}
                        >
                          <Typography
                            variant="body2"
                            color="textPrimary"
                            padding="20px"
                          >
                            Max profit
                          </Typography>
                          <Tooltip
                            title={
                              <Typography>
                                The estimated amount you will gain in DAI if the
                                market resolves to{" "}
                                {props.toToken === props.yesContractAddress
                                  ? "YES"
                                  : "NO"}
                                . Winning shares pay out one DAI each, and
                                losing shares pay out zero.
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
                        <Typography
                          variant="body2"
                          color="textPrimary"
                          padding="20px"
                          className={classes.no_price_impact}
                        >
                          ${props.maxProfit}
                        </Typography>
                      </div>
                    )}
                    <div
                      className={`${classes.displayFlex} ${classes.width90}`}
                    >
                      <div
                        className={`${classes.displayFlex} ${classes.info_text}`}
                      >
                        <Typography
                          variant="body2"
                          color="textPrimary"
                          padding="20px"
                        >
                          Price impact
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
                      <Typography
                        variant="body2"
                        color="textPrimary"
                        padding="20px"
                        className={[props.priceImpactColor, "bold"].join(" ")}
                      >
                        {props.priceImpact >= 0.03
                          ? props.priceImpact + "%"
                          : "<0.03%"}
                      </Typography>
                    </div>
                  </form>
                  <hr className={isContrast ? "dark" : "light"} />
                </Box>
              </Paper>
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={4} style={{ margin: "0 auto" }}>
            {props.yesBalance != 0 || props.noBalance != 0 ? (
              <div
                className={`holding-status ${
                  isContrast ? "box-dark" : "box-light"
                }`}
              >
                <div className="flex-item">
                  <Typography
                    variant="h6"
                    textAlign="center"
                    fontWeight="fontWeightBold"
                    padding="0px"
                  >
                    Holdings
                  </Typography>
                  <Typography variant="h6" textAlign="center" padding="20px">
                    Current Price
                  </Typography>
                </div>
                <div className="flex-item">
                  <div className="flex-item">
                    <img src={TImg} display="inline" />
                    <div>
                      <Typography>
                        {props.yesBalance} <span className="yes">y</span>Trump
                      </Typography>
                      <Link
                        className="holding_num"
                        onClick={props.AddYesTokenToMetamask}
                        component="button"
                        variant="body2"
                      >
                        {" "}
                        Show in wallet
                      </Link>
                    </div>
                  </div>
                  <Typography variant="body2" textAlign="center" padding="20px">
                    ${props.yesPrice}
                  </Typography>
                </div>
                <div className="flex-item last">
                  <div className="flex-item">
                    <img src={NTImg} display="inline" />
                    <div>
                      <Typography>
                        {props.noBalance} <span className="no">n</span>Trump
                      </Typography>
                      <Link
                        className="holding_num"
                        onClick={props.AddNoTokenToMetamask}
                        component="button"
                        variant="body2"
                      >
                        {" "}
                        Show in wallet
                      </Link>
                    </div>
                  </div>
                  <Typography
                    variant="body2"
                    textAlign="center"
                    marginTop="1150px"
                  >
                    ${props.noPrice}
                  </Typography>
                </div>
              </div>
            ) : (
              ""
            )}
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}
