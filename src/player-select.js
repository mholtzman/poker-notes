import React, { Component } from 'react';
import styled from 'styled-components';
import { RIENumber } from 'riek'

import Table from './table'

const allStakes = [
    {
        "label": "$1/3 NL",
        "blinds": {
            "num": 2,
            "sb": 1,
            "bb": 3
        }
    },
    {
        "label": "$2/5 NL",
        "blinds": {
            "num": 2,
            "sb": 2,
            "bb": 5
        }
    }
];

const playerPositions = ["SB", "BB", "UTG", "UTG1", "UTG2", "MP1", "MP2", "HJ", "CO", "BTN"];

const player = (label, stack) => ({
    label, stack
});

const buyin = bb => bb * 100; // 100 big blinds
const createPlayer = (label, bb) => player(label, buyin(bb));

const createPlayers = (labels, blinds) => {
    const players = labels.map(label => createPlayer(label, blinds.bb));
    players[0].amountBet = blinds.sb;    
    players[1].amountBet = blinds.bb;

    return players;
}

export class PlayerSelect extends Component {
    constructor(props) {
        super(props)
        
        this.state = {
            stakes: allStakes[0],
            numPlayers: allStakes[0].blinds.num
        };

        this.changeStakes = this.changeStakes.bind(this);
        this.changeNumPlayers = this.changeNumPlayers.bind(this);
    }

    changeStakes(event) {
        const stake = allStakes[parseInt(event.target.value)];

        console.log(`changing stakes to ${stake.label}`)
        this.setState({ stakes: stake })
    }

    changeNumPlayers(event) {
        const numPlayers = parseInt(event.target.value);

        console.log(`changing num players to ${numPlayers}`)
        this.setState({ numPlayers })
    }

    render() {
        const numBlinds = this.state.stakes.blinds.num;

        const tableSpots = [
            ...playerPositions.slice(0, numBlinds),
            ...playerPositions.slice(playerPositions.length - 
                (this.state.numPlayers - numBlinds))
        ];

        const players = tableSpots.map(label => createPlayer(label, this.state.stakes.blinds.bb));

        return (
            <div>
                <div>
                    <label>Stakes:
                        <select name="stakes" id="stakes-select" onChange={this.changeStakes}>
                            {allStakes.map((stake, i) => {
                                return (
                                    <option key={i} value={i}>{stake.label}</option>
                                )
                            })}
                        </select>
                    </label>
                </div>
                <div>
                    <label>Number of players:
                    <select name="numberOfPlayers" id="num-players-select" onChange={this.changeNumPlayers}>
                            {[...Array(playerPositions.length + 1).keys()].slice(numBlinds).map(num => {
                                return (
                                    <option key={num} value={num}>{num}</option>
                                )
                            })}
                        </select>
                    </label>
                </div>
                <Table
                    blinds={this.state.stakes.blinds}
                    players={players} />
            </div>
        )
    }
}