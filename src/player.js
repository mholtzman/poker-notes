import React, { Component } from 'react';
import styled from 'styled-components';

const PlayerSummary = styled.section`
    padding: 4px;
    margin: 4px;
    height: 40px;
    border: solid 2px palegreen;
`;

const Invested = styled.div`
    float:right;
`;

export default class Player extends Component {
    constructor(props) {
        super(props);
        
        this.call = this.call.bind(this);
        this.fold = this.fold.bind(this);
    }

    fold(position) {
        this.setState(prevState => ({
            lastAction: "Fold"
        }));
    }

    call(amt) {
        this.setState(prevState => ({
            lastBet: prevState.lastBet + amt,
            stack: prevState.stack - amt,
            closedAction: true
        }));

        this.props.onCall(amt);
    }

    updateStack(event) {
        this.setState({ stack: event.stackSize });
    }

    render() {
        return (
            <PlayerSummary>
                <div>
                    <label>{this.props.label} (${this.props.stack})
                      </label>
                    <Invested>${this.props.bet}</Invested>
                </div>
                <div>
                    {this.props.actions}
                    
                </div>
            </PlayerSummary>

        )
    }
}