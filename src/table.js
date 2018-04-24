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

const postOrRaise = action => action.action === 'post' || action.action === 'raise';
const getStreetAction = state => state.action[state.currentStreet];
const getLastAction = state => Actions.last(getStreetAction(state));
const updateStreet = (prevState, updatedAction) => ({ ...prevState.action, [prevState.currentStreet]: updatedAction });

class Table extends Component {
    state = { };

    constructor(props) {
        super(props);

        this.clickHandlers = {
            onCheck: this.onCheck.bind(this),
            onCall: this.onCall.bind(this),
            onFold: this.onFold.bind(this),
            onBet: this.onBet.bind(this),
            onRaise: this.onRaise.bind(this)
        }
    }

    static getDerivedStateFromProps(props, prevState) {
        return {
            currentStreet: "preflop",
            currentBet: props.blinds.bb,
            minimumBet: props.blinds.bb,
            potSize: props.blinds.sb + props.blinds.bb,
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

        this.setState(prevState => {
            const updatedAction = this.addAction(prevState, playerLabel, playerAction, Fold);
            
            return {
                potSize: this.calculatePot(updatedAction),
                currentBet: amount,
                minimumBet: amount,
                action: updatedAction
            }
        });
    }

    onCall(playerLabel, amount) {
        const playerAction = Call(amount, playerLabel);

        this.setState(prevState => {
            const updatedAction = this.addAction(prevState, playerLabel, playerAction, Fold);
            
            return {
                potSize: this.calculatePot(updatedAction),
                action: updatedAction
            }
        });
    }

    onRaise(playerLabel, amount) {
        const playerAction = Raise(amount, playerLabel);

        this.setState(prevState => {
            const updatedAction = this.addAction(prevState, playerLabel, playerAction, Fold);
            const raiseAmount = playerAction.amount - getLastAction(prevState).amount;

            debug`raiseAmount: ${raiseAmount} newCurrentBet: ${raiseAmount > prevState.minimumBet ? amount : prevState.currentBet}`
            
            return {
                potSize: this.calculatePot(updatedAction),
                currentBet: raiseAmount >= prevState.minimumBet ? amount : prevState.currentBet,
                minimumBet: this.calculateMinimumBet(updatedAction[prevState.currentStreet]),
                action: this.addAction(prevState, playerLabel, playerAction, Fold)
            }
        });
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
    
    calculateMinimumBet(action) {
        return action
            .filter(postOrRaise)
            .reduce((prev, action) => {
            if (action.action === 'raise') {
                const raiseAmount = action.amount - prev.action.amount;
                
                if (raiseAmount >= prev.minBet) {
                    console.log(`changing raise minbet to ${raiseAmount}`)
                    return { minBet: raiseAmount, action };
                } else {
                    console.log(`ignoring raise of ${raiseAmount}`)
                    return prev;
                }
            }
            
            // post
            return { minBet: action.amount, action };
        }, { minBet: 0 }).minBet;
    };
    
    calculatePot(action) {
        const numPlayers = this.props.players.length;
        let total = 0;
        for (let street in action) {
            total += action[street].slice(-numPlayers).reduce((sum, event) => sum + event.amount, 0);
        }

        return total;
    }

    bindClickHandlers(player) {
        // bind the click handlers to the given player
        return Object.assign({}, ...Object.entries(this.clickHandlers)
            .map(handler => ({ [handler[0]]: handler[1].bind(this, player) })));
    }

    render() {
        const streetAction = getStreetAction(this.state);

        debug`events: ${streetAction}`

        const playerSpots = this.props.players.map(player => {
            return (
                <Player
                    clickHandlers={this.bindClickHandlers(player.label)}
                    key={player.label}
                    label={player.label}
                    startingStack={player.stack}
                    streetAction={actionsForPlayer(streetAction, player)}
                    currentBet={this.state.currentBet}
                    minimumBet={this.state.minimumBet} />
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