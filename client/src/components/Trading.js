import React, { useState, useContext, useEffect } from 'react'
import {
    makeStyles,
    ThemeProvider,
    createMuiTheme,
    withStyles,
} from '@material-ui/core/styles'
import {
    Tooltip,
    Paper,
    Box,
    Grid,
    Container,
    InputBase,
    MenuItem,
    Select,
    Typography,
    Link,
} from '@material-ui/core'
import 'fontsource-roboto'
import StyledButton from './StyledButton'
import DImg from '../assets/images/d.png'
import flipUpIcon from '../assets/images/flipUp.svg'
import flipDownIcon from '../assets/images/flipDown.svg'
import maxIcon from '../assets/images/max.svg'
import classNames from 'classnames'
import { ExpandMore, InfoOutlined, HelpOutline } from '@material-ui/icons'
import 'bootstrap/dist/css/bootstrap.min.css'
import { AppContext } from '../contexts/AppContext'
import { Web3Context } from '../contexts/Web3Context'
import { TradingContext } from '../contexts/TradingContext'
import { LoadingOutlined } from '@ant-design/icons'
import { DAI_CONTRACT_ADDRESS, MARKETS, MARKET_INFO } from '../utils/constants'
import { timeConverter } from '../utils/helpers'
import { useHistory } from 'react-router-dom'

