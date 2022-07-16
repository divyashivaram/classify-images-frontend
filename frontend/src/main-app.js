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
    );

export default class ClassifyImagesApp extends Component {
    // entities: { columnOrder: [], columns: {}, tasks: {} }
    state = {
        entities: { groupNames: [], groupData: {}, imgData: {} },
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

    render() {
        return (
            <DragDropContext>
                <Container>

                    {this.state.entities.groupNames.map((groupName) => (
                        <Column
                            column={this.state.entities.groupData[groupName]}
                            imgData={getImages(this.state.entities, groupName)}
                            key={groupName}
                        />
                    ))}

                </Container>
            </DragDropContext>
        );
    }
}
