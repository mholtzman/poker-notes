import React, { Component } from 'react';
import styled from 'styled-components';

export class Fold extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <button onClick={this.props.click}>Fold</button>
        );
    }
}

export class Check extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <button onClick={this.props.click}>Check</button>
        );
    }
}

export class Call extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <button onClick={this.props.click}>Call ${this.props.amount}</button>
        );
    }
}

export class Bet extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <button onClick={this.props.click}>Bet</button>
        );
    }
}

export class Raise extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <button onClick={this.props.click}>Raise</button>
        );
    }
}

export default class Actions extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let actions = [];

        if (this.props.hasOption) {
            if (this.props.amountToCall > 0) {
                actions.push(<Fold />);
                actions.push(<Call click={this.props.onCall} amount={this.props.amountToCall}/>);
                actions.push(<Raise/>);
            } else {
                actions.push(<Check />);
                actions.push(<Bet />);
            }
        }

        return actions;
    }
}