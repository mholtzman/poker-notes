import React, { Component } from 'react';
import styled from 'styled-components';

import { Fold, Check, Bet, Call, Raise } from './actions'
import { Log as debug } from './debug'

const PlayerSummary = styled.section`
    color: ${props => props.folded ? 'lightgray' : 'black'}
    padding: 4px;
    margin: 4px;
    border: solid 2px palegreen;
`;

const Invested = styled.div`
    float:right;
`;

const actionLabels = {
    call: 'Call',
    raise: 'Raise',
    bet: 'Bet',
    post: 'Post',
    fold: 'Folded'
};

const matchesBet = (bet, amount) => amount >= bet;
const canCheck = (bet, lastAction) => 
     matchesBet(bet, lastAction.amount) && (lastAction.action === 'none' || lastAction.action === 'post');

const nonAction = { action: 'none', amount: 0 };
const getLastAction = (streetAction) => streetAction.length > 0 ? streetAction[streetAction.length -1] : nonAction;
const amountForStreet = streetAction => streetAction.reduce((sum, action) => sum + action.amount, 0);

export default class Player extends Component {
    constructor(props) {
        super(props);

         this.state = {
             stack: props.stack
         };
    }

    call(amount) {
        this.setState(prevState => ({
            stack: prevState.stack - amount
        }));

        this.props.onCall(this.props.label, amount);
    }

    bet(position) {
        this.setState(prevState => ({
            lastAction: "Fold"
        }));
    }

    raise(position) {
        this.setState(prevState => ({
            lastAction: "Fold"
        }));
    }

    check(position) {
        this.setState(prevState => ({
            lastAction: "Fold"
        }));
    }

    updateStack(event) {
        this.setState({ stack: event.stackSize });
    }

    render() {
        const amountBet = amountForStreet(this.props.streetAction);
        const lastAction = getLastAction(this.props.streetAction);

        const actions = this.allowedActions(lastAction, amountBet);
        const folded = lastAction.action === 'fold';

        const actionElements = !folded && (
            <div>
                {actions}
            </div>
        );

        const investedElement = lastAction.action !== 'none' && (
            <Invested>{actionLabels[lastAction.action]} {!folded ? "$" + amountBet : ""}</Invested>
        );
        
        return (
            <PlayerSummary folded={folded}>
                <div>
                    <label>{this.props.label} (${this.state.stack})
                        </label>
                    {investedElement}
                </div>
                {actionElements}
            </PlayerSummary>
        )
    }

    allowedActions(lastAction, amountPutInPot) {
        let allowedActions = [];

        if (lastAction.action === 'fold') {
            return allowedActions;
        }

        if (canCheck(this.props.currentBet, lastAction)) {
            allowedActions.push(
                <Check key="check" click={this.check.bind(this, this.props.label)} />
            )
        } else if (amountPutInPot < this.props.currentBet) {
            allowedActions.push(
                <Fold key="fold" click={this.props.onFold.bind(this, this.props.label)} />
            )
        }

        if (lastAction.amount < this.props.currentBet) {
            const amountToCall = this.props.currentBet - lastAction.amount;
            allowedActions.push(
                <Call 
                    key="call"
                    amount={amountToCall}
                    click={this.call.bind(this, amountToCall)} />
            )
        }
        
        if (lastAction.action === 'none' || lastAction.action === 'post') {
            allowedActions.push(
                <Raise 
                    key="raise"
                    click={this.raise.bind(this, this.props.label)} />
            )
        }

        return allowedActions;
    }
}