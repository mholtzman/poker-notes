import React, { Component } from 'react';
import styled from 'styled-components';

class Pot extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={this.props.className}>
                Pot: ${this.props.size}
            </div>
        )
    }
}

export default styled(Pot)`
    padding: 10px;
    width: 50%;
    margin: auto;
`;