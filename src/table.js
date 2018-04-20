import React, { Component } from 'react';
import styled from 'styled-components';

import { Log as debug } from './debug'

import Player from './player'
import Pot from './pot'

const findPlayer = (players, label) => players.find(player => player.label == label);
const actionsForPlayer = (actions, player) => actions.filter(p => p.player == player.label);

const addToPlayersRunningTotal = (runningTotal, action) => {
    if (action.action === 'fold' || (runningTotal.player && runningTotal.player !== action.player)) {
        return runningTotal;
    }
    
    runningTotal.player = action.player;
    runningTotal.sum += action.amount;

    return runningTotal;
};

const totalBet = streetAction => {
    if (streetAction.length === 0) return 0;
    return streetAction.slice().reverse().reduce(addToPlayersRunningTotal, { sum: 0 }).sum;
};

const actionEvent = (action, amount, player) => ({ action, amount, player });
const foldEvent = actionEvent.bind(null, "fold", 0);
const postEvent = actionEvent.bind(null, "post");
const callEvent = actionEvent.bind(null, "call");


class Table extends Component {
    constructor(props) {
        super(props);

        this.state = {
            potSize: this.props.blinds.bb + this.props.blinds.sb,
            currentStreet: "preflop",
            action: {
                preflop: [
                    postEvent(props.blinds.sb, props.players[0].label),
                    postEvent(props.blinds.bb, props.players[1].label)
                ],
                flop: [],
                turn: [],
                river: []
            }
        };

        this.clickHandlers = {
            onCall: this.onCall.bind(this),
            onFold: this.onFold.bind(this)
        }
    }

    onFold(playerLabel) {
        this.setState(prevState => {
            const streetAction = prevState.action[prevState.currentStreet].slice();
            streetAction.push(foldEvent(playerLabel));
            
            return {
                action: {
                    [prevState.currentStreet]: streetAction
                }
            };
        });
    }

    onCheck(playerLabel) {
        this.setState(prevState => {
            const players = prevState.players.map(player => {
                if (player.label == playerLabel) {
                    player.lastAction = prevState.action.street;
                }

                return player;
            });
        });
    }

    onBet(playerLabel, amount) {
        this.setState(prevState => ({
            potSize: prevState.potSize + amount
        }));
    }

    onCall(playerLabel, amtCalled) {
        this.setState(prevState => {
            const streetAction = prevState.action[prevState.currentStreet].slice();
            streetAction.push(callEvent(amtCalled, playerLabel));
            
            return {
                action: {
                    [prevState.currentStreet]: streetAction
                },
                potSize: prevState.potSize + amtCalled
            };
        });
    }

    onRaise() {

    }

    render() {
        const streetAction = this.state.action[this.state.currentStreet];
        const totalCurrentBet = totalBet(streetAction);

        const playerSpots = this.props.players.map(player => {
            return (
                <Player
                    {...this.clickHandlers}
                    key={player.label}
                    label={player.label}
                    stack={player.stack}
                    streetAction={actionsForPlayer(streetAction, player)}
                    currentBet={totalCurrentBet} />
            )
        });

        return (
            <div>
                <Pot size={this.state.potSize} />
                {playerSpots}
            </div>
        )
    }
}

export default Table;