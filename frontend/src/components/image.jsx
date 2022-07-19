import React, { Component } from 'react';
import styled from '@emotion/styled';
import { Draggable } from 'react-beautiful-dnd';

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
  ${(props) => props.isDragging ? `box-shadow: 2px 2px 1px ${'#8aacc8'};` : ''} 
`;
const Logo = styled.img`
    width: 100px;
    height: 100px;
    margin: 5px;
    `

const primaryButton = 0;
const keyCodes = {
  enter: 13,
  escape: 27,
  arrowDown: 40,
  arrowUp: 38,
  tab: 9,
};

export default class Image extends Component {
    onKeyDown = (
    event,
    provided,
    snapshot,
  ) => {
    if (event.defaultPrevented) {
      return;
    }

    if (snapshot.isDragging) {
      return;
    }

    if (event.keyCode !== keyCodes.enter) {
      return;
    }

    // we are using the event for selection
    event.preventDefault();

    this.performAction(event);
  };

  // Using onClick as it will be correctly
  // preventing if there was a drag
  onClick = (event) => {
    if (event.defaultPrevented) {
      return;
    }

    if (event.button !== primaryButton) {
      return;
    }

    // marking the event as used
    event.preventDefault();

    this.performAction(event);
  };

  onTouchEnd = (event) => {
    if (event.defaultPrevented) {
      return;
    }
    // marking the event as used
    // we would also need to add some extra logic to prevent the click
    // if this element was an anchor
    event.preventDefault();
    this.props.toggleSelectionInGroup(this.props.img.id);
  };

  // Determines if the platform specific toggle selection in group key was used
  wasToggleInSelectionGroupKeyUsed = (event) => {
    // TODO: navigator.platform is deprecated. Fix
    const isUsingWindows = navigator.platform.indexOf('Win') >= 0;
    return isUsingWindows ? event.ctrlKey : event.metaKey;
  };

  // Determines if the multiSelect key was used
  wasMultiSelectKeyUsed = (event ) => event.shiftKey;

  performAction = (event) => {
    const {
      img,
      toggleSelection,
      toggleSelectionInGroup,
      multiSelectTo,
    } = this.props;

    if (this.wasToggleInSelectionGroupKeyUsed(event)) {
      toggleSelectionInGroup(img.id);
      return;
    }

    if (this.wasMultiSelectKeyUsed(event)) {
      multiSelectTo(img.id);
      return;
    }
    toggleSelection(img.id);

  };


    render() {
        const img = this.props.img
        const index = this.props.index
        const isSelected = this.props.isSelected;
        
        return (
            <Draggable draggableId={img.id} index={index}>
            {(provided, snapshot) => {
                return (
                <Container ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                isSelected={isSelected}
                onClick={this.onClick}
                onKeyDown={(event) =>
                this.onKeyDown(event, provided, snapshot)
              }
              isDragging={snapshot.isDragging}
                >
                <Logo src={`${'http://192.168.0.130:6789/api/images/' + img.id}?w=164&h=164&fit=crop&auto=format`} />
                </Container>
                )
            }}
            </Draggable>
            )
        }
    }
