import React from 'react';
import ReactDOM from 'react-dom';
import Alert from '@mui/material/Alert';
import ClassifyImagesApp from './main-app';

class Viewer extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            solved: false,
        };
    }

    render() {

        let showAlert = this.state.solved;
        let alertContent;

        if (showAlert) {
            alertContent = <Alert severity="success">Thank you for saving humanity, Tenyksian!</Alert>;
        } else {
            alertContent = <Alert severity="warning">Humanity is in danger!</Alert>;
        }

        let content =
            <div>
                {alertContent}
                <div style={{ textAlign: "center" }}>Tenyks Mini-Project Submission </div>
                {/*  TODO: add generation of your viewer   */}
                <ClassifyImagesApp />
            </div>

        return content
    }
}


ReactDOM.render(
    <Viewer />,
    document.getElementById('root')
);
