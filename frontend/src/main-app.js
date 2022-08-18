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

    // Handle ghosting the images half way during drag
    if (!destination) {
        return;
    }
    // moving in the same list. Assumption: Not in scope 
    if (source.droppableId === destination.droppableId) {
        return;
    }

    // moving to a new list
    const home = entities.groupData[source.droppableId];
    const foreign = entities.groupData[destination.droppableId];

    // the id of the img to be moved
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
    // api call

    const d = modifyImageData({ imgData: updated.imgData, groupNames: Object.keys(updated.groupData) }).then(data => {
        return 'True'
    })
    return {
        entities: updated,
        selectedImgIds,
    };
};

const reorderMultiDrag = ({
    entities,
    selectedImgIds,
    source,
    destination,
}) => {
    // Handle ghosting the images half way during drag
    if (!destination) {
        return;
    }
    // moving in the same list. Assumption: Not in scope 
    if (source.droppableId === destination.droppableId) {
        return;
    }

    const start = entities.groupData[source.droppableId];
    const dragged = start.imgIds[source.index];

    const insertAtIndex = (() => {
        const destinationIndexOffset = selectedImgIds.reduce(
            (previous, current) => {
                if (current === dragged) {
                    return previous;
                }

                const final = entities.groupData[destination.droppableId];
                const column = getHomeColumn(entities, current);

                if (column !== final) {
                    return previous;
                }

                const index = column.imgIds.indexOf(current);

                if (index >= destination.index) {
                    return previous;
                }

                // the selected item is before the destination index
                // we need to account for this when inserting into the new location
                return previous + 1;
            },
            0,
        );

        const result = destination.index - destinationIndexOffset;
        return result;
    })();

    console.log('selectedImgIds', selectedImgIds)
    selectedImgIds.forEach(imgId => {
        console.log('entities.groupData[imgId]', entities.imgData)
        entities.imgData[imgId].group = destination.droppableId

    });
    // doing the ordering now as we are required to look up groupData
    // and know original ordering
    const orderedSelectedImgIds = [...selectedImgIds];
    orderedSelectedImgIds.sort((a, b) => {
        // moving the dragged item to the top of the list
        if (a === dragged) {
            return -1;
        }
        if (b === dragged) {
            return 1;
        }

        // sorting by their natural indexes
        const columnForA = getHomeColumn(entities, a);
        const indexOfA = columnForA.imgIds.indexOf(a);
        const columnForB = getHomeColumn(entities, b);
        const indexOfB = columnForB.imgIds.indexOf(b);

        if (indexOfA !== indexOfB) {
            return indexOfA - indexOfB;
        }

        // sorting by their order in the selectedImgIds list
        return -1;
    });

    // we need to remove all of the selected imgs from their columns
    const withRemovedImgs = entities.groupNames.reduce(
        (previous, columnId) => {
            const column = entities.groupData[columnId];

            // remove the id's of the items that are selected
            const remainingImgIds = column.imgIds.filter(
                (id) => !selectedImgIds.includes(id),
            );

            previous[column.id] = withNewImgIds(column, remainingImgIds);
            return previous;
        },
        entities.groupData,
    );

    const final = withRemovedImgs[destination.droppableId];

    // TODO: ....unnecessary?
    const withInserted = (() => {
        const base = [...final.imgIds];
        base.splice(insertAtIndex, 0, ...orderedSelectedImgIds);
        return base;
    })();

    // insert all selected imgs into final column
    const withAddedImgs = {
        ...withRemovedImgs,
        [final.id]: withNewImgIds(final, withInserted),
    };

    const updated = {
        ...entities,
        groupData: withAddedImgs,
    };
    console.log('multi drag----CORRECT', updated)
    // Make api call
    const d = modifyImageData({ imgData: updated.imgData, groupNames: Object.keys(updated.groupData) }).then(data => {
        return 'True'
    })

    return {
        entities: updated,
        selectedImgIds: orderedSelectedImgIds,
    };
};

export const getHomeColumn = (entities, imgId) => {
    const groupId = entities.groupNames.find((id) => {
        const group = entities.groupData[id];
        return group.imgIds.includes(imgId);
    });

    return entities.groupData[groupId];
};

