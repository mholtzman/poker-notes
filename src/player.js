import React, { Component } from 'react';
import styled from 'styled-components';

import Actions from './actions'
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
    check: 'Check',
    call: 'Call',
    raise: 'Raise',
    bet: 'Bet',
    post: 'Post',
    fold: 'Folded'
};

const nonAction = { action: 'none', amount: 0 };
const getLastAction = (streetAction) => streetAction.length > 0 ? streetAction[streetAction.length -1] : nonAction;
const amountForStreet = streetAction => streetAction.reduce((sum, action) => sum + action.amount, 0);

export default class Player extends Component {
    getBetSize = (stack, amount) => Math.min(stack, this.props.currentBet - amount);

    getActionProps(stack, lastAction) {
        const amountBet = amountForStreet(this.props.streetAction);
        const amountFaced = this.props.currentBet - amountBet;

        return {
            ...this.props.clickHandlers,
            currentBet: this.props.currentBet,
            lastAction,
            minimumBet: this.props.minimumBet,
            maximumBet: stack
        };
    }

    render() {
        const lastAction = getLastAction(this.props.streetAction);
        const stack = this.props.startingStack - lastAction.amount;

       //const actions = this.allowedActions(lastAction, amountBet);
        const folded = lastAction.action === 'fold';
        const pip = !folded && lastAction.action !== 'check';

        const actionElements = !folded && (
            <Actions {...this.getActionProps(stack, lastAction)} />
        );

        const investedElement = lastAction.action !== 'none' && (
            <Invested>{actionLabels[lastAction.action]} {lastAction.amount > 0 && ("$" + lastAction.amount)}</Invested>
        );
        
        return (
            <PlayerSummary folded={folded}>
                <div>
                    <label>{this.props.label} (${stack})
                        </label>
                    {investedElement}
                </div>
                {actionElements}
            </PlayerSummary>
        )
    }

    /* allowedActions(lastAction, amountPutInPot, stack) {
        let allowedActions = [];

        if (lastAction.action === 'fold') {
            return allowedActions;
        }

        if (canCheck(this.props.currentBet, lastAction)) {
            allowedActions.push(
                <Check key="check"
                    click={this.props.onCheck.bind(this, this.props.label)} />
            )
        } else if (amountPutInPot < this.props.currentBet) {
            allowedActions.push(
                <Fold key="fold"
                    click={this.props.onFold.bind(this, this.props.label)} />
            )
        }

        if (amountPutInPot < this.props.currentBet) {
            const amountToCall = this.getBetSize(stack, amountPutInPot);
            allowedActions.push(
                <Call 
                    key="call"
                    amount={amountToCall}
                    click={this.handleAction.bind(this, this.props.onCall)} />
            )
        }

        debug`player: ${this.props.label} minAmount: ${this.props.minRaiseAmount} currentBet: ${this.props.currentBet} putInPot: ${amountPutInPot} stack: ${stack}`

        const minimumRaise = Math.min(this.props.minRaiseAmount + this.props.currentBet, stack);

        const canRaise = 
            this.props.currentBet < stack &&
                (this.props.currentBet - amountPutInPot >= this.props.minRaiseAmount &&
                minimumRaise < stack) ||
                lastAction.action == 'post';

        const canShove = !canRaise && lastAction.action !== 'call' && lastAction.action !== 'raise';
        
        if (canRaise) {
            allowedActions.push(
                <Raise
                    key="raise"
                    minimum={minimumRaise}
                    maximum={stack}
                    click={this.handleAction.bind(this, this.props.onRaise)} />
            )
        } else if (canShove) {
            allowedActions.push(
                <AllIn
                    key="all-in"
                    amount={stack}
                    click={this.handleAction.bind(this, this.props.onRaise)} />
            )
        }

        return allowedActions;
    } */
}