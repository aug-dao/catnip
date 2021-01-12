export default {
    network: 'mainnet',
    kovan: {
        dai: '0xb6085Abd65E21d205AEaD0b1b9981B8B221fA14E'.toLowerCase(),
        multicall: '0x2cc8688C5f75E365aaEEb4ea8D6a480405A48D2A'.toLowerCase(),
        markets: [
            '0x4dea3bedae79da692f2675038c4d9b8c246b4fb6'.toLowerCase(),
            '0xD3Ba2A2E641F61a5Bcb7a772C49BA6b78E1416e0'.toLowerCase(),
            '0xD3Ba2A2E641F61a5Bcb7a772C49BA6b78E1416e0'.toLowerCase(),
        ],
        marketInfo: {
            ['0x4dea3bedae79da692f2675038c4d9b8c246b4fb6'.toLowerCase()]: {
                yes: '0x1dbCcF29375304c38bd0d162f636BAA8Dd6CcE44'.toLowerCase(),
                no: '0xeb69840f09A9235df82d9Ed9D43CafFFea2a1eE9'.toLowerCase(),
                Invalid: '0x0d0Bd297350b49Ee96d5D4E15a12001928fDdB1e'.toLowerCase(),
                ['0x1dbCcF29375304c38bd0d162f636BAA8Dd6CcE44'.toLowerCase()]: 'yes',
                ['0xeb69840f09A9235df82d9Ed9D43CafFFea2a1eE9'.toLowerCase()]: 'no',
                ['0x0d0Bd297350b49Ee96d5D4E15a12001928fDdB1e'.toLowerCase()]: 'Invalid',
                pool: '0xacb57239c0d0c1c7e11a19c7af0f39a22749f9f0'.toLowerCase(),
                symbolPostfix: 'Trump',
                yesIcon:
                    'https://cloudflare-ipfs.com/ipfs/QmRWo92JEL6s2ydN1fK2Q3KAX2rzBnTnfqkABFYHmA5EUT',
                noIcon:
                    'https://cloudflare-ipfs.com/ipfs/QmUVCPwVDCTzM2kBxejB85MS2m3KRjSW7f2w81pSr8ZvTL',
                marketQuestion:
                    'Will Trump Win the 2020 U.S. Presidential Election?',
                extraInfo: {
                    categories: ['Politics', 'US Politics', 'President'],
                    description:
                        'Will DJ win the 2020 U.S. Presidential election?',
                    longDescription:
                        "The winning candidate will have at least 270 electoral votes to win the presidential election.\nThis market is intended to be about a Single Candidate, if this is not the case, this market should settle as 'Invalid'.",
                },
                endTime: '1606694400',
            },
            ['0xD3Ba2A2E641F61a5Bcb7a772C49BA6b78E1416e0'.toLowerCase()]: {
                yes: '0xaC9C1c55901c51b4ff78d957e66bbFE35580528B'.toLowerCase(),
                no: '0xF7EF92d2a34137dfa2d60A983eb68dbF0ec3db07'.toLowerCase(),
                ['0xaC9C1c55901c51b4ff78d957e66bbFE35580528B'.toLowerCase()]: 'yes',
                ['0xF7EF92d2a34137dfa2d60A983eb68dbF0ec3db07'.toLowerCase()]: 'no',
                pool: '0x494f67aa74c47b3e1B3568e74F9F44365a6c1133'.toLowerCase(),
                symbolPostfix: 'Anthony',
                yesIcon:
                    'https://cloudflare-ipfs.com/ipfs/QmUA2ExuPSRPHepiRqe3VH4oZKHkw6URoNtFB7UqHN8Vgh',
                noIcon:
                    'https://cloudflare-ipfs.com/ipfs/QmZfAjSUevTSJe5Lqg22vx4zAPGrkafDKz33LJG2GWoAqG',
                marketQuestion:
                    'Will the Democrats Win the Presidency, the Senate, and the House?',
                extraInfo: {
                    categories: ['Sports', 'Basketball', 'NBA'],
                    description:
                        ' Will Anthony Davis win the 2019-20 Defensive Player of the Year award?',
                    longDescription:
                        "In the event of an award given to more than 1 player. If the player mentioned in the market is one of the players who wins the award, the market should resolve as Yes.This market is intended to be about a Single Person, if this is not the case, this market should settle as 'Invalid'. If the award in the market question is not awarded for any reason by event expiration, this market should resolve as 'No'.",
                },
                endTime: '1605312000',
            },
        },
    },
    mainnet: {
        dai: '0x6B175474E89094C44Da98b954EedeAC495271d0F'.toLowerCase(),
        multicall: '0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441'.toLowerCase(),
        markets: [
            '0x1ebb89156091eb0d59603c18379c03a5c84d7355'.toLowerCase(),
            '0x6e6ffb10179febf29b0223d22793d1c1d8a8f541'.toLowerCase(),
            '0x0946A3Eab3d638c606459b0A9F1E76EB5324985F'.toLowerCase(),
        ],
        marketInfo: {
            ['0x1ebb89156091eb0d59603c18379c03a5c84d7355'.toLowerCase()]: {
                yes: '0x3af375d9f77Ddd4F16F86A5D51a9386b7B4493Fa'.toLowerCase(),
                no: '0x44Ea84a85616F8e9cD719Fc843DE31D852ad7240'.toLowerCase(),
                ['0x3af375d9f77Ddd4F16F86A5D51a9386b7B4493Fa'.toLowerCase()]: 'yes',
                ['0x44Ea84a85616F8e9cD719Fc843DE31D852ad7240'.toLowerCase()]: 'no',
                pool: '0xed0413d19cdf94759bbe3fe9981c4bd085b430cf'.toLowerCase(),
                symbolPostfix: 'Trump',
                yesIcon:
                    'https://cloudflare-ipfs.com/ipfs/QmRWo92JEL6s2ydN1fK2Q3KAX2rzBnTnfqkABFYHmA5EUT',
                noIcon:
                    'https://cloudflare-ipfs.com/ipfs/QmUVCPwVDCTzM2kBxejB85MS2m3KRjSW7f2w81pSr8ZvTL',
                marketQuestion:
                    'Will Trump Win the 2020 U.S. Presidential Election?',
                extraInfo: {
                    categories: ['Politics', 'US Politics', 'President'],
                    description:
                        'Will Donald Trump win the 2020 U.S. Presidential election?',
                    longDescription:
                        "A candidate that receives at least 270 votes in the Electoral College shall be considered the winner. In the event that no candidate receives 270 votes, the House of Representatives will decide the winner. In the event of further indecision or tie, it will be the candidate determined to be the winner under the US Constitution.\nThis market is intended to be about a Single Candidate, if this is not the case, this market should settle as 'Invalid'.",
                },
                endTime: '1611273600',
            },
            ['0x6e6ffb10179febf29b0223d22793d1c1d8a8f541'.toLowerCase()]: {
                yes: '0xf732ee9ccbf0df22f53fbdd9ec88d62df298fbf8'.toLowerCase(),
                no: '0x542439Eca879E52E03E0d6E87bcdCA165634245D'.toLowerCase(),
                ['0xf732ee9ccbf0df22f53fbdd9ec88d62df298fbf8'.toLowerCase()]: 'yes',
                ['0x542439Eca879E52E03E0d6E87bcdCA165634245D'.toLowerCase()]: 'no',
                pool: '0x68c74e157f35a3e40f1b02bba3e6e3827d534059'.toLowerCase(),
                symbolPostfix: 'Blue',
                yesIcon:
                    'https://cloudflare-ipfs.com/ipfs/QmUA2ExuPSRPHepiRqe3VH4oZKHkw6URoNtFB7UqHN8Vgh',
                noIcon:
                    'https://cloudflare-ipfs.com/ipfs/QmZfAjSUevTSJe5Lqg22vx4zAPGrkafDKz33LJG2GWoAqG',
                marketQuestion:
                    'Will the Democrats Win the Presidency, the Senate, and the House?',
                extraInfo: {
                    categories: ['Politics', 'US Elections', ''],
                    description:
                        'Will the Democratic Party Control the Presidency, the Senate, and the House of Representatives on February 1st, 2021?',
                    longDescription:
                        'This market shall resolve as YES if and only if all three of the following conditions are true at 00:00 UTC on February 1st, 2021:\n\n1. The last inaugurated president of the U.S. is affiliated with the U.S. Democratic Party.\n2. The Senate Majority Leader is affiliated with the U.S. Democratic Party. \n3. The majority of voting members of the House of Representatives are affiliated with the U.S. Democratic Party',
                },
                endTime: '1612137600',
            },
            ['0x0946A3Eab3d638c606459b0A9F1E76EB5324985F'.toLowerCase()]: {
                yes: '0x934E03e671E09528A52cb3373dc7Bb7CA475b924'.toLowerCase(),
                no: '0x55b2969a6D832c6091Ba1AF4ed6d0E6E7c2C0d90'.toLowerCase(),
                ['0x934E03e671E09528A52cb3373dc7Bb7CA475b924'.toLowerCase()]: 'yes',
                ['0x55b2969a6D832c6091Ba1AF4ed6d0E6E7c2C0d90'.toLowerCase()]: 'no',
                pool: '0x91ffe46e57d7c3f5f6e4f0856f2a674d0d820f93'.toLowerCase(),
                symbolPostfix: 'INAUG',
                yesIcon:
                    'https://cloudflare-ipfs.com/ipfs/Qmc14RQHBa9zezBYERJqMDAknkfmC14VN8coPz9KYiMKMU',
                noIcon:
                    'https://cloudflare-ipfs.com/ipfs/QmPPHjD2wYJzs46kfYrGFsELLj2a2NQjiKWtoHTs1yVvfF',
                marketQuestion:
                    'Will Donald Trump Attend the 2021 U.S. Presidential Inauguration?',
                extraInfo: {
                    categories: ['Politics', 'US Elections', 'Misc'],
                    description:
                        'Will 45th U.S. president Donald Trump physically attend the 59th U.S. presidential inauguration?',
                    longDescription:
                        'This market shall resolve as YES if and only if Donald Trump, the 45th U.S. president, physically attends the 59th U.S. presidential inauguration ceremony, scheduled for January 20th, 2021 at market creation time. The resolution of this market shall be based on general knowledge, as the ceremony has historically been widely covered by a number of media outlets, including video records.',
                    _scalarDenomination: '',
                    offsetName: null,
                    template: null,
                },
                endTime: '1611273600',
            },
        },
    },
}