const useStyles = makeStyles(theme => ({
    textBox: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        height: '100%',
    },
    root: {
        flexGrow: 1,

        '& .flex-item': {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 4,
            textAlign: 'left',

            '&.last': {
                margin: 0,
            },
            '& .MuiLink-root': {
                color: '#00cbff',

                '&:hover': {
                    textDecoration: 'none',
                },
            },

            '& .MuiTypography-h6': {
                color: '#545454',
                marginBottom: '10px',
                lineHeight: '25px !important',
                fontSize: '1rem',
            },
        },

        '& .MuiTypography-h6': {
            lineHeight: '26px !important',
            marginBottom: '15px',
        },

        '& .Mui-disabled': {
            background: '#bbb',
        },

        '& .holding-status': {
            marginLeft: 15,
            padding: 20,
            paddingRight: 50,
            borderRadius: 8,
            border: 'none',
            boxShadow:
                'rgba(0, 0, 0, 0.01) 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 4px 8px, rgba(0, 0, 0, 0.04) 0px 16px 24px, rgba(0, 0, 0, 0.01) 0px 24px 32px',

            '& img': {
                width: 40,
                height: 40,
                borderRadius: 30,
                marginRight: 15,
            },
        },

        '& .box-light': {
            background: '#fff',
            border: 'none',
        },

        '& .box-dark': {
            background: '#212429',
        },

        '& span.yes': {
            color: '#50d94e',
            fontWeight: 'bold',
        },

        '& span.no': {
            color: '#f78689',
            fontWeight: 'bold',
        },

        '& .holding_num': {
            marginTop: '-8px',
        },

        '& .MuiSelect-root': {
            display: 'flex',
            alignItems: 'center',
            paddingRight: '50',
            lineHeight: '1.3',

            '&:focus': {
                backgroundColor: 'transparent',
            },

            '& img': {
                width: '25px',
                borderRadius: '25px',
                marginRight: '10px',
            },
        },

        '& hr': {
            '&.light': {
                border: '1px solid #ccc',
            },
            '&.dark': {
                border: '1px solid #5f5f5f',
            },
        },

        '& .main_part': {
            padding: '18px 16px 20px',
            textAlign: 'center',
            marginBottom: '10px',
            borderRadius: '30px',

            '&.light': {
                color: theme.palette.text.secondary,
                boxShadow:
                    'rgba(0, 0, 0, 0.01) 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 4px 8px, rgba(0, 0, 0, 0.04) 0px 16px 24px, rgba(0, 0, 0, 0.01) 0px 24px 32px',
            },

            '&.dark': {
                backgroundColor: 'rgb(33, 36, 41)',
                color: '#eaeaea !important',

                '& .MuiInputBase-root': {
                    color: 'white !important',
                },

                '& .MuiTypography-h6': {
                    color: '#eaeaea',
                },
                '& .Mui-disabled': {
                    background: '#717171',
                },
            },
        },

        '& .info_logo': {
            '&.dark': {
                '& .MuiSvgIcon-root': {
                    color: '#d8d8d8',
                },
            },
            '&.light': {
                '& .MuiSvgIcon-root': {
                    color: '#888',
                    marginTop: '1px',
                },
            },
        },

        '& .dark': {
            '& .MuiSvgIcon-root': {
                color: 'white',
            },
        },

        '& .light': {
            '& .MuiSvgIcon-root': {
                color: 'black',
            },
        },

        '& .main_footer': {
            '&.dark': {
                backgroundColor: 'black !important',
                '& .MuiTypography-body2': {
                    color: '#eaeaea',
                },
            },

            '&.light': {
                backgroundColor: 'transparent !important',
                '& .MuiTypography-body2': {
                    color: 'rgba(0, 0, 0, 0.54)',
                },
            },

            '& .MuiTypography-body2': {
                '&.green': {
                    color: '#25b525 !important',
                },
            },
        },

        '& .input-item': {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px',
            padding: '15px',
            borderRadius: '20px',

            '&.dark': {
                border: '1px solid #5f5f5f',
            },

            '&.light': {
                border: '1px solid rgb(247, 248, 250)',
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '5px',
    },
    width90: {
        width: '90%',
        margin: '0 auto',
    },
    no_price_impact: {
        color: '#202020',
        fontWeight: 'bold',
    },
    price_impact: {
        fontWeight: 'bold',
    },
    price_display: {
        fontWeight: 'bold',
        color: '#de4aa3',
        fontSize: '96%',
    },
    menu_item: {
        '& img': {
            width: '25px',
            marginRight: '15px',
            borderRadius: '20px',
        },
    },
    flex_Part: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',

        '& .select_part': {
            margin: '8px 0 18px',
            padding: 10,
            borderRadius: 10,

            '&.dark': {
                border: '1px solid #5f5f5f',
            },

            '&.light': {
                border: '1px solid rgb(247, 248, 250)',
            },
        },
    },
    info_icon: {
        width: '20px',
        marginTop: '2px',
        marginLeft: '18px',
    },
    flip: {
        clear: 'both',
        marginBottom: '8px',
        cursor: 'pointer',
    },
    balance_display: {
        width: '110px',
    },
    max_icon: {
        marginTop: '19px',
        cursor: 'pointer',
    },
    info_text: {
        '& p': {
            marginRight: 10,
        },
        '& .question_logo': {
            fontSize: 20,
            '&.light': {
                color: 'rgba(0, 0, 0, 0.54) !important',
            },
            '&.dark': {
                color: 'white',
            },
        },
    },
    tooltip: {
        fontSize: 18,
    },
    holdingsDisplay: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '0 auto 20px',
        border: '1px solid rgb(247, 248, 250)',
        borderRadius: '20px',
        float: 'left',
        verticalAlign: 'top',
    },
    disabled_button: {
        background: '#a7a8a9',
    },
    trading_volume: {
        textAlign: 'right',
        marginBottom: '14px',
        marginRight: '8px',
    },
    new_market: {
        textAlign: 'left',
        fontSize: '118%',
    },
    btn_control_groups: {
        display: 'flex',
        '& > div': {
            width: '45%',
            marginLeft: '2.5%',
            marginRight: '2.5%',
        },
    },
    tooltip_item: {
        marginBottom: 20,
    },
    custom_Tooltip: {
        position: 'absolute',
        top: -47,
        left: 40,
        background: '#6e6f70',
        minWidth: 370,
        textAlign: 'left',
        padding: 15,
        border: '1px solid white',
        color: 'white',
        borderRadius: 8,
        zIndex: 200,
    },
    marketInfo_link: {
        position: 'relative',
        padding: 10,
    },
}))

const iconStyles = {
    selectIcon: {
        color: 'black',
    },
}

const CustomExpandMore = withStyles(iconStyles)(
    ({ className, classes, ...rest }) => {
        return (
            <ExpandMore
                {...rest}
                className={classNames(className, classes.selectIcon)}
            />
        )
    }
)

