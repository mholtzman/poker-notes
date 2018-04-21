import React, { Component } from 'react';
import styled from 'styled-components';

import { Log as debug } from './debug'

import Player from './player'
import Pot from './pot'
import Actions, { Fold, Check, Post, Call, Bet, Raise } from './action-events'

const playerLabels = players => players.map(p => p.label);
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

const getStreetAction = state => state.action[state.currentStreet];
const getLastAction = state => Actions.last(state.action[state.currentStreet]);
const updateStreet = (prevState, updatedAction) => ({
    action: {
        ...prevState.action,
        [prevState.currentStreet]: updatedAction
    }
});

class Table extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentStreet: "preflop",
            action: {
                preflop: [
                    Post(props.blinds.sb, props.players[0].label),
                    Post(props.blinds.bb, props.players[1].label)
                ],
                flop: [],
                turn: [],
                river: []
            }
        };

        this.clickHandlers = {
            onCheck: this.onCheck.bind(this),
            onCall: this.onCall.bind(this),
            onFold: this.onFold.bind(this),
            onRaise: this.onRaise.bind(this)
        }
    }

    onFold(playerLabel) {
        const playerAction = Fold(playerLabel);
        this.setState(prevState =>
            this.addAction(prevState, playerLabel, playerAction, Fold));
    }

    onCheck(playerLabel) {
        const playerAction = Check(playerLabel);
        this.setState(prevState =>
            this.addAction(prevState, playerLabel, playerAction, Check));
    }

    onBet(playerLabel, amount) {
        const playerAction = Bet(amount, playerLabel);
        this.setState(prevState =>
            this.addAction(prevState, playerLabel, playerAction, Fold));
    }

    onCall(playerLabel, amount) {
        const playerAction = Call(amount, playerLabel);
        this.setState(prevState =>
            this.addAction(prevState, playerLabel, playerAction, Fold));
    }

    onRaise(playerLabel, amount) {
        const playerAction = Raise(amount, playerLabel);
        this.setState(prevState =>
            this.addAction(prevState, playerLabel, playerAction, Fold));
    }

    addAction(prevState, player, playerAction, defaultAction) {
        let updatedStreetAction = 
            this.fillActions(getStreetAction(prevState), defaultAction, player);

        updatedStreetAction = Actions.add(updatedStreetAction, playerAction);

        return updateStreet(prevState, updatedStreetAction);
    }

    // perform the default action (fold/check) for every player in
    // between the last actor and the current actor
    fillActions(streetAction, defaultAction, currentActor) {
        const lastAction = Actions.last(streetAction);
        let updatedAction = [...streetAction];

        const startIndex = this.nextPlayerIndex(lastAction.player);
        const endIndex = this.playerIndex(currentActor);

        const addedActions = 
            this.getPlayers(
                this.nextPlayerIndex(lastAction.player),
                this.playerIndex(currentActor))
                .map(defaultAction);

        return Actions.addAll(streetAction, addedActions);
    }

    getPlayers(startIndex, endIndex) {
        return playerLabels((startIndex <= endIndex) ?
            this.props.players.slice(startIndex, endIndex) :
            [...this.props.players.slice(startIndex), ...this.props.players.slice(0, endIndex)]);
    }

    playerIndex = player => this.props.players.findIndex(p => p.label === player);
    nextPlayerIndex = player => {
        const index = this.playerIndex(player);
        return index === this.props.players.length - 1 ? 0 : index + 1;
    };

    calculatePot() {
        let total = 0;
        for (let street in this.state.action) {
            total += this.state.action[street].reduce((sum, event) => sum + event.amount, 0);
        }

        return total;
    }

    render() {
        const streetAction = getStreetAction(this.state);
        const totalCurrentBet = totalBet(streetAction);
        const minRaise = totalCurrentBet * 2; // TODO implement this

        const playerSpots = this.props.players.map(player => {
            return (
                <Player
                    {...this.clickHandlers}
                    key={player.label}
                    label={player.label}
                    stack={player.stack}
                    streetAction={actionsForPlayer(streetAction, player)}
                    currentBet={totalCurrentBet}
                    minRaise={minRaise} />
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