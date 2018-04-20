import React, { Component } from 'react';
import styled from 'styled-components';

import { Log as debug } from './debug'

import Player from './player'
import Pot from './pot'
import { Fold, Check, Bet, Call, Raise } from './actions'

const findPlayer = (players, label) => players.find(player => player.label == label);

const actionEvent = (action, label, amount) => ({ label, action, amount });
const postEvent = actionEvent.bind(null, "post");
const callEvent = actionEvent.bind(null, "call");

const matchesBet = (bet, amount) => amount >= bet;
const canCheck = (bet, lastAction) => 
     matchesBet(bet, lastAction.amount) && (lastAction.action == 'none' || lastAction.action == 'post');

class Table extends Component {
    constructor(props) {
        super(props);

        console.log("\nPROPS\n" + JSON.stringify(props, undefined, 4));

        this.state = {
            potSize: this.props.blinds.bb + this.props.blinds.sb,
            currentStreet: "preflop",
            action: {
                preflop: [
                    postEvent(props.players[0].label, props.blinds.sb),
                    postEvent(props.players[1].label, props.blinds.bb)
                ],
                flop: [],
                turn: [],
                river: []
            }
        };

        this.onFold = this.onFold.bind(this);
    }

    findPlayer(label) {

    }

    onFold(foldedPosition) {
        this.setState(prevState => {
            const allPlayers = prevState.players;
            const foldedPlayer = allPlayers.findIndex(player => player.position == foldedPosition);
            allPlayers[foldedPlayer].folded = true;

            return { players: allPlayers };
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

    onCall(playerLabel, amtCalled, street) {
        this.setState(prevState => {
            console.log(`PREVIOUS BET: ${prevState.action.bet}`)
            const players = [...prevState.players];
            const updatedPlayer = findPlayer(players, playerLabel);

            updatedPlayer.amountBet += amtCalled;
            
            return {
                ...prevState,
                players,
                potSize: prevState.potSize + amtCalled
            };
        });
    }

    onRaise() {

    }

    render() {
        const currentStreet = this.state.currentStreet;
        const streetAction = this.state.action[currentStreet];
        const lastAction = streetAction[streetAction.length - 1];
        const bet = lastAction.amount;

        const playerSpots = this.props.players.map(player => {
            let allowedActions = [];

            // all actions taken by the player on this street
            const streetActions = streetAction.filter(p => p.label == player.label);
            const amountBet = streetActions.reduce((sum, action) => sum + action.amount, 0);
            const lastPlayerAction = streetActions.length > 0 ? streetActions[streetActions.length -1] :
                actionEvent('none', player.label, 0);

            if (canCheck(bet, lastPlayerAction)) {
                allowedActions.push(
                    <Check key="check" click={this.onCheck.bind(this, player.label)} />
                )
            } else {
                allowedActions.push(
                    <Fold key="fold" click={this.onFold.bind(this, player.label)} />
                )
            }

            if (lastPlayerAction.amount < bet) {
                const amountToCall = bet - lastPlayerAction.amount;
                allowedActions.push(
                    <Call 
                        key="call"
                        amount={amountToCall}
                        click={this.onCall.bind(this, player.label, amountToCall, currentStreet)} />
                )
            }
            
            if (lastPlayerAction.action == 'none' || lastPlayerAction.action == 'post') {
                allowedActions.push(
                    <Raise 
                        key="raise"
                        click={this.onRaise.bind(this, player.label)} />
                )
            }
            // else {
            //     if (bet == 0 || currentStreet != player.lastAction) {
            //         playerActions.push(
            //             <Check click={this.onCheck.bind(this, player.label)} />
            //         )
            //         playerActions.push(
            //             <Bet click={this.onBet.bind(this, player.label)} />)
            //     }
            // }
            return (
                <Player
                    key={player.label}
                    label={player.label}
                    stack={player.stack}
                    bet={amountBet}
                    actions={allowedActions} />
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