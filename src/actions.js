import React, { Component } from 'react';
import styled from 'styled-components';

import { Log as debug } from './debug'

const Action = styled.div`
    margin-right: 4px;
`;

const Amount = styled.input`
    width: 32px;
`

const ActionWrapper = styled.section`
    display: flex;
    flex-direction: row;
`;

export class Fold extends Component {
    render() {
        return (
            <Action>
                <button onClick={this.props.click}>Fold</button>
            </Action>
        );
    }
}

export class Check extends Component {
    render() {
        return (
            <Action>
                <button onClick={this.props.click}>Check</button>
            </Action>
        );
    }
}

export class Call extends Component {
    render() {
        return (
            <Action>
                <button
                    onClick={this.props.click}>
                    Call ${this.props.amount}
                </button>
            </Action>
        );
    }
}

export class Bet extends Component {
    state = { amount: 0 };
    
    static getDerivedStateFromProps(nextProps, prevState) {
        return { amount: nextProps.minimum };
    }

    handleChange(event) {
        const amount = (event.target.value && parseInt(event.target.value, 10)) || 0;
        this.setState({ amount });
    }

    render() {
        const validBet = this.state.amount >= this.props.minimum &&
            this.state.amount <= this.props.maximum;

        return (
            <Action>
                <button disabled={!validBet}
                        onClick={this.props.click.bind(this, this.state.amount)}>Bet</button>
                <Amount type="text" value={this.state.amount}
                    onChange={this.handleChange.bind(this)}/>
            </Action>
        );
    }
}

export class Raise extends Component {
    state = { amount: 0 };
    
    static getDerivedStateFromProps(nextProps, prevState) {
        return { amount: nextProps.minimum };
    }

    handleChange(event) {
        const amount = (event.target.value && parseInt(event.target.value, 10)) || 0;
        this.setState({ amount });
    }

    render() {
        const canRaise = Number.isInteger(this.state.amount) 
            && this.state.amount >= this.props.minimum
            && this.state.amount <= this.props.maximum;

        return (
            <Action>
                <button disabled={!canRaise}
                    onClick={this.props.click.bind(this, this.state.amount)}>Raise</button>
                <Amount type="text" value={this.state.amount}
                    onChange={this.handleChange.bind(this)}/>
            </Action>
        );
    }
}

export class AllIn extends Component {
    render() {
        return (
            <Action>
                <button
                    onClick={this.props.click.bind(this, this.props.amount)}>
                    All-in ${this.props.amount}
                </button>
            </Action>
        );
    }
}

export default class Actions extends Component {
    getAllowedActions() {
        let allowedActions = [];

        const amountFaced = this.props.currentBet - this.props.lastAction.amount;
        const firstAction = this.props.lastAction.action === 'none' || this.props.lastAction.action === 'post';

        if (firstAction && amountFaced === 0) {
            allowedActions.push(
                <Check key="check" click={this.props.onCheck} />
            )

            if (!this.props.lastAction || this.props.lastAction.action === 'post') {
                allowedActions.push(
                    <Raise key="raise"
                        click={this.props.onRaise}
                        minimum={this.props.minimumBet + this.props.lastAction.amount}
                        maximum={this.props.maximumBet} />
                )
            } else {
                allowedActions.push(
                    <Bet key="bet" click={this.props.onBet} minimum={this.props.minimumBet} maximum={this.props.maximumBet} />
                )
            }
        } else if (this.props.maximumBet && amountFaced > 0) {
            allowedActions.push(
                <Fold key="fold" click={this.props.onFold} />
            )
            allowedActions.push(
                <Call key="call" click={this.props.onCall.bind(this, this.props.currentBet)} amount={amountFaced} />
            )

         //   const vpip = this.props.amountPutInPot - (this.props.lastAction.action === 'post' ? this.props.lastAction.amount : 0);
            const minimumRaiseTotal = this.props.currentBet + this.props.minimumBet;

            console.log(`currentBet: ${this.props.currentBet} amountFaced: ${amountFaced} minBet: ${this.props.minimumBet} minTotal: ${minimumRaiseTotal}`)

            if (minimumRaiseTotal >= this.props.maximumBet) {
                allowedActions.push(
                    <AllIn key="allin" click={this.props.onRaise} amount={this.props.maximumBet} />
                )
            } else if (firstAction || (amountFaced >= this.props.minimumBet)) {
                allowedActions.push(
                    <Raise key="raise"
                        click={this.props.onRaise}
                        minimum={minimumRaiseTotal}
                        maximum={this.props.maximumBet} />
                )
            }
        }

        return allowedActions; 
    }

    render() {
        return (
            <ActionWrapper>{this.getAllowedActions()}</ActionWrapper>
        )
    }
}