export default function Trading({
    match: {
        params: { marketAddress },
    },
}) {
    const classes = useStyles()
    const { isContrast } = useContext(AppContext)
    const { account, connectWeb3 } = useContext(Web3Context)
    const {
        market,
        fromToken,
        fromAmount,
        fromAmountDisplay,
        fromAmountLoading,
        toToken,
        toAmountDisplay,
        toAmountLoading,
        balances,
        addTokenToMetamask,
        approve,
        isApprovalRequired,
        approveLoading,
        hasEnoughBalance,
        hasEnoughLiquidity,
        isSwapDisabled,
        reversePair,
        getMax,
        handleChange,
        yesPrice,
        noPrice,
        pricePerShare,
        swapBranch,
        priceImpact,
        maxProfit,
        priceImpactColor,
        minAmountReceived,
        impliedOdds,
        updateMarket,
    } = useContext(TradingContext)

    const history = useHistory()
    const changeMarket = e => {
        history.push(`/markets/${e.target.value}`)
    }

    useEffect(() => {
        if (MARKETS.indexOf(marketAddress) === -1) {
            history.push(`/`)
        } else {
            updateMarket(marketAddress.toLowerCase())
        }
    }, [marketAddress, history, updateMarket])

    const themeConfig = {
        overrides: {
            MuiPaper: {
                root: {
                    backgroundColor: 'rgb(33, 36, 41)',
                },
            },
            MuiButtonBase: {
                root: {
                    color: 'white',
                },
            },
            MuiTooltip: {
                tooltip: {
                    fontSize: 20,
                },
            },
        },
    }

    const theme = createMuiTheme(isContrast ? themeConfig : {})
    const [showMarketInfoTooltip, setShowMarketInfoTooltip] = useState(false)

    return (
        <div className={classes.root}>
            <Container>
                <Grid container spacing={0}>
                    <Grid item xs={false} sm={3} md={4}>
                        <Paper square={true} elevation={0}>
                            <Box fontWeight="fontWeightBold" textAlign="left" />
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Box textAlign="left">
                            {market.address === MARKETS[0] && (
                                <div className="slippage_alert">
                                    <strong>
                                        <span
                                            role="img"
                                            aria-label="fire-emoji"
                                        >
                                            &#128293;
                                        </span>{' '}
                                        Update Dec. 25th
                                    </strong>
                                    : Catnip now finds you the best price among
                                    multiple exchanges, using the 0x API.
                                </div>
                            )}
                        </Box>
                        <Paper
                            className={`main_part ${
                                isContrast ? 'dark' : 'light'
                            }`}
                            square={true}
                            elevation={0}
                        >
                            {market.address === MARKETS[2] && (
                                <div className={classes.new_market}>
                                    <span role="img" aria-label="fire-emoji">
                                        &#128293;
                                    </span>{' '}
                                    <strong> NEW MARKET </strong>
                                </div>
                            )}
                            <div className={classes.flex_Part}>
                                <div
                                    className={`select_part ${
                                        isContrast ? 'dark' : 'light'
                                    }`}
                                >
                                    <ThemeProvider theme={theme}>
                                        <Select
                                            onChange={changeMarket}
                                            name="market"
                                            disableUnderline
                                            value={marketAddress}
                                            style={{
                                                maxWidth: '310px',
                                                textAlign: 'left',
                                            }}
                                            IconComponent={CustomExpandMore}
                                        >
                                            <MenuItem value={MARKETS[2]}>
                                                {
                                                    MARKET_INFO[MARKETS[2]]
                                                        .marketQuestion
                                                }
                                            </MenuItem>
                                            <MenuItem value={MARKETS[1]}>
                                                {
                                                    MARKET_INFO[MARKETS[1]]
                                                        .marketQuestion
                                                }
                                            </MenuItem>
                                            <MenuItem value={MARKETS[0]}>
                                                {
                                                    MARKET_INFO[MARKETS[0]]
                                                        .marketQuestion
                                                }
                                            </MenuItem>
                                        </Select>
                                    </ThemeProvider>
                                </div>
                                <div
                                    onMouseEnter={() =>
                                        setShowMarketInfoTooltip(true)
                                    }
                                    onMouseLeave={() =>
                                        setShowMarketInfoTooltip(false)
                                    }
                                    className={classes.marketInfo_link}
                                >
                                    <a
                                        href={
                                            'https://predictionexplorer.com/market/' +
                                            market.address
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <div>
                                            <InfoOutlined />
                                        </div>
                                    </a>
                                    {market.info && showMarketInfoTooltip && (
                                        <div className={classes.custom_Tooltip}>
                                            <div
                                                className={classes.tooltip_item}
                                            >
                                                <Typography
                                                    color="inherit"
                                                    variant="h5"
                                                >
                                                    {
                                                        market.info.extraInfo
                                                            .description
                                                    }
                                                </Typography>
                                            </div>
                                            <div
                                                className={classes.tooltip_item}
                                            >
                                                <Typography
                                                    color="inherit"
                                                    variant="h5"
                                                >
                                                    Terms:
                                                </Typography>
                                                <Typography color="inherit">
                                                    {
                                                        market.info.extraInfo
                                                            .longDescription
                                                    }
                                                </Typography>
                                            </div>
                                            <div
                                                className={classes.tooltip_item}
                                            >
                                                <Typography
                                                    color="inherit"
                                                    variant="h5"
                                                >
                                                    Expiration date:
                                                </Typography>
                                                <Typography color="inherit">
                                                    {timeConverter(
                                                        market.info.endTime
                                                    )}
                                                </Typography>
                                            </div>
                                            <div
                                                className={classes.tooltip_item}
                                            >
                                                <Typography
                                                    color="inherit"
                                                    variant="h5"
                                                >
                                                    Market ID:
                                                </Typography>
                                                <Typography color="inherit">
                                                    {market.address}
                                                </Typography>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div
                                className={
                                    isContrast
                                        ? 'input-item dark'
                                        : 'input-item light'
                                }
                            >
                                <div className={classes.textBox}>
                                    <Typography variant="body2" align="left">
                                        From
                                    </Typography>
                                    {fromAmountLoading ? (
                                        <LoadingOutlined />
                                    ) : (
                                        <InputBase
                                            className={classes.margin}
                                            name="fromAmountDisplay"
                                            value={fromAmountDisplay}
                                            type="number"
                                            min="0"
                                            onChange={handleChange}
                                            inputProps={{
                                                style: {
                                                    fontSize: 24,
                                                    paddingRight: 10,
                                                },
                                            }}
                                        />
                                    )}
                                </div>

                                <img
                                    className={classes.max_icon}
                                    src={maxIcon}
                                    alt=""
                                    onClick={getMax}
                                />

                                <div>
                                    {balances[fromToken] && (
                                        <Typography
                                            className={classes.balance_display}
                                            variant="body2"
                                        >
                                            Balance: {balances[fromToken]}
                                        </Typography>
                                    )}
                                    {market.address === MARKETS[0] ? (
                                        <ThemeProvider theme={theme}>
                                            <Select
                                                disableUnderline
                                                name="fromToken"
                                                value={fromToken}
                                                onChange={handleChange}
                                                style={{
                                                    fontSize: 24,
                                                }}
                                                IconComponent={CustomExpandMore}
                                            >
                                                <MenuItem
                                                    value={market.info.yes}
                                                    className={
                                                        classes.menu_item
                                                    }
                                                >
                                                    <img
                                                        src={
                                                            market.info.yesIcon
                                                        }
                                                        alt=""
                                                    />{' '}
                                                    <span>YES</span>
                                                </MenuItem>
                                                <MenuItem
                                                    value={market.info.no}
                                                    className={
                                                        classes.menu_item
                                                    }
                                                >
                                                    <img
                                                        src={market.info.noIcon}
                                                        alt=""
                                                    />{' '}
                                                    <span>NO</span>
                                                </MenuItem>
                                                <MenuItem
                                                    value={DAI_CONTRACT_ADDRESS}
                                                    className={
                                                        classes.menu_item
                                                    }
                                                >
                                                    <img src={DImg} alt="" />{' '}
                                                    <span>DAI</span>
                                                </MenuItem>
                                            </Select>
                                        </ThemeProvider>
                                    ) : (
                                        <ThemeProvider theme={theme}>
                                            <Select
                                                disableUnderline
                                                name="fromToken"
                                                value={fromToken}
                                                onChange={handleChange}
                                                style={{
                                                    fontSize: 24,
                                                }}
                                                IconComponent={CustomExpandMore}
                                            >
                                                <MenuItem
                                                    value={market.info.yes}
                                                    className={
                                                        classes.menu_item
                                                    }
                                                >
                                                    <img
                                                        src={
                                                            market.info.yesIcon
                                                        }
                                                        alt=""
                                                    />{' '}
                                                    <span>YES</span>
                                                </MenuItem>
                                                <MenuItem
                                                    value={market.info.no}
                                                    className={
                                                        classes.menu_item
                                                    }
                                                >
                                                    <img
                                                        src={market.info.noIcon}
                                                        alt=""
                                                    />{' '}
                                                    <span>NO</span>
                                                </MenuItem>
                                                <MenuItem
                                                    value={DAI_CONTRACT_ADDRESS}
                                                    className={
                                                        classes.menu_item
                                                    }
                                                >
                                                    <img src={DImg} alt="" />{' '}
                                                    <span>DAI</span>
                                                </MenuItem>
                                            </Select>
                                        </ThemeProvider>
                                    )}
                                </div>
                            </div>
                            <div className={classes.flip} onClick={reversePair}>
                                <img src={flipUpIcon} alt="up arrow" />
                                <img src={flipDownIcon} alt="down arrow" />
                            </div>

                            <div
                                className={
                                    isContrast
                                        ? 'input-item dark'
                                        : 'input-item light'
                                }
                            >
                                <div>
                                    <Typography variant="body2" align="left">
                                        To
                                    </Typography>
                                    {toAmountLoading ? (
                                        <LoadingOutlined />
                                    ) : (
                                        <InputBase
                                            className={classes.margin}
                                            name="toAmountDisplay"
                                            value={toAmountDisplay}
                                            type="number"
                                            min="0"
                                            onChange={handleChange}
                                            inputProps={{
                                                style: {
                                                    fontSize: 24,
                                                    paddingRight: 10,
                                                },
                                            }}
                                        />
                                    )}
                                </div>
                                <div>
                                    {balances[toToken] && (
                                        <Typography
                                            className={classes.balance_display}
                                            variant="body2"
                                        >
                                            Balance: {balances[toToken]}
                                        </Typography>
                                    )}
                                    {market.address === MARKETS[0] ? (
                                        <ThemeProvider theme={theme}>
                                            <Select
                                                disableUnderline
                                                name="toToken"
                                                value={toToken}
                                                onChange={handleChange}
                                                style={{
                                                    fontSize: 24,
                                                }}
                                                IconComponent={CustomExpandMore}
                                            >
                                                <MenuItem
                                                    value={market.info.yes}
                                                    className={
                                                        classes.menu_item
                                                    }
                                                >
                                                    <img
                                                        src={
                                                            market.info.yesIcon
                                                        }
                                                        alt=""
                                                    />{' '}
                                                    <span>YES</span>
                                                </MenuItem>
                                                <MenuItem
                                                    value={market.info.no}
                                                    className={
                                                        classes.menu_item
                                                    }
                                                >
                                                    <img
                                                        src={market.info.noIcon}
                                                        alt=""
                                                    />{' '}
                                                    <span>NO</span>
                                                </MenuItem>
                                                <MenuItem
                                                    value={DAI_CONTRACT_ADDRESS}
                                                    className={
                                                        classes.menu_item
                                                    }
                                                >
                                                    <img src={DImg} alt="" />{' '}
                                                    <span>DAI</span>
                                                </MenuItem>
                                            </Select>
                                        </ThemeProvider>
                                    ) : (
                                        <ThemeProvider theme={theme}>
                                            <Select
                                                disableUnderline
                                                name="toToken"
                                                value={toToken}
                                                onChange={handleChange}
                                                style={{
                                                    fontSize: 24,
                                                }}
                                                IconComponent={CustomExpandMore}
                                            >
                                                <MenuItem
                                                    value={market.info.yes}
                                                    className={
                                                        classes.menu_item
                                                    }
                                                >
                                                    <img
                                                        src={
                                                            market.info.yesIcon
                                                        }
                                                        alt=""
                                                    />{' '}
                                                    <span>YES</span>
                                                </MenuItem>
                                                <MenuItem
                                                    value={market.info.no}
                                                    className={
                                                        classes.menu_item
                                                    }
                                                >
                                                    <img
                                                        src={market.info.noIcon}
                                                        alt=""
                                                    />{' '}
                                                    <span>NO</span>
                                                </MenuItem>
                                                <MenuItem
                                                    value={DAI_CONTRACT_ADDRESS}
                                                    className={
                                                        classes.menu_item
                                                    }
                                                >
                                                    <img src={DImg} alt="" />{' '}
                                                    <span>DAI</span>
                                                </MenuItem>
                                            </Select>
                                        </ThemeProvider>
                                    )}
                                </div>
                            </div>
                            {fromAmount.gt(0) && (
                                <div
                                    className={`${classes.displayFlex} ${classes.width90}`}
                                >
                                    <Typography variant="body2" padding="20px">
                                        Price per share:
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="textPrimary"
                                        padding="20px"
                                        className={classes.price_display}
                                    >
                                        {(fromToken === DAI_CONTRACT_ADDRESS ||
                                            toToken === DAI_CONTRACT_ADDRESS) &&
                                            '$'}
                                        {pricePerShare}
                                    </Typography>
                                </div>
                            )}
                            {impliedOdds > 0 &&
                                [market.info.yes, market.info.no].indexOf(
                                    fromToken
                                ) !== -1 && (
                                    <div
                                        className={`${classes.displayFlex} ${classes.width90}`}
                                    >
                                        <Typography
                                            variant="body2"
                                            padding="20px"
                                        >
                                            {`Implied Odds for ${
                                                toToken === market.info.yes
                                                    ? 'YES'
                                                    : 'NO'
                                            }:`}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="textPrimary"
                                            padding="20px"
                                            className={classes.price_display}
                                        >
                                            {impliedOdds}
                                            {'%'}
                                        </Typography>
                                    </div>
                                )}
                            {account ? (
                                hasEnoughLiquidity ? (
                                    hasEnoughBalance ? (
                                        isApprovalRequired ? (
                                            <StyledButton
                                                variant="contained"
                                                onClick={approve}
                                            >
                                                {approveLoading ? (
                                                    <LoadingOutlined />
                                                ) : (
                                                    'Approve'
                                                )}
                                            </StyledButton>
                                        ) : (
                                            <StyledButton
                                                variant="contained"
                                                onClick={swapBranch}
                                                disabled={isSwapDisabled}
                                            >
                                                Swap
                                            </StyledButton>
                                        )
                                    ) : (
                                        <StyledButton
                                            variant="contained"
                                            disabled
                                        >
                                            Insufficient Balance
                                        </StyledButton>
                                    )
                                ) : (
                                    <StyledButton variant="contained" disabled>
                                        Insufficient Liquidity
                                    </StyledButton>
                                )
                            ) : (
                                <StyledButton
                                    variant="contained"
                                    onClick={connectWeb3}
                                >
                                    Connect Wallet
                                </StyledButton>
                            )}
                        </Paper>
                        {fromAmount > 0 && (
                            <Paper
                                square={true}
                                elevation={0}
                                className={`main_footer ${
                                    isContrast ? 'dark' : 'light'
                                }`}
                            >
                                <Box textAlign="right">
                                    <form
                                        className={classes.root}
                                        noValidate
                                        autoComplete="off"
                                    >
                                        {fromToken === DAI_CONTRACT_ADDRESS && (
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
                                                                The estimated
                                                                amount you will
                                                                gain in DAI if
                                                                the market
                                                                resolves to{' '}
                                                                {toToken ===
                                                                market.info.yes
                                                                    ? 'YES'
                                                                    : 'NO'}
                                                                . Winning shares
                                                                pay out one DAI
                                                                each, and losing
                                                                shares pay out
                                                                zero.
                                                            </Typography>
                                                        }
                                                        placement="right"
                                                        className={
                                                            classes.tooltip
                                                        }
                                                    >
                                                        <HelpOutline
                                                            className={`question_logo ${
                                                                isContrast
                                                                    ? 'dark'
                                                                    : 'light'
                                                            }`}
                                                        />
                                                    </Tooltip>
                                                </div>
                                                <Typography
                                                    variant="body2"
                                                    color="textPrimary"
                                                    padding="20px"
                                                    className={
                                                        classes.no_price_impact
                                                    }
                                                >
                                                    ${maxProfit}
                                                </Typography>
                                            </div>
                                        )}
                                        {market.address !== MARKETS[0] && (
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
                                                                The difference
                                                                between the
                                                                market price and
                                                                the estimated
                                                                price you'll pay
                                                                due to trade
                                                                size. The larger
                                                                the trade, the
                                                                greater the
                                                                price impact.
                                                            </Typography>
                                                        }
                                                        placement="right"
                                                        className={
                                                            classes.tooltip
                                                        }
                                                    >
                                                        <HelpOutline
                                                            className={`question_logo ${
                                                                isContrast
                                                                    ? 'dark'
                                                                    : 'light'
                                                            }`}
                                                        />
                                                    </Tooltip>
                                                </div>
                                                <Typography
                                                    variant="body2"
                                                    color="textPrimary"
                                                    padding="20px"
                                                    className={[
                                                        priceImpactColor,
                                                        'bold',
                                                    ].join(' ')}
                                                >
                                                    {priceImpact >= 0.03
                                                        ? priceImpact + '%'
                                                        : '<0.03%'}
                                                </Typography>
                                            </div>
                                        )}
                                        {market.address === MARKETS[0] && (
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
                                                        Min Amount Received
                                                    </Typography>
                                                    <Tooltip
                                                        title={
                                                            <Typography color="inherit">
                                                                If the price
                                                                changes
                                                                unfavorably
                                                                after your
                                                                transaction is
                                                                submitted but
                                                                before it is
                                                                processed, then
                                                                your transaction
                                                                will be
                                                                reverted.
                                                            </Typography>
                                                        }
                                                        placement="right"
                                                        className={
                                                            classes.tooltip
                                                        }
                                                    >
                                                        <HelpOutline
                                                            className={`question_logo ${
                                                                isContrast
                                                                    ? 'dark'
                                                                    : 'light'
                                                            }`}
                                                        />
                                                    </Tooltip>
                                                </div>
                                                <Typography
                                                    variant="body2"
                                                    color="textPrimary"
                                                    padding="20px"
                                                    className="bold"
                                                >
                                                    {minAmountReceived}
                                                </Typography>
                                            </div>
                                        )}
                                    </form>
                                    <hr
                                        className={
                                            isContrast ? 'dark' : 'light'
                                        }
                                    />
                                </Box>
                            </Paper>
                        )}
                    </Grid>
                    {(!!yesPrice || !!noPrice) && (
                        <Grid
                            item
                            xs={12}
                            sm={6}
                            md={4}
                            style={{ margin: '0 auto' }}
                        >
                            {balances[market.info.yes] !== 0 ||
                            balances[market.info.no] !== 0 ? (
                                <div
                                    className={`holding-status ${
                                        isContrast ? 'box-dark' : 'box-light'
                                    }`}
                                >
                                    <div className="flex-item">
                                        <Typography
                                            variant="h6"
                                            fontWeight="fontWeightBold"
                                            padding="0px"
                                        >
                                            Holdings
                                        </Typography>
                                        <Typography variant="h6" padding="20px">
                                            Current Price
                                        </Typography>
                                    </div>
                                    <div className="flex-item">
                                        <div className="flex-item">
                                            <img
                                                src={market.info.yesIcon}
                                                display="inline"
                                                alt="yes-icon"
                                            />
                                            <div>
                                                <Typography>
                                                    {balances[market.info.yes]}{' '}
                                                    <span className="yes">
                                                        y
                                                    </span>
                                                    {market.info.symbolPostfix}
                                                </Typography>
                                                {window.ethereum && (
                                                    <Link
                                                        className="holding_num"
                                                        onClick={() =>
                                                            addTokenToMetamask(
                                                                market.info.yes
                                                            )
                                                        }
                                                        component="button"
                                                        variant="body2"
                                                    >
                                                        Show in wallet
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                        <Typography
                                            variant="body2"
                                            padding="20px"
                                        >
                                            ${yesPrice}
                                        </Typography>
                                    </div>
                                    <div className="flex-item last">
                                        <div className="flex-item">
                                            <img
                                                src={market.info.noIcon}
                                                display="inline"
                                                alt="no-icon"
                                            />
                                            <div>
                                                <Typography>
                                                    {balances[market.info.no]}{' '}
                                                    <span className="no">
                                                        no
                                                    </span>
                                                    {market.info.symbolPostfix}
                                                </Typography>
                                                {window.web3 &&
                                                    window.web3
                                                        .currentProvider && (
                                                        <Link
                                                            className="holding_num"
                                                            onClick={() =>
                                                                addTokenToMetamask(
                                                                    market.info
                                                                        .no
                                                                )
                                                            }
                                                            component="button"
                                                            variant="body2"
                                                        >
                                                            Show in wallet
                                                        </Link>
                                                    )}
                                            </div>
                                        </div>
                                        <Typography variant="body2">
                                            ${noPrice}
                                        </Typography>
                                    </div>
                                </div>
                            ) : (
                                ''
                            )}
                        </Grid>
                    )}
                </Grid>
            </Container>
        </div>
    )
}
