import Column from './components/column';
import React, { Component } from 'react';
import styled from '@emotion/styled';
import { DragDropContext } from 'react-beautiful-dnd';

const Container = styled.div`
  display: flex;
  user-select: none;
  text-align:center;
  display: flex;
  align-items: center;
  min-height: 24em;
  justify-content: center;
`;

function filterByGroupLabel(arr, label) {
    const imgIds = []
    Object.keys(arr).forEach(function (img) {
        if (arr[img].group == label) {
            imgIds.push(img);
        }
    })
    return imgIds
}

const getImages = (entities, columnId) =>

    entities.groupData[columnId].imgIds.map(
        (imgId) => entities.imgData[imgId],
    )


const withNewImgIds = (column, imgIds) => ({
    id: column.id,
    title: column.title,
    imgIds,
});

const reorderSingleDrag = ({
    entities,
    selectedImgIds,
    source,
    destination,
}) => {
    // moving in the same list
    if (source.droppableId === destination.droppableId) {
        return {
            entities: entities,
            selectedImgIds,
        }
    }

    // moving to a new list
    const home = entities.groupData[source.droppableId];
    const foreign = entities.groupData[destination.droppableId];

    // the id of the task to be moved
    const imgId = home.imgIds[source.index];
    entities.imgData[imgId].group = destination.droppableId

    // remove from home column
    const newHomeImgIds = [...home.imgIds];
    newHomeImgIds.splice(source.index, 1);
    // add to foreign column
    const newForeignImgIds = [...foreign.imgIds];
    newForeignImgIds.splice(destination.index, 0, imgId);

    const updated = {
        ...entities,
        groupData: {
            ...entities.groupData,
            [home.id]: withNewImgIds(home, newHomeImgIds),
            [foreign.id]: withNewImgIds(foreign, newForeignImgIds),
        },
    };
    console.log('updated entities-----CORRECT', updated)

    return {
        entities: updated,
        selectedImgIds,
    };
};



export default class ClassifyImagesApp extends Component {
    // entities: { columnOrder: [], columns: {}, tasks: {} }
    state = {
        entities: { groupNames: [], groupData: {}, imgData: {} },
        selectedImgIds: [],
        draggingImgId: null
    }

    componentDidMount() {
        fetch('http://192.168.0.130:6789/api/load_img_data',
            {
                method: 'GET',
                headers: {
                    'content-type': 'application/json;charset=UTF-8',
                },
            })
            .then((response) => response.json())
            .then(data => {
                this.setState(
                    {
                        entities:
                        {
                            groupNames: data.groupNames,
                            // TODO: This should be dynamic
                            groupData: {
                                ['terminator']: {
                                    id: 'terminator',
                                    title: 'Terminator',
                                    imgIds: filterByGroupLabel(data.imgData, 'terminator'),
                                },
                                ['human']: {
                                    id: 'human',
                                    title: 'Human',
                                    imgIds: filterByGroupLabel(data.imgData, 'human'),
                                },
                            },
                            imgData: data.imgData,
                        },
                    })
                console.log('state', this.state)
            })

    }

    onDragStart = (start) => {
        console.log('start', start)
        const id = start.draggableId;
        this.setState({
            draggingImgId: start.draggableId,
            selectedImgIds: [start.draggableId]
        })
    }

    onDragEnd = (result) => {
        console.log('result', result)
        const destination = result.destination;
        const source = result.source;

        const processed = reorderSingleDrag({
            entities: this.state.entities,
            selectedImgIds: this.state.selectedImgIds,
            source,
            destination,
        })

        this.setState({
            ...processed,
            draggingImgId: null,
        });
    }

    render() {
        const selected = this.state.selectedImgIds;

        return (
            <DragDropContext onDragStart={this.onDragStart} onDragEnd={this.onDragEnd}>
                <Container>

                    {this.state.entities.groupNames.map((groupName, index) => (
                        <Column
                            column={this.state.entities.groupData[groupName]}
                            imgData={getImages(this.state.entities, groupName)}
                            key={groupName}
                            selectedImgIds={selected}
                        />
                    ))}

                </Container>
            </DragDropContext>
        );
    }
}
