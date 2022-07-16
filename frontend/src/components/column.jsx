import React, { Component } from 'react';
import styled from '@emotion/styled';
import { blueGrey } from '@mui/material/colors';


const Container = styled.div`
  width: 500px;
  margin: auto;
  border-radius: 2px;
  border: 1px solid #af8eb5;
  background-color:#e1bee7;
  
  /* we want the column to take up its full height */
  display: flex;
  flex-direction: column;
`;

const Title = styled.h3`
  font-weight: bold;
  padding: 8px;
  text-align: center;
`;

export default class Column extends Component {
  render() {
    const columnName = this.props.column
    return (
      <Container>
        <Title>{columnName}</Title>
      </Container>
    );
  }
}