export const multiSelect = (
    entities,
    selectedImgIds,
    newImgId,
) => {

    console.log('multiselect')
    // Nothing already selected
    if (!selectedImgIds.length) {
        return [newImgId];
    }

    const columnOfNew = getHomeColumn(entities, newImgId);
    const indexOfNew = columnOfNew.imgIds.indexOf(newImgId);

    const lastSelected = selectedImgIds[selectedImgIds.length - 1];
    const columnOfLast = getHomeColumn(entities, lastSelected);
    const indexOfLast = columnOfLast.imgIds.indexOf(lastSelected);

    // multi selecting to another column
    // select everything up to the index of the current item
    if (columnOfNew !== columnOfLast) {
        return columnOfNew.imgIds.slice(0, indexOfNew + 1);
    }

    // multi selecting in the same column
    // need to select everything between the last index and the current index inclusive

    // nothing to do here
    if (indexOfNew === indexOfLast) {
        return null;
    }


    const isSelectingForwards = indexOfNew > indexOfLast;
    const start = isSelectingForwards ? indexOfLast : indexOfNew;
    const end = isSelectingForwards ? indexOfNew : indexOfLast;

    const inBetween = columnOfNew.imgIds.slice(start, end + 1);

    // everything inbetween needs to have it's selection toggled.
    // with the exception of the start and end values which will always be selected

    const toAdd = inBetween.filter((imgId) => {
        // if already selected: then no need to select it again
        if (selectedImgIds.includes(imgId)) {
            return false;
        }
        return true;
    });
    // TODO: Assuming that order does have to be preserved
    const sorted = isSelectingForwards ? toAdd : [...toAdd].reverse();
    const combined = [...selectedImgIds, ...sorted];

    return combined;
};

export const mutliDragAwareReorder = (args) => {
    if (args.selectedImgIds.length > 1) {
        return reorderMultiDrag(args);
    }
    return reorderSingleDrag(args);
};

async function modifyImageData(body) {
    console.log('get image data', body)
    let response = await fetch('http://192.168.0.130:6789/api/modify_img_data',
        {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'content-type': 'application/json;charset=UTF-8',
            },
        })
    let data = await response.json()
    return data
}

export default class ClassifyImagesApp extends Component {
    // entities: { columnOrder: [], columns: {}, tasks: {} }
    state = {
        entities: { groupNames: [], groupData: {}, imgData: {} },
        selectedImgIds: [],
        draggingImgId: null
    }

    componentDidMount() {
        window.addEventListener('click', this.onWindowClick);
        window.addEventListener('keydown', this.onWindowKeyDown);
        window.addEventListener('touchend', this.onWindowTouchEnd);

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

    componentWillUnmount() {
        window.removeEventListener('click', this.onWindowClick);
        window.removeEventListener('keydown', this.onWindowKeyDown);
        window.removeEventListener('touchend', this.onWindowTouchEnd);
    }

    onWindowKeyDown = (event) => {
        if (event.defaultPrevented) {
            return;
        }

        if (event.key === 'Escape') {
            this.unselectAll();
        }
    };

    onWindowClick = (event) => {
        if (event.defaultPrevented) {
            return;
        }
        this.unselectAll();
    };

    onWindowTouchEnd = (event) => {
        if (event.defaultPrevented) {
            return;
        }
        this.unselectAll();
    };

    unselect = () => {
        this.unselectAll();
    };

    unselectAll = () => {
        this.setState({
            selectedImgIds: [],
        });
    };

    onDragStart = (start) => {
        // console.log('start', start)
        const id = start.draggableId;
        this.setState({
            draggingImgId: start.draggableId,

        })
    }

    onDragEnd = (result) => {
        const destination = result.destination;
        const source = result.source;


        const processed = mutliDragAwareReorder({
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

    toggleSelection = (imgId) => {
        console.log('toggle selection')
        const selectedImgIds = this.state.selectedImgIds;
        const wasSelected = selectedImgIds.includes(imgId);

        const newImgIds = (() => {
            // Img was not previously selected
            // now will be the only selected item
            if (!wasSelected) {
                return [imgId];
            }

            // Img was part of a selected group
            // will now become the only selected item
            if (selectedImgIds.length > 1) {
                return [imgId];
            }

            // img was previously selected but not in a group
            // we will now clear the selection
            return [];
        })();

        this.setState({
            selectedImgIds: newImgIds,
        });
    };

    toggleSelectionInGroup = (imgId) => {
        const selectedImgIds = this.state.selectedImgIds;
        const index = selectedImgIds.indexOf(imgId);

        // if not selected - add it to the selected items
        if (index === -1) {
            this.setState({
                selectedImgIds: [...selectedImgIds, imgId],
            });
            return;
        }

        // it was previously selected and now needs to be removed from the group
        const shallow = [...selectedImgIds];
        shallow.splice(index, 1);
        this.setState({
            selectedImgIds: shallow,
        });
    };

    // This behaviour matches the MacOSX finder selection
    multiSelectTo = (newImgId) => {
        const updated = multiSelect(
            this.state.entities,
            this.state.selectedImgIds,
            newImgId,
        );

        if (updated == null) {
            return;
        }

        this.setState({
            selectedImgIds: updated,
        });
    };

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
                            toggleSelection={this.toggleSelection}
                            toggleSelectionInGroup={this.toggleSelectionInGroup}
                            multiSelectTo={this.multiSelectTo}
                        />
                    ))}

                </Container>
            </DragDropContext>
        );
    }
}
