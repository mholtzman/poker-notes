import React, { Component } from 'react';
import styled from 'styled-components';

const Action = styled.div`
    margin-right: 4px;
`;

const Amount = styled.input`
    width: 32px;
`

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
                <button onClick={this.props.click.bind(this, this.props.amount)}>Call ${this.props.amount}</button>
            </Action>
        );
    }
}

export class Bet extends Component {
    render() {
        return (
            <Action>
                <button onClick={this.props.click}>Bet</button>
            </Action>
        );
    }
}

export class Raise extends Component {
    static getDerivedStateFromProps(nextProps, prevState) {
        return { amount: nextProps.minimum };
    }

    handleChange(event) {
        this.setState({ amount: parseInt(event.target.value) });
    }

    render() {
        const canRaise = Number.isInteger(this.state.amount) 
            && this.state.amount >= this.props.minimum;

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
