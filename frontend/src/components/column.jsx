import React, { Component } from 'react';
import styled from '@emotion/styled';
import { ImageList } from '@mui/material';
import Image from './image';
import { Droppable } from 'react-beautiful-dnd';
import memoizeOne from 'memoize-one';


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

// Caching results
const getSelectedMap = memoizeOne((selectedImgIds) =>
  selectedImgIds.reduce((previous, current) => {
    previous[current] = true;
    return previous;
  }, {}),
);

export default class Column extends Component {
  render() {
    const column = this.props.column
    const imgData = this.props.imgData
    const selectedImgIds = this.props.selectedImgIds;

    console.log('imgdata', imgData)
    console.log('selectedImgIds', selectedImgIds)

    return (
      <Container>
        <Title>{column.title}</Title>
        <Droppable droppableId={column.id}>
          {(provided, snapshot) => (
          <ImageList sx={{ width: 500, height: 450, alignItems: 'start' }} cols={3} rowHeight={164}
          ref={provided.innerRef}
              {...provided.droppableProps}
              >
              {imgData.map((img, index) => {
                const isSelected = Boolean(
                  getSelectedMap(selectedImgIds)[img.id],
                );
                return (
                  <Image
                    img={img}
                    index={index}
                    key={img.id}
                    isSelected={isSelected}
                    toggleSelection={this.props.toggleSelection}
                    toggleSelectionInGroup={this.props.toggleSelectionInGroup}
                    multiSelectTo={this.props.multiSelectTo}
                  />
                );
              })}
               {provided.placeholder}
              </ImageList>
          )}
            </Droppable>

      </Container>
    );
  }
}
