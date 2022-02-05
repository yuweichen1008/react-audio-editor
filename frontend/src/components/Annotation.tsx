import React from 'react'
import { IAnnotate } from './Annotation.d';

class Annotation extends React.Component<IAnnotate> {

    render() {
        if (typeof this.props.annote == undefined) {
            return (
                <></>
            )
        }

        console.log("Annotation called with Annotation length : " + Object.keys(this.props.annote).length);
        return (
            <div>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Start</th>
                            <th>End</th>
                            <th>Subtitle</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* {this.props.annote &&
                            this.props.annote.map(entry => {
                                return (<tr key={entry.id}>
                                    <td>{entry.start}</td>
                                    <td>{entry.end}</td>
                                    <td>{entry.subtitle}</td>
                                </tr>)
                            })
                        } */}
                    </tbody>
                </table>
            </div>
        )
    }
}

export default Annotation
