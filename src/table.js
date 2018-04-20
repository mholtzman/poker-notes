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
const checkEvent = actionEvent.bind(null, "check", 0);
const postEvent = actionEvent.bind(null, "post");
const callEvent = actionEvent.bind(null, "call");


class Table extends Component {
    constructor(props) {
        super(props);

        this.state = {
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
            onCheck: this.onCheck.bind(this),
            onCall: this.onCall.bind(this),
            onFold: this.onFold.bind(this)
        }
    }

    calculatePot() {
        let total = 0;
        for (let street in this.state.action) {
            total += this.state.action[street].reduce((sum, event) => sum + event.amount, 0);
        }

        return total;
    }

    onFold(playerLabel) {
        this.setState(prevState => {
            let action = prevState.action;
            
            const lastAction = this.lastAction(prevState);
            let lastActor = this.nextPlayer(lastAction.player).label;

            while (lastActor !== playerLabel) {
                action = this.addAction(action, prevState.currentStreet, foldEvent(lastActor));
                lastActor = this.nextPlayer(lastActor).label;
            }
            
            action = this.addAction(action, prevState.currentStreet, foldEvent(playerLabel));
            
            return {
                action
            };
        });
    }

    onCheck(playerLabel) {
        this.setState(prevState => ({
            action: this.addAction(prevState.action, prevState.currentStreet, checkEvent(playerLabel))
        }));
    }

    onBet(playerLabel, amount) {
        this.setState(prevState => ({
            potSize: prevState.potSize + amount
        }));
    }

    onCall(playerLabel, amtCalled) {
        this.setState(prevState => ({
            action: this.addAction(prevState.action, prevState.currentStreet, callEvent(amtCalled, playerLabel))
        }));
    }

    onRaise() {

    }

    nextPlayer(playerLabel) {
        const index = this.props.players.findIndex(p => {
            debug`label: ${p.label} playerLabel: ${playerLabel}`
            return p.label === playerLabel
        });

        debug`player:${this.props.players[index + 1]}`
        return (index === this.props.players.length - 1) ? 
            this.props.players[0] : this.props.players[index + 1];
    }

    lastAction = state => state.action[state.currentStreet].slice().pop();

    addAction(action, currentStreet, event) {
        const streetAction = action[currentStreet].slice();
        streetAction.push(event);

        return { ...action, [currentStreet]: streetAction };
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
                <Pot size={this.calculatePot()} />
                {playerSpots}
            </div>
        )
    }
}

export default Table;