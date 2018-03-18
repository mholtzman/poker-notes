import React, { Component } from 'react';
import { Card } from './cards'
import './App.css';

class CardSelector extends Component {
    constructor(props) {
        super(props);
        let deck = ['h', 'c', 'd', 's'].map(suit => {
            return [2, 3, 4, 5, 6, 7, 8, 9, 'T', 'J', 'Q', 'K', 'A'].reverse().map(rank => {
                return <Card key={rank + suit} id={rank + suit}/>;
            });
        });

        this.state = { deck };
    }

    render() {
        return (
            <SelectionPanel deck={this.state.deck} />
        )
    }
}

class SelectionPanel extends Component {
    constructor(props) {
        super(props);
        this.state = { numPicked: 0 };
    }

    render() {
        return (
            <div>
                {this.props.deck}
                <div>Num selected: {this.state.numPicked}</div>
            </div>
        );
    }

    updateSelection = (code) => {
        console.log("UPDATING: " + code)
        this.setState(prevState => {
            return { deck: [{code: '6h', selected: true}] };
        });
    };
}

class Board extends Component {
    constructor(props) {
        super(props);
        this.state = {isBlack: false, cards: []};
    }

    render() {
        return (
            <div onClick={this.handleClick} className={`board ${this.state.isBlack ? "black" : "white"}`}>
                {this.state.cards}
            </div>
        )
    }
}

export default () => {
    return (
        <div>
            <CardSelector />
        </div>
    )
};
