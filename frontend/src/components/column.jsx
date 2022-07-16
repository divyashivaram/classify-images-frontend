import React, { Component } from 'react';
import styled from '@emotion/styled';
import { ImageList } from '@mui/material';
import Image from './image';


const Container = styled.div`
  width: 500px;
  margin: auto;
  border-radius: 2px;
  border: 1px solid #8aacc8;
  background-color:e0e0e0;
  
  /* we want the column to take up its full height */
  display: flex;
  flex-direction: column;
  text-align: center;
`;

const Title = styled.h3`
  font-weight: bold;
  padding: 8px;
  text-align: center;
`;

export default class Column extends Component {
  render() {
    const column = this.props.column
    const imgData = this.props.imgData
    console.log('imgdata', imgData)

    return (
      <Container>
        <Title>{column.title}</Title>

      <ImageList sx={{ width: 500, height: 450, alignItems: 'start' }} cols={3} rowHeight={164}>
              {imgData.map((img) => {
                return (
                  <Image
                    img={img}
                    key={img.id}
                  />
                );
              })}
            </ImageList>


      </Container>
    );
  }
}
