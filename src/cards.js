import React, { Component } from 'react';

/*export class Deck {
    constructor(props) {
        this.cards = [Spade, Diamond, Club, Heart].map(suit => {
            return [2, 3, 4, 5, 6, 7, 8, 9, 'T', 'J', 'Q', 'K', 'A'].reverse().map(rank => {
                return React.createElement(suit, {rank});
            });
        });
    }
}*/

const suits = {
    h: {
        code: '\u2665',
        name: 'hearts'
    },
    c: {
        code: '\u2663',
        name: 'clubs'
    },
    d: {
        code: '\u2666',
        name: 'diamonds'
    },
    s: {
        code: '\u2660',
        name: 'spades'
    },
};

export class Card extends Component {
    render() {
        const suit = this.suit();
        const style = `card ${suit.name} ${this.props.selected ? "picked" : ""}`;
        return (
            <div onClick={this.select} className={style}>{this.rank()}{suit.code}</div>
        );
    }

    suit = () => suits[this.props.id.substring(1)];
    rank = () => this.props.id.substring(0, 1);

    select = (e) => {
        console.log("selected: " + e)
            this.props.updateSelection(this.props.id);
    }
}

/*export const Heart = (props) => <Card key={props.key} cardClass="hearts" canSelect={props.canSelect} updateSelection={props.updateSelection} rank={props.rank} suit={`\u2665`} />;
export const Club = (props) => <Card key={props.key} cardClass="clubs" canSelect={props.canSelect} updateSelection={props.updateSelection} rank={props.rank} suit={`\u2663`} />;
export const Diamond = (props) => <Card key={props.key} cardClass="diamonds" canSelect={props.canSelect} updateSelection={props.updateSelection} rank={props.rank} suit={`\u2666`} />;
export const Spade = (props) => <Card key={props.key} cardClass="spades" canSelect={props.canSelect} updateSelection={props.updateSelection} rank={props.rank} suit={`\u2660`} />;*/
