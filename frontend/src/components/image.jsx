import React, { Component } from 'react';
import styled from '@emotion/styled';

const Container = styled.div`
  background-color:e0e0e0;
  color:#8aacc8;
  padding: 4px;
  margin-bottom: 4px;
  border-radius: 2px;
  font-size: 18px;
  border: 1px solid #8aacc8;
  width:fit-content;
  margin: auto;
`;
const Logo = styled.img`
    width: 100px;
    height: 100px;
    margin: 5px;
    `
export default class Image extends Component {
  render() {
    const img = this.props.img;
    
    return (
            <Container>
              <Logo src={`${'http://192.168.0.130:6789/api/images/' + img.id}?w=164&h=164&fit=crop&auto=format`} />
            </Container>
    )
  }
}
