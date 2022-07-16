import Column from './components/column';
import React, { Component } from 'react';
import styled from '@emotion/styled';

const Container = styled.div`
  display: flex;
  user-select: none;
  text-align:center;
`;

export default class ClassifyImagesApp extends Component {
    render() {
        return (
            <Container>
                <Column column='Human' />
                <Column column='Terminator' />
            </Container>
        );
    }
}
